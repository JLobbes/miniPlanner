// js/projectView/header.js

function addProjectActionListeners(wrapper, projectData, projectView) {
  const deleteBtn = wrapper.querySelector('.projectActionsDropDown button[title="Delete"]');
  deleteBtn.addEventListener('click', async (e) => {

    const success = await triggerDeleteProjectCascade(projectData);

    if (success) {
      const searchProjectTreeViewOpen = document.querySelector('.searchProjectTreeView');
      if (searchProjectTreeViewOpen) {
        const parentNodeID = projectData.parentProjectID;
        reRenderProjecTreeViewportToNode(parentNodeID);
        closeSingleProjectView(projectData, projectView);
      } else {

        closeSingleProjectView(projectData, projectView);
      }
    } else {
      console.log(`Deletion of ${projectData.projectTitle} cancelled by user.`);
    }
  });

  const focusNodeAction = wrapper.querySelector('.projectActionsDropDown button.focusNodeAction');
  focusNodeAction.addEventListener('click', (e) => {

    const projectTreeViewOpened = document.querySelector('.searchProjectTreeView');
    if(projectTreeViewOpened) {
      const targetNode = document.querySelector(`.projectTreeNode.${projectData.uniqueProjectID}`);
      focusOnNode(targetNode);
      
    } else {
      openSearchProjectTreeView(projectData.uniqueProjectID);
    }
  });

  const editButton = wrapper.querySelector('.projectActionsDropDown button[title="Edit"]');
  editButton.addEventListener('click', (e) => {
    enableEditHeader(projectData, projectView); 
  });

  const pinButton = wrapper.querySelector('.projectActionsDropDown button.pinActionBtn');
  if(pinButton) {
    pinButton.addEventListener('click', (e) => {
      handlePinClick(pinButton, projectData);
    });
  }

  globalListeners.ctrlE = () => editButton.click();
}

function handlePinClick(pinButton, projectData) {

  if(projectData.hasOwnProperty('pinToDash') && projectData.pinToDash) {

    updateCrossedGlobally(projectData);
    setProjectPinned(projectData, false);

    

  } else {
    updateCrossedGlobally(projectData);
    setProjectPinned(projectData, true);
  }

  function updateCrossedGlobally(projectData) {

    // Updated projectViews
    const openProject = document.querySelector('.projectView');
    if(openProject) {
      const hasSameProjectID = Boolean(openProject.getAttribute('projectID') === projectData.uniqueProjectID);
      if (hasSameProjectID) {
        const pinActionBtn = openProject.querySelector('.projectActionsDropDown .pinActionBtn');
        pinActionBtn.classList.toggle('crossed');
      } 
    }

    // Updated projectTile PopUps
    const openTilePopUps = document.querySelectorAll('.projectTilePopUp');
    if(openTilePopUps) {
      openTilePopUps.forEach(popUp => {
        const projectTile = popUp.querySelector('.projectTile');
        const hasSameProjectID = Boolean(popUp.getAttribute('ID') === `popup-${projectData.uniqueProjectID}`);
        if (hasSameProjectID) {
          const pinActionBtn = projectTile.querySelector('.projectActionsDropDown .pinActionBtn');
          pinActionBtn.classList.toggle('crossed');
        } 
      });
    }

    // projectTiles on dashboard don't require above logic because dashboard gets 
    // fresh reRender on close of projView or projTreeView.
  }
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
    wrapper.appendChild(createProjectActions({ deleteAction: true, pinAction: false, editAction: true, focusNodeAction: true, projectData, projectView }))

  } else {

    wrapper.appendChild(createProjectActions({ deleteAction: true, pinAction: true, editAction: true, focusNodeAction: true, projectData, projectView }));
  }

  return wrapper;
}

// Ellipsis action menu 
function createProjectActions({ deleteAction = true, duplicateAction = false, pinAction = false, editAction = false, tapeAction = false, focusNodeAction = false, projectData, projectView }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'projectActionsWrapper';

  wrapper.innerHTML = `
    <div class="projectActions">
      <span>...</span>
      <div class="projectActionsDropDown">
        ${ deleteAction ? '<button class="deleteActionBtn" title="Delete"><i class="fa-solid fa-trash"></i></button>' : '' }
        ${ duplicateAction ?  `<button class="duplicateActionBtn" title="Duplicate Project"><i class="fa-solid fa-clone"></i></button>` : '' }
        ${ pinAction ?  ` <button class="pinActionBtn ${((projectData.hasOwnProperty('pinToDash')) && projectData.pinToDash) ? 'crossed' : '' }" title="Pin to Dashboard"><i class="fa-solid fa-thumbtack"></i></button>` : '' }
        ${ focusNodeAction ? '<button class="focusNodeAction" title="Open node in Project Tree"><i class="fa-regular fa-circle-dot"></i></button>' : '' }
        ${ editAction ? '<button class="editActionBtn" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>' : '' }
        ${ tapeAction ? '<button class="tapeUpActionBtn" title="Tape Up Temporarily"><i class="fa-solid fa-tape"></i></button>' : '' }
      </div>
    </div>
  `;

  if(projectView) addProjectActionListeners(wrapper, projectData, projectView);

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
 
  // Add listeners to save or abort edit of header.
  const abortEditingProjectTitleBarBtn = projectTitle.querySelector('.abortEditingProjectTitleBarBtn');
  addEditingHeaderEscapePressListener(abortEditingProjectTitleBarBtn);
  
  const saveEditingProjectTitleBarBtn = projectTitle.querySelector('.saveEditingProjectTitleBarBtn');
  addEditingHeaderEnterPressListener(saveEditingProjectTitleBarBtn)  

  saveEditingProjectTitleBarBtn.addEventListener('click', () => {
    handleSaveEditingProjectTitleBar(projectView, projectData, projectTitle, projectTitleInput, projectDescription, projectDescriptionInput);
    clearEditingHeaderKeyPressListeners();
  });
  abortEditingProjectTitleBarBtn.addEventListener('click', () => {
    handleAbortEditingProjectTitleBar(projectData, projectTitle, projectDescription);
    clearEditingHeaderKeyPressListeners();
  });
}

function addEditingHeaderEscapePressListener(abortEditingProjectTitleBarBtn) {

  globalListeners.esc = () => abortEditingProjectTitleBarBtn.click();
}

function addEditingHeaderEnterPressListener(saveEditingProjectTitleBarBtn) {

  globalListeners.enter = (e) => { 
    e.preventDefault();
    saveEditingProjectTitleBarBtn.click(); 
  }
}

function clearEditingHeaderKeyPressListeners(escapeHandler, enterHandler) {
  
  globalListeners.enter = null;
  // Change escape back to closing projectView
  globalListeners.esc = () => closeAllProjectViews({});
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

