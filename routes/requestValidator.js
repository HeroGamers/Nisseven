const { log } = console
var express = require('express')
var router = express.Router()


// Tjekker hvorvidt req.body er sikkert.
router.use('*', (req, res, next) => {
	try {

		let types = []


		let iterations = 0
		let maxIterations = 10


		for (let key in req.body) {
			iterations ++ // i tilfælde af at der bliver sendt et meget stor objekt
			if (iterations > maxIterations) throw 0

			if (typeof req.body[key] != 'string')
				if (typeof req.body[key] != 'boolean') throw 1

			if (req.body[key].length > 512) throw 2

			types.push(key)
		}
	
	
		req.secureBody = true
		req.types = types

	} catch (err) {
		log('unsecure body err:', err)
		req.secureBody = false
	}

	next()
})


// Tjekker hvorvidt brugeren er logget ind.
router.use('*', (req, res, next) => {
	try {

		if (!req.cookies['nv-username']) throw 0
		if (!req.cookies['nv-cookie']) throw 1
		if (!req.secureBody) throw 2

		const ID = req.cookies['nv-username']

		let user = global.users.findOne(ID)

		if (user) {

			// tjekker om brugeren er admin
			if (user.hasOwnProperty('privileges') && user.privileges.includes('admin'))
				req.isAdmin = true

			// tjek om cookie passer
			if (user.hasOwnProperty('cookie')) {
				if (global.verify(req.cookies['nv-cookie'], user.cookie.cookie) && user.cookie.expireTime >= Date.now()) {
					req.user = user

					if (req.types.includes('prompt_psw')) {
						if (user.hasOwnProperty('2-min-noPsw') && Date.now() <= req.user['2-min-noPsw']) {
							// alt er godt
						} else {
							if (req.types.includes('password') && global.verify(req.body.password, user.password)) {
								global.users.updateOne(user.id, {
									'2-min-noPsw': Date.now() + 120000
								}, true)
							} else {
								res.send({ res: false, err: 'prompt password' })
								return
							}
						}
						
					}
				}
			}
		}

		// if (user) {
		// 	if (global.verify(req.cookies['nv-cookie'], user.cookie.cookie)) {
				
		// 		// sikre at cookien stadig er gyldig
		// 		if (user.cookie.expireTime >= Date.now()) {
		// 			let userObj1 = user
		// 			col0;res
					
				

		// 			if (req.user && req.user.privileges) {
		// 				if (req.secureBody && req.user.privileges.includes('admin')) {
		// 					if (req.types.includes('password') || req.types.includes('prompt_psw')) {
		// 						// log ind
		// 						const PSW = req.body.password

		// 						if (global.verify(PSW, user.password)) {
		// 							global.users.updateOne(req.cookies['nv-username'], { '2-min-unlock': Date.now() + 120000 }, true)
		// 							req.adminIsLoggedin = true
		// 						} 
		// 						else if (Date.now() <= req.user['2-min-unlock']) {
		// 							req.adminIsLoggedin = true
		// 						}
		// 						else {
		// 							res.send({ res: false, err: 'prompt password' })
		// 							return
		// 						}
		// 					}
		// 				}
		// 			}
		// 		}
		// 	}
		// }

	} catch (err) {
		// console.log('user not logged in:', err)
		req.user = false
	}

	next()
})


module.exports = router