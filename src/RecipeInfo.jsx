import React from "react";
import objectAssign from 'object-assign';
import _ from 'lodash';
import Radium from 'radium';
import { fontStyles, animated } from './styles.js';
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
} from './state.js';
import {
  Grid,
  Row,
  Col,
  Text,
} from './Grid.js';
import {addToDiary} from './Queries.js';
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

// Add directly to diary ...
// Custom food ...
// Database ...
// Recents ...
// Do subscription stuff ...
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
      <Row style={{
        width: '50rem',
        height: '100%',
        background: 'white',
      }}>
        <Col style={{
          flex: 1,
          borderRight: '1px solid #f2f2f2',
        }}>
          <Row style={{
            padding: '.4rem .8rem',
          }}>
            <Text type="headline">{recipe.name}</Text>
          </Row>
          <Row style={{
            padding: '.4rem .8rem',
          }}>
            <Text type="title">Nutrition Info</Text>
          </Row>
          <Row>
            <Col style={{
              flex: 1,
              padding: '.8rem',
            }}>
              <Text type="body2">Calories</Text>
              <Text type="caption">
                {Math.floor(nutrients.calories * this.state.servings)}
              </Text>
            </Col>
            <Col style={{
              flex: 1,
              padding: '.8rem',
              borderLeft: '1px solid #F0F0F0',
            }}>
              <Text type="body2">Protein</Text>
              <Text type="caption">
                {nutrients.protein === 'less than 1g' ? '0g' :  Math.floor(numberValue(nutrients.protein) * this.state.servings)}
              </Text>
            </Col>
            <Col style={{
              flex: 1,
              padding: '.8rem',
              borderLeft: '1px solid #F0F0F0',
            }}>
              <Text type="body2">Carbs</Text>
              <Text type="caption">
                {nutrients.carbs === 'less than 1g' ? '0g' :  Math.floor(numberValue(nutrients.carbs) * this.state.servings)}
              </Text>
            </Col>
          </Row>
          <Row style={{
            padding: '.4rem .8rem',
          }}>
            <Col style={{
              flex: 1,
            }}>
              <Text type="body2">Total Fat</Text>
            </Col>
            <Col>
              <Text type="body2">
                {nutrients.fat === 'less than 1g' ? '0g' : Math.floor(numberValue(nutrients.fat) * this.state.servings)}
              </Text>
            </Col>
          </Row>
          <Row style={{
            padding: '.4rem .8rem',
          }}>
            <Col style={{
              flex: 1,
            }}>
              <Text type="body2">Cholesterol</Text>
            </Col>
            <Col>
              <Text type="body2">{nutrients.cholestrol}</Text>
            </Col>
          </Row>
          <Row style={{
            padding: '.4rem .8rem',
          }}>
            <Col style={{
              flex: 1,
            }}>
              <Text type="body2">Sodium</Text>
            </Col>
            <Col>
              <Text type="body2">{nutrients.sodium}</Text>
            </Col>
          </Row>
          <Row style={{
            padding: '.4rem .8rem',
          }}>
            <Col style={{
              flex: 1,
            }}>
              <Text type="body2">Serving Size</Text>
            </Col>
            <Col>
              <Text type="body2">{nutrients.serving_size_grams}</Text>
            </Col>
          </Row>
          <Row style={{
            padding: '.4rem .8rem',
          }}>
            <Col style={{
              flex: 1,
            }}>
              <Text type="body2">Serving Text</Text>
            </Col>
            <Col>
              <Text type="body2">{nutrients.serving_size_text}</Text>
            </Col>
          </Row>
          <Row style={{
            padding: '.8rem .8rem',
          }}>

            <Col>
              <Row>
                <select value={this.state.selectedDiaryMeal} onChange={this.updateDiaryMeal.bind(this)}>
                  {mealOptions.map((val) => {
                    return (
                      <option key={val} value={val}>{val}</option>
                    );
                  })}
                </select>
              </Row>
              <Row style={{
                paddingBottom: '.8rem',
              }}>
                <Text type="title">Servings</Text>
              </Row>
              <input
                style={inputStyle}
                onChange={this.updateServings.bind(this)}
                value={this.state.servings}
                type="number"
                placeholder="Servings" min="1"
              />
            </Col>
          </Row>
          <Row style={{
            flex: 1,
            alignItems: 'flex-end',
            padding: '.8rem .8rem',
          }}>
            <Col>
              <button disabled={!formFilled} style={[fontStyles.button, {
                background: !formFilled ? '#7E8C8D' : '#00CC7B',
                padding: '.8rem',
                color: 'white',
                outline: 'none',
                border: 'none',
                margin: '1.6rem 0rem',
                cursor: 'pointer',
              }]} onClick={this.addToDiary.bind(this)}>{this.state.status === 'posting' ? 'Adding to Diary...' : 'Add to Diary'}</button>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  };
}
