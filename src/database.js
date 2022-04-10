import SQLite from "react-native-sqlite-storage";
SQLite.DEBUG(true);
SQLite.enablePromise(true);

const database_name = "steveKings.db";
const database_version = "1.0";
const database_displayname = "steveKings database";
const database_size = 200000;

export default class Database {
	initDB() {
		let db;
		return new Promise((resolve) => {
		//console.log("Plugin integrity check ...");
		SQLite.echoTest()
			.then(() => {
			//console.log("Integrity check passed ...");
			//console.log("Opening database ...");
			SQLite.openDatabase(
				database_name,
				database_version,
				database_displayname,
				database_size
			)
				.then(DB => {
					db = DB;
					//console.log("Database OPEN");
					db.executeSql('SELECT 1 FROM User LIMIT 1').then(() => {
						//console.log("Database is ready ... executing query ...");
					}).catch((error) =>{
						//console.log("Received error: ", error);
						//console.log("Database not yet ready ... populating data");
						db.transaction((tx) => {
							tx.executeSql('CREATE TABLE IF NOT EXISTS User (id Text Not Null, firstname TEXT NOT NULL, surname TEXT NOT NULL, othername TEXT NOT NULL, username varchar(20) NOT NULL, password varchar(20) NOT NULL, position (50) NOT NULL, phone varchar(11) NOT NULL, address TEXT NOT NULL, macAddress varchar(20) NOT NULL)');
							//tx.executeSql('CREATE TABLE IF NOT EXISTS liveTv (id Text NOT NULL, title TEXT NOT NULL, category TEXT NOT NULL, type TEXT NOT NULL, url text NOT NULL, programDate INTEGER NOT NULL, thumbImg text NOT NULL, coverImg text NOT NULL, onGoing text CHECK( onGoing IN ("Y","N") ) NOT NULL DEFAULT "N")');
							//tx.executeSql('CREATE TABLE IF NOT EXISTS payment (id TEXT NOT NULL, digit INTEGER NOT NULL, dateUsed Date NOT NULL, dateExpire Date NOT NULL)');
						}).then(() => {
							//console.log("Table created successfully");
						}).catch(error => {
							//console.log(error);
						});
					});
					resolve(db);
				})
				.catch(error => {
					//console.log(error);
				});
			})
			.catch(error => {
				//console.log("echoTest failed - plugin not functional");
			});
		});
	};

	isDBready(){
		return new Promise((resolve) => {
			this.initDB().then((db) => {
				db.transaction((tx) => {
					tx.executeSql('SELECT 1 FROM User LIMIT 1', []).then(([tx, results]) => {
						resolve(true);
					});	
				}).then((result) => {
					this.closeDatabase(db);
				}).catch((err) => {
					resolve(false);
				});
			}).catch((err) => {
				console.log(err);
			});
		}); 
	}

	closeDatabase(db) {
		if (db) {
		console.log("Closing DB");
		db.close()
			.then(status => {
			console.log("Database CLOSED");
			})
			.catch(error => {
			this.errorCB(error);
			});
		} else {
		console.log("Database was not OPENED");
		}
	};
	checkLogin(){
		return new Promise((resolve) => {
			const uData = [];
			this.initDB().then((db) => {
				db.transaction((tx) => {
					tx.executeSql('SELECT * FROM user', []).then(([tx, results]) => {
						var len = results.rows.length;
						for (let i = 0; i < len; i++) {
							let row = results.rows.item(i);
							
							const { id, firstname, surname, othername, username, password, position, phone, address  } = row;
							uData.push({
								id, 
								firstname, 
								surname, 
								othername, 
								username, 
								password, 
								position, 
								phone, 
								address
							});
						}
						
						resolve(uData);
					});
				}).then((result) => {
					//this.closeDatabase(db);
				}).catch((err) => {
					console.log(err);
				});
			}).catch((err) => {
				console.log(err);
			});
		});  
	}

	/*addUser(user) {
		return new Promise((resolve) => {
			this.initDB().then((db) => {
				db.transaction((tx) => {
					tx.executeSql('INSERT INTO User VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [user.id, user.fName, user.lName, user.oName, user.uName, user.pass, user.date, user.phone, user.add, user.mac]).then(([tx, results]) => {
						resolve(results);
					});
				}).then((result) => {
					//this.closeDatabase(db);
				}).catch((err) => {
					console.log(err);
				});
			}).catch((err) => {
				console.log(err);
			});
		});  
	};

	
	
	getTvProgramsForToday(){
		return new Promise((resolve) => {
			
			this.initDB().then((db) => {
				db.transaction((tx) => {
					tx.executeSql("SELECT * FROM liveTv WHERE date(datetime(programDate / 1000 , 'unixepoch')) = date('now')", []).then(([tx,results]) => {
						var len = results.rows.length;
						resolve(len);
					});
				}).then((result) => {
					//this.closeDatabase(db);
				}).catch((err) => {
					console.log(err);
				});
			}).catch((err) => {
				console.log(err);
			});
		});  
	}

	addLiveTv(tv) {
		let d= new Date(tv.date);
		let mili = d.getTime();
		
	return new Promise((resolve) => {
		this.initDB().then((db) => {
			db.transaction((tx) => {
				tx.executeSql('INSERT INTO liveTv (id, title, category, type, url, programDate, thumbImg, coverImg, onGoing) VALUES ("'+tv._id+'", "'+tv.title+'", "'+tv.category+'", "'+tv.type+'", "'+tv.url+'", '+mili+', "'+tv.thumbImg+'", "'+tv.coverImg+'", "'+tv.onGoing+'")', []).then(([tx, results]) => {
					resolve(results);
				});
			}).then((result) => {
				this.closeDatabase(db);
			}).catch((err) => {
				console.log(err);
			});
		}).catch((err) => {
			console.log(err);
		});
	}); 
	};

	listTvProg() {
		return new Promise((resolve) => {
			const tvProgs = [];
	
			this.initDB().then((db) => {
				db.transaction((tx) => {
					tx.executeSql("SELECT * FROM liveTv WHERE date(datetime(programDate / 1000 , 'unixepoch')) = date('now')", []).then(([tx,results]) => {
						var len = results.rows.length;
						for (let i = 0; i < len; i++) {
							let row = results.rows.item(i);
							
							const { id, title, category, type, url, programDate, thumbImg, coverImg, onGoing  } = row;
							tvProgs.push({
								id,
								title,
								category,
								type,
								url,
								programDate,
								thumbImg,
								coverImg, 
								onGoing
							});
						}
						
						resolve(tvProgs);
					});
				}).then((result) => {
					this.closeDatabase(db);
				}).catch((err) => {
					console.log(err);
				});
			}).catch((err) => {
				console.log(err);
			});
		});  
	}
  
	updateLiveTv(tv) {
		
		let d= new Date(tv.date);
		let mili = d.getTime();
		
		return new Promise((resolve) => {
		this.initDB().then((db) => {
			db.transaction((tx) => {
			tx.executeSql('SELECT * FROM liveTv WHERE id = ?', [tv._id]).then(([tx,results]) => {
				if(results.rows.length > 0) {//update
				tx.executeSql('UPDATE liveTv SET title = ?, category = ?, type = ?, url = ?, programDate = ?, thumbImg = ?, coverImg = ?, onGoing = ? WHERE id = ?', [tv.title, tv.category, tv.type, tv.url, mili, tv.thumbImg, tv.coverImg, tv.onGoing, tv._id]).then(([tx, results]) => {
					resolve(results);
				});
				} else {//insert
				tx.executeSql('INSERT INTO liveTv (id, title, category, type, url, programDate, thumbImg, coverImg, onGoing) VALUES ("'+tv._id+'", "'+tv.title+'", "'+tv.category+'", "'+tv.type+'", "'+tv.url+'", '+mili+', "'+tv.thumbImg+'", "'+tv.coverImg+'", "'+tv.onGoing+'")', []).then(([tx, results]) => {
					resolve(results);
				});
				}
			});
			}).then((result) => {
			this.closeDatabase(db);
			}).catch((err) => {
			console.log(err);
			});
		}).catch((err) => {
			console.log(err);
		});
		});  
	}

	emptyUserTb(){
		return new Promise((resolve) => {
			this.initDB().then((db) => {
				db.transaction((tx) => {
					tx.executeSql('DELETE FROM User', []).then(([tx, results]) => {
						resolve(results);
					});	
				}).then((result) => {
					this.closeDatabase(db);
				}).catch((err) => {
					console.log(err);
				});
			}).catch((err) => {
				console.log(err);
			});
		}); 
	}

	addPayment(sub) {
		let digit = parseInt(sub.digit);
		return new Promise((resolve) => {
			this.initDB().then((db) => {
				db.transaction((tx) => {
					tx.executeSql('INSERT INTO payment VALUES (?, ?, ?, ?)', [sub.id, digit, sub.dateUsed, sub.dateExpire]).then(([tx, results]) => {
						resolve(results);
					});
				}).then((result) => {
					//this.closeDatabase(db);
				}).catch((err) => {
					console.log(err);
				});
			}).catch((err) => {
				console.log(err);
			});
		});  
	};

	paymentHistory() {
		return new Promise((resolve) => {
			const payHistory = [];
	
			this.initDB().then((db) => {
				db.transaction((tx) => {
					tx.executeSql("SELECT * FROM payment ORDER BY dateUsed DESC", []).then(([tx,results]) => {
						var len = results.rows.length;
						for (let i = 0; i < len; i++) {
							let row = results.rows.item(i);
							
							const { id, digit, dateUsed, dateExpire } = row;
							payHistory.push({
								id,
								digit,
								dateUsed,
								dateExpire
							});
						}
						
						resolve(payHistory);
					});
				}).then((result) => {
					this.closeDatabase(db);
				}).catch((err) => {
					console.log(err);
				});
			}).catch((err) => {
				console.log(err);
			});
		});  
	}

	lastPaymentHistory() {
		
		return new Promise((resolve) => {
			const payHistory = [];
	
			this.initDB().then((db) => {
				db.transaction((tx) => {
					tx.executeSql("SELECT * FROM payment ORDER BY dateUsed ASC LIMIT 1", []).then(([tx,results]) => {
						var len = results.rows.length;
						
						for (let i = 0; i < len; i++) {
							let row = results.rows.item(i);
							
							const { id, digit, dateUsed, dateExpire } = row;
							payHistory.push({
								id,
								digit,
								dateUsed,
								dateExpire
							});
						}
						resolve(payHistory);
					});
				}).then((result) => {
					this.closeDatabase(db);
				}).catch((err) => {
					console.log(err);
				});
			}).catch((err) => {
				console.log(err);
			});
		});  
	}*/
  
}
