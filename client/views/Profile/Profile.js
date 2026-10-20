import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import { Map, Marker, MarkerLayout } from "yandex-map-react";

import { AutoSizer } from "react-virtualized";

import RouterLink from "../../router/a";

import { Item, List, Button, Menu, Segment, Table, Header, Form, Input, Grid, Icon } from "semantic-ui-react";

import _ from "lodash";

@inject("router", "user", "pharms")
@observer
class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeItem: "Мои данные",
    };
  }

  logout = () => {
    console.log("logout!");
    this.props.user.logout();
  };

  handleItemClick = (e, { name }) => {
    // this.props.db.getBarcodeInfo();
    this.setState({ activeItem: name });
  };

  get pharms() {
    let list = [];
    this.props.pharms.my.data.forEach((item, i) => {
      list.push(item);
    });
    return list;
  }

  render() {
    const { activeItem } = this.state;
    let { firstname, lastname, patronymic } = this.props.user.me || {};
    return (
      <div className="scrollwrapper">
        <Segment basic padded="very">
          <Grid>
            <Grid.Column width={9}>
              <Header as="h2">Мой профиль</Header>
            </Grid.Column>

            <Grid.Column width={7}></Grid.Column>
          </Grid>

          <Grid>
            <Grid.Column width={4}>
              <Menu size="large" fluid pointing secondary vertical>
                <Menu.Item name="Мои данные" active={activeItem === "Мои данные"} onClick={this.handleItemClick} />
                <Menu.Item name="Мои аптеки" active={activeItem === "Мои аптеки"} onClick={this.handleItemClick} />
                <Menu.Item name="Выйти" active={activeItem === "Выйти"} onClick={() => this.logout()} />
              </Menu>
            </Grid.Column>
            {false && (
              <Grid.Column width={5}>
                <Segment style={{ height: "100%" }} className="squared flex-column no-border raised">
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
                </Segment>
              </Grid.Column>
            )}
            <Grid.Column width={12}>
              <Segment style={{ height: "100%" }} className="squared flex-column no-border raised">
                {activeItem === "Мои данные" && (
                  <Form>
                    <Form.Group widths="equal">
                      <Form.Field>
                        <label>Фамилия</label>
                        <Input fluid placeholder="Иванов" value={lastname} />
                      </Form.Field>
                      <Form.Field>
                        <label>Имя</label>
                        <Input fluid placeholder="Иван" value={firstname} />
                      </Form.Field>
                      <Form.Field>
                        <label>Отчество</label>
                        <Input fluid placeholder="Иванович" value={patronymic} />
                      </Form.Field>
                    </Form.Group>
                  </Form>
                )}
                {activeItem === "Мои аптеки" && (
                  <List>
                    {this.pharms.map((item, i) => {
                      // console.log(item);
                      return (
                        <List.Item key={"pharm" + i}>
                          <List.Icon name={this.props.user.currPharm == item.PharmId ? "check" : "marker"} />
                          <List.Content>
                            <List.Header>Аптека ID: {item.PharmId}</List.Header>
                            <List.Description>{item.Address}</List.Description>
                          </List.Content>
                        </List.Item>
                      );
                    })}
                  </List>
                )}
              </Segment>
            </Grid.Column>
          </Grid>
        </Segment>
      </div>
    );
  }
}
export default Profile;
