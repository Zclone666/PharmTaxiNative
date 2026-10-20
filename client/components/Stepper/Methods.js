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
class MethodsLF extends Component {
  constructor(props){
    super(props)
    this.state = {

    }
  }
  setMethod = ( lf ) => {
    this.props.actions.stepsData.method = lf
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

    let drugDosage = drugsDosages.data.get(currDrug.key)
    let { drug, form, methodform, names } = drugDosage

    let iterator = (stepsData.way === 'lf' && stepsData.form) ? (form[stepsData.form] && form[stepsData.form].method || []) : _.keys(methodform)
    // console.log('iterator', iterator);
    // console.log('stepsData', stepsData);
    return (
      <List animated divided selection verticalAlign='middle' size='large' >
        {iterator.map(( mid, i ) => {
          //let lfItem = lf[lfid]
          return(
            <List.Item
              key={'doze'+i}
              as={RouterLink}
              to={`/concept/dozes/${way}/${currStep+1}`}
              onClick={() => this.setMethod(mid)}
            >
              <List.Content floated='right'>
                <Icon

                  name='right chevron'
                  size='big'
                />
              </List.Content>

              <List.Content className='large'>
                <List.Header>{names[mid]}</List.Header>
                {/*<List.Description>

                </List.Description>*/}
              </List.Content>

            </List.Item>
          )

        })}
      </List>
    )
  }

};
export default MethodsLF
