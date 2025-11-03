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

function addProjectHeaderListeners(projectData, projectView) {
  const deleteBtn = projectView.querySelector('.projectActionsDropDown button[title="Delete"]');
  deleteBtn.addEventListener('click', async (e) => {
    try {
      await triggerDeleteProjectCascade(projectData);
      closeProjectViews();
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

function addAddTimeLogListener(projectData, projectView) {
  // Applies only to addTimeLogEntry button.

  const addTimeLogBtn = projectView.querySelector('.addTimeLogBtn');
  addTimeLogBtn.addEventListener('click', async (e) => {
    await addTimeLogEntry(projectData, projectView);
  });
}

function addEditTimeLogEntryListeners (timeWrapper, projectData, projectView) {
  // Applies to edit button found in timeLogEntry.
  // TO-DO: Write delete timeLogEntry logic and add listener below.

  const timeLogEntries = timeWrapper.querySelectorAll('.timeLogEntry');
  timeLogEntries.forEach(timeLogEntry => {

    // Attach click listener to editBtn and render miniForm
    const timeLogEntryEditBtn = timeLogEntry.querySelector('.timeLogEntryEdit');
    timeLogEntryEditBtn.addEventListener('click', async () => {
      await updateTimeLogEntry(projectData, timeLogEntry, projectView);
    });
  });
}

function addAddNoteLogListener(projectData, projectView) {
  // Applies only to addNoteLogEntry button.

  const addTimeLogBtn = projectView.querySelector('.addNoteLogBtn');
  addTimeLogBtn.addEventListener('click', async (e) => {
    await addNoteLogEntry(projectData, projectView);
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

function handleSaveEditingProjectTitleBar(projectView, projectData, projectTitle, projectTitleInput, projectDescription, projectDescriptionInput) {
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
  right.appendChild(createNotesWrapper(projectData));

  bottomPanel.appendChild(left);
  bottomPanel.appendChild(right);

  return bottomPanel;
}

// Tasks Section
function createTasksWrapper(projectData) {
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
  const tasks = globalProjectData.filter(p => p.parentProjectID === projectData.uniqueProjectID);
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
function createTimeWrapper(projectData, projectView) {
  const timeWrapper = document.createElement('div');
  timeWrapper.className = 'timeWrapper';

  // Calculate total time in minutes
  const totalMinutes = (projectData.timeLog || []).reduce((sum, entry) => sum + (entry.time || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Build time log entries
  const timeLogEntries = (projectData.timeLog || [])
    .map(entry => {
      const dateObj = new Date(entry.date)
      const timeStr = `${entry.time} min`;
      const hours12 = dateObj.getHours() % 12 || 12;
      const ampm = dateObj.getHours() >= 12 ? 'pm' : 'am';
      const dateStr = `${hours12}${ampm} | ${dateObj.toLocaleString('default', { month: 'short' })} ${String(dateObj.getDate()).padStart(2, '0')}`;
      // const dateStr = `${dateObj.getHours()}${dateObj.getHours() >= 12 ? 'pm' : 'am'} | ${dateObj.toLocaleString('default', { month: 'short' })} ${String(dateObj.getDate()).padStart(2, '0')}`;
      return `
        <div class="timeLogEntry">
          <p class="timeLogEntrySource" title="${projectData.projectTitle}">
            <i class="fa-solid fa-folder"></i> 
            ${projectData.projectTitle}
          </p>
          <p class="timeLogEntryTime" originalMinutesLogged="${entry.time}">${timeStr}</p>
          <p class="timeLogEntryDate" originalDateString="${entry.date}">${dateStr}</p>
          <div class="timeLogEntryEdit">
            <i class="fa-solid fa-pen"></i>
          </div>
        </div>
      `;
    }).join('');

  timeWrapper.innerHTML = `
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

  addEditTimeLogEntryListeners(timeWrapper, projectData, projectView); 
  return timeWrapper;
}

// Notes Section 
function createNotesWrapper(projectData) {
  const wrapper = document.createElement('div');
  wrapper.className = 'notesWrapper';

  // Build note log entries
  const noteLogEntries = (projectData.noteLog || [])
    .map(entry => {
      const dateObj = new Date(entry.date);
      const noteStr = entry.note;
      const dateStr = `${dateObj.getHours()}${dateObj.getHours() >= 12 ? 'pm' : 'am'} | ${dateObj.toLocaleString('default', { month: 'short' })} ${String(dateObj.getDate()).padStart(2, '0')}`;
      return `
        <div class="noteLogEntry">
          <p class="noteLogEntrySource" title="${projectData.projectTitle}">
            <i class="fa-solid fa-folder"></i> 
            ${projectData.projectTitle}
          </p>
          <p class="noteLogEntryNote"><span>${noteStr}</span></p>
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

// Add new log entry to time log
async function addTimeLogEntry(projectData, projectView) {
  
  // Gather time log initial data using mini-form
  const dataForMiniForm = {
    formType: 'addTimeLog',
    timeStamp: new Date(),
    // TO-DO: rename timeStamp to currentTime throughout
    projectData: { ... projectData },
  };

  const newTimeLogData = await renderMiniForm(dataForMiniForm); // Gather data via miniForm

  // Add hrs & minutes to date as to complete timeStamp
  const combinedTimeStamp = new Date(newTimeLogData.date);
  const [hours, minutes] = newTimeLogData.timeStamp.split(':').map(Number);
  combinedTimeStamp.setMinutes(minutes);
  combinedTimeStamp.setHours(hours);
  
  // Update projectData and sync that to GlobalProjectData
  const dataFormatedForUpdate = {
    date: combinedTimeStamp.toISOString(),
    time: Number(newTimeLogData.numOfMinutes),
  }
  projectData.timeLog.push(dataFormatedForUpdate)
  syncProjectInGlobalData(projectData);

  // Render additional log to time log (e.g., just call reRenderNotesAndTimeLogs(projectView, projectData))
  reRenderNotesAndTimeLogs(projectView, projectData);
}

// Update existing time log
async function updateTimeLogEntry(projectData, timeLogEntry, projectView) {
  
  // Gather original data to pass to miniForm
  const originalMinutesLogged = timeLogEntry.querySelector('.timeLogEntryTime').getAttribute('originalMinutesLogged');
  const originalDateLogged = timeLogEntry.querySelector('.timeLogEntryDate').getAttribute('originalDateString');
  const dataForMiniForm = {
    formType: 'deleteOrEditTimeLog',
    originalMinutesLogged: originalMinutesLogged,
    originalDate: new Date(originalDateLogged),
    // TO-DO: rename timeStamp to currentTime throughout.
    projectData: { ... projectData },
  };

  const updatedTimeLogData = await renderMiniForm(dataForMiniForm); // Gather new data via miniForm

  // Add hrs & minutes to date as to complete timeStamp
  const combinedTimeStamp = new Date(updatedTimeLogData.date);
  const [hours, minutes] = updatedTimeLogData.timeStamp.split(':').map(Number);
  combinedTimeStamp.setMinutes(minutes);
  combinedTimeStamp.setHours(hours);
  
  // Update projectData and sync that to GlobalProjectData
  const dataFormatedForUpdate = {
    date: combinedTimeStamp.toISOString(),
    time: Number(updatedTimeLogData.numOfMinutes),
  }
  // Locate exisiting entry in local project
  const entryToUpdate = projectData.timeLog.find(
    log => log.time == originalMinutesLogged && log.date == originalDateLogged
  );

  if (!entryToUpdate) {
    throw new Error("No matching time log entry found for update.");
  }

  // --- Update located entry in place & sync ---
  entryToUpdate.date = dataFormatedForUpdate.date;
  entryToUpdate.time = dataFormatedForUpdate.time;
  syncProjectInGlobalData(projectData);
  console.log('global data updated:', globalProjectData);

  // TO-DO: Make re-render specific to timeSection only.
  reRenderNotesAndTimeLogs(projectView, projectData);
}

// Add new log entry to note log
async function addNoteLogEntry(projectData, projectView) {
  
  // Gather time log initial data using mini-form
  const dataForMiniForm = {
    formType: 'addNoteLog',
    timeStamp: new Date(),
    // TO-DO: rename timeStamp to currentTime throughout
    projectData: { ... projectData },
  };

  const newNoteLogData = await renderMiniForm(dataForMiniForm); // Gather data via miniForm

  // Add hrs & minutes to date as to complete timeStamp
  const combinedTimeStamp = new Date(newNoteLogData.date);
  const [hours, minutes] = newNoteLogData.timeStamp.split(':').map(Number);
  combinedTimeStamp.setMinutes(minutes);
  combinedTimeStamp.setHours(hours);
  
  // Update projectData and sync that to GlobalProjectData
  const dataFormatedForUpdate = {
    date: combinedTimeStamp.toISOString(),
    note: newNoteLogData.note,
  }
  projectData.noteLog.push(dataFormatedForUpdate)
  syncProjectInGlobalData(projectData);

  // Render additional log to note log (e.g., just call reRenderNotesAndTimeLogs(projectView, projectData))
  reRenderNotesAndTimeLogs(projectView, projectData);
}

function reRenderNotesAndTimeLogs(projectView, projectData) { 

  // TO-DO: This function should be split and only re-render where entries are held.
  //        Writing logic for single entry addition maybe not the best path, low reusability.

  const updatedTimeWrapper  = createTimeWrapper(projectData, projectView);
  const updatedNotesWrapper = createNotesWrapper(projectData);
  const locationForReRender = projectView.querySelector('.bottomPanelRight');
  
  locationForReRender.innerHTML = '';
  locationForReRender.appendChild(updatedTimeWrapper);
  locationForReRender.appendChild(updatedNotesWrapper);
  addAddTimeLogListener(projectData, projectView);
  addAddNoteLogListener(projectData, projectView);
}

function addNoteScrollAnimation() {
  // Dynamically sets consistent speed scroll animation for noteLogEntry. 
  // If done statically via CSS only, will scroll faster for longer notes.
  
  document.querySelectorAll('.noteLogEntryNote span').forEach(span => {
      const parent = span.parentElement;
      const textWidth = span.scrollWidth;
      const containerWidth = parent.clientWidth;
      const distance = textWidth - containerWidth;
  
      if (distance > 0) {
        const speed = 25; // pixels per second
        const duration = distance / speed; // seconds
        span.style.setProperty('--scroll-duration', `${duration}s`);
      } else {
        // No need to scroll if it fits
        span.style.setProperty('--scroll-duration', '0s');
      }
    });
}
