import React from "react";
import ReactDOM from "react-dom";
import objectAssign from 'object-assign';
import DatePicker from 'react-datepicker';
import _ from 'lodash';
import Promise from 'bluebird';
import Parse from 'parse';

export class LoginView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Row style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 6.4rem)',
      }}>
        <div>
          <label for="name">email</label>
          <input type="text" id="name" />
        </div>
        <div>
          <label for="mail">password</label>
          <input type="email" id="mail" />
        </div>
        <div>
          <label for="mail">retype password</label>
          <input type="password" id="mail" />
        </div>
      </Row>
    );
  }

}
