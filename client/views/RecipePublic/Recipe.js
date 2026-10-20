import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import { Item, Divider, Button, Grid, Menu, Segment, Table, Header, Form, Input, Icon } from "semantic-ui-react";

import _ from "lodash";
import moment from "moment";

@inject("router", "db", "actions", "recipes", "dosages", "tools", "assortiment")
@observer
class Recipe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeItem: "code",
      showResult: false,
      html: null,
      ratio: 1,
    };
    //this.contextRef = createRef()
  }
  showClear = () => {};
  print = async () => {
    document.getElementById("ifmcontentstoprint").style.display = "contents";
    var pri = document.getElementById("ifmcontentstoprint").contentWindow;
    pri.document.open();
    await pri.document.write(this.state.html);
    pri.document.close();
    pri.focus();
    pri.print();
  };

  show = async () => {
    // document.getElementById("ifmcontentstoshow").style.display = "contents";
    var pri = document.getElementById("ifmcontentstoshow").contentWindow;
    pri.document.open();
    await pri.document.write(this.state.html);
    pri.document.close();
  };

  getHtml = async () => {
    let code = (this.props.router.values && this.props.router.values.code) || null;
    let resp = await fetch(`https://service.socmedica.com:9004/Prescript/Recipe?code=${code}`);
    let htm = await resp.text();
    this.setState({ html: htm });
    this.show();
  };

  componentDidMount() {
    this.getHtml();
    // console.log(window.visualViewport.width);
    if (window.visualViewport.width < 900) {
      this.setState({ ratio: 900 / window.visualViewport.width });
    }
  }

  render() {
    let { ratio } = this.state;
    let code = (this.props.router.values && this.props.router.values.code) || null;
    // console.log(ratio);
    return (
      <>
        <Menu className={`ui top large borderless pointing secondary nomargin main menu fixed grey`}>
          <Menu.Item as={RouterLink} to="/" icon className="logo">
            <img src="/logo.svg" />
          </Menu.Item>

          <Menu.Menu position="right">
            <Menu.Item>
              <span>
                <Button color="blue" onClick={this.print}>
                  <Icon name="print" />
                  Печать
                </Button>
              </span>
            </Menu.Item>
          </Menu.Menu>
        </Menu>
        <div onClick={this.showClear} className="scrollwrapper" style={{ paddingBottom: 90, overflow: "hidden" }}>
          <iframe
            id="ifmcontentstoshow"
            style={{
              width: 100 * ratio + "%",
              height: 100 * ratio + "%",
              margin: 0,
              padding: 0,
              border: "none",
              backgroundColor: "#fff",
              transform: "scale(" + 1 / ratio + ")",
              transformOrigin: "0 0",
            }}
          ></iframe>
          <iframe
            id="ifmcontentstoprint"
            style={{
              width: 0,
              height: 0,
              margin: 0,
              padding: 0,
              border: "none",
              backgroundColor: "#fff",
              display: "none",
            }}
          ></iframe>
          <Segment
            style={{
              position: "fixed",
              bottom: 0,
              width: "100%",
              margin: 0,
              height: 90,
            }}
          >
            <Header as="h4" textAlign="center">
              Если вы администратор аптеки, то <a href="/signup">подключитесь к системе</a> и увеличьте ваши продажи
            </Header>
            <Header as="h5" textAlign="center">
              я уже зарегистрирован <a href="/login">войти в аккаунт</a>
            </Header>
          </Segment>
        </div>
      </>
    );
  }
}
export default Recipe;
