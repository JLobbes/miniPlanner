function generateUniqueProjectID() {
  let id;
  const existingIDs = globalProjectData.map(p => p.uniqueProjectID);
  do {
    id = 'proj_' + Math.random().toString(36).slice(2, 12);
  } while (existingIDs.includes(id));
  return id;
}

function createBlankProject(parentProjectID) {
  return {
    uniqueProjectID: generateUniqueProjectID(),
    projectTitle: 'New Project',
    projectDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    projectStatus: 'Planned',
    created: new Date().toISOString(),
    timeLog: [],
    noteLog: [],
    parentProjectID: parentProjectID,
  };
}

function openNewProject({ parentID , hasParent}) {
  const newProj = createBlankProject(parentID || null);
  console.log('newProj created in openNewProj():', newProj);
  addProjectToGlobalData(newProj);
  renderProjectsToDash();
  openProjectView(newProj, hasParent || null);
}

function getAllChildren(parentID) {
  // Includes nested

  const directChildren = globalProjectData.filter(p => p.parentProjectID === parentID);
  const allChildren = [...directChildren];
  
  for (const child of directChildren) {
    allChildren.push(...getAllChildren(child.uniqueProjectID));
  }

  return allChildren;
}

function getSingleProject(projectID) {
  const singleProject = globalProjectData.filter(p => p.uniqueProjectID === projectID)[0];
  return singleProject;
}

function addProjectToGlobalData(project) {
  const exists = globalProjectData.some(
    (p) => p.uniqueProjectID === project.uniqueProjectID
  );

  if (!exists) {
    globalProjectData.push({ ...project }); // shallow copy for safety
    console.log('globalProjectData added', globalProjectData);
  } else {
    console.warn(`Project with ID ${project.uniqueProjectID} already exists. Skipped adding.`);
  }
}

function syncProjectInGlobalData(projectData) {
  const index = globalProjectData.findIndex(
    (p) => p.uniqueProjectID === projectData.uniqueProjectID
  );

  if (index !== -1) {
    globalProjectData[index] = { ...projectData }; // replace with new object
  } else {
    console.warn(`Project with ID ${projectData.uniqueProjectID} not found. Cannot sync.`);
  }
  console.log('globalProjectData after sync', globalProjectData);
}

function deleteSingleProject(uniqueProjectID, projectTile) {
  
  // Handle project data deletion
  const index = globalProjectData.findIndex(
    p => p.uniqueProjectID === uniqueProjectID
  );

  if (index !== -1) {
    globalProjectData.splice(index, 1);
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