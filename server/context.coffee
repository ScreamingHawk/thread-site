exports = module.exports = {}

exports.init = (res)->
	exports.res = res

exports.succeed = (results)->
	if exports.res?
		if results?
			exports.res.json results
	
exports.done = (err, message)->
	if exports.res?
		if err?
			exports.res.status 500
			exports.res.json err
		else if message?
			exports.res.json message
		else
			exports.res.sendStatus 200