import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import { Map, Marker, MarkerLayout } from "yandex-map-react";

import { AutoSizer } from "react-virtualized";

import RouterLink from "../../router/a";

import Spinner from "../../components/Spinner";
import Scanner from "../../components/Scanner";
import Search from "../../components/Search";

import AddPharm from "./AddPharm";

import WorkingHours from "../../components/WorkingHours";

import { Item, List, Button, Menu, Segment, Table, Header, Form, Input, Grid, Icon } from "semantic-ui-react";

import _ from "lodash";

@inject("router", "db", "actions", "pharms")
@observer
class Pharms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: null,
      sortBy: "TradeName",
      sortDirection: false,
      active: null,
      hours: null,
      addPharm: false,
    };
  }

  setDaysToPharm = (pharmId, days) => {
    this.props.pharms.my.data.forEach((pharm, i) => {
      if (pharm._id == pharmId) {
        pharm.days = days;
        this.props.pharms.my.data.set(pharm._id, pharm);
      }
    });
  };

  sort = (by) => {
    let { sortBy, sortDirection } = this.state;
    this.setState({ sortBy: by, sortDirection: by == sortBy ? !sortDirection : false });
  };

  search = (e) => {
    let { name, value } = e.target;
    this.setState({ searchQuery: value });
  };

  get pharms() {
    let { searchQuery, sortBy, sortDirection } = this.state;
    let list = [];
    let reg = new RegExp(searchQuery, "ig");
    // console.log({ size: this.props.pharms.my.data.size });
    this.props.pharms.my.data.forEach((item, i) => {
      if (item.ParentId == this.props.pharms.currNet.PharmId) {
        list.push(item);
      }
      // console.log({ item });
      // if (item.TradeName.search(reg) != -1 || searchQuery == "" || searchQuery == null) {
      // let { SellingPrice, Quantity, ...other } = item;

      // list.push({ SellingPrice: parseFloat(SellingPrice), Quantity: parseFloat(Quantity), ...other });
      // }
    });
    let dir = sortDirection ? "desc" : "asc";
    list = _.orderBy(list, [sortBy], [dir]);
    return list;
  }

  render() {
    let { sortBy, sortDirection, active, hours, addPharm } = this.state;
    let dir = sortDirection ? "descending" : "ascending";
    return (
      <>
        <div className="scrollwrapper">
          <Segment basic padded="very">
            <Grid>
              <Grid.Column width={9}>
                <Header as="h2">Мои аптеки</Header>
              </Grid.Column>

              <Grid.Column width={7}>
                <Button floated="right" onClick={() => this.setState({ addPharm: !addPharm })}>
                  <Icon name="plus" />
                  {!addPharm ? "Добавить" : "Отмена"}
                </Button>
              </Grid.Column>
            </Grid>
            <Form>
              <Form.Group widths={2}>
                <Form.Field>
                  <Input icon="search" size="big" onChange={this.search} placeholder="Поиск..." />
                </Form.Field>
              </Form.Group>
            </Form>

            <Grid>
              <Grid.Column width={11}>
                <Segment raised className="nopaddings">
                  <Table celled striped sortable>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell
                          sorted={sortBy === "TradeName" ? dir : null}
                          onClick={() => this.sort("TradeName")}
                        >
                          Название
                        </Table.HeaderCell>

                        <Table.HeaderCell
                          sorted={sortBy === "SellingPrice" ? dir : null}
                          onClick={() => this.sort("SellingPrice")}
                        >
                          Адрес
                        </Table.HeaderCell>

                        <Table.HeaderCell
                          collapsing
                          sorted={sortBy === "Quantity" ? dir : null}
                          onClick={() => this.sort("Quantity")}
                        >
                          Телефон
                        </Table.HeaderCell>

                        <Table.HeaderCell collapsing></Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>

                    <Table.Body>
                      {this.pharms.map((pharm, i) => {
                        return (
                          <Table.Row key={"pharm" + i}>
                            <Table.Cell>{pharm.Name}</Table.Cell>
                            <Table.Cell>{pharm.Address}</Table.Cell>
                            <Table.Cell>{pharm.Phone}</Table.Cell>
                            <Table.Cell>
                              <Button.Group vertical>
                                <Button
                                  icon
                                  onClick={() => {
                                    this.setState({ active: active == pharm.id ? null : pharm.id });
                                  }}
                                >
                                  <Icon name="edit" />
                                </Button>
                                <Button
                                  icon
                                  positive={!!pharm.days}
                                  onClick={() => {
                                    this.setState({ hours: hours == pharm._id ? null : pharm._id });
                                  }}
                                >
                                  <Icon name="clock" />
                                </Button>
                                {!(pharm.location && pharm.location[0]) && (
                                  <Button icon onClick={() => {}}>
                                    <Icon name="map marker alternate" />
                                  </Button>
                                )}
                              </Button.Group>
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table>
                </Segment>
              </Grid.Column>

              <Grid.Column width={5}>
                <Segment style={{ height: "100%" }} className="squared flex-column no-border raised">
                  {addPharm ? (
                    <AddPharm />
                  ) : (
                    <>
                      {hours && (
                        <WorkingHours
                          onChange={(days) => {
                            this.setDaysToPharm(hours, days);
                          }}
                        />
                      )}
                      <AutoSizer>
                        {({ height, width }) => (
                          <Map
                            onAPIAvailable={function () {
                              console.log("Map API loaded");
                            }}
                            center={[55.754734, 37.583314]}
                            zoom={10}
                            height={height > 500 ? 500 : height}
                            width={width}
                          >
                            {this.pharms.map((pharm, i) => {
                              if (pharm.location && pharm.location[0]) {
                                return <Marker lat={pharm.location[0]} lon={pharm.location[1]} />;
                              } else return null;
                            })}
                          </Map>
                        )}
                      </AutoSizer>
                    </>
                  )}
                </Segment>
              </Grid.Column>
            </Grid>
          </Segment>
        </div>
      </>
    );
  }
}
export default Pharms;
