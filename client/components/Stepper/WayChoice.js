import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import RouterLink from '../../router/a'
import {
  Responsive,
  Grid,
  Card,
  Icon,
  Segment
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions')
@observer
class WayChoice extends Component {
  constructor(props){
    super(props)
    this.state = {
      viewType: 0
    }
  }
  handleOnUpdate = (event, data) => {
    // console.log({event, data});
    if( data.width > 479 ){
      this.setState({ viewType: 'columns' })
    }else{
      this.setState({ viewType: 'rows' })
    }
  }
  render(){
    // let { activeIndex } = this.state
    // let {
    //   actions: {
    //     selectedDrug,
    //     selectedConflict,
    //     activeDrugs,
    //     activeConflicts
    //   },
    //   db: { drugDosage: { lf, druglf, methodstolf, names } }
    // } = this.props
    // // let selectedWarnings = warnings[selectedDrug]
    let { viewType } = this.state
    return (
      <Responsive className='h100' as={Grid} fireOnMount columns='equal' onUpdate={this.handleOnUpdate}>
        {viewType == 'columns' ?
          <Grid.Row stretched>
            <Grid.Column width={8}>
              <Segment basic>
                <Grid
                  padded
                  className='h100'
                  textAlign='center'
                  verticalAlign='middle'
                >
                  <Grid.Column style={{ maxWidth: 300 }}>
                    <Card fluid as={RouterLink} to='/concept/dozes/lf/1'>
                      <Card.Content>
                        <Card.Header>Лекарственная форма</Card.Header>
                        <Card.Description>
                          Сначала выбрать лекарственную форму, потом способ применения
                        </Card.Description>
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                </Grid>
              </Segment>
            </Grid.Column>
            <Grid.Column width={8}>
              <Segment basic>
                <Grid
                  padded
                  className='h100'
                  textAlign='center'
                  verticalAlign='middle'
                >
                  <Grid.Column style={{ maxWidth: 300 }}>
                    <Card fluid href as={RouterLink} to='/concept/dozes/methods/1'>
                      <Card.Content>
                        <Card.Header>Способ применения</Card.Header>
                        <Card.Description>
                          Сначала выбрать способ применения, потом лекарственную форму
                        </Card.Description>
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                </Grid>
              </Segment>
            </Grid.Column>
          </Grid.Row>
          :
          <Grid.Row stretched>
            <Grid.Column width={16}>
              <Segment basic>
                <Grid
                  padded
                  className='h100'
                  textAlign='center'
                  verticalAlign='middle'
                >
                  <Grid.Column style={{ maxWidth: 300 }}>
                    <Card fluid href as={RouterLink} to='/concept/dozes/lf/1'>
                      <Card.Content>
                        <Card.Header>Лекарственная форма</Card.Header>
                        <Card.Description>
                          Сначала выбрать лекарственную форму, потом способ применения
                        </Card.Description>
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                </Grid>
              </Segment>
              <Segment basic>
                <Grid
                  padded
                  className='h100'
                  textAlign='center'
                  verticalAlign='middle'
                >
                  <Grid.Column style={{ maxWidth: 300 }}>
                    <Card fluid href as={RouterLink} to='/concept/dozes/methods/1'>
                      <Card.Content>
                        <Card.Header>Способ применения</Card.Header>
                        <Card.Description>
                          Сначала выбрать способ применения, потом лекарственную форму
                        </Card.Description>
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                </Grid>
              </Segment>
            </Grid.Column>
          </Grid.Row>
        }
      </Responsive>
    )
  }

};
export default WayChoice
