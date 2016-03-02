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
import {RecipeInfo} from './RecipeInfo.jsx';
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
  updateSearchValue,
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
  Text,
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

export class RecipeAddModal_Bak extends React.Component {
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
      <Col key={this.props.key} style={{
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

export class RecipeAddModal extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    console.log(this.props.show)
    return (
      <Col key={this.props.key} style={{
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
        margin: 'auto',
        padding: '12rem',
      }}>
        <RecipeInfo recipe={this.props.selectedRecipe} />
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
    let showWarning = false;
    let multiplier = this.props.multiplier || 1;

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
          <Text type="body1">Recipe Name</Text>
        </Col>
        <Col style={[infoStyleCenter, {
          display: this.props.diaryRow ? 'flex' : 'none',
        }]}>
          <Text>Servings</Text>
        </Col>
        <Col style={[infoStyleCenter]}>
          <Text>Calories</Text>
        </Col>
        <Col style={infoStyleCenter}>
          <Text>Fat</Text>
        </Col>
        <Col style={infoStyleCenter}>
          <Text>Carbs</Text>
        </Col>
        <Col style={infoStyleCenter}>
          <Text>Protein</Text>
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
      }, fontStyles.body1]}  onClick={this.showModal.bind(this, recipe)}>
        <Col style={[infoStyle, {
          flex: 5,
        }]}>
          {recipe.name}
        </Col>
        <Col style={[infoStyleCenter, {
          display: this.props.diaryRow ? 'flex' : 'none',
        }]}>
          {multiplier}
        </Col>
        <Col style={[infoStyleCenter]}>
          <Text>{Math.floor(nutrients.calories * multiplier)}</Text>
        </Col>
        <Col style={infoStyleCenter}>
          <Text>{nutrients.fat === 'less than 1g' ? '0g' : Math.floor(numberValue(nutrients.fat) * multiplier)}</Text>
        </Col>
        <Col style={infoStyleCenter}>
          <Text>{nutrients.carbs === 'less than 1g' ? '0g' :  Math.floor(numberValue(nutrients.carbs) * multiplier)}</Text>
        </Col>
        <Col style={infoStyleCenter}>
          <Text>{nutrients.protein === 'less than 1g' ? '0g' :  Math.floor(numberValue(nutrients.protein) * multiplier)}</Text>
        </Col>
      </Row>
    );
    return (
      this.props.isFirst ? first : notFirst
    );
  }
}



export class RecipeList extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let sorted = _.groupBy(this.props.recipes, 'category');
    Object.keys(sorted).map((key) => {
      sorted[key] = _.sortBy(sorted[key], 'rank');
    });

    let categories = _.sortBy(Object.keys(sorted), (cat) => {
      return -(_.sumBy(sorted[cat], 'rank') / sorted[cat].length);
    });

    return (
      <Col style={{
        flex: 1,
        overflowY: 'scroll',
        maxHeight: 'calc(100vh - 6.4rem)',
        padding: '.8rem',
        opacity: this.props.recipes.length > 0 ? 1 : 0,
      }}>
        {categories.map((cat, i) => {
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
    this.state = {
      searchValue: '',
    };
  }

  handleDateChange(date) {
    updateDate(date);
    updateSelectedMeal('');
    updateSelectedMenu('');
    updateSelectedRecipe({});
  }

  handleVenueChange(venueKey) {
    updateSelectedVenue(venueKey);
    updateSelectedRecipe({});
    updateSelectedMeal('');
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

  handleSearch(event) {
    this.setState({
      searchValue: event.target.value,
    });
    if (event.target.value === '') {
      updateSearchValue('');
    }
  }

  submitSearch(e) {
    if (e.charCode == 13) {
      updateSearchValue(this.state.searchValue);
    }
  }

  render() {
    return (
      <Col style={{
        width: '20rem',
        height: 'calc(100vh - 6.4rem)',
        overflowY: 'scroll',
      }}>
        <Col style={{
          flex: '1',
          padding: '1rem'
        }}>
          <Row>
            <input style={[inputStyle, {
              margin: '.8rem 0rem .8rem',
            }]} onChange={this.handleSearch.bind(this)} onKeyPress={this.submitSearch.bind(this)} placeholder="Search All Recipes" value={this.state.searchValue}/>
          </Row>
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
            paddingTop: '1rem',
          }]}>
            <Text type="caption">
              Locations
            </Text>
          </Row>
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
          }]}>
            <Text type="caption">
              Times
            </Text>
          </Row>
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
          }]}>
            <Text type="caption">
              Menus
            </Text>
          </Row>
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
          value={this.props.value}
        />
        <RecipeList recipes={this.props.recipes} selectedRecipe={this.props.selectedRecipe}/>
        <RecipeAddModal key={"Menu"} selectedRecipe={this.props.selectedRecipe} show={this.props.shouldShowModal}/>
      </Row>
    )
  }
}
