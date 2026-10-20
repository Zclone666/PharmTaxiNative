import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import MaskedInput from "react-text-mask";

import { Item, List, Divider, Button, Grid, Menu, Segment, Table, Header, Form, Input, Icon } from "semantic-ui-react";

import _ from "lodash";
import moment from "moment";

@inject("router", "db", "actions", "recipes", "dosages", "tools", "assortiment")
@observer
class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeItem: "code",
      showResult: false,
    };
    //this.contextRef = createRef()
  }
  search = (e) => {
    let { name, value } = e.target;
    let { fio } = this.props.recipes.searchObj;
    if (["fio_f", "fio_l", "fio_p"].includes(name)) {
      let fioArr = fio.split(" ");
      if (name == "fio_f") fioArr[0] = value;
      if (name == "fio_l") fioArr[1] = value;
      if (name == "fio_p") fioArr[2] = value;
      value = fioArr.join(" ");
      name = "fio";
    }
    this.props.recipes.searchObj[name] = value;
  };
  setCurrent = (code) => {
    this.props.recipes.setCurrent(code);
  };
  find = async () => {
    let recipe = await this.props.recipes.search();
    // console.log({ recipe });
    if (recipe && recipe.recipe_code) {
      this.props.router.push("/recipe-public/" + recipe.recipe_code);
    }
  };

  handleItemClick = (e, { name }) => {
    this.props.recipes.searchObj.searchType = name;
  };
  renderSearch = () => {
    let { receiptCode, fio, birthdate, snils, searchType } = this.props.recipes.searchObj;
    switch (searchType) {
      case "code":
        return (
          <Form.Group>
            <Form.Field className="fluid">
              <Input
                name="receiptCode"
                icon="search"
                size="big"
                onChange={this.search}
                value={receiptCode}
                placeholder="Введите номер рецепта..."
              />
            </Form.Field>
            <Form.Button onClick={this.find} size="big" primary content="Поиск" />
          </Form.Group>
        );
        break;

      case "snils":
        return (
          <Form.Group>
            <Form.Field className="fluid">
              <Input
                name="snils"
                icon="search"
                size="big"
                placeholder="Введите номер СНИЛС..."
                children={
                  <MaskedInput
                    name="snils"
                    value={snils || ""}
                    onChange={this.search}
                    mask={[/\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, " ", /\d/, /\d/]}
                    placeholder="000-000-000 00"
                  />
                }
              />
            </Form.Field>
            <Form.Button onClick={this.find} size="big" primary content="Поиск" />
          </Form.Group>
        );
        break;

      case "fio":
        return (
          <>
            <Form.Field>
              <Input size="big" name="fio_f" onChange={this.search} placeholder="Фамилия" />
            </Form.Field>

            <Form.Field>
              <Input size="big" name="fio_l" onChange={this.search} placeholder="Имя" />
            </Form.Field>

            <Form.Field>
              <Input size="big" name="fio_p" onChange={this.search} placeholder="Отчество" />
            </Form.Field>

            <Form.Field>
              <Input size="big" name="birthdate" onChange={this.search} placeholder="ДД.ММ.ГГГГ" />
            </Form.Field>

            <Form.Field className="right aligned">
              <Button onClick={this.find} size="big" primary content="Поиск" />
            </Form.Field>
          </>
        );

        break;
      default:
    }
  };

  render() {
    const { activeItem, showResult } = this.state;
    let {
      ready,
      found,
      searchObj: { receiptCode, fio, birthdate, snils, searchType },
    } = this.props.recipes;
    return (
      <div className="scrollwrapper">
        <Segment basic padded="very">
          <Menu className="no-border" pointing secondary>
            <Menu.Item header>
              <Header as="h2">Поиск рецепта:</Header>
            </Menu.Item>

            <Menu.Item name="code" active={searchType === "code"} onClick={this.handleItemClick}>
              {" "}
              <Header as="h2">Номер</Header>
            </Menu.Item>

            <Menu.Item name="snils" active={searchType === "snils"} onClick={this.handleItemClick}>
              {" "}
              <Header as="h2">СНИЛС</Header>
            </Menu.Item>

            {false && (
              <Menu.Item name="fio" active={searchType === "fio"} onClick={this.handleItemClick}>
                {" "}
                <Header as="h2">ФИО и дата рождения</Header>
              </Menu.Item>
            )}
          </Menu>
          <Divider hidden fitted />

          <Grid>
            {showResult ? (
              <Grid.Column width={16}>
                <Form></Form>
              </Grid.Column>
            ) : (
              <Grid.Column width={16}>
                <Form>{this.renderSearch()}</Form>
              </Grid.Column>
            )}
          </Grid>
          <Grid>
            <Grid.Column width={7}>
              <List divided animated>
                {found.map((recipe, i) => {
                  // console.log({ recipe });
                  let drugs = [];
                  recipe.liquids.forEach((item, i) => {
                    if (item.drugs) {
                      item.drugs.forEach((drug, i) => {
                        drugs.push(drug);
                      });
                    }
                  });

                  return (
                    <List.Item>
                      <List.Content floated="right">
                        <Button
                          onClick={() => this.setCurrent(recipe.recipe_code)}
                          as={RouterLink}
                          to={`/recipe-public/${recipe.recipe_code}`}
                        >
                          Показать
                        </Button>
                      </List.Content>
                      <List.Content>
                        <List.Header>
                          <Header>{recipe.recipe_code}</Header> форма {recipe.NameForm}
                        </List.Header>
                        {drugs.length} препаратов
                      </List.Content>
                    </List.Item>
                  );
                })}
              </List>
            </Grid.Column>
          </Grid>
        </Segment>
      </div>
    );
  }
}
export default Search;
