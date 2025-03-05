import { IButtonMutateProps, IFormProps } from '@octobots/ui/src/types';

import Button from '@octobots/ui/src/components/Button';
import ControlLabel from '@octobots/ui/src/components/form/Label';
import Form from '@octobots/ui/src/components/form/Form';
import FormControl from '@octobots/ui/src/components/form/Control';
import { ISkillTypesDocument } from '@octobots/ui-inbox/src/settings/skills/types';
import { ModalFooter } from '@octobots/ui/src/styles/main';
import React from 'react';
import { FlexBetween } from '@octobots/ui-settings/src/styles';

type Props = {
  closeModal: () => void;
  object: ISkillTypesDocument;
  refetch: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

function SkillTypeForm({ closeModal, object, renderButton }: Props) {
  const generateDoc = (values: { _id?: string; name: string }) => {
    const item = object || ({} as ISkillTypesDocument);

    if (item._id) {
      values._id = item._id;
    }

    return values;
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const item = object || ({} as ISkillTypesDocument);

    if (item) {
      values._id = item._id;
    }

    return (
      <>
        <ControlLabel>Name</ControlLabel>
        <FormControl
          {...formProps}
          name="name"
          defaultValue={item.name}
          autoFocus={true}
          required={true}
        />
        <ModalFooter>
        <FlexBetween style={{ justifyContent: 'flex-end' }}>

          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="times-circle"
          >
            Cancel
          </Button>

          {renderButton({
            name: 'skill type',
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object
          })}
        </FlexBetween>
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}

export default SkillTypeForm;
