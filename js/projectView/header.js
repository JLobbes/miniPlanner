// js/projectView/header.js

function addProjectHeaderListeners(projectData, projectView) {
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


function enableEditHeader(projectData, projectView) {

  // Replace header with editible mini-form
  const projectTitle = projectView.querySelector('.projectTitle');
  projectTitle.innerHTML = 
    `
      <i class="fa-solid fa-pen-to-square"></i>
      <input type="text" class="editingProjectTitle" name="editingProjectTitle" value="${projectData.projectTitle}" />
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
  saveEditingProjectTitleBarBtn.addEventListener('click', () => {
    handleSaveEditingProjectTitleBar(projectView, projectData, projectTitle, projectTitleInput, projectDescription, projectDescriptionInput);
  });
  
  // Add listener to abortEditingProjectTitleBarBtn 
  const abortEditingProjectTitleBarBtn = projectTitle.querySelector('.abortEditingProjectTitleBarBtn');
  abortEditingProjectTitleBarBtn.addEventListener('click', () => {
    handleAbortEditingProjectTitleBar(projectData, projectTitle, projectDescription);
  });
}

// Title Bar
function createProjectViewTitleBar(projectData) {
  const wrapper = document.createElement('div');
  wrapper.className = 'titleBarWrapper';

  const titleTextWrapper = document.createElement('div');
  titleTextWrapper.className = 'titleTextWrapper';

  const projectTitle = document.createElement('h3');
  projectTitle.className = 'projectTitle';
  projectTitle.innerHTML = `<i class="fa-solid fa-folder"></i> ${projectData.projectTitle}`;

  const projectDescription = document.createElement('div');
  projectDescription.className = 'projectDescription';
  projectDescription.textContent = projectData.projectDescription;

  titleTextWrapper.appendChild(projectTitle);
  titleTextWrapper.appendChild(projectDescription);

  wrapper.appendChild(titleTextWrapper);
  wrapper.appendChild(createProjectActions());

  return wrapper;
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
