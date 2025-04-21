import {
  AddMessageMutationVariables,
  IConversation,
  IMessage
} from '@octobots/ui-inbox/src/inbox/types';
import { Alert, __, readFile, uploadHandler } from 'coreui/utils';
import React, { useEffect, useRef, useState } from 'react';
import {
  getPluginConfig,
  loadDynamicComponent
} from '@octobots/ui/src/utils/core';
import debounce from 'lodash/debounce';

import { IAttachmentPreview } from '@octobots/ui/src/types';
import { IIntegration } from '@octobots/ui-inbox/src/settings/integrations/types';
import { IResponseTemplate } from '../../../../settings/responseTemplates/types';
import { IUser } from '@octobots/ui/src/auth/types';
import { MentionSuggestionParams } from '@octobots/ui/src/components/richTextEditor/utils/getMentionSuggestions';
import ResponseTemplate from '../../../containers/conversationDetail/responseTemplate/ResponseTemplate';
import { deleteHandler } from '@octobots/ui/src/utils/uploadHandler';
import { getParsedMentions } from '@octobots/ui/src/components/richTextEditor/utils/getParsedMentions';
import { useGenerateJSON } from '@octobots/ui/src/components/richTextEditor/hooks/useExtensions';
import AttachmentComp from '@octobots/ui/src/components/Attachment';
import { urlify } from '@octobots/ui/src/utils/urlParser';
import xss from 'xss';
import { VoiceRecorder } from './voiceRecorder';
import WhatsappTemplates from '@octobots/ui-whatsapp/src/containers/WhatsappTemplates';
import styled from 'styled-components';
import { modernColors, borderRadius, spacing, typography, transitions } from '../../../../styles/theme';
import ModernButton from '../../../../components/common/Button';
import Avatar from '../../../../components/common/Avatar';
import Editor from './Editor';
import { EditorMethods } from '@octobots/ui/src/components/richTextEditor/TEditor';
import { MESSAGE_STATUSES } from '../../../constants';
import EmojiPicker from 'emoji-picker-react';
import Icon from '@octobots/ui/src/components/Icon';
import Checkbox from '../../../../components/common/Checkbox';

// Modern styled components
const RespondBoxContainer = styled.div`
  position: relative;
  border-top: 1px solid ${modernColors.border};
  background-color: ${modernColors.contentBackground};
  border-radius: 0 0 ${borderRadius.md} ${borderRadius.md};
  transition: all ${transitions.normal};
`;

const ModernRespondBox = styled.div<{
  $isInternal?: boolean;
  $isInactive?: boolean;
  $isExpanded?: boolean;
}>`
  padding: ${spacing.md} ${spacing.lg};
  background: ${props => props.$isInternal ? modernColors.info + '10' : modernColors.contentBackground};
  transition: all ${transitions.fast};
  filter: ${props => props.$isInactive && 'blur(2px)'};
  
  .ProseMirror {
    background: ${props => props.$isInternal ? modernColors.info + '10' : modernColors.contentBackground};
    transition: background ${transitions.fast};
    min-height: ${props => props.$isExpanded ? '200px' : '40px'};
    max-height: ${props => props.$isExpanded ? '400px' : '40px'};
    overflow-y: auto;
    padding: ${spacing.md};
    border: 1px solid ${modernColors.border};
    border-radius: ${borderRadius.md};
    outline: none;
    
    &:focus {
      border-color: ${modernColors.primary};
      box-shadow: 0 0 0 2px ${modernColors.primary}20;
    }
    
    p {
      margin: 0;
    }
  }
`;

const EditorActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.md} 0 0 0;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const ToolbarButton = styled.button<{ $active?: boolean }>`
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: ${borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$active ? modernColors.primary : modernColors.textSecondary};
  cursor: pointer;
  transition: all ${transitions.fast};
  position: relative;
  
  &:hover {
    background-color: ${modernColors.hover};
    color: ${modernColors.textPrimary};
  }
  
  &:active {
    background-color: ${modernColors.active};
  }
`;

const FileInput = styled.input`
  display: none;
`;

const AttachmentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.md};
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  background-color: ${modernColors.messageBackground};
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.md};
  gap: ${spacing.sm};
  
  i {
    cursor: pointer;
    color: ${modernColors.textSecondary};
    transition: color ${transitions.fast};
    
    &:hover {
      color: ${modernColors.danger};
    }
  }
`;

const AttachmentThumb = styled.div`
  width: 26px;
  height: 26px;
  overflow: hidden;
  border-radius: ${borderRadius.sm};
`;

const AttachmentPreviewImg = styled.div<{ $backgroundImage: string }>`
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-image: url(${props => props.$backgroundImage});
`;

const AttachmentInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const FileName = styled.div`
  font-size: ${typography.fontSizes.sm};
  font-weight: ${typography.fontWeights.medium};
  color: ${modernColors.textPrimary};
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileSize = styled.div`
  font-size: ${typography.fontSizes.xs};
  color: ${modernColors.textSecondary};
`;

const MaskWrapper = styled.div`
  position: relative;
`;

const Mask = styled.div`
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSizes.md};
  color: ${modernColors.textSecondary};
  text-align: center;
  padding: ${spacing.xl};
  cursor: pointer;
`;

const RecordMask = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1000;
  background-color: ${modernColors.contentBackground};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${borderRadius.md};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const ReplyComponent = styled.div`
  display: flex;
  padding: ${spacing.sm} ${spacing.md};
  background-color: ${modernColors.messageBackground};
  border-radius: ${borderRadius.md};
  margin-bottom: ${spacing.md};
  
  .reply-head {
    font-weight: ${typography.fontWeights.medium};
    color: ${modernColors.textSecondary};
    margin-right: ${spacing.md};
  }
  
  .reply-content {
    flex: 1;
    padding: ${spacing.sm} ${spacing.md};
    background-color: ${modernColors.contentBackground};
    border-left: 3px solid ${modernColors.primary};
    border-radius: ${borderRadius.sm};
    color: ${modernColors.textPrimary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .reply-close {
    display: flex;
    align-items: center;
    
    button {
      background: none;
      border: none;
      color: ${modernColors.textSecondary};
      cursor: pointer;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: ${borderRadius.circle};
      
      &:hover {
        background-color: ${modernColors.hover};
        color: ${modernColors.danger};
      }
    }
  }
`;

const MailRespondBox = styled.div<{ $isInternal?: boolean }>`
  padding: ${spacing.md} ${spacing.lg};
  display: flex;
  align-items: flex-start;
  background: ${props => props.$isInternal ? modernColors.info + '10' : modernColors.contentBackground};
`;

const EditorWrapper = styled.div`
  flex: 1;
  margin-left: ${spacing.md};
  border: 1px solid ${modernColors.border};
  border-radius: ${borderRadius.md};
  overflow: hidden;
`;

const InternalNoteToggle = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.md};
`;

const CharacterCounter = styled.div<{ $warning?: boolean }>`
  font-size: ${typography.fontSizes.sm};
  color: ${props => props.$warning ? modernColors.warning : modernColors.textSecondary};
  margin-right: ${spacing.md};
`;

const EmojiPickerContainer = styled.div`
  position: absolute;
  bottom: 100%;
  right: 0;
  z-index: 100;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  border-radius: ${borderRadius.md};
  overflow: hidden;
`;

const ToolbarDivider = styled.div`
  width: 1px;
  height: 24px;
  background-color: ${modernColors.border};
  margin: 0 ${spacing.xs};
`;

const EditorToolbar = styled.div`
  display: flex;
  align-items: center;
  padding: ${spacing.sm} ${spacing.md};
  border-bottom: 1px solid ${modernColors.border};
  background-color: ${modernColors.messageBackground};
`;

const EditorContainer = styled.div`
  border: 1px solid ${modernColors.border};
  border-radius: ${borderRadius.md};
  overflow: hidden;
  transition: all ${transitions.fast};
  
  &:focus-within {
    border-color: ${modernColors.primary};
    box-shadow: 0 0 0 2px ${modernColors.primary}20;
  }
`;

const EditorContent = styled.div<{ $isInternal?: boolean }>`
  min-height: 100px;
  max-height: 200px;
  overflow-y: auto;
  padding: ${spacing.md};
  background-color: ${props => props.$isInternal ? modernColors.info + '10' : modernColors.contentBackground};
`;

const PlaceholderText = styled.div`
  color: ${modernColors.textSecondary};
  position: absolute;
  top: ${spacing.md};
  left: ${spacing.md};
  pointer-events: none;
`;

const SendButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
`;

const ExpandButton = styled.button<{ $isExpanded: boolean }>`
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: ${borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${modernColors.textSecondary};
  cursor: pointer;
  transition: all ${transitions.fast};
  
  &:hover {
    background-color: ${modernColors.hover};
    color: ${modernColors.textPrimary};
  }
  
  i {
    transition: transform ${transitions.fast};
    transform: ${props => props.$isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.sm} ${spacing.lg};
  border-bottom: 1px solid ${modernColors.border};
`;

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (replyForMsgId) {
      setReplyExist(replyForMsgId);
    } else {
      setReplyExist(null);
    }
  }, [replyForMsgId]);

  const forwardedRef = useRef<EditorMethods>(null);
  const [content, setContent] = useState('');
  const [state, setState] = useState<{
    isInactive: boolean;
    isActiveRecord: boolean;
    isHiddenDynamicMask: boolean;
    isInternal: boolean;
    sending: boolean;
    attachments: any[];
    responseTemplate: string;
    mentionedUserIds: string[];
    loading: object;
    metadata?: any;
  }>({
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
    const textContent = content.toLowerCase().replace(/<[^>]+>/g, '');
    props.refetchResponseTemplates(textContent);
  }, [content, props]);

  // save editor current content to state
  const onEditorContentChange = (editorContent: string) => {
    setContent(editorContent);

    if (props.conversation.integration.kind === 'telnyx') {
      const characterCount = calcCharacterCount(160);

      if (characterCount < 1) {
        Alert.warning(__('You have reached maximum number of characters'));
      }
    }
  };

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
    const { isInternal, attachments, metadata } = state;
    const message = {
      conversationId: conversation._id,
      content: cleanText(content) || '',
      metadata,
      contentType: 'text',
      internal: isInternal,
      attachments: isAudio ? [isAudio] : attachments,
      mentionedUserIds: getParsedMentions(useGenerateJSON(content)) as string[],
      ...(replyExist && { replyForMsgId: replyExist._id })
    };

    setState((prevState) => ({ ...prevState, sending: true }));
    sendMessage(message, (error) => {
      if (error) {
        setState((prevState) => ({ ...prevState, sending: false }));
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

  const toggleForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState) => ({ ...prevState, isInternal: e.target.checked }));

    localStorage.setItem(
      `showInternalState-${props.conversation._id}`,
      String(e.target.checked)
    );
  };

  const onAudioUpload = (response: any) => {
    addMessage(response);
    setState((prevState) => ({ ...prevState, isActiveRecord: false }));
  };

  function renderAttachments() {
    const { attachments, loading } = state;

    if (attachments.length === 0) {
      return null;
    }

    return (
      <AttachmentList>
        {attachments.map((attachment) => (
          <AttachmentItem key={attachment.name}>
            <AttachmentThumb>
              {attachment.type.startsWith('image') && (
                <AttachmentPreviewImg
                  $backgroundImage={readFile(attachment.url)}
                />
              )}
            </AttachmentThumb>
            <AttachmentInfo>
              <FileName>{attachment.name}</FileName>
              <FileSize>
                {Math.round(attachment.size / 1000)} kB
              </FileSize>
            </AttachmentInfo>
            {loading[attachment.url] ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <i
                className="icon-times"
                onClick={() => handleDeleteFile(attachment.url)}
              />
            )}
          </AttachmentItem>
        ))}
      </AttachmentList>
    );
  }

  function renderMask() {
    if (state.isInactive) {
      return (
        <Mask
          onClick={hideMask}
        >
          {__(
            'Customer is offline. Click to hide and send messages and they will receive them the next time they are online'
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
        <div className="reply-head">{__("REPLY TO")}</div>
        <div className="reply-content">
          <span dangerouslySetInnerHTML={{ __html: xss(urlify(replyExist.content)) }} />
          {renderAttachment(replyExist, hasAttachment)}
        </div>
        <div className="reply-close">
          <button onClick={deleteReplyContent}>
            <i className="icon-cancel"></i>
          </button>
        </div>
      </ReplyComponent>
    );
  }

  function renderInternalToggle() {
    const { isInternal } = state;
    const { integration } = conversation;
    const { kind } = integration;

    // Skip for email-like integrations
    if (kind.includes('nylas') || kind === 'gmail') {
      return null;
    }

    return (
      <InternalNoteToggle>
        <Checkbox
          id='conversationInternalNote'
          checked={isInternal}
          onChange={toggleForm}
          label={__('Internal note')}
        />
      </InternalNoteToggle>
    );
  }

  function renderCharacterCounter() {
    const { integration } = conversation;
    const { kind } = integration;
    
    // Only show for SMS/messaging platforms with character limits
    if (kind === 'telnyx' || kind === 'whatsapp' || kind === 'facebook-messenger' || kind === 'instagram-messenger') {
      const maxLength = kind === 'telnyx' ? 160 : 1000;
      const remaining = calcCharacterCount(maxLength);
      const isWarning = remaining < 20;
      
      return (
        <CharacterCounter $warning={isWarning}>
          {remaining} {__('characters left')}
        </CharacterCounter>
      );
    }
    
    return null;
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
      >
        <EditorContainer>
          <EditorContent $isInternal={state.isInternal}>
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
          </EditorContent>
        </EditorContainer>
      </div>
    );
  }

  function renderActionButtons() {
    const integration = conversation.integration || ({} as IIntegration);
    const disabled = integration.kind.includes('nylas') || integration.kind === 'gmail';
    const isPlainTextIntegration = ['whatsapp', 'instagram-messenger', 'facebook-messenger', 'telegram', 'viber', 'line', 'telnyx'].some(
      type => integration.kind.includes(type)
    );

    return (
      <EditorActions>
        <ActionButtons>
          <ToolbarButton 
            onClick={() => setState({ ...state, isActiveRecord: true })}
            title={__('Record audio')}
          >
            <i className="icon-microphone-2"></i>
          </ToolbarButton>

          <label>
            <ToolbarButton title={__('Attach file')}>
              <i className="icon-paperclip"></i>
              <FileInput
                type='file'
                onChange={handleFileInput}
                multiple={true}
              />
            </ToolbarButton>
          </label>

          <ToolbarButton 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title={__('Insert emoji')}
            $active={showEmojiPicker}
          >
            <i className="icon-smile"></i>
            {showEmojiPicker && (
              <EmojiPickerContainer>
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    const currentContent = content || '';
                    setContent(currentContent + emojiData.emoji);
                    setShowEmojiPicker(false);
                  }}
                  lazyLoadEmojis={true}
                  searchDisabled={false}
                  skinTonesDisabled={true}
                  width={320}
                  height={400}
                />
              </EmojiPickerContainer>
            )}
          </ToolbarButton>

          <ResponseTemplate
            brandId={integration.brandId}
            attachments={state.attachments}
            content={content}
            onSelect={onSelectTemplate}
          />

          {conversation.integration.kind == 'whatsapp' && 
            <WhatsappTemplates
              conversation={conversation}
              buttonFrom="inbox"
              onClose={() => setIsModalOpen(false)}
            />
          }
          
          <ExpandButton 
            $isExpanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? __('Collapse editor') : __('Expand editor')}
          >
            <i className="icon-arrow-up"></i>
          </ExpandButton>
        </ActionButtons>

        <SendButtonContainer>
          {renderCharacterCounter()}
          <ModernButton
            onClick={onSendDebouncedClickHandler}
            variant="primary"
            size="sm"
            icon="message"
            disabled={state.sending}
            isLoading={state.sending}
          >
            {!disabled && __('Send')}
          </ModernButton>
        </SendButtonContainer>
      </EditorActions>
    );
  }

  function renderBody() {
    return (
      <>
        {renderInternalToggle()}
        {replyExist && renderReplyContent()}
        {renderAttachments()}
        {renderEditor()}
        {renderActionButtons()}
      </>
    );
  }

  function renderContent() {
    const { isInternal, isInactive, metadata, isHiddenDynamicMask } = state;

    const setExtraInfo = (value) => {
      setState((prevState) => ({ ...prevState, metadata: value }));
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
            metadata,
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
        <ModernRespondBox
          $isInternal={isInternal}
          $isInactive={isInactive}
          $isExpanded={isExpanded}
        >
          {renderBody()}
        </ModernRespondBox>
      </MaskWrapper>
    );
  }

  function renderMailRespondBox() {
    return (
      <MailRespondBox $isInternal={true}>
        <Avatar
          user={currentUser}
          size={34}
        />
        <EditorWrapper>
          {renderBody()}
        </EditorWrapper>
      </MailRespondBox>
    );
  }

  const integration = conversation.integration || ({} as IIntegration);
  const { kind } = integration;

  const isMail = kind.includes('nylas') || kind === 'gmail';

  if (isMail) {
    return renderMailRespondBox();
  }

  return (
    <RespondBoxContainer>
      {renderContent()}
    </RespondBoxContainer>
  );
};

export default RespondBox;