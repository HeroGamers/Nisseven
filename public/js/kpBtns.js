function adminCommands(route, id, opt_psw) {
	goFetch(route, { 
		password: String(opt_psw), 
		targetID: id, 
		prompt_psw: true
	}, (res, data) => {
		if (res) {
			window.location.reload()
		}
		else {
			if (data === 'prompt password') {
				let new_psw = prompt('Serveren kræver at du skriver din adgangskode')
				if (new_psw)
					adminCommands(route, id, new_psw)
			} else {
				alert(data)
			}
		}
	})
}
