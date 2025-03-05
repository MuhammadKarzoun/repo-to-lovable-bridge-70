import Button from "@octobots/ui/src/components/Button";
import DataWithLoader from "@octobots/ui/src/components/DataWithLoader";
import { IField } from "@octobots/ui/src/types";
import { IFormResponse } from "@octobots/ui-forms/src/forms/types";
import { IIntegration } from "@octobots/ui-inbox/src/settings/integrations/types";
import Pagination from "@octobots/ui/src/components/pagination/Pagination";
import React from "react";
import ResponseRow from "./ResponseRow";
import { SortHandler } from "@octobots/ui/src";
import Table from "@octobots/ui/src/components/table";
import Wrapper from "@octobots/ui/src/layout/components/Wrapper";
import { __ } from "@octobots/ui/src/utils";
import { getEnv } from "coreui/utils";

type Props = {
  integrationDetail: IIntegration;
  totalCount: number;
  fields: IField[];
  formSubmissions: IFormResponse[];
  queryParams: any;
  loading: boolean;
};

class List extends React.Component<Props, {}> {
  renderRow() {
    const { formSubmissions } = this.props;
    const fieldIds = this.props.fields.map((f) => f._id);
    return formSubmissions.map((e) => (
      <ResponseRow
        key={e.contentTypeId}
        formSubmission={e}
        fieldIds={fieldIds}
      />
    ));
  }

  render() {
    const {
      totalCount,
      queryParams,
      loading,
      fields,
      formSubmissions,
      integrationDetail,
    } = this.props;

    queryParams.loadingMainQuery = loading;
    const { REACT_APP_API_URL } = getEnv();

    const onClick = () => {
      window.open(
        `${REACT_APP_API_URL}/file-export?type=customer&popupData=true&form=${integrationDetail.formId}`,
        "_blank"
      );
    };

    const actionBarRight = (
      <Button
        btnStyle="success"
        size="small"
        icon="plus-circle"
        onClick={onClick}
      >
        Download Responses
      </Button>
    );

    const actionBar = <Wrapper.ActionBar right={actionBarRight} />;

    const content = (
      <Table $whiteSpace="nowrap" $hover={true}>
        <thead>
          <tr>
            {fields.map((e) => {
              return (
                <th key={e._id} id={e._id}>
                  <SortHandler sortField={e.text} label={e.text} />
                </th>
              );
            })}
            <th>{__("Submitted at")}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__("Form responses")}
            breadcrumb={[{ title: __("Responses") }]}
            queryParams={queryParams}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={formSubmissions.length}
            emptyContent={"no responses"}
          />
        }
      />
    );
  }
}

export default List;
