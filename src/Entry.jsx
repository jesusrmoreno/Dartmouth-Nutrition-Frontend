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
import {
  MenuView,
  RecipeRow,
  RecipeAddModal,
} from './MenuView.jsx';
import { logOut, currentUser, getUserMealsForDate, } from './Queries.js';
import { LoginView } from './Login.jsx';
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
  updateUser,
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

let infoStyle = {
  flex: 1,
  padding: '.8rem 1.6rem',
};

let infoStyleCenter = objectAssign({}, infoStyle, {
  alignItems: 'flex-end',
})


class DiaryView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: moment(),
      meals: [],
    };
  }

  handleChange(date) {
    this.setState({
      selectedDate: date,
    });
    this.getMeals(date);
  }

  getMeals(date) {
    getUserMealsForDate(date).then((meals) => {
      this.setState({
        meals: meals,
      });
      console.log(meals);
    });
  }

  componentDidMount() {
    this.getMeals(this.state.selectedDate);
  }

  render() {
    let foodCalories = 0;
    this.state.meals.forEach((meal) => {
      meal.entries.forEach((entry) => {
        foodCalories += entry.servingsMultiplier *  parseInt(entry.recipe.nutrients.result.calories);
      });
    });
    let happyColor = '#00CC7B';
    let sadColor = '#EC4A41';
    let goalCalories = store.getState().currentUser !== null ? store.getState().currentUser.get('goalDailyCalories') : 2000;
    let noMealsForDate = (
      <Col style={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        padding: '1.6rem',
        textAlign: 'center',
        color: 'rgba(0, 0, 0, .27)',
        height: 'calc(100vh - 6.4rem)',
      }}>
        <Row style={[fontStyles.display2]}>
          No entries for that date
        </Row>
        <Row style={[fontStyles.display2]}>
        <i className="fa fa-frown-o"></i>
        </Row>
      </Col>
    );
    return (
      <div style={{
        overflowY: 'scroll',
        maxHeight: 'calc(100vh - 6.4rem)',
        position: 'relative',
        padding: '0rem 0rem 1.6rem 0rem',
      }}>
        <Row key={"DiaryViewDate"} style={[{
          alignItems: 'center',
          padding: '.8rem 1.6rem',
          position: 'fixed',
          background: 'white',
          borderBottom: '2px solid #00CC7B',
          width: '100vw',
        }, fontStyles.caption]}>
          <Col>
            <DatePicker
              selected={this.state.selectedDate}
              onChange={this.handleChange.bind(this)}
              maxDate={moment().add(5, 'days')}
              minDate={moment().subtract(10, 'days')}
              dateFormat={"LL"}
            />
          </Col>
          <Col style={{
            flex: 1,
            alignItems: 'flex-end',
          }}>
            <Row>
              <Col style={{
                alignItems: 'center',
                padding: '0rem 1.6rem',
                display: store.getState().currentUser !== null ? 'flex' : 'none',
              }}>
                <Row style={[fontStyles.title]}>{goalCalories}</Row>
                <Row style={[fontStyles.body1]}>Goal</Row>
              </Col>
              <Col style={{
                alignItems: 'center',
                padding: '0rem 1.6rem',
              }}>
                <Row style={[fontStyles.title]}>{foodCalories}</Row>
                <Row style={[fontStyles.body1]}>Food</Row>
              </Col>
              <Col style={{
                alignItems: 'center',
                padding: '0rem 1.6rem',
                color: goalCalories - foodCalories > 0 ? happyColor : sadColor,
              }}>
                <Row style={[fontStyles.title]}>{goalCalories - foodCalories}</Row>
                <Row style={[fontStyles.body1]}>Remaining</Row>
              </Col>
            </Row>
          </Col>
        </Row>
        {this.state.meals.length === 0 ? noMealsForDate : null}
        <Row style={{height: '6.4rem'}}></Row>
        {this.state.meals.map((meal) => {
          return (
            <Col>
              <Row style={[fontStyles.display2, {
                padding: '0.8rem 2.4rem',
              }]}> {meal.title} </Row>
              <RecipeRow isFirst={true}/>
              {meal.entries.map((entry) => {
                return (
                    <RecipeRow recipe={entry.recipe} multiplier={entry.servingsMultiplier} isFirst={false}/>
                );
              })}
            </Col>
          );
        })}

      </div>
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
  handleSignClick() {
    if (this.props.currentUser === null) {
      this.handleRouteChange('user');
    } else {
      logOut();
      updateUser(currentUser());
      updateRoute('menu');
    }
  }

  render() {
    return (
      <Row style={[{
        width: '100vw',
        height: '6.4rem',
        background: '#00CC7B',
        alignItems: 'center',
        zIndex: '10000',
      }]}>
        <Col style={[fontStyles.headline, {
          justifyContent: 'center',
          color: 'white',
          padding: '1.6rem',
          height: '100%',
          width: '20rem',
          fontFamily: '"Slabo 27px"',
        }]}>
          DartMunch
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
              display: store.getState().currentUser === null ? 'none' : 'block',
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
              display:'none',
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
          }]} onClick={this.handleSignClick.bind(this, "user")}>
            {this.props.currentUser !== null ? `Sign Out ${this.props.currentUser.getEmail()}` : 'Log In/Sign Up'}
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
          shouldShowModal={this.state.shouldShowModal}
        />
      ),
      user: (
        <LoginView />
      ),
      userDiary: (
        <DiaryView />
      ),
    };
    return (
      <Grid>
        <NavBar currentUser={this.state.currentUser}/>
        <RecipeAddModal selectedRecipe={this.state.selectedRecipe} show={this.state.shouldShowModal}/>
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
