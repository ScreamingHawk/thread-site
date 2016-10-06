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

#GET
latestPosts = require './latestPosts'
app.get '/', (req, res)->
	context = require './context'
	context.init res
	latestPosts.handler null, context
	
#GET post
exactPost = require './exactPost'
app.get '/:postId', (req, res)->
	context = contextFactory.createContext()
	context.init res
	exactPost.handler 
			postId: req.params.postId
		, context

#GET up
newerPosts = require './newerPosts'
app.get '/:postId/up', (req, res)->
	context = contextFactory.createContext()
	context.init res
	newerPosts.handler 
			postId: req.params.postId
		, context

#GET down
olderPosts = require './olderPosts'
app.get '/:postId/down', (req, res)->
	context = contextFactory.createContext()
	context.init res
	olderPosts.handler 
			postId: req.params.postId
		, context

#POST
addPost = require './addPost'
app.post '/', (req, res)->
	context = contextFactory.createContext()
	context.init res
	post = 
		msg: req.body.msg
		img: xss req.body.img
	addPost.handler post, context


#Init
app.listen config.serverPort, ()->
	console.log 'Listening on port ' + config.serverPort