import React from "react";

import { Button, Header, Icon, Segment, Checkbox, Dimmer } from "semantic-ui-react";
import PlusMinus from "./PlusMinus";
import _ from "lodash";
class Day extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,

      startHours: "00",
      startMinutes: "00",
      endHours: "24",
      endMinutes: "00",

      brakeStartHours: "13",
      brakeStartMinutes: "00",
      brakeEndHours: "14",
      brakeEndMinutes: "00",

      startHours_tmp: "00",
      startMinutes_tmp: "00",
      endHours_tmp: "24",
      endMinutes_tmp: "00",

      brakeStartHours_tmp: "13",
      brakeStartMinutes_tmp: "00",
      brakeEndHours_tmp: "14",
      brakeEndMinutes_tmp: "00",

      withBreak: false,
      enabled: true,
      allTime: false,
    };
  }

  onChangeHandler = () => {
    if (_.isEqual(_.cloneDeep(this.props.data), this.setData())) return;
    this.props.onChange(this.setData());
  };

  handleChange = (name, value) => {
    this.setState({ [name]: value }, () => {
      this.onChangeHandler();
    });
  };

  handleBrake = () => {
    let { withBreak } = this.state;
    this.setState({ withBreak: !withBreak });
    this.onChangeHandler();
  };

  handleAllTime = () => {
    let {
      startHours,
      startMinutes,
      endHours,
      endMinutes,
      brakeStartHours,
      brakeStartMinutes,
      brakeEndHours,
      brakeEndMinutes,

      startHours_tmp,
      startMinutes_tmp,
      endHours_tmp,
      endMinutes_tmp,
      brakeStartHours_tmp,
      brakeStartMinutes_tmp,
      brakeEndHours_tmp,
      brakeEndMinutes_tmp,

      withBreak,
      enabled,
      allTime,
    } = this.state;
    if (!allTime) {
      this.setState(
        {
          allTime: !allTime,
          startHours: "00",
          startMinutes: "00",
          endHours: "24",
          endMinutes: "00",
          // brakeStartHours: null,
          // brakeStartMinutes: null,
          // brakeEndHours: null,
          // brakeEndMinutes: null,

          startHours_tmp: startHours,
          startMinutes_tmp: startMinutes,
          endHours_tmp: endHours,
          endMinutes_tmp: endMinutes,
          // brakeStartHours_tmp: brakeStartHours,
          // brakeStartMinutes_tmp: brakeStartMinutes,
          // brakeEndHours_tmp: brakeEndHours,
          // brakeEndMinutes_tmp: brakeEndMinutes,
        },
        () => {
          this.onChangeHandler();
        }
      );
    } else {
      this.setState(
        {
          allTime: !allTime,
          startHours: startHours_tmp,
          startMinutes: startMinutes_tmp,
          endHours: endHours_tmp,
          endMinutes: endMinutes_tmp,
          // brakeStartHours: brakeStartHours_tmp,
          // brakeStartMinutes: brakeStartMinutes_tmp,
          // brakeEndHours: brakeEndHours_tmp,
          // brakeEndMinutes: brakeEndMinutes_tmp,

          startHours_tmp: null,
          startMinutes_tmp: null,
          endHours_tmp: null,
          endMinutes_tmp: null,
          // brakeStartHours_tmp: null,
          // brakeStartMinutes_tmp: null,
          // brakeEndHours_tmp: null,
          // brakeEndMinutes_tmp: null,
        },
        () => {
          this.onChangeHandler();
        }
      );
    }
  };

  handleEnable = () => {
    let { enabled } = this.state;
    this.setState({ enabled: !enabled }, () => {
      this.onChangeHandler();
    });
    // this.props.onChange(this.setData());
  };

  componentDidUpdate(prevProps, prevState) {
    let { withBreak } = this.props;
    if (withBreak != prevProps.withBreak) this.setState({ withBreak });
    // console.log(this.props.title, _.cloneDeep(this.props.data), this.setData());
    if (_.isEqual(_.cloneDeep(this.props.data), this.setData())) return;
    // console.log("HERE");
    this.getData();
  }
  componentDidMount() {
    let { withBreak } = this.props;
    this.setState({ withBreak });
    this.getData();
  }
  getData = () => {
    let {
      withBreak,
      enabled,
      data: { StartTime, EndTime, BreakStart, BreakEnd },
    } = this.props;
    let allTime = false;
    // console.log({ StartTime, EndTime, BreakStart, BreakEnd });
    if ((StartTime || StartTime == 0) && (EndTime || EndTime == 0)) {
      enabled = true;
      if (StartTime == 0 && EndTime == 2400) allTime = true;
      let { startHours, startMinutes } = this.destructData(StartTime, "startHours", "startMinutes");
      let { endHours, endMinutes } = this.destructData(EndTime, "endHours", "endMinutes");
      if (BreakStart && BreakEnd) {
        let { brakeStartHours, brakeStartMinutes } = this.destructData(
          BreakStart,
          "brakeStartHours",
          "brakeStartMinutes"
        );
        let { brakeEndHours, brakeEndMinutes } = this.destructData(BreakEnd, "brakeEndHours", "brakeEndMinutes");
        withBreak = true;
        this.setState({
          brakeStartHours,
          brakeStartMinutes,
          brakeEndHours,
          brakeEndMinutes,
        });
      }
      this.setState({
        startHours,
        startMinutes,
        endHours,
        endMinutes,
      });
    }
    this.setState({
      withBreak,
      enabled,
      allTime,
    });
  };

  setData = () => {
    let {
      startHours,
      startMinutes,
      endHours,
      endMinutes,
      brakeStartHours,
      brakeStartMinutes,
      brakeEndHours,
      brakeEndMinutes,
      withBreak,
      enabled,
    } = this.state;
    return {
      StartTime: this.joinData(startHours, startMinutes),
      EndTime: this.joinData(endHours, endMinutes),
      BreakStart: this.joinData(brakeStartHours, brakeStartMinutes),
      BreakEnd: this.joinData(brakeEndHours, brakeEndMinutes),
    };
  };

  destructData = (value, hourName, minuteName) => {
    let hours = Math.floor(value / 100).toString();
    let minutes = (value - parseInt(hours) * 100).toString();
    // if (!hours || hours == "0") hours = "00";
    if (hours.length == 1) hours = "0" + hours;
    // if (!minutes || minutes == "0") minutes = "00";
    if (minutes.length == 1) minutes = "0" + minutes;
    // console.log({ hours, minutes });
    return { [hourName]: hours, [minuteName]: minutes };
  };
  joinData = (hourValue, minuteValue) => {
    return parseInt(parseInt(hourValue).toString() + minuteValue);
  };
  render() {
    let {
      startHours,
      startMinutes,
      endHours,
      endMinutes,
      brakeStartHours,
      brakeStartMinutes,
      brakeEndHours,
      brakeEndMinutes,
      withBreak,
      enabled,
      allTime,
    } = this.state;
    let { title, name } = this.props;
    return (
      <Segment compact className="oneDay">
        {name != "all" && <Checkbox checked={enabled} onChange={this.handleEnable} style={{ float: "right" }} />}
        {title && <div>{title}</div>}
        <Checkbox checked={allTime} onChange={this.handleAllTime} label="Круглосуточно" />
        <div style={{ display: "flex" }}>
          <PlusMinus
            value={startHours}
            type="hours"
            onChange={(val) => {
              this.handleChange("startHours", val);
            }}
          />
          <PlusMinus
            value={startMinutes}
            type="minutes"
            onChange={(val) => {
              this.handleChange("startMinutes", val);
            }}
          />
          <div className="timeDelimiter">
            <div>{" - "}</div>
          </div>
          <PlusMinus
            value={endHours}
            type="hours"
            onChange={(val) => {
              this.handleChange("endHours", val);
            }}
          />
          <PlusMinus
            value={endMinutes}
            type="minutes"
            onChange={(val) => {
              this.handleChange("endMinutes", val);
            }}
          />
        </div>
        <Checkbox checked={withBreak} onChange={this.handleBrake} label="Перерыв" />
        {withBreak && (
          <div style={{ display: "flex" }}>
            <PlusMinus
              value={brakeStartHours}
              type="hours"
              onChange={(val) => {
                this.handleChange("brakeStartHours", val);
              }}
            />
            <PlusMinus
              value={brakeStartMinutes}
              type="minutes"
              onChange={(val) => {
                this.handleChange("brakeStartMinutes", val);
              }}
            />
            <div className="timeDelimiter">
              <div>{" - "}</div>
            </div>
            <PlusMinus
              value={brakeEndHours}
              type="hours"
              onChange={(val) => {
                this.handleChange("brakeEndHours", val);
              }}
            />
            <PlusMinus
              value={brakeEndMinutes}
              type="minutes"
              onChange={(val) => {
                this.handleChange("brakeEndMinutes", val);
              }}
            />
          </div>
        )}
        <Dimmer active={!enabled}>
          <Header as="h4" inverted>
            Выходной
          </Header>

          <Button onClick={this.handleEnable} primary>
            Включить
          </Button>
        </Dimmer>
      </Segment>
    );
  }
}
export default Day;
