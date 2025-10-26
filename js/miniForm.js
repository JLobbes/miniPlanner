function renderMiniForm(dataForMiniForm) {
  console.log('dataForMiniForm:', dataForMiniForm);

  const miniFormWrapper = document.createElement('div');
  miniFormWrapper.classList.add('miniFormWrapper');
  document.body.appendChild(miniFormWrapper);

  const miniFormLibrary = {
    confirmDeleteParent: {
      miniFormMessage: `Are you sure you want to delete ${dataForMiniForm.projectData.projectTitle}?`,
    },
    confirmDeleteChildren: {
      miniFormMessage: `You must first delete ${dataForMiniForm.quantityOfChildren} child${dataForMiniForm.quantityOfChildren > 1 ? 'ren' : ''} from ${dataForMiniForm.projectData.projectTitle}.`,
    },
    errorInForm: {
      miniFormMessage: 'An error has presented. Press \'x\' to avoid permanent data loss.',
    }
  }

  miniFormWrapper.innerHTML = `
    <div class='miniForm'>
      <div class='miniFormMessageContainer'>
        <h2 class='miniFormMessage'>${ miniFormLibrary.hasOwnProperty(dataForMiniForm.formType) ? miniFormLibrary[dataForMiniForm.formType].miniFormMessage : miniFormLibrary.errorInForm.miniFormMessage}</h2>
      </div>  
      <div class= 'miniFormInput'>

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
      miniFormWrapper.remove();
      resolve(true);
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

// try {
//   const hasMiniForm = miniFormWrapper.querySelector('.miniForm');
//   console.log('hasMiniForm', hasMiniForm);
// } catch (error) {
//   console.log('miniForm not captured in query of miniFormWrapper');
// }