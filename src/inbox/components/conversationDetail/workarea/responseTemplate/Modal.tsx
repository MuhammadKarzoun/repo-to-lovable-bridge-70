import Button from "@octobots/ui/src/components/Button";
import FormControl from "@octobots/ui/src/components/form/Control";
import FormGroup from "@octobots/ui/src/components/form/Group";
import ControlLabel from "@octobots/ui/src/components/form/Label";
import ModalTrigger from "@octobots/ui/src/components/ModalTrigger";
import { ModalFooter } from "@octobots/ui/src/styles/main";
import { IAttachment } from "@octobots/ui/src/types";
import { __, Alert } from "coreui/utils";
import { IBrand } from "@octobots/ui/src/brands/types";
import { SaveResponseTemplateMutationVariables } from "../../../../../settings/responseTemplates/types";
import React from "react";

type Props = {
  saveResponseTemplate: (
    doc: SaveResponseTemplateMutationVariables,
    callback: (error?: Error) => void
  ) => void;
  brands: IBrand[];
  trigger: React.ReactNode;
  brandId?: string;
  files?: IAttachment[];
  content?: string;
};

class Modal extends React.Component<Props, {}> {
  onSave = () => {
    const { content, files } = this.props;

    const doc = {
      content,
      files,
      brandId: (
        document.getElementById("template-brand-id") as HTMLInputElement
      ).value,
      name: (document.getElementById("template-name") as HTMLInputElement)
        .value,
    };

    this.props.saveResponseTemplate(doc, (error) => {
      if (error) {
        return Alert.error(error.message);
      }

      const element = document.querySelector("button.btn-close") as HTMLElement;

      if (element) {
        return element.click();
      }
    });
  };

  renderForm = () => {
    const { brands, brandId } = this.props;

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>Brand</ControlLabel>

          <FormControl
            id="template-brand-id"
            componentclass="select"
            placeholder={__("Select Brand") as string}
            defaultValue={brandId}
          >
            {Array.isArray(brands) ? (
            brands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))
          ) : (
            <option disabled>__("No Results")</option>
          )}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl id="template-name" type="text" required={true} />
        </FormGroup>

        <ModalFooter>
          <Button onClick={this.onSave} btnStyle="success" icon="check-circle">
            Save
          </Button>
        </ModalFooter>
      </React.Fragment>
    );
  };

  render() {
    const { trigger } = this.props;

    return (
      <ModalTrigger
        title="Create response template"
        trigger={trigger}
        content={this.renderForm}
        enforceFocus={true}
      />
    );
  }
}

export default Modal;
