import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'


import {
  Card,
  Image,
  Icon,
  Segment
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('router', 'db', 'actions')
@observer
class StartMedic extends Component {
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
    return (
      <div className='scrollwrapper'>
        <Segment basic>
          <Card.Group itemsPerRow={2}>
            <Card fluid>
              <div className='ui image cardbg'>
                <Icon name='tasks' className='rotated' />
                <Icon name='tasks' />
              </div>
              <Card.Content>
                <Card.Header>Мои задачи</Card.Header>
                <Card.Meta>Список активных задач</Card.Meta>
              </Card.Content>
            </Card>
            <Card fluid>
              <div className='ui image cardbg'>
                <Icon name='clipboard list' className='rotated' />
                <Icon name='clipboard list' />
              </div>
              <Card.Content>
                <Card.Header>Приемка</Card.Header>
                <Card.Meta>Принять товар на склад</Card.Meta>
              </Card.Content>
            </Card>
            <Card fluid>
              <div className='ui image cardbg'>
                <Icon name='dolly' className='rotated' />
                <Icon name='dolly' />
              </div>
              <Card.Content>
                <Card.Header>Перемещение</Card.Header>
                <Card.Meta>Переместить товар внутри ЛПУ</Card.Meta>
              </Card.Content>
            </Card>
            <Card fluid>
              <div className='ui image cardbg'>
                <Icon name='pallet' className='rotated' />
                <Icon name='pallet' />
              </div>
              <Card.Content>
                <Card.Header>Выдача</Card.Header>
                <Card.Meta>Выдача пациенту</Card.Meta>
              </Card.Content>
            </Card>
          </Card.Group>
        </Segment>
      </div>
    );
  }
};
export default StartMedic
