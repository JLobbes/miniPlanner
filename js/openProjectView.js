function openProjectViewByID(project) {
  if (!project) {
    console.error('Project not found:', project?.uniqueProjectID);
    return;
  }
  // Remove any existing projectView
  const existing = document.querySelector('.projectView');
  if (existing) existing.parentNode.removeChild(existing);

  // Create and append new projectView
  const projectView = createProjectView(project);
  document.body.appendChild(projectView);

  // Trigger drop down animation
  triggerDropDown(projectView, 'active', 20);
}

// Main project view builder
function createProjectView(project) {
  const projectView = document.createElement('div');
  projectView.className = 'projectView';

  projectView.appendChild(createProjectViewTitleBar(project));
  projectView.appendChild(createProgressBar(project));
  projectView.appendChild(createBottomPanel(project));

  return projectView;
}

// Title Bar
function createProjectViewTitleBar(project) {
  const wrapper = document.createElement('div');
  wrapper.className = 'titleBarWrapper';

  const titleTextWrapper = document.createElement('div');
  titleTextWrapper.className = 'titleTextWrapper';

  const projectTitle = document.createElement('h3');
  projectTitle.className = 'projectTitle';
  projectTitle.innerHTML = `<i class="fa-solid fa-folder"></i> ${project.projectTitle}`;

  const projectDescription = document.createElement('div');
  projectDescription.className = 'projectDescription';
  projectDescription.textContent = project.projectDescription;

  titleTextWrapper.appendChild(projectTitle);
  titleTextWrapper.appendChild(projectDescription);

  wrapper.appendChild(titleTextWrapper);
  wrapper.appendChild(createProjectActions());

  return wrapper;
}

// Progress Bar (reuse from renderProjectTiles.js)
function createProgressBar(project) {
  const progressWrapper = document.createElement('div');
  progressWrapper.className = 'progressBarWrapper';

  const percent = calculateProjectProgress(globalProjectData, project.uniqueProjectID);
  const taskCount = calculateProjectTaskCount(globalProjectData, project.uniqueProjectID);
  const status = project.projectStatus;

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
        <p class="projectStatusBubble">${status}</p>
      </div>
    </div>
  `;
  return progressWrapper;
}

// Bottom Panel (tasks, time, notes)
function createBottomPanel(project) {
  const bottomPanel = document.createElement('div');
  bottomPanel.className = 'bottomPanel';

  const left = document.createElement('div');
  left.className = 'bottomPanelLeft';
  left.appendChild(createTasksWrapper(project));

  const right = document.createElement('div');
  right.className = 'bottomPanelRight';
  right.appendChild(createTimeWrapper(project));
  right.appendChild(createNotesWrapper(project));

  bottomPanel.appendChild(left);
  bottomPanel.appendChild(right);

  return bottomPanel;
}

// Tasks Section
function createTasksWrapper(project) {
  const wrapper = document.createElement('div');
  wrapper.className = 'tasksWrapper';

  const header = document.createElement('h2');
  header.textContent = 'Tasks';
  wrapper.appendChild(header);

  const newTaskBtn = document.createElement('div');
  newTaskBtn.className = 'newTaskBtn';
  newTaskBtn.innerHTML = `<h3><i class="fa-regular fa-rectangle-list"></i> New Task</h3>`;
  wrapper.appendChild(newTaskBtn);

  // Render tasks (immediate children)
  const tasks = globalProjectData.filter(p => p.parentProjectID === project.uniqueProjectID);
  tasks.forEach(task => {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task';
    taskDiv.innerHTML = `
      <i class="fa-regular fa-rectangle-list"></i>
      <h3 class="taskName">${task.projectTitle}</h3>
      <div class="taskStatusBubble">${task.projectStatus}</div>
    `;
    wrapper.appendChild(taskDiv);
  });

  return wrapper;
}

// Time Section (static for now)
function createTimeWrapper(project) {
  const wrapper = document.createElement('div');
  wrapper.className = 'timeWrapper';

  // Calculate total time in minutes
  const totalMinutes = (project.timeLog || []).reduce((sum, entry) => sum + (entry.time || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Build time log entries
  const timeLogEntries = (project.timeLog || [])
    .map(entry => {
      const dateObj = new Date(entry.date);
      const timeStr = `${entry.time} min`;
      const dateStr = `${dateObj.getHours()}${dateObj.getHours() >= 12 ? 'pm' : 'am'} | ${dateObj.toLocaleString('default', { month: 'short' })} ${String(dateObj.getDate()).padStart(2, '0')}`;
      return `
        <div class="timeLogEntry">
          <p class="timeLogEntrySource" title="${project.projectTitle}">
            <i class="fa-solid fa-folder"></i> 
            ${project.projectTitle}
          </p>
          <p class="timeLogEntryTime">${timeStr}</p>
          <p class="timeLogEntryDate">${dateStr}</p>
          <div class="timeLogEntryEdit">
            <i class="fa-solid fa-pen"></i>
          </div>
        </div>
      `;
    }).join('');

  wrapper.innerHTML = `
    <h2 class="timeWrapperHeader">
      <i class="fa-regular fa-clock"></i> Time
    </h2>
    <div class="timeItems">
      <div class="totalTimeDisplay">
        <div class="totalTimeHours">
          <p class="totalTimeDigit">${hours}</p>
          <p class="totalTimeUnits">hr</p>
        </div>
        <div class="totalTimeMinutes">
          <p class="totalTimeDigit">${minutes}</p>
          <p class="totalTimeUnits">min</p>
        </div>
      </div>
      <div class="timeLog">
        ${timeLogEntries}
      </div>
      <div class="addTimeLogBtn">
        <i class="fa-solid fa-plus"></i>
      </div>
    </div>
  `;
  return wrapper;
}

// Notes Section (static for now)
function createNotesWrapper(project) {
  const wrapper = document.createElement('div');
  wrapper.className = 'notesWrapper';

  // Build note log entries
  const noteLogEntries = (project.noteLog || [])
    .map(entry => {
      const dateObj = new Date(entry.date);
      const noteStr = entry.note;
      const dateStr = `${dateObj.getHours()}${dateObj.getHours() >= 12 ? 'pm' : 'am'} | ${dateObj.toLocaleString('default', { month: 'short' })} ${String(dateObj.getDate()).padStart(2, '0')}`;
      return `
        <div class="noteLogEntry">
          <p class="noteLogEntrySource" title="${project.projectTitle}">
            <i class="fa-solid fa-folder"></i> 
            ${project.projectTitle}
          </p>
          <p class="noteLogEntryNote">${noteStr}</p>
          <p class="noteLogEntryDate">${dateStr}</p>
          <div class="noteLogEntryEdit">
            <i class="fa-solid fa-pen"></i>
          </div>
        </div>
      `;
    }).join('');

  wrapper.innerHTML = `
    <h2 class="notesWrapperHeader">
      <i class="fa-regular fa-note-sticky"></i> Notes
    </h2>
    <div class="notesItems">
      <div class="noteLog">
        ${noteLogEntries}
      </div>
      <div class="addNoteLogBtn">
        <i class="fa-solid fa-plus"></i>
      </div>
    </div>
  `;
  return wrapper;
}

// Actions (reuse from renderProjectTiles.js)
function createProjectActions() {
  const wrapper = document.createElement('div');
  wrapper.className = 'projectActionsWrapper';
  wrapper.innerHTML = `
    <div class="projectActions">
      <span>...</span>
      <div class="projectActionsDropDown">
        <button title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
        <button title="Delete"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
  `;
  return wrapper;
}

// Progress/Task helpers (reuse from renderProjectTiles.js)
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
function calculateProjectTaskCount(globalProjectData, projectID) {
  try {
    if (!projectID) return 0;
    const children = globalProjectData.filter(p => p.parentProjectID === projectID);
    return children.length;
  } catch (error) {
    console.error('Error calculating task count:', error);
    return 0;
  }
}

function triggerDropDown(element, className = 'active', delay = 20) {
  element.classList.remove(className);
  void element.offsetWidth;
  setTimeout(() => {
    element.classList.add(className);
  }, delay);
}