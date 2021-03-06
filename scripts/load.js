const { readFileSync, writeFileSync, unlinkSync, mkdirSync, existsSync } = require('fs')
const crypto = require('crypto')

// disse indstillinger bør ikke ændres på...
// btw selve settings.json er meget streng! Ryk rundt på det mindste og den nulstiller automatisk
const defaultSettings = {
    https_port: 443,
    http_port: 80,
    useHttps: false,
    forceSecureDBSave: false,
    prettyPrint: true,
    compileSassOnRun: false,
    clearOnRun: true,
    msgOnServerStart: false, // du kan eventuelt skrive beskeden her :)
    databases: ['users', 'klasser'],
    assignDate: "12/01", // month/date
    superAdmins: ['rasmus', 'marcus'],
    iv: String(crypto.randomBytes(16).toString('base64')),
    salt: String(crypto.randomBytes(128).toString('base64'))
}


let defaultSettingsLength = 0
let defaultSettingsKey = []
for (let key in defaultSettings) {
    defaultSettingsLength ++
    defaultSettingsKey.push(key)
}


const settingsPath = './config/settings.json'




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
            if (defaultSettingsKey[iterations] !== key) throw 'reset'
            global[key] = settings[key]

            iterations ++
        }

        if (iterations !== defaultSettingsLength) throw 'reset'
    }
    catch (err) {

        if (err === 'reset') {
            console.log('settings.json blev nulstillet...')
            unlinkSync(settingsPath)
        }

        writeFileSync('./config/settings.json', JSON.stringify(defaultSettings, null, 2))

        loadSettings()
    }
}

loadSettings()
if (global.clearOnRun) console.clear()



if (global.compileSassOnRun || !existsSync("./public/css")) {
    const { exec } = require('child_process')

    console.log('* Compiling sass to css')

    exec('sass ./public/sass:./public/css', (err) => {
        if (err) {
            if (!err.toString().includes("Undefined variable.")) {
                console.log('* Failure compiling sass! - ' + err)
            }
            else {
                console.log('* Done compiling sass')
            }
        }
        else {
            console.log('* Done compiling sass')
        }
    })
}

global.encryptStr = (str, pword) => {
    let key = crypto.scryptSync(pword, 'salt', 32)
    let cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.from(global.iv, 'base64'))
    let encrypted = cipher.update(str)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return encrypted.toString('hex')
}

global.decryptStr = (str, pword) => {
    let key = crypto.scryptSync(pword, 'salt', 32)
    let encryptedText = Buffer.from(str, 'hex')
    let decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(global.iv, 'base64'))
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
}

// default indstillinger, det burde være fint :)))
const iterations = 10000
const keylen = 256
const digest = 'sha512'

global.verify = (str, hash) => {
    let newHash = crypto.pbkdf2Sync(str, global.salt, iterations, keylen, digest).toString('base64')
    return hash === newHash
}

global.hash = (str) => {
    const salt = global.salt
    
    return crypto.pbkdf2Sync(str, salt, iterations, keylen, digest).toString('base64')
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

    // cookieen udløber efter x timer
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
