import React from "react";
import { Dimmer, Icon, Header } from "semantic-ui-react";

export default class Loader extends React.Component {
  render() {
    const open = this.props.open === false ? false : true;
    return (
      <Dimmer active={open} inverted style={{ textAlign: "center" }}>
        <img src="/logo.svg" className="loader" style={{ margin: "auto" }} />
        {this.props.message && (
          <Header as="h2">
            <Header.Subheader>{this.props.message}</Header.Subheader>
          </Header>
        )}
      </Dimmer>
    );
  }
}
