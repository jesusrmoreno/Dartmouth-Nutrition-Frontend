import React from "react";
import ReactDOM from "react-dom";
import objectAssign from 'object-assign';
import DatePicker from 'react-datepicker';
import _ from 'lodash';
import Promise from 'bluebird';
import Parse from 'parse';

if (Parse.User.current()) {
  // Show the app view
} else {
  // show the login view
}
