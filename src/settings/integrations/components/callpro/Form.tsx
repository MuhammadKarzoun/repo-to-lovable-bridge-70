import { IButtonMutateProps, IFormProps } from '@octobots/ui/src/types';

import Button from '@octobots/ui/src/components/Button';
import ControlLabel from '@octobots/ui/src/components/form/Label';
import Form from '@octobots/ui/src/components/form/Form';
import FormControl from '@octobots/ui/src/components/form/Control';
import FormGroup from '@octobots/ui/src/components/form/Group';
import { ModalFooter } from '@octobots/ui/src/styles/main';
import React from 'react';
import SelectBrand from '@octobots/ui-inbox/src/settings/integrations/containers/SelectBrand';
import SelectChannels from '@octobots/ui-inbox/src/settings/integrations/containers/SelectChannels';
import { __ } from 'coreui/utils';
import { FlexBetween } from '@octobots/ui-settings/src/styles';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  callback: () => void;
  onChannelChange: () => void;
  channelIds: string[];
};

class CallPro extends React.Component<Props> {
  generateDoc = (values: {
    name: string;
    phoneNumber: string;
    recordUrl: string;
    brandId: string;
  }) => {
    return {
      name: `${values.name} - ${values.phoneNumber}`,
      brandId: values.brandId,
      kind: 'callpro',
      data: {
        recordUrl: values.recordUrl,
        phoneNumber: values.phoneNumber
      }
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, callback, onChannelChange, channelIds } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Phone number</ControlLabel>
          <FormControl
            {...formProps}
            type="number"
            name="phoneNumber"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Record url</ControlLabel>
          <FormControl {...formProps} type="text" name="recordUrl" />
        </FormGroup>

        <SelectBrand
          isRequired={true}
          formProps={formProps}
          description={__(
            'Which specific Brand does this integration belong to?'
          )}
        />

        <SelectChannels
          defaultValue={channelIds}
          isRequired={true}
          onChange={onChannelChange}
        />

        <ModalFooter>
        <FlexBetween style={{
            justifyContent:'flex-end'
          }}>
          <Button
            btnStyle="simple"
            type="button"
            onClick={callback}
            icon="times-circle"
          >
            Cancel
          </Button>
          {renderButton({
            name: 'integration',
            values: this.generateDoc(values),
            isSubmitted,
            callback
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

export default CallPro;
