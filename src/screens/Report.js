/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
	Alert,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Body, Content, Container, Header, Left, Right, Title, Text, Button, List, ListItem } from "native-base";
import DatePicker from 'react-native-datepicker';
import { auth, db } from '../config';
import { Overlay } from "react-native-elements";
let { width, height } = Dimensions.get('window');

export default class Report extends Component {
	constructor(props){
		super(props)
		//set value in state for initial date
		let today = new Date();
		this.state = {
			date: today,
			itemsArrState: [],
			itemsArrStateLen: 0,
			ready: false,
			isVisible: false,
			anySales: true,
			userId: ''
		}
	}

	componentDidMount() {
		let today = new Date();		
		this.dateChange(today);

		auth.onAuthStateChanged(user => {
			if(user){
				this.setState({ userId: user.uid });
			}

		});
  	};

	dateChange = async (date) => {
		date = new Date(date);
		var dd = date.getDate();
		if(dd < 10) {
			dd = '0'+dd
		}
		var mm = date.getMonth()+1; 
		if(mm < 10) {
			mm = '0'+mm
		}
		var yyyy = date.getFullYear();
		date = yyyy+'/'+mm+'/'+dd;

		this.setState({ isVisible: true });
		this.setState({ready: false})
		this.state.itemsArrState = [];
		this.setState({date: date})
		
		let startT = this.toTimeStamp(date+' 00:00:00');
		let endT = this.toTimeStamp(date+' 23:59:59');
		itemsArr = [];
		
		await db.ref('/Sales/').orderByChild('saleDate').startAt(startT).endAt(endT).on('value', (snapshot) => {
			console.log(snapshot.val());
			if(snapshot.val() != null){
				const val = Object.values(snapshot.val());
				const key = Object.keys(snapshot.val());
				let ln = val.length, y;
				
				for(y = 0; y < ln; y++){
					let userId = val[y].who;
					//console.log(this.state.userId, userId)
					if(this.state.userId == userId){
						
						let itemId = val[y].item;					
						let qty = val[y].qty;
						let saleDate = val[y].saleDate;
						let id = key[y];
						let cancelled;
	
						if(val[y].cancelled == undefined){
							cancelled = false;
						} else {
							cancelled = true;
						}
						//let cancelled = data.cancelled
	
						db.ref('/items/'+itemId).once('value').then((itemSnapchat) => {
							let itemObj = {};
	
							itemObj.id = id;
							itemObj.qty = qty;
							itemObj.saleDate = saleDate;
							itemObj.cancelled = cancelled;
							
							//item details
							let prdtId = itemSnapchat.val().Productid;
	
							db.ref('/products/'+prdtId).once('value').then((prdtSnapchat) => {
								
								let prdtName = prdtSnapchat.val().Name;
								let qtyPerCarton = prdtSnapchat.val().qtyPerCarton;
								itemObj.prdtName = prdtName;
								itemObj.qtyPerCarton = qtyPerCarton;
	
								this.setState({ready: true})
	
							});
							
							this.state.itemsArrState.push(itemObj);	
							this.setState({itemsArrStateLen: ln});					
						});
	
						if(y == (ln - 1)){
							this.setState({ready: true});
							this.setState({ isVisible: false });
						}
					} 
					
				}
			} else {
				setTimeout(() => {
					this.setState({ready: true});
					this.setState({ isVisible: false });
				}, 7000)
			}	
		});
		
	}	

	toTimeStamp = (strDate) => {
		return new Date(strDate).getTime();
	}

	cancelSale = async (id) => {
		var cSale = await db.ref('Sales/' + id);
		cSale.update ({
			cancelled: 'Yes'
		}).then((data) => {
			this.props.navigation.navigate('Home');
		}).catch((err) => {
			console.log('err');
		});
	}
	
	confrimCancelSale = (id) => {
		Alert.alert(
			'Sales Cancel Request',
			'This request will be sent to the manager for confirmation. Continue?',
			[
			{text: 'CANCEL', style: 'cancel', onPress: () => this.props.navigation.navigate('Home')},
			{text: 'OK', onPress: () => this.cancelSale(id)}
			]
		);
	}
	render(){
		let segCompo;
		
		if(this.state.ready == true){
			
			let saleItem = this.state.itemsArrState, len = this.state.itemsArrStateLen;
			const itemSaleArr = [];
			
			if(len > 0){
				saleItem.forEach((item) => {
					const { id, prdtName, qty, saleDate, qtyPerCarton, cancelled } = item;
					
					itemSaleArr.push({
						id,
						prdtName,
						qty,
						saleDate, 
						qtyPerCarton,
						cancelled
					});
				});

				segCompo = <FlatList
						style={styles.noPadding}
						numColumns={1}
						data={itemSaleArr}
						renderItem={({ item }) => (
							
								<ListItem thumbnail>
									<Left style={styles.leftWidth}>
										<Text>{item.prdtName}</Text>
									</Left>
									<Body>
										<Text>{item.qty == item.qtyPerCarton ? 'Full carton' : item.qty+' Pieces'}</Text>
									</Body>
									<Right>
										{item.cancelled == true ? <Button transparent><Text style={styles.blueTxt}>Cancelling...</Text></Button> : <Button transparent onPress={() => this.confrimCancelSale(item.id)}><Text style={styles.redTxt}>Cancel Sale</Text></Button>}
										
									</Right>
								</ListItem>
						)}
						keyExtractor={item => item.id}
						/>	;
			} else {
				segCompo = <ListItem thumbnail>
								<Left/>
								<Body>
									<Text>No sales Record for this date</Text>
								</Body>
								<Right/>
							</ListItem>
			}
			

			
		} 
		
		return (
			<Container>						
				<Header>
					<Body>
						<Title>
                            Transaction Report
						</Title>
					</Body>
				</Header>
				<Content>
					<List>
                        <ListItem itemDivider>
							<DatePicker
								style={{width: width * 0.5}}
								date={this.state.date} //initial date from state
								mode="date" //The enum of date, datetime and time
								placeholder="select date"
								format="YYYY-MM-DD"
								confirmBtnText="Confirm"
								cancelBtnText="Cancel"
								customStyles={{
								dateIcon: {
									position: 'absolute',
									left: 0,
									top: 4,
									marginLeft: 0
								},
								dateInput: {
									marginLeft: 36
								}
								}}
								onDateChange={(date) => this.dateChange(date)}
							/>
                        </ListItem>  

						{segCompo}						
					</List>
				</Content>
				<Overlay isVisible={this.state.isVisible} overlayStyle={styles.loader}>
                    <ActivityIndicator size="large" />
                </Overlay>
			</Container>
			
		)
	}
}

const styles = StyleSheet.create({
	
	blueTxt: {
		color: 'blue'
	},
	redtext: {
		color: 'red'
	},
	noPadding : {
		backgroundColor: '#E5F6FC',
	},
	whiteTxt: {
		color: 'white'
	},
	leftWidth: {
		width: '30%'
	},
	loader: {
        height: height / 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
