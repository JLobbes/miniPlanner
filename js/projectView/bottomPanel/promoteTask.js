// js/projectView/bottomPanel/promote.js

function createPromoteToProjectBtn(projectData, projectView) {
  
  const promoteBtnWrapper = document.createElement('div');
  promoteBtnWrapper.className = 'promoteBtnWrapper';

  const callToPromote = document.createElement('h3');
  callToPromote.innerText = 'Promote to Project'
  callToPromote.className = 'callToPromote';

  const promoteBtn = document.createElement('button');
  promoteBtn.className = 'promoteBtn';
  promoteBtn.innerHTML = '<i class="fa-solid fa-circle-up"></i>';

  promoteBtnWrapper.appendChild(callToPromote);
  promoteBtnWrapper.appendChild(promoteBtn);

  addPromoteBtnListener(projectData, projectView, promoteBtnWrapper, promoteBtn);

  return promoteBtnWrapper
}

function addPromoteBtnListener(projectData, projectView, promoteBtnWrapper, promoteBtn) {

  promoteBtn.addEventListener('click', () => {
    //Give current project a child
    addProjectToGlobalData(createBlankProject(projectData.uniqueProjectID));
    
    // Re-open as full project
    openProjectView(projectData);
  })

  promoteBtn.addEventListener('mouseover', () => {
    // Darken h3 call to promate above button
    promoteBtnWrapper.firstElementChild.classList.add('darker');
  })
  
  promoteBtn.addEventListener('mouseout', () => {
    // Remove darken h3 call to promate above button
    promoteBtnWrapper.firstElementChild.classList.remove('darker');
  })
}