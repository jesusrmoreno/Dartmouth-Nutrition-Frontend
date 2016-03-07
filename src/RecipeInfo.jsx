import React from "react";
import objectAssign from 'object-assign';
import _ from 'lodash';
import Radium from 'radium';
import { fontStyles, animated } from './styles.js';
import DatePicker from 'react-datepicker';
import moment from 'moment';
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
  updateRefreshDiary,
} from './state.js';
import {
  Grid,
  Row,
  Col,
  Text,
} from './Grid.js';

import {
  addToDiary,
  deleteRecipeFromMeal,
  editEntryInMeal,
} from './Queries.js';

let mealOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

let inputStyle = [animated, fontStyles.body2, {
  outline: 'none',
  background: '#f4f4f4',
  padding: '.8rem',
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  borderBottom: '2px solid transparent',
  width: '100%',
  margin: '0rem 0rem',
  ':focus': {
    borderBottom: '2px solid #00CC7B',
  }
}];

function numberValue(s) {
  if (_.isUndefined(s)) {
    return 0;
  }
  return parseInt(s.replace('g', ''));
}


export class NutritionalInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      servings: 1,
      status: '',
      selectedDiaryMeal: this.props.recipe.__userMeal !== undefined ? this.props.recipe.__userMeal.title : 'Breakfast',
      selectedDate: moment(),
    }
  }
  editEntry() {
    editEntryInMeal(this.props.recipe.__diaryEntry, this.state.servings)
      .then((results) => {
        updateRefreshDiary(true);
        updateAddRecipeModal(false);
      });
  }
  updateDiaryMeal(event) {
    this.setState({
      selectedDiaryMeal: event.target.value,
    });
  }
  closeModal() {
    updateAddRecipeModal(false);
  }
  handleDateChange(date) {
    this.setState({
      selectedDate: date,
    });
  }
  handleDeletion() {
    deleteRecipeFromMeal(this.props.recipe["__userMeal"], this.props.recipe["__diaryEntry"])
      .then((results) => {
        updateRefreshDiary(true);
        updateAddRecipeModal(false);
        updateRoute('userDiary');
      });
  }
  addToDiary() {
    this.setState({
      status: 'posting',
    });
    addToDiary(this.props.recipe, parseFloat(this.state.servings), this.state.selectedDate.toDate(), this.state.selectedDiaryMeal)
      .then(() => {
        updateRefreshDiary(true)
        updateAddRecipeModal(false);
        this.setState({
          status: 'idle',
        });
      });
  }
  updateServings(event) {
    this.setState({
      servings: event.target.value,
    });
  }
  render() {
    let recipe = _.has(this.props.recipe, 'nutrients') ? this.props.recipe : {
      nutrients: {}
    };
    let nutrients = recipe.nutrients.result || {};
    let addButtonMessage = "Add to Diary";
    console.log(this.props.inDiary)
    if (this.props.inDiary) {
      addButtonMessage = "Save Changes"
    }
    return (
      <Col style={{
        background: 'white',
        width: '400px',
        minHeight: '300px',
        padding: '.8rem',
        position: 'relative',
      }}>
        <Row style={{
          position: 'absolute',
          right: '.8rem',
          top: '.8rem',
          cursor: 'pointer',
        }} onClick={this.closeModal.bind(this)}>
          <Text type="title">
            <i className="fa fa-fw fa-times"></i>
          </Text>
        </Row>
        <Row style={{
          width: '100%',
        }}>
          <Col style={{
            flex: 1,
          }}>
            <Row>
              <Text type="title">
                {recipe.name}
              </Text>
            </Row>
            <Row style={{
              padding: '.4rem 0rem',
              borderBottom: '1px solid #f2f2f2',
              marginBottom: '.4rem',
            }}>
              <Text type="subheading">
                Nutritional Info
              </Text>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col style={{
            flex: 1
          }}>
            <Row>
              <Col style={{
                flex: 1
              }}>
                <Text type="body2">Calories</Text>
              </Col>
              <Col style={{
                flex: 1
              }}>
                <Text type="caption">
                  {Math.floor(nutrients.calories * this.state.servings)}
                </Text>
              </Col>
            </Row>
            <Row>
              <Col style={{
                flex: 1
              }}>
                <Text type="body2">Protein</Text>
              </Col>
              <Col style={{
                flex: 1
              }}>
                <Text type="caption">
                  {nutrients.protein === 'less than 1g' ? '0g' :  Math.floor(numberValue(nutrients.protein) * this.state.servings)}
                </Text>
              </Col>
            </Row>
            <Row>
              <Col style={{
                flex: 1
              }}>
                <Text type="body2">Carbs</Text>
              </Col>
              <Col style={{
                flex: 1
              }}>
                <Text type="caption">
                  {nutrients.carbs === 'less than 1g' ? '0g' :  Math.floor(numberValue(nutrients.carbs) * this.state.servings)}
                </Text>
              </Col>
            </Row>
            <Row>
              <Col style={{
                flex: 1
              }}>
                <Text type="body2">Total Fat</Text>
              </Col>
              <Col style={{
                flex: 1
              }}>
                <Text type="caption">
                  {nutrients.fat === 'less than 1g' ? '0g' : Math.floor(numberValue(nutrients.fat) * this.state.servings)}
                </Text>
              </Col>
            </Row>
            <Row>
              <Col style={{
                flex: 1
              }}>
                <Text type="body2">Cholesterol</Text>
              </Col>
              <Col style={{
                flex: 1
              }}>
                <Text type="caption">
                  {nutrients.cholestrol}
                </Text>
              </Col>
            </Row>
            <Row>
              <Col style={{
                flex: 1
              }}>
                <Text type="body2">Sodium</Text>
              </Col>
              <Col style={{
                flex: 1
              }}>
                <Text type="caption">
                  {nutrients.sodium}
                </Text>
              </Col>
            </Row>
            <Row>
              <Col style={{
                flex: 1
              }}>
                <Text type="body2">Serving Size</Text>
              </Col>
              <Col style={{
                flex: 1
              }}>
                <Text type="caption">
                  {nutrients.serving_size_grams}
                </Text>
              </Col>
            </Row>
            <Row>
              <Col style={{
                flex: 1
              }}>
                <Text type="body2">Serving Text</Text>
              </Col>
              <Col style={{
                flex: 1
              }}>
                <Text type="caption">
                  {nutrients.serving_size_text}
                </Text>
              </Col>
            </Row>
            <Row style={{
              padding: '.4rem 0rem',
            }}>
              <Col style={{
                flex: 1,
              }}>
                <Row style={[inputStyle, {
                  width: 'auto',
                  padding: '.8rem .8rem .8rem 0rem',
                  background: 'transparent',
                  minWidth: '2.4rem',
                }]}>
                  Servings
                </Row>
              </Col>
              <Col style={{
                flex: 1,
              }}>
                <input
                  style={inputStyle}
                  onChange={this.updateServings.bind(this)}
                  value={this.state.servings}
                  type="number"
                  placeholder="Servings" min="0"
                />
              </Col>
            </Row>
            <Row style={{
              padding: '.4rem 0rem',
              alignItems: 'center',
              display: !this.props.showDeleteButton ? 'flex' : 'none',
            }}>
              <Col style={[inputStyle, {
                width: 'auto',
                padding: '.8rem .8rem .8rem 0rem',
                background: 'white',
                flex: 1,
              }]}>
                Meal
              </Col>
              <Col style={{
                background: '#f4f4f4',
                flex: 1,
                background: '#f4f4f4',
                padding: '.8rem .4rem',
              }}>
                <select value={this.state.selectedDiaryMeal} style={{
                  fontSize: '1.6rem',
                  fontWeight: '400',
                  border: 'none',
                  outline: 'none',
                  background: '#f4f4f4',
                  width: '100%',
                }} onChange={this.updateDiaryMeal.bind(this)}>
                  {mealOptions.map((val) => {
                    if (this.props.recipe.__userMeal !== undefined) {
                      console.log(val === this.props.recipe.__userMeal.title);
                      console.log(this.props.recipe.__userMeal.title)
                      return (
                        <option selected={val === this.props.recipe.__userMeal.title} key={val} value={val}>{val}</option>
                      );
                    } else {

                    }
                    return (
                      <option key={val} value={val}>{val}</option>
                    );
                  })}
                </select>
              </Col>
            </Row>
            <Row style={{
              width: '100%',
              justifyContent: 'flex-end',
              padding: '.8rem 0rem',
              alignItems: 'center',
            }}>
              <Col style={{
                flex: 1,
                display: this.props.showDeleteButton ? 'flex' : 'none',
                padding: '0rem .8rem 0rem 0rem',
              }}>
                <button disabled={false} style={[fontStyles.button, {
                  background: false ? '#7E8C8D' : '#EC4A41',
                  padding: '.8rem',
                  color: 'white',
                  outline: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }]} onClick={this.handleDeletion.bind(this)}>Delete Entry</button>
              </Col>
              <Col style={{
                flex: 1,
                display: !this.props.showDeleteButton ? 'flex' : 'none',
              }}>
                <Row style={[{
                  color: 'white',
                }, fontStyles.caption]}>
                  <DatePicker
                    selected={this.state.selectedDate}
                    onChange={this.handleDateChange.bind(this)}
                    dateFormat={"LL"}
                  />
                </Row>
              </Col>
              <Col style={{
                flex: 1,
              }}>
                <button disabled={false} style={[fontStyles.button, {
                  background: false ? '#7E8C8D' : '#00CC7B',
                  padding: '.8rem',
                  color: 'white',
                  outline: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }]} onClick={this.props.inDiary ? this.editEntry.bind(this) : this.addToDiary.bind(this)}>{this.state.status === 'posting' ? 'Saving...' : addButtonMessage}</button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    );
  }
}
// Add directly to diary ...
// Custom food ...
// Database ...
// Recents ...
export class RecipeInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      servings: 1,
      selectedDiaryMeal: 'Breakfast',
      selectedDate: moment(),
      meal: "breakfast",
    }
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
  addToDiary() {
    this.setState({
      status: 'posting',
    });
    addToDiary(this.props.recipe, parseInt(this.state.servings), this.state.selectedDate.toDate(), this.state.selectedDiaryMeal)
      .then(() => {
        updateAddRecipeModal(false);
        this.setState({
          status: 'idle',
        });
      });
  }
  showModal(recipe) {
    updateAddRecipeModal(false);
  }
  updateDiaryMeal(event) {
    this.setState({
      selectedDiaryMeal: event.target.value,
    });
  }
  render() {
    let formFilled = this.state.servings > 0 && this.state.selectedDate !== undefined && this.state.selectedDiaryMeal !== undefined;
    let recipe = _.has(this.props.recipe, 'nutrients') ? this.props.recipe : {
      nutrients: {}
    };
    let nutrients = recipe.nutrients.result || {};
    return (
      <NutritionalInfo inDiary={this.props.inDiary} recipe={recipe} userMeal={{}} showDeleteButton={this.props.showDeleteButton}/>
    );
  };
}
