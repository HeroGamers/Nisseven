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


w.get('/signup/:link', (req, res, next) => {
	let klasser = global.klasser.collection()
	cKlasse = ''
	for (K of klasser)
		if (K.inviteLinks.includes(req.params.link)) cKlasse = K.name

	if (cKlasse == '') {
		// TODO: Send en 'link ugyldigt' side
	}

	res.render('signup', { inviteLink: req.params.link, cKlasse: cKlasse })
})

w.get("/signup", (req, res) => {
	res.render("signup", { inviteLink: false });
});


w.use('*', (req, res) => {
	if (req.user) {
		res.render('default', { user: req.user })
	} else {
		res.redirect('/auth/login')
	}
})