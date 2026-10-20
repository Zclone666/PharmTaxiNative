import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import Spinner from "../../components/Spinner";
import Scanner from "../../components/Scanner";
import Search from "../../components/Search";

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

const statuses = {
  "-1": { color: "#828A8C", text: "Отменен" },
  "0": { color: "#62ADC8", text: "В обработке" },
  "1": { color: "#7DDDBB", text: "Готов к выдаче" },
  "2": { color: "#B298E8", text: "Выдан" },
};

@inject("router", "db", "actions", "orders", "pharms", "user")
@observer
class Orders extends Component {
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

  sort = (by) => {
    let { sortBy, sortDirection } = this.state;
    this.setState({ sortBy: by, sortDirection: by == sortBy ? !sortDirection : false });
  };

  search = (e) => {
    let { name, value } = e.target;
    this.setState({ searchQuery: value });
  };

  selectOrder = (id) => {
    this.props.orders.addUserToOrder(id);
    this.setState({ selected: id });
  };

  cancelOrder = () => {
    let { selected } = this.state;
    this.props.orders.cancelOrder(selected);
  };

  releaseOrder = () => {
    let { selected } = this.state;
    this.props.orders.releaseOrder(selected);
  };

  makeReadyOrder = () => {
    let { selected } = this.state;
    this.props.orders.makeReadyOrder(selected);
  };

  get orders() {
    let { searchQuery, sortBy, sortDirection, status } = this.state;
    let list = [];
    let reg = new RegExp(searchQuery, "ig");
    this.props.orders.my.data.forEach((item, i) => {
      // console.log({ item });
      // if (item.TradeName.search(reg) != -1 || searchQuery == "" || searchQuery == null) {
      // let { SellingPrice, Quantity, ...other } = item;
      if ((status === false || item.status.toString() === status) && item.pharm_id == this.props.user.currPharm) {
        list.push(item);
      }

      // list.push({ SellingPrice: parseFloat(SellingPrice), Quantity: parseFloat(Quantity), ...other });
      // }
    });
    let dir = sortDirection ? "desc" : "asc";
    list = _.orderBy(list, [sortBy], [dir]);
    return list;
  }

  get order() {
    let { searchQuery, sortBy, sortDirection, selected, status } = this.state;
    let item = (selected && this.props.orders.my.data.get(selected)) || { drugs: [] };
    let pharm = this.props.pharms.my.data.get(item.pharm_id);
    let { drugs, owner, ...info } = item;
    drugs = drugs || [];

    return { drugs, pharm, info, owner };
  }

  render() {
    let { sortBy, sortDirection, selected, status } = this.state;
    let dir = sortDirection ? "descending" : "ascending";
    // console.log(this.order);
    let owner = (this.order.owner && this.order.owner.patient) || {};
    // let ownerFio = (owner.patient && owner.patient.firstname) || "";
    console.log({ owner });
    return (
      <>
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
              <Grid.Column mobile={16} tablet={16} computer={10}>
                {["0", "1", "2", "-1"].map((item) => {
                  return (
                    <Button
                      key={"status" + item}
                      onClick={() => {
                        this.setState({ status: item == status ? false : item });
                      }}
                      active={item == status}
                      size="big"
                      color={{ "0": "blue", "1": "teal", "2": "purple", "-1": "grey" }[item]}
                    >
                      {statuses[item].text}
                    </Button>
                  );
                })}
              </Grid.Column>
            </Grid>
            <Grid>
              <Grid.Column width={10}>
                <Segment raised className="nopaddings no-border">
                  <Table celled striped sortable className="no-border">
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell
                          sorted={sortBy === "SellingPrice" ? dir : null}
                          onClick={() => this.sort("SellingPrice")}
                        >
                          Наименование
                        </Table.HeaderCell>
                        <Table.HeaderCell
                          sorted={sortBy === "SellingPrice" ? dir : null}
                          onClick={() => this.sort("SellingPrice")}
                        >
                          Кол-во
                        </Table.HeaderCell>

                        <Table.HeaderCell
                          sorted={sortBy === "Quantity" ? dir : null}
                          onClick={() => this.sort("Quantity")}
                        >
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
                </Segment>
                {this.order.pharm && this.order.pharm.Address && (
                  <Segment basic>
                    <div>
                      {this.order.info.status == "1" && (
                        <Button
                          positive
                          floated="right"
                          onClick={() => {
                            this.releaseOrder();
                          }}
                        >
                          Выдать заказ
                        </Button>
                      )}
                      {this.order.info.status == "0" && (
                        <Button
                          color="teal"
                          onClick={() => {
                            this.makeReadyOrder();
                          }}
                        >
                          Готов к выдаче
                        </Button>
                      )}
                      {(this.order.info.status == "0" || this.order.info.status == "1") && (
                        <Button
                          basic
                          negative
                          onClick={() => {
                            this.cancelOrder();
                          }}
                        >
                          Отменить заказ
                        </Button>
                      )}
                    </div>
                    <Message>
                      <Message.Header>Адрес аптеки</Message.Header>
                      <p>{this.order.pharm.Address}</p>
                    </Message>
                    <Message>
                      <Message.Header>Детали заказа</Message.Header>
                      <h4>Время заказа:</h4>
                      <p>{moment(this.order.info.CreationDate, "X").format("DD.MM.YYYY HH:mm")}</p>
                      <h4>{this.order.info.Delivery ? "Доставка" : "Самовывоз"}</h4>
                      {this.order.info.Delivery && <h4>Адрес доставки:</h4>}
                      {this.order.info.Delivery && <p>{this.order.info.DeliveryAddress}</p>}
                      <h4>Покупатель:</h4>
                      <p>{`${owner.firstname || ""} ${owner.lastname || ""} ${owner.patronymic || ""} (${
                        owner.email || "нет Email"
                      })`}</p>
                    </Message>
                  </Segment>
                )}
              </Grid.Column>

              <Grid.Column width={6}>
                <Segment>
                  <List divided selection animated verticalAlign="middle">
                    {this.orders.map((item, i) => {
                      let drug = (item.drugs && item.drugs[0]) || {};
                      let drugCount = (item.drugs && item.drugs.length) || 0;
                      return (
                        <List.Item
                          key={item.order_id}
                          active={selected == item.order_id}
                          onClick={() => {
                            this.selectOrder(item.order_id);
                          }}
                        >
                          <List.Content floated="right" style={{ textAlign: "right" }}>
                            <Label
                              size="tiny"
                              color={{ "0": "blue", "1": "teal", "2": "purple", "-1": "grey" }[item.status.toString()]}
                            >
                              {statuses[item.status.toString()].text}
                            </Label>
                            <br />
                            {item.Delivery ? "доставка" : "самовывоз"}
                          </List.Content>

                          <Label circular size="big" className="avatar image">
                            {drugCount}
                          </Label>
                          <List.Content>
                            <List.Header>{item.order_id && item.order_id.replace("_", "")}</List.Header>

                            <List.Description>{moment(item.CreationDate, "X").format("DD.MM.YYYY")}</List.Description>
                          </List.Content>
                        </List.Item>
                      );
                    })}
                  </List>
                </Segment>
              </Grid.Column>
            </Grid>
          </Segment>
        </div>
        {false && (
          <Menu className="bottom fixed menu three item large main">
            <Menu.Item color="red" onClick={() => {}}>
              Сбросить
            </Menu.Item>
            <Menu.Item onClick={() => {}}>Сканировать</Menu.Item>
            <Menu.Item onClick={() => {}}>Отмена</Menu.Item>
          </Menu>
        )}
      </>
    );
  }
}
export default Orders;
