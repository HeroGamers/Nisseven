const { readFileSync, writeFileSync, unlinkSync, mkdirSync, existsSync } = require('fs')


// disse indstillinger bør ikke ændres på...
// btw selve settings.json er meget streng! Ryk rundt på det mindste og den nulstiller automatisk
const defaultSettings = {
	port: 8080,
	useHttps: false,
	forceSecureDBSave: false,
	prettyPrint: true,
	compileSassOnRun: false,
	clearOnRun: true,
	msgOnServerStart: false,
	databases: ['users'],
	superAdmins: ['rasmus', 'marcus']
}


let defaultSettingsLength = 0
let defaultSettingsKey = []
for (let key in defaultSettings) {
	defaultSettingsLength ++
	defaultSettingsKey.push(key)
}


const settingsPath = './config/settings.json'

let crypto = require('crypto')


const folders = ['config', 'config/collections']

for (let folder of folders) {
	if (!existsSync('./' + folder)) {
		mkdirSync('./' + folder)
	}
}



function loadSettings() {
	try {
		global.port = 8080 // bare som en default

		const settings = JSON.parse(readFileSync(settingsPath))

		let iterations = 0

		for (let key in settings) {
			if (defaultSettingsKey[iterations] != key) throw 'reset'
			global[key] = settings[key]

			iterations ++
		}

		if (iterations != defaultSettingsLength) throw 'reset'
	}
	catch (err) {

		if (err == 'reset') {
			console.log('settings.json blev nulstillede...')
			unlinkSync(settingsPath)
		}

		writeFileSync('./config/settings.json', JSON.stringify(defaultSettings, null, 2))

		loadSettings()
	}
}

loadSettings()
if (global.clearOnRun) console.clear()



if (global.compileSassOnRun) {
	const { exec } = require('child_process')
	
	console.log('* Compiling sass to css')

	exec('sass ./public/sass:./public/css', (err) => {
		console.log('* Done compiling sass')
	})
}




global.randomStr = (length) => {
	var result           = ''
	var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	var charactersLength = characters.length
	for ( var i = 0; i < length; i++ ) {
		 result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}
	return result
}


global.genCookie = (hours) => {
	let cookie = global.randomStr(256)
	let hashedCookie = global.hash(cookie)

	hours = hours || 1

	// cookieen udløber efter 1 timer
	let expireTime = hours*60*60*1000 + Date.now()

	let cookieToStore = {
		'cookie': hashedCookie,
		'expireTime': expireTime
	}

	return {
		realCookie: cookie,
		cookieToStore: cookieToStore
	}
}


global.hash = (str) => {
	const salt = String( crypto.randomBytes(128).toString('base64') )
	const iterations = 10000
	const keylen = 256
	const digest = 'sha512'

	return {
		salt: salt,
		iterations: iterations,
		hash: crypto.pbkdf2Sync(str, salt, iterations, keylen, digest).toString('base64'),
		keylen: keylen,
		digest: digest
	}
}


global.verify = (str, hashObj) => {
	let newHash = crypto.pbkdf2Sync(str, hashObj.salt, hashObj.iterations, hashObj.keylen, hashObj.digest).toString('base64')
	return hashObj.hash == newHash
}