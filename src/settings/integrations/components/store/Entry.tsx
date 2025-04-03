import {
  Box,
  IntegrationItem,
  Ribbon,
  Type,
} from "@octobots/ui-inbox/src/settings/integrations/components/store/styles";

import Icon from "@octobots/ui/src/components/Icon";
import IntegrationForm from "../../containers/common/IntegrationForm";
import { Link } from "react-router-dom";
import ModalTrigger from "@octobots/ui/src/components/ModalTrigger";
import React from "react";
import { __ } from "coreui/utils";
import { formatText } from "@octobots/ui-log/src/activityLogs/utils";

type TotalCount = {
  messenger: number;
  form: number;
  facebook: number;
  instagram: number;
  callpro: number;
  chatfuel: number;
  gmail: number;
  imap: number;
  office365: number;
  outlook: number;
  yahoo: number;
  line: number;
  telegram: number;
  viber: number;
  calls: number;
  twilio: number;
  whatsapp: number;
  exchange: number;
  telnyx: number;
};

type Props = {
  integration: any;
  getClassName: (selectedKind: string) => string;
  toggleBox: (kind: string) => void;
  customLink?: (kind: string, addLink: string) => void;
  queryParams: any;
  totalCount: TotalCount;
};

function getCount(kind: string, totalCount: TotalCount) {
  const countByKind = totalCount[kind];

  if (typeof countByKind === "undefined") {
    return null;
  }

  return <span>({countByKind})</span>;
}

function renderType(type: string) {
  if (!type) {
    return null;
  }

  return (
    <Type>
      <Icon icon="comment-alt-lines" /> {__("Works with messenger")}
    </Type>
  );
}

function renderCreate(createUrl, kind, isAvailable) {
  if ((!createUrl && !kind) || !isAvailable) {
    return null;
  }
  const Styleobj = { backgroundColor:'#f1b500',color:'#000',padding:'5px 20px',borderRadius:'6px',fontWeight:'600'}

  const trigger = <button style={{...Styleobj, position:'static',fontSize:"13px"}}><Icon icon="plus-circle" /> {" "} {__("Add")}</button>;

  if (createUrl && kind && isAvailable) {
    return <Link style={Styleobj} to={`${createUrl}?kind=${kind}`}><Icon icon="plus-circle" /> {" "}{__("Add")}</Link>;
  }

  if ((createUrl || "").includes("create")) {
    return <Link style={Styleobj} to={createUrl}><Icon icon="plus-circle" /> {" "}{__("Add")}</Link>;
  }

  const formContent = (props) => <IntegrationForm {...props} type={kind} />;

  return (
    <ModalTrigger
      title={`Add ${formatText(kind)}`}
      trigger={trigger}
      content={formContent}
    />
  );
}

function Entry({ integration, getClassName, toggleBox, totalCount }: Props) {
  // function Entry({ integration, getClassName, totalCount }: Props) {
    const { kind, isAvailable, createUrl } = integration;
  const styleObj = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeft: 'none',
    borderRight: 'none',
    padding: '15px',
    flexWrap: 'wrap', // Allow wrapping on smaller screens
  };

  return (
    <IntegrationItem style={{ width: "100%", position: 'relative' }} key={integration.name} className={getClassName(kind)}>
      <Box
        style={styleObj}
        onClick={() => toggleBox(kind)}
        $isInMessenger={integration.inMessenger}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1 }}>
          <img alt="logo" src={integration.logo} style={{ width: '40px', height: '40px' }} />
          <h5 style={{ margin: 0 }}>
          {/* {integration.name} {getCount(kind, totalCount)} */}
          {integration.name}
          </h5>
        </div>
        <div style={{ flex: 2, margin: '10px 0' }}>
          <p style={{ margin: 0 }}>
            {__(integration.description)}
            {renderType(integration.inMessenger)}
          </p>
          {!isAvailable && (
            <Ribbon>
              <span>{__("Coming soon")}</span>
            </Ribbon>
          )}
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          {renderCreate(createUrl, kind, isAvailable)}
        </div>
      </Box>
    </IntegrationItem>
  );
}

export default Entry;
