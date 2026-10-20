import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import RouterLink from '../../router/a'
import {
  List,
  Icon,
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions', 'router')
@observer
class LF extends Component {
  constructor(props){
    super(props)
    this.state = {

    }
  }
  setLF = ( lf ) => {
    this.props.actions.stepsData.form = lf
  }
  render(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts,
        stepsData,
      },
      db: { drugsDosages, currDrug },
      router: { values }
    } = this.props
    let way = values.way || 'lf'
    let currStep = parseInt(values.step || 0)
    //console.log('currDrug', currDrug);

    let drugDosage = drugsDosages.data.get(currDrug.key) || {}
    //console.log('drugDosage', drugDosage);
    let { drug, form, methodform, names } = drugDosage

    let iterator = (stepsData.way === 'methods' && stepsData.method) ? methodform[stepsData.method] : _.keys(form)

    return (
      <List animated divided selection verticalAlign='middle' size='large' >
        {iterator.map(( lfid, i ) => {
          let lfItem = form[lfid]
          return(
            <List.Item
              key={'doze'+i}
              as={RouterLink}
              to={`/concept/dozes/${way}/${currStep+1}`}
              onClick={() => this.setLF(lfid, lfItem)}
            >
              <List.Content floated='right'>
                <Icon

                  name='right chevron'
                  size='big'
                />
              </List.Content>

              <List.Content className='large'>
                <List.Header>{names[lfid]}</List.Header>
                {lfItem.solute && <List.Description>
                  Подходит для раствора
                </List.Description>}
              </List.Content>

            </List.Item>
          )

        })}
      </List>
    )
  }

};
export default LF
