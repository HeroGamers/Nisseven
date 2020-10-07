window.onload = () => {
  const btn = document.querySelector('button[type=submit]')
  let inputFields = document.querySelectorAll('input')

  for (let input of inputFields) {
  	input.addEventListener('keyup', (event) => {
  		if (event.key === 'Enter') btn.click()
  	})
  }


  btn.addEventListener('click', (event) => {
    

    let amount = 0

    for (let input of inputFields) {
      amount += Number(checkInput(input, event))

      // jeg tilføjer en event listener, så man kan se at det man
      // har skrevet er korrekt... Det opdaterer i realtid.
      // Jeg tilføjer kun en eventlistener én gang!
      if (!input.classList.contains('n-was-validated')) {
        input.classList.add('n-was-validated')

        input.addEventListener('keyup', () => {
          checkInput(input)
        })
      }
    }

    if (amount === inputFields.length) {
      toggleBtn()

      let data = {
        username: document.querySelector('input[type=username]').value,
        password: document.querySelector('input[type=password]').value
      }

      goFetch('/auth/login', data, (result, data) => {
        if (!result) {
          toggleBtn()

          if (data === 'psw matcher ikke' || data === 'ikke med i klassen') {
            const pswField = document.querySelector('input[type=password]')
            checkInput(pswField, null, true)
          }

          if (data === 'ikke med i klassen') {
            const usrField = document.querySelector('input[type=username]')
            checkInput(usrField, null, true)
          }
        } else {
          // Alt er godt!
          toggleBtn()
          window.location.href = '/'
        }
      })
    }
  })
}
