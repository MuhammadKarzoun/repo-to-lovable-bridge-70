import FormControl from "@octobots/ui/src/components/form/Control";
import FormGroup from "@octobots/ui/src/components/form/Group";
import ControlLabel from "@octobots/ui/src/components/form/Label";
import { __ } from "@octobots/ui/src/utils/core";
import React from "react";
import { LeftItem } from "@octobots/ui/src/components/step/styles";
import { FlexItem } from "@octobots/ui/src/components/step/style";

type Props = {
  onChange: (name: "css", value: string) => void;
  css?: string;
};

class StyleSheetStep extends React.Component<Props, {}> {
  onChange = (e) => {
    this.props.onChange("css", (e.currentTarget as HTMLInputElement).value);
  };

  render() {
    const { css } = this.props;

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>Custom stylesheet</ControlLabel>
            <p>
              {__(
                "Add or overwrite default theme styles with your own custom css"
              )}
              .
            </p>
            <FormControl
              id="css"
              componentclass="textarea"
              value={css}
              onChange={this.onChange}
            />
          </FormGroup>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default StyleSheetStep;
