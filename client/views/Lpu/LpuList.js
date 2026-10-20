import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'


import {
  Item,
  Button,
  Menu,
  Segment
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('router', 'db', 'actions')
@observer
class LpuList extends Component {
  constructor(props){
    super(props)
    this.state = {

    }
    //this.contextRef = createRef()
  }

  back = () => {
    this.props.router.push('/')
  };

  getLocations = (id) => {
    this.props.db.getLocations(id)
  }

  render() {
    let lpu = Array.from(this.props.db.lpu.data.values())
    return (
      <>
        <div className='scrollwrapper'>
          <Segment basic>
            <Item.Group divided>
              {this.props.db.lpu.data.size > 0 && lpu.map(( item, i ) => {
                return(
                  <Item key={`lpu${i}`}>
                    <Item.Content>
                      <Button size='tiny' onClick={() => this.getLocations(item.id)} as={RouterLink} to={`/lpu/${item.id}/locations`} floated='right'>Склады</Button>
                      <Button size='tiny' floated='right'>Инфо</Button>
                      <Item.Header as='a'>{item.name}</Item.Header>
                      <Item.Meta>Главврач: {item.fio || 'нет данных'}</Item.Meta>
                      <Item.Description>
                        Адрес: {item.adress || 'нет данных'}
                      </Item.Description>
                    </Item.Content>
                  </Item>
                )
              })}

            </Item.Group></Segment>
          </div>
          <Menu className="bottom fixed menu three item large main">
            <Menu.Item color='red' onClick={this.handleResetAll}>
              Сбросить
            </Menu.Item>
            <Menu.Item onClick={this.scanToggle}>
              Сканировать
            </Menu.Item>
            <Menu.Item onClick={this.scanToggle}>
              Отмена
            </Menu.Item>
          </Menu>
        </>
    );
  }
};
export default LpuList
