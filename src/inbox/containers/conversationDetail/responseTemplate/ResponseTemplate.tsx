import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { withProps } from '@octobots/ui/src/utils';
import ResponseTemplate from '../../../components/conversationDetail/workarea/responseTemplate/ResponseTemplate';
import { queries } from '@octobots/ui-inbox/src/inbox/graphql';
import { queries as brandQuery } from '@octobots/ui/src/brands/graphql';
import { BrandsQueryResponse } from '@octobots/ui/src/brands/types';
import {
  IResponseTemplate,
  ResponseTemplatesQueryResponse,
  SaveResponseTemplateMutationResponse
} from '../../../../settings/responseTemplates/types';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  onSelect: (responseTemplate?: IResponseTemplate) => void;
  brandId?: string;
  attachments: any[];
  content: string;
  disabled?: boolean;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
  responseTemplatesQuery: ResponseTemplatesQueryResponse;
} & Props &
  SaveResponseTemplateMutationResponse;

const ResponseTemplateContainer = (props: FinalProps) => {
  const { brandsQuery } = props;

  if (brandsQuery.loading) {
    return null;
  }

  const updatedProps = {
    ...props,
    brands: brandsQuery.brands
  };

  return <ResponseTemplate {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse>(gql(brandQuery.brands), {
      name: 'brandsQuery'
    }),
    graphql(gql(queries.responseTemplateList), {
      name: 'responseTemplatesQuery'
    })
  )(ResponseTemplateContainer)
);
