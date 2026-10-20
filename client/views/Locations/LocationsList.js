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
class LocationsList extends Component {
  constructor(props){
    super(props)
    this.state = {
      open: false,

      isLoading: false,
      searchQuery: ''
    }
    //this.contextRef = createRef()
  }

  saveDoze = () => {

  }

  back = () => {
    this.props.router.push('/')
  };

  render() {
    let locations = Array.from(this.props.db.locations.data.values())
    return (
      <>
        <div className='scrollwrapper'>
          <Segment basic>
            <Item.Group divided>
              {this.props.db.locations.data.size > 0 && locations.map(( item, i ) => {
                return(
                  <Item key={`lpu${i}`} style={{ paddingLeft: 10 }}>
                    <Item.Content>
                      <Button size='tiny' primary as={RouterLink} to={`/lpu/${item.id}/locations`} floated='right'>Склады</Button>
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
            </Item.Group>
          </Segment>
        </div>
        <Menu className="bottom fixed menu two item large main">
          <Menu.Item as={RouterLink} to='/'>
            Назад
          </Menu.Item>
          <Menu.Item>
            Добавить
          </Menu.Item>
        </Menu>
      </>

    );
  }
};
export default LocationsList
