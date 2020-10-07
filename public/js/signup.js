window.onload = () => {
    const nextBtn = document.querySelector('#nextBtn')
    const backBtn = document.querySelector('#backBtn')
    
    const firstPage = document.querySelector('#box-username')

    let page = 0
    let pages = 3

    nextBtn.addEventListener('click', (event) => {
        if (page < pages) {
            page ++
        } else {
            // tilmeld
            const data = {
                username: document.querySelector('#username').value,

                firstname: document.querySelector('#firstname').value,
                lastname: document.querySelector('#lastname').value,

                password: document.querySelector('#password').value,
                
                createNew: false,
                selfParticipate: true
            }

            if (document.querySelector('#inviteLink').innerHTML > 0)
                data.inviteLink = document.querySelector('#inviteLink').innerHTML

            let lengths = [ 5, 3, 1, 8, 0 ]
            let z = 0

            try {
                for (const key in data) {

                    if (data[key].length < lengths[z]) throw z

                    z++
                }
            } catch (dest) {
                if (dest >= 2) dest --
                page = dest
                updateSlide()
                return
            }

            data.fullname = capitalize(data.firstname) + ' ' + capitalize(data.lastname)

            toggleBtn('Tilmelder...')

            goFetch('/auth/signup', data, (result, data) => {
                toggleBtn('Tilmeld!')
                nextBtn.querySelectorAll('span')[1].innerHTML = 'Tilmeld!'
                if (!result) {
                    if (data === 'user already exists!') {
                        checkInput(document.querySelector('#username'), null, true)
                        page = 0
                        updateSlide()
                    }
                } else {
                    // Alt er godt!
                    window.location.href = '/'
                }
            })
            
        }

        backBtn.classList.remove('disabled')

        updateSlide()
    })

    backBtn.addEventListener('click', (event) => {
        if (page > 0) {
            nextBtn.querySelectorAll('span')[1].innerHTML = 'Næste'
            page --
            if (page === 0)
                backBtn.classList.add('disabled')
        }

        updateSlide()
    })

    // så man kan trykke enter når man laver en konto, for at gå til næste side.
    document.addEventListener("keyup", (event) => {
        if (event.key == "Enter") document.getElementById("nextBtn").click()
    })

    updateSlide = () => {
        nextBtn.querySelectorAll('span')[1].innerHTML = (page === pages) ? 'Tilmeld!' : 'Næste'

        firstPage.style['margin-left'] = String(Number(-280 * page) + 'px')
    }
}
