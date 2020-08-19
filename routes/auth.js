const { log } = console

var express = require('express')
var router = express.Router()



router.post('/login', (req, res) => {
	try {
		if (!req.secureBody || !req.types.includes('username' || !req.types.includes('password'))) {
			throw 'usikker krop'
		}

		let user = global.users.findOne(req.body.username)

		if (!user) throw 'bruger findes ikke'
		if (!user.hasOwnProperty('password') || (user.hasOwnProperty('allowNewPassword') && user.allowNewPassword)) throw 'lav bruger'
		if (!global.verify(req.body.password, user.password)) throw 'psw matcher ikke'

		let cookieObj = global.genCookie(1)

		global.users.updateOne(req.body.username, { cookie: cookieObj.cookieToStore, '2-min-noPsw': undefined }, true)
		

		// placerer nogle cookies på klienten
		res.cookie('nv-username', req.body.username)
		res.cookie('nv-cookie', cookieObj.realCookie, {expire: cookieObj.cookieToStore.expireTime})
		
		res.send({res: true})
	}
	catch (err) {
		if (err == 'lav bruger') {
			// lav en ny bruger
			let user = global.users.findOne( req.body.username )

			if (user) {
				let cookieObj = global.genCookie(1)

				const ID = req.body.username

				let usrObject = {
					password: global.hash(req.body.password),
					cookie: cookieObj.cookieToStore,
					nisseven: null,
					activated: Date.now(),
					subscribed: false,
					allowNewPassword: undefined
				}

				let upDateRes = global.users.updateOne(ID, usrObject, true)

				res.cookie('nv-username', req.body.username)
				res.cookie('nv-cookie', cookieObj.realCookie, {expire: cookieObj.cookieToStore.expireTime})

				res.send({ res: true })
				return
			}

			// brugeren findes ikke i validUsers :(
			res.send({ res: false, err: 'ikke med i klassen' })
			return
		}

		res.send({res: false, err: err})
	}
})



router.get('/login', (req, res) => {
	res.render('loginPage/login-main')
})

module.exports = router