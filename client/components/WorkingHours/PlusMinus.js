import React from "react";

import { Button, Icon, Segment, Input } from "semantic-ui-react";

const values = {
  hours: [
    "00",
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
  ],
  minutes: ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"],
};

class PlusMinus extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
    };
  }

  handleChange = (e, { name, value: newValue }) => {
    let { type, value, onChange } = this.props;
    let realValue = "0";
    if (newValue == "" || newValue == "0" || (parseInt(newValue) > 0 && parseInt(newValue) < 10)) {
      if (parseInt(newValue) > 0 && parseInt(newValue) < 10) {
        realValue = "0" + newValue;
      } else {
        realValue = newValue;
      }
    } else {
      realValue = values[type] && values[type].includes(newValue) ? newValue : value;
    }

    onChange(realValue);
  };

  handlePlusMinus = (action) => {
    let { type, value, onChange } = this.props;
    let index = values[type].indexOf(value);
    let realValue = value;
    if (action == "+") {
      realValue = values[type][index + 1] || values[type][0];
    } else {
      realValue = index > 0 ? values[type][index - 1] : values[type][values[type].length - 1];
    }

    onChange(realValue);
  };

  render() {
    let { type, value } = this.props;
    let realValue = values[type] && values[type].includes(value) ? value : value == "0" ? value : "";
    return (
      <Button.Group vertical className="plusMinus" size="mini">
        <Button
          basic
          onClick={() => {
            this.handlePlusMinus("+");
          }}
        >
          <Icon size="big" name="up caret" />
        </Button>
        <Input value={realValue} className={"plusMinusInput " + type} onChange={this.handleChange}>
          <input />
          {type == "minutes" && <div className="dotdot">:</div>}
        </Input>

        <Button
          basic
          onClick={() => {
            this.handlePlusMinus("-");
          }}
        >
          <Icon size="big" name="down caret" />
        </Button>
      </Button.Group>
    );
  }
}
export default PlusMinus;
