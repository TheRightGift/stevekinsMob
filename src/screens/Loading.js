import React from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { auth, db } from '../config';
import { getUserData } from "../../state/actions";
import store from "../../state/store";
import SplashScreen from 'react-native-splash-screen'

export default class Loading extends React.Component {
	
	componentWillMount() {
		uData = []
		auth.onAuthStateChanged(user => {
			if(user){
				
				let userId = user.uid;
				
				getUser = async (userId) => {
					//console.log(userId)
					userSnapshot = await db.ref('/users/'+userId).once('value');
					let user = userSnapshot.val();
					const { email, firstname, lastname, othername, username, password, post, phone  } = user;
					uData.push({
						userId,
						email, 
						firstname, 
						lastname, 
						othername, 
						username, 
						password, 
						post, 
						phone
					});
					store.dispatch(getUserData(uData));
					this.props.navigation.navigate('Home')
				}      
				getUser(userId);
			} else {
				//this.props.navigation.navigate('Register')
				this.props.navigation.navigate('Login');
			}		
		});

	}
	componentDidMount() {
    	// do stuff while splash screen is shown
        // After having done stuff (such as async tasks) hide the splash screen
        SplashScreen.hide();
    }

	render() {
		
		return (
		<View style={styles.container}>
			<Text>Loading</Text>
			<ActivityIndicator size="large" />
		</View>
		)
	}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
