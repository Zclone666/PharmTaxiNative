import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import { Item, Divider, Button, Grid, Menu, Segment, Table, Header, Form, Input, Icon } from "semantic-ui-react";

import _ from "lodash";
import moment from "moment";

@inject("recipes")
@observer
class RecipeInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    let { current } = this.props.recipes;
    let isValid = parseInt(current.dateEnd) > parseInt(moment().format("x"));
    return (
      <>
        <Header as="h3">
          <Header.Content>
            Рецепт {current.isAdult === false ? "детский" : "взрослый"}
            <Header.Subheader>Бланк {current.NameForm}</Header.Subheader>
          </Header.Content>
        </Header>
        <RouterLink to={`/recipe-public/${current.recipe_code}`}>Посмотреть бланк</RouterLink>
        <Table basic="very" padded>
          <Table.Row>
            <Table.Cell>
              <Header as="h5">
                <Header.Content>Дата выдачи рецепта</Header.Content>
              </Header>
            </Table.Cell>
            <Table.Cell>{moment(current.dateStart, "x").format("DD.MM.YYYY")}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <Header as="h5">
                <Header.Content>ФИО пациента</Header.Content>
              </Header>
            </Table.Cell>
            <Table.Cell>{current.patient && current.patient.fio}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <Header as="h5">
                <Header.Content>ФИО врача</Header.Content>
              </Header>
            </Table.Cell>
            <Table.Cell>{current.names[current.idDoc] || current.idDoc}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <Header as="h5" color={isValid ? "green" : "red"}>
                Рецепт действителен в течение
              </Header>
            </Table.Cell>
            <Table.Cell>
              <Header as="h5" color={isValid ? "green" : "red"}>
                {current.dateEndItem && current.dateEndItem.name}
                {!isValid && (
                  <>
                    <br />
                    Внимание! Рецепт просрочен!
                  </>
                )}
              </Header>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <Header as="h5">
                <Header.Content>Комментарий от врача</Header.Content>
              </Header>
            </Table.Cell>
            <Table.Cell>{current.dTextComment || ""}</Table.Cell>
          </Table.Row>
          {false && (
            <Table.Row>
              <Table.Cell>
                <Header as="h5">
                  <Header.Content>Комментарий от фармацевта</Header.Content>
                </Header>
              </Table.Cell>
              <Table.Cell></Table.Cell>
            </Table.Row>
          )}
        </Table>
      </>
    );
  }
}
export default RecipeInfo;
