import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import moment from 'moment'

import RouterLink from '../../../router/a'
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

import { DatePickerInput } from 'rc-datepicker';

import _ from 'lodash';

import Week from './Week';

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
    let dateStart = moment().format('DD.MM.YYYY HH:mm')
    let dateFinish = 0
    let sex = 'male'
    return (
      <Segment>
        <Form>
          <Form.Group widths={3}>
            <Form.Field>
              <label>Начало периода приема:</label>
              <DatePickerInput
                onChange={(e, { value }) => this.handleChange(e, { value, name: 'dateStart' })}
                name='dateStart'
                showOnInputClick={true}
                startMode='year'
                format='DD.MM.YYYY HH:mm'
                returnFormat='DD.MM.YYYY HH:mm'
                displayFormat='DD.MM.YYYY HH:mm'
                validationFormat='DD.MM.YYYY HH:mm'
                onClear={this.onClear}
                className='ui fluid big input '
                placeholder='__.__.____'
                locale='ru'
              />
            </Form.Field>
            <Form.Field>
              <label>Окончание периода приема:</label>
              <DatePickerInput
                onChange={(e, { value }) => this.handleChange(e, { value, name: 'dateFinish' })}
                name='dateFinish'
                showOnInputClick={true}
                startMode='year'
                format='DD.MM.YYYY HH:mm'
                returnFormat='DD.MM.YYYY HH:mm'
                displayFormat='DD.MM.YYYY HH:mm'
                validationFormat='DD.MM.YYYY HH:mm'
                onClear={this.onClear}
                className='ui fluid big input '
                placeholder='__.__.____'
                locale='ru'
              />
            </Form.Field>
            <Form.Field>
              <label>Или</label>
              <Button.Group fluid size='big'>
                <Button primary={sex === 'man'} onClick={this.handleChange} name='sex' value='man'>До отмены</Button>
                <Button primary={sex === 'woman'} onClick={this.handleChange} name='sex' value='woman'>До улучшения</Button>
              </Button.Group>
            </Form.Field>
          </Form.Group>
          <Form.Group>
            <Form.Field className='fluid'>
              <label>Условия приема</label>
              <Responsive as={Button.Group} fluid size='big' widths={4} minWidth={480}>
                <Button primary={sex === 'man'} onClick={this.handleChange} name='sex' value='man'>1 раз</Button>
                <Button primary={sex === 'woman'} onClick={this.handleChange} name='sex' value='woman'>По дням недели</Button>
                <Button primary={sex === 'man'} onClick={this.handleChange} name='sex' value='man'>По интервалу</Button>
                <Button primary={sex === 'woman'} onClick={this.handleChange} name='sex' value='woman'>По календарю</Button>
              </Responsive>
              <Responsive as={Button.Group} fluid size='big' widths={2} maxWidth={480}>
                <Button primary={sex === 'man'} onClick={this.handleChange} name='sex' value='man'>1 раз</Button>
                <Button primary={sex === 'woman'} onClick={this.handleChange} name='sex' value='woman'>По дням недели</Button>
              </Responsive>
              <Responsive as={Button.Group} fluid size='big' widths={2} maxWidth={480}>
                <Button primary={sex === 'man'} onClick={this.handleChange} name='sex' value='man'>По интервалу</Button>
                <Button primary={sex === 'woman'} onClick={this.handleChange} name='sex' value='woman'>По календарю</Button>
              </Responsive>
            </Form.Field>
          </Form.Group>
          <Week/>
        </Form>
      </Segment>
    )
  }

};
export default Schedule
