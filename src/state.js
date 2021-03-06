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
  allRecipes,
  allOfferings,
  getRecipes,
} from './Queries.js';

let defaultState = {
  loading: false,
  offerings: {},
  offeringsAvailable: {},
  recipes: [],
  selectedVenue: 'CYC',
  selectedDate: moment(),
  selectedMenu: '',
  selectedMeal: '',
  selectedRecipe: {},
  filterStage: 0,
  route: 'menu',
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

  case 'UPDATE_OFFERINGS':
    return objectAssign({}, state, {
      offerings: action.offerings
    });

  case 'UPDATE_AVAILABLE_OFFERINGS':
    return objectAssign({}, state, {
      offeringsAvailable: action.offerings
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
  store.dispatch({
    type: 'UPDATE_AVAILABLE_OFFERINGS',
    offerings: offeringsForDate(date.date(), date.month() + 1, date.year()),
  })
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

let updateAvailableOfferings = (offerings) => {
  console.log("From available");
  console.log(Object.keys(offerings).length);
  store.dispatch({
    type: 'UPDATE_AVAILABLE_OFFERINGS',
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



function offeringsForDate(day, month, year) {
  let offerings = store.getState().offerings;
  let available = _.filter(offerings, (offering) => {
    return offering.month === month &&
    offering.day === day &&
    offering.year === year;
  });
  return available;
}

function initialLoad() {
  updateLoadingStatus('Sending Request');
  return allOfferings().then((offerings) => {
    updateOfferings(offerings);
    let selectedDate = store.getState().selectedDate;
    let availableForDate = offeringsForDate(selectedDate.date(), selectedDate.month() + 1, selectedDate.year());
    updateAvailableOfferings(availableForDate);
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

  return _.uniq(_.filter(_.values(store.getState().offeringsAvailable), (offering) => {

    return offering.venueKey === venueKey;
  }).map((offering) => {

    return offering.mealName;
  }));
}

function menusFromMealVenue(meal, venueKey) {
  return _.uniq(_.filter(_.values(store.getState().offeringsAvailable), (offering => {
    return offering.venueKey === venueKey && offering.mealName === meal;
  })).map((offering) => {
    return offering.menuName;
  })) || [];
}

export {
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
};
