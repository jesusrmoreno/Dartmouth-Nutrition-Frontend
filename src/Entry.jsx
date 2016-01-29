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
import {
  Grid,
  Row,
  Col,
} from './Grid.js';

let colorTheme = {
  selected: '#f2f2f2',
  hover: '#f2f2f2',
};

import {
  allRecipes,
  allOfferings,
  getRecipes,
} from './Queries.js';

let defaultState = {
  loading: false,
  offerings: {},
  recipes: [],
  selectedVenue: 'CYC',
  selectedDate: moment(),
  selectedMenu: '',
  selectedMeal: '',
  selectedRecipe: {},
  filterStage: 0,
  route: 'menu',
};

let keyToName = {
  CYC: 'The Hop',
  DDS: '\'53 Commons',
  NOVACK: 'Novack',
};

function appState(state = defaultState, action) {
  switch (action.type) {
  case 'UPDATE_FILTERSTAGE':
    return objectAssign({}, state, {
      filterStage: action.filterStage
    });
  case 'DATE_CHANGE':
    return objectAssign({}, state, {
      selectedDate: action.selectedDate
    });
  case 'MEAL_SELECT':
    return objectAssign({}, state, {
    selectedMeal: action.meal
  });
  case 'MENU_SELECT':
    return objectAssign({}, state, {
    selectedMenu: action.menu
  });
  case 'OFFERINGS':
    return objectAssign({}, state, {
      offerings: action.offerings,
      venueKeys: action.venueKeys || []
    });
  case 'UPDATE_OFFERINGS':
    return objectAssign({}, state, {
      offerings: action.offerings
    });
  case 'UPDATE_RECIPES':
    return objectAssign({}, state, {
      recipes: action.recipes
    });
  case 'RECIPES':
    return objectAssign({}, state, {
      recipes: action.recipes,
      offerings: action.offerings,
    });
  case 'VENUE_SELECT':
    return objectAssign({}, state, {
      selectedVenue: action.venue
    });


  case 'UPDATE_ROUTE':
    return objectAssign({}, state, {
      route: action.route
    });

  case 'RECIPE_SELECT':
    return objectAssign({}, state, {
      selectedRecipe: action.recipe
    });
  default:
    return state
  }
}

let store = createStore(appState);

let updateDate = (date) => {
  store.dispatch({
    type: 'DATE_CHANGE',
    selectedDate: date
  });
};

let updateFilterStage = (stage) => {
  store.dispatch({
    type: 'UPDATE_FILTERSTAGE',
    filterStage: stage
  });
}

let updateSelectedVenue = (venue) => {
  console.log(venue);
  store.dispatch({
    type: 'VENUE_SELECT',
    venue: venue,
  });
}

let updateSelectedMeal = (meal) => {
  console.log(meal);
  store.dispatch({
    type: 'MEAL_SELECT',
    meal: meal,
  });
}

let updateSelectedRecipe = (recipe) => {
  store.dispatch({
    type: 'RECIPE_SELECT',
    recipe: recipe,
  });
}

let updateSelectedMenu = (menu) => {
  let currentState = store.getState();
  store.dispatch({
    type: 'MENU_SELECT',
    menu: menu,
  });
  if (menu !== '') {
    localGetRecipes(currentState.selectedVenue, menu, currentState.selectedMeal, currentState.selectedDate)
  }
}

function localGetRecipes(venue, menu, meal, date) {
  let offerings = store.getState().offerings;
  let finalOffering = _.filter(offerings, (offering) => {
    return offering.month === date.month() + 1 &&
    offering.day === date.date() &&
    offering.year === date.year() &&
    offering.menuName === menu &&
    offering.venueKey === venue &&
    offering.mealName === meal;
  });
  var Subject = Parse.Object.extend("Offering");
  var query = new Parse.Query(Subject);
  query.get(finalOffering[0].objectId).then((subjectObj) => {
    var relation = subjectObj.relation("recipes");
    var query = relation.query();
    return query.find();
  }).then((recipes) => {
    return recipes.map((rec) => {
      return rec.toJSON();
    });
  }).then((recipes) => {

    updateRecipes(_.sortBy(recipes, 'name'));
  });


}


let updateRoute = (route) => {
  store.dispatch({
    type: 'UPDATE_ROUTE',
    route: route
  });
};


let updateOfferings = (offerings) => {
  store.dispatch({
    type: 'UPDATE_OFFERINGS',
    offerings: offerings
  });
};

let updateRecipes = (recipes) => {
  store.dispatch({
    type: 'UPDATE_RECIPES',
    recipes: recipes
  });
};

let updateLoadingStatus = (val) => {
  store.dispatch({
    type: 'LOADING',
    value: val
  });
};

function initialLoad() {
  updateLoadingStatus('Sending Request');
  return allOfferings().then((offerings) => {
    updateOfferings(offerings);
  }).then(() => {
    updateLoadingStatus('Request Complete');
  });
}

function venuesFromOfferings(offerings) {
  return _.uniq(Object.keys(offerings).map((offeringKey) => {
    return offerings[offeringKey].venueKey;
  }));
}

function mealsFromVenue(venueKey) {
  return _.uniq(_.filter(_.values(store.getState().offerings), (offering) => {
    return offering.venueKey === venueKey;
  }).map((offering) => {
    return offering.mealName;
  }));
}

function menusFromMealVenue(meal, venueKey) {
  return _.uniq(_.filter(_.values(store.getState().offerings), (offering => {
    return offering.venueKey === venueKey && offering.mealName === meal;
  })).map((offering) => {
    return offering.menuName;
  })) || [];
}

class RecipeRow extends React.Component {
  constructor(props){
    super(props);
  }
  handleRecipeChange(recipe) {
    updateSelectedRecipe(recipe);
  }

  render() {
    let recipe = this.props.recipe;
    let nutrients = recipe.nutrients.result || {};
    let metaKeys = ['dairy'];
    let showWarning = false;
    metaKeys.forEach((key) => {
      if (_.has(nutrients, key) && nutrients[key] === true) {
        showWarning = true;
      }
    });
    let infoStyle = {
      flex: 1,
      padding: '.8rem',
    };

    let infoStyleCenter = objectAssign({}, infoStyle, {
      alignItems: 'center',
    })



    let first = (
      <Row key={this.props.key} style={[{
        padding: '1.6rem',
        alignItems: 'center',
        cursor: 'pointer',
        display: 'flex',
        ':hover': {
          background: '#f2f2f2'
        }
      }, fontStyles.body2]} onClick={this.handleRecipeChange.bind(this, recipe)}>
        <Col style={[infoStyle, {
          flex: 5,
        }]}>
          Recipe Name
        </Col>
        <Col style={infoStyleCenter}>
          Calories
        </Col>
        <Col style={infoStyleCenter}>
          Fat
        </Col>
        <Col style={infoStyleCenter}>
          Carbs
        </Col>
        <Col style={infoStyleCenter}>
          Protein
        </Col>
        <Col style={[infoStyleCenter]}>
          Alergens
        </Col>
      </Row>
    );

    let notFirst = (
      <Row key={this.props.key} style={[{
        padding: '1.6rem',
        alignItems: 'center',
        cursor: 'pointer',
        display: 'flex',
        ':hover': {
          background: '#f2f2f2'
        }
      }, fontStyles.body1]} onClick={this.handleRecipeChange.bind(this, recipe)}>
        <Col style={[infoStyle, {
          flex: 5,
        }]}>
          {recipe.name}
        </Col>
        <Col style={infoStyleCenter}>
          {nutrients.calories}
        </Col>
        <Col style={infoStyleCenter}>
          {nutrients.fat === 'less than 1g' ? '0g' : nutrients.fat}
        </Col>
        <Col style={infoStyleCenter}>
          {nutrients.carbs === 'less than 1g' ? '0g' : nutrients.carbs}
        </Col>
        <Col style={infoStyleCenter}>
          {nutrients.protein === 'less than 1g' ? '0g' : nutrients.protein}
        </Col>
        <Col style={infoStyleCenter}>
          {showWarning ? <i style={{
            color: '#FFCC43'
          }} className="fa fa-exclamation-triangle"></i> : null }
        </Col>
      </Row>
    );
    return (
      this.props.isFirst ? first : notFirst
    );
  }
}


class RecipeList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Col style={{
        flex: 1,
        overflowY: 'scroll',
        maxHeight: 'calc(100vh - 6.4rem)',
        padding: '.8rem',
      }}>
        {this.props.recipes.map((recipe, i) => {
          return (
            <RecipeRow recipe={recipe} key={i} isFirst={i == 0}/>
          );
        })}
      </Col>
    );
  }
}

RecipeList = Radium(RecipeList);

class Navigation extends React.Component {
  constructor(props) {
    super(props);
  }
  handleDateChange(date) {
    updateDate(date);
    updateSelectedMeal('');
    updateSelectedMenu('');
    updateSelectedRecipe({});
  }
  handleVenueChange(venueKey) {
    console.log("running");
    updateSelectedVenue(venueKey);
    updateSelectedMeal('');
    updateSelectedRecipe({});
    updateSelectedMenu('');
    updateRecipes([]);
    updateFilterStage(1);
  }
  handleMealChange(meal) {
    updateSelectedMeal(meal);
    updateSelectedMenu('');
    updateRecipes([]);
    updateSelectedRecipe({});
    updateFilterStage(2);
  }
  handleMenuChange(menu) {
    updateSelectedMenu(menu);
    updateRecipes([]);
    updateSelectedRecipe({});
    updateFilterStage(2);
  }
  render() {
    return (
      <Col style={{
        width: '20rem',
        background: 'white',
        height: 'calc(100vh - 6.4rem)',
        overflowY: 'scroll',
      }}>
        <Col style={{
          flex: '1',
          padding: '1rem'
        }}>
          <Row style={[{
            color: 'white',
            paddingBottom: '.5rem',
          }, fontStyles.caption]}>
            <DatePicker
              selected={this.props.selectedDate}
              onChange={this.handleDateChange}
              maxDate={moment().add(5, 'days')}
              minDate={moment().subtract(10, 'days')}
              dateFormat={"LL"}
            />
          </Row>
          <Row style={[{
            color: '#444444',
            paddingBottom: '.5rem',
          }, fontStyles.caption]}>Locations</Row>
          {this.props.venueKeys.map((venueKey) => {
            let color = '#444444';
            let background = venueKey === this.props.selectedVenue ? '#f2f2f2' : 'transparent';
            return (
              <div style={[fontStyles.subheading, {
                color: color,
                padding: '.4rem .8rem',
                backgroundColor: background,
                cursor: 'pointer',
              }]} key={venueKey} onClick={this.handleVenueChange.bind(this, venueKey)}>{keyToName[venueKey]}</div>
            );
          })}
          <Row style={[{
            color: '#444444',
            paddingBottom: '.5rem',
            paddingTop: '1rem',
          }, fontStyles.caption]}>Times</Row>
          {this.props.meals.map((meal) => {
            let color = '#444444';
            let background = meal === this.props.selectedMeal ? '#f2f2f2' : 'transparent';
            return (
              <div style={[fontStyles.subheading, {
                color: color,
                padding: '.4rem .8rem',
                backgroundColor: background,
                cursor: 'pointer',
              }]} key={meal} onClick={this.handleMealChange.bind(this, meal)}>{meal}</div>
            );
          })}
          <Row style={[{
            color: '#444444',
            paddingBottom: '.5rem',
            paddingTop: '1rem',
          }, fontStyles.caption]}>Menus</Row>
          {this.props.menus.map((menu) => {
            let color = '#444444';
            let background = menu === this.props.selectedMenu ? '#f2f2f2' : 'transparent';
            return (
              <div style={[fontStyles.subheading, {
                color: color,
                padding: '.4rem .8rem',
                backgroundColor: background,
                cursor: 'pointer',
              }]} key={menu} onClick={this.handleMenuChange.bind(this, menu)}>{menu}</div>
            );
          })}
        </Col>
      </Col>
    );
  }
}
Navigation = Radium(Navigation);

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
        Create new User
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
          background: '#00AE69',
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


class MenuView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let venueKeys = venuesFromOfferings(this.props.offerings);
    let meals = mealsFromVenue(this.props.selectedVenue);
    let menus = menusFromMealVenue(this.props.selectedMeal, this.props.selectedVenue);
    return (
      <Row>
        <Navigation
          stage={this.props.filterStage}
          selectedVenue={this.props.selectedVenue}
          selectedMeal={this.props.selectedMeal}
          selectedMenu={this.props.selectedMenu}
          selectedDate={this.props.selectedDate}
          venueKeys={venueKeys}
          meals={meals}
          menus={menus}
        />
        <RecipeList recipes={this.props.recipes} selectedRecipe={this.props.selectedRecipe}/>
      </Row>
    )
  }
}
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
    let venueKeys = venuesFromOfferings(this.state.offerings);
    let meals = mealsFromVenue(this.state.selectedVenue);
    let menus = menusFromMealVenue(this.state.selectedMeal, this.state.selectedVenue);
    let ROUTES = {
      menu: (
        <MenuView
          offerings={this.state.offerings}
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
