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
class DozeTypes extends Component {
  constructor(props){
    super(props)
    this.state = {

    }
  }
  setDosage = ( lf ) => {
    //this.props.actions.stepsData.dosage = lf.bigid
    this.props.actions.stepsData.pack = lf
  }
  get dosages(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts,
        stepsData
      },
      db: { drugsDosages, currDrug },
    } = this.props

    let drugDosage = drugsDosages.data.get(currDrug.key)
    let { drug, form, methodform, names } = drugDosage

    let arr = []

    form[stepsData.form] && form[stepsData.form].dosage.forEach((item, i) => {
      let currPack = {
        dosage: '',
        pack: '',
        flag: false
      }
      // if(form[stepsData.form].solute){
      //
      // }
      if(form[stepsData.form].solute && _.isArray(item.pack) && item.pack.length > 0 ){
        item.pack.forEach((pack, x) => {
          currPack = {
            dosage: '',
            pack: '',
            flag: !!(item.dosage[0] && item.dosage[0].id_2),
            obj: {
              dosages: item.dosage,
              pack: pack,
            }
          }
          if(_.isArray(item.dosage) && item.dosage.length > 1 ){
            currPack.dosage += _.map(item.dosage, 'value_1').join(' + ') + ' ' + names[item.dosage[0].id_1]
          }else if(_.isArray(item.dosage) && item.dosage.length === 1 ){
            currPack.dosage += item.dosage[0].value_1 + (item.dosage[0].value_2 && '/' + item.dosage[0].value_2) + ' ' + names[item.dosage[0].id_1]
          }
          currPack.pack += names[pack.id] + (pack.dosage && (', ' + pack.dosage.value_1 + ' ' + names[pack.dosage.id_1]) || '')
          arr.push({ ...currPack })
        })
      }else{
        if(_.isArray(item.dosage) && item.dosage.length > 0 ){
          currPack.dosage += _.map(item.dosage, 'value_1').join(' + ') + ' ' + names[item.dosage[0].id_1]
          currPack.flag = !!(item.dosage[0] && item.dosage[0].id_2)
        }

        currPack.obj = {
          dosages: item.dosage
        }
        arr.push({ ...currPack })
      }

    })
    return arr

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
      db: { drugsDosages, currDrug },
      router: { values }
    } = this.props
    let way = values.way || 'lf'
    let currStep = parseInt(values.step || 0)


    let drugDosage = drugsDosages.data.get(currDrug.key)
    let { drug, form, methodform, names } = drugDosage

    return (
      <List animated divided selection verticalAlign='middle' size='large' >
        {this.dosages.map(( dosage, i ) => {

          return(
            <List.Item
              as={RouterLink}
              to={`/concept/dozes/${way}/${currStep+1}`}
              onClick={() => this.setDosage(dosage)}
            >

              <List.Content floated='right'>
                <Icon

                  name='right chevron'
                  size='big'
                />
              </List.Content>

              <List.Content className='large'>
                {dosage.flag && <Icon name='warning sign' color='red' style={{ float: 'left' }} />}
                <List.Header>{dosage.dosage}</List.Header>
                {dosage.pack.length > 0 && <List.Description>
                  {dosage.pack}
                </List.Description>}
              </List.Content>

            </List.Item>
          )

        })}
      </List>
    )
  }

};
export default DozeTypes
