function renderMiniForm(dataForMiniForm) {

  const miniFormWrapper = document.createElement('div');
  miniFormWrapper.classList.add('miniFormWrapper');
  document.body.appendChild(miniFormWrapper);

  const miniFormLibrary = {
    addTimeLog: {
      miniFormMessage: `Enter time worked for new log.`,
      miniFormInput: `
        <label class='numOfMinutes'>
          <span>Minutes</span>
          <input type="number" name="numOfMinutes" min="0" value="30" required autofocus>
        </label>

        <label class='date'>
          <span>Date</span>
          <input type="date" name="date" value=${dataForMiniForm.hasOwnProperty('timeStamp') ? dataForMiniForm.timeStamp.toISOString().slice(0, 10) : '' } required>
        </label>

        <label class='timeStamp'>
          <span>TimeStamp</span>
          <input type="time" name="timeStamp" value=${dataForMiniForm.hasOwnProperty('timeStamp') ? dataForMiniForm.timeStamp.toTimeString().slice(0, 5): '' } required>
        </label>
      `
    },
    confirmDeleteParent: {
      miniFormMessage: `Are you sure you want to delete ${dataForMiniForm.projectData.projectTitle}?`,
    },
    confirmDeleteChildren: {
      miniFormMessage: `You must first delete ${dataForMiniForm.quantityOfChildren} child${dataForMiniForm.quantityOfChildren > 1 ? 'ren' : ''} from ${dataForMiniForm.projectData.projectTitle}.`,
    },
    deleteOrEditTimeLog: {
      miniFormMessage: `Enter updated time or delete log.`,
      miniFormInput: `
        <label class='numOfMinutes'>
          <span>Minutes</span>
          <input type="number" name="numOfMinutes" min="0" value=${dataForMiniForm.hasOwnProperty('originalMinutesLogged') ? dataForMiniForm.originalMinutesLogged : '' } required autofocus>
        </label>

        <label class='date'>
          <span>Date</span>
          <input type="date" name="date" value=${dataForMiniForm.hasOwnProperty('originalDate') ? dataForMiniForm.originalDate.toISOString().slice(0, 10) : '' } required>
        </label>

        <label class='timeStamp'>
          <span>TimeStamp</span>
          <input type="time" name="timeStamp" value=${dataForMiniForm.hasOwnProperty('originalDate') ? dataForMiniForm.originalDate.toTimeString().slice(0, 5): '' } required>
        </label>
      `
    },
    errorInForm: {
      miniFormMessage: 'An error has presented. Press \'x\' to avoid permanent data loss.',
    }
  }

  // Determine whether miniForm is more than simple request confirmation (i.e., a proper form with <input> elems).
  const miniFormHasInputElems = miniFormLibrary[dataForMiniForm.formType].hasOwnProperty('miniFormInput'); 

  // Build out the formView to show users
  miniFormWrapper.innerHTML = `
    <div class='miniForm'>
      <div class='miniFormMessageContainer'>
        <h2 class='miniFormMessage'>${ miniFormLibrary.hasOwnProperty(dataForMiniForm.formType) ? miniFormLibrary[dataForMiniForm.formType].miniFormMessage : miniFormLibrary.errorInForm.miniFormMessage}</h2>
      </div>  
      <div class= 'miniFormInput'>
        ${ miniFormHasInputElems ? miniFormLibrary[dataForMiniForm.formType].miniFormInput : ''}
      </div>
      <div class='miniFormButtons'>
        <i class="fa-solid fa-check confirmMiniFormRequest"></i>
        <i class="fa-solid fa-xmark rejectMiniFormRequest"></i>
      </div>
    </div>
  `

  return addMiniFormListeners(miniFormWrapper);

}

function addMiniFormListeners(miniFormWrapper) {
  return new Promise((resolve, reject) => {
    const confirmBtn = miniFormWrapper.querySelector('.confirmMiniFormRequest');
    const rejectBtn = miniFormWrapper.querySelector('.rejectMiniFormRequest');

    // // Only returns 'true'
    // confirmBtn.addEventListener('click', () => {
    //   miniFormWrapper.remove();
    //   resolve(true);
    // });

    confirmBtn.addEventListener('click', () => {
      const formInputs = miniFormWrapper.querySelectorAll('input');
      const formData = {};

      formInputs.forEach(input => {
        formData[input.name] = input.value;
      });

      miniFormWrapper.remove();
      resolve(formData); 
    });

    rejectBtn.addEventListener('click', () => {
      miniFormWrapper.remove();
      reject(new Error('User rejected the confirmation.'));
    });
  });
}

function requestConfirmation(dataForMiniForm) {
  console.log('requesting confirmation');
  return renderMiniForm(dataForMiniForm);
}