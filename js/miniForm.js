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
    addNoteLog: {
      miniFormMessage: `Enter note for new log.`,
      miniFormInput: `
        <label class='note'>
          <span>Note</span>
          <textarea name="note" rows="3" placeholder="Enter your note" required autofocus></textarea>
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
    collectDownloadTitle: {
      miniFormMessage: `Name your download file.`,
      miniFormInput: `
        <label class='downloadTitle'>
          <input type name="downloadTitle" value="${dataForMiniForm.hasOwnProperty('dateForDownload') ? `miniPlannerData_${dataForMiniForm.dateForDownload}` : 'miniFormData'}" required autofocus></textarea>
        </label>
      `
    },
    confirmDeleteChildren: {
      miniFormMessage: `You must first delete ${dataForMiniForm.quantityOfChildren} child${dataForMiniForm.quantityOfChildren > 1 ? 'ren' : ''} from ${dataForMiniForm.hasOwnProperty('projectData') ? dataForMiniForm.projectData.projectTitle : ''}.`,
    },
    confirmDeleteParent: {
      miniFormMessage: `Are you sure you want to delete ${dataForMiniForm.hasOwnProperty('projectData') ? dataForMiniForm.projectData.projectTitle : ''}?`,
    },
    confirmDeleteNoteLogEntry: {
      miniFormMessage: `Are you sure you want to delete note?`,
    },
    confirmDeleteTimeLogEntry: {
      miniFormMessage: `Are you sure you want to delete logged time?`,
    },
    editTimeLogEntry: {
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
    editNoteLog: {
      miniFormMessage: `Enter updated note log.`,
      miniFormInput: `
        <label class='note'>
          <span>Note</span>
          <textarea name="note" rows="3" placeholder="Enter your note" required autofocus>${dataForMiniForm.hasOwnProperty('originalNoteLogged') ? dataForMiniForm.originalNoteLogged : '' }</textarea>
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

    confirmBtn.addEventListener('click', () => {
      const formInputs = miniFormWrapper.querySelectorAll('input, textarea');
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