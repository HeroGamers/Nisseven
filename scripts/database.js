const { log } = console
const { writeFileSync, readFileSync, unlinkSync, readdirSync, existsSync } = require('fs')


// du kan ændre de lokale databaser i config/settings.js

function dbObject(database, path) {
	this.collection = JSON.parse(readFileSync(path))
	this.path = './config/collections/' + database + '.json'

	this.findOne = (secure, id, opt_index) => {
		let index = 0

		for (const user of this.collection) {
			if (user.id.toLowerCase() === id.toLowerCase()) {
				const returableUser = (secure) ? Object.assign({}, user) : user

				if (opt_index) {
					return {
						user: returableUser,
						index: index
					}
				}

				// ellers returnerer den bare brugeren
				return returableUser
			}

			index ++
		}

		return false
	}

	global[database] = {
		length: () => {
			return this.collection.length
		},


		// opt_index sættes til true, hvis man gerne vil vide hvor i 
		// arrayet elementet ligger. F.eks. hvis man vil slette noget
		findOne: (id, opt_index) => {
			return this.findOne(true, id, opt_index)
		},


		collection: () => {
			let obj = Object.assign([], this.collection)
			return obj
		},


		deleteOne: (id, opt_deleteAllAcrossDBs) => {
			id = id.toLowerCase()
			let obj = this.findOne(false, id, true)

			if (obj.user) {
				this.collection.splice(obj.index, 1)
				global[database].saveCollection()

				if (opt_deleteAllAcrossDBs) {
					for (let db of global.databases) {
						if (db !== database) global[db].deleteOne(id)
					}
				}
			}
		},


		insertOne: (id, data) => {
			id = id.toLowerCase()
			if (this.findOne(false, id)) return false

			const newUser = { id: id }

			for (const key in data)
				newUser[key] = data[key]

			this.collection.push(newUser)
			global[database].saveCollection()
		},


		updateOne: (id, updateData, insertMode) => {
			id = id.toLowerCase()
			let foundUser = this.findOne(false, id)
			if (!foundUser) return false // hvis brugeren ikke blev fundet

			let originalCopy = Object.assign({}, foundUser)

			if (insertMode) {
				for (let updateKey in updateData) {
					if (updateKey !== 'id') {
						foundUser[updateKey] = updateData[updateKey]
					}
				}
			} else {
				for (let userKey in foundUser) {
					for (let updateKey in updateData) {
						if (userKey === updateKey && userKey !== 'id') {
							foundUser[updateKey] = updateData[updateKey]
						}
					}
				}
			}

			if (!global[database].saveCollection()) {
				// noget gik galt, og jeg bliver desværre nødt til at rydde op!
				Object.assign(foundUser, originalCopy)
			} else {
				return true
			}
		},


		// gemmer collectionen...
		// hvis secureSave er slået til tjekker den om der er en fejl
		// i JSON objektet. Dog retter den ikke op på fejlen, den lader
		// bare være med at gemme, og returnerer false.
		saveCollection: (opt_secureSave) => {
			// man skal kunne vælge i indstillingerne at alle ændringerne til databasen skal være forsikrede.
			opt_secureSave = (global.forceSecureDBSave) ? true : opt_secureSave

			if (opt_secureSave) {
				// først gemmer jeg til en ny fil, med et tilfældigt navn
				let randomStr = global.randomStr(6)

				let newPath = `./config/collections/${ database }-${ randomStr }.json`

				try {
					// først gemmer jeg, for at tjekke at jeg kan gemme det...
					writeFileSync(newPath, JSON.stringify(this.collection))

					// derefter forsøger jeg at parse det, dette burde give en fejl,
					// hvis der er en fejl i json filen.
					JSON.parse(readFileSync(newPath))

					// og til sidst sletter jeg selvfølgelig den ekstra fil :)
					unlinkSync(newPath)

					writeFileSync(db, JSON.stringify(this.collection, null, 2))
					return true
				} 
				catch (err) {
					// TODO: mulig oprydning
					readdirSync('./config/collections').forEach(file => {
					  if (file.includes(database + '-')) {
					  	unlinkSync('./config/collections/' + file)
					  }
					})

					let errPath = './config/collections/err-' + global.randomStr(4) + '.txt'
					writeFileSync(errPath, String(err))
					log('Noget gik helt galt.. Se: ' + errPath)
					return false
				}
			} 
			else {
				writeFileSync(this.path, JSON.stringify(this.collection, null, 2))
				return true
			}
		}
	}
}


function loadDatabases() {

	for (let database of global.databases) {
		let path = './config/collections/' + database + '.json'

		if (existsSync(path)) {
			// på denne måde er selve collection variablen skjult
			let neverGonnaBeUsedDatabaseObjectAhahahaha = new dbObject(database, path)
		} else {
			writeFileSync(path, JSON.stringify([]))
			loadDatabases()
		}

		if (database === 'users')
			for (let user of global.superAdmins) global[database].insertOne(user, { fullname: (user.charAt(0).toUpperCase() + user.slice(1) + " Admin"), privileges: ['admin'] })
	}
}

loadDatabases()
