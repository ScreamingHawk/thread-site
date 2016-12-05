dateFormat = require 'dateformat'

config = require './config.json'

if not config.S3Override
	AWS = require 'aws-sdk'

exports = module.exports = {}

exports.latestPostId = (next)->
	next 0

exports.insertPost = (msg, img, next)->	
	exports.latestPostId (postId)-> 
		postId += 1
		if config.s3Override
			fs = require 'fs'
			fs.writeFile '../public/posts/'+postId, 
					msg: msg
					img: img
				, (err)->
					if err?
						console.log 'Error inserting post: ' + err
						next 'Error inserting post'
					else
						next null, postId
		else
			s3 = AWS.S3()
			s3.putObject 
					Bucket: 'threadsite.link'
					Key: 'posts/'+postId
					Body: 
						msg: msg
						img: img
				, (err, data)->
					if err?
						console.log 'Error inserting post: ' + err
						next 'Error inserting post'
					else
						next null, postId

