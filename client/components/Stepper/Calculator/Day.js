import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import moment from 'moment'

import {
  List,
  Icon,
  Form,
  Label,
  Segment,
  Input,
  Button,
  Dropdown,
  Responsive
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions', 'router')
@observer
class Schedule extends Component {
  constructor(props){
    super(props)
    this.state = {
      active: false,
      time: []
    }
  }
  handleChange = () => {
    this.setState({ active: !this.state.active })
  }
  handleChangeTime = (e, {index, name, value}) => {
    //console.log({name, value});
    e.preventDefault()
    let { time } = this.state
    if(index === time.length){
      time.push(value)
    }else{
      time[index] = value
    }
    this.setState({ time })
    return false
  }
  handleRemoveTime = ({ index }) => {
    // console.log({name, value});
    let { time } = this.state
    // if(index === time.length){
    //   time.push(value)
    // }else{
    //   time[index] = value
    // }
  }
  render(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts,
        stepsData
      },
      db: { drugDosage: { drug, form, methodform, names } },
      router: { values },
      day, index
    } = this.props
    let { active, time } = this.state

    return (
      <Segment
        className='day'
        primary={active}

        name='weekday'
        value='mon'
      >
        <Label onClick={this.handleChange} color={active ? 'blue' : ''} attached='top'>
          <Icon name={!!active ? 'check square' : 'square outline'} />
          {day}
        </Label>
        <Form className='leftPadded'>
          {time.map(( item, index ) => {
            return(<Form.Group>
              <Form.Field className='fluid'>
                <Dropdown
                  className='tiny primary'
                  name='time'
                  onChange={(e, {name, value}) => this.handleChangeTime(e, {index, name, value})}
                  button
                  floating
                  search
                  disabled={!active}
                  options={_.map(Array(48), (item, i) => {
                    return {
                      key: i+1,
                      text: (i === 0 || !(i%2)) ? parseInt(i/2) + '.00' : parseInt(i/2) + '.30',
                      value: (i === 0 || !(i%2)) ? parseInt(i/2) + '.00' : parseInt(i/2) + '.30'
                    }
                  })}
                  text={item}
                />
                <Button icon size='tiny'><Icon name='delete' /></Button>
              </Form.Field>
            </Form.Group>)
          })}
          <Form.Group>
            <Form.Field className='fluid'>
              <Dropdown
                className='tiny'
                name='time'
                onChange={(e, {name, value}) => this.handleChangeTime(e, {index: time.length, name, value})}
                button
                floating
                search
                disabled={!active}
                options={_.map(Array(48), (item, i) => {
                  return {
                    key: i+1,
                    text: (i === 0 || !(i%2)) ? parseInt(i/2) + '.00' : parseInt(i/2) + '.30',
                    value: (i === 0 || !(i%2)) ? parseInt(i/2) + '.00' : parseInt(i/2) + '.30'
                  }
                })}
                text={'Время'}
              />
            </Form.Field>
          </Form.Group>

        </Form>

      </Segment>
    )
  }

};
export default Schedule
