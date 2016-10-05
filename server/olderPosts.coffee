db = require './db'
config = require './config.json'

exports = module.exports = {}

exports.handler = (event, context)->
	db.query "SELECT * FROM posts WHERE postId < ? LIMIT ?", [event.postId, config.postLimit], (err, result)->
		if err?
			context.done 'Error listing older posts'
		else
			context.succeed result