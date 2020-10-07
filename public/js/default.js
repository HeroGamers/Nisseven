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

function updateTime() {
    // get correct date from settings in db
    let date = "Dec 1"
    goFetch('/api/getNissevenDate', {}, (res, data) => {
        if (res) {
            date = data
        }
        else {
            alert(data)
        }

        // get the nisseven date
        let today = new Date()
        let year = String(today.getFullYear())
        let nissevenDate = new Date(date + '/' + year + ' 12:00:00 AM')

        // Update the count down every 1 second
        let counterInterval = setInterval(function() {
            // Get today's date and time
            let now = new Date().getTime()
            let difference = nissevenDate.getTime() - now

            // Time calculations for days, hours, minutes and seconds
            let days = Math.floor(difference / (1000 * 60 * 60 * 24))
            let hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            let seconds = Math.floor((difference % (1000 * 60)) / 1000)

            // show time
            document.getElementById("time").innerHTML = days + " Dage, " + hours + " Timer, "
                + minutes + " Minutter og " + seconds + " Sekunder"

            // stop countdown if it has reached 0
            if (difference < 0) {
                clearInterval(counterInterval)
                document.getElementById("time").innerHTML = "0 Dage, 0 Timer, 0 Minutter og 0 Sekunder<br>Log ind igen for at få tildelt din Nisseven!"
            }
        }, 1000)
    })
}
window.onload = () => {

    if (document.getElementById('renameBtn')) {
        document.getElementById('renameBtn').addEventListener('click', () => {
            log('click')
            goFetch('/auth/kRename', { rename: document.getElementById('renameInput').value }, (result, data) => {
                if (!result) {
                    log(data)
                } else {
                    // Alt er godt!
                    document.getElementById('renameInput').placeholder = document.getElementById('renameInput').value
                    document.getElementById('renameInput').value = ''
                    window.location.reload()
                }
            })
        })
    }


    if (document.getElementById("time")) updateTime()
}