import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import Search from "../../components/Search";

import { assortiment } from "/both/collections";

import { Column, Table as TableComp, AutoSizer, InfiniteLoader } from "react-virtualized";

import { Item, Button, Menu, Table, Segment, Header, Form, Input, Grid, Icon, Label } from "semantic-ui-react";

import _ from "lodash";

@inject("router", "db", "actions", "assortiment", "pharms")
@observer
class Store extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: null,
      pharmQuery: null,
      sortBy: "TradeName",
      sortDirection: false,
      editable: null,
      changing: false,
      changed: false,
      price: null,
      qty: null,
      selectedPharmId: null,
    };
    //this.contextRef = createRef()
  }

  sort = (by) => {
    let { sortBy, sortDirection } = this.state;
    this.setState({ sortBy: by, sortDirection: by == sortBy ? !sortDirection : false });
  };

  search = (e) => {
    let { name, value } = e.target;
    this.setState({ searchQuery: value });
  };

  editToggle = (id) => {
    let { editable } = this.state;
    let item = this.props.assortiment.assortiment.data.get(id);
    console.log({ item });
    this.setState({ editable: editable == id ? null : id, qty: item.qty, price: item.price });
  };

  saveChanges = async (id) => {
    let { editable, price, qty } = this.state;
    this.setState({ changing: true });
    let changed = await this.props.assortiment.change(id, { price, qty });
    if (changed) {
      let item = this.props.assortiment.assortiment.data.get(id);
      if (item) {
        item.price = price;
        item.qty = qty;
        this.props.assortiment.assortiment.data.set(id, item);
      }
      this.setState({ editable: editable == id ? null : id, changing: false, qty: null, price: null });
    } else {
      // let item = this.props.assortiment.assortiment.data.get(id);

      this.setState({ editable: editable == id ? null : id, changing: false, qty: null, price: null });
    }
  };

  discardChanges = (id) => {
    let { editable } = this.state;
    this.setState({ editable: editable == id ? null : id, qty: null, price: null });
  };

  onChange = (id, name, value) => {
    this.setState({ [name]: value });
  };

  resultRenderer = ({ Address }) => {
    return <div>{Address}</div>;
  };

  handleSearchChange = (e, { value }) => {
    value = value.replaceAll("\\", "").replaceAll("/", "");
    this.setState({ pharmQuery: value });
  };

  handleResultSelect = async (e, { result }) => {
    // console.log({ result });
    //this.props.actions.inviteForm.pharmId = result._id;
    this.setState({ pharmQuery: result.Address, selectedPharmId: result.PharmId });
    // await this.props.drugs.selectFromSearch(result);
  };

  get results() {
    let { pharmQuery, sortBy, sortDirection } = this.state;
    let list = [];
    let reg = new RegExp(pharmQuery, "ig");
    this.props.pharms.my.data.forEach((item, i) => {
      if (item.Address.search(reg) != -1 || pharmQuery == "" || pharmQuery == null) {
        list.push(item);
      }
    });
    return list;
  }

  get assortiment() {
    let { searchQuery, sortBy, sortDirection } = this.state;
    let assortiment =
      (this.props.assortiment.assortiment.data.size > 0 &&
        Array.from(this.props.assortiment.assortiment.data.values())) ||
      [];
    let list = [];
    let reg = new RegExp(searchQuery, "ig");
    assortiment.forEach((item, i) => {
      // console.log(item);
      if (item.name.search(reg) != -1 || searchQuery == "" || searchQuery == null) {
        let { price, qty, ...other } = item;
        list.push({ price: parseFloat(price), qty: parseFloat(qty), ...other });
      }
    });
    let dir = sortDirection ? "desc" : "asc";
    list = _.orderBy(list, [sortBy], [dir]);
    return list;
  }

  isRowLoaded = ({ index }) => {
    return !!Array.from(this.props.assortiment.assortiment.data.keys())[index];
  };

  loadMoreRows = ({ startIndex, stopIndex }) => {
    // _.debounce(() => {
    // console.log("HERE");
    this.props.assortiment.addLoading({ startIndex, stopIndex });
    // }, 1000);

    // return fetch(`path/to/api?startIndex=${startIndex}&stopIndex=${stopIndex}`).then((response) => {
    //   // Store response data in list...
    // });
  };
  rowRenderer = ({
    key, // Unique key within array of rows
    index, // Index of row within collection
    isScrolling, // The List is currently being scrolled
    isVisible, // This row is visible within the List (eg it is not an overscanned row)
    style, // Style object to be applied to row (to position it)
  }) => {
    let { sortBy, sortDirection, editable, price, qty, searchQuery, pharmQuery, selectedPharmId } = this.state;
    // let i = Array.from(this.props.assortiment.assortiment.data.keys())[index];
    // let item = this.props.assortiment.assortiment.data.get(i);
    // let item = this.assortiment[index];
    let item = assortiment.find({}, { skip: index, limit: 1 }).fetch();
    // console.log(item);
    return item[0] || {};
  };

  render() {
    let {
      sortBy,
      sortDirection,
      editable,
      price,
      qty,
      searchQuery,
      pharmQuery,
      selectedPharmId,
      changing,
    } = this.state;
    let dir = sortDirection ? "descending" : "ascending";
    let choosedPharm = this.props.pharms.my.data.get(selectedPharmId);
    let remoteRowCount = this.props.assortiment.assortiment.count.get();
    return (
      <>
        <div className="scrollwrapper">
          <AutoSizer>
            {({ height, width }) => (
              <div style={{ height, width }}>
                <Segment basic style={{ marginBottom: 0, paddingBottom: 0 }}>
                  <Header as="h2">Ассортимент</Header>
                  <Grid>
                    <Grid.Column width={12}>
                      <Form>
                        <Form.Group>
                          <Form.Field>
                            <Input icon="search" size="big" onChange={this.search} placeholder="Поиск..." />
                          </Form.Field>
                          <Form.Field>
                            <Search
                              placeholder="Укажите адрес аптеки"
                              fluid
                              height={200}
                              size="big"
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
                          </Form.Field>
                          <Form.Field>
                            {selectedPharmId && (
                              <Label>
                                {choosedPharm && choosedPharm.Address}
                                <Icon name="delete" />
                              </Label>
                            )}
                          </Form.Field>
                        </Form.Group>
                      </Form>
                    </Grid.Column>

                    <Grid.Column width={4}>
                      <Button as={RouterLink} to="/store/upload" size="big" floated="right">
                        <Icon name="plus" />
                        Загрузить
                      </Button>
                    </Grid.Column>
                  </Grid>
                </Segment>
                <InfiniteLoader
                  isRowLoaded={this.isRowLoaded}
                  loadMoreRows={this.loadMoreRows}
                  rowCount={remoteRowCount} 
                >
                  {({ onRowsRendered, registerChild }) => (
                    <AutoSizer>
                      {({ height: h, width: w }) => (
                        <Segment basic style={{ width: w - 10 }}>
                          <Table celled striped sortable className="dynamic-loader">
                            <Table.Header>
                              <Table.Row>
                                <Table.HeaderCell width={1}>№</Table.HeaderCell>
                                <Table.HeaderCell
                                  width={9}
                                  sorted={sortBy === "TradeName" ? dir : null}
                                  onClick={() => this.sort("TradeName")}
                                >
                                  Наименование позиции
                                </Table.HeaderCell>
                                <Table.HeaderCell
                                  width={2}
                                  sorted={sortBy === "SellingPrice" ? dir : null}
                                  onClick={() => this.sort("SellingPrice")}
                                >
                                  Цена
                                </Table.HeaderCell>
                                <Table.HeaderCell
                                  width={2}
                                  sorted={sortBy === "Quantity" ? dir : null}
                                  onClick={() => this.sort("Quantity")}
                                >
                                  Остаток
                                </Table.HeaderCell>
                                <Table.HeaderCell width={2}></Table.HeaderCell>
                              </Table.Row>
                            </Table.Header>

                            <Table.Body>
                              <Table.Row>
                                <Table.Cell colSpan="5" style={{ padding: 0 }}>
                                  <TableComp
                                    width={w - 30}
                                    height={h - 120}
                                    rowCount={remoteRowCount}
                                    disableHeader
                                    rowHeight={45}
                                    rowGetter={this.rowRenderer}
                                    onRowsRendered={onRowsRendered}
                                    ref={registerChild}
                                  >
                                    <Column
                                      cellRenderer={(props) => {
                                        return <Table.Cell>{props.rowIndex + 1}</Table.Cell>;
                                      }}
                                      label="№"
                                      dataKey="index"
                                      width={w / 16}
                                    />
                                    <Column
                                      cellRenderer={(props) => {
                                        // console.log(props);
                                        // console.log(props.rowIndex % 4);
                                        return (
                                          <Table.Cell>
                                            {props.cellData || (
                                              <div
                                                className={
                                                  props.cellData
                                                    ? ""
                                                    : `gradient ${
                                                        { 0: "long", 1: "cut", 2: "little", 3: "short" }[
                                                          props.rowIndex % 4
                                                        ]
                                                      }`
                                                }
                                              />
                                            )}
                                          </Table.Cell>
                                        );
                                      }}
                                      width={(w * 9) / 16}
                                      label="Наименование позиции"
                                      dataKey="name"
                                    />
                                    <Column
                                      cellRenderer={(props) => {
                                        let item = props.rowData;
                                        return (
                                          <Table.Cell textAlign={editable == item._id ? "" : "right"}>
                                            {item._id && editable == item._id ? (
                                              <Input
                                                onChange={(e, { value }) => {
                                                  this.onChange(item._id, "price", value);
                                                }}
                                                type="numeric"
                                                value={price || item.price || "0"}
                                              />
                                            ) : (
                                              (item.price && item.price + " ₽") || (
                                                <div className={props.cellData ? "" : "gradient"} />
                                              )
                                            )}
                                          </Table.Cell>
                                        );
                                      }}
                                      width={(w * 2) / 16}
                                      label="Цена"
                                      dataKey="price"
                                    />
                                    <Column
                                      cellRenderer={(props) => {
                                        let item = props.rowData;
                                        return (
                                          <Table.Cell textAlign={editable == item._id ? "" : "right"}>
                                            {item._id && editable == item._id ? (
                                              <Input
                                                onChange={(e, { value }) => {
                                                  this.onChange(item._id, "qty", value);
                                                }}
                                                type="numeric"
                                                value={qty || item.qty || "0"}
                                              />
                                            ) : (
                                              (item.qty && item.qty + " шт.") || (
                                                <div className={props.cellData ? "" : "gradient"} />
                                              )
                                            )}
                                          </Table.Cell>
                                        );
                                      }}
                                      width={(w * 2) / 16}
                                      label="Остаток"
                                      dataKey="qty"
                                    />
                                    {false && (
                                      <Column
                                        cellRenderer={(props) => {
                                          let item = props.rowData;
                                          return (
                                            <Table.Cell textAlign={editable == item._id ? "" : "right"}>
                                              {item.pharm_id || <div className={props.cellData ? "" : "gradient"} />}
                                            </Table.Cell>
                                          );
                                        }}
                                        width={(w * 2) / 16}
                                        label="Аптека"
                                        dataKey="pharm_id"
                                      />
                                    )}
                                    <Column
                                      cellRenderer={(props) => {
                                        let item = props.rowData;
                                        return (
                                          <Table.Cell collapsing>
                                            {item._id ? (
                                              editable != item._id ? (
                                                <Button size="small" icon onClick={() => this.editToggle(item._id)}>
                                                  <Icon name="edit" />
                                                </Button>
                                              ) : changing ? (
                                                <Button size="small" icon>
                                                  <Icon loading name="circle notch" />
                                                </Button>
                                              ) : (
                                                <>
                                                  <Button
                                                    size="small"
                                                    icon
                                                    color="red"
                                                    onClick={() => this.discardChanges(item._id)}
                                                  >
                                                    <Icon name="remove" />
                                                  </Button>
                                                  <Button
                                                    size="small"
                                                    icon
                                                    color="blue"
                                                    onClick={() => this.saveChanges(item._id)}
                                                  >
                                                    <Icon name="check" />
                                                  </Button>
                                                </>
                                              )
                                            ) : (
                                              <div className={props.cellData ? "" : "gradient"} />
                                            )}
                                          </Table.Cell>
                                        );
                                      }}
                                      width={(w * 2) / 16}
                                      label=""
                                    />
                                  </TableComp>
                                </Table.Cell>
                              </Table.Row>
                            </Table.Body>
                          </Table>
                        </Segment>
                      )}
                    </AutoSizer>
                  )}
                </InfiniteLoader>
              </div>
            )}
          </AutoSizer>
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
export default Store;
