function generateUniqueProjectID() {
  let id;
  const existingIDs = globalProjectData.map(p => p.uniqueProjectID);
  do {
    id = 'proj_' + Math.random().toString(36).slice(2, 12);
  } while (existingIDs.includes(id));
  return id;
}

function createBlankProject() {
  return {
    uniqueProjectID: generateUniqueProjectID(),
    projectTitle: 'New Project',
    projectDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    projectStatus: 'Planned',
    created: new Date().toISOString(),
    timeLog: [],
    noteLog: [],
    parentProjectID: null,
  };
}

function addProjectToGlobalData(project) {
  const exists = globalProjectData.some(
    (p) => p.uniqueProjectID === project.uniqueProjectID
  );

  if (!exists) {
    globalProjectData.push({ ...project }); // shallow copy for safety
  } else {
    console.warn(`Project with ID ${project.uniqueProjectID} already exists. Skipped adding.`);
  }
}

function syncProjectInGlobalData(project) {
  const index = globalProjectData.findIndex(
    (p) => p.uniqueProjectID === project.uniqueProjectID
  );

  if (index !== -1) {
    globalProjectData[index] = { ...project }; // replace with new object
  } else {
    console.warn(`Project with ID ${project.uniqueProjectID} not found. Cannot sync.`);
  }
}


function deleteProject(projectData, projectTile) {
  console.log(`Project ${projectData.uniqueProjectID} is being deleted`);

  // Handle Data Deletion
  // Find the index of the project with the given ID
  const index = globalProjectData.findIndex(projectInGlobalData => projectInGlobalData.uniqueProjectID === projectData.uniqueProjectID);

  // If the project exists, remove it
  if (index !== -1) {
    globalProjectData.splice(index, 1);
    console.log(`Project "${projectData.uniqueProjectID}" deleted successfully.`);
  } else {
    console.log(`Project "${projectData.uniqueProjectID}" not found.`);
  }

  console.log("Global Project Data after deletion:", globalProjectData);
  
  // Handle tile deletion
  if(projectTile) {
    projectTile.remove();
  } else {
    const projectTile = document.querySelector(`.projectTile[projectid="${projectData.uniqueProjectID}"]`);
    console.log('project tile:', projectTile);
    projectTile.remove();
  }
} 

