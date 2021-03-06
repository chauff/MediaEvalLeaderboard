var fs = require('fs');
var LOGGER = require('./logger'); 

var ranking = {
	
	//one array per evaluation type (we have two)
	mobilityItems: [],
	localeItems: [],
	
	//each evaluation type is backed up to a separate file
	backupFiles: ['./data/backup-ranking-mobility', './data/backup-ranking-locale'],
	
	//returns the correct array for each evaluation type
	//for object internal use only
	_getItems: function (evalType) {
		if (evalType === 'locale') {
			return ranking.localeItems;
		}
		else if (evalType === 'mobility') {
			return ranking.mobilityItems;
		}
		else {
			LOGGER.error("Invalid ranking type requested!");
			return null;
		}
	},
	
	//return the number of items per evaluation type 
	getNumItems: function (evalType) {
		var items = ranking._getItems(evalType);
		if (items === null) {
			return items;
		}
		return items.length;
	},
	
	//returns an Item object for a given token 
	//or null, if the item does not exist
	getItem: function (token, evalType) {
		var items = ranking._getItems(evalType);
		if (items === null) {
			return items;
		}
		for (var i in items) {
			if (items[i].token === token) {
				return items[i];
			}
		}
		return null;
	},

	//for object internal use only
	_getItemProperty: function (token, evalType, property) {
		var item = this.getItem(token, evalType);
		if (item !== null) {
			return item[property];
		}
		return null;		
	},
	
	getLastSubmissionDate: function (token, evalType) {
		return ranking._getItemProperty(token, evalType, "lastSubmission");
	},
	
	//returns the average error of a particular item
	getMedianError: function (token, evalType) {
		return ranking._getItemProperty(token, evalType, "medianError");
	},

	//number of updates (number of submissions) a team made
	getNumUpdates: function (token, evalType) {
		return ranking._getItemProperty(token, evalType, "updates");
	},

	teamNameExists: function (name, evalType) {
		var items = ranking._getItems(evalType);
		if (items === null) {
			return items;
		}
		
		for (var i in items) {
			if (items[i].name.toLowerCase() === name.toLowerCase()) {
				return true;
			}
		}
		return false;
	},

	emailExists: function (email, evalType) {
		var items = ranking._getItems(evalType);
		if (items === null) {
			return items;
		}

		for (var i in items) {
			if (items[i].email.toLowerCase() === email.toLowerCase()) {
				return true;
			}
		}
		return false;
	},	
	
	//does an item with 'token' already exist in our list?
	//returns true if it exists, false otherwise
	tokenExists: function (token) {
		var item = this.getItem(token, 'locale');//every token is registered to both eval types
		if (item === null) {
			return false;
		}
		return true;
	},

	//add a new item if it does not yet exist
	//returns true if successful
	addItem: function (token, name, email) {
		if (this.tokenExists(token)) {
			return false;
		}
		//add the item to both evaluation types
		this.mobilityItems.push(new Item(token, name, email));
		this.localeItems.push(new Item(token, name, email));
		this.backup();//backup to file
		return true;
	},
	
	//update the score of an existing item
	//returns true if an update occurred, false otherwise
	updateItem: function (token, evalType, medianError, submissionFile) {
		
		var item = this.getItem(token, evalType);
		if (item === null) {
			return false;
		}
		console.log("Updating item!");
		console.log("Minimum error: " + item.minError);		
		
		item.medianError = medianError;
		item.file = submissionFile;
		item.updates++;

		if (item.minError === '' || item.minError > item.medianError || item.minError === 'NaN') {
			console.log("Changing minimum Error to " + item.medianError);
			item.minError = item.medianError;
			item.minErrorFile = item.file;
		}

		item.lastSubmission = Date();
		this.backup();//backup after an update
		return true;
	},

	backup: function () {
		LOGGER.info('Backing up the ranking ...');
		ranking._backup(this.mobilityItems, ranking.backupFiles[0]);
		ranking._backup(this.localeItems, ranking.backupFiles[1]);
	},
	

	_backup: function (items, file) {
		var stream = fs.createWriteStream(file);
		stream.once('open', function (fd) {
			for (var i in items) {
				stream.write(JSON.stringify(items[i]) + "\n");
			};
			stream.end();
		});
	},

	loadFromBackup: function () {
		LOGGER.info('Loading ranking from backup ....');
		ranking._loadFromBackup(this.mobilityItems, ranking.backupFiles[0]);
		ranking._loadFromBackup(this.localeItems, ranking.backupFiles[1]);
	},

	_loadFromBackup: function (items, file) {
		fs.readFile(file, 'utf8', function (err, data) {
			if (err) {
				LOGGER.error('Error when loading the backuped ranking from ' + file);
				return;
			}
			var lines = data.split(/\n/);
			lines.forEach(function (line) {
				if (line.length > 5) {
					var item = JSON.parse(line);
					items.push(item);
				}
			});
		});
	},
};

function Item(token, name, email) {

	this.valid = 1;//if computations take a long time, this is a useful flag to have (valid<0) if computations are ongoing
	this.token = token;
	this.email = email;
	this.name = name;
	this.medianError = 'NaN';//median error in meters
	
	this.file = '';//path to file from which the current evaluation stems
	this.updates = 0;
	this.lastSubmission = '';
	
	//minimum median error across all submissions
	this.minError = 'NaN';
	this.minErrorFile = '';
}

exports.ranking = ranking;
