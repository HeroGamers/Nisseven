const { log, clear } = console

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')

const http = require('http')
const https = require('https')
const fs = require('fs')

// credentials
var privateKey  = fs.readFileSync('./config/sslcert/privatekey.pem', 'utf8')
var certificate = fs.readFileSync('./config/sslcert/origin.pem', 'utf8')
var credentials = {key: privateKey, cert: certificate}

global.app = express()
global.app.use(bodyParser.urlencoded({ extended: false }))
global.app.use(bodyParser.json())
global.app.use(cookieParser())
global.app.use(helmet())


global.app.set('view engine', 'pug')

// offentlige filer
global.app.use(express.static('public'))
global.app.use('/bootstrap-dist', express.static('./node_modules/bootstrap/dist'))

let server

if (global.useHttps) {
	server = https.createServer(credentials, global.app)
} else {
	server = http.createServer(global.app)
}



const requestValidator = require('../routes/requestValidator')
const authRoute = require('../routes/auth')
const profileControlRoute = require('../routes/profileControl')

global.app.use(requestValidator)
global.app.use('/auth', authRoute)
global.app.use('/api', profileControlRoute)


let port = (global.useHttps) ? global.https_port : global.http_port
let type = (global.useHttps) ? 'HTTPS' : 'HTTP'

server.listen(port, () => {
	if (global.msgOnServerStart)
		log(`${ type } on PORT: ${ port } \nMSG: ${ global.msgOnServerStart }`)
})