import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import { Item, Divider, Label, Button, Grid, Menu, Segment, Table, Header, Form, Input, Icon } from "semantic-ui-react";

import _ from "lodash";
import moment from "moment";

import RecipeInfo from "./RecipeInfo";
import RecipeSelection from "./RecipeSelection";

import { statuses, statusColors, statusLevels } from "./statuses";

@inject("router", "db", "actions", "recipes", "dosages", "tools", "assortiment")
@observer
class Recipe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showType: "info",
      sortBy: "name",
      selected: null,
    };
    //this.contextRef = createRef()
  }
  handleItemClick = (e, { name }) => {
    this.setState({ showType: name });
  };

  handleSelectDrug = (drug) => {
    this.props.assortiment.getAvailable(drug);
    this.setState({ selected: drug.key, showType: "fp" });
  };

  handleReleaseDrug = (drug, flag) => {
    //flag = true - списать полностью
    this.props.recipes.releaseDrug(drug, flag);
    // this.setState({ selected: drug.key, showType: "fp" });
  };

  renderRules(drug) {
    let {
      dosages: { getFromBase },
      tools: { names, shortnames, round, UIText },
      // drugKey,
    } = this.props;

    // let drug = _.cloneDeep(this.props.drugs.drug.get(drugKey));

    let { freq, freq_id, duration, duration_id, calc, dosage, helpers, schedule } = drug;

    helpers = helpers || {};
    let { finishAlternate } = schedule || {};

    let arr = [];

    if (calc && calc.fullDosage) {
      // && helpers.dosage && helpers.dosage.id) {
      let dosageValue = getFromBase(drug.calc.dosageUnit, calc.fullDosage);
      // console.log({ dosageValue });
      let dosageName = shortnames[drug.calc.dosageUnit] || names[drug.calc.dosageUnit];
      if (dosageValue && dosageValue[0] && dosageValue[0] > 0)
        arr.fullDosage = `${_.map(dosageValue, (dos) => parseFloat(round(dos))).join(" + ")} ${dosageName}`;
    }

    if (helpers.dosage) {
      arr.dosage = helpers.dosage.small || helpers.dosage.full;
    }

    if (dosage.form && names[dosage.form]) {
      arr.form = names[dosage.form];
    } else if (dosage.form) {
      arr.form = dosage.form;
    }

    if (dosage.method && names[dosage.method]) {
      arr.method = names[dosage.method];
    } else if (dosage.method) {
      arr.method = dosage.method;
    }

    if (freq_id && UIText.freq[freq_id]) {
      arr.freq = UIText.freq[freq_id];
    } else if (freq) {
      arr.freq = freq;
    }
    if (duration_id && UIText.duration[duration_id]) {
      arr.duration = UIText.duration[duration_id];
    } else if (duration) {
      arr.duration = duration;
    }
    if (finishAlternate && UIText.duration[finishAlternate]) arr.finishAlternate = UIText.duration[finishAlternate];

    let top = [];
    let bottom = [];
    let advanced = [];

    arr.form && top.push(arr.form);
    arr.dosage && top.push(arr.dosage);

    arr.method && bottom.push(arr.method);
    arr.fullDosage && bottom.push(arr.fullDosage);

    arr.freq && advanced.push(arr.freq);
    arr.duration && advanced.push(arr.duration);
    arr.finishAlternate && advanced.push(arr.finishAlternate);
    // console.log({ arr, top, bottom, advanced });
    return { arr, top, bottom, advanced };
  }

  render() {
    let { current } = this.props.recipes;
    let { showType, sortBy, selected } = this.state;
    let isValid = parseInt(current.dateEnd) > parseInt(moment().format("x"));
    console.log({ current });
    let { drugStatuses } = current;
    return (
      <div className="scrollwrapper">
        <Segment basic padded="very">
          <Menu className="no-border" pointing secondary>
            <Menu.Item as={RouterLink} to="/recipes/search" className="button ">
              <Icon name="left arrow" />
              Назад к поиску
            </Menu.Item>
          </Menu>
          <Grid>
            <Grid.Column width={6}>
              <Menu className="no-border" pointing secondary>
                <Menu.Item header>
                  <Header as="h2">Рецепт номер {current.recipe_code}</Header>
                </Menu.Item>
              </Menu>

              {current.idStatus > 1 ? (
                <Label className={statusColors[current.idStatus]}>{statuses[current.idStatus]}</Label>
              ) : (
                <Button color="blue" onClick={this.handleReleaseDrug}>
                  Отоварить рецепт полностью
                </Button>
              )}
              <Divider hidden />
              <Segment raised className="nopaddings">
                <Table basic="very" celled sortable padded>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell
                        sorted={sortBy === "TradeName" ? dir : null}
                        onClick={() => this.sort("TradeName")}
                      >
                        Наименование
                      </Table.HeaderCell>

                      {false && (
                        <Table.HeaderCell
                          sorted={sortBy === "SellingPrice" ? dir : null}
                          onClick={() => this.sort("SellingPrice")}
                        >
                          Кол-во
                        </Table.HeaderCell>
                      )}

                      <Table.HeaderCell collapsing></Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {current &&
                      current.liquids &&
                      current.liquids.map((liquid, i) => {
                        return (
                          liquid &&
                          liquid.drugs &&
                          liquid.drugs.map((drug, n) => {
                            // let drug = drug1.drug;
                            let rows = this.renderRules(drug);
                            let statusObj = _.find(drugStatuses, (o) => {
                              return o.key == drug.key;
                            });
                            let status = drug.idStatus || 0;
                            // console.log(rows);
                            return (
                              <Table.Row
                                warning={statusLevels[status] == "warning"}
                                positive={statusLevels[status] == "positive"}
                                negative={statusLevels[status] == "negative"}
                                active={statusLevels[status] == "active"}
                                disabled={
                                  statusLevels[status] == "warning" ||
                                  statusLevels[status] == "negative" ||
                                  statusLevels[status] == ""
                                }
                                key={"drugrow" + n}
                              >
                                <Table.Cell>
                                  <Header as="h5">
                                    <Header.Content>
                                      {drug.mnnname} ({statuses[status]})
                                      <Header.Subheader>
                                        {rows.top.length > 0 && rows.top.join(", ")}
                                        <br />
                                        {rows.bottom.length > 0 && rows.bottom.join(", ")}
                                        <br />
                                        {rows.advanced.length > 0 && rows.advanced.join(", ")}
                                      </Header.Subheader>
                                    </Header.Content>
                                  </Header>
                                </Table.Cell>
                                {false && <Table.Cell>{drug.calc && drug.calc.count}</Table.Cell>}
                                <Table.Cell style={{ padding: 0 }}>
                                  {current.idStatus < 2 && status < 2 ? (
                                    <Button.Group vertical size="tiny">
                                      <Button onClick={() => this.handleSelectDrug(drug)}>подобрать</Button>
                                      <Button color="teal" onClick={() => this.handleReleaseDrug(drug, false)}>
                                        выдать частично
                                      </Button>
                                      <Button color="blue" onClick={() => this.handleReleaseDrug(drug, true)}>
                                        выдать полностью
                                      </Button>
                                    </Button.Group>
                                  ) : null}

                                  {selected == drug.key && (
                                    <div style={{ position: "relative", width: 0, float: "right" }}>
                                      <div style={{ right: -50, top: -4, position: "absolute" }}>
                                        <Icon size="big" name="right angle" />
                                      </div>
                                    </div>
                                  )}
                                </Table.Cell>
                              </Table.Row>
                            );
                          })
                        );
                      })}
                  </Table.Body>
                </Table>
              </Segment>
            </Grid.Column>
            <Grid.Column width={10}>
              <Menu className="no-border" pointing secondary>
                <Menu.Item as="a" name="info" active={showType === "info"} onClick={this.handleItemClick}>
                  {" "}
                  <Header as="h2">Инфо о рецепте</Header>
                </Menu.Item>

                <Menu.Item as="a" name="fp" active={showType === "fp"} onClick={this.handleItemClick}>
                  {" "}
                  <Header as="h2">Подбор ФП</Header>
                </Menu.Item>
              </Menu>
              <Divider hidden />
              {showType == "info" && <RecipeInfo />}
              {showType == "fp" && <RecipeSelection current={selected} />}
            </Grid.Column>
          </Grid>
        </Segment>
      </div>
    );
  }
}
export default Recipe;
