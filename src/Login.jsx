import React from "react";
import ReactDOM from "react-dom";
import objectAssign from 'object-assign';
import DatePicker from 'react-datepicker';
import _ from 'lodash';
import Promise from 'bluebird';
import Parse from 'parse';
import {
  Row,
  Col,
  Grid,
} from './Grid.js';
import { fontStyles, animated } from './styles.js';

import {
  updateUser,
  updateRoute,
} from './state.js';

import {
  newUser,
  currentUser,
  loginUser,
} from './Queries.js';

let inputStyle = [animated, fontStyles.body2, {
  outline: 'none',
  background: '#f4f4f4',
  padding: '.8rem',
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  borderBottom: '2px solid transparent',
  width: '100%',
  margin: '1.6rem 0rem',
  ':focus': {
    borderBottom: '2px solid #00CC7B',
  }
}];


class LoginForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      email: undefined,
      password: undefined,
    };
  }
  attemptLogin() {
    console.log('attempting signup');
    let username = this.state.email;
    let password = this.state.password;

    loginUser(username, password).then((user) => {
      updateUser(currentUser());
      updateRoute('menu');
    }).catch((user, error) => {
      console.log(error);
    });

  }

  changeEmail(event) {
    this.setState({
      email: event.target.value,
    });
  }

  changePassword(event) {
    this.setState({
      password: event.target.value,
    });
  }

  render() {
    let formFilled = this.state.email !== undefined && this.state.password !== undefined;
    return (
      <Col>
        <Col style={[fontStyles.subheading, {
          padding: '1.6rem',
          borderRadius: '.2rem',
          width: '240px',
        }]}>
        <Col>
          <Row><input onChange={this.changeEmail.bind(this)} key="Email" style={inputStyle} type="email" placeholder="Email"/></Row>
        </Col>
        <Col>
          <Row><input onChange={this.changePassword.bind(this)}  key="password" style={inputStyle}  type="password" placeholder="Password"/></Row>
        </Col>
          <button disabled={!formFilled} style={[fontStyles.button, {
            background: !formFilled ? '#7E8C8D' : '#00CC7B',
            padding: '.8rem',
            color: 'white',
            outline: 'none',
            border: 'none',
            margin: '1.6rem 0rem',
            cursor: 'pointer',
          }]} onClick={this.attemptLogin.bind(this)}>Log In</button>
        </Col>
      </Col>
    );
  }
}


class NewUserForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: undefined,
      password: undefined,
      passwordMatch: undefined,
      calculated: undefined,
    };
  }

  changeEmail(event) {
    this.setState({
      email: event.target.value,
    });
  }

  changePassword(event) {
    this.setState({
      password: event.target.value,
    });
  }

  changePasswordMatch(event) {
    this.setState({
      passwordMatch: event.target.value,
    });
  }

  changeCalories(event) {
    this.setState({
      calculated: event.target.value,
    });
  }

  attemptSignUp() {
    console.log('attempting signup');
    let username = this.state.email;
    let password = this.state.password;
    let goalCalories = this.state.calculated || 2000;

    newUser(username, password, parseInt(goalCalories)).then((user) => {
      updateUser(currentUser());
      updateRoute('menu');
    }).catch((user, error) => {
      console.log(error);
    });
  }

  render() {


    let validPassword = this.state.password === this.state.passwordMatch;
    let passwordUnderlineColor = validPassword ? 'transparent' : '#EC4A41';
    let passwordStyle = [inputStyle, {
      borderBottom: '2px solid ' + passwordUnderlineColor,
      ':focus': {
        borderBottom: validPassword ? '2px solid #00CC7B' : '2px solid ' +  '#EC4A41',
      }
    }];


    let formFilled = validPassword && this.state.email !== undefined && this.state.calculated !== undefined && parseInt(this.state.calculated) > 0;
    return (
      <Col>
        <Col style={[fontStyles.subheading, {
          
          padding: '1.6rem',
          borderRadius: '.2rem',
          width: '240px',
        }]}>
          <Col>
            <Row><input onChange={this.changeEmail.bind(this)} key="Email" style={inputStyle} type="email" placeholder="Email"/></Row>
          </Col>
          <Col>
            <Row><input onChange={this.changePassword.bind(this)}  key="password" style={inputStyle}  type="password" placeholder="Password"/></Row>
          </Col>
          <Col>
            <Row><input onChange={this.changePasswordMatch.bind(this)} key="password_reentry" style={passwordStyle}  type="password" placeholder="Retype Password"/></Row>
          </Col>
          <Col>
            <Row><input onChange={this.changeCalories.bind(this)} key="calories" style={inputStyle}  type="number" placeholder="Goal Calories" value={this.state.calculated}/></Row>
          </Col>

          <button disabled={!formFilled} style={[fontStyles.button, {
            background: !formFilled ? '#7E8C8D' : '#00CC7B',
            padding: '.8rem',
            color: 'white',
            outline: 'none',
            border: 'none',
            margin: '1.6rem 0rem',
            cursor: 'pointer',
          }]} onClick={this.attemptSignUp.bind(this)}>Sign Up</button>
        </Col>
      </Col>
    );
  }
}


export class LoginView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      which: 'Login',
    };
  }

  changeForm(which) {
    this.setState({
      which: which
    });
  }

  render() {
    let toRender = this.state.which === 'Login' ? <LoginForm /> : <NewUserForm />;
    return (
      <Col style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 6.4rem)',
      }}>
        <Col style={{
          border: '2px solid #00CC7B',
        }}>
          <Row style={{
            justifyContent: 'flex-start',
            width: 240,
            padding: '1.6rem 1.6rem 0rem',
          }}>
            <Col style={[fontStyles.button, {
              paddingRight: '.8rem',
              cursor: 'pointer',
              // order: this.state.which === 'Login' ? -1 : 3,
            }]}>
              <div style={{
                color: this.state.which === 'Login' ? '#00CC7B' : 'rgba(0, 0, 0, .27)',
              }} onClick={this.changeForm.bind(this, 'Login')}>
                Login
              </div>
            </Col>
            <Col style={[fontStyles.button, {
              cursor: 'pointer',
              paddingRight: '.8rem',
            }]}>
              <div style={{
                color: this.state.which === 'SignUp' ? '#00CC7B' : 'rgba(0, 0, 0, .27)',
              }} onClick={this.changeForm.bind(this, 'SignUp')}>
                Sign Up
              </div>
            </Col>
          </Row>
          {toRender}
        </Col>
      </Col>
    );
  }

}
