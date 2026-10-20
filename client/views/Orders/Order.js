import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import {
  Item,
  List,
  Button,
  Menu,
  Segment,
  Table,
  Header,
  Form,
  Input,
  Grid,
  Label,
  Image,
  Message,
} from "semantic-ui-react";

import OrderList from "../../components/Order/OrderList";

import _ from "lodash";
import moment from "moment";

@inject("router", "db", "actions", "orders", "pharms", "user", "assortiment")
@observer
class Order extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: null,
      sortBy: "CreationDate",
      sortDirection: true,
      selected: null,
      status: false,
    };
  }
  get order() {
    let { values } = this.props.router;
    let { searchQuery, sortBy, sortDirection, selected, status } = this.state;
    // console.log({ values });
    let item = {};
    if (values && values.order == "new") {
      item = this.props.orders.tmpOrder;
    } else {
      item = (selected && this.props.orders.my.data.get(selected)) || { drugs: [] };
    }
    let pharm = this.props.pharms.my.data.get(this.props.user.currPharm);
    let { drugs, owner, ...info } = item;
    drugs = drugs || [];

    return { drugs, pharm, info, owner };
  }
  render() {
    let { values } = this.props.router;
    let { searchQuery, sortBy, sortDirection, selected, status } = this.state;
    let orderId = (values && values.order) || null;
    return (
      <div className="scrollwrapper">
        <Segment basic padded="very">
          <Header as="h2">Заказ</Header>
          <Grid>
            <Grid.Column mobile={16} tablet={16} computer={6}>
              <Form>
                <Form.Field>
                  <Input icon="search" size="big" onChange={this.search} placeholder="Поиск..." />
                </Form.Field>
              </Form>
            </Grid.Column>
            <Grid.Column mobile={16} tablet={16} computer={10}></Grid.Column>
            <Grid.Column mobile={16} tablet={16} computer={8}>
              <Segment raised className="nopaddings no-border">
                <OrderList orderId={orderId} />
              </Segment>
            </Grid.Column>
            <Grid.Column mobile={16} tablet={16} computer={8}></Grid.Column>
          </Grid>
        </Segment>
      </div>
    );
  }
}
export default Order;
