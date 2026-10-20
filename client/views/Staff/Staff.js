import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import Spinner from "../../components/Spinner";
import Scanner from "../../components/Scanner";
import Search from "../../components/Search";

import {
  Item,
  Icon,
  List,
  Button,
  Message,
  Menu,
  Segment,
  Table,
  Header,
  Form,
  Input,
  Grid,
  Label,
} from "semantic-ui-react";

import _ from "lodash";

@inject("router", "db", "actions", "pharms", "user")
@observer
class Staff extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: null,
      sortBy: "TradeName",
      sortDirection: false,
      showAproved: true,
      showNotAproved: true,
    };
  }

  sort = (by) => {
    let { sortBy, sortDirection } = this.state;
    this.setState({ sortBy: by, sortDirection: by == sortBy ? !sortDirection : false });
  };

  search = (e) => {
    // let { name, value } = e.target;
    // this.setState({ pharmQuery: value });
  };

  createInvite = () => {
    this.props.pharms.createInvite();
  };

  handleChange = (e, { name, value }) => {
    this.props.actions.inviteForm[name] = value;
  };

  handleSearchChange = (e, { value }) => {
    value = value.replaceAll("\\", "").replaceAll("/", "");
    this.setState({ pharmQuery: value });
  };

  handleResultSelect = async (e, { result }) => {
    console.log({ result });
    this.props.actions.inviteForm.pharmId = result.PharmId;
    this.setState({ pharmQuery: "" });
    // await this.props.drugs.selectFromSearch(result);
  };

  resultRenderer = ({ Address }) => {
    return <div>{Address}</div>;
  };
  get results() {
    let { pharmQuery, sortBy, sortDirection } = this.state;
    let list = [];
    let reg = new RegExp(pharmQuery, "ig");
    // console.log(this.props.pharms.my.data.size);
    this.props.pharms.my.data.forEach((item, i) => {
      if (item.Address.search(reg) != -1 || pharmQuery == "" || pharmQuery == null) {
        list.push(item);
      }
    });
    return list;
  }
  get users() {
    let { searchQuery, sortBy, sortDirection, showAproved, showNotAproved } = this.state;
    let list = [];
    let reg = new RegExp(searchQuery, "ig");
    this.props.user.my.data.forEach((user, i) => {
      // if (item.Address.search(reg) != -1 || searchQuery == "" || searchQuery == null) {

      let pharms = [];
      if (user.pharms && user.pharms.length) {
        user.pharms.forEach((item, i) => {
          let pharm = this.props.pharms.my.data.get(parseInt(item));
          if (user.email == "22st_man@yopmail.com") {
            console.log(item);
            console.log(pharm);
          }
          pharms.push((pharm && pharm.Address) || "");
        });
        // item.pharms = pharms;
      }
      if (user.isEmailConfirmed && showAproved) {
        list.push({ ...user, pharms: pharms });
      }
      if (!user.isEmailConfirmed && showNotAproved) {
        list.push({ ...user, pharms: pharms });
      }

      // }
    });
    return list;
  }

  get orders() {
    let { searchQuery, sortBy, sortDirection } = this.state;
    let list = [];
    let reg = new RegExp(searchQuery, "ig");
    this.props.db.orders.data.forEach((item, i) => {
      console.log({ item });
      // if (item.TradeName.search(reg) != -1 || searchQuery == "" || searchQuery == null) {
      let { SellingPrice, Quantity, ...other } = item;
      list.push(item);
      // list.push({ SellingPrice: parseFloat(SellingPrice), Quantity: parseFloat(Quantity), ...other });
      // }
    });
    let dir = sortDirection ? "desc" : "asc";
    list = _.orderBy(list, [sortBy], [dir]);
    return list;
  }

  render() {
    let { sortBy, sortDirection, searchQuery, showAproved, showNotAproved, pharmQuery } = this.state;
    let dir = sortDirection ? "descending" : "ascending";
    let { email, pharmId, firstname, lastname, patronymic } = this.props.actions.inviteForm;
    let choosedPharm = this.props.pharms.my.data.get(pharmId);
    // console.log(choosedPharm, {email, pharmId});
    return (
      <>
        <div className="scrollwrapper">
          <Segment basic padded="very">
            <Header as="h2">Сотрудники</Header>
            <Grid>
              <Grid.Column width={9}>
                <Form>
                  <Form.Field>
                    <Input icon="search" size="big" onChange={this.search} placeholder="Поиск..." />
                  </Form.Field>
                </Form>
              </Grid.Column>

              {false && (
                <Grid.Column width={7}>
                  <Button floated="right">
                    <Icon name="plus" />
                    Добавить
                  </Button>
                </Grid.Column>
              )}
            </Grid>
            <Grid>
              <Grid.Column width={9}>
                <Label
                  as="a"
                  color={showAproved ? "blue" : "grey"}
                  onClick={() => this.setState({ showAproved: !showAproved })}
                >
                  Подтвержден
                </Label>
                <Label
                  as="a"
                  color={showNotAproved ? "blue" : "grey"}
                  onClick={() => this.setState({ showNotAproved: !showNotAproved })}
                >
                  Не подтвержден
                </Label>
              </Grid.Column>

              <Grid.Column width={7}></Grid.Column>
            </Grid>
            <Grid>
              <Grid.Column width={11}>
                <Segment raised className="nopaddings no-border">
                  <Table celled striped sortable className="no-border">
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell
                          sorted={sortBy === "TradeName" ? dir : null}
                          onClick={() => this.sort("TradeName")}
                        >
                          ФИО
                        </Table.HeaderCell>

                        <Table.HeaderCell
                          sorted={sortBy === "SellingPrice" ? dir : null}
                          onClick={() => this.sort("SellingPrice")}
                        >
                          Аптека
                        </Table.HeaderCell>

                        <Table.HeaderCell
                          collapsing
                          sorted={sortBy === "Quantity" ? dir : null}
                          onClick={() => this.sort("Quantity")}
                        >
                          Логин
                        </Table.HeaderCell>

                        <Table.HeaderCell
                          collapsing
                          sorted={sortBy === "Role" ? dir : null}
                          onClick={() => this.sort("Role")}
                        >
                          Роль
                        </Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>

                    <Table.Body>
                      {this.users.map((user) => {
                        // console.log(user);
                        return (
                          <Table.Row>
                            <Table.Cell>
                              {user.lastname} {user.firstname} {user.patronymic}
                            </Table.Cell>
                            <Table.Cell>
                              {user.pharms.map((item) => {
                                return <Label>{item}</Label>;
                              })}
                            </Table.Cell>
                            <Table.Cell>
                              {user.isEmailConfirmed && <Icon name="check" />} {user.email}
                            </Table.Cell>
                            <Table.Cell>Провизор</Table.Cell>
                          </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table>
                </Segment>
              </Grid.Column>

              <Grid.Column width={5}>
                <Segment style={{ height: "100%" }} className="squared flex-column no-border raised">
                  <Form onSubmit={this.makeNet}>
                    {false && (
                      <Form.Input
                        label="ФИО"
                        name="typeText"
                        value={""}
                        onChange={this.handleChange}
                        placeholder="Введите ФИО"
                      />
                    )}

                    {false && (
                      <Form.Input
                        label="Должность"
                        name="title"
                        value={""}
                        onChange={this.handleChange}
                        placeholder="Провизор"
                      />
                    )}

                    <Form.Field required>
                      <label>Выберите аптеку</label>

                      <Search
                        placeholder="Укажите рабочий адрес"
                        fluid
                        height={200}
                        loading={false}
                        onResultSelect={this.handleResultSelect}
                        onSearchChange={this.handleSearchChange}
                        noResultsMessage="Ничего не найдено."
                        results={this.results}
                        value={pharmQuery}
                        resultRenderer={this.resultRenderer}
                        resultClassName="result-wrapper"
                        icon="search"
                      />

                      {pharmId && (
                        <Message
                          onDismiss={() => this.handleChange(null, { name: "pharmId", value: null })}
                          header="Аптека"
                          content={(choosedPharm && choosedPharm.Address) || ""}
                        />
                      )}
                    </Form.Field>

                    <Form.Input
                      label="E-mail"
                      required
                      name="email"
                      value={email}
                      onChange={this.handleChange}
                      placeholder="admin@mail.ru"
                    />

                    <Form.Input
                      label="Фамилия"
                      required
                      name="lastname"
                      value={lastname}
                      onChange={this.handleChange}
                      placeholder="Иванов"
                    />
                    <Form.Input
                      label="Имя"
                      required
                      name="firstname"
                      value={firstname}
                      onChange={this.handleChange}
                      placeholder="Иван"
                    />
                    <Form.Input
                      label="Отчество"
                      name="patronymic"
                      value={patronymic}
                      onChange={this.handleChange}
                      placeholder="Иванович"
                    />

                    <Button disabled={!(email && pharmId)} type="submit" onClick={this.createInvite}>
                      Пригласить
                    </Button>
                  </Form>
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
export default Staff;
