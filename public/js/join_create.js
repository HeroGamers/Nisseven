function join() {
    let data = {
        inviteLink: prompt('Skriv en invite kode')
    }
    

    goFetch('/auth/joinWithLink', data, (res, info) => {
        if (res) {
            window.location.reload()
        }
        else {
            alert(info)
        }
    })
}

function create() {
    goFetch('/auth/createKlasse', { __nnd__: 'null' }, (res, info) => {
        if (res) {
            window.location.reload()
        }
        else {
            alert(info)
        }
    })
}