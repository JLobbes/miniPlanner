// js/projectView/topPanel/progressBar.js

function addOpenUpdateStatusListListeners(projectData, progressWrapper) {

  const statusBubbleBtn = progressWrapper.querySelector('.projectStatusBubble');
  statusBubbleBtn.tabIndex = '3';
  statusBubbleBtn.addEventListener('click', () => {
    
    let updateStatusList = document.querySelector('.updateStatusList');
    if(!updateStatusList){
      updateStatusList = document.createElement('div');
      updateStatusList.classList.add('updateStatusList')
      updateStatusList.innerHTML = `
        <button class="projectStatusBubble statusShowingPlanned" tabIndex="3">Planned</button>
        <button class="projectStatusBubble statusShowingComplete" tabIndex="3">Complete</button>
        <button class="projectStatusBubble statusShowingInProgress" tabIndex="3">In Progress</button>
        <button class="projectStatusBubble statusShowingPaused" tabIndex="3">Paused</button>
        <button class="projectStatusBubble statusShowingDelayed" tabIndex="3">Delayed</button>
        <button class="projectStatusBubble statusShowingDead" tabIndex="3">Dead</button>
      `;
    }
        
    const projectStatusWrapper = progressWrapper.querySelector('.projectStatusWrapper');
    projectStatusWrapper.appendChild(updateStatusList);

    // Remove unecessassyr option to update status to current states
    const currentStatus = updateStatusList.querySelector(`.statusShowing${projectData.projectStatus.replace(' ', '')}`);
    currentStatus.remove();

    addUpdateStatusListener(projectData, updateStatusList)

    setTimeout(() => {
      addCloseUpdateStatusListListener(updateStatusList);
    }, 500)

  });
  
}

function addUpdateStatusListener(projectData, updateStatusList) {

  updateStatusList.querySelectorAll('.projectStatusBubble').forEach(updateStatusOption => {
    updateStatusOption.addEventListener('click', () => {
      const newStatus = updateStatusOption.innerText;
      const oldStatus = projectData.projectStatus;

      if(newStatus === 'In Progress') {
        console.log('Now in progress. Update Anscestors')
        updateProjectStatusAndAncestors(projectData, 'In Progress');
      } else {
        updateProjectStatus(projectData, newStatus);
      }
      
      if(oldStatus === 'In Progress' && hasChildren(projectData.uniqueProjectID)) {
        console.log('No longer in progress. Pause Descendants');

        pauseInProgressDescendents(projectData);
      }
        
      reRenderProgressBar(projectData);
    });
  });
}

function addCloseUpdateStatusListListener(updateStatusList) {
  function handleOutsideClick(e) {
    // ignore clicks inside the list
    if (updateStatusList.contains(e.target)) return;

    // otherwise
    updateStatusList.remove();

    // cleanUpListener
    globalListeners.click = null;
  }

  globalListeners.click = (e) => handleOutsideClick(e);
}

function createProgressBar({ projectData, projectView, editable, renderAsSingleTask, forProjectTile = false }) {
  // TO-DO: make funtion take options, as tiles won't be updatable. 

  const progressWrapper = document.createElement('div');
  progressWrapper.className = 'progressBarWrapper';

  const percent = calculateProjectProgress(globalProjectData, projectData.uniqueProjectID);
  const taskCount = calculateProjectTaskCount(globalProjectData, projectData.uniqueProjectID);
  const status = projectData.projectStatus;

  progressWrapper.innerHTML = `
    <div class="progressBarDetailsWrapper">
      <div class="progressBarLabelWrapper">
        <p class="progressBarLabel">Progress</p>
      </div>
      <div class="projectBarPercentageWrapper">
        ${ renderAsSingleTask ? `<p class="projectBarPercentage">${(projectData.projectStatus == 'Complete') ? '100%' : '0%'}</p>` :
        `<p class="projectBarPercentage">${percent} %</p>` }
      </div>
    </div>
    <div class="progressBar">
      <div class="progressBarBackground">
        ${ renderAsSingleTask ? `<div class="progressBarFill" style="width: ${ (projectData.projectStatus == 'Complete') ? '100%' : '0%' }"></div>` :
        `<div class="progressBarFill" style="width: ${percent}%"></div>` }
      </div>
    </div>
    <div class="progressBarDetailsWrapper">
      <div class="taskQuantityWrapper">
        ${ renderAsSingleTask ? '<p class="taskQuantity">Single Task</p>' :
        `<p class="taskQuantity">${taskCount} Task${taskCount !== 1 ? 's' : ''}</p>` }
      </div>
      <div class="projectStatusWrapper">
        <${forProjectTile ? 'p' : 'button' } class="projectStatusBubble statusShowing${status.replace(' ', '')}">${status}</ ${forProjectTile ? 'p' : 'button'}>
      </div>
    </div>
  `;

  if(editable) addOpenUpdateStatusListListeners(projectData, progressWrapper);
  return progressWrapper;
}

// Calculate percent complete based on immediate subProjects found via parentProjectID
function calculateProjectProgress(globalProjectData, projectID) {
  try {
    if (!projectID) return 0;

    const tasks = globalProjectData.filter(p => p.parentProjectID === projectID);
    if (tasks.length === 0) return 0;

    const completeCount = tasks.filter(t => t.projectStatus.toLowerCase() === 'complete').length;
    return Math.round((completeCount / tasks.length) * 100);
  } catch (error) {
    console.error('Error calculating project progress:', error);
    return 0;
  }
}

// Calculate number of immediate subProjects/Tasks (one level deep, excluding nested children)
function calculateProjectTaskCount(globalProjectData, projectID) {
  try {
    if (!projectID) return 0;

    // Find direct children of the project
    const children = globalProjectData.filter(p => p.parentProjectID === projectID);

    return children.length;
  } catch (error) {
    console.error('Error calculating task count:', error);
    return 0;
  }
}

function reRenderProgressBar(projectData) {

  const projectView = findOpenedProjectView(projectData.uniqueProjectID);
  const oldProgressWrapper = projectView.querySelector('.progressBarWrapper');
  const renderAsSingleTask = !hasChildren(projectData.uniqueProjectID);
  const updatedProgressWrapper = createProgressBar({projectData, projectView, editable: true, renderAsSingleTask});

  const locationForReRender = projectView.querySelector('.titleBarWrapper');
  oldProgressWrapper.remove();
  locationForReRender.after(updatedProgressWrapper);
}