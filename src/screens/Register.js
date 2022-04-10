import React, {Component} from "react";
import {StyleSheet, ScrollView, Dimensions, Alert, Text, ActivityIndicator } from "react-native";
//import AnimatedLoader from "react-native-animated-loader";
import { Body, Content, Container, Header, Left, Right, Title,  } from "native-base";
import { Card, Button, Input, Overlay } from "react-native-elements";
import PasswordInputText from 'react-native-hide-show-password-input';
import { db, auth } from '../config';

let { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
	header: {
		backgroundColor: '#900C3F',
    },
    loader: {
        height: height / 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
	container: {
	  flex: 1,
	  justifyContent: 'center',
	  alignItems: 'center',
	  backgroundColor: '#F5FCFF',
	},
	welcome: {
	  fontSize: 20,
	  textAlign: 'center',
	  margin: 10,
	},
	instructions: {
		textAlign: 'center',
		color: '#333333',
		height: height / 4,
	  },
	  imgBack: {   
		  width: width - 200,
		  height: height / 4,
		  marginTop: height / 4,
		  alignItems: 'center',
		  resizeMode: 'contain'
	  },
	lottie: {
		width: 100,
		height: 100
	},
	pass: {
		width: '70%'
	}
  });

export default class Register extends Component {
	static navigationOptions =  {
		title: 'Register',
	};

	/**
	 * Constructor.
	 */
	constructor(inProps) {

		super(inProps);

		this.state = {
			fName: '',
			lName: '',
			oName: '',
			uName: '',
			phone: '',
            email: '',
            post: '',
			pass: '',
			cPass:'',
			isVisible: false
		};
	} /* End constructor. */

	onChangeText  = (key, val) => {
		this.setState({ [key]: val })
	}

	handlePass = (text) => {
		this.setState({ pass: text })
	}

   	onSubmit = (e) => {
        this.setState({ isVisible: true });

		let fName = this.state.fName.trim();
        let oName = this.state.oName.trim();
        let lName = this.state.lName.trim();
        let uName = this.state.uName.trim();
        let phone = this.state.phone.trim();
        let email = this.state.email.trim();
        let post = this.state.post.trim();
        let pass = this.state.pass.trim();
        let cPass = this.state.cPass.trim();

		var err = 0;
		if(fName == '' ||lName == '' || uName == '' || phone == '' || email == '' || post == '' || pass == '' || cPass == '') {
			err = 1;
		} else if( pass != cPass ) {
			err = 2;
		}

		if(err == 1){
            Alert.alert(
                'Login',
                'All fields except "othername" are required!',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    }
                ],
                {cancelable: false}
            )
		} else if(err == 2){
            Alert.alert(
                'Login',
                'Passwords must match!',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    }
                ],
                {cancelable: false}
            )
		} else {
            
            auth.createUserWithEmailAndPassword(email, pass).then(function(userData){
                var userId = userData.user.uid;
    
                //Here if you want you can sign in the user
                let con = db.ref('users/' + userId);
    
                con.set({
                    firstname: fName,
                    othername: oName,
                    lastname: lName,
                    phone: phone,
                    email: email,
                    post: post,
                    username: uName,
                    password: pass
                }).then((data) => {
                    this.setState({ isVisible: false });
                }).catch((err) => {
                    //Handle error
                    console.log(err)
                });
            }).catch(function(error) {
                //Handle error
                console.log(error)
            });
		}		
	}

	componentDidMount() {
		
	}

	render() {
        return (
            <Container>						
                <Header hasSegment style={styles.header}>
                    <Left/>
                    <Body>
                        <Title>
                            STEVEKINS Register
                        </Title>
                    </Body>
                    <Right/>
                </Header>
                <Content padder>
                    <ScrollView>
                        <Card style={styles.card}>
                            <Input placeholder='Firstname' name="fName" onChangeText={val => this.onChangeText('fName', val)}/>
                            <Input placeholder="Othername" name="oName" onChangeText={val => this.onChangeText('oName', val)} />
                            <Input placeholder="Lastname" name="lName" onChangeText={val => this.onChangeText('lName', val)} />
                            <Input placeholder="Phone Number" name="phone" onChangeText={val => this.onChangeText('phone', val)} />
                            <Input placeholder="Email" name="email" onChangeText={val => this.onChangeText('email', val)} />
                            <Input placeholder="Post" name="post" onChangeText={val => this.onChangeText('post', val)} />
                            <Input placeholder="Username" name="uName" onChangeText={val => this.onChangeText('uName', val)} />
                            <PasswordInputText containerStyle={{paddingLeft: 20, paddingRight: 20}} placeholder="Password" name="pass" onChangeText={val => this.onChangeText('pass', val)} />
                            <PasswordInputText label="Confirm Password" containerStyle={{paddingLeft: 20, paddingRight: 20}} placeholder="Confirm Password" name="cPass" onChangeText={val => this.onChangeText('cPass', val)} />
                            <Button buttonStyle={{ marginTop: 20 }} backgroundColor="#03A9F4" title="SIGN UP" onPress={() => { this.onSubmit();}} />
								
							<Button buttonStyle={{ marginTop: 20 }} type="clear" title="Login" onPress={() => this.props.navigation.navigate('Login')}/>
                        </Card>
                    </ScrollView>
                </Content>
                <Overlay isVisible={this.state.isVisible} overlayStyle={styles.loader}>
                    <ActivityIndicator size="large" />
                </Overlay>
            </Container>            
        )		
	}
}

  
  // Export components.
   Register;