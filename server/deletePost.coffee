crypto = require 'crypto'

#db = require './db'
config = require './config.json'

exports = module.exports = {}

exports.handler = (event, context)->
	if !event.modId? || !event.pass? || !event.postId?
		context.done 'Missing params'
	else
		db.query "SELECT salt, pass FROM mods WHERE modId = ?", [event.modId], (err, result)->
			if err? || result.length != 1
				context.done 'Error getting mod pass'
			else
				hash = crypto.createHmac 'sha512', result[0].salt
				hash.update event.pass
				pass = hash.digest 'hex'
				if pass != result[0].pass
					context.done 'Incorrect password'
				else
					db.query "DELETE FROM posts WHERE postId = ?", [event.postId], (err, result)->
						if err?
							context.done 'Error deleting post'
						else
							context.succeed 
								"id": event.postId
