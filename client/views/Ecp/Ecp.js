import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import Spinner from "../../components/Spinner";
import Search from "../../components/Search";

import {
  Item,
  Button,
  Menu,
  Segment,
  Table,
  Header,
  Form,
  Input,
  Accordion,
  Message,
  Label,
  Feed,
  List,
} from "semantic-ui-react";

import _ from "lodash";

@inject("router", "db", "actions", "ecp")
@observer
class Ecp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: null,
      sortBy: "TradeName",
      sortDirection: false,
    };
    //this.contextRef = createRef()
  }

  sort = (by) => {
    let { sortBy, sortDirection } = this.state;
    this.setState({ sortBy: by, sortDirection: by == sortBy ? !sortDirection : false });
  };

  get assortiment() {
    let { searchQuery, sortBy, sortDirection } = this.state;
    let assortiment =
      (this.props.db.assortiment.data.size > 0 && Array.from(this.props.db.assortiment.data.values())) || [];
    let list = [];
    let reg = new RegExp(searchQuery, "ig");
    assortiment.forEach((item, i) => {
      if (item.TradeName.search(reg) != -1 || searchQuery == "" || searchQuery == null) {
        let { SellingPrice, Quantity, ...other } = item;
        list.push({ SellingPrice: parseFloat(SellingPrice), Quantity: parseFloat(Quantity), ...other });
      }
    });
    let dir = sortDirection ? "desc" : "asc";
    list = _.orderBy(list, [sortBy], [dir]);
    return list;
  }

  handleResultSelect = async (e, { name, result }) => {
    // console.log({ name, result });
    //let newName = name === 'co_disease' ? 'disease' : name
    await this.props.ecp.selectDrug(result);
    this.setState({ [`search_drugs`]: "" });
  };

  handleSearchChange = (e, { name, value }) => {
    this.setState({ [`search_drugs`]: value });
    if (value.length > 1) {
      this.props.ecp.searchReady = false;
      this.props.ecp.search(value);
    }
  };

  resultRenderer = ({ name, level, tn, type }) => {
    return (
      <div>
        {name}
        {type === "TN" && <sup>TM</sup>}
      </div>
    );
  };

  renderHtml = (item) => {
    return <Segment basic dangerouslySetInnerHTML={{ __html: item.text }}></Segment>;
  };
  renderList = (item) => {
    return (
      <Segment basic>
        <Feed>
          {item.items &&
            _.map(item.items, (listitem, i) => {
              return (
                <Feed.Event key={"infoItem" + i}>
                  <Feed.Content>
                    {listitem.bold ? (
                      <Feed.Summary style={{ fontWeight: 700 }}>{listitem.text}</Feed.Summary>
                    ) : (
                      <Feed.Summary style={{ fontWeight: 700 }} id="wrapImportant">
                        {listitem.code} <span style={{ fontWeight: "normal" }}>{listitem.text}</span>
                      </Feed.Summary>
                    )}
                  </Feed.Content>
                </Feed.Event>
              );
            })}
        </Feed>
      </Segment>
    );
  };
  renderText = (item) => {
    return <Segment basic>{item.text}</Segment>;
  };

  renderTree(items, parent) {
    let iteratable = _.keys(items);
    return iteratable.map((id) => {
      let item = items[id];
      if ((!item.parent_ids && !parent) || (item.parent_ids && item.parent_ids.includes(parent))) {
        return (
          <List.Item key={id}>
            {item.bold ? (
              <List.Icon name="chevron circle right" size="small" />
            ) : (
              <List.Icon name="circle" size="small" />
            )}
            <List.Content>
              <List.Description>
                <strong>{item.code}</strong> {item.bold ? <strong>{item.text}</strong> : item.text}
              </List.Description>
              {item.child_ids && item.child_ids.length > 0 && <List.List>{this.renderTree(items, id)}</List.List>}
            </List.Content>
          </List.Item>
        );
      } else {
        return null;
      }
    });
  }

  get infoCalc() {
    let { current, info } = this.props.ecp;
    let currInfo = info[current.key];
    if (currInfo) {
      return currInfo.itemsCalc.map((item, i) => {
        return {
          key: `panel-${i}`,
          title: {
            content: <Label content={item.title} />,
          },
          content: {
            content: (
              <div style={{ paddingLeft: 20 }}>
                {
                  {
                    string: this.renderText(item),
                    list: this.renderList(item),
                    tree: <List>{this.renderTree(item.items, null)}</List>,
                    html: this.renderHtml(item),
                  }[item.type]
                }
              </div>
            ),
          },
        };
      });
    } else {
      return null;
    }
  }

  get infoIns() {
    let { current, info } = this.props.ecp;
    let currInfo = info[current.key];
    if (currInfo) {
      return currInfo.itemsInstr.map((item, i) => {
        return {
          key: `panel2-${i}`,
          title: {
            content: <Label content={item.title} />,
          },
          content: {
            content: (
              <div style={{ paddingLeft: 20 }}>
                {
                  {
                    string: this.renderText(item),
                    list: this.renderList(item),
                    tree: <List>{this.renderTree(item.items, null)}</List>,
                    html: this.renderHtml(item),
                  }[item.type]
                }
              </div>
            ),
          },
        };
      });
    } else {
      return null;
    }
  }

  render() {
    let { sortBy, sortDirection, search_drugs } = this.state;
    let { searchRows, searchReady } = this.props.ecp;
    let dir = sortDirection ? "descending" : "ascending";
    return (
      <>
        <div className="scrollwrapper">
          <Segment basic>
            <Header as="h2">Справочник лекараственных средств</Header>
            <Form>
              <Form.Group widths={2}>
                <Form.Field>
                  <Search
                    fluid
                    size="big"
                    name="drugs"
                    loading={!searchReady}
                    onResultSelect={this.handleResultSelect}
                    onSearchChange={_.debounce(this.handleSearchChange, 500, {
                      leading: true,
                    })}
                    results={searchRows}
                    value={search_drugs}
                    resultRenderer={this.resultRenderer}
                    resultClassName="result-wrapper"
                  />
                </Form.Field>
              </Form.Group>
            </Form>
            <Header>Информация</Header>
            <Accordion defaultActiveIndex={1} panels={this.infoCalc} />
            <Header>Инструкция</Header>
            <Accordion defaultActiveIndex={1} panels={this.infoIns} />
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
export default Ecp;
