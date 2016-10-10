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
latestPosts = require './latestPosts'
app.get '/', (req, res)->
	context = contextFactory.createContext()
	context.init res
	latestPosts.handler null, context

#Get exact post
exactPost = require './exactPost'
app.get '/:postId', (req, res)->
	context = contextFactory.createContext()
	context.init res
	exactPost.handler 
			postId: req.params.postId
		, context

#Get post and above
newerPosts = require './newerPosts'
app.get '/:postId/up', (req, res)->
	context = contextFactory.createContext()
	context.init res
	newerPosts.handler 
			postId: req.params.postId
		, context

#Get post and below
olderPosts = require './olderPosts'
app.get '/:postId/down', (req, res)->
	context = contextFactory.createContext()
	context.init res
	olderPosts.handler 
			postId: req.params.postId
		, context

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

#Add mod
addMod = require './addMod'
app.post '/mod', (req, res)->
	context = contextFactory.createContext()
	context.init res
	addMod.handler 
			modId: req.body.modId
			pass: req.body.pass
		, context

#Init
app.listen config.serverPort, ()->
	console.log 'Listening on port ' + config.serverPort