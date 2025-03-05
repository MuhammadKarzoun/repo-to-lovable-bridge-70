import { InboxManagementActionConsumer } from "./InboxCore";
import React from "react";
import { TAG_TYPES } from "@octobots/ui-tags/src/constants";
import TaggerPopover from "@octobots/ui-tags/src/components/TaggerPopover";
import { isEnabled } from "@octobots/ui/src/utils/core";
import { refetchSidebarConversationsOptions } from "@octobots/ui-inbox/src/inbox/utils";

const Tagger = props => {
  const { refetchQueries } = refetchSidebarConversationsOptions();

  return (
    <InboxManagementActionConsumer>
      {({ notifyConsumersOfManagementAction }) => (
        <TaggerPopover
          {...props}
          perPage={400}
          type={TAG_TYPES.CONVERSATION}
          refetchQueries={refetchQueries}
          successCallback={notifyConsumersOfManagementAction}
        />
      )}
    </InboxManagementActionConsumer>
  );
};

export default Tagger;
