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

import _ from "lodash";
import moment from "moment";

@inject("router", "db", "actions", "orders", "pharms", "user", "assortiment")
@observer
class OrderList extends Component {
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
    let { orderId } = this.props;
    let { searchQuery, sortBy, sortDirection, selected, status } = this.state;
    // console.log({ values });
    let item = {};
    if (orderId == "new") {
      item = this.props.orders.tmpOrder;
    } else {
      item = (orderId && this.props.orders.my.data.get(orderId)) || { drugs: [] };
    }
    let pharm = this.props.pharms.my.data.get(this.props.user.currPharm);
    let { drugs, owner, ...info } = item;
    drugs = drugs || [];

    return { drugs, pharm, info, owner };
  }
  render() {
    let { searchQuery, sortBy, sortDirection, selected, status } = this.state;
    return (
      <Table celled striped sortable className="no-border">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell sorted={sortBy === "SellingPrice" ? dir : null} onClick={() => this.sort("SellingPrice")}>
              Наименование
            </Table.HeaderCell>
            <Table.HeaderCell sorted={sortBy === "SellingPrice" ? dir : null} onClick={() => this.sort("SellingPrice")}>
              Кол-во
            </Table.HeaderCell>

            <Table.HeaderCell sorted={sortBy === "Quantity" ? dir : null} onClick={() => this.sort("Quantity")}>
              Цена
            </Table.HeaderCell>

            <Table.HeaderCell></Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {(this.order.drugs &&
            this.order.drugs.length &&
            this.order.drugs.map((item, i) => {
              // let drug = (item.drugs && item.drugs[0]) || {};
              // let drugCount = (item.drugs && item.drugs.length) || 0;
              return (
                <Table.Row key={"drug" + i}>
                  <Table.Cell>{item.name}</Table.Cell>
                  <Table.Cell collapsing textAlign="right">
                    {item.packs}
                  </Table.Cell>
                  <Table.Cell collapsing textAlign="right">
                    {item.price}
                  </Table.Cell>
                  <Table.Cell collapsing textAlign="right"></Table.Cell>
                </Table.Row>
              );
            })) ||
            null}
        </Table.Body>
        {(this.order.drugs && this.order.drugs.length && (
          <Table.Footer fullWidth>
            <Table.Row>
              <Table.HeaderCell textAlign="right">Итого:</Table.HeaderCell>
              <Table.HeaderCell textAlign="right">
                {_.reduce(
                  this.order.drugs,
                  function (sum, n) {
                    return sum + n.packs;
                  },
                  0
                )}
              </Table.HeaderCell>
              <Table.HeaderCell textAlign="right">
                {_.reduce(
                  this.order.drugs,
                  function (sum, n) {
                    return sum + n.price * n.packs;
                  },
                  0
                )}
              </Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Footer>
        )) ||
          null}
      </Table>
    );
  }
}
export default OrderList;
