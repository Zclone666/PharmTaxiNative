import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'

import RouterLink from '../../router/a';


@inject('router', 'db', 'actions')
@observer
class ResetPass extends Component {
  constructor(props) {
    super(props);
    this.state = { filled: null}
  }
  handleResetPass = (e) => {
    e.preventDefault()
    this.props.actions.resetPass()
  }
  handleChange = (e) => {
    let { name, value } = e.target;
    let { resetPassForm } = this.props.actions
    this.props.actions.resetPassForm[name] = value;
    this.setState({ filled: ( resetPassForm.email.length > 5 ) })
  }

  render () {
    let { projectTitle, resetPassForm: { email } } = this.props.actions
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
                СБРОС ПАРОЛЯ
              </Header>
              <Form size='large' onSubmit={this.handleResetPass}>
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
                    onClick={this.handleResetPass}
                  >
                    Отправить
                  </Button>
                </Segment>
              </Form>
              <Message className='squared'>
                Уже зарегистрированы? <RouterLink to='/login'>Войти</RouterLink><br />
                Уже есть код? <RouterLink to="/newpass" >Задать</RouterLink> новый пароль
              </Message>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default ResetPass
