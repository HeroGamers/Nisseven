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
	for (K of klasser) {
		if (K.inviteLinks.includes(req.params.link)) {
			log(K)
			cKlasse = K.name
		}
	}

	if (cKlasse === '') {
		// TODO: Send en 'link ugyldigt' side
	}

	res.render('signup', { inviteLink: req.params.link, cKlasse: cKlasse })
})

w.get("/signup", (req, res) => {
	res.render("signup", { inviteLink: false })
})

w.get("/login", (req, res) => {
  res.render("loginPage/login-main", { _showSignupBtn: true })
})


w.use('*', (req, res) => {
	if (req.user) {
		let inviteLink
		let kName
		let isAdmin

		if (req.user.klasse) {
			let klasse = global.klasser.findOne(String(req.user.klasse))
			inviteLink = klasse.inviteLinks
			kName = klasse.name || 'Unavngivet'
			try {
				isAdmin = klasse.admins.includes(req.user.id)
			} catch (err) {
				isAdmin = false
			}
			
		}

		res.render('default', { user: req.user, _klasse: req.user.klasse, _inviteLink: inviteLink, _kName: kName, _isAdmin: isAdmin })
	} else {
		res.redirect('/login')
	}
})
