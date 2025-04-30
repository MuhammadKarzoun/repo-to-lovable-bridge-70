
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  AddMessageMutationVariables,
  IConversation,
  IMessage,
} from "@octobots/ui-inbox/src/inbox/types";
import { ContenFooter, ContentBox } from "@octobots/ui/src/layout/styles";
import {
  ConversationWrapper,
  MailSubject,
  RenderConversationWrapper,
  TabButton,
  TabsContainer,
  ConnectionStatus,
} from "./styles";
import ActionBar from "./ActionBar";
import CallPro from "./callpro/Callpro";
import GrandStream from "./grandStream/GrandStream";
import { IAttachmentPreview } from "@octobots/ui/src/types";
import MailConversation from "@octobots/ui-inbox/src/inbox/components/conversationDetail/workarea/mail/MailConversation";
import Message from "@octobots/ui-inbox/src/inbox/components/conversationDetail/workarea/conversation/messages/Message";
import RespondBox from "../../../containers/conversationDetail/RespondBox";
import TypingIndicator from "./TypingIndicator";
import { __ } from "coreui/utils";
import styled from "styled-components";
import { modernColors, borderRadius } from "../../../../styles/theme";
import { DashboardApp } from "../../../containers/conversationDetail/ConversationDetail";
import { UpdatedTabs, UpdatedTabTitle } from "@octobots/ui/src/components/tabs";

const ModernContentBox = styled(ContentBox)`
  background-color: ${modernColors.contentBackground};
  border-radius: ${borderRadius.md};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ModernConversationWrapper = styled(ConversationWrapper)`
  flex: 1;
  background-color: ${modernColors.background};
  overflow-y: auto;
`;

const ModernContenFooter = styled(ContenFooter)`
  background-color: ${modernColors.contentBackground};
  border-top: 1px solid ${modernColors.border};
`;

type Props = {
  queryParams?: any;
  title?: string;
  currentConversationId?: string;
  currentConversation: IConversation;
  conversationMessages: IMessage[];
  loading: boolean;
  typingInfo?: string;
  loadMoreMessages: () => any;
  addMessage: ({
    variables,
    optimisticResponse,
    callback,
    kind,
  }: {
    variables: AddMessageMutationVariables;
    optimisticResponse: any;
    callback?: (e?) => void;
    kind: string;
  }) => void;
  refetchMessages: () => void;
  refetchDetail: () => void;
  content?: any;
  msg?: string;
  updateMsg: (id: string, content: string, action: string) => void;
  hideMask: boolean;
  userDashboardApps?: { userDashboardApps: DashboardApp[] };
  connectionStatus?: 'connected' | 'disconnected' | 'connecting';
};

const WorkArea: React.FC<Props> = React.memo((props) => {
  const {
    currentConversation,
    conversationMessages,
    content,
    updateMsg,
    hideMask,
    msg,
    addMessage,
    typingInfo,
    refetchMessages,
    refetchDetail,
    loadMoreMessages,
    userDashboardApps,
    connectionStatus = 'connected',
  } = props;

  const [attachmentPreview, setAttachmentPreview] =
    useState<IAttachmentPreview | null>(null);
  const [replyForMsgId, setReplyForMsgId] = useState<IMessage | null>(null);
  const conversationWrapperRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [userApps, setUserApps] = useState(
    userDashboardApps?.userDashboardApps
  );
  const [tabType, setTabType] = useState<DashboardApp>({ _id: "messages" });

  // Scroll to bottom on new messages or typing info
  useEffect(() => {
    scrollBottom();
  }, [conversationMessages, typingInfo]);

  // Handle scroll to load more messages
  const handleScroll = useCallback(() => {
    if (conversationWrapperRef.current?.scrollTop === 0 && !isLoadingMore) {
      console.log('[DmWorkArea Component] Loading more messages on scroll');
      setIsLoadingMore(true);
      loadMoreMessages().finally(() => setIsLoadingMore(false));
    }
  }, [loadMoreMessages, isLoadingMore]);

  // Scroll to bottom of the conversation
  const scrollBottom = useCallback(() => {
    if (conversationWrapperRef.current) {
      conversationWrapperRef.current.scrollTop =
        conversationWrapperRef.current.scrollHeight;
    }
  }, []);

  // Jump to a specific message by ID
  const jumpToReleventDiv = useCallback((id: string) => {
    const releventDiv = document.getElementById(id);
    if (releventDiv) {
      releventDiv.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Check if the conversation is a mail conversation
  const isMailConversation = useCallback(
    (kind: string) => kind.includes("nylas") || kind === "gmail",
    []
  );

  // Render extra heading for mail conversations
  const renderExtraHeading = useCallback(
    (kind: string, conversationMessage: IMessage) => {
      if (!conversationMessage) return null;

      if (isMailConversation(kind)) {
        const { mailData } = conversationMessage;
        return <MailSubject>{mailData?.subject || ""}</MailSubject>;
      }

      return null;
    },
    [isMailConversation]
  );

  // Render messages in the conversation
  const renderMessages = useCallback(
    (
      messages: IMessage[],
      conversationFirstMessage: IMessage,
      updateMsg: (id: string, content: string, action: string) => void,
      brandId?: string
    ) => {
      let tempId: string | undefined;

      return messages.map((message) => {
        const isSameUser = message.userId
          ? message.userId === tempId
          : message.customerId === tempId;

        tempId = message.userId ? message.userId : message.customerId;

        return (
          <Message
            key={message._id}
            isSameUser={isSameUser}
            conversationFirstMessage={conversationFirstMessage}
            message={message}
            goToMsg={jumpToReleventDiv}
            updateMsg={updateMsg}
            setReplyForMsgId={setReplyForMsgId}
          />
        );
      });
    },
    [jumpToReleventDiv]
  );

  // Render the conversation based on its type
  const renderConversation = useCallback(() => {
    if (!currentConversation) return null;

    const messages = conversationMessages.slice();
    const firstMessage = messages[0];
    const { integration } = currentConversation;
    const kind = integration?.kind.split("-")[0];
    const brandId = currentConversation.integration.brandId;

    if (kind === "callpro") {
      return (
        <>
          <CallPro conversation={currentConversation} />
          {renderMessages(messages, firstMessage, updateMsg)}
        </>
      );
    }

    if (isMailConversation(kind)) {
      return (
        <MailConversation
          conversation={currentConversation}
          conversationMessages={conversationMessages}
        />
      );
    }

    if (kind === "imap") {
      return (
        <>
          {content}
          {renderMessages(messages, firstMessage, updateMsg)}
        </>
      );
    }

    if (kind === "calls") {
      return (
        <>
          <GrandStream conversation={currentConversation} />
          {renderMessages(messages, firstMessage, updateMsg)}
        </>
      );
    }

    return renderMessages(messages, firstMessage, updateMsg);
  }, [
    currentConversation,
    conversationMessages,
    content,
    updateMsg,
    isMailConversation,
    renderMessages,
  ]);

  // Render the RespondBox component
  const renderRespondBox = useCallback(() => {
    if (!currentConversation?.integration) return null;
    
    const { kind } = currentConversation.integration;
    const showInternal =
      isMailConversation(kind) ||
      kind === "lead" ||
      kind === "imap" ||
      kind === "calls" ||
      kind === "webhook";
    return (
      <RespondBox
        showInternal={showInternal}
        disableInternalState={showInternal}
        conversation={currentConversation}
        setAttachmentPreview={setAttachmentPreview}
        addMessage={addMessage}
        refetchMessages={refetchMessages}
        refetchDetail={refetchDetail}
        replyForMsgId={replyForMsgId}
        hideMask={hideMask}
      />
    );
  }, [
    currentConversation,
    isMailConversation,
    addMessage,
    refetchMessages,
    refetchDetail,
    replyForMsgId,
    hideMask,
  ]);

  // Jump to a specific message after a delay
  useEffect(() => {
    if (msg && conversationMessages.some((m) => m._id === msg)) {
      const timeout = setTimeout(() => {
        jumpToReleventDiv(msg);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [msg, conversationMessages, jumpToReleventDiv]);

  // Render connection status indicator
  const renderConnectionStatus = useCallback(() => {
    if (connectionStatus === 'connected') return null;
    
    return (
      <ConnectionStatus status={connectionStatus}>
        {connectionStatus === 'connecting' ? 'Connecting to server...' : 'Connection lost. Trying to reconnect...'}
      </ConnectionStatus>
    );
  }, [connectionStatus]);

  return (
    <>
      <ActionBar currentConversation={currentConversation} />
      {renderConnectionStatus()}
      <TabsContainer>
        <TabButton
          type="button"
          isActive={tabType?._id === "messages"}
          onClick={() => setTabType({ _id: "messages" })}
        >
          الرسائل
        </TabButton>
        {userApps?.map((userApp: DashboardApp) => (
          <TabButton
            key={userApp._id}
            type="button"
            isActive={tabType._id === userApp._id}
            onClick={() => setTabType(userApp)}
          >
            {userApp?.name}
          </TabButton>
        ))}
      </TabsContainer>
      {tabType._id === "messages" && (
        <>
          <ModernContentBox>
            <ModernConversationWrapper
              ref={conversationWrapperRef as unknown as React.RefObject<any>}
              onScroll={handleScroll}
            >
              <RenderConversationWrapper>
                {renderConversation()}
              </RenderConversationWrapper>
            </ModernConversationWrapper>
          </ModernContentBox>

          {currentConversation._id && (
            <ModernContenFooter>
              {typingInfo && <TypingIndicator>{typingInfo}</TypingIndicator>}
              {renderRespondBox()}
            </ModernContenFooter>
          )}
        </>
      )}

      {tabType?._id !== "messages" && tabType?.iframeUrl && (
        <iframe
          src={tabType?.iframeUrl}
          style={{ height: "100%", width: "100%", border: "none" }}
          title={tabType?.name || "Dashboard App"}
        />
      )}
    </>
  );
});

export default WorkArea;
