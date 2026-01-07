function generateUniqueProjectID() {
  let id;
  const existingIDs = globalProjectData.map(p => p.uniqueProjectID);
  do {
    id = 'proj_' + Math.random().toString(36).slice(2, 12);
  } while (existingIDs.includes(id));
  return id;
}

function generateUniqueEntryID() {
  let id;
  const existingIDs = globalProjectData.flatMap(p =>
    [...p.timeLog, ...p.noteLog].map(e => e.uniqueEntryID)
  );

  do {
    id = 'entry_' + Math.random().toString(36).slice(2, 12);
  } while (existingIDs.includes(id));
  return id;
}

function createBlankProject(parentProjectID) {
  return {
    uniqueProjectID: generateUniqueProjectID(),
    projectTitle: null,
    projectDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    projectStatus: 'Planned',
    created: new Date().toISOString(),
    timeLog: [],
    noteLog: [],
    parentProjectID: parentProjectID,
    placement: {
      dashboardPlacement: null,
    }
  };
}

function openNewProject({ parentID , hasParent}) {
  const newProjectData = createBlankProject(parentID || null);
  addProjectToGlobalData(newProjectData);
  renderProjectsToDash();
  openProjectView(structuredClone(newProjectData), hasParent || null);
}

function getAllChildren(parentID) {
  // Includes nested

  const directChildren = structuredClone(globalProjectData).filter(p => p.parentProjectID === parentID);
  const allChildren = [...directChildren];
  
  for (const child of directChildren) {
    allChildren.push(...getAllChildren(child.uniqueProjectID));
  }

  return allChildren;
}

function hasChildren(targetProjectID) {
  return globalProjectData.some(p => p.parentProjectID === targetProjectID);
}

function getSingleProject(projectID) {
  // Make Deep Copy
  const singleProject = structuredClone(
    globalProjectData.find(p => p.uniqueProjectID === projectID)
  );
  return singleProject;
}

function addProjectToGlobalData(project) {
  const exists = globalProjectData.some(
    (p) => p.uniqueProjectID === project.uniqueProjectID
  );

  if (!exists) {
    globalProjectData.push({ ...project });
    saveProjectsToLocalStorage();   
    console.log('globalProjectData added', globalProjectData);
  } else {
    console.warn(`Project with ID ${project.uniqueProjectID} already exists. Skipped adding.`);
  }
}

function getAncestorsOfProject(projectID) {
  const ancestors = [];
  let current = getSingleProject(projectID);

  while (current?.parentProjectID) {
    ancestors.push(current.parentProjectID);
    current = getSingleProject(current.parentProjectID);
  }

  return ancestors;
}

function findDepth(projectID) {
  const numOfAncestors = getAncestorsOfProject(projectID);
  const depth = numOfAncestors.length + 1;

  return depth;
}

function syncProjectInGlobalData(projectData) {
  const index = globalProjectData.findIndex(
    (p) => p.uniqueProjectID === projectData.uniqueProjectID
  );

  if (index !== -1) {
    globalProjectData[index] = { ...projectData };
    saveProjectsToLocalStorage();    
  } else {
    console.warn(`Project with ID ${projectData.uniqueProjectID} not found. Cannot sync.`);
  }
}

function saveProjectsToLocalStorage() {
  try {
    localStorage.setItem('projectData', JSON.stringify(globalProjectData));
    console.log('%cSaved to localStorage', 'color: green;');
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

function loadProjectsFromLocalStorage() {
  try {
    const stored = localStorage.getItem('projectData');
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    console.log('%cLoaded from localStorage', 'color: green;');
    return parsed;
  } catch (err) {
    console.error('Error loading from localStorage:', err);
    return [];
  }
}

function deleteSingleProject(uniqueProjectID, projectTile) {
  
  // Handle project data deletion
  const index = globalProjectData.findIndex(
    p => p.uniqueProjectID === uniqueProjectID
  );

  if (index !== -1) {
    globalProjectData.splice(index, 1);
    saveProjectsToLocalStorage();  
    console.log(`Project "${uniqueProjectID}" deleted successfully.`);
  }

  // Handle tile deletion
  const tile = projectTile || document.querySelector(`.projectTile[projectid="${uniqueProjectID}"]`);
  if (tile) tile.remove();

  // console.log("Global Project Data after deletion:", globalProjectData);
}

async function triggerDeleteProjectCascade(projectData, projectTile) {
  console.log(`Project ${projectData.uniqueProjectID} is being deleted`);

  // Handle delete or TO-DO: move children to another parent project.
  try {
    //
    const allChildren = getAllChildren(projectData.uniqueProjectID);
    const childCount = allChildren.length;

    if(childCount > 0) {
      const dataForMiniForm = {
        formType: 'confirmDeleteChildren',
        quantityOfChildren: childCount,
        projectData: { ... projectData },
      };

      await requestConfirmation(dataForMiniForm);
      // console.log('Child deletion confirmed — proceeding with delete.');

      // Loop to delete all identified children. 
      allChildren.forEach(child => {
        const childUniqueID = child.uniqueProjectID;
        deleteSingleProject(childUniqueID);
      });
    } 
    
  } catch (error) {
    console.log('Deletion of children canceled:', error.message);
    return; // End process if children are not handled.
  }

  // Delete Parent
  try {
    const dataForMiniForm = {
      formType: 'confirmDeleteParent',
      projectData: { ... projectData },
    };

    await requestConfirmation(dataForMiniForm); 
    // console.log('Parent deletion confirmed — proceeding with delete.');

    deleteSingleProject(projectData.uniqueProjectID);
  } catch (err) {
    console.log('Deletion of parent canceled:', err.message);
  }
}

async function triggerUploadProjectData() {
  const input = document.getElementById('uploadProjectDataInput');
  
  // open file picker
  input.click();

  // once a file is selected, call your uploadProjectData function
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed)) throw new Error("Uploaded data must be an array of projects.");

      dataForMiniForm = {
        formType: 'confirmUploadData',
      }
      await renderMiniForm(dataForMiniForm);

      // overwrite globalProjectData
      globalProjectData.length = 0;
      globalProjectData.push(...parsed);

      saveProjectsToLocalStorage();
      renderProjectsToDash();

      console.log("%cData uploaded successfully!", "color: green;");
    } catch (err) {
      console.error("Invalid JSON upload:", err);
    }

    input.value = ""; // reset so same file can be uploaded again
  };
}

async function downloadProjectData() {

  const data = JSON.stringify(globalProjectData, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const dataForMiniForm = {
    formType: 'collectDownloadTitle',
    dateForDownload: `${(["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][new Date().getMonth()])+String(new Date().getDate()).padStart(2,"0")}`,
  };
  const requestConfirmation = await renderMiniForm(dataForMiniForm);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${requestConfirmation.downloadTitle}`;
  a.click();

  URL.revokeObjectURL(url);
}

function setProjectPinned(projectData, pinToDash) {

  // Assign pinToDash value
  projectData.pinToDash = Boolean(pinToDash);
  syncProjectInGlobalData(projectData);
}

function buildGlobalProjectTree() {
  const map = new Map();

  globalProjectData.forEach(p => {
    map.set(p.uniqueProjectID, { ...p, children: [] });
  });

  const roots = [];

  map.forEach(node => {
    if (node.parentProjectID) {
      map.get(node.parentProjectID)?.children.push(node);
    } else {
      roots.push(node);
    }
  });

  globalProjectTree = roots;
  return roots;
}

function updateProjectStatusAndAncestors(projectData, newStatus) {

  // Update the project status
  projectData.projectStatus = newStatus;
  syncProjectInGlobalData(projectData); // Make sure to sync with global data
  
  // If the project has a parent, propagate the status change upwards
  if (projectData.parentProjectID) {
    const parentProject = getSingleProject(projectData.parentProjectID);
    if (parentProject && parentProject.projectStatus !== newStatus) {
      updateProjectStatusAndAncestors(parentProject, newStatus);
    }
  }
}

function updateProjectStatus(projectData, newStatus) {

  projectData.projectStatus = newStatus;
  syncProjectInGlobalData(projectData); 
}

function pauseInProgressDescendents(projectData) {

  const children = getAllChildren(projectData.uniqueProjectID);
  children.forEach(child => {
    console.log('children found:', child);
    if (child.projectStatus === 'In Progress') {
      updateProjectStatus(child, 'Paused');

      const projectView = document.querySelector('.projectView');
      reRenderTaskList(projectView, projectData);
    }
  });
}