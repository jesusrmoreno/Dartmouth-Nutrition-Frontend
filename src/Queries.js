import Parse from 'parse';
import objectAssign from 'object-assign';
import _ from 'lodash';
import Promise from 'bluebird';

Parse.initialize("BAihtNGpVTx4IJsuuFV5f9LibJGnD1ZBOsnXk9qp", "8HwbJEWOncZ67sonTmsADWMYCF3CtcGLI9R1ZEAU");

const QUERYLIMIT = 1000;

export function currentUser() {
  return Parse.User.current();
}
export function logOut() {
  return Parse.User.logOut();
}

export function newUser(username, password, goalCalories) {
  let user = new Parse.User();
  user.set('username', username);
  user.set('email', username);
  user.set('password', password);
  user.set('goalDailyCalories', goalCalories);
  return new Promise((resolve, reject) => {
    user.signUp(null, {
      success: (user) => {
        resolve(user);
      },
      error: (user, error) => {
        console.log(error);
        reject(user, error);
      }
    });
  });
}

export function loginUser(username, password) {
  return new Promise((resolve, reject) => {
    Parse.User.logIn(username, password, {
      success: (user) => {
        resolve(user);
      },
      error: (user, error) => {
        console.log(error);
        reject(user, error);
      }
    });
  });
}
// Gets all the recipes from Parse...
export function allRecipes() {
  let finalRecipes = {};
  function getRecipes(skipValue, resolve) {
    let Recipe = Parse.Object.extend('Recipe');
    let query = new Parse.Query(Recipe);
    query.limit(QUERYLIMIT).skip(skipValue).find().then((recipes) => {
      recipes.forEach((recipe) => {
        finalRecipes[recipe.id] = recipe.toJSON();
      });
      if (recipes.length < QUERYLIMIT) {
        resolve(finalRecipes);
        return recipes;
      } else {
        return getRecipes(skipValue+=QUERYLIMIT, resolve);
      }
    });
  }
  return new Promise((resolve, reject) => {
    return getRecipes(0, resolve);
  });
}

export function getRecipes(venue, menu, meal, date) {
  let Offering = Parse.Object.extend('Offering');
  let query = new Parse.Query(Offering);
  query.equalTo('venueKey', venue);
  query.equalTo('menuName', menu);
  query.equalTo('mealName', venue);
  query.equalTo('date', date);

  return query.limit(QUERYLIMIT).find().then((offering) => {
    console.log(offering);
  });
}

export function allOfferings() {
  let finalOfferings = {};
  function getOfferings(skipValue, resolve) {
    let Offering = Parse.Object.extend('Offering');
    let query = new Parse.Query(Offering);
    query.limit(QUERYLIMIT).skip(skipValue).find().then((offerings) => {
      offerings.forEach((offering) => {
        finalOfferings[offering.id] = offering.toJSON();
      });
      if (offerings.length < QUERYLIMIT) {
        resolve(finalOfferings);
        return finalOfferings;
      } else {
        return getOfferings(skipValue+=QUERYLIMIT, resolve);
      }
    });
  }
  return new Promise((resolve, reject) => {
    return getOfferings(0, resolve);
  });
}
