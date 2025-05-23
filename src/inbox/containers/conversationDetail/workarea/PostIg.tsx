import * as compose from 'lodash.flowright';
import { IConversation, IMessage } from '@octobots/ui-inbox/src/inbox/types';
import InstagramPost from '../../../components/conversationDetail/workarea/InstagramPost';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '@octobots/ui-inbox/src/inbox/graphql';
import { withProps } from '@octobots/ui/src/utils';
import Spinner from '@octobots/ui/src/components/Spinner';

type Props = {
  conversation: IConversation;
  conversationMessage: IMessage;
};

type FinalProps = {
  instagramPostQuery: any;
} & Props;

// instagramPostQuery
// InstagramPostInfoContainer;
class InstagramPostInfoContainer extends React.Component<FinalProps> {
  render() {
    const { instagramPostQuery } = this.props;

    if (instagramPostQuery.loading) {
      return <Spinner />;
    }

    if (instagramPostQuery.instagramGetPost !== null) {
      const updatedProps = {
        ...this.props,
        instagramPostQuery: instagramPostQuery.instagramGetPost || []
      };

      return <InstagramPost {...updatedProps} />;
    } else {
      return null;
    }
  }
}

export default withProps<Props>(
  compose(
    graphql(gql(queries.instagramPostInfo), {
      name: 'instagramPostQuery',
      options: ({ conversation }: Props) => ({
        variables: { octoApiId: conversation._id }
      })
    })
  )(InstagramPostInfoContainer)
);
