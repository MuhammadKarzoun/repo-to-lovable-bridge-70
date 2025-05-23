import * as routerUtils from "@octobots/ui/src/utils/router";

import { ILeadIntegration, IntegrationsCount } from "@octobots/ui-leads/src/types";

import { BarItems } from "@octobots/ui/src/layout/styles";
import Button from "@octobots/ui/src/components/Button";
import DataWithLoader from "@octobots/ui/src/components/DataWithLoader";
import { EMPTY_CONTENT_POPUPS } from "@octobots/ui-settings/src/constants";
import EmptyContent from "@octobots/ui/src/components/empty/EmptyContent";
import { Flex } from "@octobots/ui/src/styles/main";
import FormControl from "@octobots/ui/src/components/form/Control";
import { ITag } from "@octobots/ui-tags/src/types";
import { Link } from "react-router-dom";
import Pagination from "@octobots/ui/src/components/pagination/Pagination";
import React from "react";
import Row from "./Row";
import Sidebar from "./Sidebar";
import SortHandler from "@octobots/ui/src/components/SortHandler";
import { TAG_TYPES } from "@octobots/ui-tags/src/constants";
import Table from "@octobots/ui/src/components/table";
import TaggerPopover from "@octobots/ui-tags/src/components/TaggerPopover";
import Wrapper from "@octobots/ui/src/layout/components/Wrapper";
import { __ } from "coreui/utils";
import { isEnabled } from "@octobots/ui/src/utils/core";

type Props = {
  integrations: ILeadIntegration[];
  tags: ITag[];
  bulk: ILeadIntegration[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  totalCount: number;
  queryParams: any;
  tagsCount: { [key: string]: number };
  toggleBulk: (target: ILeadIntegration, toAdd: boolean) => void;
  toggleAll: (bulk: ILeadIntegration[], name: string) => void;
  loading: boolean;
  remove: (integrationId: string) => void;
  archive: (integrationId: string, status: boolean) => void;
  refetch?: () => void;
  copy: (integrationId: string) => void;
  counts: IntegrationsCount;
  location: any;
  navigate: any;
};

const List = ({
  integrations,
  bulk,
  isAllSelected,
  emptyBulk,
  totalCount,
  queryParams,
  toggleBulk,
  toggleAll,
  loading,
  remove,
  archive,
  copy,
  counts,
  location,
  navigate
}: Props) => {
  const onChange = () => {
    toggleAll(integrations, "integrations");
  };

  const renderRow = () => {
    return integrations.map(integration => (
      <Row
        key={integration._id}
        isChecked={bulk.includes(integration)}
        toggleBulk={toggleBulk}
        integration={integration}
        remove={remove}
        archive={archive}
        showCode={integration._id === queryParams.showInstallCode}
        copy={copy}
      />
    ));
  };

  const searchHandler = event => {
    routerUtils.setParams(navigate, location, {
      searchValue: event.target.value
    });
  };

  queryParams.loadingMainQuery = loading;
  let actionBarLeft: React.ReactNode;

  if (bulk.length > 0) {
    const tagButton = (
      <Button btnStyle="simple" size="small" icon="tag-alt">
        Tag
      </Button>
    );

    actionBarLeft = (
      <BarItems>
        <TaggerPopover
          type={TAG_TYPES.INTEGRATION}
          successCallback={emptyBulk}
          targets={bulk}
          trigger={tagButton}
        />
      </BarItems>
    );
  }

  const actionBarRight = (
    <Flex>
      <FormControl
        type="text"
        placeholder={__("Type to search")}
        onChange={searchHandler}
        value={routerUtils.getParam(location, "searchValue")}
        autoFocus={true}
      />
      &nbsp;&nbsp;
      <Link to="/forms/create">
        <Button btnStyle="success" size="small" icon="plus-circle">
          Create Form
        </Button>
      </Link>
    </Flex>
  );

  const actionBar = (
    <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
  );

  const content = (
    <Table $whiteSpace="nowrap" $hover={true}>
      <thead>
        <tr>
          <th>
            <FormControl
              componentclass="checkbox"
              checked={isAllSelected}
              onChange={onChange}
            />
          </th>
          <th>
            <SortHandler sortField={"name"} label={__("Name")} />
          </th>
          <th>{__("Status")}</th>
          <th>
            <SortHandler sortField={"leadData.viewCount"} label={__("Views")} />
          </th>
          <th>
            <SortHandler
              sortField={"leadData.conversionRate"}
              label={__("Conversion rate")}
            />
          </th>
          <th>
            <SortHandler
              sortField={"leadData.contactsGathered"}
              label={__("Contacts gathered")}
            />
          </th>
          <th>{__("Brand")}</th>
          <th>{__("Created by")}</th>
          <th>
            <SortHandler sortField={"createdDate"} label={__("Created at")} />
          </th>
          <th>{__("Tags")}</th>
          <th>{__("Flow type")}</th>
          <th>{__("Actions")}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Forms")}
          breadcrumb={[{ title: __("Forms") }]}
          queryParams={queryParams}
        />
      }
      leftSidebar={<Sidebar counts={counts || ({} as IntegrationsCount)} />}
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={integrations.length}
          emptyContent={
            <EmptyContent content={EMPTY_CONTENT_POPUPS} maxItemWidth="360px" />
          }
        />
      }
      hasBorder={true}
      transparent={true}
    />
  );
};

export default List;
