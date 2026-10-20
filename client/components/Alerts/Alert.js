import React from "react";

import { Transition, Message } from "semantic-ui-react";

class AlertItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
    };
  }
  close = () => {
    let { onClose } = this.props;
    this.setState({ open: false }, () => {
      setTimeout(() => {
        onClose();
      }, 1000);
    });
  };
  componentDidMount() {
    let { sticky } = this.props;
    if (!sticky) {
      setTimeout(() => {
        this.close();
      }, 3000);
    }
  }
  render() {
    let { code, title, message, level, sticky, Message: message2, Sticky, Level, Code } = this.props;
    let { open } = this.state;
    return (
      <Transition visible={open} animation="scale" duration={1000}>
        <Message
          className="small squared"
          onDismiss={this.close}
          success={level === "success"}
          error={level === "error"}
          info={level === "info"}
          warning={level === "warning"}
        >
          {title && <Message.Header>{title}</Message.Header>}
          <p>{message || message2}</p>
        </Message>
      </Transition>
    );
  }
}
export default AlertItem;
