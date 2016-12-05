crypto = require 'crypto'

#db = require './db'
config = require './config.json'

exports = module.exports = {}

exports.handler = (event, context)->
	if !event.pass?
		context.done 'No password'
	else
		db.query "SELECT COUNT(modId) as count FROM mods", [], (err, result)->
			if err?
				context.done 'Error checking mod count'
			else if result[0].count is 0
				salt = crypto.randomBytes 64
					.toString 'hex'
				hash = crypto.createHmac 'sha512', salt
				hash.update event.pass
				pass = hash.digest 'hex'
				db.query "INSERT INTO mods (pass, salt) VALUES (?, ?)", [pass, salt], (err, result)->
					if err?
						context.done 'Error adding mod'
					else
						context.succeed 
							id: result.insertId
			else
				context.done 'Only one mod allowed'
