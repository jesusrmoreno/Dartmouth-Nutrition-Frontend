'use strict';
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link } from 'react-router';
import { createStore } from 'redux';
import {Motion, spring} from 'react-motion';
import Promise from 'bluebird';
import _ from 'lodash';


const HOST = "ancient-springs-1342.herokuapp.com";
const initialState = {
  loading: true,
  venues: [],
  activeVenue: {},
  activeRecipe: {
    nutrients: {},
    allergens: {}
  },
  activeMeal: {
    menus: []
  },
  activeMenu: {},
  recipes: []
};

function updateState(oldState, newState) {
  return _.assign({}, oldState, newState);
}

function appState(state = initialState, action) {
  switch (action.type) {
    case 'LOADING':
      return state;
      break;
    case 'INITIAL_LOAD':
      return updateState(state, {
        venues: action.venues,
        loading: false
      });
    case 'TOGGLE_ACTIVE_MEAL':
      return updateState(state, {
        activeVenue: action.venue,
        activeMeal: action.meal,
        activeMenu: {},
        recipes: [],
        activeRecipe: {
          nutrients: {},
          allergens: {}
        },
      });
    case 'TOGGLE_ACTIVE_MENU':
      return updateState(state, {
        activeMenu: action.menu
      });

    case 'TOGGLE_ACTIVE_RECIPE':
      return updateState(state, {
        activeRecipe: action.recipe
      });

    case 'RECIPE_GET':
      return updateState(state, {
        recipes: action.recipes
      });
    default:
      return state;
  }
}

let store = createStore(appState);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = store.getState();
    store.subscribe(() => {
      this.setState(store.getState());
    });
  }

  componentDidMount() {
    fetch(`http://${HOST}/api/v1/venues`)
      .then((res) => {
        return res.json();
      })
      .then((resJSON) => {
        console.log(resJSON.venues);
        store.dispatch({
          type: 'INITIAL_LOAD',
          venues: resJSON.venues
        });
      });
  }

  setActiveMeal(venue, meal) {
    store.dispatch({
      type: 'TOGGLE_ACTIVE_MEAL',
      meal: meal,
      venue: venue,
    });
  }

  setActiveRecipe(recipe) {
    store.dispatch({
      type: 'TOGGLE_ACTIVE_RECIPE',
      recipe: recipe,
    });
  }

  getRecipes(menu) {
    store.dispatch({
      type: 'TOGGLE_ACTIVE_MENU',
      menu: menu,
    });

    const venue = this.state.activeVenue.key;
    const menuId = menu.did;
    const meal = this.state.activeMeal.did;
    fetch(`http://${HOST}/api/v1/recipes?venueKey=${venue}&menuId=${menuId}&mealId=${meal}`)
      .then((res) => {
        return res.json();
      })
      .then((resJSON) => {
        store.dispatch({
          type: 'RECIPE_GET',
          recipes: _.sortBy(_.uniq(resJSON.recipes, 'did'), 'name')
        });
      });
  }

  render() {
    const ALLERGENS = _.isUndefined(this.state.activeRecipe.allergens) ? [] : Object.keys(this.state.activeRecipe.allergens);
    const ALLERGEN_DOM = (
      <div>
        <h1>{ALLERGENS.length > 0 ? 'Allergens' : ''}</h1>
        {ALLERGENS.map(key => {
          return (
            <div className="allergen">{key}</div>
          )
        })}
      </div>

    );
    return (
      <div className="app_container">
        <div className="venue_list column">
          {this.state.venues.map((venue) => {
            return (
              <div className="venue column">
                <div className="column__title">
                  {venue.name}
                </div>
                <div className="meal_list column">
                  {_.sortBy(venue.meals, 'startTime').map((meal) => {
                    let classes = 'meal list_item';
                    if (this.state.activeVenue.key === venue.key && this.state.activeMeal.name === meal.name) {
                      classes = 'meal selected list_item';
                    }
                    return (
                      <div
                        className={classes}
                        onMouseOver={this.setActiveMeal.bind(this, venue, meal)}
                      >
                        {meal.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="menu_list column">
          <div className="column__title">
            <span>
              Menus
            </span>
          </div>
          {this.state.activeMeal.menus.map((menu) => {
            let classes = 'menu list_item';
            if (this.state.activeMenu.name === menu.name) {
              classes = 'menu selected list_item';
            }
            return (
              <div
                className={classes}
                onClick={this.getRecipes.bind(this, menu)}
              >
                {menu.name}
              </div>
            );
          })}
        </div>

        <div className="recipe_list column">
          <div className="column__title">
            <div style={{
                padding: '0em 0em 1em'
            }}>
              Recipes
            </div>
          </div>
          {this.state.recipes.map(recipe => {
            let classes = 'list_item';
            if (this.state.activeRecipe.name === recipe.name) {
              classes = 'selected list_item';
            }
            return (
              <div className="recipe">
                <div
                  className={classes}
                  onMouseOver={this.setActiveRecipe.bind(this, recipe)}
                >{recipe.name}</div>
              </div>
            );
          })}
        </div>
        <div className="recipe_info column">
          <div className="column__title">
            <div style={{
                padding: '0em 0em 1em'
            }}>
              Nutritional Info
            </div>
          </div>
          {ALLERGEN_DOM}
          {Object.keys(this.state.activeRecipe.nutrients).map(key => {
            const value = this.state.activeRecipe.nutrients[key];
            if (value !== '' && key !== 'title') {
              return (
                <div>
                  <div className="list_item">{key} : {value}</div>
                </div>
              );
            } else {
              return null;
            }
          })}
        </div>
      </div>
    );
  }
}



React.render(
  <App/>,
  document.querySelector('#root')
);
