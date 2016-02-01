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



function maleBMR (weight, height, age) {
  var BMR = 66 + (6.23 * weight) + (12.7 * height) - (6.8 * age);
  return BMR;
}

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
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
    return (
      <Col style={{
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 6.4rem)',
      }}>
        <Col style={[fontStyles.subheading, {
          background: 'white',
          padding: '1.6rem',
          borderRadius: '.2rem',
          width: '240px',
          border: '2px solid #00CC7B',
        }]}>
          <Col>
            <Row><input key="Email" style={inputStyle} type="email" placeholder="Email"/></Row>
          </Col>
          <Col>
            <Row><input key="password" style={inputStyle}  type="password" placeholder="Password"/></Row>
          </Col>
          <button style={[fontStyles.button, {
            background: '#00CC7B',
            padding: '.8rem',
            color: 'white',
            outline: 'none',
            border: 'none',
            margin: '1.6rem 0rem',
            cursor: 'pointer',
          }]}>Log In</button>
        </Col>
      </Col>
    );
  }
}


class NewUserForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      age: 0,
      weight: 0,
      height: 0,
      calculated: 2000,
    };
  }

  calcCalories() {
    this.setState({
      calculated: maleBMR(this.state.weight, this.state.height, this.state.age),
    });
  }

  setAge(event) {
    this.setState({
      age: event.target.value,
    });
    this.calcCalories();
  }

  setWeight(event) {
    this.setState({
      weight: event.target.value,
    });
    this.calcCalories();
  }

  setHeight(event) {
    this.setState({
      height: event.target.value,
    });
    this.calcCalories();
  }

  render() {
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
    return (
      <Col style={{
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 6.4rem)',
      }}>
        <Col style={[fontStyles.subheading, {
          background: 'white',
          padding: '1.6rem',
          borderRadius: '.2rem',
          width: '240px',
          border: '2px solid #00CC7B',
        }]}>
          <Col>
            <Row><input key="Email" style={inputStyle} type="email" placeholder="Email"/></Row>
          </Col>
          <Col>
            <Row><input key="password" style={inputStyle}  type="password" placeholder="Password"/></Row>
          </Col>
          <Col>
            <Row><input key="password_reentry" style={inputStyle}  type="password" placeholder="Retype Password"/></Row>
          </Col>
          <Col>
            <Row><input onChange={this.setWeight.bind(this)} key="weight" style={inputStyle}  type="number" placeholder="weight lbs" value={this.state.weight}/></Row>
          </Col>
          <Col>
            <Row><input onChange={this.setHeight.bind(this)} key="height" style={inputStyle}  type="number" placeholder="height inches" value={this.state.height}/></Row>
          </Col>
          <Col>
            <Row><input onChange={this.setAge.bind(this)} key="age" style={inputStyle}  type="number" placeholder="age" value={this.state.age}/></Row>
          </Col>
          <Col>
            <Row><input readOnly={true} key="calories" style={inputStyle}  type="number" placeholder="calculatedCalories" value={this.state.calculated}/></Row>
          </Col>

          <button style={[fontStyles.button, {
            background: '#00CC7B',
            padding: '.8rem',
            color: 'white',
            outline: 'none',
            border: 'none',
            margin: '1.6rem 0rem',
            cursor: 'pointer',
          }]}>Log In</button>
        </Col>
      </Col>
    );
  }
}


export class LoginView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <LoginForm />
    );
  }

}
