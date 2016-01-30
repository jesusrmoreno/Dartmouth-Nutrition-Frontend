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


class RecipeRow extends React.Component {
  constructor(props){
    super(props);
  }

  handleRecipeChange(recipe) {
    updateSelectedRecipe(recipe);
  }

  render() {
    let recipe = this.props.recipe || {
      nutrients: {}
    };
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
      alignItems: 'flex-end',
    })

    let first = (
      <Row key={this.props.key} style={[{
        padding: '.4rem 1.6rem',
        alignItems: 'center',
        display: 'flex',
        color: 'rgba(0, 0, 0, .3)',
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
      </Row>
    );

    let notFirst = (
      <Row key={this.props.key} style={[{
        padding: '.4rem 1.6rem',
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
    let sorted = _.groupBy(this.props.recipes, 'category');

    return (
      <Col style={{
        flex: 1,
        overflowY: 'scroll',
        maxHeight: 'calc(100vh - 6.4rem)',
        padding: '.8rem',
        opacity: this.props.recipes.length > 0 ? 1 : 0,
      }}>
        {Object.keys(sorted).map((cat, i) => {
          return (
            <div key={i} style={{
              margin: '1.6rem 0rem'
            }}>
              <Row key={i} style={[fontStyles.button, {
                padding: '.8rem 1.6rem',
                color: '#00CC7B',
              }]}>
                {cat}
              </Row>
              <RecipeRow key={`first${i}`} isFirst={true}/>
              {sorted[cat].map((recipe, i) => {
                return (
                  <RecipeRow recipe={recipe} key={recipe.objectId} isFirst={false}/>
                );
              })}
            </div>
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
            console.log(venueKey);
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





export class MenuView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log(this.props.offerings)
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
