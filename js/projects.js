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

