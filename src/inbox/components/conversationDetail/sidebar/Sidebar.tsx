import {
  AssignButton,
  AssignLabel,
  AssignSection,
  BasicInfo,
  ContactItem,
  ConversationActionSection,
  ParticipantsContainer,
  RoundedItem,
  SideBarButton,
  SideBarContainer,
  SideBarContent,
  SideBarSection,
  TabContent,
  TagButton,
  TagsContainer,
} from "./styles";
import { TabTitle, Tabs } from "@octobots/ui/src/components/tabs";
import { isEnabled, loadDynamicComponent } from "@octobots/ui/src/utils/core";

import Box from "@octobots/ui/src/components/Box";
import CompanySection from "@octobots/ui-contacts/src/companies/components/CompanySection";
import { IConversation } from "@octobots/ui-inbox/src/inbox/types";
import { ICustomer } from "@octobots/ui-contacts/src/customers/types";
import { IField } from "@octobots/ui/src/types";
import { IFieldsVisibility } from "@octobots/ui-contacts/src/customers/types";
import { IUser } from "@octobots/ui/src/auth/types";
import React from "react";
import Sidebar from "@octobots/ui/src/layout/components/Sidebar";
import WebsiteActivity from "@octobots/ui-contacts/src/customers/components/common/WebsiteActivity";
import { __ } from "coreui/utils";
import asyncComponent from "@octobots/ui/src/components/AsyncComponent";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import { FormGroup, Icon, Tags } from "@octobots/ui/src/components";
import { getDirection } from '@octobots/ui/src/utils/rtl';
import SortableList from "@octobots/ui/src/components/SortableList";
import AssignBoxPopover from "../../assignBox/AssignBoxPopover";
import Avatar from "../../../../components/common/Avatar";
import Tagger from "../../../containers/Tagger";
import { FormLabel } from "@octobots/ui/src/components/form/styles";

const ActionSection = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Sidebar-ActionSection" */ "@octobots/ui-contacts/src/customers/containers/ActionSection"
    )
);

const CustomFieldsSection = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Sidebar-CustomFieldsSection" */ "@octobots/ui-contacts/src/customers/containers/CustomFieldsSection"
    ),
  { height: "200px", width: "100%", color: "#fff" }
);

const ConversationCustomFieldsSection = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Sidebar-ConversationCustomFieldsSection" */ "../../../containers/conversationDetail/ConversationCustomFieldsSection"
    ),
  { height: "200px", width: "100%", color: "#fff" }
);

const PortableDeals = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Sidebar-PortableDeals" */ "@octobots/ui-sales/src/deals/components/PortableDeals"
    )
);

const PortableTasks = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Sidebar-PortableTasks" */ "@octobots/ui-tasks/src/tasks/components/PortableTasks"
    )
);

const PortableTickets = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Sidebar-PortableTickets" */ "@octobots/ui-tickets/src/tickets/components/PortableTickets"
    )
);
const PortablePurchases = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Sidebar-PortablePurchases" */ "@octobots/ui-purchases/src/purchases/components/PortablePurchases"
    )
);

const Contacts = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Sidebar-Contacts" */ "@octobots/ui-contacts/src/companies/components/detail/Contacts"
    )
);

const DetailInfo = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Sidebar-InfoSection" */ "@octobots/ui-contacts/src/customers/components/common/DetailInfo"
    ),
  { isBox: true }
);

const InfoSection = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Sidebar-InfoSection" */ "@octobots/ui-contacts/src/customers/components/common/InfoSection"
    ),
  { withImage: true }
);

const DevicePropertiesSection = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Sidebar-DevicePropertiesSection" */ "@octobots/ui-contacts/src/customers/components/common/DevicePropertiesSection"
    )
);

const TrackedDataSection = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Sidebar-TrackedDataSection" */ "@octobots/ui-contacts/src/customers/components/common/TrackedDataSection"
    )
);

const TaggerSection = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Sidebar-TaggerSection" */ "@octobots/ui-contacts/src/customers/components/common/TaggerSection"
    ),
  { height: "200px", width: "100%", color: "#fff" }
);

const SidebarActivity = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Sidebar-SidebarActivity" */ "../../../containers/conversationDetail/SidebarActivity"
    )
);

const ConversationDetails = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Sidebar-ConversationDetails" */ "./ConversationDetails"
    ),
  { isBox: true }
);

const Participators = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Participators" */ '@octobots/ui-inbox/src/inbox/components/conversationDetail/workarea/Participators'
    ),
  { height: '30px', width: '30px', round: true }
);

const Post = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-ConvertTo" */ '../../../containers/conversationDetail/workarea/Post'
    ),
  { height: '22px', width: '71px' }
);

const PostInstagram = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-ConvertTo" */ '../../../containers/conversationDetail/workarea/PostIg'
    ),
  { height: '22px', width: '71px' }
);

type IndexProps = {
  currentUser: IUser;
  conversation: IConversation;
  customer: ICustomer;
  customerVisibility: (key: string) => IFieldsVisibility;
  deviceVisibility: (key: string) => IFieldsVisibility;
  conversationFields: IField[];
  deviceFields: IField[];
  customerFields: IField[];
  loading: boolean;
  toggleSection: () => void;
  taggerRefetchQueries: any;
  merge?: (doc: { ids: string[]; data: ICustomer }) => void;
};

type IndexState = {
  currentTab: string;
  currentSubTab: string;
  showSideBar?: boolean;
  customerMenu: any[];
};

interface IRenderData {
  customer: ICustomer;
  fields?: IField[];
  kind: string;
  toggleSection: () => void;
}

class RightSidebar extends React.Component<IndexProps, IndexState> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: "customer",
      currentSubTab: "details",
      showSideBar: true,
      customerMenu: [
        {
          _id: "CustomFields",
        },
        {
          _id: "ConversationDetails",
        },
        {
          _id: "TaggerSection",
        },
        {
          _id: "CompanySection",
        },
        {
          _id: "Contacts",
        },
        {
          _id: "TrackedDataSection",
        },
        {
          _id: "DevicePropertiesSection",
        },
        {
          _id: "WebsiteActivity",
        },
        {
          _id: "PortableDeals",
        },
        {
          _id: "PortablePurchases",
        },
        {
          _id: "PortableTickets",
        },
        {
          _id: "PortableTasks",
        }
      ],
    };
  }

  onTabClick = (currentTab) => {
    this.setState({ currentTab });
  };

  onSubtabClick = (currentSubTab) => {
    this.setState({ currentSubTab });
  };

  renderTrackedData = ({ customer, kind, toggleSection }: IRenderData) => {
    return (
      <TrackedDataSection
        customer={customer}
        collapseCallback={toggleSection}
      />
    );
  };

  renderDeviceProperties = ({
    customer,
    kind,
    fields,
    toggleSection,
  }: IRenderData) => {
    if (!(kind === "messenger" || kind === "form")) {
      return null;
    }

    return (
      <DevicePropertiesSection
        customer={customer}
        fields={fields}
        collapseCallback={toggleSection}
        isDetail={false}
        deviceFieldsVisibility={this.props.deviceVisibility}
      />
    );
  };

  renderTabContent() {
    const {
      currentUser,
      taggerRefetchQueries,
      conversation,
      customer,
      toggleSection,
      loading,
      customerVisibility,
      deviceFields,
      conversationFields,
      customerFields,
    } = this.props;
    //const { _id } = item;

    const { kind = "" } = customer.integration || {};
    const tags = conversation.tags || [];
    const assignedUser = conversation.assignedUser;
    const participatedUsers = conversation.participatedUsers || [];
    const readUsers = conversation.readUsers || [];

    const tagTrigger = (
      <TagButton id='conversationTags'>
        {tags.length ? (
          <Tags
            tags={tags}
          />
        ) : (
          <span>{__('Add tags')}</span>
        )}
        <Icon icon='angle-down' />
      </TagButton>
    );

    const assignTrigger = (
      <AssignButton
        id='conversationAssignTrigger'
        $hasAssignee={!!assignedUser}
      >
        {assignedUser && assignedUser._id ? (
          <Avatar user={assignedUser} size={28} />
        ) : (
          <span>{__('Assign')}</span>
        )}
        <Icon icon='angle-down' />
      </AssignButton>
    );

    const renderParticipators = () => {
      if (!participatedUsers || participatedUsers.length === 0) {
        return null;
      }

      return (
        <ParticipantsContainer>
          <Participators
            participatedUsers={participatedUsers}
            limit={3}
          />
        </ParticipantsContainer>
      );
    };

    const renderReadUsers = () => {
      if (
        !['facebook-messenger', 'whatsapp', 'instagram-messenger'].includes(kind) ||
        !readUsers ||
        readUsers.length === 0 ||
        participatedUsers.length > 0
      ) {
        return null;
      }

      return (
        <ParticipantsContainer>
          <Participators
            participatedUsers={readUsers}
            limit={3}
          />
        </ParticipantsContainer>
      );
    };

    const renderDynamicComponents = (): JSX.Element[] => {
      const components: JSX.Element[] = [];

      // Add dynamic components
      const dynamicComponent = loadDynamicComponent('inboxConversationDetailActionBar', {
        conversation: conversation,
      });

      if (dynamicComponent) {
        components.push(dynamicComponent);
      }

      // Add Facebook Post component
      if (kind === 'facebook-post') {
        components.push(<Post key="facebook-post" conversation={conversation} />);
      }

      // Add Instagram Post component
      if (kind === 'instagram-post') {
        components.push(<PostInstagram key="instagram-post" conversation={conversation} />);
      }

      return components;
    };

    // switch (_id) {
    //   case "CustomFields":
    //     return (
    //       <RoundedItem>
    //         <CustomFieldsSection
    //           loading={loading}
    //           customer={customer}
    //           isDetail={false}
    //           collapseCallback={toggleSection}
    //         />
    //       </RoundedItem>
    //     );
    //   case "ConversationDetails":
    //     return (
    //       <RoundedItem>
    //         <Box
    //           title={__("Conversation details")}
    //           name="showConversationDetails"
    //           callback={toggleSection}
    //         >
    //           <ConversationDetails
    //             conversation={conversation}
    //             fields={conversationFields}
    //           />
    //           <ConversationCustomFieldsSection conversation={conversation} />
    //         </Box>
    //       </RoundedItem>
    //     );
    //   case "TaggerSection":
    //     return (
    //       <RoundedItem>
    //         <TaggerSection
    //           data={customer}
    //           type="core:customer"
    //           refetchQueries={taggerRefetchQueries}
    //           collapseCallback={toggleSection}
    //         />
    //       </RoundedItem>
    //     );
    //   case "CompanySection":
    //     return (
    //       <RoundedItem>
    //         <CompanySection
    //           mainType="customer"
    //           mainTypeId={customer._id}
    //           collapseCallback={toggleSection}
    //         />
    //       </RoundedItem>
    //     );
    //   case "Contacts":
    //     return (
    //       <RoundedItem>
    //         <Contacts
    //           companies={customer.companies}
    //           customerId={customer._id}
    //           collapseCallback={toggleSection}
    //         />
    //       </RoundedItem>
    //     );
    //   case "TrackedDataSection":
    //     return this.renderTrackedData({ customer, kind, toggleSection });
    //   case "DevicePropertiesSection":
    //     return this.renderDeviceProperties({
    //       customer,
    //       kind,
    //       fields: deviceFields,
    //       toggleSection,
    //     });
    //   case "WebsiteActivity":
    //     return (
    //       <RoundedItem>
    //         <WebsiteActivity urlVisits={customer.urlVisits || []} />
    //       </RoundedItem>
    //     );
    //   // case "PortableDeals":
    //   //   return (
    //   //     <PortableDeals
    //   //       mainType="customer"
    //   //       mainTypeId={customer._id}
    //   //     />
    //   //   );
    //   // case "PortablePurchases":
    //   //   return (
    //   //     <PortablePurchases
    //   //       mainType="customer"
    //   //       mainTypeId={customer._id}
    //   //     />
    //   //   );
    //   // case "PortableTickets":
    //   //   return (
    //   //     <PortableTickets
    //   //       mainType="customer"
    //   //       mainTypeId={customer._id}
    //   //     />
    //   //   );
    //   // case "PortableTasks":
    //   //   return (
    //   //     <PortableTasks
    //   //       mainType="customer"
    //   //       mainTypeId={customer._id}
    //   //     />
    //   //   );
    //   default:
    //     return null;
    // }

    return (
      <>
        <RoundedItem>
          <Box
            title={__("Conversation Actions")}
            name="showConversationActions"
            callback={toggleSection}
          >
            <ConversationActionSection>
              <AssignSection>
                <AssignLabel>{__('Assign to')}:</AssignLabel>
                <AssignBoxPopover
                  targets={[conversation]}
                  trigger={assignTrigger}
                />
              </AssignSection>

              {/* {renderParticipators()}
              {renderReadUsers()}
              {renderDynamicComponents()} */}
            </ConversationActionSection>

            <ConversationActionSection>
              <FormGroup>
                <FormLabel>
                  {__("Conversation Tags")}
                </FormLabel>
                <TagsContainer>
                  <Tagger
                    targets={[conversation]}
                    trigger={tagTrigger}
                  />
                </TagsContainer>
              </FormGroup>
            </ConversationActionSection>
          </Box>
        </RoundedItem>

        <RoundedItem>
          <Box
            title={__("Conversation details")}
            name="showConversationDetails"
            callback={toggleSection}
          >
            <ConversationDetails
              conversation={conversation}
              fields={conversationFields}
            />
            <ConversationCustomFieldsSection conversation={conversation} />
          </Box>
        </RoundedItem>
        <RoundedItem>
          <TaggerSection
            data={customer}
            type="core:customer"
            refetchQueries={taggerRefetchQueries}
            collapseCallback={toggleSection}
          />
        </RoundedItem>

        <RoundedItem>
          <CompanySection
            mainType="customer"
            mainTypeId={customer._id}
            collapseCallback={toggleSection}
          />
        </RoundedItem>
        <RoundedItem>
          <Contacts companies={customer.companies} customerId={customer._id} />
        </RoundedItem>

        <RoundedItem>
          <CustomFieldsSection
            loading={loading}
            customer={customer}
            isDetail={false}
            collapseCallback={toggleSection}
          />
        </RoundedItem>

        <RoundedItem>
          {this.renderTrackedData({ customer, kind, toggleSection })}
        </RoundedItem>

        {this.renderDeviceProperties({
          customer,
          kind,
          fields: deviceFields,
          toggleSection,
        })}

        <RoundedItem>
          <WebsiteActivity urlVisits={customer.urlVisits || []} />
        </RoundedItem>


        {isEnabled("sales") && (
          <RoundedItem>
            <PortableDeals mainType="customer" mainTypeId={customer._id} />
          </RoundedItem>
        )}

        {isEnabled("purchases") && (
          <RoundedItem>
            <PortablePurchases mainType="customer" mainTypeId={customer._id} />
          </RoundedItem>
        )}

        {isEnabled("tickets") && (
          <RoundedItem>
            <PortableTickets mainType="customer" mainTypeId={customer._id} />
          </RoundedItem>
        )}

        {isEnabled("tasks") && (
          <RoundedItem>
            <PortableTasks mainType="customer" mainTypeId={customer._id} />
          </RoundedItem>
        )}

        {loadDynamicComponent("conversationDetailSidebar", {
          conversation,
          customer,
          customerId: customer._id,
          contentType: "inbox:conversations",
          contentTypeId: conversation._id,
        })}
      </>
    );

    //     <SidebarActivity
    //       currentUser={currentUser}
    //       customer={customer}
    //       currentSubTab={currentSubTab}
    //     />

  }

  renderMenuItem = (props: { _id: string }) => {
    const { _id } = props;

    return (
      <div key={_id}>
        {this.renderTabContent(props)}
      </div>
    );
  };

  renderContents = () => {
    const onChangeFields = (menu) => {
      this.setState({ ...this.state, customerMenu: menu });
    };

    return (
      <div>
        <SortableList
          fields={this.state.customerMenu}
          child={this.renderMenuItem}
          onChangeFields={onChangeFields}
          showDragHandler={false}
          droppableId="property option fields"
          emptyMessage={"empty"}
        />
      </div>
    );
  };

  renderContent() {
    const { customer, customerFields, customerVisibility, toggleSection } = this.props;
    console.log("🚀 ~ RightSidebar ~ renderContent ~ customerFields:", customerFields)

    return (
      <>
        <InfoSection customer={customer} hideForm={true} noPhone={true} />
        <ContactItem>
          <Icon icon="phone-alt" />
          <span>{(customer.primaryPhone) ? customer.primaryPhone : __("Not available")}</span>
        </ContactItem>
        <ContactItem>
          <Icon icon="envelope-alt" />
          <span>{(customer.primaryEmail) ? customer.primaryEmail : __("Not available")}</span>
        </ContactItem>
        <ActionSection customer={customer} />

        {(customerFields && customerFields.length > 0) &&
          <RoundedItem>
            <Box
              title={__("Details info")}
              name="showDetailsInfo"
              callback={toggleSection}
            >
              <DetailInfo
                customer={customer}
                fieldsVisibility={customerVisibility}
                fields={customerFields}
                isDetail={false}
              />
            </Box>
          </RoundedItem>}
        {this.renderTabContent()}
      </>
    );
  }

  render() {
    const { showSideBar } = this.state;
    const direction = getDirection();

    return (
      <SideBarContainer style={{ overflowY: "auto" }}>
        <SideBarButton
          type="button"
          isRTL={direction === "rtl"}
          onClick={() =>
            this.setState({ showSideBar: !this.state.showSideBar })
          }
          showSideBar={showSideBar}
        >
          {showSideBar ? (
            <Icon icon={direction === "rtl" ? "leftarrow-3" : "chevron"} size={16} color="#1F97FF" />
          ) : (
            <Icon icon={direction === "rtl" ? "chevron" : "leftarrow-3"} size={16} color="#1F97FF" />
          )}
        </SideBarButton>
        <SideBarContent showSideBar={showSideBar}>
          <SideBarSection>
            {this.renderContent()}
          </SideBarSection>
        </SideBarContent>
      </SideBarContainer>
    );
  }
}

export default RightSidebar;
