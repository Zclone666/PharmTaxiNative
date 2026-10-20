import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import Spinner from "../../components/Spinner";
import Search from "../../components/Search";

import { Lpu, LpuList } from "../Lpu";
import { Location, LocationsList } from "../Locations";
import { StartMedic, StartNurse } from "../StartPage";

import Page from "../Page";

import {
  Sidebar,
  Menu,
  Icon,
  Dropdown,
  Segment,
  Message,
  List,
  Header,
  Feed,
  Button,
  Responsive,
  Grid,
  Image,
} from "semantic-ui-react";

import _ from "lodash";

@inject("router", "pharms", "db", "actions", "user", "orders")
@observer
class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      showPage: false,

      activeItem: "Найти рецепт",

      isLoading: false,
      searchQuery: "",
      searchActive: false,

      start: false,
      stop: true,
    };
    this.searchHref = createRef();
  }

  handleItemClick = (e, { name }) => {
    // this.props.db.getBarcodeInfo();
    this.setState({ activeItem: name });
  };

  handleResultSelect = async (e, { result }) => {
    await this.props.db.selectFromSearch(result);
    this.setState({ searchQuery: "" });
  };

  handleSearchChange = (e, { value }) => {
    this.setState({ searchQuery: value });
    if (value.length > 1) {
      this.props.db.searchReady = false;
      this.props.db.getSearch(value);
    }
  };

  handleResetAll = () => {
    if (window.confirm("Сбросить все?")) this.props.db.clearData(true);
  };

  getInfoPrep = () => {
    this.props.db.getInfoPrep();
  };

  resultRenderer = ({ name, level, tn, type }) => {
    return (
      <div>
        {name}
        {type === "TN" && <sup>TM</sup>}
      </div>
    );
  };

  scanToggle = () => {
    this.setState({ start: !this.state.start, stop: !this.state.stop });
  };

  searchLS = () => {
    this.setState({ searchActive: !this.state.searchActive });
  };

  choicePharm = (id) => {
    this.props.user.choicePharm(id);
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState({ showPage: !!(this.props.router.values && this.props.router.values.page) });
    }, 100);

    //console.log('HERE');
  }
  get pharms() {
    let list = [];
    this.props.pharms.my.data.forEach((item, i) => {
      list.push(item);
    });
    return list;
  }
  render() {
    const { open, activeItem, searchQuery, selectedDrug, selectedConflict, start, stop, searchActive } = this.state;
    let { currentPage, height } = this.props.actions;
    let { searchReady, searchRows, selectedRows, warnings, warnGroups, drugs } = this.props.db;
    // let selectedWarnings = warnings[selectedDrug]
    let showPage = !!(this.props.router.values && this.props.router.values.page);
    // console.log('router', this.props.router);
    let lpu = (this.props.router.values && this.props.router.values.lpu) || null;
    let section = this.props.router.match.section || null;
    let name = this.props.router.match.name || null;
    //console.log('name', this.props.router.match.name);

    return (
      <>
        <Menu
          className={`ui top large borderless pointing secondary nomargin main menu fixed grey${showPage && " hidden"}`}
        >
          <Menu.Item icon className="logo">
            <img src="/logo.svg" />
          </Menu.Item>

          <Menu.Menu position="right">
            <Menu.Item
              name="Найти рецепт"
              as={RouterLink}
              to="/recipe"
              active={activeItem === "Найти рецепт"}
              onClick={this.handleItemClick}
            />
            <Menu.Item
              name="Заказы"
              as={RouterLink}
              to="/orders/list"
              active={activeItem === "Заказы"}
              onClick={this.handleItemClick}
            />
            {this.props.user.role == "Admin" && (
              <Menu.Item
                name="Сотрудники"
                as={RouterLink}
                to="/staff/list"
                active={activeItem === "Сотрудники"}
                onClick={this.handleItemClick}
              />
            )}
            {this.props.user.role == "Admin" && (
              <Menu.Item
                name="Аптеки"
                as={RouterLink}
                to="/pharms/nets"
                active={activeItem === "Аптеки"}
                onClick={this.handleItemClick}
              />
            )}
            <Menu.Item
              as={RouterLink}
              to="/store/list"
              name="Ассортимент"
              active={activeItem === "Ассортимент"}
              onClick={this.handleItemClick}
            />
            <Menu.Item
              name="Справочник"
              as={RouterLink}
              to="/ecp"
              active={activeItem === "Справочник"}
              onClick={this.handleItemClick}
            />
            <Dropdown scrolling item icon="hospital" text={this.props.user.currPharm + "" || "Не выбрано"}>
              <Dropdown.Menu className="left-sided">
                {this.pharms.map((item, i) => {
                  // console.log(item);
                  return (
                    <Dropdown.Item
                      key={"pharm" + i}
                      style={{ whiteSpace: "normal", minWidth: 250 }}
                      onClick={() => this.choicePharm(item.PharmId)}
                    >
                      <Header as="h4">Аптека ID: {item.PharmId}</Header>
                      {item.Address}
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
            <Menu.Item icon className="logo">
              <Dropdown trigger={<img src="/cart.svg" />} scrolling pointing="top left" icon={null}>
                <Dropdown.Menu className="left-sided">
                  {this.props.orders.tmpOrder.drugs.map((item, i) => {
                    // console.log(item);
                    return (
                      <Dropdown.Item key={"pharm" + i} style={{ whiteSpace: "normal", minWidth: 250 }}>
                        {item.name} ({item.packs})
                      </Dropdown.Item>
                    );
                  })}
                  <Dropdown.Item
                    onClick={() => this.props.orders.clearTmpOrder()}
                    style={{ whiteSpace: "normal", minWidth: 250 }}
                  >
                    Сбросить
                  </Dropdown.Item>
                  <Dropdown.Item as={RouterLink} to="/orders/order/new" style={{ whiteSpace: "normal", minWidth: 250 }}>
                    Сформировать
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              {this.props.orders.tmpOrder.drugs.length}
            </Menu.Item>

            <Menu.Item
              name="profile"
              onClick={this.handleItemClick}
              active={activeItem === "profile"}
              as={RouterLink}
              to="/profile"
              icon
              className="logo"
            >
              <img src="/profile.png" />
            </Menu.Item>
          </Menu.Menu>
        </Menu>

        <Page />

        {start && <Scanner start={start} stop={stop} close={this.scanToggle} />}
      </>
    );
  }
}
export default Main;
