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
        targetID: document.querySelector('input[type=username]').value,
        fullname: document.querySelector('input[type=fullname]').value
      }

      goFetch('/api/newUser', data, (result, data) => {
        if (!result) {
          toggleBtn()

          alert(data)

        } else {
          // Alt er godt!
          toggleBtn()
          window.location.reload()
        }
      })
    }
  })
}
