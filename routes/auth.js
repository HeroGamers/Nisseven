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
		if (!user.hasOwnProperty('password')) throw 'admin in need of psw'
		if (!global.verify(req.body.password, user.password)) throw 'psw matcher ikke'


		// Uddelegering af nisseven
		let today = new Date()
		let year = String(today.getFullYear())
		let christmas = new Date(global.assignDate + '/' + year + ' 12:00:00 AM')

		
		if (today > christmas) {
			if (!user.hasOwnProperty('nisseven')) {
				log("User has no nisseven property, assigning")
				global.users.updateOne(user.id, { nisseven: null}, true)
				user.nisseven = null
			}
			if (user.hasOwnProperty('nisseven') && !user.nisseven) {
				let users = global.users.collection()
				let not_distributed = []

				for (const current_user of users) {
					if (!current_user.distributed && current_user.id !== user.id) {
						not_distributed.push(current_user)
					}
				}

                // Randomize users array with Fisher-Yates algorithm
                for(let i = not_distributed.length-1; i > 0; i--){
                    const j = Math.floor(Math.random() * i)
                    const temp = not_distributed[i]
					not_distributed[i] = not_distributed[j]
					not_distributed[j] = temp
                }

				// Pick user
				let ven = null
				// Distribute randomly if the amount of users left is over 2
				if (not_distributed.length > 2) {
					ven = not_distributed[Math.floor(Math.random() * Math.floor(not_distributed.length))]
				}
				// If the amount of users left is under 2, we need to distribute them manually, to avoid someone being left behind
				else if (not_distributed.length > 0) {
					ven = not_distributed[0]
				}

				if (ven == null) {
					log("ERROR: Could not find a nisseven!!!!!")
				}
				else {
					// Encrypt chosen user
					let encryptstr = ven.id

					if (ven.hasOwnProperty('fullname')) {
						encryptstr = ven.fullname
					}

					let encryptednisseven = global.encryptStr(encryptstr, req.body.password)

					global.users.updateOne(ven.id, { distributed: true }, true)
					global.users.updateOne(user.id, { nisseven: encryptednisseven }, true)
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
		if (err === 'admin in need of psw') {
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
			res.send({ res: false, err: 'unexpected failure' })
			return
		}

		res.send({res: false, err: err})
	}
})



router.post('/signup', (req, res) => {
	/*
	* /auth/signup laver en ny konto og hvis intet invite link er angivet,
	* bliver en ny klasse automatisk oprettet.

	? hvis ens invite link viser sig at være ugyldigt, bliver requesten blot afvist,
	? hvorefter klienten skal spørge efter brugeren hvorvidt han/hun har lyst til at
	? oprette sin egen klasse.

	* Input:
	 - username, SKAL være unikt! Der skal bruges unilogin.
	 - password, mellem 7 og 40 karakterer.
	 - fullname, mellem 7 og 55 karakterer.
	 - inviteLink (valgfrit), hvis linket er gyldigt bliver man smidt ind i den korrekt gruppe.
	 - selfParticipate (valgfrit), vælger om man selv vil deltage i sin nylig oprettede klasse.
		 ... enten er man udelukkende admin, ellers er man både admin og deltager.
	 - createNew (valgfrit: true), det kan vælges hvorvidt man har lyst til at oprette en klasse.

	* Output:
	Et json objekt, der holder på to egenskaber:
	 - res, som enten er sandt eller falskt.
	 - err (hvis res == false), bliver fejlen angivet her så klienten ved besked.
	*/
	try {
		if (!req.secureBody || !req.types.includes('username' || !req.types.includes('password') || !req.types.includes('fullname')))
			throw 'usikker krop'

		if (req.body.password.length <= 7 && req.body.password.length >= 40)
			throw 'password should be between 7 and 40 characters long'

		if (req.body.fullname.length <= 7 && req.body.fullname.length >= 55)
			throw 'fullname should be between 7 and 55 characters long'

		let inviteLink = (req.types.includes('inviteLink')) ? req.body.inviteLink : false

		let createNew = (req.types.includes('createNew')) ? req.body.createNew : true

		let user = global.users.findOne(req.body.username)

		if (user) throw 'user already exists!'

		// Så har vi tjekket en hel masse, tid til at lave en ny konto

		// Find hvilken klasse inviteLinket tilhører, hvis det altså eksisterer.
		let klasser = global.klasser.collection()
		let klasse = false
		if (inviteLink) {
			for (const K of klasser) {
				if (K.inviteLinks.includes(inviteLink)) {
					klasse = K.id
				}
			}

			// I stedet for bare at lave en ny konto, så lader vi klienten afgøre 
			// hvad der skal ske.
			if (!klasse)
				throw 'invalid invite link'
		}

		// Hvis klassen ikke eksistere, bliver der lavet en ny.
		if (!klasse && createNew) {
			let participant = (req.body.selfParticipate) ? [req.body.username] : []

			klasse = String(klasser.length) + global.randomStr(5)

			global.klasser.insertOne(klasse, {
				admins: [req.body.username],
				participants: participant,
				inviteLinks: [global.randomStr(10)]
			})
		} else if (klasse)  {
			let participants = global.klasser.findOne(klasse).participants

			participants.push(req.body.username)

			global.klasser.updateOne(klasse, {
				participants: participants
			})
		}

		let cookieObj = global.genCookie(1)

		let usrObject = {
			password: global.hash(req.body.password),
			cookie: cookieObj.cookieToStore,
			nisseven: null,
			distributed: false,
			activated: Date.now(),
			allowNewPassword: undefined,

			fullname: req.body.fullname,
			klasse: klasse // mulighed for at deltage i flere nissevens konkurrencer
		}

		global.users.insertOne(req.body.username, usrObject)

		res.cookie('nv-username', req.body.username)
		res.cookie('nv-cookie', cookieObj.realCookie, { expire: cookieObj.cookieToStore.expireTime })

		res.send({ 'res': true })
		return

	} catch (err) {
		res.send({ 'res': false, 'err': err })
		return
	}
})


router.post('/kRename', (req, res) => {
	try {
		if (!req.secureBody)
			throw 'usikker krop'

		if (!req.types.includes('rename')) throw 'need a new name'

		let kID = req.user.klasse

		let klasse = global.klasser.findOne(kID)
		if (!klasse.admins.includes(req.user.id)) throw 'need admin privileges'


		global.klasser.updateOne(kID, { 
			'name': req.body.rename
		}, true)

		res.send({ 'res': true })

	} catch (err) {
		res.send({ 'res': false, 'err': err })
	}
})

router.post('/createKlasse', (req, res) => {
	try {
		if (!req.secureBody)
			throw 'usikker krop'

		if (req.user.klasse !== false) throw 'allerede medlem af en klasse'

		let participant = [req.user.id]

		let klasser = global.klasser.collection()
		klasse = String(klasser.length) + global.randomStr(5)

		global.klasser.insertOne(klasse, {
			admins: [req.user.id],
			participants: participant,
			inviteLinks: [global.randomStr(10)]
		})

		global.users.updateOne(req.user.id, {
			klasse: klasse
		})

		res.send({ 'res': true })

	} catch (err) {
		res.send({ 'res': false, 'err': err })
	}
})


router.post('/joinWithLink', (req, res) => {
	try {
		if (!req.secureBody)
			throw 'usikker krop'

		if (req.user.klasse !== false) throw 'allerede medlem af en klasse'

		let inviteLink = (req.types.includes('inviteLink')) ? req.body.inviteLink : false

		if (inviteLink === undefined || inviteLink === '') throw 'missing invite link'


		// Find hvilken klasse inviteLinket tilhører, hvis det altså eksisterer.
		let klasser = global.klasser.collection()
		let klasse
		if (inviteLink) {
			for (const K of klasser) {
				if (K.inviteLinks.includes(inviteLink)) {
					klasse = K.id
				}
			}

			// I stedet for bare at lave en ny konto, så lader vi klienten afgøre 
			// hvad der skal ske.
			if (!klasse)
				throw 'invalid invite link'
		}

		let participants = global.klasser.findOne(klasse).participants

		if (participants.includes(req.user.id)) throw 'allerede medlem af klassen'

		participants.push(req.user.id)

		global.klasser.updateOne(klasse, {
			participants: participants
		})

		global.users.updateOne(req.user.id, {
			klasse: klasse
		})

		res.send({ 'res': true, 'info': klasse })

	} catch (err) {
		res.send({ 'res': false, 'err': err })
	}
})

module.exports = router
