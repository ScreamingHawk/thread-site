#db = require './db'
config = require './config.json'

exports = module.exports = {}

exports.handler = (event, context)->
	db.query "SELECT * FROM posts LIMIT ?", [config.postLimit], (err, result)->
		if err?
			context.done 'Error listing posts'
		else
			context.succeed result
