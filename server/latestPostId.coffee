postHandler = require './postHandler'
config = require './config.json'

exports = module.exports = {}

exports.handler = (event, context)->
	postHandler.latestPostId (err, postId)->
		if err?
			context.done 'Error listing posts'
		else
			context.succeed 
				postId: postId
