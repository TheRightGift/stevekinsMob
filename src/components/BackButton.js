import {BackHandler, Alert} from 'react-native';
/**
 * Attaches an event listener that handles the android-only hardware
 * back button
 * @param  {Function} callback The function to call on click
 */
const handleAndroidBackButton = callback => {
    if(this.props.navigation.state.routeName == 'Home'){
        BackHandler.addEventListener('hardwareBackPress', () => {
            Alert.alert(
                'Confirm exit',
                'Do you want to quit the app?',
                [
                {text: 'CANCEL', style: 'cancel'},
                {text: 'OK', onPress: () => BackHandler.exitApp()}
                ]
            );
            return true;
        });
    } else {
        BackHandler.addEventListener('hardwareBackPress', () => {
            //navigate to Home.js
            this.props.navigation.navigate('Home');
            return true;
        });
    }
};
/**
 * Removes the event listener in order not to add a new one
 * every time the view component re-mounts
 */
const removeAndroidBackButtonHandler = () => {
  BackHandler.removeEventListener('hardwareBackPress', () => {});
}
export {handleAndroidBackButton, removeAndroidBackButtonHandler};