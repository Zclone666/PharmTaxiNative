import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'

import RouterLink from '../../router/a';



@inject('router', 'db', 'actions')
@observer
class NewPass extends Component {
  constructor(props) {
    super(props);
    this.state = { filled: null}
  }
  handleNewPass = (e) => {
    e.preventDefault()
    this.props.actions.newPass()
  }
  handleChange = (e) => {
    let { name, value } = e.target;
    let { newPassForm } = this.props.actions
    this.props.actions.newPassForm[name] = value;
    this.setState({ filled: ( newPassForm.email.length > 5 && newPassForm.code.length > 5 ) })
  }
  componentDidMount(){
    let { code, email, service } = this.props.router.values
    console.log({ code, email, service });
    this.handleChange({ target: { name: 'code', value: code || '' }})
    this.handleChange({ target: { name: 'email', value: email || '' }})
    this.props.actions.newPassForm.service = service
  }

  render() {
    let { projectTitle, newPassForm: { code, email, password } } = this.props.actions
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
                ЗАДАТЬ НОВЫЙ ПАРОЛЬ
              </Header>
              <Form size='large' onSubmit={this.handleNewPass}>
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
                  <Form.Input
                    size='huge'
                    name="code"
                    fluid
                    icon='lock'
                    value={code || ''}
                    iconPosition='left'
                    placeholder='Код подтверждения'
                    onChange={this.handleChange}
                  />
                  <Form.Input
                    size='huge'
                    name="password"
                    fluid
                    icon='lock'
                    iconPosition='left'
                    placeholder='Пароль'
                    type='password'
                    onChange={this.handleChange}
                  />
                  <Button
                    disabled = {!this.state.filled}
                    fluid size='huge' color='grey'
                    onClick={this.handleNewPass}
                  >
                    Подтвердить
                  </Button>
                </Segment>
              </Form>
              <Message className='squared'>
                Уже зарегистрированы? <RouterLink to='/login'>Войти</RouterLink><br />
                Или <RouterLink to="/resetpass" >выслать</RouterLink> повторный код подтверждения
              </Message>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }

}

export default NewPass;
