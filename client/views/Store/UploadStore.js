import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import Dropzone from "react-dropzone";

import {
  Item,
  Button,
  Menu,
  Segment,
  Table,
  Header,
  Form,
  Input,
  Grid,
  Icon,
  Progress,
  Dimmer,
} from "semantic-ui-react";

import _ from "lodash";

@inject("router", "db", "actions", "assortiment")
@observer
class Store extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: null,
      sortBy: "TradeName",
      sortDirection: false,
      over: false,
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

  upload = (files) => {
    // console.log({ files });
    this.props.assortiment.upload(files[0]);
  };

  get assortiment() {
    let { searchQuery, sortBy, sortDirection } = this.state;
    let assortiment =
      (this.props.db.assortiment.data.size > 0 && Array.from(this.props.db.assortiment.data.values())) || [];
    let list = [];
    let reg = new RegExp(searchQuery, "ig");
    assortiment.forEach((item, i) => {
      if (item.name.search(reg) != -1 || searchQuery == "" || searchQuery == null) {
        let { SellingPrice, Quantity, ...other } = item;
        list.push({ SellingPrice: parseFloat(SellingPrice), Quantity: parseFloat(Quantity), ...other });
      }
    });
    let dir = sortDirection ? "desc" : "asc";
    list = _.orderBy(list, [sortBy], [dir]);
    return list;
  }

  render() {
    let { sortBy, sortDirection, over } = this.state;
    let dir = sortDirection ? "descending" : "ascending";
    const style = {
      borderWidth: 2,
      borderColor: !over ? "#e0e1e2" : "#49a6c7",
      borderStyle: "dashed",
      outline: "none",
      transition: "border .24s ease-in-out",
      boxShadow: "none",
    };
    let { uploadProgress, uploading } = this.props.assortiment;
    // console.log({ uploadProgress });
    return (
      <>
        <div className="scrollwrapper">
          <Segment basic>
            <Header as="h2">Загрузка ассортимента</Header>
            <Dropzone
              onDragEnter={() => {
                this.setState({ over: true });
                // console.log("Over");
              }}
              onDragLeave={() => {
                this.setState({ over: false });
              }}
              onDrop={(acceptedFiles) => {
                this.setState({ over: false });
                this.upload(acceptedFiles);
                // console.log(acceptedFiles);
              }}
              maxFiles={1}
            >
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps({})}>
                  <Dimmer.Dimmable placeholder style={style} as={Segment} blurring dimmed={uploading}>
                    <input {...getInputProps()} />
                    <Header icon>
                      <Icon name="excel file outline" />
                      Перетащите сюда файл для загрузки или
                    </Header>

                    <Button primary>Выберите из папки</Button>
                    <Dimmer active={uploading} inverted blurring>
                      <Header as="h2" color="blue">
                        Загрузка...
                      </Header>
                      <div style={{ minWidth: 300 }}>
                        <Progress percent={uploadProgress} progress color="blue" />
                      </div>
                    </Dimmer>
                  </Dimmer.Dimmable>
                </div>
              )}
            </Dropzone>
          </Segment>
        </div>
      </>
    );
  }
}
export default Store;
