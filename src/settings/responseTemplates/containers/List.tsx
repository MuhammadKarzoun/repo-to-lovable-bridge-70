import {
  ICommonFormProps,
  ICommonListProps,
} from "@octobots/ui-settings/src/common/types";
import {
  mutations,
  queries,
} from "@octobots/ui-inbox/src/settings/responseTemplates/graphql";

import { IButtonMutateProps } from "@octobots/ui/src/types";
import List from "../components/List";
import React from "react";
import { commonListComposer } from "@octobots/ui/src/utils";
import { generatePaginationParams } from "@octobots/ui/src/utils/router";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { useNavigate } from "react-router-dom";

type Props = ICommonListProps &
  ICommonFormProps & {
    queryParams: any;
    location: any;
    renderButton: (props: IButtonMutateProps) => JSX.Element;
    listQuery: any;
  };

const ResponseListContainer: React.FC<Props> = (props) => {
  const navigate = useNavigate();

  return <List {...props} navigate={navigate} />;
};

export default commonListComposer<Props>({
  text: "response template",
  label: "responseTemplates",
  stringEditMutation: mutations.responseTemplatesEdit,
  stringAddMutation: mutations.responseTemplatesAdd,
  confirmProps: { options: { hasDeleteConfirm: true } },

  gqlListQuery: graphql(gql(queries.responseTemplates), {
    name: "listQuery",
    options: ({ queryParams }: { queryParams: any }) => {
      return {
        notifyOnNetworkStatusChange: true,
        variables: {
          searchValue: queryParams.searchValue,
          brandId: queryParams.brandId,
          ...generatePaginationParams(queryParams),
        },
      };
    },
  }),

  gqlTotalCountQuery: graphql(gql(queries.responseTemplatesTotalCount), {
    name: "totalCountQuery",
    options: ({ queryParams }: { queryParams: any }) => {
      return {
        notifyOnNetworkStatusChange: true,
        variables: {
          searchValue: queryParams.searchValue,
          brandId: queryParams.brandId,
        },
      };
    },
  }),

  gqlAddMutation: graphql(gql(mutations.responseTemplatesAdd), {
    name: "addMutation",
  }),

  gqlEditMutation: graphql(gql(mutations.responseTemplatesEdit), {
    name: "editMutation",
  }),

  gqlRemoveMutation: graphql(gql(mutations.responseTemplatesRemove), {
    name: "removeMutation",
  }),

  ListComponent: ResponseListContainer,
});
