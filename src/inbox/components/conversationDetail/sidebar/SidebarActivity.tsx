import { ActivityLogContent, NoteFormContainer } from "./styles";

import ActivityList from "@octobots/ui-log/src/activityLogs/components/ActivityList";
import DataWithLoader from "@octobots/ui/src/components/DataWithLoader";
import { ICustomer } from "@octobots/ui-contacts/src/customers/types";
import { IUser } from "@octobots/ui/src/auth/types";
import NoteForm from "@octobots/ui-internalnotes/src/containers/Form";
import React from "react";
import { __ } from "coreui/utils";
import { hasAnyActivity } from "@octobots/ui-inbox/src/inbox/utils";

type Props = {
  customer: ICustomer;
  loadingLogs: boolean;
  activityLogsCustomer: any[];
  currentSubTab: string;
  currentUser: IUser;
};

class SidebarActivity extends React.Component<Props> {
  render() {
    const {
      customer,
      activityLogsCustomer,
      loadingLogs,
      currentUser,
      currentSubTab
    } = this.props;

    const hasActivity = hasAnyActivity(activityLogsCustomer);

    return (
      <>
        <NoteFormContainer>
          <span>{__("Add a note") as string}:</span>
          <NoteForm contentType="core:customer" contentTypeId={customer._id} />
        </NoteFormContainer>

        <ActivityLogContent isEmpty={!hasActivity}>
          <DataWithLoader
            loading={loadingLogs}
            count={!loadingLogs && hasActivity ? 1 : 0}
            data={
              <ActivityList
                user={currentUser}
                activities={activityLogsCustomer}
                target={customer.firstName}
                type={currentSubTab} // show logs filtered by type
              />
            }
            emptyText="No Activities"
            emptyImage="/images/actions/19.svg"
          />
        </ActivityLogContent>
      </>
    );
  }
}

export default SidebarActivity;
