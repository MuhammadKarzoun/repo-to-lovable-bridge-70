import * as compose from "lodash.flowright";

import { Alert, confirm, withProps } from "@octobots/ui/src/utils";
import { IButtonMutateProps, MutationVariables } from "@octobots/ui/src/types";
import { mutations, queries } from "../graphql";

import { AppConsumer } from "coreui/appContext";
import ButtonMutate from "@octobots/ui/src/components/ButtonMutate";
import {
  ChannelsCountQueryResponse,
  ChannelsRemoveMutationResponse
} from "../types";
import { ChannelsQueryResponse } from "@octobots/ui-inbox/src/settings/channels/types";
import React from "react";
import Sidebar from "../components/Sidebar";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import skillsQueries from "@octobots/ui-inbox/src/settings/skills/graphql/queries";
import inboxQueries from "@octobots/ui-inbox/src/inbox/graphql/queries";
import { useNavigate } from "react-router-dom";
import { SkillsQueryResponse } from "@octobots/ui-inbox/src/settings/skills/types";

type Props = {
  queryParams: any;
  currentChannelId?: string;
  currentUserId?: string;
};

type FinalProps = {
  channelsQuery: ChannelsQueryResponse;
  channelsCountQuery: ChannelsCountQueryResponse;
  allSkillsQuery: SkillsQueryResponse;
} & Props &
  ChannelsRemoveMutationResponse;

const SidebarContainer = (props: FinalProps) => {
  const {
    channelsQuery,
    channelsCountQuery,
    removeMutation,
    queryParams,
    currentChannelId,
    currentUserId,
    allSkillsQuery
  } = props;
  const navigate = useNavigate();
  const channels = channelsQuery.channels || [];
  const skills = allSkillsQuery.skills || [];
  const channelsTotalCount = channelsCountQuery.channelsTotalCount || 0;

  // remove action
  const remove = channelId => {
    confirm("This will permanently delete are you absolutely sure?", {
      hasDeleteConfirm: true
    }).then(() => {
      removeMutation({
        variables: { _id: channelId }
      })
        .then(() => {
          Alert.success("You successfully deleted a channel.");

          navigate("/settings/channels");
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.channelEdit : mutations.channelAdd}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries(
          queryParams,
          currentChannelId,
          currentUserId
        )}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? "updated" : "added"
        } a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    channels,
    channelsTotalCount,
    remove,
    renderButton,
    loading: channelsQuery.loading,
    skills
  };

  return <Sidebar {...updatedProps} />;
};

const getRefetchQueries = (
  queryParams,
  currentChannelId?: string,
  currentUserId?: string
) => {
  return [
    {
      query: gql(queries.channels),
      variables: {
        perPage: queryParams.limit ? parseInt(queryParams.limit, 10) : 20
      }
    },
    {
      query: gql(queries.channels),
      variables: {}
    },
    {
      query: gql(skillsQueries.skills),
      variables: {}
    },
    {
      query: gql(queries.integrationsCount),
      variables: {}
    },
    {
      query: gql(queries.channelDetail),
      variables: { _id: currentChannelId || "" }
    },
    { query: gql(queries.channelsCount) },
    {
      query: gql(inboxQueries.channelList),
      variables: { memberIds: [currentUserId] }
    }
  ];
};

const WithProps = withProps<Props>(
  compose(
    graphql<Props, ChannelsQueryResponse, { perPage: number }>(
      gql(queries.channels),
      {
        name: "channelsQuery",
        options: ({ queryParams }: { queryParams: any }) => ({
          variables: {
            perPage: queryParams.limit ? parseInt(queryParams.limit, 10) : 20
          },
          fetchPolicy: "network-only"
        })
      }
    ),
    graphql<Props, ChannelsCountQueryResponse, {}>(gql(queries.channelsCount), {
      name: "channelsCountQuery"
    }),
    graphql<Props, RemovePipelineLabelMutationResponse, MutationVariables>(
      gql(mutations.channelRemove),
      {
        name: "removeMutation",
        options: ({ queryParams, currentChannelId, currentUserId }: Props) => ({
          refetchQueries: getRefetchQueries(
            queryParams,
            currentChannelId,
            currentUserId
          )
        })
      }
    ),
    graphql<Props, SkillsQueryResponse>(gql(skillsQueries.skills), {
      name: 'allSkillsQuery'
    })
  )(SidebarContainer)
);

export default (props: Props) => (
  <AppConsumer>
    {({ currentUser }) => (
      <WithProps
        {...props}
        currentUserId={(currentUser && currentUser._id) || ""}
      />
    )}
  </AppConsumer>
);
