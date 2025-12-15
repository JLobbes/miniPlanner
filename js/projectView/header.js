// js/projectView/header.js

function addProjectActionListeners(projectData, projectView) {
  const deleteBtn = projectView.querySelector('.projectActionsDropDown button[title="Delete"]');
  deleteBtn.addEventListener('click', async (e) => {
    try {
      await triggerDeleteProjectCascade(projectData);
      closeSingleProjectView(projectData, projectView);
    } catch (err) {
      // user canceled or deletion failed — keep view open
      console.log('Deletion canceled or failed:', err.message);
    }
  });

  const editButton = projectView.querySelector('.projectActionsDropDown button[title="Edit"]');
  editButton.addEventListener('click', (e) => {
    enableEditHeader(projectData, projectView); 
  });
  
}

function addProjectPinActionListeners(projectData, projectView) {
  const unPinButton = projectView.querySelector('.projectActionsDropDown .unPinActionBtn');
  unPinButton.addEventListener('click', (e) => {
    unPinButtonProjFromDash(projectData, projectView); 
  });

  const pinButton = projectView.querySelector('.projectActionsDropDown .pinActionBtn');
  pinButton.addEventListener('click', (e) => {
    pinProjectToDash(projectData, projectView); 
  });
}

// Title Bar
function createProjectViewTitleBar({ projectData, projectView, renderAsSingleTask }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'titleBarWrapper';

  const titleTextWrapper = document.createElement('div');
  titleTextWrapper.className = 'titleTextWrapper';

  const projectTitle = document.createElement('h3');
  projectTitle.className = 'projectTitle';
  
  if(!renderAsSingleTask) projectTitle.innerHTML = `<i class="fa-solid fa-folder"></i> ${projectData.projectTitle === null ? 'New Project' : projectData.projectTitle}`;
  if(renderAsSingleTask) projectTitle.innerHTML = `<i class="fa-solid fa-rectangle-list"></i> ${projectData.projectTitle === null ? 'New Task' : projectData.projectTitle}`;

  const projectDescription = document.createElement('div');
  projectDescription.className = 'projectDescription';
  projectDescription.textContent = projectData.projectDescription;

  titleTextWrapper.appendChild(projectTitle);
  titleTextWrapper.appendChild(projectDescription);

  wrapper.appendChild(titleTextWrapper);
  if(projectData.parentProjectID === null) {

    // Top level projects shouldn't have pin or unpin action buttons
    wrapper.appendChild(createProjectActions({ deleteAction: true, pinAction: false, unPinAction: false, editAction: true }))

  } else if(projectData.hasOwnProperty('pinToDash')) {

    // Projects that have pinned or unpinned have pinToDash property. 
    projectData.pinToDash ? 
      wrapper.appendChild(createProjectActions({ deleteAction: true, pinAction: false, unPinAction: true, editAction: true })) :
      wrapper.appendChild(createProjectActions({ deleteAction: true, pinAction: true, unPinAction: false, editAction: true }))
    ;

  } else {

    //Child projects without 'pinToDash' property are rendered with pinActionBtn visible.
    wrapper.appendChild(createProjectActions({ deleteAction: true, pinAction: true, unPinAction: false, editAction: true }))
  }

  return wrapper;
}

// Ellipsis action menu 
function createProjectActions({ deleteAction = true, pinAction = false, unPinAction = false, editAction = false }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'projectActionsWrapper';

  wrapper.innerHTML = `
    <div class="projectActions">
      <span>...</span>
      <div class="projectActionsDropDown">
        ${ deleteAction ? '<button class="deleteActionBtn" title="Delete"><i class="fa-solid fa-trash"></i></button>' : '' }
        ${ pinAction ?  `
                          <button class="pinActionBtn" title="Pin to Dashboard"><i class="fa-solid fa-thumbtack"></i></button>
                          <button class="unPinActionBtn" title="Un-pin from Dash" style="display:none"><i class="fa-solid fa-thumbtack"></i></button>
                        ` : '' }
        ${ unPinAction ?  `
                          <button class="pinActionBtn" title="Pin to Dashboard" style="display:none"><i class="fa-solid fa-thumbtack"></i></button>
                          <button class="unPinActionBtn" title="Un-pin from Dash" ><i class="fa-solid fa-thumbtack"></i></button>
                        ` : '' }
        ${ editAction ? '<button class="editActionBtn" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>' : '' }
      </div>
    </div>
  `;

  return wrapper;
}

function enableEditHeader(projectData, projectView) {

  // Replace header with editible mini-form
  const projectTitle = projectView.querySelector('.projectTitle');
  projectTitle.innerHTML = 
    `
      <i class="fa-solid fa-pen-to-square"></i>
      <input type="text" class="editingProjectTitle" name="editingProjectTitle" value="${projectData.projectTitle ? projectData.projectTitle : ''}" />
      <i class="fa-solid fa-check saveEditingProjectTitleBarBtn"></i>
      <i class="fa-solid fa-xmark abortEditingProjectTitleBarBtn"></i>
    `;
  const projectTitleInput = projectTitle.querySelector('.editingProjectTitle');  
  projectTitleInput.select();  
  
  const projectDescription = projectView.querySelector('.projectDescription');
  projectDescription.innerHTML = 
  `
  <input type="text" class="editingProjectDescription" name="editingProjectDescription" value="${projectData.projectDescription}" />
  `;
  const projectDescriptionInput = projectDescription.querySelector('.editingProjectDescription');  
 
  // Add listener to saveEditingProjectTitleBarBtn
  const saveEditingProjectTitleBarBtn = projectTitle.querySelector('.saveEditingProjectTitleBarBtn');
  const abortEditingProjectTitleBarBtn = projectTitle.querySelector('.abortEditingProjectTitleBarBtn');
  
  const enterHandler = addEditingHeaderEnterPressListener(saveEditingProjectTitleBarBtn);
  const escapeHandler = addEditingHeaderEscapePressListener(abortEditingProjectTitleBarBtn);
  
  // Add listener to abortEditingProjectTitleBarBtn 
  
  saveEditingProjectTitleBarBtn.addEventListener('click', () => {
    handleSaveEditingProjectTitleBar(projectView, projectData, projectTitle, projectTitleInput, projectDescription, projectDescriptionInput);
    clearEditingHeaderKeyPressListeners(escapeHandler, enterHandler);
  });
  abortEditingProjectTitleBarBtn.addEventListener('click', () => {
    handleAbortEditingProjectTitleBar(projectData, projectTitle, projectDescription);
    clearEditingHeaderKeyPressListeners(escapeHandler, enterHandler);
  });
}

function addEditingHeaderEscapePressListener(abortEditingProjectTitleBarBtn) {
  const escapeHandler = (e) => {
    if(e.key === 'Escape') {
      abortEditingProjectTitleBarBtn.click();
    }
  }  

  document.addEventListener('keydown', escapeHandler);
  return escapeHandler;
}

function addEditingHeaderEnterPressListener(saveEditingProjectTitleBarBtn) {
  const enterHandler = (e) => {
    if(e.key === 'Enter') {
      saveEditingProjectTitleBarBtn.click();
    }
  }  

  document.addEventListener('keydown', enterHandler);
  return enterHandler;
}

function clearEditingHeaderKeyPressListener(escapeHandler, enterHandler) {
  document.removeEventListener('keydown', escapeHandler);
  document.removeEventListener('keydown', enterHandler);
}

function handleSaveEditingProjectTitleBar(projectView, projectData, projectTitle, projectTitleInput, projectDescription, projectDescriptionInput) {
  try {
    // Change title & description in globalProjectData
    projectData.projectTitle = projectTitleInput.value;
    projectData.projectDescription = projectDescriptionInput.value;
    syncProjectInGlobalData(projectData);
    
    // Change visible title & description in projectView
    projectTitle.innerHTML = `
    <i class="fa-solid fa-folder"></i> ${projectData.projectTitle}
    `;
    const escHandler = addEditingHeaderEscapePressListener()
    
    projectDescription.innerHTML = `
        ${projectData.projectDescription}
    `
    // Update title & description throughout project view
    reRenderNotesAndTimeLogs(projectView, projectData);
    
    // Update title & description for tiles on dashboard
    renderProjectsToDash();

  } catch (error) {
    console.error('Updated titleBar not saved. Encountered issue.');
    return;
  }
  console.log('Saved edited title bar!');

  // TO-DO: @14:44 10.14(WED), Need to rename titleBarWrapper to projectViewHeader or sth. Current name TitleBar is wordy? 
}
 
function handleAbortEditingProjectTitleBar(projectData, projectTitle, projectDescription) {
  try {
    // Revert visible title & description in projectView
    projectTitle.innerHTML = `
    <i class="fa-solid fa-folder"></i> ${projectData.projectTitle}
    `;
    
    projectDescription.innerHTML = `
        ${projectData.projectDescription}
    `;
  } catch (error) {
    console.error('Update titleBar not cancelled correctly. Encountered issue.');
    return;
  }
  console.log('Cancelled edit of title bar!');

  // TO-DO: @14:44 10.14(WED), Need to rename titleBarWrapper to projectViewHeader or sth. Current name TitleBar is wordy? 
}

function pinProjectToDash(projectData, projectView) {
  // reRender projectAction show it shows the unpinned icon
  showUnPinActionBtn(projectView);
  setProjectPinned(projectData, true);
}

function unPinButtonProjFromDash(projectData, projectView) {
  // reRender projectAction show it shows the unpinned icon
  showPinActionBtn(projectView);
  setProjectPinned(projectData, false);
}

function showPinActionBtn(projectView) {
  
  pinBtn = projectView.querySelector('.pinActionBtn');
  pinBtn.style.display = ''; // Show

  unPinBtn = projectView.querySelector('.unPinActionBtn');
  unPinBtn.style.display = 'none';
}

function showUnPinActionBtn(projectView) {

  unPinBtn = projectView.querySelector('.unPinActionBtn');
  unPinBtn.style.display = ''; // Show
  
  pinBtn = projectView.querySelector('.pinActionBtn');
  pinBtn.style.display = 'none';
}