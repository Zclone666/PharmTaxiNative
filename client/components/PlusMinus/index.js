import React, { Component, createRef } from "react";
import { inject, observer } from "mobx-react";

import { Label, Input, Icon } from "semantic-ui-react";

class PlusMinus extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  handleChange = (action, val) => {
    // console.log({ action, val });
    let { value, max, onChange } = this.props;
    let newValue = action == "val" ? parseInt(val) : action == "+" ? value + 1 : value > 0 ? value - 1 : 0;
    if (max && newValue > max) newValue = max;
    // console.log({action, value, newValue});
    onChange && onChange(newValue);
  };

  render() {
    let { value } = this.props;
    return (
      <Input className="w50px" labelPosition="right" type="text" placeholder="0" value="1">
        <Label className="pointer" onClick={() => this.handleChange("-")}>
          -
        </Label>
        <input value={value} onChange={(e) => this.handleChange("val", e.target.value)} />
        <Label className="pointer" onClick={() => this.handleChange("+")}>
          +
        </Label>
      </Input>
    );
  }
}
export default PlusMinus;
