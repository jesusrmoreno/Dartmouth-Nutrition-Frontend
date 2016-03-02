import Parse from 'parse';
import objectAssign from 'object-assign';
import _ from 'lodash';
import Promise from 'bluebird';
import moment from 'moment';
Parse.initialize("BAihtNGpVTx4IJsuuFV5f9LibJGnD1ZBOsnXk9qp", "8HwbJEWOncZ67sonTmsADWMYCF3CtcGLI9R1ZEAU");

const QUERYLIMIT = 1000;
// The general assumption is that someone with of the same identity (in this case gender) will know better the issues that they face and as such will create policies that will benefit their identity. However this may not always be the case. While representation is great for a number of reasons (e.g. for children seeing someone in that position that is like them might make that position seem more attainable). When it comes down to it legislators should be chosen based on their beliefs, experience, and what they propose to accomplish in their time in office not on the basis of their unchangeable characteristics such as sex. That they happen to identify as a woman or a man or anything else should come second to the issues that a constituency is facing. 

export function getUserMealsForDate(date) {
  let user = currentUser();
  let UserMeal = Parse.Object.extend('UserMeal');
  let query = new Parse.Query(UserMeal);

  query.greaterThanOrEqualTo('date', moment(date).startOf('day').toDate());
  query.lessThanOrEqualTo('date', moment(date).endOf('day').toDate());
  console.log(date);
  query.equalTo('user', user);
  query.include('entries');
  query.include('entries.recipe');
  return query.find().then((meals) => {
    let jsonMeals = meals.map((meal) => {
      return meal.toJSON();
    });
    return _.sortBy(jsonMeals, 'date.iso');
  });
}
export function getUserMeal(title, date) {
  let user = Parse.User.current();
  let UserMeal = Parse.Object.extend('UserMeal');

  let query = new Parse.Query(UserMeal);
  query.equalTo('title', title);
  query.greaterThanOrEqualTo('date', moment(date).startOf('day').toDate());
  query.lessThanOrEqualTo('date', moment(date).endOf('day').toDate());
  query.equalTo('user', user);


  return query.first().then((meal) => {
    return meal;
  });
}

export function createUserMeal(title, diaryEntry, date) {
  let user = Parse.User.current();
  let UserMeal = Parse.Object.extend('UserMeal');
  let userMeal = new UserMeal();
  userMeal.set('date', date);
  userMeal.set('title', title);
  userMeal.set('entries', [diaryEntry]);
  userMeal.set('user', user);
  return userMeal.save();
}


export function addToUserMeal(meal, diaryEntry) {
  console.log("Attempting to update usermeal");

  let entries = meal.get('entries');
  entries.push(diaryEntry);
  console.log(entries);
  meal.set('entries', entries);
  return meal.save();
}

export function addToPastRecipes(recipe) {
  let user = Parse.User.current();
  let relation = user.relation('pastRecipes');
  relation.add(recipe);
  return user.save().then((user) => {
    console.log(user);
  });
}

export function addToDiary(recipe, servingsMultiplier, forDate, diaryMeal) {
  let user = Parse.User.current();
  let DiaryEntry = Parse.Object.extend('DiaryEntry');
  let entry = new DiaryEntry();
  let ParseRecipe = Parse.Object.extend('Recipe');
  let r = new ParseRecipe();
  r.set('objectId', recipe.objectId);
  entry.set('user', user);
  entry.set('recipe', r);
  entry.set('date', forDate);
  entry.set('servingsMultiplier', servingsMultiplier);
  console.log(servingsMultiplier);
  return entry.save().then((entry) => {
    // Execute any logic that should take place after the object is saved.
    return getUserMeal(diaryMeal, forDate).then((meal) => {
      if (meal === undefined) {
        return createUserMeal(diaryMeal, entry, forDate)
      } else {
        return addToUserMeal(meal, entry);
      }
    }).then((userMeal) => {
      return addToPastRecipes(r);
    });
  });
}
export function currentUser() {
  return Parse.User.current();
}
export function logOut() {
  return Parse.User.logOut();
}

export function recentRecipes() {
  let user = currentUser();

  return user.get('pastRecipes').query().find().then((recipes) => {
    return recipes.map((rec) => {
      return rec.toJSON();
    });

  }).then((recipes) => {
    return _.sortBy(recipes, 'name');
  });

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
    query.exists('dartmouthId');
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
