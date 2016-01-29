var Parse = require('parse/node');
import objectAssign from 'object-assign';
import _ from 'lodash';
import Promise from 'bluebird';

Parse.initialize("BAihtNGpVTx4IJsuuFV5f9LibJGnD1ZBOsnXk9qp", "8HwbJEWOncZ67sonTmsADWMYCF3CtcGLI9R1ZEAU");

const QUERYLIMIT = 1000;

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


function allRecipesParse() {
  let finalRecipes = {};
  function getRecipes(skipValue, resolve) {
    let Recipe = Parse.Object.extend('Recipe');
    let query = new Parse.Query(Recipe);
    query.limit(QUERYLIMIT).skip(skipValue).find().then((recipes) => {
      recipes.forEach((recipe) => {
        finalRecipes[recipe.id] = recipe;
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

function doStuff() {
  Parse.User.logIn("ddsuser", "passwor123").then((user) => {
    allRecipesParse().then((recipes) => {
      _.forEach(recipes, (recipe) => {
        // recipe.set('createdBy', user);
        // recipe.save();
      });
    });
  });
}

doStuff();
