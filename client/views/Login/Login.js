import React, { Component } from "react";
import { observer, inject } from "mobx-react";
// import Avatar from '@material-ui/core/Avatar';
// import Button from '@material-ui/core/Button';
// // import CssBaseline from '@material-ui/core/CssBaseline';
// import TextField from '@material-ui/core/TextField';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import Checkbox from '@material-ui/core/Checkbox';
// import Link from '@material-ui/core/Link';
// import Grid from '@material-ui/core/Grid';
// // import Box from '@material-ui/core/Box';
// // import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
// import Typography from '@material-ui/core/Typography';
// // import { makeStyles } from '@material-ui/core/styles';
// import Container from '@material-ui/core/Container';
import { Button, Form, Grid, Header, Image, Message, Segment, Divider, Checkbox } from "semantic-ui-react";
import RouterLink from "../../router/a";

@inject("router", "db", "actions", "user")
@observer
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filled: false,
      filledCode: false,
      showCode: false,
    };
  }
  handleLogin = async (e) => {
    e.preventDefault();
    // let { showCode } = this.state
    // if(showCode){
    //   this.props.actions.login()
    // }else{
    let isOk = await this.props.user.login();
    console.log(isOk);
    //   if( isOk ) this.setState({ showCode: true })
    // }
  };
  handleLogin2 = async (e) => {
    e.preventDefault();
    // let { showCode } = this.state
    // if(showCode){
    //   this.props.actions.login()
    // }else{
    let isOk = await this.props.actions.fakelogin2();
    console.log(isOk);
    //   if( isOk ) this.setState({ showCode: true })
    // }
  };
  checkFilled = () => {
    let { loginForm } = this.props.actions;
    let filled = loginForm.email.length > 3 && loginForm.password.length > 3;
    let filledCode = filled && loginForm.privateKey.length > 3;

    this.setState({ filled, filledCode });
  };
  handleChange = (e) => {
    let { name, value } = e.target;
    this.props.actions.loginForm[name] = value;
    this.checkFilled();
  };
  handleChecked = (e, { name, checked }) => {
    this.props.actions.loginForm[name] = checked;
    this.checkFilled();
  };
  render() {
    let { filled, filledCode, showCode } = this.state;
    let {
      loginForm: { remember },
      projectTitle,
    } = this.props.actions;
    return (
      <div className="login-form height100perc">
        <Grid padded textAlign="center" style={{ height: "100%" }} verticalAlign="middle">
          <Grid.Column style={{ maxWidth: 450 }}>
            <Segment basic>
              <Header as="h2" color="grey" size="huge" textAlign="center">
                <Image className="big" src="/logo.svg" />
                {projectTitle}
              </Header>
              <Header as="h3" color="grey" textAlign="center">
                Вход в систему
              </Header>
              <Form size="large" onSubmit={this.handleLogin}>
                <Segment padded="very" className="no-border raised">
                  <Form.Input
                    size="big"
                    name="email"
                    fluid
                    icon="user"
                    iconPosition="left"
                    placeholder="E-mail address"
                    onChange={this.handleChange}
                  />
                  <Form.Input
                    size="big"
                    name="password"
                    fluid
                    icon="lock"
                    iconPosition="left"
                    placeholder="Пароль"
                    type="password"
                    onChange={this.handleChange}
                  />
                  {showCode && (
                    <Form.Input
                      size="big"
                      name="privateKey"
                      fluid
                      icon="key"
                      iconPosition="left"
                      placeholder="Персональный ключ"
                      onChange={this.handleChange}
                    />
                  )}
                  <Form.Field align="left">
                    <Checkbox
                      value="remember"
                      name="remember"
                      checked={remember}
                      label="Запомнить меня"
                      onChange={this.handleChecked}
                    />
                  </Form.Field>
                  <Button fluid size="big" color="blue" onClick={this.handleLogin}>
                    Вход
                  </Button>
                  {false && (
                    <Button fluid size="big" color="blue" onClick={this.handleLogin2}>
                      Вход2
                    </Button>
                  )}
                </Segment>
              </Form>
              <Message className="squared">
                Забыли пароль? <RouterLink to="/resetpass">Восстановить</RouterLink>. <br />
                <RouterLink to="/signup">Регистрация</RouterLink> в системе <br />
                <RouterLink to="/confirm">Подтвердить</RouterLink> E-mail
              </Message>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}
export default Login;
