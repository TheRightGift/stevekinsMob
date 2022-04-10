import React, {Component} from "react";
import { StyleSheet, Alert, Dimensions, ActivityIndicator } from "react-native";
import { Body, Content, Container, Header, Left, Right, Title } from "native-base";
import { Card, Button, Input, Overlay } from "react-native-elements";
import PasswordInputText from 'react-native-hide-show-password-input';
import Orientation from "react-native-orientation";
import { db, auth } from '../config';

let { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    loader: {
        height: height / 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
	header: {
		backgroundColor: '#900C3F',
	},
	container: {
	  flex: 1,
	  flexDirection: "column",
	  justifyContent: 'center',
	  alignItems: 'center',
	},
	welcome: {
	  fontSize: 20,
	  textAlign: 'center',
	  margin: 10,
	  color: '#333333',
	},
	instructions: {
	  textAlign: 'center',
	  color: '#333333',
	  height: height / 4,
	},
	imgBack: {   
		width: width - 200,
		height: height / 4,
		alignItems: 'center',
		marginTop: height / 4,
		resizeMode: 'contain'
	}
  });

  export default class Login extends Component {
	/**
	 * Constructor.
	 */
	constructor(inProps) {

		super(inProps);
		this.state = {
			email: '',
			pass: '',
			isVisible: false
		};
		this.loginErr = this.loginErr.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
	} /* End constructor. */

	onChangeText  = (key, val) => {
		this.setState({ [key]: val })
	}

	onSubmit = (e) => {
        this.setState({ isVisible: true });

        let email = this.state.email.trim();
        let pass = this.state.pass.trim();
        var err = 0;
        
		if(email == '' || pass == '') {
			err = 1;
		} 

		if(err == 1){
			this.loginErr();	
		}  else {
			
			auth.signInWithEmailAndPassword(email, pass).then((user) => {
                this.setState({ isVisible: false });
            }).catch((error) => {
				// Handle Errors here.				
                this.loginErr();				
            });
		}		
	}

	loginErr = () => {
		this.setState({ isVisible: false });
		Alert.alert(
			'Login',
			'Invalid Username/Password!',
			[
				{
					text: 'Cancel',
					style: 'cancel'
				}
			],
			{cancelable: false}
		)
	}
	
	componentDidMount() {
		Orientation.lockToPortrait();
		
  	}; /* End componentDidMount(). */

	render() {
        		
		return (
            <Container>						
                <Header hasSegment>
                    <Left/>
                    <Body>
                        <Title>
                            STEVEKINS Login
                        </Title>
                    </Body>
                    <Right/>
                </Header>
                <Content padder>
                    <Card>
                        <Input placeholder="Email..." name="email" onChangeText={val => this.onChangeText('email', val)} />
                        
                        <PasswordInputText containerStyle={{paddingLeft: 20, paddingRight: 20}} placeholder="Password..." name="pass" onChangeText={val => this.onChangeText('pass', val)} />

                        <Button buttonStyle={{ marginTop: 20 }} backgroundColor="#03A9F4" title="Login" onPress={() => { this.onSubmit();}}/>
                    </Card>
                </Content>
                <Overlay isVisible={this.state.isVisible} overlayStyle={styles.loader}>
                    <ActivityIndicator size="large"/>
                </Overlay>
            </Container>
        )
	}
}  