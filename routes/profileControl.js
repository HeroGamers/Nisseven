const { log } = console
var express = require('express')
var router = express.Router()

// api/x

const pathsToCheck = ['/removeProfile', '/resetPSW', '/makeAdmin', '/removeAdmin', '/subscribe', '/unsubscribe', '/newUser']


router.post('*', (req, res, next) => {
	if (!pathsToCheck.includes(req.url)) {
		next()
		return
	}

	try {
		if (!req.isAdmin) throw 'admin required'
		if (!req.types.includes('targetID')) throw 'need target'

		next()
	}
	catch (err) {
		res.send({res: false, err: err})
	}
})


router.post('*', (req, res, next) => {
	if (!pathsToCheck.includes(req.url)) {
		next()
		return
	}

	switch (req.url) {
		case '/removeProfile':
			if (global.superAdmins.includes(req.body.targetID)) {
				if (req.user.id !== req.body.targetID) {
					res.send({res: false, err: 'cannot remove super admin'})
					break
				}
			}

			global.users.deleteOne(req.body.targetID)
			next()
			break

		
		case '/resetPSW':
			if (global.superAdmins.includes(req.body.targetID)) {
				if (req.user.id !== req.body.targetID) {
					res.send({res: false, err: 'cannot reset password on a super admin'})
					break
				}
			}

			global.users.updateOne(req.body.targetID, {
				allowNewPassword: true
			}, true)

			next()
			break


		case '/makeAdmin':
			global.users.updateOne(req.body.targetID, {
				privileges: ['admin']
			}, true)

			next()
			break


		case '/removeAdmin':
			if (global.superAdmins.includes(req.body.targetID)) {
				if (req.user.id !== req.body.targetID) {
					res.send({res: false, err: 'cannot remove admin privilege from super admin'})
					break
				}
			}
			

			global.users.updateOne(req.body.targetID, {
				privileges: []
			}, true)

			next()
			break


		case '/subscribe':
			if (global.superAdmins.includes(req.body.targetID)) {
				if (req.user.id !== req.body.targetID) {
					res.send({res: false, err: 'cannot subscribe a super admin'})
					break
				}
			}

			global.users.updateOne(req.body.targetID, {
				subscribed: true
			}, true)

			next()
			break


		case '/unsubscribe':
			if (global.superAdmins.includes(req.body.targetID)) {
				if (req.user.id !== req.body.targetID) {
					res.send({res: false, err: 'cannot unsubscribe a super admin'})
					break
				}
			}

			global.users.updateOne(req.body.targetID, {
				subscribed: false
			}, true)

			next()
			break


		case '/newUser':
			global.users.insertOne(req.body.targetID, {
				fullname: req.body.fullname
			})

			next()
			break
	}
})


router.post('*', (req, res, next) => {
	if (!pathsToCheck.includes(req.url)) {
		next()
		return
	}

	res.send({res: true})
})


module.exports = router
