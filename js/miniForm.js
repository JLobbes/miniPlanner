function renderMiniForm(projectData, miniFormData) {
  // const miniFormData = { ...miniFormData };

  const miniFormWrapper = document.createElement('div');
  miniFormWrapper.classList.add('miniFormWrapper');
  document.body.appendChild(miniFormWrapper);

  miniFormWrapper.innerHTML = `
    <div class='miniForm'>
      <div class='miniFormMessageContainer'>
        <h2 class='miniFormMessage'>Are you sure you want to delete this?</h2>
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

function requestConfirmation() {
  console.log('requesting confirmation');
  return renderMiniForm();
}

// try {
//   const hasMiniForm = miniFormWrapper.querySelector('.miniForm');
//   console.log('hasMiniForm', hasMiniForm);
// } catch (error) {
//   console.log('miniForm not captured in query of miniFormWrapper');
// }