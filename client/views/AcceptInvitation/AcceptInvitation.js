import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import { Button, Form, Grid, Header, Image, Message, Segment } from "semantic-ui-react";

import RouterLink from "../../router/a";

@inject("router", "db", "actions", "user")
@observer
class AcceptInvitation extends Component {
  constructor(props) {
    super(props);
    this.state = { confirm_password: "", checkPass: true, filled: false };
  }
  handleConfirm = (e) => {
    e.preventDefault();
    this.props.user.confirmInvite();
  };
  handleChange = async (e) => {
    let { name, value } = e.target;
    if (name === "confirm_password") {
      await this.setState({ confirm_password: value });
    } else {
      this.props.actions.confirmInviteForm[name] = value;
    }

    let filled =
      this.props.actions.confirmInviteForm.email &&
      this.props.actions.confirmInviteForm.email.length > 5 &&
      this.props.actions.confirmInviteForm.password &&
      this.props.actions.confirmInviteForm.password.length > 4 &&
      this.state.confirm_password &&
      this.state.confirm_password.length > 4;
    this.setState({ filled: filled });

    if (filled && (name === "confirm_password" || name === "password")) {
      this.setState({ checkPass: this.props.actions.confirmInviteForm.password === this.state.confirm_password });
    }
  };
  componentDidMount() {
    let { code, email, service } = this.props.router.values;
    this.handleChange({ target: { name: "code", value: code || "" } });
    this.handleChange({ target: { name: "email", value: email || "" } });
    this.props.actions.confirmForm.service = service;
  }

  render() {
    let {
      projectTitle,
      confirmInviteForm: { code, email, service, password, firstname, lastname, patronymic },
    } = this.props.actions;
    let { confirm_password } = this.state;
    return (
      <div className="login-form height100perc">
        <Grid padded textAlign="center" style={{ height: "100%" }} verticalAlign="middle">
          <Grid.Column style={{ maxWidth: 650 }}>
            <Segment basic>
              <Header as="h2" color="grey" textAlign="center">
                {projectTitle}
              </Header>
              <Header as="h3" color="grey" textAlign="center">
                ПОДТВЕРЖДЕНИЕ РЕГИСТРАЦИИ
              </Header>
              <Form size="large" onSubmit={this.handleConfirm}>
                <Segment padded="very" className="no-border raised">
                  <Form.Group widths="equal">
                    <Form.Input
                      size="large"
                      name="code"
                      fluid
                      icon="lock"
                      value={code || ""}
                      iconPosition="left"
                      placeholder="Код подтверждения"
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                  <Form.Group widths="equal">
                    <Form.Input
                      size="large"
                      name="email"
                      fluid
                      icon="mail"
                      value={email}
                      iconPosition="left"
                      placeholder="E-mail"
                      onChange={this.handleChange}
                    />
                    <Form.Input
                      size="large"
                      name="lastname"
                      fluid
                      icon="user"
                      value={lastname}
                      iconPosition="left"
                      placeholder="Фамилия"
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                  <Form.Group widths="equal">
                    <Form.Input
                      size="large"
                      name="firstname"
                      fluid
                      icon="user"
                      value={firstname}
                      iconPosition="left"
                      placeholder="Имя"
                      onChange={this.handleChange}
                    />
                    <Form.Input
                      size="large"
                      name="patronymic"
                      fluid
                      icon="user"
                      value={patronymic}
                      iconPosition="left"
                      placeholder="Отчество"
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                  <Form.Group widths="equal">
                    <Form.Input
                      size="large"
                      name="password"
                      fluid
                      error={!this.state.checkPass}
                      icon="lock"
                      iconPosition="left"
                      placeholder="Пароль"
                      value={password}
                      type="password"
                      onChange={this.handleChange}
                    />
                    <Form.Input
                      size="large"
                      name="confirm_password"
                      fluid
                      error={!this.state.checkPass}
                      icon="lock"
                      iconPosition="left"
                      placeholder="Подтверждение пароля"
                      value={confirm_password}
                      type="password"
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                  <Message className="squared" size="tiny" hidden={!!this.state.filled && !!this.state.checkPass}>
                    Пароль должен содержаь не менее пяти символов
                  </Message>
                  <Button disabled={!this.state.filled} fluid size="large" color="blue" onClick={this.handleConfirm}>
                    Подтвердить
                  </Button>
                </Segment>
              </Form>
              <Message className="squared">
                Уже зарегистрированы? <RouterLink to="/login">Войти</RouterLink>
                <br />
                Или <RouterLink to="/getconfirm">выслать</RouterLink> повторный код подтверждения
              </Message>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default AcceptInvitation;
