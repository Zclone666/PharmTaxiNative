import React, { Component } from "react";
import { observer, inject } from "mobx-react";
//import { Sidebar } from 'semantic-ui-react'
//import TopSidebar from './sidebar';
import Alerts from "./components/Alerts";
import UserOnly from "./components/UserOnly";
import Loader from "./components/Loader";

import routes from "./router/routes";

@inject("router", "db", "actions")
@observer
class Layout extends Component {
  render() {
    const { loading } = this.props.actions;
    return (
      <div className="ui body">
        <UserOnly>{this.props.router.match.render}</UserOnly>
        <Alerts />
        <Loader open={loading} />
      </div>
    );
  }
}
export default Layout;
