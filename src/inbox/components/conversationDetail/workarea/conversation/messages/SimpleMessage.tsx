import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  CallBox,
  DeletedMessageContent,
  MessageBody,
  MessageContent,
  MessageItem,
  OptionsContainer,
  Reactionbutton,
  ReplyTo,
  UserInfo,
  Forwarded,
  ReactionContainer,
  ReactionEmoji,
  EmojiPickerContainer,
  EmojiButton,
} from '../styles';

import { MenuItem } from '@headlessui/react';
import Attachment from '@octobots/ui/src/components/Attachment';
import { IMessage } from '../../../../../types';
import Icon from '@octobots/ui/src/components/Icon';
import Tip from '@octobots/ui/src/components/Tip';
import VideoCallMessage from './VideoCallMessage';
import { __ } from '@octobots/ui/src/utils';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { urlify } from '@octobots/ui/src/utils/urlParser';
import xss from 'xss';
import IconStatus from './iconStatus';
import { MESSAGE_STATUSES } from '../../../../../constants';
import Dropdown from '@octobots/ui/src/components/Dropdown';
import DropdownToggle from '@octobots/ui/src/components/DropdownToggle';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import * as strip from 'strip';
import { Alert, confirm } from '@octobots/ui/src/utils';
import Avatar from '../../../../../../components/common/Avatar';

// Custom emoji picker with 5 reactions
const EMOJIS = ['👍', '❤️', '😂', '😮', '😢'];

type Props = {
  message: IMessage;
  classes?: string[];
  isStaff: boolean;
  isSameUser?: boolean;
  renderContent?: () => React.ReactNode;
  goToMsg: (id: string) => void;
  updateMsg: (id: string, content: any, action: string) => void;
  setReplyId: (message: IMessage) => void;
  isFirstMsg?: boolean;
};

const SimpleMessage: React.FC<Props> = React.memo(({
  message,
  classes,
  isStaff,
  isSameUser,
  renderContent,
  goToMsg,
  updateMsg,
  setReplyId,
  isFirstMsg,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const handleToggleEmojiPicker = () => setShowEmojiPicker(!showEmojiPicker);

  const renderAvatar = () => {
    if (isSameUser) return null;

    const props = message.user ? { user: message.user } : { customer: message.customer };
    return <Avatar {...props} size={40} />;
  };

  const renderAttachment = useCallback(() => {
    if (!message.attachments || message.attachments.length === 0) return null;

    return message.attachments.map((attachment, index) => (
      <Attachment key={index} attachment={attachment} simple={true} />
    ));
  }, [message.attachments]);

  const renderReplyContent = useCallback(() => {
    if (!message.replyForMsg) return null;

    const hasAttachment = message.replyForMsg.attachments && message.replyForMsg.attachments.length > 0;

    if (message.replyForMsg.contentType === 'videoCall') {
      return <VideoCallMessage message={message.replyForMsg} />;
    }

    if (message.replyForMsg.contentType === 'videoCallRequest') {
      return (
        <CallBox>
          <UserInfo>
            <strong>
              <Icon icon="exclamation-triangle" color="#EA475D" size={15} />{' '}
              {__('You have received a video call request')}
            </strong>
          </UserInfo>
        </CallBox>
      );
    }

    if (!message.replyForMsg.content) {
      return <>{renderAttachment()}</>;
    }

    return (
      <>
        <span dangerouslySetInnerHTML={{ __html: xss(urlify(message.replyForMsg.content)) }} />
        {renderAttachment()}
      </>
    );
  }, [message.replyForMsg, renderAttachment]);

  const renderReplyTo = useCallback(() => {
    if (!message.replyForMsgId) return null;

    return (
      <ReplyTo onClick={() => goToMsg(message.replyForMsg._id)}>
        {renderReplyContent()}
      </ReplyTo>
    );
  }, [message.replyForMsg, message.replyForMsgId, goToMsg, renderReplyContent]);

  const getMsgURL = () => {
    let path = location.protocol + '//' + location.host + location.pathname;
    path += '?_id=' + message.conversationId;
    path += '&msg=' + message._id;
    return path;
  };

  const renderMessageContent = useCallback(() => {
    if (renderContent) return renderContent();

    if (message.hideMsg) {
      return (
        <DeletedMessageContent $staff={isStaff}>
          <i className="icon-ban"></i>
          Message deleted
        </DeletedMessageContent>
      );
    }

    const renderForwarded = () => {
      if (!message.isForwarded) return null;
      return (
        <Forwarded>
          <i className="icon-reply"></i>
          <span>Forwarded</span>
        </Forwarded>
      );
    };

    if (message.contentType === 'videoCall') {
      return <VideoCallMessage message={message} />;
    }

    if (message.contentType === 'videoCallRequest') {
      return (
        <CallBox>
          <UserInfo>
            <strong>
              <Icon icon="exclamation-triangle" color="#EA475D" size={15} />{' '}
              {__('You have received a video call request')}
            </strong>
          </UserInfo>
        </CallBox>
      );
    }

    return (
      <MessageContent
        $failed={message.status === MESSAGE_STATUSES.FAILED}
        $staff={isStaff}
        $internal={message.internal}
      >
        <Dropdown
          as={DropdownToggle}
          toggleComponent={
            <OptionsContainer $staff={isStaff}>
              <div className="options-logo">
                <i className="icon-ellipsis-v"></i>
              </div>
            </OptionsContainer>
          }
          unmount={false}
          isMenuWidthFit={isFirstMsg ? false : true}
          drop={isFirstMsg ? "down" : "up"}
        >
          <MenuItem>
            <a className='dropdown-item'>
              <i className="icon-earthgrid"></i>
              {__('Translate')}
            </a>
          </MenuItem>
          <MenuItem>
            <a className='dropdown-item'>
              <i className="icon-copy-1"></i>
              <CopyToClipboard text={strip(message.content)} onCopy={() => Alert.success('Message copied!')}>
                <span>{__('Copy message')}</span>
              </CopyToClipboard>
            </a>
          </MenuItem>
          <MenuItem>
            <a className='dropdown-item' onClick={() => {
              setReplyId(message);
            }}>
              <i className="icon-reply"></i>
              {__('Reply to message')}
            </a>
          </MenuItem>
          <MenuItem>
            <a className='dropdown-item' onClick={() => confirm().then(() => updateMsg(message._id, { hideMsg: true }, 'delete'))}>
              <i className="icon-trash-alt"></i>
              {__('Delete message')}
            </a>
          </MenuItem>
          <MenuItem>
            <a className='dropdown-item'>
              <i className="icon-link"></i>
              <CopyToClipboard text={getMsgURL()} onCopy={() => Alert.success('Highlight link copied!')}>
                <span>{__('Copy highlight link')}</span>
              </CopyToClipboard>
            </a>
          </MenuItem>
        </Dropdown>
        {renderForwarded()}
        {renderReplyTo()}
        <span dangerouslySetInnerHTML={{ __html: xss(urlify(message.content)) }} />
        {renderAttachment()}
      </MessageContent>
    );
  }, [renderContent, message, isStaff, renderReplyTo, renderAttachment, setReplyId, updateMsg]);

  const statusIcon = useMemo(() => {
    if (!isStaff) return null;
    return <IconStatus status={message.status} errorMsg={message.errorMsg} />;
  }, [isStaff, message.status, message.errorMsg]);

  const handleReactionClick = useCallback((emoji: string) => {
    updateMsg(message._id, { reaction: emoji }, 'reaction');
    setShowEmojiPicker(false);
  }, [updateMsg, message._id]);

  // Render the emoji picker
  const renderEmojiPicker = () => {
    if (!showEmojiPicker) return null;

    return (
      <EmojiPickerContainer ref={emojiPickerRef}>
        {EMOJIS.map((emoji) => (
          <EmojiButton key={emoji} onClick={() => handleReactionClick(emoji)}>
            {emoji}
          </EmojiButton>
        ))}
      </EmojiPickerContainer>
    );
  };

  // Render the message reaction
  const renderMessageReaction = () => {
    if (!message.reaction || message.hideMsg) return null;

    return (
      <ReactionContainer>
        <ReactionEmoji onClick={() => updateMsg(message._id, { reaction: '' }, 'reaction')}>
          {message.reaction}
        </ReactionEmoji>
      </ReactionContainer>
    );
  };

  const classesMessageItem = useMemo(() => {
    return classNames({
      ...(classes || []),
      attachment: message.attachments && message.attachments.length > 0,
      same: isSameUser,
    });
  }, [classes, message.attachments, isSameUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <MessageItem
      key={message._id}
      id={message._id}
      $staff={isStaff}
      className={classesMessageItem}
      $isSame={isSameUser}
    >
      {renderAvatar()}
      <MessageBody $staff={isStaff} className="message-item">
        {statusIcon}
        {renderMessageContent()}
        {!message.hideMsg && (
          <Reactionbutton
            className="msg-reaction-button"
            $staff={isStaff}
            onClick={handleToggleEmojiPicker}
          >
            <i className="icon-smile"></i>
          </Reactionbutton>
        )}
        {renderMessageReaction()}
        <Tip text={dayjs(message.createdAt).format('lll')}>
          <footer>{dayjs(message.createdAt).format('LT')}</footer>
        </Tip>
      </MessageBody>
      {renderEmojiPicker()}
    </MessageItem>
  );
});

export default SimpleMessage;