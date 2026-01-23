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
          <input tabIndex="5" type="number" name="numOfMinutes" min="0" value="30" required autofocus>
        </label>

        <label class='date'>
          <span>Date</span>
          <input tabIndex="5" type="date" name="date" value=${dataForMiniForm.hasOwnProperty('timeStamp') ? dataForMiniForm.timeStamp.toISOString().slice(0, 10) : '' } required>
        </label>

        <label class='timeStamp'>
          <span>TimeStamp</span>
          <input tabIndex="5" type="time" name="timeStamp" value=${dataForMiniForm.hasOwnProperty('timeStamp') ? dataForMiniForm.timeStamp.toTimeString().slice(0, 5): '' } required>
        </label>
      `
    },
    addNoteLog: {
      miniFormMessage: `Enter note for new log.`,
      miniFormInput: `
        <label class='note'>
          <span>Note</span>
          <textarea tabIndex="6" name="note" rows="3" placeholder="Enter your note" required autofocus></textarea>
        </label>

        <label class='date'>
          <span>Date</span>
          <input tabIndex="6" type="date" name="date" value=${dataForMiniForm.hasOwnProperty('timeStamp') ? dataForMiniForm.timeStamp.toISOString().slice(0, 10) : '' } required>
        </label>

        <label class='timeStamp'>
          <span>TimeStamp</span>
          <input tabIndex="6" type="time" name="timeStamp" value=${dataForMiniForm.hasOwnProperty('timeStamp') ? dataForMiniForm.timeStamp.toTimeString().slice(0, 5): '' } required>
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
    collectDuplicateProjectTitle: {
      miniFormMessage: `Name your new copy of <br><span class="miniFormProjectTitle">${escapeHTML((dataForMiniForm.projectTitle) ? `${dataForMiniForm.projectTitle}` : 'this project')}</span>.`,
      miniFormInput: `
        <label class='downloadTitle'>
          <input type name="duplicatedProjectTitle" value="${escapeHTML((dataForMiniForm.projectTitle) ? `(copy) ${dataForMiniForm.projectTitle}` : '(copy) Untitled')}" required autofocus></textarea>
        </label>
      `
    },
    confirmDeleteChildren: {
      miniFormMessage: `You must first delete (${dataForMiniForm.quantityOfChildren}) child${dataForMiniForm.quantityOfChildren > 1 ? 'ren' : ''} from ${dataForMiniForm.hasOwnProperty('projectData') && dataForMiniForm.projectData.projectTitle ? dataForMiniForm.projectData.projectTitle : 'this project.'}`,
    },
    confirmDeleteParent: {
      miniFormMessage: `Are you sure you want to delete ${dataForMiniForm.hasOwnProperty('projectData') && dataForMiniForm.projectData.projectTitle ? dataForMiniForm.projectData.projectTitle : 'this'}?`,
    },
    confirmDeleteNoteLogEntry: {
      miniFormMessage: `Are you sure you want to delete note?`,
    },
    confirmDeleteTimeLogEntry: {
      miniFormMessage: `Are you sure you want to delete logged time?`,
    },
    confirmDuplicateChildren: {
      miniFormMessage: `
        Would you like to duplicated the ${dataForMiniForm.quantityOfChildren}) child${dataForMiniForm.quantityOfChildren > 1 ? 'ren' : ''} nested in 
        <span class="miniFormProjectTitle">${escapeHTML((dataForMiniForm.projectTitle) ? `${dataForMiniForm.projectTitle}` : 'this project.')}</span> 
        Press enter to proceed.
      `
    },
    confirmMoveChild: {
      miniFormMessage: `
        This will move 
        <span class="miniFormProjectTitle">${escapeHTML((dataForMiniForm.childData) ? `${dataForMiniForm.childData.projectTitle}` : '')}</span> 
        to 
        <span class="miniFormProjectTitle">${escapeHTML((dataForMiniForm.parentData) ? `${dataForMiniForm.parentData.projectTitle}` : '')}</span>.
        Press enter to proceed.
      `,
    },
    confirmUploadData: {
      miniFormMessage: `⚠️<br><br>
        Uploading overwrites your current data.<br><br>
        Would you like to proceed?`,
    },
    editTimeLogEntry: {
      miniFormMessage: `Enter updated time or delete log.`,
      miniFormInput: `
        <label class='numOfMinutes'>
          <span>Minutes</span>
          <input tabIndex="5" type="number" name="numOfMinutes" min="0" value=${dataForMiniForm.hasOwnProperty('originalMinutesLogged') ? dataForMiniForm.originalMinutesLogged : '' } required autofocus>
        </label>

        <label class='date'>
          <span>Date</span>
          <input tabIndex="5" type="date" name="date" value=${dataForMiniForm.hasOwnProperty('originalDate') ? dataForMiniForm.originalDate.toISOString().slice(0, 10) : '' } required>
        </label>

        <label class='timeStamp'>
          <span>TimeStamp</span>
          <input tabIndex="5" type="time" name="timeStamp" value=${dataForMiniForm.hasOwnProperty('originalDate') ? dataForMiniForm.originalDate.toTimeString().slice(0, 5): '' } required>
        </label>
      `
    },
    editNoteLog: {
      miniFormMessage: `Enter updated note log.`,
      miniFormInput: `
        <label class='note'>
          <span>Note</span>
          <textarea tabIndex="6" name="note" rows="3" placeholder="Enter your note" required autofocus>${dataForMiniForm.hasOwnProperty('originalNoteLogged') ? dataForMiniForm.originalNoteLogged : '' }</textarea>
        </label>

        <label class='date'>
          <span>Date</span>
          <input tabIndex="6" type="date" name="date" value=${dataForMiniForm.hasOwnProperty('originalDate') ? dataForMiniForm.originalDate.toISOString().slice(0, 10) : '' } required>
        </label>

        <label class='timeStamp'>
          <span>TimeStamp</span>
          <input tabIndex="6" type="time" name="timeStamp" value=${dataForMiniForm.hasOwnProperty('originalDate') ? dataForMiniForm.originalDate.toTimeString().slice(0, 5): '' } required>
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
    const rejectBtn  = miniFormWrapper.querySelector('.rejectMiniFormRequest');

    confirmBtn.addEventListener('click', () => {
      const formInputs = miniFormWrapper.querySelectorAll('input, textarea');
      const formData = {};

      formInputs.forEach(input => formData[input.name] = input.value);

      clearMiniFormKeyPressListeners();
      miniFormWrapper.remove();
      resolve(formData);
    });
    addMiniFormEnterPressListener(confirmBtn);


    rejectBtn.addEventListener('click', () => {
      clearMiniFormKeyPressListeners();
      miniFormWrapper.remove();
      reject(new Error('User rejected the confirmation.'));
    });
    addMiniFormEscapePressListener(rejectBtn);

  });
}

function addMiniFormEscapePressListener(rejectBtn) {

  globalListeners.esc = () => rejectBtn.click();
}

function addMiniFormEnterPressListener(confirmBtn) {

  globalListeners.enter = (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      confirmBtn.click();
    } 
  }
}

function clearMiniFormKeyPressListeners() {

  globalListeners.enter = null;
  // Change escape press back to close project view.
  const openSearchView = document.querySelector('.searchProjectTreeView');
  if(openSearchView) globalListeners.esc = () => closeSearchProjectTreeView(openSearchView);
  
  const projectViewOpen = document.querySelector('.projectView');
  if(projectViewOpen) globalListeners.esc = () => closeAllProjectViews({});
}

function requestConfirmation(dataForMiniForm) {
  console.log('requesting confirmation');
  return renderMiniForm(dataForMiniForm);
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[m]));
}