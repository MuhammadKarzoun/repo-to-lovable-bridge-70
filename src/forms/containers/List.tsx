import * as compose from "lodash.flowright";
import * as routerUtils from "@octobots/ui/src/utils/router";

import { Alert, confirm, withProps } from "@octobots/ui/src/utils";
import {
  CopyMutationResponse,
  CountQueryResponse,
  LeadIntegrationsQueryResponse,
  RemoveMutationResponse,
} from "@octobots/ui-leads/src/types";
import { MutationVariables } from "@octobots/ui/src/types";
import { mutations, queries } from "@octobots/ui-leads/src/graphql";

import { ArchiveIntegrationResponse } from "@octobots/ui-inbox/src/settings/integrations/types";
import Bulk from "@octobots/ui/src/components/Bulk";
import { INTEGRATION_KINDS } from "@octobots/ui/src/constants/integrations";
import List from "../components/List";
import React from "react";
import { generatePaginationParams } from "@octobots/ui/src/utils/router";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { mutations as integrationMutations } from "@octobots/ui-inbox/src/settings/integrations/graphql/index";

type Props = {
  queryParams: any;
  location?: any;
  navigate?: any;
};

type FinalProps = {
  integrationsQuery: LeadIntegrationsQueryResponse;
  integrationsTotalCountQuery: CountQueryResponse;
} & RemoveMutationResponse &
  ArchiveIntegrationResponse &
  CopyMutationResponse &
  Props;

class ListContainer extends React.Component<FinalProps> {
  componentDidMount() {
    const { location } = this.props;

    const shouldRefetchList = routerUtils.getParam(
      location,
      "popUpRefetchList"
    );

    if (shouldRefetchList) {
      this.refetch();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.queryParams.page !== prevProps.queryParams.page) {
      this.props.integrationsQuery.refetch();
    }
  }

  refetch = () => {
    const { integrationsQuery } = this.props;

    integrationsQuery.refetch();
  };

  render() {
    const {
      integrationsQuery,
      integrationsTotalCountQuery,
      removeMutation,
      copyMutation,
      archiveIntegration,
    } = this.props;

    const integrations = integrationsQuery.integrations || [];

    const counts = integrationsTotalCountQuery
      ? integrationsTotalCountQuery.integrationsTotalCount
      : null;

    const totalCount = (counts && counts.total) || 0;

    const remove = (integrationId: string) => {
      const message =
        "If you delete a form, all previous submissions and contacts gathered through this form will also be deleted. Are you sure?";

      confirm(message).then(() => {
        removeMutation({
          variables: { _id: integrationId },
        })
          .then(() => {
            // refresh queries
            this.refetch();

            Alert.success("You successfully deleted a form.");
          })
          .catch((e) => {
            Alert.error(e.message);
          });
      });
    };

    const archive = (integrationId: string, status: boolean) => {
      let message = `If you archive this form, the live form on your website or octobots messenger will no longer be visible. But you can still see the contacts and submissions you've received.`;
      let action = "archived";

      if (!status) {
        message = "You are going to unarchive this form. Are you sure?";
        action = "unarchived";
      }

      confirm(message).then(() => {
        archiveIntegration({ variables: { _id: integrationId, status } })
          .then(({ data }) => {
            const integration = data.integrationsArchive;

            if (integration) {
              Alert.success(`Form has been ${action}.`);
            }

            this.refetch();
          })
          .catch((e: Error) => {
            Alert.error(e.message);
          });
      });
    };

    const copy = (integrationId: string) => {
      copyMutation({
        variables: { _id: integrationId },
      })
        .then(() => {
          // refresh queries
          this.refetch();

          Alert.success("You successfully copied a form.");
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      integrations,
      counts,
      totalCount,
      remove,
      loading: integrationsQuery.loading,
      archive,
      copy,
      refetch: this.refetch,
    };

    const content = (props) => {
      return <List {...updatedProps} {...props} />;
    };

    return <Bulk content={content} refetch={this.refetch} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<
      Props,
      LeadIntegrationsQueryResponse,
      {
        page?: number;
        perPage?: number;
        tag?: string;
        kind?: string;
        brand?: string;
        status?: string;
      }
    >(gql(queries.integrations), {
      name: "integrationsQuery",
      options: ({ queryParams }) => {
        return {
          variables: {
            ...generatePaginationParams(queryParams),
            tag: queryParams.tag,
            brandId: queryParams.brand,
            kind: INTEGRATION_KINDS.FORMS,
            status: queryParams.status,
            sortField: queryParams.sortField,
            searchValue: queryParams.searchValue,
            sortDirection: queryParams.sortDirection
              ? parseInt(queryParams.sortDirection, 10)
              : undefined,
          },
        };
      },
    }),
    graphql<Props, RemoveMutationResponse, MutationVariables>(
      gql(mutations.integrationRemove),
      {
        name: "removeMutation",
      }
    ),
    graphql<Props, ArchiveIntegrationResponse>(
      gql(integrationMutations.integrationsArchive),
      {
        name: "archiveIntegration",
      }
    ),
    graphql(gql(mutations.formCopy), {
      name: "copyMutation",
    }),
    graphql<Props, CountQueryResponse>(gql(queries.integrationsTotalCount), {
      name: "integrationsTotalCountQuery",
      options: ({ queryParams }) => ({
        variables: {
          kind: INTEGRATION_KINDS.FORMS,
          tag: queryParams.tag,
          brandId: queryParams.brand,
          status: queryParams.status,
        },
      }),
    })
  )(ListContainer)
);
