import React from 'react';
import { createStore } from 'redux';
import AppBar from 'material-ui/lib/app-bar';
import List from 'material-ui/lib/lists/list.js';
import ListItem from 'material-ui/lib/lists/list-item.js';
import CircularProgress from 'material-ui/lib/circular-progress.js';
import Promise from 'bluebird';
import _ from 'lodash';

class VenueList extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <ul></ul>
    );
  }
}


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      categories: {},
      venues: [],
      recipes: [],
      chosenVenue: undefined
    };
  }
  componentDidMount() {
    fetch('http://ancient-springs-1342.herokuapp.com/api/v1/venues')
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
        }, 1000);
      });
  }
  chooseMeal(meal, venue, i) {
    this.setState({
      loading: true
    });
    console.log(`http://ancient-springs-1342.herokuapp.com/api/v1/recipes?venueKey=${venue.key}&mealId=${meal.did}`);
    fetch(`http://ancient-springs-1342.herokuapp.com/api/v1/recipes?venueKey=${venue.key}&mealId=${meal.did}`)
      .then((res) => {
        return res.json();
      }).then((resJSON) => {
        console.log(resJSON.recipes);

        let currentVenue = this.state.venues[i];
        let menus = currentVenue.menus;
        let categories = {};

        menus.forEach((m) => {
          categories[m.name] = categories[m.name] || [];
          _.sortBy(resJSON.recipes, 'name').forEach((r) => {
            if (r.menuId === m.did) {
              categories[m.name].push(r);
            }
          });
        });

        console.log(categories);

        this.setState({
          loading: false,
          categories: categories,
          chosenVenue: venue.name,
          recipes: resJSON.recipes
        });
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

    const loading = <CircularProgress mode="indeterminate" size={1.5} />;
    const categories = this.state.categories;
    const menus = Object.keys(categories).map((key) => {

      return (

          <List subheader={categories[key].length > 0 ? key : ''}>
          {categories[key].map(recipe => {
            return (
              <ListItem>{recipe.name}</ListItem>
            );
          })}
          </List>

      );
    });

    const dom = (
      <div className="root">
        <AppBar
  title="Dartmouth Nutrition Information"
  iconClassNameRight="muidocs-icon-navigation-expand-more" />
        {this.state.chosenVenue ? '': allVenues }
        {menus}
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
