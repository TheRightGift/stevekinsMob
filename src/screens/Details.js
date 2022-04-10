import React, {Component} from 'react';
import {
  StyleSheet,
  Dimensions,
  BackHandler,
  Text,
  Alert,
} from 'react-native';

import { Body, Content, Container, Header, Left, Right, Title, Card, CardItem, Picker, View } from "native-base";
import { Button, CheckBox, Input } from "react-native-elements";
let { width, height } = Dimensions.get('window');
import { db, auth, serverTime } from '../config';
import store from "../../state/store";

const Item = Picker.Item;

export default class Details extends Component {
	constructor(props) {

        super(props);
        const st = store.getState();
        
        this.state = {
            selected: "key0",
            shop: 'key0',
            checked: false,
            TextInputDisableHolder: true,
            itemId: this.props.navigation.state.params.itemId,
            location: this.props.navigation.state.params.location,
            qty: 0,
            ofiliQty: 0,
            userId: st.user.userData[0].userId,
            userPost: st.user.userData[0].post
        };

    } /* End constructor. */
    
    onChangeText  = (key, val) => {
        
        if(parseInt(val) > parseInt(this.props.navigation.state.params.qty)) {
            Alert.alert(
                'Transaction Status',
                'The Maximum quantity you can sell from this carton is '+this.props.navigation.state.params.qty,
                [
                    {text: 'CANCEL', style: 'cancel'},
                    {text: 'OK'}
                ]
            );
        } else {
            this.setState({ [key]: val })
        }		
    }
    
    onValueChange(value) {        
        this.setState({
          selected: value
        });
    }

    onShopChange(value) {        
        this.setState({
            shop: value
        });
    }

    onWholesaleChange(value) {
        this.setState({
            checked: !this.state.checked,
            TextInputDisableHolder: !this.state.TextInputDisableHolder,
            qty: 0,
        });
    }

    completeSale = async () => {
        let wSale = this.state.checked;
        let stockQty = this.props.navigation.state.params.qty;
        let qty = this.state.qty;
        let prdt = this.props.navigation.state.params.prdtName;
        let itemId = this.state.itemId;
        let prdtQtyPerCarton = this.props.navigation.state.params.prdtQtyPerCarton;
        
        if(wSale){//sell carton
            //check if qty remaining is upto 1 carton
            if(stockQty != prdtQtyPerCarton){//qty not upto full carton
                Alert.alert(
                    'Transaction Status',
                    'Cannot sell this carton as the quantity remaining is not enough to constitute a full carton',
                    [
                        {text: 'CANCEL', style: 'cancel'},
                        {text: 'OK'}
                    ]
                );
            } else {//full carton
                //itemSnapshot = await db.ref('/items/'+itemId+'/Sales').push({
                itemSnapshot = await db.ref('/Sales/').push({
                    item: itemId,
                    saleDate: serverTime,
                    qty: prdtQtyPerCarton,
                    who: this.state.userId
                }).then(() => {
                    updateWsale = async () => {
                        updateItemSnapshot = await db.ref('/items/'+itemId).update({
                            qty: 0,
                            soldOut: 'Yes',
                        }).then(() => {
                            Alert.alert(
                                'Transaction Status',
                                'Successfully sold a Carton of '+prdt,
                                [
                                    {text: 'CANCEL', style: 'cancel', onPress: () => this.props.navigation.navigate('Home')},
                                    {text: 'OK', onPress: () => this.props.navigation.navigate('Home')}
                                ]
                            );
                        }).catch((error) => {
                            Alert.alert(
                                'Transaction Status',
                                'Error! Try Again',
                                [
                                    {text: 'CANCEL', style: 'cancel'},
                                    {text: 'OK'}
                                ]
                            );
                        });
                    }
                    updateWsale();
                }).catch((error) => {
                    Alert.alert(
                        'Transaction Status',
                        'Error! Try Again',
                        [
                        {text: 'CANCEL', style: 'cancel'},
                        {text: 'OK'}
                        ]
                    );
                });                
            }            
        } else if(qty != 0){
            let sOut = '';
            let fdbk = '';
            let remainingQty = stockQty - qty;

            if(qty == stockQty) {
                if(this.props.navigation.state.params.location != 'Ofili Warehouse'){
                    sOut = 'Yes';
                    fdbk = 'Successfully sold out a Carton of '+prdt;
                } else {
                    sOut = 'Yes';
                    fdbk = 'Successfully sold out '+prdt+' in this shop.';
                }
            } else {
                sOut = 'No';
                fdbk = 'Successfully sold '+qty+' pieces of '+prdt
            }

            itemSnapshot = await db.ref('/Sales/').push({
                    item: itemId,
                    saleDate: serverTime,
                    qty: qty,
                    who: this.state.userId
            }).then(() => {
                updateRetailSale = async () => {
                    if(this.props.navigation.state.params.wHouse != '-LmJoybkOTi44giJA-01'){
                        updateItemSnapshot = await db.ref('/items/'+itemId).update({
                            qty: remainingQty,
                            soldOut: sOut,
                        }).then(() => {
                            Alert.alert(
                                'Transaction Status',
                                fdbk,
                                [
                                {text: 'CANCEL', style: 'cancel', onPress: () => this.props.navigation.navigate('Home')},
                                {text: 'OK', onPress: () => this.props.navigation.navigate('Home')}
                                ]
                            );
                        }).catch((error) => {
                            Alert.alert(
                                'Transaction Status',
                                'Error! Try Again',
                                [
                                {text: 'CANCEL', style: 'cancel'},
                                {text: 'OK'}
                                ]
                            );
                        });
                    } else {
                        let locationId = this.props.navigation.state.params.locationId;
                        updateItemSnapshot = await db.ref('/unstructuredItems/'+itemId+'/Location/'+locationId).update({
                            quantity: remainingQty,
                            soldOut: sOut,
                        }).then(() => {
                            Alert.alert(
                                'Transaction Status',
                                fdbk,
                                [
                                    {text: 'CANCEL', style: 'cancel', onPress: () => this.props.navigation.navigate('Home')},
                                    {text: 'OK', onPress: () => this.props.navigation.navigate('Home')}
                                ]
                            );
                        }).catch((error) => {
                            Alert.alert(
                                'Transaction Status',
                                'Error! Try Again',
                                [
                                {text: 'CANCEL', style: 'cancel'},
                                {text: 'OK'}
                                ]
                            );
                        });
                    }
                }
                
                updateRetailSale();
            }).catch((error) => {
                Alert.alert(
                    'Transaction Status',
                    'Error! Try Again',
                    [
                    {text: 'CANCEL', style: 'cancel'},
                    {text: 'OK'}
                    ]
                );
            });              
        }
    }

    moveToWarehouse = async () => {
        
        if(this.props.navigation.state.params.location != 'Ofili Warehouse'){
            if(this.state.shop != 'key0'){
                let itemId = this.state.itemId;
                let shop = this.state.shop;
                
                itemSnapshot = await db.ref('/items/'+itemId+'/Location').push({
                    date: serverTime,
                    location: shop,
                    who: this.state.userId
                }).then(() => {
                    Alert.alert(
                        'Transaction Status',
                        'success',
                        [
                            {text: 'CANCEL', style: 'cancel', onPress: () => this.props.navigation.navigate('Home')},
                            {text: 'OK', onPress: () => this.props.navigation.navigate('Home')}
                        ]
                    );
                }).catch((error) => {
                    Alert.alert(
                        'Transaction Status',
                        'Error! Try Again',
                        [
                            {text: 'CANCEL', style: 'cancel'},
                            {text: 'OK'}
                        ]
                    );
                });
            }
        } else {
            
            if(this.state.shop != 'key0' && this.state.ofiliQty != 0 && this.state.ofiliQty <= parseInt(this.props.navigation.state.params.qty)) {
                let itemId = this.state.itemId;
                let shop = this.state.shop;
                let ofiliQty = parseInt(this.state.ofiliQty);      
                let qty = this.props.navigation.state.params.qty;  
                let qtyBal = qty - ofiliQty;

                //update this items qty4Account
                if(qtyBal == 0){
                    await db.ref('/unstructuredItems/'+itemId).update({
                        qty4Account: 0,
                        soldOut: 'Yes',
                    }).then(() => {
                        itemSnapshot = db.ref('/unstructuredItems/'+itemId+'/Location').push({
                            date: serverTime,
                            location: shop,
                            quantity: ofiliQty,
                            who: this.state.userId,
                            soldOut: 'No'
                        }).then(() => {
                            Alert.alert(
                                'Transaction Status',
                                'success',
                                [
                                    {text: 'CANCEL', style: 'cancel', onPress: () => this.props.navigation.navigate('Home')},
                                    {text: 'OK', onPress: () => this.props.navigation.navigate('Home')}
                                ]
                            );
                        }).catch((error) => {
                            Alert.alert(
                                'Transaction Status',
                                'Error! Try Again',
                                [
                                    {text: 'CANCEL', style: 'cancel'},
                                    {text: 'OK'}
                                ]
                            );
                        });
                    }).catch((error) => {
                        Alert.alert(
                            'Transaction Status',
                            'Error! Try Again',
                            [
                                {text: 'CANCEL', style: 'cancel'},
                                {text: 'OK'}
                            ]
                        );
                    });
                } else {
                    await db.ref('/unstructuredItems/'+itemId).update({
                        qty4Account: qtyBal,
                    }).then(() => {
                        itemSnapshot = db.ref('/unstructuredItems/'+itemId+'/Location').push({
                            date: serverTime,
                            location: shop,
                            quantity: ofiliQty,
                            who: this.state.userId,
                            soldOut: 'No'
                        }).then(() => {
                            Alert.alert(
                                'Transaction Status',
                                'success',
                                [
                                    {text: 'CANCEL', style: 'cancel', onPress: () => this.props.navigation.navigate('Home')},
                                    {text: 'OK', onPress: () => this.props.navigation.navigate('Home')}
                                ]
                            );
                        }).catch((error) => {
                            Alert.alert(
                                'Transaction Status',
                                'Error! Try Again',
                                [
                                    {text: 'CANCEL', style: 'cancel'},
                                    {text: 'OK'}
                                ]
                            );
                        });
                    }).catch((error) => {
                        Alert.alert(
                            'Transaction Status',
                            'Error! Try Again',
                            [
                                {text: 'CANCEL', style: 'cancel'},
                                {text: 'OK'}
                            ]
                        );
                    });
                }
            } else {
                Alert.alert(
                    'Transaction Status',
                    'Please ensure you identify the shop to move product to, the quantity you want to move and the quantity is not more than '+this.props.navigation.state.params.qty,
                    [
                        {text: 'CANCEL', style: 'cancel'},
                        {text: 'OK'}
                    ]
                );
            }            
        }        
    }

    handleAndroidBackButton = () => {        
        BackHandler.addEventListener('hardwareBackPress', () => {
            //navigate to Home.js
            this.props.navigation.navigate('Home');
            return true;
        });
    };

    removeAndroidBackButtonHandler = () => {
        BackHandler.removeEventListener('hardwareBackPress', () => {});
    }

    componentDidMount() {        
        this.handleAndroidBackButton();
    }

    componentWillUnmount() {
        this.removeAndroidBackButtonHandler();
    }

	render(){
        let showActionArea, routeLocation;
        let selectedAction = this.state.selected;

        if(selectedAction == 'key2'){
            if(this.props.navigation.state.params.wHouse != '-LmJoybkOTi44giJA-01'){
                showActionArea =    <Card>
                                        <CardItem>
                                            <CheckBox title='Carton' checkedIcon='dot-circle-o' uncheckedIcon='circle-o' checked={this.state.checked} onPress={this.onWholesaleChange.bind(this)}/>
                                            <Input placeholder='Quantity' inputContainerStyle={styles.inputStyle} keyboardType={'numeric'} editable={this.state.TextInputDisableHolder} name="qty" onChangeText={val => this.onChangeText('qty', val)} value={this.state.qty}/>
                                        </CardItem>
                                        <CardItem>
                                            <Button buttonStyle={styles.button} title="Complete Sales" onPress={() => {this.completeSale()}}/>
                                        </CardItem>
                                    </Card>
            } else {
                showActionArea =    <Card>
                                        <CardItem>
                                            
                                            <Input placeholder='Quantity' inputContainerStyle={styles.inputStyle} keyboardType={'numeric'} editable={this.state.TextInputDisableHolder} name="qty" onChangeText={val => this.onChangeText('qty', val)} value={this.state.qty}/>
                                        </CardItem>
                                        <CardItem>
                                            <Button buttonStyle={styles.button} title="Complete Sales" onPress={() => {this.completeSale()}}/>
                                        </CardItem>
                                    </Card>
            }
        } else if(selectedAction == 'key1'){
            if(this.props.navigation.state.params.location != 'Ofili Warehouse'){
                showActionArea =    <Card>
                                    <CardItem>
                                        <Picker
                                            mode='dropdown'
                                            selectedValue={this.state.shop}
                                            onValueChange={this.onShopChange.bind(this)}>
                                            <Item label='Which Shop?' value='key0' />
                                            <Item label='HeadBridge' value='HeadBridge' />
                                            <Item label='PortHarcourt Rd' value='PortHarcourt Rd' />
                                        </Picker>
                                    </CardItem>
                                    <CardItem>
                                        <Button buttonStyle={styles.button} title="Complete Move" onPress={() => {this.moveToWarehouse()}}/>
                                    </CardItem>
                                </Card>
            } else {
                showActionArea =    <Card>
                                    <CardItem>
                                        <Picker
                                            mode='dropdown'
                                            selectedValue={this.state.shop}
                                            onValueChange={this.onShopChange.bind(this)}>
                                            <Item label='Which Shop?' value='key0' />
                                            <Item label='HeadBridge' value='HeadBridge' />
                                            <Item label='PortHarcourt Rd' value='PortHarcourt Rd' />
                                        </Picker>
                                    </CardItem>
                                    <CardItem>
                                        <Input placeholder='How many pieces' keyboardType={'numeric'} editable={this.state.TextInputDisableHolder} name="ofiliQty" onChangeText={val => this.onChangeText('ofiliQty', val)} value={this.state.ofiliQty}/>
                                    </CardItem>
                                    <CardItem>
                                        <Button buttonStyle={styles.button} title="Complete Move" onPress={() => {this.moveToWarehouse()}}/>
                                    </CardItem>
                                </Card>
            }            
        }

        //if this user is a warehouse manager
        if(this.state.userPost == 'Warehouse Admin'){
            routeLocation = <Item label='Move to Shop' value='key1' />;//show warehouse management
        } else if(this.state.userPost == 'Salesperson'){//if salesperson
            routeLocation = <Item label='Sell' value='key2' />;//show sales management
        } else if(this.state.userPost == 'Manager'){//if manager
            routeLocation = <View><Item label='Move to Shop' value='key1' /><Item label='Sell' value='key2' /></View>;//show sales management & warehouse management
        }

		return (
			<Container>						
				<Header>
					<Body>
						<Title>
                            {this.props.navigation.state.params.prdtName}
						</Title>
					</Body>
				</Header>
				<Content>
                    <Card>
                        <CardItem>
                            <Left>
                                <Text style={styles.titleText}>Product Name</Text>
                            </Left>
                            <Right>
                                <Text>{this.props.navigation.state.params.prdtName}</Text>
                            </Right>
                        </CardItem>
                        <CardItem>
                            <Left>
                                <Text style={styles.titleText}>Product Price</Text>
                            </Left>
                            <Right>
                                <Text>N{this.props.navigation.state.params.prdtPrice}</Text>
                            </Right>
                        </CardItem>
                        <CardItem>
                            <Left>
                                <Text style={styles.titleText}>Model Num</Text>
                            </Left>
                            <Right>
                                <Text>{this.props.navigation.state.params.itemModelNum}</Text>
                            </Right>
                        </CardItem>
                        <CardItem>
                            <Left>
                                <Text style={styles.titleText}>Warehouse/Store</Text>
                            </Left>
                            <Right>
                                <Text>{this.props.navigation.state.params.location}</Text>
                            </Right>
                        </CardItem>
                        <CardItem>
                            <Left>
                                <Text style={styles.titleText}>Qty Remaining in Carton</Text>
                            </Left>
                            <Right>
                                <Text>{this.props.navigation.state.params.qty}</Text>
                            </Right>
                        </CardItem>
                        <CardItem>
                            <Left>
                                <Text style={styles.titleText}>Date</Text>
                            </Left>
                            <Right>
                                <Text>{this.props.navigation.state.params.date}</Text>
                            </Right>
                        </CardItem>
                    </Card>
                    <Card>
                        <CardItem>
                            <Picker
                                headerComponent={
                                    <Header>
                                        <Button transparent>
                                            Custom Back
                                        </Button>
                                        <Title>Custom Header</Title>
                                    </Header>
                                }
                                mode='dropdown'
                                selectedValue={this.state.selected}
                                onValueChange={this.onValueChange.bind(this)}>
                                <Item label='Select Action' value='key0' />                               
                                {routeLocation}
                            </Picker>
                        </CardItem>                        
                    </Card>
                    {showActionArea}
				</Content>
			</Container>
		);
	}
  
};

const styles = StyleSheet.create({
    titleText: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    button: {
        width: width * 0.9,
        alignItems: 'center',
    },
    inputStyle: {
        width: width / 3
    }
});

