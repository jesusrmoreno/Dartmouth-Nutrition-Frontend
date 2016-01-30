import React from "react";
import ReactDOM from "react-dom";
import objectAssign from 'object-assign';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import Color from 'color';
import _ from 'lodash';
import Radium from 'radium';
import Promise from 'bluebird';
import Parse from 'parse';
import { createStore } from 'redux';
import { fontStyles } from './styles.js';
import health from 'healthstats';
import {MenuView} from './MenuView.jsx';
import {
  menusFromMealVenue,
  mealsFromVenue,
  venuesFromOfferings,
  initialLoad,
  updateLoadingStatus,
  updateDate,
  updateRoute,
  updateRecipes,
  updateOfferings,
  updateFilterStage,
  updateSelectedMenu,
  updateSelectedMeal,
  updateSelectedRecipe,
  updateSelectedVenue,
  store,
} from './state.js';

import {
  Grid,
  Row,
  Col,
} from './Grid.js';

let colorTheme = {
  selected: '#f2f2f2',
  hover: '#f2f2f2',
};

let keyToName = {
  CYC: 'The Hop',
  DDS: '\'53 Commons',
  NOVACK: 'Novack',
  COLLIS: 'Collis',
};


class LoginView extends React.Component {
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

class NavBar extends React.Component {
  constructor(props) {
    super(props);
  }

  handleRouteChange(route) {
    updateRoute(route)
  }
  render() {
    return (
      <Row style={[{
        width: '100vw',
        height: '6.4rem',
        background: '#00CC7B',
        alignItems: 'center',
      }]}>
        <Col style={[fontStyles.headline, {
          justifyContent: 'center',
          color: 'white',
          padding: '.8rem',
          height: '100%',
          width: '20rem',
        }]}>
          DartMouth
        </Col>
        <Row style={[fontStyles.subheading, {
          justifyContent: 'flex-end',
          alignItems: 'center',
          color: 'white',
          padding: '.8rem',
          height: '100%',
          flex: 1,
        }]}>
          <Row style={{
            flex: 1
          }}>
            <div key="userDiary" style={[fontStyles.subheading, {
              padding: '.8rem',
              cursor: 'pointer',
              ':hover': {
                textDecoration: 'underline',
              },
            }]} onClick={this.handleRouteChange.bind(this, "userDiary")}>
              Diary
            </div>
            <div key="menu" style={[fontStyles.subheading, {
              padding: '.8rem',
              cursor: 'pointer',
              ':hover': {
                textDecoration: 'underline',
              },
            }]} onClick={this.handleRouteChange.bind(this, "menu")}>
              Menu
            </div>
            <div key="userPreferences" style={[fontStyles.subheading, {
              padding: '.8rem',
              cursor: 'pointer',
              ':hover': {
                textDecoration: 'underline',
              },
            }]} onClick={this.handleRouteChange.bind(this, "userPreferences")}>
              Preferences
            </div>
          </Row>
          <div key="signup" style={[fontStyles.subheading, {
            padding: '1.6rem',
            cursor: 'pointer',
            ':hover': {
              textDecoration: 'underline',
            },
          }]} onClick={this.handleRouteChange.bind(this, "user")}>
            Sign Up
          </div>
        </Row>
      </Row>
    );
  }
}

NavBar = Radium(NavBar);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = store.getState();
    store.subscribe(() => {
      this.setState(store.getState());
    });
  }
  componentDidMount() {
    initialLoad();
  }
  render() {
    console.log(this.state.recipes);
    let ROUTES = {
      menu: (
        <MenuView
          offerings={this.state.offeringsAvailable}
          stage={this.state.filterStage}
          selectedVenue={this.state.selectedVenue}
          selectedMeal={this.state.selectedMeal}
          selectedMenu={this.state.selectedMenu}
          selectedDate={this.state.selectedDate}
          recipes={this.state.recipes}
          selectedRecipe={this.state.selectedRecipe}
        />
      ),
      user: (
        <LoginView />
      ),
    };
    return (
      <Grid>
        <NavBar />
        {ROUTES[this.state.route]}
      </Grid>
    )
  }
}

App = Radium(App);
ReactDOM.render(
  <App/>,
  document.querySelector('#root')
);
