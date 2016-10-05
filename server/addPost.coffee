db = require './db'
config = require './config.json'

exports = module.exports = {}

exports.handler = (event, context)->
	db.query "INSERT INTO posts (msg, img) VALUES (?, ?)", [event.msg, event.img], (err, result)->
		if err?
			context.done 'Error adding post'
		else
			context.succeed 
				"id": result.insertId