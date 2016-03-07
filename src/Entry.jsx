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


// TODO:
//  Past Meals
//  Update in Diary instead of Creating a new One
//  Fix the nutritional Info
//  Custom Food
//  Search Database


import {
  MenuView,
  RecipeRow,
  RecipeAddModal,
  RecipeList,
} from './MenuView.jsx';
import {
  logOut,
  currentUser,
  getUserMealsForDate,
  recentRecipes,
  allRecipes,
} from './Queries.js';
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
  updateAllRecipes,
  updateRefreshDiary,

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


class RecentRecipes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recipes: [],
    };
  }

  componentDidMount() {
    recentRecipes().then((recipes) => {
      this.setState({
        recipes: recipes,
      });
    });
  }

  render() {
    return (
      <RecipeList recipes={this.state.recipes}/>
    );
  }
}

class RecentMeals extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Col>
        Hello World
      </Col>
    );
  }
}

let mealOrder = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
class DiaryView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: moment(),
      meals: [],
      loading: true,
    };
  }

  handleChange(date) {
    this.setState({
      selectedDate: date,
    });
    this.getMeals(date);
  }

  getMeals(date) {
    this.setState({
      loading: true,
      meals: {},
    });
    getUserMealsForDate(date).then((meals) => {
      this.setState({
        meals: _.keyBy(meals, 'title'),
        loading: false,
      });
      updateRefreshDiary(false)
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.shouldRefresh === true) {
      this.getMeals(this.state.selectedDate);
    }
  }

  componentDidMount() {
    updateRefreshDiary(false)
    this.getMeals(this.state.selectedDate);

  }

  render() {
    let foodCalories = 0;
    mealOrder.forEach((mealKey) => {
      let meal = this.state.meals[mealKey];
      if (!_.isUndefined(meal)) {
        meal.entries.forEach((entry) => {
          foodCalories += entry.servingsMultiplier *  Math.floor(parseInt(entry.recipe.nutrients.result.calories));
        });
      }
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
          {this.state.loading === false ? 'No entries...' : 'Getting entries...'}
        </Row>
        <Row style={[fontStyles.display2]}>
        {this.state.loading === false ? <i className="fa fa-frown-o"></i> : <i className="fa fa-heart-o"></i>}

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
        {_.keys(this.state.meals).length === 0 ? noMealsForDate : null}
        <Row style={{height: '6.4rem'}}></Row>
        {mealOrder.map((key) => {
          let meal = this.state.meals[key];
          if (_.isUndefined(meal)) {
            return null;
          }

          return (
            <Col>
              <Row style={[fontStyles.display2, {
                padding: '0.8rem 2.4rem',
              }]}>{meal.title}</Row>
              <RecipeRow isFirst={true} diaryRow={true}/>
              {meal.entries.map((entry) => {
                return (
                    <RecipeRow userMeal={meal} recipePointer={entry} recipe={entry.recipe} multiplier={entry.servingsMultiplier} diaryRow={true} isFirst={false}/>
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
            <div key="menu" style={[fontStyles.subheading, {
              padding: '.8rem',
              cursor: 'pointer',
              ':hover': {
                textDecoration: 'underline',
              },
            }]} onClick={this.handleRouteChange.bind(this, "menu")}>
              Menu
            </div>
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
            <div key="recentRecipes" style={[fontStyles.subheading, {
              padding: '.8rem',
              cursor: 'pointer',
              display: store.getState().currentUser === null ? 'none' : 'block',
              ':hover': {
                textDecoration: 'underline',
              },
            }]} onClick={this.handleRouteChange.bind(this, "recentRecipes")}>
              Recent Recipes
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
    allRecipes().then((recipes) => {
      updateAllRecipes(recipes);
    });
  }
  render() {

    let recipesToShow = this.state.searchValue === '' ? this.state.recipes : _.filter(this.state.allRecipes, (recipe) => {
      return recipe.name.toLowerCase().indexOf(this.state.searchValue.toLowerCase()) !== -1;
    });

    let ROUTES = {
      menu: (
        <MenuView
          offerings={this.state.offeringsAvailable}
          stage={this.state.filterStage}
          selectedVenue={this.state.selectedVenue}
          selectedMeal={this.state.selectedMeal}
          selectedMenu={this.state.selectedMenu}
          selectedDate={this.state.selectedDate}
          recipes={recipesToShow}
          selectedRecipe={this.state.selectedRecipe}
          shouldShowModal={this.state.shouldShowModal}
        />
      ),
      user: (
        <LoginView />
      ),
      userDiary: (
        <DiaryView shouldRefresh={this.state.refreshDiary}/>
      ),
      recentRecipes: (
        <RecentRecipes />
      ),
      recentMeals: (
        <RecentMeals />
      )
    };
    return (
      <Grid>
        <NavBar currentUser={this.state.currentUser}/>
        <RecipeAddModal
          key={"NotMenu"}
          selectedRecipe={this.state.selectedRecipe}
          show={this.state.shouldShowModal}
          showDeleteButton={this.state.route === 'userDiary'}
          inDiary={this.state.route === 'userDiary'}
        />
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
