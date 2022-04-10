import React, { Component } from 'react';
import { View, Text, StyleSheet,Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Body, Content, Container, Header, Left, Right, Title } from "native-base";
import { Overlay } from "react-native-elements";
let { width, height } = Dimensions.get('window');
import QRCodeScanner from 'react-native-qrcode-scanner';
import { db, auth, serverTime } from '../config';
import store from "../../state/store";

export default class Scan extends Component {
	constructor(props){
		super(props);
		const st = store.getState();

		this.state = {
			isVisible: false,
			userId: st.user.userData[0].userId,
            userPost: st.user.userData[0].post
		};
	}
	
	onSuccess = async (e) => {
		this.setState({ isVisible: true });
		moveToDetailScreen = (prdtName, prdtPrice, itemModelNum, location, date, itemId, qty, prdtQtyPerCarton, wHouse, locationId) => {
			if(!wHouse){
				wHouse = "";
			}
			
			if(!locationId){
				locationId = "";
			}
			this.setState({ isVisible: false });
			this.props.navigation.navigate('Details', {prdtName : prdtName, prdtPrice: prdtPrice, itemModelNum: itemModelNum, location: location, date: date, itemId: itemId, qty: qty, prdtQtyPerCarton: prdtQtyPerCarton, wHouse: wHouse, locationId: locationId});
		}

		moveToHomeScreen = () => {
			this.props.navigation.navigate('Home')
		}

		let pdrt = e.data; 
		let findStartOfItemId = pdrt.indexOf("(");
		let findEndOfItemId = pdrt.indexOf(")");
		let prdtId = pdrt.slice(0, findStartOfItemId);
		let itemId = pdrt.slice(findStartOfItemId + 1, findEndOfItemId);
		
		prdtSnapshot = await db.ref('/products/'+prdtId).once('value');
		let prdtName = prdtSnapshot.val().Name;
		let prdtPrice = prdtSnapshot.val().Price;
		let prdtQtyPerCarton = prdtSnapshot.val().qtyPerCarton;
		let wHouse = prdtSnapshot.val().Warehouse;

		//TODO: 
		//add structured and unstructured option in each product info
		//if unstructured store and select from unstructuredItem TB
		if(wHouse != '-LmJoybkOTi44giJA-01') {//!Ofili warehouse 
			itemSnapshot = await db.ref('/items/'+itemId).once('value');
			let itemModelNum = prdtSnapshot.val().Model+'-'+itemSnapshot.val().ModelSeries;
			let qty = itemSnapshot.val().qty;
			let soldOut = itemSnapshot.val().soldOut;
			
			itemLocationSnapshot = await db.ref('/items/'+itemId+'/Location').orderByKey().limitToLast(1).once('value');
			itemLocationSnapshot.forEach(function(itemLocationSnapshot){
				let location = itemLocationSnapshot.val().location;
				let date = itemLocationSnapshot.val().date;
				
				date = new Date(date).toGMTString();

				const st = store.getState();
				//if Warehouse Admin
				let userPost = st.user.userData[0].post;
				
				if(userPost == 'Warehouse Admin'){
					//if this prdt in a warehou
					if(location != 'HeadBridge' && location != 'PortHarcourt Rd'){
						
						//move to detail screen
						moveToDetailScreen(prdtName, prdtPrice, itemModelNum, location, date, itemId, qty, prdtQtyPerCarton);
					} else {//else
						//this prdt is not supposed to be in + location
						Alert.alert(
							'Transaction Status',
							'This carton of '+prdtName+' is NOT supposed to be here. Please contact admin',
							[
								{text: 'CANCEL', style: 'cancel', onPress: () => moveToHomeScreen()},
								{text: 'OK', onPress: () => moveToHomeScreen()}
							]
						);
					}
				} else if(userPost == 'Salesperson'){//if salesperson
					console.log(userPost, location);
					//if this prdt in a store
					if(location == 'HeadBridge' || location == 'PortHarcourt Rd'){
						if(soldOut == 'Yes'){				
							Alert.alert(
								'Transaction Status',
								'This carton of '+prdtName+' is recorded as SOLD OUT. If not pls contact manager',
								[
									{text: 'CANCEL', style: 'cancel', onPress: () => moveToHomeScreen()},
									{text: 'OK', onPress: () => moveToHomeScreen()}
								]
							);
						} else {
							//move to detail screen
							moveToDetailScreen(prdtName, prdtPrice, itemModelNum, location, date, itemId, qty, prdtQtyPerCarton);
						}
					} else {//else
						//this prdt is not supposed to be in + location
						Alert.alert(
							'Transaction Status',
							'This carton of '+prdtName+' is NOT supposed to be here. Please contact admin',
							[
								{text: 'CANCEL', style: 'cancel', onPress: () => moveToHomeScreen()},
								{text: 'OK', onPress: () => moveToHomeScreen()}
							]
						);
					}
				} else if(userPost == 'Manager'){//if manager
					if(soldOut == 'Yes'){				
						Alert.alert(
							'Transaction Status',
							'This carton of '+prdtName+' is located at '+location+' and recorded as SOLD OUT. If not pls contact manager',
							[
								{text: 'CANCEL', style: 'cancel', onPress: () => moveToHomeScreen()},
								{text: 'OK', onPress: () => moveToHomeScreen()}
							]
						);
					} else {
						//move to detail screen
						moveToDetailScreen(prdtName, prdtPrice, itemModelNum, location, date, itemId, qty, prdtQtyPerCarton);
					}
				}
			});	
		} else {//if Ofili Ware house
			//select from unstructureItem
			itemSnapshot = await db.ref('/unstructuredItems/'+itemId).once('value');
			let itemModelNum = prdtSnapshot.val().Model+'-'+itemSnapshot.val().ModelSeries;
			let qty = itemSnapshot.val().qty;
			let qty4Account = itemSnapshot.val().qty4Account;
			let soldOut = itemSnapshot.val().soldOut;

			//if Warehouse Admin
			if(this.state.userPost == 'Warehouse Admin'){
				if(qty4Account != 0 && soldOut != 'Yes'){//if qty4Account is != 0 && soldOut != 'Yes'
					//get first location record
					itemLocationSnapshot = await db.ref('/unstructuredItems/'+itemId+'/Location').orderByKey().limitToFirst(1).once('value');
					itemLocationSnapshot.forEach(function(itemLocationSnapshot){
						let location = itemLocationSnapshot.val().location;
						let date = itemLocationSnapshot.val().date;						
						date = new Date(date).toGMTString();						
						qty = qty4Account;
						moveToDetailScreen(prdtName, prdtPrice, itemModelNum, location, date, itemId, qty, prdtQtyPerCarton, wHouse);		
					});
					
				} else {//else
					Alert.alert(
						'Transaction Status',
						'The quantity of '+prdtName+' in warehouse is finished. Please contact manager',
						[
							{text: 'CANCEL', style: 'cancel', onPress: () => moveToHomeScreen()},
							{text: 'OK', onPress: () => moveToHomeScreen()}
						]
					);
				}
			} else if(this.state.userPost == 'Salesperson'){//if Saleperson
				//get last location record
				itemLocationSnapshot = await db.ref('/unstructuredItems/'+itemId+'/Location').orderByKey().limitToLast(1).once('value');
				itemLocationSnapshot.forEach(function(itemLocationSnapshot){
					let locationId = itemLocationSnapshot.key;
					let location = itemLocationSnapshot.val().location;
					let date = itemLocationSnapshot.val().date;				
					date = new Date(date).toGMTString();
					soldOut1 = itemLocationSnapshot.val().soldOut;
					quantity = itemLocationSnapshot.val().quantity;
					//is soldOut
					if(soldOut1 == 'Yes' || quantity == 0){				
						Alert.alert(
							'Transaction Status',
							'The quantity of '+prdtName+' in shop is recorded as SOLD OUT. Please contact manager',
							[
								{text: 'CANCEL', style: 'cancel', onPress: () => moveToHomeScreen()},
								{text: 'OK', onPress: () => moveToHomeScreen()}
							]
						);
					} else {//if not soldout
						//move to detail screen
						qty = quantity;
						moveToDetailScreen(prdtName, prdtPrice, itemModelNum, location, date, itemId, qty, prdtQtyPerCarton, wHouse, locationId);
					}			
				});
			}
		}		
	}   

	componentDidMount() {
		//Orientation.lockToPortrait();
  	}; /* End componentDidMount(). */
	
    render() {
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
						<QRCodeScanner
							onRead={this.onSuccess}
							showMarker={true}						
						/>
					</View>
				</Content>
				<Overlay isVisible={this.state.isVisible} overlayStyle={styles.loader}>
                    <ActivityIndicator size="large" />
                </Overlay>
			</Container>
			
		);
    }
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F5FCFF'
	},
	centerText: {
	  flex: 1,
	  fontSize: 18,
	  padding: 32,
	  color: '#777',
	},
	textBold: {
	  fontWeight: '500',
	  color: '#000',
	},
	buttonText: {
	  fontSize: 21,
	  color: 'rgb(0,122,255)',
	},
	buttonTouchable: {
	  padding: 16,
	},
	loader: {
        height: height / 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
