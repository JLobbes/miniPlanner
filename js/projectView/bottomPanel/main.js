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

  const allChildren = getAllChildrenFast(projectData.uniqueProjectID);

  const timeWrapperProper = createTimeWrapper(projectData, projectView, allChildren);
  right.replaceChild(timeWrapperProper, timeWrapperLoadingBlock);
  
  const notesWrapperProper = createNotesWrapper(projectData, projectView, allChildren);
  right.replaceChild(notesWrapperProper, notesWrapperLoadingBlock);

  return;
}

function reRenderNotesAndTimeLogs(projectView, projectData) { 

  const allChildren = getAllChildrenFast(projectData.uniqueProjectID);

  const updatedTimeWrapper  = createTimeWrapper(projectData, projectView, allChildren);
  const updatedNotesWrapper = createNotesWrapper(projectData, projectView, allChildren);
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