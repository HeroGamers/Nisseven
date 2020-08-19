const { log, table, clear } = console

require('./scripts/load')
require('./scripts/startServer')
require('./scripts/database')


const w = global.app


w.get('/col', (req, res) => {
	const { readFileSync } = require('fs')

	let file = './config/collections/users.json'
	res.download(file)
})


w.get('/kontrolpanel', (req, res) => {
	if (req.user && req.isAdmin) {
		let collection = global.users.collection()

		res.render('kpPage/kontrolpanel', { user: req.user, collection: collection})
	}
	else {
		res.redirect('/')
	}
})


w.use('*', (req, res) => {
	if (req.user) {
		res.render('default', { user: req.user })
	} else {
		res.redirect('/auth/login')
	}
})