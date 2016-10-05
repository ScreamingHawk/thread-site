mysql = require 'mysql'

config = require './config.json'

exports = module.exports = {}

	
exports.query = (sql, params, next)->
	connection = mysql.createConnection
		host: config.dbHost
		user: config.dbUser
		password: config.dbSecret
		database: config.dbSchema
	
	connection.connect (err)->
		if err?
			console.error 'Error connecting: ' + err.stack
			next err
			return
			
		connection.query sql, params, (err, result)->
			if err?
				console.error 'Error querying: ' + err.stack
				next err
				return
			
			connection.end (err)->
				if err?
					console.error 'Error ending connection: ' + err.stack
					next err
					return
					
				next null, result