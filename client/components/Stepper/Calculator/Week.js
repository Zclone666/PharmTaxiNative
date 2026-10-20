import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import moment from 'moment'

import {
  List,
  Icon,
  Form,
  Segment,
  Input,
  Button,
  Dropdown,
  Responsive
} from 'semantic-ui-react'

import Day from './Day';

import _ from 'lodash';

@inject('db', 'actions', 'router')
@observer
class Schedule extends Component {
  constructor(props){
    super(props)
    this.state = {
      dosage: 0,
      count: 0,
      fullDosage: 0,
      weight: 0,
      weightDosage: 0
    }
  }
  handleChange = (e, { name, value }) => {
    if( !name && !value ){
      let { name, value } = e.target
    }
    console.log({ name, value });
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
      router: { values }
    } = this.props

    let weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    return (

      <Form.Group>
        <Form.Field className='fluid'>
          <label>Выберите дни недели:</label>
          <Responsive as={Segment.Group} horizontal fluid widths={7} minWidth={480}>
            {weekdays.map(( day, i ) => {
              return <Day day={day} index={i} key={'day'+i} onChange={this.handleChange} />
            })}
          </Responsive>
        </Form.Field>
      </Form.Group>

    )
  }

};
export default Schedule
