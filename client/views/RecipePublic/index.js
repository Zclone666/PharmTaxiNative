import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import Recipe from "./Recipe";
import Search from "./Search";

import _ from "lodash";

@inject("router")
@observer
class Recipes extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let shownPage = (this.props.router.values && this.props.router.values.code) || null;
    return shownPage ? <Recipe /> : <Search />;
  }
}
export default Recipes;
