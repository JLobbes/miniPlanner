// projectView/bottomPanel/main.js

// Bottom Panel (tasks, time, notes)
function createBottomPanel(projectData, projectView) {
  const bottomPanel = document.createElement('div');
  bottomPanel.className = 'bottomPanel';

  const left = document.createElement('div');
  left.className = 'bottomPanelLeft';
  left.appendChild(createTasksWrapper(projectData));

  const right = document.createElement('div');
  right.className = 'bottomPanelRight';
  right.appendChild(createTimeWrapper(projectData, projectView));
  right.appendChild(createNotesWrapper(projectData, projectView));

  bottomPanel.appendChild(left);
  bottomPanel.appendChild(right);

  return bottomPanel;
}

function reRenderNotesAndTimeLogs(projectView, projectData) { 

  // TO-DO: This function should be split and only re-render where entries are held.
  //        Writing logic for single entry addition maybe not the best path, low reusability.

  const updatedTimeWrapper  = createTimeWrapper(projectData, projectView);
  const updatedNotesWrapper = createNotesWrapper(projectData, projectView);
  const locationForReRender = projectView.querySelector('.bottomPanelRight');
  
  locationForReRender.innerHTML = '';
  locationForReRender.appendChild(updatedTimeWrapper);
  locationForReRender.appendChild(updatedNotesWrapper);
  addAddTimeLogListener(projectData, projectView);
  addAddNoteLogListener(projectData, projectView);
  addNoteScrollAnimation();
}

function reRenderTaskList(projectView, projectData) {

  const updatedTasksWrapper = createTasksWrapper(projectData, projectView);
  const locationForReRender = projectView.querySelector('.bottomPanelLeft');
  
  locationForReRender.innerHTML = '';
  locationForReRender.appendChild(updatedTasksWrapper);
  addNewTaskListener(projectData, projectView);
}

