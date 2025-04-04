import {
  AdditionalSidebar,
  DropdownWrapper,
  LeftContent,
  RightItems,
  ScrollContent,
  SidebarActions,
  ToggleButton,
  SidebarContainer,
  SidebarNav,
  LogoContainer,
  NavItem,
  NavBadge,
  SidebarContent,
  SidebarHeader,
  SidebarTitle,
  SearchInput,
} from "./styles";

import { CONVERSATION_STATUSES } from "../../constants";
import FilterToggler from "../../containers/leftSidebar/FilterToggler";
import { IConversation } from "@octobots/ui-inbox/src/inbox/types";
import { IUser } from "@octobots/ui/src/auth/types";
import Icon from "@octobots/ui/src/components/Icon";
import { InboxManagementActionConsumer } from "../../containers/InboxCore";
import React, { useState } from "react";
import Resolver from "../../containers/Resolver";
import Sidebar from "@octobots/ui/src/layout/components/Sidebar";
import { TAG_TYPES } from "@octobots/ui-tags/src/constants";
import Tagger from "../../containers/Tagger";
import { __ } from "coreui/utils";
import asyncComponent from "@octobots/ui/src/components/AsyncComponent";
import { isEnabled } from "@octobots/ui/src/utils/core";
import { queries } from "@octobots/ui-inbox/src/inbox/graphql";
import styled from "styled-components";
import { modernColors, borderRadius, spacing, typography } from "../../../styles/theme";
import ModernButton from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";
import FilterBar from "../filters/FilterBar";
import TabFilter from "../filters/TabFilter";

const DateFilter = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-DateFilter" */ "@octobots/ui/src/components/DateFilter"
    ),
  { height: "15px", width: "70px" }
);

const AssignBoxPopover = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-AssignBoxPopover" */ "../assignBox/AssignBoxPopover"
    )
);

const ConversationList = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-ConversationList" */ "../../containers/leftSidebar/ConversationList"
    )
);

const FilterList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Inbox-FilterList" */ "../../containers/leftSidebar/FilterList"
    )
);

const SidebarHeaderStyled = styled.div`
  padding: ${spacing.md} ${spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${modernColors.border};
`;

type Props = {
  currentUser: IUser;
  history: any;
  currentConversationId?: string;
  queryParams: any;
  bulk: IConversation[];
  toggleBulk: (target: IConversation[], toggleAdd: boolean) => void;
  emptyBulk: () => void;
  config: { [key: string]: boolean };
  toggleSidebar: (params: { isOpen: boolean }) => void;
  resolveAll: () => void;
};

const LeftSidebar: React.FC<Props> = props => {
  const { currentUser, currentConversationId, queryParams, bulk, toggleBulk } = props;

  const [isOpen, setIsOpen] = useState<boolean>(
    props.config?.showAddition || false
  );
  const [counts, setItemCounts] = useState<any>({});
  const [searchValue, setSearchValue] = useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    // Here you would typically implement search functionality
  };

  const renderTrigger = (text: string) => {
    return (
      <ModernButton variant="ghost" size="sm">
        {__(text)} <Icon icon="angle-down" />
      </ModernButton>
    );
  };

  const onToggleSidebar = () => {
    const { toggleSidebar } = props;

    setIsOpen(!isOpen);
    toggleSidebar({ isOpen: !isOpen });
  };

  const renderSidebarActions = () => {
    const { queryParams, bulk, emptyBulk } = props;

    if (bulk.length > 0) {
      return (
        <SidebarHeaderStyled>
          <Resolver conversations={bulk} emptyBulk={emptyBulk} />
          <RightItems>
            <AssignBoxPopover
              targets={bulk}
              trigger={renderTrigger("Assign")}
            />

            <Tagger targets={bulk} trigger={renderTrigger("Tag")} />
          </RightItems>
        </SidebarHeaderStyled>
      );
    }

    return (
      <SidebarHeaderStyled>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          {/* <ToggleButton
            id="btn-inbox-channel-visible"
            $isActive={isOpen}
            onClick={onToggleSidebar}
          >
            <Icon icon="subject" />
          </ToggleButton> */}
          {queryParams.status !== CONVERSATION_STATUSES.CLOSED && (
            <ModernButton
              size="sm"
              variant="ghost"
              onClick={props.resolveAll}
            >
              {__('Resolve all')}
            </ModernButton>
          )}
        </div>
      </SidebarHeaderStyled>
    );
  };

  const renderSidebarHeader = () => {
    return <SidebarActions>{renderSidebarActions()}</SidebarActions>;
  };

  const renderSidebarSearchBox = () => {
    return (
    <SearchInput>
      <Icon icon="search" />
      <input
        type="text"
        placeholder="Search conversations..."
        value={searchValue}
        onChange={handleSearchChange}
      />
    </SearchInput>
    )
  };

  // #TODO remove this code or use later @MK
  // const renderAdditionalSidebar = (refetchRequired: string) => {
  //   const { queryParams, currentUser } = props;

  //   if (!currentUser) {
  //     return null;
  //   }

  //   const setCounts = (counts: any) => {
  //     const current = { ...counts };

  //     setItemCounts({ ...current, ...counts });
  //   };

  //   return (
  //     <AdditionalSidebar style={{ display: isOpen ? 'block' : 'none' }}>
  //       <SidebarContent>
  //         <ScrollContent>
  //           <FilterToggler
  //             groupText="Channels"
  //             toggleName="showChannels"
  //             manageUrl="/settings/channels"
  //             isOpen={props.config?.showChannels || false}
  //             toggle={({ isOpen }) => props.toggleSidebar({ isOpen })}
  //           >
  //             <FilterList
  //               query={{
  //                 queryName: "channelsByMembers",
  //                 variables: { memberIds: [currentUser._id] },
  //                 dataName: "channelsByMembers"
  //               }}
  //               counts="byChannels"
  //               paramKey="channelId"
  //               queryParams={queryParams}
  //               refetchRequired={refetchRequired}
  //               setCounts={setCounts}
  //             />
  //           </FilterToggler>

  //           {
  //             <FilterToggler
  //               groupText="Segments"
  //               toggleName="showSegments"
  //               manageUrl="/segments?contentType=inbox:conversation"
  //               isOpen={props.config?.showSegments || false}
  //               toggle={({ isOpen }) => props.toggleSidebar({ isOpen })}
  //             >
  //               <FilterList
  //                 query={{
  //                   queryName: "segmentList",
  //                   dataName: "segments",
  //                   variables: {
  //                     contentTypes: [TAG_TYPES.CONVERSATION]
  //                   }
  //                 }}
  //                 queryParams={queryParams}
  //                 counts="bySegment"
  //                 paramKey="segment"
  //                 icon="tag-alt"
  //                 refetchRequired={refetchRequired}
  //                 treeView={true}
  //                 setCounts={setCounts}
  //               />
  //             </FilterToggler>
  //           }

  //           <FilterToggler
  //             groupText="Brands"
  //             toggleName="showBrands"
  //             manageUrl="/settings/brands"
  //             isOpen={props.config?.showBrands || false}
  //             toggle={({ isOpen }) => props.toggleSidebar({ isOpen })}
  //           >
  //             <FilterList
  //               query={{ queryName: "allBrands", dataName: "allBrands" }}
  //               counts="byBrands"
  //               queryParams={queryParams}
  //               paramKey="brandId"
  //               refetchRequired={refetchRequired}
  //               setCounts={setCounts}
  //             />
  //           </FilterToggler>

  //           <FilterToggler
  //             groupText="Integrations"
  //             toggleName="showIntegrations"
  //             manageUrl="/settings/integrations"
  //             isOpen={props.config?.showIntegrations || false}
  //             toggle={({ isOpen }) => props.toggleSidebar({ isOpen })}
  //           >
  //             <FilterList
  //               query={{
  //                 queryName: "integrations",
  //                 dataName: "integrations"
  //               }}
  //               queryParams={queryParams}
  //               counts="byIntegration"
  //               paramKey="integration"
  //               refetchRequired={refetchRequired}
  //               setCounts={setCounts}
  //             />
  //           </FilterToggler>

  //           <FilterToggler
  //             groupText="Tags"
  //             toggleName="showTags"
  //             manageUrl="/settings/tags/inbox:conversation"
  //             isOpen={props.config?.showTags || false}
  //             toggle={({ isOpen }) => props.toggleSidebar({ isOpen })}
  //           >
  //             <FilterList
  //               query={{
  //                 queryName: "tagList",
  //                 dataName: "tags",
  //                 variables: {
  //                   type: TAG_TYPES.CONVERSATION,
  //                   perPage: 100
  //                 }
  //               }}
  //               queryParams={queryParams}
  //               counts="byTags"
  //               paramKey="tag"
  //               icon="tag-alt"
  //               refetchRequired={refetchRequired}
  //               multiple={true}
  //               treeView={true}
  //               setCounts={setCounts}
  //             />
  //           </FilterToggler>
  //         </ScrollContent>
  //       </SidebarContent>
  //     </AdditionalSidebar>
  //   );
  // };

  return (
    <SidebarContainer>
      <LeftContent $isOpen={isOpen}>
        {/* #TODO: reuse the additional sidebar or remove it and it's relevant code @MK */}
        {/* <InboxManagementActionConsumer>
          {({ refetchRequired }) => (
            <>
              {renderAdditionalSidebar(refetchRequired)}
            </>
          )}
        </InboxManagementActionConsumer> */}

        <SidebarContent>
          {/* {renderSidebarHeader()} */}
          {renderSidebarSearchBox()}



          <InboxManagementActionConsumer>
            {({ refetchRequired }) => (
              <FilterBar
                queryParams={queryParams}
                currentUser={currentUser}
                refetchRequired={refetchRequired}
              />
            )}
          </InboxManagementActionConsumer>

          <TabFilter queryParams={queryParams} currentUser={currentUser} counts={counts} />

          <ConversationList
            currentUser={currentUser}
            currentConversationId={currentConversationId}
            queryParams={queryParams}
            toggleRowCheckbox={toggleBulk}
            selectedConversations={bulk}
            counts={counts}
            location={props.history.location}
            navigate={props.history.navigate}
          />
        </SidebarContent>
      </LeftContent>
    </SidebarContainer>
  );
};

export default LeftSidebar;