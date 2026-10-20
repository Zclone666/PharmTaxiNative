import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import PlusMinus from "../../components/PlusMinus";

import { Item, Divider, Button, Grid, Menu, Segment, Table, Header, Form, Input, Icon, Label } from "semantic-ui-react";

import _ from "lodash";
import moment from "moment";

@inject("recipes", "assortiment", "orders")
@observer
class RecipeSelection extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  get packs() {
    let list = [];
    let { current } = this.props;
    if (!current || !this.props.assortiment.drugs[current].packs) return [];
    this.props.assortiment.drugs[current].packs.forEach((drug, i) => {
      // console.log({ item });
      let found = _.find(this.props.orders.tmpOrder.drugs, function (o) {
        return o.id == drug.pharm_pack_id;
      });

      list.push({ ...drug, value: found ? found.packs : 0 });
    });
    return _.orderBy(list, ["price"], ["asc"]);
  }
  sort = () => {};
  onChangeCount = (id, value) => {
    let { current } = this.props;
    // console.log({ id, val });
    this.props.assortiment.drugs[current].packs.forEach((item, i) => {
      if (item._id == id) {
        // item.value = val;
        this.props.orders.changeTmpOrder({ ...item, value });
      }
    });
  };
  render() {
    const { dir, sortBy } = this.state;
    return (
      <Segment raised className="nopaddings">
        <Table basic="very" celled sortable padded>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell sorted={sortBy === "TradeName" ? dir : null} onClick={() => this.sort("TradeName")}>
                Наименование
              </Table.HeaderCell>

              <Table.HeaderCell
                sorted={sortBy === "SellingPrice" ? dir : null}
                onClick={() => this.sort("SellingPrice")}
                collapsing
              >
                Кол-во
              </Table.HeaderCell>
              <Table.HeaderCell collapsing>Цена</Table.HeaderCell>
              <Table.HeaderCell collapsing>В заказ</Table.HeaderCell>
              <Table.HeaderCell collapsing>Сумма</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          {this.packs.map((item) => {
            // console.log({ item });
            return (
              <Table.Row>
                <Table.Cell>
                  <Header as="h5">
                    <Header.Content>{item.name}</Header.Content>
                  </Header>
                </Table.Cell>

                <Table.Cell collapsing>{item.qty_free}</Table.Cell>
                <Table.Cell collapsing>{parseInt(item.price)} ₽</Table.Cell>
                <Table.Cell collapsing>
                  <PlusMinus
                    max={item.qty_free}
                    value={item.value || 0}
                    onChange={(val) => this.onChangeCount(item._id, val)}
                  />
                </Table.Cell>
                <Table.Cell collapsing>{parseInt(item.price || 0) * parseInt(item.value || 0)} ₽</Table.Cell>
              </Table.Row>
            );
          })}
        </Table>
      </Segment>
    );
  }
}
export default RecipeSelection;
