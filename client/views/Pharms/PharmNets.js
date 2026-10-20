import React, { Component, Fragment, createRef } from "react";
import { observer, inject } from "mobx-react";

import { Map, Marker, MarkerLayout } from "yandex-map-react";

import { AutoSizer } from "react-virtualized";

import RouterLink from "../../router/a";

import { Item, List, Button, Menu, Segment, Table, Header, Form, Input, Grid, Icon, Label } from "semantic-ui-react";

import _ from "lodash";

@inject("router", "db", "actions", "pharms")
@observer
class PharmNets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: null,
      sortBy: "Title",
      sortDirection: false,
      showLic: null,
    };
  }

  search = (e) => {
    let { name, value } = e.target;
    this.setState({ searchQuery: value });
  };

  handleChange = (e, { name, value }) => {
    this.props.pharms.currNet[name] = value;
  };

  makeNet = () => {
    this.props.pharms.createPharmNet();
  };

  setNet = (id) => {
    this.props.pharms.setPharmNet(id);
  };

  showLicenses = (id) => {
    this.props.pharms.getNetLicenses(id);
    this.setState({ showLic: id });
  };

  get nets() {
    let { searchQuery, sortBy, sortDirection } = this.state;
    let list = [];
    let reg = new RegExp(searchQuery, "ig");
    this.props.pharms.nets.data.forEach((item, i) => {
      // console.log({ item });
      // if (item.TradeName.search(reg) != -1 || searchQuery == "" || searchQuery == null) {
      // let { SellingPrice, Quantity, ...other } = item;
      list.push(item);
      // list.push({ SellingPrice: parseFloat(SellingPrice), Quantity: parseFloat(Quantity), ...other });
      // }
    });
    let dir = sortDirection ? "desc" : "asc";
    list = _.orderBy(list, [sortBy], [dir]);
    return list;
  }

  render() {
    let { sortBy, sortDirection, showLic } = this.state;
    let dir = sortDirection ? "descending" : "ascending";
    const { typeText, address, license, phone, title } = this.props.pharms.currNet;
    return (
      <>
        <div className="scrollwrapper">
          <Segment basic padded="very">
            <Grid>
              <Grid.Column width={9}>
                <Header as="h2">Мои сети</Header>
              </Grid.Column>

              <Grid.Column width={7}>
                <Button floated="right">
                  <Icon name="plus" />
                  Добавить
                </Button>
              </Grid.Column>
            </Grid>
            <Grid>
              <Grid.Column width={9}>
                <Segment raised className="nopaddings no-border">
                  <Table className="no-border">
                    <Table.Body>
                      {this.nets.map((net, i) => {
                        return (
                          <Fragment key={"drugrow" + i}>
                            <Table.Row>
                              <Table.Cell>
                                <Header as="h5">
                                  <Header.Content>
                                    {net.TypeText}

                                    <Header.Subheader>
                                      {net.Title}
                                      <br />
                                      {net.Address}
                                    </Header.Subheader>
                                  </Header.Content>
                                </Header>
                              </Table.Cell>
                              <Table.Cell></Table.Cell>
                              <Table.Cell collapsing>
                                <Button.Group>
                                  <Button
                                    title="изменить"
                                    icon
                                    onClick={() => {
                                      this.setNet(net.PharmId);
                                    }}
                                  >
                                    <Icon name="edit" />
                                  </Button>
                                  <Button
                                    title="лицензии"
                                    icon
                                    onClick={() => {
                                      this.showLicenses(net.PharmId);
                                    }}
                                  >
                                    <Icon name="file alternate" />
                                  </Button>
                                  <Button title="аптеки" icon as={RouterLink} to={`/pharms/list/${net.PharmId}`}>
                                    <Icon name="hospital" />
                                  </Button>
                                </Button.Group>
                              </Table.Cell>
                            </Table.Row>
                            {showLic == net.PharmId && (
                              <Table.Row>
                                <Table.Cell colSpan="3">
                                  {net.licenses &&
                                    net.licenses.map((item, x) => {
                                      return (
                                        <Label
                                          key={"lic" + x}
                                          as={RouterLink}
                                          to={`/pharms/net/${net.PharmId}/license/${item.license}`}
                                        >
                                          <Icon name="file" /> {item.license} ({item.pharms} аптек)
                                        </Label>
                                      );
                                    })}
                                  <Button floated="right" as={RouterLink} to={`/pharms/net/${net.PharmId}/license/new`}>
                                    <Icon name="plus" />
                                    Добавить
                                  </Button>
                                </Table.Cell>
                              </Table.Row>
                            )}
                          </Fragment>
                        );
                      })}
                    </Table.Body>
                  </Table>
                </Segment>
              </Grid.Column>

              <Grid.Column width={7}>
                <Segment style={{ height: "100%" }} className="squared flex-column no-border raised">
                  <Form onSubmit={this.makeNet}>
                    <Form.Input
                      label="Название сети"
                      name="typeText"
                      value={typeText || ""}
                      onChange={this.handleChange}
                      placeholder="Сеть аптек"
                    />

                    <Form.Input
                      label="Название юрлица"
                      name="title"
                      value={title || ""}
                      onChange={this.handleChange}
                      placeholder="ООО Сеть аптек"
                    />
                    <Form.Input
                      label="Адрес"
                      name="address"
                      value={address || ""}
                      onChange={this.handleChange}
                      placeholder="Укажите адрес"
                    />
                    <Form.Input
                      label="Телефон"
                      name="phone"
                      value={phone || ""}
                      onChange={this.handleChange}
                      placeholder="+7 (000) 000-00-00"
                    />

                    <Button type="submit">Создать</Button>
                  </Form>
                </Segment>
              </Grid.Column>
            </Grid>
          </Segment>
        </div>
      </>
    );
  }
}
export default PharmNets;
