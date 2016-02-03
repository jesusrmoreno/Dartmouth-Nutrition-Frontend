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
import health from 'healthstats';

var Select = require('react-select');



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
  updateAddRecipeModal,
} from './state.js';
import { fontStyles, animated } from './styles.js';

let inputStyle = [animated, fontStyles.body2, {
  outline: 'none',
  background: '#f4f4f4',
  padding: '.8rem',
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  borderBottom: '2px solid transparent',
  width: '100%',
  margin: '1.6rem 0rem',
  ':focus': {
    borderBottom: '2px solid #00CC7B',
  }
}];


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
import {addToDiary} from './Queries.js';

let mealOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
function numberValue(s) {
  if (_.isUndefined(s)) {
    return 0;
  }
  return parseInt(s.replace('g', ''));
}

export class RecipeAddModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      servings: 1,
      selectedDiaryMeal: 'Breakfast',
      selectedDate: moment(),
      status: 'idle',
    };
  }

  handleDateChange(date) {
    this.setState({
      selectedDate: date,
    });
  }
  updateServings(event) {
    this.setState({
      servings: event.target.value,
    });
  }

  showModal(recipe) {
    updateAddRecipeModal(false);
  }

  addToDiary() {
    this.setState({
      status: 'posting',
    });
    addToDiary(this.props.selectedRecipe, parseInt(this.state.servings), this.state.selectedDate.toDate(), this.state.selectedDiaryMeal)
      .then(() => {
        updateAddRecipeModal(false);
        this.setState({
          status: 'idle',
        });
      });
  }

  updateDiaryMeal(event) {
    this.setState({
      selectedDiaryMeal: event.target.value,
    });
  }

  render() {

    let formFilled = this.state.servings > 0 && this.state.selectedDate !== undefined && this.state.selectedDiaryMeal !== undefined;
    let recipe = this.props.selectedRecipe.nutrients !== undefined ? this.props.selectedRecipe : {
      nutrients: {}
    };

    let nutrients = recipe.nutrients.result || {};
    let infoStyle = {
      flex: 1,
      padding: '.8rem',
    };

    let infoStyleCenter = objectAssign({}, infoStyle, {
      alignItems: 'flex-end',
    });

    return (
      <Col style={{
        position: 'absolute',
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, .57)',
        top: 0,
        left: 0,
        zIndex: 100001,
        display: this.props.show === true ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}>


        <Col style={{
          height: '80vh',
          width: '80vw',
          backgroundColor: 'white',
          padding: '1.6rem',
          boxShadow: '0px 0px 4px rgba(0, 0, 0, .58)',
        }}>
          <Row style={{
            justifyContent: 'flex-end',
          }}>
            <div style={[fontStyles.body2, {
              cursor: 'pointer',
            }]}>
              <i
                className="fa fa-fw fa-times"
                onClick={this.showModal.bind(this, this.props.selectedRecipe)}>
              </i>
            </div>
          </Row>
          <Row>
            <select value={this.state.selectedDiaryMeal} onChange={this.updateDiaryMeal.bind(this)}>
              {mealOptions.map((val) => {
                return (
                  <option key={val} value={val}>{val}</option>
                );
              })}
            </select>
          </Row>
          <Row style={[{
            color: 'white',
            paddingBottom: '.5rem',
          }, fontStyles.caption]}>
            <DatePicker
              selected={this.state.selectedDate}
              onChange={this.handleDateChange.bind(this)}
              dateFormat={"LL"}
            />
          </Row>
          <Col>
            <Row key="labelRow" style={[{
              padding: '.4rem 1.6rem',
              alignItems: 'center',
              display: 'flex',
              color: 'rgba(0, 0, 0, .3)',
            }, fontStyles.body2]}>
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
            <Row style={[{
              padding: '.4rem 1.6rem',
              alignItems: 'center',
              cursor: 'pointer',
              display: 'flex',
              ':hover': {
                background: '#f2f2f2'
              }
            }, fontStyles.body1]}>
              <Col style={[infoStyle, {
                flex: 5,
              }]}>
                {recipe.name}
              </Col>
              <Col style={infoStyleCenter}>
                {Math.floor(nutrients.calories * this.state.servings)}
              </Col>
              <Col style={infoStyleCenter}>
                {nutrients.fat === 'less than 1g' ? '0g' : Math.floor(numberValue(nutrients.fat) * this.state.servings)}
              </Col>
              <Col style={infoStyleCenter}>
                {nutrients.carbs === 'less than 1g' ? '0g' :  Math.floor(numberValue(nutrients.carbs) * this.state.servings)}
              </Col>
              <Col style={infoStyleCenter}>
                {nutrients.protein === 'less than 1g' ? '0g' :  Math.floor(numberValue(nutrients.protein) * this.state.servings)}
              </Col>
            </Row>
            <Row>
               <input style={inputStyle} onChange={this.updateServings.bind(this)} value={this.state.servings} type="number" placeholder="Servings" min="1"/>
            </Row>

            <Row>
              <button disabled={!formFilled} style={[fontStyles.button, {
                background: !formFilled ? '#7E8C8D' : '#00CC7B',
                padding: '.8rem',
                color: 'white',
                outline: 'none',
                border: 'none',
                margin: '1.6rem 0rem',
                cursor: 'pointer',
              }]} onClick={this.addToDiary.bind(this)}>{this.state.status === 'posting' ? 'Adding to Diary...' : 'Add to Diary'}</button>
            </Row>
          </Col>
        </Col>
      </Col>
    );
  }
}

export class RecipeRow extends React.Component {
  constructor(props){
    super(props);
  }

  showModal(recipe) {
    updateSelectedRecipe(recipe);
    updateAddRecipeModal(true);
  }

  render() {
    let recipe = this.props.recipe || {
      nutrients: {}
    };
    let nutrients = recipe.nutrients.result || {};
    let metaKeys = ['dairy'];
    let showWarning = false;
    let multiplier = this.props.multiplier || 1;

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
      }, fontStyles.body2]}>
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
    console.log(recipe.name, nutrients.calories * multiplier, multiplier, nutrients.calories);
    let notFirst = (
      <Row key={this.props.key} style={[{
        padding: '.4rem 1.6rem',
        alignItems: 'center',
        cursor: 'pointer',
        display: 'flex',
        ':hover': {
          background: '#f2f2f2'
        }
      }, fontStyles.body1]}  onClick={this.showModal.bind(this, recipe)}>
        <Col style={[infoStyle, {
          flex: 5,
        }]}>
          {recipe.name}
        </Col>
        <Col style={infoStyleCenter}>
          {Math.floor(nutrients.calories * multiplier)}
        </Col>
        <Col style={infoStyleCenter}>
          {nutrients.fat === 'less than 1g' ? '0g' : Math.floor(numberValue(nutrients.fat) * multiplier)}
        </Col>
        <Col style={infoStyleCenter}>
          {nutrients.carbs === 'less than 1g' ? '0g' :  Math.floor(numberValue(nutrients.carbs) * multiplier)}
        </Col>
        <Col style={infoStyleCenter}>
          {nutrients.protein === 'less than 1g' ? '0g' :  Math.floor(numberValue(nutrients.protein) * multiplier)}
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





export class MenuView extends React.Component {
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
        <RecipeAddModal selectedRecipe={this.props.selectedRecipe} show={this.props.shouldShowModal}/>
      </Row>
    )
  }
}
