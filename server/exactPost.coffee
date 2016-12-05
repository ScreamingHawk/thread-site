#db = require './db'

exports = module.exports = {}

exports.handler = (event, context)->
	db.query "SELECT * FROM posts WHERE postId = ?", [event.postId], (err, result)->
		if err?
			context.done 'Error getting exact post'
		else
			context.succeed result
