// projectView/bottomPanel/main.js

// Bottom Panel (tasks, time, notes)
function createBottomPanelLoadingBlock() {
  const bottomPanel = document.createElement('div');
  bottomPanel.className = 'bottomPanel';

  const left = document.createElement('div');
  left.className = 'bottomPanelLeft';

  const tasksWrapperLoadingBlock = createLoadingBlock('tasksWrapperLoadingBlock');
  left.appendChild(tasksWrapperLoadingBlock);

  const right = document.createElement('div');
  right.className = 'bottomPanelRight';

  const timeWrapperLoadingBlock = createLoadingBlock('timeWrapperLoadingBlock');
  right.appendChild(timeWrapperLoadingBlock);

  const notesWrapperLoadingBlock = createLoadingBlock('notesWrapperLoadingBlock');
  right.appendChild(notesWrapperLoadingBlock);

  bottomPanel.appendChild(left);
  bottomPanel.appendChild(right);

  return { bottomPanel, left, right, tasksWrapperLoadingBlock, timeWrapperLoadingBlock, notesWrapperLoadingBlock };
}

function createBottomPanel({ 
  projectData, 
  projectView, 
  renderAsSingleTask,
  left,
  right,
  tasksWrapperLoadingBlock,
  timeWrapperLoadingBlock,
  notesWrapperLoadingBlock
}) {

  if(renderAsSingleTask) {
    const promoteBtn = createPromoteToProjectBtn(projectData, projectView);
    left.replaceChild(promoteBtn, tasksWrapperLoadingBlock);
  } else {
    const tasksWrapperProper = createTasksWrapper(projectData);
    left.replaceChild(tasksWrapperProper, tasksWrapperLoadingBlock);
  }

  const timeWrapperProper = createTimeWrapper(projectData, projectView);
  right.replaceChild(timeWrapperProper, timeWrapperLoadingBlock);
  
  const notesWrapperProper = createNotesWrapper(projectData, projectView);
  right.replaceChild(notesWrapperProper, notesWrapperLoadingBlock);

  return;
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
  addNoteScrollAnimation();
}

function reRenderTaskList(projectView, projectData) {

  const updatedTasksWrapper = createTasksWrapper(projectData, projectView);
  const locationForReRender = projectView.querySelector('.bottomPanelLeft');
  
  locationForReRender.innerHTML = '';
  locationForReRender.appendChild(updatedTasksWrapper);
}