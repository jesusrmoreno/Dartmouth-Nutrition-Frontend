'use strict';

/**
 * This is in early early alpha. The code is ugly and the flow is really
 * convoluted.
 */

import React from 'react';
import { createStore } from 'redux';
import AppBar from 'material-ui/lib/app-bar';
import List from 'material-ui/lib/lists/list.js';
import ListItem from 'material-ui/lib/lists/list-item.js';
import CircularProgress from 'material-ui/lib/circular-progress.js';
import Promise from 'bluebird';
import _ from 'lodash';

const host = "ancient-springs-1342.herokuapp.com";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      categories: {},
      venues: [],
      recipes: [],
      chosenVenue: undefined,
      shownMenus: []
    };
  }
  componentDidMount() {
    // get the list of venues and associated meals/menus etc..
    fetch(`http://${host}/api/v1/venues`)
      .then((res) => {
        return res.json();
      })
      .then((resJSON) => {
        setTimeout(() => {
          console.log(resJSON.venues);
          this.setState({
            loading: false,
            venues: resJSON.venues
          });
        }, 0);
      });
  }
  getStuff(menu) {
    this.setState({
      loading: true
    });
    let venue = this.state.chosenVenue;
    let meal = this.state.chosenMeal;
    let menuId = menu.did;

    // once we choose the meal and menu we can get the recipes..
    console.log(`http://${host}/api/v1/recipes?venueKey=${venue}&mealId=${meal}&menu=${menuId}`);
    fetch(`http://${host}/api/v1/recipes?venueKey=${venue}&mealId=${meal}&menu=${menuId}`)
      .then((res) => {
        return res.json();
      }).then((resJSON) => {
        this.setState({
          loading: false,
          recipes: resJSON.recipes
        });
      });
  }

  recipeInfo(recipe) {
    alert(JSON.stringify(recipe.nutrients));
  }

  chooseMeal(meal, venue, i) {
    // set the chosen meal when the user clicks on it..
    this.setState({
      chosenMeal: meal.did,
      shownMenus: meal.menus,
      chosenVenue: venue.key
    });
  }
  render() {
    const venues = this.state.venues;
    const recipes = this.state.recipes;
    const allVenues = venues.map((venue, i) => {
      return (
        <div key={venue.key}>
          <List subheader={venue.name}>
            {venue.meals.map((meal) => {
              return (
                <ListItem
                  onClick={this.chooseMeal.bind(this, meal, venue, i)}
                >
                  {meal.name}
                </ListItem>
              );
            })}
          </List>
        </div>
      );
    });

    const recipeDOM = (
      <List subheader="Recipes">
        {recipes.map((recipe) => {
          return (
            <ListItem onClick={this.recipeInfo.bind(this, recipe)}>
              {recipe.name}
            </ListItem>
          );
        })};
      </List>
    );

    const loading = (
      <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
      }}>
        <CircularProgress mode="indeterminate" size={1.5} />
      </div>
    );
    const categories = this.state.categories;
    const menus = (
      <List subheader="Menus">
        {this.state.shownMenus.map((menu) => {
        return (
          <ListItem onClick={this.getStuff.bind(this, menu)}>{menu.name}</ListItem>
        )})}
      </List>
    );

    const dom = (
      <div className="root">
        <AppBar style={{
            background: '#00693E'
          }} title="Dartmouth Food"/>
        {this.state.chosenVenue ? '': allVenues}
        {recipes.length > 0 ? recipeDOM : menus}


      </div>
    );
    return (
      this.state.loading ? loading : dom
    );
  }
}


React.render(
  <App />,
  document.querySelector('#root')
);
