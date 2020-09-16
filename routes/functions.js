const { log } = console
var express = require('express')
var router = express.Router()

// api/x

const pathsToCheck = ['/decodeString', '/getNissevenDate']


router.post('*', (req, res, next) => {
    if (!pathsToCheck.includes(req.url)) {
        next()
        return
    }


    switch (req.url) {
        case '/decodeString':
            try {
                string = global.decryptStr(req.body.str, req.body.pword)
            }
            catch(err) {
                res.send({res: false, err: "Bad Decrypt - Check your password!"})
                break
            }
            res.send({res: true, body: string})
            break

        case '/getNissevenDate':
            try {
                date = global.assignDate
            }
            catch(err) {
                res.send({res: false, err: err})
                break
            }
            res.send({res: true, body: date})
            break
    }
})


module.exports = router