import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import Spinner from "../../components/Spinner";
import Orders from "../Orders";
import Order from "../Orders/Order";
import Store from "../Store";
import RecipeSearch from "../Recipe";
import Ecp from "../Ecp";
import Staff from "../Staff";
import Pharms from "../Pharms";
import PharmNets from "../Pharms/PharmNets";
import License from "../Pharms/License";
import Profile from "../Profile";

import {
  Sidebar,
  Menu,
  Icon,
  // Search,
  Segment,
  Message,
  List,
  Feed,
  Button,
  Responsive,
  Grid,
} from "semantic-ui-react";

import _ from "lodash";

@inject("router", "db", "actions")
@observer
class Page extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,

      isLoading: false,
      searchQuery: "",
    };
    //this.contextRef = createRef()
  }

  saveDoze = () => {};

  back = () => {
    this.props.router.push("/");
  };

  render() {
    let shownPage = (this.props.router.values && this.props.router.values.page) || "none";
    let section = (this.props.router && this.props.router.match && this.props.router.match.name) || "recipe";
    return (
      {
        orders: <Orders />,
        "new order": <Order />,
        store: <Store />,
        recipe: <RecipeSearch />,
        main: <RecipeSearch />,
        ecp: <Ecp />,
        staff: <Staff />,
        pharms: <Pharms />,
        nets: <PharmNets />,
        license: <License />,
        profile: <Profile />,
        none: <div />,
      }[section] || null
    );
  }
}
export default Page;
