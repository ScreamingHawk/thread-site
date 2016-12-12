dateFormat = require 'dateformat'
async = require 'async'
path = require 'path'

config = require './config.json'
if config.s3Override
	fs = require 'fs'
else
	AWS = require 'aws-sdk'
	if config.awsProfile?
		AWS.config.credentials = new AWS.SharedIniFileCredentials
			profile: config.awsProfile

exports = module.exports = {}

exports.latestPostId = (next)->
	if config.s3Override
		fs.readdir '../public/posts', (err, files)->
			if err?
				console.log 'Error reading files: ' + err
				next 'Error reading files'
			else
				calculateLatestPostId files, next
	else
		s3 = new AWS.S3()
		s3.listObjects
				Bucket: 'threadsite.link'
				Prefix: 'posts/'
			, (err, data)->
				if err?
					console.log 'Error reading files: ' + err
					next 'Error reading files'
				else
					files = []
					async.each data.Contents, (obj, callback)->
							files.push obj.Key
							callback()
						, (err)->
							calculateLatestPostId files, next

calculateLatestPostId = (files, next)->
	if files?
		highest = 0
		async.each files, (filename, callback)->
				if path.extname(filename) == '.json'
					id = parseInt filename.split('/').pop().split('.')[0]
					if id > highest
						highest = id
				callback()
			, (err)->
				if err?
					console.log 'Error calculating highest post id: ' + err
					next 'Error calculating highest post id'
				else
					next null, highest
	else
		next null, 0
	
	

exports.insertPost = (msg, img, next)->	
	exports.latestPostId (err, postId)-> 
		if err?
			console.log 'Error inserting post: ' + err
			next 'Error inserting post'
		else
			postId += 1
			file_body = 
				postId: postId
				time: dateFormat new Date(), "isoDateTime"
				msg: msg
				img: img
			if config.s3Override
				fs.writeFile '../public/posts/' + postId + '.json', JSON.stringify(file_body), (err)->
					if err?
						console.log 'Error inserting post: ' + err
						next 'Error inserting post'
					else
						next null, postId
			else
				s3 = new AWS.S3()
				s3.putObject 
						Bucket: 'threadsite.link'
						Key: 'posts/' + postId + '.json'
						Body: JSON.stringify file_body
					, (err, data)->
						if err?
							console.log 'Error inserting post: ' + err
							next 'Error inserting post'
						else
							next null, postId
