// js/projectView/bottomPanel/notesSection.js

function addAddNoteLogListener(projectData, projectView) {
  // Applies only to addNoteLogEntry button.

  const addTimeLogBtn = projectView.querySelector('.addNoteLogBtn');
  addTimeLogBtn.addEventListener('click', async (e) => {
    await addNoteLogEntry(projectData, projectView);
  });
}

function addEditNoteLogEntryListeners (notesWrapper, projectData, projectView) {
  // Applies to edit button found in noteLogEntry.

  const noteLogEntries = notesWrapper.querySelectorAll('.noteLogEntry');
  noteLogEntries.forEach(noteLogEntry => {

    // Attach click listener to editBtn and render miniForm
    const timeLogEntryEditBtn = noteLogEntry.querySelector('.noteLogEntryEdit');
    timeLogEntryEditBtn.addEventListener('click', async () => {
      await updateNoteLogEntry(projectData, noteLogEntry, projectView);
    });
  });
}

function addDeleteNoteLogEntryListeners (notesWrapper, projectData, projectView) {
  // Applies to delete button found in noteLogEntry.

  const noteLogEntries = notesWrapper.querySelectorAll('.noteLogEntry');
  noteLogEntries.forEach(noteLogEntry => {

    // Attach click listener to deleteBtn and render miniForm
    const noteLogEntryDeleteBtn = noteLogEntry.querySelector('.noteLogEntryDelete');
    noteLogEntryDeleteBtn.addEventListener('click', async () => {
      await deleteNoteLogEntry(projectData, noteLogEntry, projectView);
    });
  });
}


// Notes Section 
function createNotesWrapper(projectData, projectView) {
  const notesWrapper = document.createElement('div');
  notesWrapper.className = 'notesWrapper';

  // Build note log entries
  const noteLogEntries = (projectData.noteLog || [])
    .map(entry => {
      const dateObj = new Date(entry.date);
      const noteStr = entry.note;
      const dateStr = `${dateObj.getHours()}${dateObj.getHours() >= 12 ? 'pm' : 'am'} | ${dateObj.toLocaleString('default', { month: 'short' })} ${String(dateObj.getDate()).padStart(2, '0')}`;
      return `
        <div class="noteLogEntry" uniqueEntryID="${entry.uniqueEntryID}">
          <p class="noteLogEntrySource" title="${projectData.projectTitle}">
            <i class="fa-solid fa-folder"></i> 
            ${projectData.projectTitle}
          </p>
          <p class="noteLogEntryNote" originalNoteLogged="${entry.note}"><span>${noteStr}</span></p>
          <p class="noteLogEntryDate" originalDateString="${entry.date}">${dateStr}</p>
          <div class="noteLogEntryEdit">
            <i class="fa-solid fa-pen"></i>
          </div>
          <div class="noteLogEntryDelete">
            <i class="fa-solid fa-trash"></i>
          </div>
        </div>
      `;
    }).join('');

  notesWrapper.innerHTML = `
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

  addEditNoteLogEntryListeners(notesWrapper, projectData, projectView); 
  addDeleteNoteLogEntryListeners(notesWrapper, projectData, projectView); 
  return notesWrapper;
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
    uniqueEntryID: generateUniqueEntryID(),
    date: combinedTimeStamp.toISOString(),
    note: newNoteLogData.note,
  }
  projectData.noteLog.push(dataFormatedForUpdate)
  syncProjectInGlobalData(projectData);

  // Render additional log to note log (e.g., just call reRenderNotesAndTimeLogs(projectView, projectData))
  reRenderNotesAndTimeLogs(projectView, projectData);
}

// Update existing note log
async function updateNoteLogEntry(projectData, noteLogEntry, projectView) {
  
  // Gather original data to pass to miniForm
  const originalNoteLogged = noteLogEntry.querySelector('.noteLogEntryNote').getAttribute('originalNoteLogged');
  const originalDateLogged = noteLogEntry.querySelector('.noteLogEntryDate').getAttribute('originalDateString');
  const dataForMiniForm = {
    formType: 'editNoteLog',
    originalNoteLogged: originalNoteLogged,
    originalDate: new Date(originalDateLogged),
    // TO-DO: rename timeStamp to currentTime throughout.
    projectData: { ... projectData },
  };

  const updatedNoteLogData = await renderMiniForm(dataForMiniForm); // Gather new data via miniForm

  // Add hrs & minutes to date as to complete timeStamp
  const combinedTimeStamp = new Date(updatedNoteLogData.date);
  const [hours, minutes] = updatedNoteLogData.timeStamp.split(':').map(Number);
  combinedTimeStamp.setMinutes(minutes);
  combinedTimeStamp.setHours(hours);
  
  // Update projectData and sync that to GlobalProjectData
  const dataFormatedForUpdate = {
    date: combinedTimeStamp.toISOString(),
    note: updatedNoteLogData.note,
  }
  // Locate exisiting entry in local project
  const entryToUpdate = projectData.noteLog.find(
    log => log.uniqueEntryID == noteLogEntry.getAttribute('uniqueEntryID')
  );

  if (!entryToUpdate) {
    throw new Error("No matching time log entry found for update.");
  }

  // --- Update located entry in place & sync ---
  entryToUpdate.date = dataFormatedForUpdate.date;
  entryToUpdate.note = dataFormatedForUpdate.note;
  syncProjectInGlobalData(projectData);
  console.log('global data updated:', globalProjectData);

  // TO-DO: Make re-render specific to timeSection only.
  reRenderNotesAndTimeLogs(projectView, projectData);
}

async function deleteNoteLogEntry(projectData, noteLogEntry, projectView) {
  
  try {
    const dataForMiniForm = {
      formType: 'confirmDeleteNoteLogEntry',
      projectData: { ... projectData },
    };

    await requestConfirmation(dataForMiniForm);

    // Filter time log array for entries that don't have deleted entry uniqueEntryID
    projectData.noteLog = projectData.noteLog.filter(
      e => e.uniqueEntryID !== noteLogEntry.getAttribute('uniqueEntryID')
    );
    syncProjectInGlobalData(projectData);

    // TO-DO: Delete entry from time-log in visible projectView
    noteLogEntry.remove();

  } catch (error) {
    console.log('Deletion of entry in note-log canceled:', error.message);
    return; // End process if children are not handled.
  }
}

function addNoteScrollAnimation() {
  document.querySelectorAll('.noteLogEntryNote span').forEach(span => {
    const parent = span.parentElement;
    const charCount = span.textContent.length;
    const visibleChars = Math.floor(parent.clientWidth / 8); // ~8px per char (tweak this)
    const distanceChars = charCount - visibleChars;

    if (distanceChars > 0) {
      const speed = 5; // characters per second
      const durationMs = (distanceChars / speed) * 1000;
      span.style.setProperty('--scroll-duration', `${durationMs}ms`);
    } else {
      span.style.removeProperty('--scroll-duration');
    }
  });
}