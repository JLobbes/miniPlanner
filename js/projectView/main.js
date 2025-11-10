// js/projectView/main.js

function openProjectView(projectData) {

  if (!projectData) {
    console.error('Project not found:', projectData?.uniqueProjectID);
    return;
  }

  // Remove any existing projectView
  const existing = document.querySelector('.projectView');
  if (existing) existing.parentNode.removeChild(existing);

  // Create and append new projectView
  const projectView = createProjectView(projectData);
  document.body.appendChild(projectView);
  
  // Dynamically add consistent speed scroll animation for noteLogEntry. 
  addNoteScrollAnimation();
  
  // Trigger drop down animation
  triggerDropDown(projectView, 'active', 20);
}

// Main project view builder
function createProjectView(projectData) {
  const projectView = document.createElement('div');
  projectView.className = 'projectView';
  projectView.setAttribute('projectid', projectData.uniqueProjectID);

  projectView.appendChild(createProjectViewTitleBar(projectData));
  projectView.appendChild(createProgressBar(projectData)); 
  projectView.appendChild(createBottomPanel(projectData, projectView)); 

  addProjectEventListeners(projectData, projectView) // TO-DO: Group all scattered listeners

  return projectView;
}

function addProjectEventListeners(projectData, projectView) {

  // Listeners are broken out for re-render simplicity.
  addProjectHeaderListeners(projectData,projectView);
  addAddTimeLogListener(projectData, projectView);
  addAddNoteLogListener(projectData, projectView);
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

