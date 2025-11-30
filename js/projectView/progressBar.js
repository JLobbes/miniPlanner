// js/projectView/topPanel/progressBar.js

function addOpenUpdateStatusListListeners(projectData, progressWrapper) {

  const statusBubbleBtn = progressWrapper.querySelector('.projectStatusBubble');
  statusBubbleBtn.addEventListener('click', () => {
    
    let updateStatusList = document.querySelector('.updateStatusList');
    if(!updateStatusList){
      updateStatusList = document.createElement('div');
      updateStatusList.classList.add('updateStatusList')
      updateStatusList.innerHTML = `
        <p class="projectStatusBubble statusShowingPlanned">Planned</p>
        <p class="projectStatusBubble statusShowingComplete">Complete</p>
        <p class="projectStatusBubble statusShowingInProgress">In Progress</p>
        <p class="projectStatusBubble statusShowingPaused">Paused</p>
        <p class="projectStatusBubble statusShowingDelayed">Delayed</p>
        <p class="projectStatusBubble statusShowingDead">Dead</p>
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
      projectData.projectStatus = updateStatusOption.innerText;
      syncProjectInGlobalData(projectData);
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
    document.removeEventListener('click', handleOutsideClick);
  }

  document.addEventListener('click', handleOutsideClick);
}

function createProgressBar({ projectData, projectView, editable }) {
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
        <p class="projectBarPercentage">${percent} %</p>
      </div>
    </div>
    <div class="progressBar">
      <div class="progressBarBackground">
        <div class="progressBarFill" style="width: ${percent}%"></div>
      </div>
    </div>
    <div class="progressBarDetailsWrapper">
      <div class="taskQuantityWrapper">
        <p class="taskQuantity">${taskCount} Task${taskCount !== 1 ? 's' : ''}</p>
      </div>
      <div class="projectStatusWrapper">
        <p class="projectStatusBubble statusShowing${status.replace(' ', '')}">${status}</p>
      </div>
    </div>
  `;

  if(editable) addOpenUpdateStatusListListeners(projectData, progressWrapper);
  return progressWrapper;
}

function reRenderProgressBar(projectData) {

  const projectView = findOpenedProjectView(projectData.uniqueProjectID);
  const oldProgressWrapper = projectView.querySelector('.progressBarWrapper');
  const updatedProgressWrapper = createProgressBar({projectData, projectView, editable: true});

  const locationForReRender = projectView.querySelector('.titleBarWrapper');
  oldProgressWrapper.remove();
  locationForReRender.after(updatedProgressWrapper);
}