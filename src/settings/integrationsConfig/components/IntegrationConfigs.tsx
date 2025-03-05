import { ContentBox, Title, FlexRow, GridBox } from "@octobots/ui-settings/src/styles";
import { __, loadDynamicComponent } from "@octobots/ui/src/utils/core";

import Button from "@octobots/ui/src/components/Button";
import CollapseContent from "@octobots/ui/src/components/CollapseContent";
import ControlLabel from "@octobots/ui/src/components/form/Label";
import { FormControl } from "@octobots/ui/src/components/form";
import FormGroup from "@octobots/ui/src/components/form/Group";
import { IConfigsMap } from "@octobots/ui-settings/src/general/types";
import Icon from "@octobots/ui/src/components/Icon";
import Info from "@octobots/ui/src/components/Info";
import { KEY_LABELS } from "@octobots/ui-settings/src/general/constants";
import React from "react";
import Wrapper from "@octobots/ui/src/layout/components/Wrapper";
import { FlexColumnCustom } from "../../../../../plugin-timeclock-ui/src/styles";


type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

type State = {
  configsMap: IConfigsMap;
};

class IntegrationConfigs extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      configsMap: props.configsMap,
    };
  }

  save = (e) => {
    e.preventDefault();

    const { configsMap } = this.state;

    this.props.save(configsMap);
  };

  onChangeConfig = (code: string, value) => {
    const { configsMap } = this.state;

    configsMap[code] = value;

    this.setState({ configsMap });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  renderItem = (
    key: string,
    type?: string,
    description?: string,
    defaultValue?: string,
    label?: string
  ) => {
    const { configsMap } = this.state;

    return (
      <FormGroup  >
        <ControlLabel>{label || KEY_LABELS[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          type={type || "text"}
          defaultValue={configsMap[key] || defaultValue}
          onChange={this.onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  renderContent = () => {
    const { configsMap } = this.state;

    return (
      <ContentBox id={"IntegrationSettingsMenu"}>
        <CollapseContent
          beforeTitle={<img src="/images/twitter-black.svg" />}
          transparent={true}
          title="Twitter"
        >
          <Info>
            <a
              target="_blank"
              href="https://docs.octobots.ai/docs/user-guide/xos/system-configuration#twitter"
              rel="noopener noreferrer"
            >
              {__("Learn how to set Twitter Integration Variables")}
            </a>
          </Info>
          {/* <FlexRow> */}

          <GridBox $gap="20px" $columns="1fr 1fr 1fr">
            {this.renderItem("TWITTER_CONSUMER_KEY")}
            {this.renderItem("TWITTER_CONSUMER_SECRET")}
            {this.renderItem("TWITTER_ACCESS_TOKEN")}
            {this.renderItem("TWITTER_ACCESS_TOKEN_SECRET")}
            {this.renderItem("TWITTER_WEBHOOK_ENV")}
          </GridBox>


        </CollapseContent>

        <CollapseContent
          beforeTitle={<img src="/images/database-black.svg" />}
          transparent={true}
          title="Nylas"
        >
          <Info>
            <a
              target="_blank"
               href="https://docs.octobots.ai/docs/user-guide/xos/system-configuration#nylas-integrations"
              rel="noopener noreferrer"
            >
              {__("Learn how to set Nylas Integration")}
            </a>
          </Info>
          <GridBox $gap="20px" $columns="1fr 1fr 1fr">
            {this.renderItem("NYLAS_CLIENT_ID")}
            {this.renderItem("NYLAS_CLIENT_SECRET")}

            {this.renderItem(
              "NYLAS_WEBHOOK_CALLBACK_URL",
              "https://yourdomain/nylas/webhook"
            )}
            {this.renderItem("MICROSOFT_CLIENT_ID")}

            {this.renderItem("MICROSOFT_CLIENT_SECRET")}
          </GridBox>
        </CollapseContent>

        <CollapseContent
          beforeTitle={<img src="/images/video-call-black.svg" />}
          transparent={true}
          title="Video call"
        >
          <Info>
            <a
              target="_blank"
                href="https://docs.octobots.ai/docs/user-guide/xos/system-configuration#video-calls"
              rel="noopener noreferrer"
            >
              {__("Learn more about Video call configuration")}
            </a>
          </Info>
          <FormGroup>
            <ControlLabel>Video call type</ControlLabel>
            <FormControl
              name="VIDEO_CALL_TYPE"
              defaultValue={configsMap.VIDEO_CALL_TYPE}
              componentclass="select"
              options={[
                { value: "", label: "" },
                { value: "daily", label: "Daily" },
              ]}
              onChange={this.onChangeInput.bind(this, "VIDEO_CALL_TYPE")}
            />
          </FormGroup>
          <GridBox $gap="20px" $columns="1fr 1fr 1fr">
            {this.renderItem("DAILY_API_KEY")}
            {this.renderItem("DAILY_END_POINT")}
            {this.renderItem("VIDEO_CALL_TIME_DELAY_BETWEEN_REQUESTS", "number")}
            {this.renderItem("VIDEO_CALL_MESSAGE_FOR_TIME_DELAY")}
          </GridBox>
        </CollapseContent>

        <CollapseContent
          beforeTitle={<img src="/images/sunshine-black.svg" />}
          transparent={true}
          title="Sunshine Conversations API"
        >
          <Info>
            <a
              target="_blank"
               href="https://docs.octobots.ai/docs/user-guide/xos/system-configuration#sunshine-conversations-api-integration"
              rel="noopener noreferrer"
            >
              {__("Learn how to set Smooch Integration Variables")}
            </a>
          </Info>
          <GridBox $gap="20px" $columns="1fr 1fr 1fr">
            {this.renderItem("SMOOCH_APP_ID")}
            {this.renderItem("SMOOCH_APP_KEY_ID")}
            {this.renderItem("SMOOCH_APP_KEY_SECRET")}
            {this.renderItem(
              "SMOOCH_WEBHOOK_CALLBACK_URL",
              "",
              "https://yourdomain/smooch/webhook"
            )}
          </GridBox>
        </CollapseContent>

        <CollapseContent
          beforeTitle={<img src="/images/whatsapp-black.svg" 
            style={{ marginRight: "8px" }}
/>}
          transparent={true}
          title="WhatsApp Chat-API"
        >
          <Info>
            <a
              target="_blank"
              href="https://docs.octobots.ai/docs/user-guide/xos/system-configuration#whatsapp-integration"
              rel="noopener noreferrer"
            >
              {__("Learn how to set WhatsApp Integration Variables")}
            </a>
          </Info>
          <GridBox $gap="20px" $columns="1fr 1fr 1fr">
            {this.renderItem("CHAT_API_UID")}
            {this.renderItem("CHAT_API_WEBHOOK_CALLBACK_URL")}
          </GridBox>
        </CollapseContent>

        <CollapseContent
          beforeTitle={<img src="/images/sms-black.svg" />}
          transparent={true}
          title="Telnyx SMS"
        >
          <GridBox $gap="20px" $columns="1fr 1fr 1fr">
            {this.renderItem("TELNYX_API_KEY")}
          </GridBox>
        </CollapseContent>

        {loadDynamicComponent(
          "inboxIntegrationSettings",
          {
            renderItem: this.renderItem,
          },
          true
        )}
      </ContentBox>
    );
  };

  render() {
    const actionButtons = (
      <Button btnStyle="warning" onClick={this.save} icon="check-circle">
        Save
      </Button>
    );

    const breadcrumb = [
      { title: __("Settings"), link: "/settings" },
      { title: __("Integrations config") },
    ];

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__("Integrations config")}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__("Integrations config")}</Title>}
            right={actionButtons}
          />
        }
        content={this.renderContent()}
        hasBorder={false}
      />
    );
  }
}

export default IntegrationConfigs;
