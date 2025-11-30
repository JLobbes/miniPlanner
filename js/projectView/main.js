// js/projectView/main.js

function closeAllProjectViews() {
  const projectViews = document.getElementsByClassName('projectView');

  for (let i = 0; i < projectViews.length; i++) {
    const openProject = projectViews[i];
    
    if (openProject.classList.contains('active')) {
      openProject.classList.remove('active');

      setTimeout(() => {
        // Allow for slide up animation
        openProject.remove();
      }, 300);
    }
  }

  // Ensure project on dash are reRender to reflect edits. 
  renderProjectsToDash();
}

function openProjectView(projectData, hasParent) {

  if (!projectData) {
    console.error('Project not found:', projectData?.uniqueProjectID);
    return;
  } else {
    // Update global depth variable. 
    depth = findDepth(projectData.uniqueProjectID); 
  }

  // Close all project views to allow them to reRender given changes in child
  closeAllProjectViews();

  // Create and append new projectView
  const projectView = createProjectView(projectData);
  document.body.appendChild(projectView);
  
  // Dynamically add consistent speed scroll animation for noteLogEntry. 
  addNoteScrollAnimation();
  
  // Trigger drop down animation
  triggerDropDown(projectView, 'active', 20);
}

function closeSingleProjectView(projectData, projectView) {
  projectView.classList.remove('active');
  setTimeout(() => {
    // Allow for slide up animation
    projectView.remove();
  }, 200);

  if(projectData.parentProjectID) {
    const parentProjectData = getSingleProject(projectData.parentProjectID);
    openProjectView(parentProjectData);
  }
}

function findOpenedProjectView(projectID) {
  const allViews = [...document.querySelectorAll('.projectView')];
  return allViews.find(view => view.getAttribute('projectid') === projectID);
}

// Main project view builder
function createProjectView(projectData) {
  const projectView = document.createElement('div');
  projectView.className = 'projectView';
  projectView.setAttribute('projectid', projectData.uniqueProjectID);

  if(depth > 1) projectView.appendChild(createMinimizeButton(projectData))
  projectView.appendChild(createProjectViewTitleBar(projectData));
  projectView.appendChild(createProgressBar({ projectData, projectView, editable: true })); 
  projectView.appendChild(createBottomPanel(projectData, projectView)); 

  addProjectEventListeners(projectData, projectView) // TO-DO: Group all scattered listeners

  return projectView;
}

function addProjectEventListeners(projectData, projectView) {

  // Listeners are broken out for re-render simplicity.
  if(depth > 1) addMinimizeProjectViewListener(projectData, projectView);
  addProjectHeaderListeners(projectData,projectView);
  addAddTimeLogListener(projectData, projectView);
  addAddNoteLogListener(projectData, projectView);
  addNewTaskListener(projectData, projectView);
}

// Handles delays dropDown of projectView to allow for drop down effect.
// Will be a pop-up if not used.
function triggerDropDown(element, className = 'active', delay = 20) {
  element.classList.remove(className);
  void element.offsetWidth;
  setTimeout(() => {
    element.classList.add(className);
  }, delay);
}

function createMinimizeButton() {
  const minimizeProjectButton = document.createElement('button');
  minimizeProjectButton.innerHTML = `<i class="fa-solid fa-caret-left"></i>`;
  minimizeProjectButton.classList.add('minimizeProjectBtn');
  return minimizeProjectButton; 
}

function addMinimizeProjectViewListener(projectData, projectView) {
  const minimizeProjectBtn = projectView.querySelector('.minimizeProjectBtn');
  minimizeProjectBtn.addEventListener('click', () => {
    closeSingleProjectView(projectData, projectView);
  });
}
