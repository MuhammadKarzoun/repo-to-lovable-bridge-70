import {
  AddMessageMutationVariables,
  IConversation,
  IMessage
} from '@octobots/ui-inbox/src/inbox/types';
import { Alert, __, readFile, uploadHandler } from 'coreui/utils';
import {
  Attachment,
  AttachmentIndicator,
  AttachmentThumb,
  EditorActions,
  FileName,
  MailRespondBox,
  Mask,
  MaskWrapper,
  PreviewImg,
  RecordMask,
  RespondBoxStyled,
  SmallEditor
} from '@octobots/ui-inbox/src/inbox/styles';
import React, { useEffect, useRef, useState } from 'react';
import {
  getPluginConfig,
  // isEnabled,
  loadDynamicComponent
} from '@octobots/ui/src/utils/core';
import {
  useDebounce,
  useDebouncedCallback
} from '@octobots/ui/src/components/richTextEditor/hooks';
import debounce from 'lodash/debounce';


import Button from '@octobots/ui/src/components/Button';
import Editor from './Editor';
import { EditorMethods } from '@octobots/ui/src/components/richTextEditor/TEditor';
import FormControl from '@octobots/ui/src/components/form/Control';
import { IAttachmentPreview } from '@octobots/ui/src/types';
import { IIntegration } from '@octobots/ui-inbox/src/settings/integrations/types';
import { IResponseTemplate } from '../../../../settings/responseTemplates/types';
import { IUser } from '@octobots/ui/src/auth/types';
import Icon from '@octobots/ui/src/components/Icon';
import { MentionSuggestionParams } from '@octobots/ui/src/components/richTextEditor/utils/getMentionSuggestions';
import NameCard from '@octobots/ui/src/components/nameCard/NameCard';
import ResponseTemplate from '../../../containers/conversationDetail/responseTemplate/ResponseTemplate';
import { SmallLoader } from '@octobots/ui/src/components/ButtonMutate';
import Tip from '@octobots/ui/src/components/Tip';
import { deleteHandler } from '@octobots/ui/src/utils/uploadHandler';
import { getParsedMentions } from '@octobots/ui/src/components/richTextEditor/utils/getParsedMentions';
import { useGenerateJSON } from '@octobots/ui/src/components/richTextEditor/hooks/useExtensions';
import AttachmentComp from '@octobots/ui/src/components/Attachment';
import { urlify } from '@octobots/ui/src/utils/urlParser';
import xss from 'xss';
import { ReplyComponent } from './styles';
import WhatsappTemplates from '@octobots/ui-whatsapp/src/containers/WhatsappTemplates';
import { VoiceRecorder } from './voiceRecorder';


type Props = {
  conversation: IConversation;
  currentUser: IUser;
  sendMessage: (
    message: AddMessageMutationVariables,
    callback: (error: Error) => void
  ) => void;
  onSearchChange: (value: string) => void;
  showInternal: boolean;
  disableInternalState: boolean;
  setAttachmentPreview?: (data: IAttachmentPreview) => void;
  responseTemplates: IResponseTemplate[];
  refetchMessages: () => void;
  refetchDetail: () => void;
  refetchResponseTemplates: (content: string) => void;
  mentionSuggestion?: MentionSuggestionParams;
  replyForMsgId?: IMessage;
  hideMask: boolean;
};

type State = {
  isInactive: boolean;
  isActiveRecord: boolean;
  isHiddenDynamicMask: boolean;
  isInternal: boolean;
  sending: boolean;
  attachments: any[];
  responseTemplate: string;
  mentionedUserIds: string[];
  loading: object;
  extraInfo?: any;
};

const RespondBox = (props: Props) => {
  const {
    conversation,
    currentUser,
    sendMessage,
    setAttachmentPreview,
    responseTemplates,
    replyForMsgId,
    hideMask: hideMaskProp,
  } = props;

  const [replyExist, setReplyExist] = useState<IMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (replyForMsgId) {
      setReplyExist(replyForMsgId);
    } else {
      setReplyExist(null);
    }
  }, [replyForMsgId]);

  const forwardedRef = useRef<EditorMethods>(null);
  const [content, setContent] = useState('');
  const [state, setState] = useState<State>({
    isInactive: !checkIsActive(props.conversation),
    isActiveRecord: false,
    isHiddenDynamicMask: false,
    isInternal: props.showInternal || false,
    sending: false,
    attachments: [],
    responseTemplate: '',
    mentionedUserIds: [],
    loading: {}
  });
  const [debouncedContent] = useDebounce(content, 700);

  useEffect(() => {
    if (hideMaskProp == true) {
      setState((prevState) => ({ ...prevState, isHiddenDynamicMask: true }));
      hideMask();
    }
  }, [hideMaskProp]);

  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      isInactive: !checkIsActive(props.conversation)
    }));

    setState((prevState) => ({
      ...prevState,
      isInternal: props.showInternal
    }));
  }, [props.conversation, props.showInternal]);

  useEffect(() => {
    const textContent = debouncedContent.toLowerCase().replace(/<[^>]+>/g, '');
    props.refetchResponseTemplates(textContent);
  }, [debouncedContent]);


  // save editor current content to state
  const onEditorContentChange = useDebouncedCallback(
    (editorContent: string) => {
      setContent(editorContent);

      if (props.conversation.integration.kind === 'telnyx') {
        const characterCount = calcCharacterCount(160);

        if (characterCount < 1) {
          Alert.warning(__('You have reached maximum number of characters'));
        }
      }
    },
    200
  );

  function checkIsActive(conversation: IConversation) {
    if (conversation.integration.kind === 'messenger') {
      return conversation.customer && conversation.customer.isOnline;
    }

    return true;
  }

  const hideMask = () => {
    setState((prevState) => ({ ...prevState, isInactive: false }));

    const element = document.querySelector('.DraftEditor-root') as HTMLElement;

    if (!element) {
      return;
    }

    element.click();
  };

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    addMessage();
  };

  //added by hichem
  const onSendDebouncedClickHandler = debounce(onSend, 200, { maxWait: 400 });

  const onSelectTemplate = (responseTemplate?: IResponseTemplate) => {
    if (!responseTemplate) {
      return null;
    }

    onEditorContentChange(responseTemplate.content);

    setState((prevState) => ({
      ...prevState,
      responseTemplate: responseTemplate.content,
      // set attachment from response template files
      attachments: responseTemplate.files || []
    }));
  };

  const handleDeleteFile = (url: string) => {
    const urlArray = url.split('/');

    // checking whether url is full path or just file name
    const fileName =
      urlArray.length === 1 ? url : urlArray[urlArray.length - 1];

    let loading = state.loading;
    loading[url] = true;

    setState((prevState) => ({ ...prevState, loading }));

    deleteHandler({
      fileName,
      afterUpload: ({ status }) => {
        if (status === 'ok') {
          const remainedAttachments = state.attachments.filter(
            (a) => a.url !== url
          );

          setState((prevState) => ({
            ...prevState,
            attachments: remainedAttachments
          }));

          Alert.success('You successfully deleted a file');
        } else {
          Alert.error(status);
        }

        loading = state.loading;
        delete loading[url];

        setState((prevState) => ({ ...prevState, loading }));
      }
    });
  };

  const handleFileInput = (e: React.FormEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;

    uploadHandler({
      files,
      beforeUpload: () => {
        return;
      },

      afterUpload: ({ response, fileInfo }) => {
        // set attachments
        setState((prevState) => ({
          ...prevState,
          attachments: [
            ...state.attachments,
            Object.assign({ url: response }, fileInfo)
          ]
        }));

        // remove preview
        if (setAttachmentPreview) {
          setAttachmentPreview(null);
        }
      },

      afterRead: ({ result, fileInfo }) => {
        if (setAttachmentPreview) {
          setAttachmentPreview(Object.assign({ data: result }, fileInfo));
        }
      }
    });
  };

  function cleanText(text: string) {
    return text.replace(/&nbsp;/g, ' ');
  }

  const calcCharacterCount = (maxlength: number) => {
    const cleanContent = content.replace(/<\/?[^>]+(>|$)/g, '');

    if (!cleanContent) {
      return maxlength;
    }

    const ret = maxlength - cleanContent.length;

    return ret > 0 ? ret : 0;
  };

  const addMessage = (isAudio?: any) => {
    const { isInternal, attachments, extraInfo } = state;
    const message = {
      conversationId: conversation._id,
      content: cleanText(content) || '',
      extraInfo,
      contentType: 'text',
      internal: isInternal,
      attachments: isAudio ? [isAudio] : attachments,
      mentionedUserIds: getParsedMentions(useGenerateJSON(content)) as string[],
      ...(replyExist && { replyForMsgId: replyExist._id })
    };

    setState((prevState) => ({ ...prevState, sending: true }));
    sendMessage(message, (error) => {
      if (error) {
        return Alert.error(error.message);
      }
      localStorage.removeItem(props.conversation._id);
      // clear attachments, content, mentioned user ids
      setState((prevState) => ({
        ...prevState,
        attachments: [],
        sending: false,
        mentionedUserIds: []
      }));
      setContent('');
      setReplyExist(null);
    });
  };

  const toggleForm = () => {
    setState((prevState) => ({ ...prevState, isInternal: !state.isInternal }));

    localStorage.setItem(
      `showInternalState-${props.conversation._id}`,
      String(state.isInternal)
    );
  };

  const onAudioUpload = (response: any) => {
    addMessage(response);
    setState((prevState) => ({ ...prevState, isActiveRecord: false }));
  };

  function renderIndicator() {
    const { attachments, loading } = state;

    if (attachments.length > 0) {
      return (
        <AttachmentIndicator>
          {attachments.map((attachment) => (
            <Attachment key={attachment.name}>
              <AttachmentThumb>
                {attachment.type.startsWith('image') && (
                  <PreviewImg
                    style={{
                      backgroundImage: `url(${readFile(attachment.url)})`
                    }}
                  />
                )}
              </AttachmentThumb>
              <FileName>{attachment.name}</FileName>
              <div>
                ({Math.round(attachment.size / 1000)}
                kB)
              </div>
              {loading[attachment.url] ? (
                <SmallLoader />
              ) : (
                <Icon
                  icon='times'
                  onClick={handleDeleteFile.bind(this, attachment.url)}
                />
              )}
            </Attachment>
          ))}
        </AttachmentIndicator>
      );
    }

    return null;
  }

  function renderMask() {
    if (state.isInactive) {
      return (
        <Mask
          id='mask'
          onClick={hideMask}>
          {__(
            'Customer is offline Click to hide and send messages and they will receive them the next time they are online'
          )}
        </Mask>
      );
    }

    return null;
  }

  function renderRecordMask() {
    if (state.isActiveRecord) {
      return (
        <RecordMask id='recordmask'>
          <VoiceRecorder
            onSend={onAudioUpload}
            onCancel={() => setState({ ...state, isActiveRecord: false })}
            maxDuration={300}
          />
        </RecordMask>
      );
    }

    return null;
  }

  function renderAttachment(message: any, hasAttachment: boolean) {
    const { attachments } = message;

    if (!hasAttachment) {
      return null;
    }

    return attachments.map((attachment, index) => {
      return <AttachmentComp key={index} attachment={attachment} simple={true} />;
    });
  }

  function renderReplyContent() {
    const deleteReplyContent = () => {
      setReplyExist(null);
    };

    if (!replyExist) return null;

    const hasAttachment = replyExist.attachments && replyExist.attachments.length > 0;

    if (!replyExist.content) {
      return (
        <>
          {renderAttachment(replyExist, hasAttachment)}{' '}
        </>
      );
    }

    return (
      <ReplyComponent>
        <div className='reply-head'>{__("REPLY TO")}</div>
        <div className='reply-content'>
          <span dangerouslySetInnerHTML={{ __html: xss(urlify(replyExist.content)) }} />
          {renderAttachment(replyExist, hasAttachment)}
        </div>
        <div className='reply-close'>
          <button onClick={deleteReplyContent}>
            <i className='icon-cancel'></i>
          </button>
        </div>
      </ReplyComponent>
    );
  }

  function renderEditor() {
    const { isInternal } = state;

    let type = 'message';
    if (isInternal) {
      type = 'note';
    }

    const placeholder = __(
      `To send your ${type} press Enter and Shift + Enter to add a new line`
    );

    const handleDragOver = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const files = Array.from(event.dataTransfer.files);

      if (files && files.length > 0) {
        uploadHandler({
          files,
          beforeUpload: () => { },
          afterUpload: ({ response, fileInfo }) => {
            setState((prevState) => ({
              ...prevState,
              attachments: [
                ...prevState.attachments,
                { url: response, ...fileInfo }
              ]
            }));

            if (setAttachmentPreview) {
              setAttachmentPreview(null);
            }
          },
          afterRead: ({ result, fileInfo }) => {
            if (setAttachmentPreview) {
              setAttachmentPreview({ data: result, ...fileInfo });
            }
          }
        });
      }
    };
    return (
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{}}>
        <Editor
          ref={forwardedRef}
          currentConversation={conversation._id}
          integrationKind={conversation.integration.kind}
          onChange={onEditorContentChange}
          placeholder={placeholder}
          content={content}
          showMentions={isInternal}
          mentionSuggestion={props.mentionSuggestion}
          responseTemplates={responseTemplates}
          limit={conversation.integration.kind === 'telnyx' ? 160 : undefined}
          onCtrlEnter={addMessage}
        />
      </div>
    );
  }

  function renderCheckbox(kind: string) {
    const { isInternal } = state;

    if (kind.includes('nylas') || kind === 'gmail') {
      return null;
    }

    return (
      <>
        {
          <FormControl
            id='conversationInternalNote'
            className='toggle-message'
            componentclass='checkbox'
            checked={isInternal}
            onChange={toggleForm}
          // disabled={ props.disableInternalState}
          >
            {__('Internal note')}
          </FormControl>
        }
      </>
    );
  }

  // renderVideoRoom() {
  //   const { conversation, refetchMessages, refetchDetail } =  props;
  //   const integration = conversation.integration || ({} as IIntegration);

  //   if ( state.isInternal || integration.kind !== 'messenger') {
  //     return null;
  //   }

  //   return (
  //     <ManageVideoRoom
  //       refetchMessages={refetchMessages}
  //       refetchDetail={refetchDetail}
  //       conversationId={conversation._id}
  //       activeVideo={conversation.videoCallData}
  //     />
  //   );
  // }

  function renderButtons() {
    const integration = conversation.integration || ({} as IIntegration);
    const disabled =
      integration.kind.includes('nylas') || integration.kind === 'gmail';

    return (
      <EditorActions>
        {renderCheckbox(integration.kind)}
        {/* { renderVideoRoom()} */}

        {loadDynamicComponent('inboxEditorAction', props, true)}

        <label>
          <Tip text={__('Record audio')}>
            <Icon icon='microphone-2' onClick={() => setState({ ...state, isActiveRecord: true })} />
          </Tip>
        </label>

        <label style={{ marginInlineEnd: '10px' }}>
          <Tip text={__('Attach file')}>
            <Icon icon='paperclip' />
            <input
              type='file'
              onChange={handleFileInput}
              multiple={true}
            />
          </Tip>
        </label>

        <ResponseTemplate
          brandId={integration.brandId}
          attachments={state.attachments}
          content={content}
          onSelect={onSelectTemplate}
        />

        {conversation.integration.kind == 'whatsapp' && <WhatsappTemplates
          conversation={conversation}
          buttonFrom="inbox"
          onClose={() => setIsModalOpen(false)}
        />}

        <Button
          onClick={onSendDebouncedClickHandler}
          btnStyle='success'
          size='small'
          icon='message'>
          {!disabled && 'Send'}
        </Button>
      </EditorActions>
    );
  }

  function renderBody() {
    return (
      <>
        {replyExist && renderReplyContent()}
        {renderEditor()}
        {renderIndicator()}
        {renderButtons()}
      </>
    );
  }

  function renderContent() {
    const { isInternal, isInactive, extraInfo, isHiddenDynamicMask } = state;

    const setExtraInfo = (value) => {
      setState((prevState) => ({ ...prevState, extraInfo: value }));
    };

    const { integration } = conversation;

    const integrations = getPluginConfig({
      pluginName: integration.kind.split('-')[0],
      configName: 'inboxIntegrations'
    });

    let dynamicComponent = null;

    if (integrations && integrations.length > 0) {
      const entry = integrations.find((s) => s.kind === integration.kind);
      if (entry && entry.components && entry.components.length > 0) {
        const name = entry.components.find(
          (el) => el === 'inboxConversationDetailRespondBoxMask'
        );

        if (name) {
          dynamicComponent = loadDynamicComponent(name, {
            hideMask: hideMask,
            extraInfo,
            setExtraInfo,
            conversationId: conversation._id,
            conversation: entry.kind == 'whatsapp' ? conversation : null
          });
        }
      }
    }

    return (
      <MaskWrapper>
        {renderRecordMask()}
        {renderMask()}
        {!isInternal && !isHiddenDynamicMask && dynamicComponent}
        <RespondBoxStyled
          $isInternal={isInternal}
          $isInactive={isInactive}>
          {renderBody()}
        </RespondBoxStyled>
      </MaskWrapper>
    );
  }

  function renderMailRespondBox() {
    return (
      <MailRespondBox $isInternal={true}>
        <NameCard.Avatar
          user={currentUser}
          size={34}
        />
        <SmallEditor>{renderBody()}</SmallEditor>
      </MailRespondBox>
    );
  }

  const integration = conversation.integration || ({} as IIntegration);
  const { kind } = integration;

  const isMail = kind.includes('nylas') || kind === 'gmail';

  if (isMail) {
    return renderMailRespondBox();
  }

  return renderContent();
};

export default RespondBox;
