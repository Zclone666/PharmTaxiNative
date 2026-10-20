import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import { Button, Form, Grid, Header, Image, Message, Segment, Link } from "semantic-ui-react";

import RouterLink from "../../router/a";

@inject("router", "db", "actions")
@observer
class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confirm_password: "",
      checkPass: true,
      filled: false,
    };
  }
  handleSignup = (e) => {
    e.preventDefault();

    this.props.actions.signin();
  };
  handleChange = async (e) => {
    let { name, value } = e.target;
    if (name === "confirm_password") {
      await this.setState({ confirm_password: value });
    } else {
      this.props.actions.signinForm[name] = value;
    }

    let filled =
      this.props.actions.signinForm.email &&
      this.props.actions.signinForm.email.length > 5 &&
      this.props.actions.signinForm.password &&
      this.props.actions.signinForm.password.length > 5 &&
      this.state.confirm_password &&
      this.state.confirm_password.length > 5;
    this.setState({ filled: filled });

    if (filled && (name === "confirm_password" || name === "password")) {
      this.setState({ checkPass: this.props.actions.signinForm.password === this.state.confirm_password });
    }
  };

  render() {
    let {
      projectTitle,
      signinForm: { email, password, lastName, firstName, middleName, lpuName, department },
    } = this.props.actions;
    let { confirm_password, filled, checkPass } = this.state;
    return (
      <div className="login-form height100perc">
        <Grid padded textAlign="center" style={{ height: "100%" }} verticalAlign="middle">
          <Grid.Column style={{ maxWidth: 650 }}>
            <Segment basic>
              <Header as="h2" color="grey" textAlign="center">
                {projectTitle}
              </Header>
              <Header as="h3" color="grey" textAlign="center">
                Регистрация
              </Header>
              <Form size="large" onSubmit={this.handleSignup}>
                <Segment padded="very" className="no-border raised">
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
                      name="firstName"
                      fluid
                      icon="user"
                      value={firstName}
                      iconPosition="left"
                      placeholder="Имя"
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                  <Form.Group widths="equal">
                    <Form.Input
                      size="large"
                      name="middleName"
                      fluid
                      icon="user"
                      value={middleName}
                      iconPosition="left"
                      placeholder="Отчество"
                      onChange={this.handleChange}
                    />
                    <Form.Input
                      size="large"
                      name="lastName"
                      fluid
                      icon="user"
                      value={lastName}
                      iconPosition="left"
                      placeholder="Фамилия"
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
                    Пароль должен содержаь не менее 6 символов
                  </Message>
                  <Button
                    disabled={!(this.state.filled && this.state.checkPass)}
                    fluid
                    size="large"
                    color="grey"
                    onClick={this.handleSignup}
                  >
                    Регистрация
                  </Button>
                </Segment>
              </Form>
              <Message className="squared">
                Уже зарегистрированы? <RouterLink to="/login">Войти</RouterLink>
              </Message>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default Signup;
