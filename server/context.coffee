exports = module.exports = {}

exports.createContext = ()->
	context = {}
	
	context.init = (res)->
		context.res = res

	context.succeed = (results)->
		if context.res?
			if results?
				context.res.json results
	
	context.done = (err, message)->
		if context.res?
			if err?
				context.res.status 500
				context.res.json err
			else if message?
				context.res.json message
			else
				context.res.sendStatus 200
				
	return context