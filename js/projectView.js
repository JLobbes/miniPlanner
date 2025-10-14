function openProjectView(project) {

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
  projectView.setAttribute('projectid', project.uniqueProjectID);

  projectView.appendChild(createProjectViewTitleBar(project));
  projectView.appendChild(createProgressBar(project)); // Defined in renderProjectTiles.js
  projectView.appendChild(createBottomPanel(project)); // Defined in renderProjectTiles.js

  addProjectEventListeners(project, projectView) // TO-DO: Group all scattered listeners

  return projectView;
}

function addProjectEventListeners(projectData, projectView) {

  const deleteBtn = projectView.querySelector('.projectActionsDropDown button[title="Delete"]');
  deleteBtn.addEventListener('click', (e) => {
    closeProjectViews(); 
    deleteProject(projectData); 
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
    handleSaveEditingProjectTitleBar(projectData, projectTitle, projectTitleInput, projectDescription, projectDescriptionInput);
  });
  
  // Add listener to abortEditingProjectTitleBarBtn 
}

function handleSaveEditingProjectTitleBar(projectData, projectTitle, projectTitleInput, projectDescription, projectDescriptionInput) {
  try {
    // Change title & description in globalProjectData
    projectData.projectTitle = projectTitleInput.value;
    projectData.projectDescription = projectDescriptionInput.value;
    
    // Change visible title & description in projectView
    projectTitle.innerHTML = `
    <i class="fa-solid fa-folder"></i> ${projectData.projectTitle}
    `;
    
    projectDescription.innerHTML = `
        ${projectData.projectDescription}
    `
    // TO-DO: Update title & description throughout project view
    // TO-DO: Update title & description for tiles on dashboard
  } catch (error) {
    console.error('Updated titleBar not saved. Encountered issue.');
    return;
  }
  console.log('Saved edited title bar!');

  // TO-DO: @14:44 10.14(WED), Need to rename titleBarWrapper to projectViewHeader or sth. Current name TitleBar is wordy? 
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

  const tasksList = document.createElement('div');
  tasksList.className = 'tasksList';
  wrapper.appendChild(tasksList);

  // Render tasks (immediate children)
  const tasks = globalProjectData.filter(p => p.parentProjectID === project.uniqueProjectID);
  tasks.forEach(task => {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task';
    taskDiv.innerHTML = `
      <i class="fa-regular fa-rectangle-list"></i>
      <h3 class="taskName">${task.projectTitle}</h3>
      <div class="taskStatusBubble statusShowing${task.projectStatus.replace(' ', '')}">${task.projectStatus}</div>
    `;
    tasksList.appendChild(taskDiv);
  });

  return wrapper;
}

// Time Section 
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
      const dateObj = new Date(entry.date)
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

// Notes Section 
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

// Handles delays dropDown of projectView to allow for drop down effect.
// Will be a pop-up if not used.
function triggerDropDown(element, className = 'active', delay = 20) {
  element.classList.remove(className);
  void element.offsetWidth;
  setTimeout(() => {
    element.classList.add(className);
  }, delay);
}