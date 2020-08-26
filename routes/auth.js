const { log } = console

var express = require('express')
var router = express.Router()



router.post('/login', (req, res) => {
	try {
		if (!req.secureBody || !req.types.includes('username' || !req.types.includes('password'))) {
			throw 'usikker krop'
		}

		let user = global.users.findOne(req.body.username)
		let today = new Date()
		let year = String(today.getFullYear())
		let christmas = new Date(global.assignDate + '/' + year + ' 12:00:00 AM')

		if (!user) throw 'bruger findes ikke'
		if (!user.hasOwnProperty('password') || (user.hasOwnProperty('allowNewPassword') && user.allowNewPassword)) throw 'lav bruger'
		if (!global.verify(req.body.password, user.password)) throw 'psw matcher ikke'
		log("check date")
		if (today > christmas) {
			log("date is later than christmas")
			if (user.hasOwnProperty("nisseven") && user.nisseven === null) {
				log("user has property 'nisseven' as null")
				let users = global.users.collection()
				for (let i = 0; i < users.length; i++) {
					log("checking new user")
					if (!users[i].distributed && users[i].id !== user.id && users[i].hasOwnProperty("distributed")) {
						log("user is not distributed")
						let nisseven = users[i]

						let encryptednisseven = global.encryptstr(nisseven.id, req.body.password)
						log("got encrypted name")
						global.users.updateOne(nisseven.id, {distributed: true})
						log("updates to distributed")
						global.users.updateOne(user.id, {nisseven: encryptednisseven})
						log("updates nisseven")
						break
					}
				}
			}
		}

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
					distributed: false,
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