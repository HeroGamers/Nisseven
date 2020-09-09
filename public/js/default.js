function showNisseven() {
    let psw = prompt('Serveren kræver at du skriver din adgangskode')
    let revealer = document.getElementById("nisseven")
    let button = document.getElementById("decryptbutton")
    let nisseven = revealer.textContent

    goFetch('/api/decodeString', {
        str: nisseven,
        pword: psw
    }, (res, data) => {
        if (res) {
            revealer.textContent = data
            button.remove()
        }
        else {
            alert(data)
        }
    })




}