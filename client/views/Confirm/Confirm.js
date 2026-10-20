import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'

import RouterLink from '../../router/a';



@inject('router', 'db', 'actions')
@observer
class Confirm extends Component {
  constructor(props) {
    super(props);
    this.state = { filled: null}
  }
  handleConfirm = (e) => {
    e.preventDefault()
    this.props.actions.confirm()
  }
  handleChange = (e) => {
    let { name, value } = e.target;
    let { confirmForm } = this.props.actions
    this.props.actions.confirmForm[name] = value;
    this.setState({ filled: ( confirmForm.email.length > 5 && confirmForm.code.length > 5 ) })
  }
  componentDidMount(){
    let { code, email, service } = this.props.router.values
    this.handleChange({ target: { name: 'code', value: code || '' }})
    this.handleChange({ target: { name: 'email', value: email || '' }})
    this.props.actions.confirmForm.service = service
  }

  render() {
    let { projectTitle, confirmForm: { code, email, service } } = this.props.actions
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
                ПОДТВЕРЖДЕНИЕ РЕГИСТРАЦИИ
              </Header>
              <Form size='large' onSubmit={this.handleConfirm}>
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
                  <Button
                    disabled = {!this.state.filled}
                    fluid size='huge' color='grey'
                    onClick={this.handleConfirm}
                  >
                    Подтвердить
                  </Button>
                </Segment>
              </Form>
              <Message className='squared'>
                Уже зарегистрированы? <RouterLink to='/login'>Войти</RouterLink><br />
                Или <RouterLink to="/getconfirm" >выслать</RouterLink> повторный код подтверждения
              </Message>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }

}

export default Confirm;
