import { IButtonMutateProps, IFormProps } from "@octobots/ui/src/types";

import Button from "@octobots/ui/src/components/Button";
import ControlLabel from "@octobots/ui/src/components/form/Label";
import Form from "@octobots/ui/src/components/form/Form";
import FormControl from "@octobots/ui/src/components/form/Control";
import FormGroup from "@octobots/ui/src/components/form/Group";
import { ModalFooter } from "@octobots/ui/src/styles/main";
import Select from "react-select";
import React from "react";
import { WEBHOOK_ACTIONS } from "@octobots/ui-settings/src/constants";
import { __ } from "@octobots/ui/src/utils/core";
import { FlexBetween } from "@octobots/ui-settings/src/styles";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  callback: () => void;
};

type State = {
  selectedActions: any[];
};

class OutgoingWebhookForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const webhook = props.object || {};

    let webhookActions = [] as any;

    if (webhook.actions) {
      webhookActions =
        webhook.actions.map((item) => {
          return { label: item.label, value: item.label };
        }) || [];
    }

    const selectedActions = webhookActions;

    this.state = {
      selectedActions,
    };
  }

  select = <T extends keyof State>(name: T, value) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  onChange = (e) => {
    const index = (e.currentTarget as HTMLInputElement).value;
    const isChecked = (e.currentTarget as HTMLInputElement).checked;

    const selected = this.state.selectedActions[index];
    const selectedActions = this.state.selectedActions;

    selectedActions[index] = {
      type: selected.type,
      action: selected.action,
      label: selected.label,
      checked: isChecked,
    };

    this.setState({ selectedActions });
  };

  collectValues = (selectedActions) =>
    selectedActions.map(
      (selectedAction) =>
        WEBHOOK_ACTIONS.find(
          (action) => action.label === selectedAction.label
        ) || {}
    );

  generateDoc = (values: { _id?: string; url: string }) => {
    const { selectedActions } = this.state;

    return {
      url: values.url,
      actions: this.collectValues(selectedActions),
    };
  };

  generateActions = () => {
    return WEBHOOK_ACTIONS.map((action) => {
      return { label: action.label, value: action.label };
    });
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, callback } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Endpoint url</ControlLabel>
          <FormControl
            {...formProps}
            name="url"
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Actions</ControlLabel>
          <Select
            placeholder={__("Choose actions")}
            options={this.generateActions()}
            value={this.generateActions().filter((o) =>
              this.state.selectedActions.includes(o.value)
            )}
            onChange={this.select.bind(this, "selectedActions")}
            isMulti={true}
          />
        </FormGroup>

        <ModalFooter>
        <FlexBetween style={{
            justifyContent:'flex-end'
          }}>
          <Button
            btnStyle="simple"
            type="button"
            onClick={callback}
            icon="times-circle"
            uppercase={false}
          >
            Cancel
          </Button>
          {renderButton({
            name: "integration",
            values: this.generateDoc(values),
            isSubmitted,
            callback,
          })}
            </FlexBetween>
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default OutgoingWebhookForm;
