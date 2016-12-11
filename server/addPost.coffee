postHandler = require './postHandler'
config = require './config.json'

exports = module.exports = {}

exports.handler = (event, context)->
	postHandler.insertPost event.msg, event.img, (err, postId)->
		if err?
			context.done 'Error adding post'
		else
			context.succeed 
				"id": postId
