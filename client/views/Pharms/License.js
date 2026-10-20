import React, { Component, Fragment, createRef } from "react";
import { observer, inject } from "mobx-react";

import { Map, Marker, MarkerLayout } from "yandex-map-react";

import { AutoSizer } from "react-virtualized";

import RouterLink from "../../router/a";

import Loader from "../../components/Loader";
import Search from "../../components/Search";
import WorkingHours from "../../components/WorkingHours";

import { Item, List, Button, Menu, Segment, Table, Header, Form, Input, Grid, Icon } from "semantic-ui-react";

import _ from "lodash";

@inject("router", "db", "actions", "pharms")
@observer
class License extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: null,
      sortBy: "TradeName",
      sortDirection: false,
      active: null,
      hours: null,
      workAll: false,
    };
  }
  saveAll = () => {
    this.props.pharms.addLicenseWithPharms();
  };
  sort = (by) => {
    let { sortBy, sortDirection } = this.state;
    this.setState({ sortBy: by, sortDirection: by == sortBy ? !sortDirection : false });
  };

  search = (e) => {
    let { name, value } = e.target;

    this.setState({ searchQuery: value });
  };

  getByLicense = () => {
    this.props.pharms.getPharmsByLicense(this.state.searchQuery);
  };

  getByAddress = () => {
    this.props.pharms.getByAddress("");
  };

  setDaysToPharm = (pharmId, days) => {
    this.props.pharms.licPharms.forEach((pharm, i) => {
      if (pharm.id == pharmId) {
        pharm.days = days;
        this.props.pharms.licPharms[i] = pharm;
      } else if (!pharmId) {
        pharm.days = days;
        this.props.pharms.licPharms[i] = pharm;
      }
    });
  };

  get allReady() {
    let ready = true;
    this.props.pharms.licPharms.forEach((pharm, i) => {
      if (!pharm.days) ready = false;
      // if(!(pharm.location && pharm.location[0]))ready=false
    });
    return ready;
  }

  get pharms() {
    let { searchQuery, sortBy, sortDirection } = this.state;
    let list = [];
    let reg = new RegExp(searchQuery, "ig");
    this.props.pharms.licPharms.forEach((item, i) => {
      // console.log({ item });
      // if (item.TradeName.search(reg) != -1 || searchQuery == "" || searchQuery == null) {
      let { mon, tue, wed, thu, fri, sat, sun } = item;
      // item.days = {
      //   mon,
      //   tue,
      //   wed,
      //   thu,
      //   fri,
      //   sat,
      //   sun,
      // };
      if (mon) {
        list.push({
          ...item,
          id: item._id,
          name: `Аптека ${this.props.pharms.currNet.typeText || ""}`,
          days: { mon, tue, wed, thu, fri, sat, sun },
        });
      } else {
        list.push(item);
      }

      // list.push({ SellingPrice: parseFloat(SellingPrice), Quantity: parseFloat(Quantity), ...other });
      // }
    });
    let dir = sortDirection ? "desc" : "asc";
    list = _.orderBy(list, [sortBy], [dir]);
    return list;
  }

  toggleWorkAll = () => {
    this.setState({ workAll: !this.state.workAll });
  };

  render() {
    let { sortBy, sortDirection, active, hours, workAll } = this.state;
    let dir = sortDirection ? "descending" : "ascending";

    let {
      license,
      name,
      issuing,
      address,
      dateStart,
      dateEnd,
      order,
      ogrn,
      inn,
      orderFresh,
    } = this.props.pharms.currLic;

    return (
      <>
        <div className="scrollwrapper">
          <Segment basic padded="very">
            <Form>
              <Form.Group>
                <Input fluid size="big" onChange={this.search} placeholder="Введите номер лицензии" />
                <Button primary onClick={this.getByLicense}>
                  Найти
                </Button>
              </Form.Group>
            </Form>

            {license && <Button onClick={this.toggleWorkAll}>Задать график работы всем сразу</Button>}
            {license && (
              <Button disabled={!this.allReady} primary onClick={this.saveAll}>
                Сохранить аптеки и лицензию
              </Button>
            )}
            {workAll && (
              <WorkingHours
                onChange={(days) => {
                  this.setDaysToPharm(null, days);
                }}
              />
            )}

            {license && (
              <Grid>
                <Grid.Column width={9}>
                  <Segment raised className="nopaddings">
                    <Table>
                      <Table.Body>
                        {this.pharms.map((pharm, i) => {
                          // console.log(pharm);
                          return (
                            <Fragment key={"pharm" + i}>
                              {!(pharm.location && pharm.location[0]) && (
                                <Table.Row>
                                  <Table.Cell negative colSpan={3}>
                                    Не удалось определить местоположение!
                                  </Table.Cell>
                                </Table.Row>
                              )}
                              <Table.Row negative={!(pharm.location && pharm.location[0])}>
                                <Table.Cell>{pharm.name}</Table.Cell>
                                <Table.Cell>{pharm.address_fact || pharm.Address}</Table.Cell>
                                <Table.Cell collapsing positive={pharm.location && pharm.location[0]}>
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
                                        this.setState({ hours: hours == pharm.id ? null : pharm.id });
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
                              {active == pharm.id && (
                                <Table.Row>
                                  <Table.Cell colSpan={3}></Table.Cell>
                                </Table.Row>
                              )}
                              {hours == pharm.id && (
                                <Table.Row>
                                  <Table.Cell colSpan={3}>
                                    <WorkingHours
                                      days={pharm.days || null}
                                      onChange={(days) => {
                                        this.setDaysToPharm(pharm.id, days);
                                      }}
                                    />
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
                  <Segment className="squared flex-column no-border raised">
                    <Table basic="very" padded>
                      <Table.Row>
                        <Table.Cell>
                          <Header as="h5">
                            <Header.Content>Номер лицензии</Header.Content>
                          </Header>
                        </Table.Cell>
                        <Table.Cell>{license}</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>
                          <Header as="h5">
                            <Header.Content>Сведения о лицензиате </Header.Content>
                          </Header>
                        </Table.Cell>
                        <Table.Cell>{name}</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>
                          <Header as="h5">
                            <Header.Content>Место нахождения лицензиата</Header.Content>
                          </Header>
                        </Table.Cell>
                        <Table.Cell>{address}</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>
                          <Header as="h5">
                            <Header.Content>Код ОГРН/ОГРИП</Header.Content>
                          </Header>
                        </Table.Cell>
                        <Table.Cell>{ogrn}</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>
                          <Header as="h5">
                            <Header.Content>ИНН</Header.Content>
                          </Header>
                        </Table.Cell>
                        <Table.Cell>{inn}</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>
                          <Header as="h5">
                            <Header.Content>Наименование лицензирующего органа </Header.Content>
                          </Header>
                        </Table.Cell>
                        <Table.Cell>{issuing}</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>
                          <Header as="h5">
                            <Header.Content>Дата принятия решения о предоставлении лицензии</Header.Content>
                          </Header>
                        </Table.Cell>
                        <Table.Cell>{order}</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>
                          <Header as="h5">
                            <Header.Content>Дата начала действия лицензии </Header.Content>
                          </Header>
                        </Table.Cell>
                        <Table.Cell>{dateStart}</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>
                          <Header as="h5">Дата окончания действия лицензии</Header>
                        </Table.Cell>
                        <Table.Cell>{dateEnd}</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>
                          <Header as="h5">
                            <Header.Content>
                              Сведения о переоформлении документа, подтверждающего наличие лицензии{" "}
                            </Header.Content>
                          </Header>
                        </Table.Cell>
                        <Table.Cell>{orderFresh}</Table.Cell>
                      </Table.Row>
                    </Table>
                  </Segment>
                </Grid.Column>
              </Grid>
            )}
          </Segment>
          {!this.props.pharms.ready && <Loader message={this.props.pharms.licProcess} />}
        </div>
      </>
    );
  }
}
export default License;
