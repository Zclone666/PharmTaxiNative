import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'

import RouterLink from '../../router/a';


@inject('router', 'db', 'actions')
@observer
class Getconfirm extends Component {
  constructor(props) {
    super(props);
    this.state = { filled: null}
  }
  handleGetConfirm = (e) => {
    e.preventDefault()
    this.props.actions.getConfirm()
  }
  handleChange = (e) => {
    let { name, value } = e.target;
    let { getConfirmForm } = this.props.actions
    this.props.actions.getConfirmForm[name] = value;
    this.setState({ filled: ( getConfirmForm.email.length > 5 ) })
  }

  render () {
    let { projectTitle, getConfirmForm: { code, email, service } } = this.props.actions
    return (
      <div className='login-form height100perc'>

        <Grid
          padded
          textAlign='center'
          style={{ height: '100%' }}
          verticalAlign='middle'
        >
          <Grid.Column style={{ maxWidth: 450 }}>
            <Segment basic>
              <Header as='h2' color='grey' textAlign='center'>
                {projectTitle}
              </Header>
              <Header as='h3' color='grey' textAlign='center'>
                ЗАПРОС КОДА РЕГЕСТРАЦИИ
              </Header>
              <Form size='large' onSubmit={this.handleGetConfirm}>
                <Segment padded='very' className='no-border raised'>
                  <Form.Input
                    size='huge'
                    name="email"
                    fluid
                    icon='mail'
                    value={email}
                    iconPosition='left'
                    placeholder='E-mail'
                    onChange={this.handleChange}
                  />

                  <Button
                    disabled = {!this.state.filled}
                    fluid size='huge' color='grey'
                    onClick={this.handleGetConfirm}
                  >
                    Отправить
                  </Button>
                </Segment>
              </Form>
              <Message className='squared'>
                Уже зарегистрированы? <RouterLink to='/login'>Войти</RouterLink><br />
                Уже есть код? <RouterLink to="/confirm" >Подтвердить</RouterLink>
              </Message>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default Getconfirm
