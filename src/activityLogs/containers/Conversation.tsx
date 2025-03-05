import * as compose from 'lodash.flowright';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

import { IActivityLog } from '@octobots/ui-log/src/activityLogs/types';
import Spinner from '@octobots/ui/src/components/Spinner';
import { queries } from '@octobots/ui-inbox/src/inbox/graphql';
import { withProps } from '@octobots/ui/src/utils';
import {
  ConversationDetailQueryResponse,
  MessagesQueryResponse
} from '@octobots/ui-inbox/src/inbox/types';

import Conversation from '../components/Conversation';

type Props = {
  activity: IActivityLog;
  conversationId: string;
};

type FinalProps = {
  messagesQuery: MessagesQueryResponse;
  conversationDetailQuery: ConversationDetailQueryResponse;
} & Props;

class ConversationContainer extends React.Component<FinalProps> {
  render() {
    const { conversationDetailQuery, messagesQuery } = this.props;

    if (conversationDetailQuery.loading || messagesQuery.loading) {
      return <Spinner />;
    }

    const conversation = conversationDetailQuery.conversationDetail;
    const messages = messagesQuery.conversationMessages || [];

    const updatedProps = {
      ...this.props,
      conversation,
      messages
    };

    return <Conversation {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ConversationDetailQueryResponse>(
      gql(queries.conversationDetail),
      {
        name: 'conversationDetailQuery',
        options: ({ conversationId }) => ({
          variables: {
            _id: conversationId
          }
        })
      }
    ),
    graphql<Props, MessagesQueryResponse>(gql(queries.conversationMessages), {
      name: 'messagesQuery',
      options: ({ conversationId }) => ({
        variables: {
          conversationId,
          limit: 10,
          getFirst: true
        }
      })
    })
  )(ConversationContainer)
);
