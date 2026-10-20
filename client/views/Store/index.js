import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import Store from "./Store";
import UploadStore from "./UploadStore";


@inject("router")
@observer
class StoreRouter extends Component {
  constructor(props) {
    super(props);

  }
  render(){
    let {page} = this.props.router.values
    return(
      {
        'list': <Store />,
        'upload': <UploadStore />
      }[page]
    )
  }
}
export default StoreRouter;
