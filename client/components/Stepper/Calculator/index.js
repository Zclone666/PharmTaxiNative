import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import RouterLink from '../../../router/a'
import {
  List,
  Icon,
  Form,
  Segment,
  Input,
  Button,
  Dropdown
} from 'semantic-ui-react'

import Schedule from './Schedule'

import _ from 'lodash';

@inject('db', 'actions', 'router')
@observer
class Calculator extends Component {
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

    let {
      dosage,
      count,
      fullDosage,
      weight,
      weightDosage
    } = this.state

    let weights = [
      { key: 'мг', value: 'мг', text: 'мг' },
      { key: 'сг', value: 'сг', text: 'сг' },
      { key: 'мкг', value: 'мкг', text: 'мкг' }
    ]
    return (
      <Segment basic>
        <Form>
          <Form.Group widths={4}>
            <Form.Field>
              <label>Дозировка:</label>
              <Input
                size='big'
                name='dosage'
                value={dosage || ''}
                label={<Dropdown defaultValue='мг' options={weights} />}
                labelPosition='right'
                placeholder='178.5'
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field>
              <label>Кол-во доз:</label>
              <Input
                size='big'
                name='count'
                value={count || ''}
                label={{ basic: true, content: 'шт' }}
                labelPosition='right'
                placeholder='60.5'
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field>
              <label>Разовая доза:</label>
              <Input
                size='big'
                name='fullDosage'
                value={fullDosage || ''}
                label={{ basic: true, content: 'кг' }}
                labelPosition='right'
                placeholder='60.5'
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field>
              <label>На массу тела</label>
              <Input
                size='big'
                name='weightDosage'
                value={weightDosage || ''}
                label={{ basic: true, content: 'кг' }}
                labelPosition='right'
                placeholder='60.5'
                onChange={this.handleChange}
              />
            </Form.Field>
          </Form.Group>

        </Form>
        <Schedule />
      </Segment>
    )
  }

};
export default Calculator
