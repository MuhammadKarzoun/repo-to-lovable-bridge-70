import { colors, dimensions } from '@octobots/ui/src/styles';
import styled from 'styled-components';

const ConversationWrapper = styled.div`
  height: 100%;
  overflow: auto;
  min-height: 100px;
  background: ${colors.bgLight};
`;

const RenderConversationWrapper = styled.div`
  padding: 20px;
  overflow: hidden;
  min-height: 100%;
  > div:first-child {
    margin-top: 0;
  }
`;

const ActionBarLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const AssignTrigger = styled.div`
  padding-inline-start: ${dimensions.unitSpacing}px;
  margin-inline-end: ${dimensions.unitSpacing}px;

  i {
    margin-inline-start	: 5px;
    margin-inline-end: -6px;
    transition: all ease 0.3s;
    color: ${colors.colorCoreGray};
    display: inline-block;

    @media (max-width: 768px) {
      display: none;
    }
  }

  &:hover {
    cursor: pointer;
  }

  &[aria-describedby] {
    color: ${colors.colorSecondary};

    i {
      transform: rotate(180deg);
    }
  }
`;

const AssignText = styled.div`
  display: inline-block;
`;

const MailSubject = styled.h3`
  margin: 0 0 ${dimensions.unitSpacing}px 0;
  font-weight: bold;
  font-size: 18px;
  line-height: 22px;
`;

const ReplyComponent = styled.div`
    display: flex;
    padding: 3px 15px;
    background-color: beige;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    .reply-head {width: 70px; font-weight: bold;}

    .reply-content {
      padding: 5px 10px;
      width: 100%;
      margin-inline-start	: 5px;
      background-color: #60605f21;
      border-radius: 7px;
      border-inline-start: solid 4px #3ccc38;
    }

    .reply-close {width: 40px;}

    button {
    font-size: 16px;
    border: none;
    background-color: transparent;
    }

    p {margin: 0px;}
`;

export {
  ConversationWrapper,
  RenderConversationWrapper,
  ActionBarLeft,
  AssignTrigger,
  AssignText,
  MailSubject,
  ReplyComponent
};
