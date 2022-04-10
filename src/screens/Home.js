import React, {Component} from 'react';
import {
BackHandler,
  StyleSheet,
  Dimensions,
  View,
  Text,
  Alert,
} from 'react-native';


import { Body, Content, Container, Header, Left, Right, Title } from "native-base";
import { Button} from "react-native-elements";
import store from "../../state/store";

let { width, height } = Dimensions.get('window');

export default class Home extends Component {
	constructor(inProps) {

		super(inProps);

	} /* End constructor. */
	
	render(){
		
		return (
			<Container>						
				<Header>
					<Left/>
					<Body>
						<Title>
							STEVEKINS
						</Title>
					</Body>
					<Right/>
				</Header>
				<Content>
					<View style={styles.container}>
						<Button buttonStyle={styles.btn}  title="Scan" onPress={() => this.props.navigation.navigate('Scan')}/>
						<Button buttonStyle={[styles.btn, styles.spaceTop]} title="Report" onPress={() => this.props.navigation.navigate('Report')}/>
					</View>
				</Content>
			</Container>
		);
	}
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
	alignItems: 'center',
	marginTop: height / 3
  },
  btn: {
    width: width / 2
  },
  spaceTop: {
	  marginTop: height / 25
  }
});

