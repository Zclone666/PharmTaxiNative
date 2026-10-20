import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import Loader from "../Loader";

@inject("router", "db", "actions", "user")
@observer
class UserOnly extends Component {
  render() {
    let {
      children,
      user: { authorized },
      router: { match },
    } = this.props;
    // console.log({ authorized });
    return authorized && match.section !== "auth" ? (
      children
    ) : match.section === "auth" || match.section === "public" ? (
      match.render
    ) : (
      <Loader />
    );
  }
}
export default UserOnly;
