import React from "react";

import { Button, Icon, Segment } from "semantic-ui-react";

import Day from "./Day";

import _ from "lodash";

let week = {
  mon: {
    StartTime: 800,
    EndTime: 2100,
    BreakStart: 1200,
    BreakEnd: 1300,
  },
  tue: {
    StartTime: 800,
    EndTime: 2100,
    BreakStart: 1200,
    BreakEnd: 1300,
  },
  wed: {
    StartTime: 800,
    EndTime: 2100,
    BreakStart: 1200,
    BreakEnd: 1300,
  },
  thu: {
    StartTime: 800,
    EndTime: 2100,
    BreakStart: 1200,
    BreakEnd: 1300,
  },
  fri: {
    StartTime: 800,
    EndTime: 2100,
    BreakStart: 1200,
    BreakEnd: 1300,
  },
  sat: {
    StartTime: 800,
    EndTime: 2100,
    BreakStart: 1200,
    BreakEnd: 1300,
  },
  sun: {
    StartTime: 800,
    EndTime: 2100,
    BreakStart: 1200,
    BreakEnd: 1300,
  },
};

let weekNames = {
  mon: "Понедельник",
  tue: "Вторник",
  wed: "Среда",
  thu: "Четверг",
  fri: "Пятница",
  sat: "Суббота",
  sun: "Воскресенье",
};

class WorkingHours extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
      allDays: false,
      withBreak: false,
      days: _.cloneDeep(week),
    };
  }
  handleChange = (name) => {
    this.setState({ [name]: !this.state[name] });
  };
  handleSetSchedule = () => {};
  handleSetDay = (day, data) => {
    let days = _.cloneDeep(this.state.days);
    if (day == "all") {
      days.mon = data;
      days.tue = data;
      days.wed = data;
      days.thu = data;
      days.fri = data;
      days.sat = data;
      days.sun = data;
    } else {
      days[day] = data;
    }

    this.setState({ days });
  };
  handleSetHollyDay = () => {};
  componentDidUpdate(prevProps, prevState) {
    // console.log(this.state.days)
    // console.log(_.isEqual(this.state.days.mon, prevState.days.mon));
    // console.log(this.state.days.mon, prevState.days.mon);
    let isEqual =
      _.isEqual(this.state.days.mon, prevState.days.mon) &&
      _.isEqual(this.state.days.tue, prevState.days.tue) &&
      _.isEqual(this.state.days.wed, prevState.days.wed) &&
      _.isEqual(this.state.days.thu, prevState.days.thu) &&
      _.isEqual(this.state.days.fri, prevState.days.fri) &&
      _.isEqual(this.state.days.sat, prevState.days.sat) &&
      _.isEqual(this.state.days.sun, prevState.days.sun);
    // console.log({ isEqual });
    if (!isEqual) {
      this.props.onChange && this.props.onChange(this.state.days);
    } else if (this.props.days && !_.isEqual(_.cloneDeep(this.props.days), _.cloneDeep(this.state.days))) {
      this.setState({ days: _.cloneDeep(this.props.days) });
    }
  }
  componentDidMount() {
    if (this.props.days) this.setState({ days: _.cloneDeep(this.props.days) });
  }
  render() {
    let { allDays, withBreak, days } = this.state;
    return (
      <Segment>
        <Button.Group>
          <Button primary={allDays} name="allDays" onClick={() => this.handleChange("allDays")} icon>
            на каждый день
          </Button>
          <Button primary={withBreak} name="withBreak" onClick={() => this.handleChange("withBreak")} icon>
            {!withBreak?"с перерывом":"без перерыва"}
          </Button>
        </Button.Group>
        {allDays && (
          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
            <span />
            {_.keys(days).map((item, i) => {
              return (
                <Day
                  onChange={(data) => {
                    this.handleSetDay(item, data);
                  }}
                  key={item}
                  name={item}
                  enabled
                  title={weekNames[item]}
                  data={days[item]}
                  withBreak={withBreak}
                />
              );
            })}

            <span />
          </div>
        )}
        {!allDays && (
          <div style={{ display: "flex", flexDirection: "row" }}>
            <span />
            <Day
              onChange={(data) => {
                this.handleSetDay("all", data);
              }}
              enabled
              name={"all"}
              title="График"
              data={days.mon}
              withBreak={withBreak}
            />
            <span />
          </div>
        )}
      </Segment>
    );
  }
}
export default WorkingHours;
