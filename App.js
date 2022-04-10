/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Loading from './src/screens/Loading';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import Home from './src/screens/Home';
import Scan from './src/screens/Scan';
import Details from './src/screens/Details';
import Report from './src/screens/Report';
import Database from './src/database';
const db = new Database();

const AppStack = createStackNavigator({ 
	Home: { screen: Home},
	Scan: { screen: Scan},
	Details: { screen: Details},
	Report: { screen: Report} 
},
{
	headerMode: 'none',
	navigationOptions: {
		headerVisible: false,
	}
});
const AuthStack = createStackNavigator({ 
	Login: { screen: Login },
	Register: { screen: Register }	 
},
{
	headerMode: 'none',
	navigationOptions: {
		headerVisible: false,
	}
});
// create our app's navigation stack
const App = createAppContainer(createSwitchNavigator(
	{
	  Loading,
	  AppStack,
	  AuthStack
	},
	{
	  initialRouteName: 'Loading',
	}
));
  export default App
