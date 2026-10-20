import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import { Map, Marker, MarkerLayout } from "yandex-map-react";

import { AutoSizer } from "react-virtualized";

import RouterLink from "../../router/a";

import WorkingHours from "../../components/WorkingHours";

import { Item, List, Button, Menu, Segment, Table, Header, Form, Input, Grid, Icon } from "semantic-ui-react";

import _ from "lodash";

@inject("router", "db", "actions", "pharms")
@observer
class AddPharm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  makePharm = () => {};
  handleChange = () => {};
  render() {
    let { sortBy, sortDirection, active, hours } = this.state;
    let dir = sortDirection ? "descending" : "ascending";
    let { typeText, title, address, phone } = { typeText: "", title: "", address: "", phone: "" };
    return (
      <Form onSubmit={this.makePharm}>
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
    );
  }
}
export default AddPharm;
