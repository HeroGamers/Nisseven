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

updateTime()

// Snow
particlesJS("snow", {
    "particles": {
        "number": {
            "value": 400,
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": "#ffffff"
        },
        "shape": {
            "type": "image",
            "stroke": {
                "width": 3,
                "color": "#fff"
            },
            "polygon": {
                "nb_sides": 5
            },
            "image": {
                "src": "http://www.dynamicdigital.us/wp-content/uploads/2013/02/starburst_white_300_drop_2.png",
                "width": 100,
                "height": 100
            }
        },
        "opacity": {
            "value": 0.7,
            "random": false,
            "anim": {
                "enable": false,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 5,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 20,
                "size_min": 0.1,
                "sync": false
            }
        },
        "line_linked": {
            "enable": false,
            "distance": 50,
            "color": "#ffffff",
            "opacity": 0.6,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 5,
            "direction": "bottom",
            "random": true,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": true,
                "rotateX": 300,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "events": {
            "onhover": {
                "enable": false,
            }
        }
    },
    "retina_detect": true
})