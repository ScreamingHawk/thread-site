express = require 'express'
bodyparser = require 'body-parser'
xss = require 'xss'

contextFactory = require './context'
config = require './config.json'

app = express()

#CORS
app.use (req, res, next)->
	res.header 'Access-Control-Allow-Origin', '*'
	res.header 'Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE'
	res.header 'Access-Control-Allow-Headers', 'Content-Type'
	next()

#JSON body
app.use bodyparser.json()

#Get latest posts
latestPostId = require './latestPostId'
app.get '/', (req, res)->
	context = contextFactory.createContext()
	context.init res
	latestPostId.handler null, context

#Add post
addPost = require './addPost'
app.post '/', (req, res)->
	context = contextFactory.createContext()
	context.init res
	post = 
		msg: req.body.msg
		img: xss req.body.img
	addPost.handler post, context

#Delete post
deletePost = require './deletePost'
app.delete '/:postId', (req, res)->
	context = contextFactory.createContext()
	context.init res
	deletePost.handler 
			modId: req.body.modId
			pass: req.body.pass
			postId: req.params.postId
		, context

#Init
app.listen config.serverPort, ()->
	console.log 'Listening on port ' + config.serverPort
