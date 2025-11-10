// js/projectView/bottomPanel/timeSection.js

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
