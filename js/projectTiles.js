function renderProjectsToDash() {
  const container = document.getElementById('homeViewProjectsWrapper');
  
  // Clear existing projects (except the newProjectButton)
  const newProjBtn = container.querySelector('.newProjectButton');
  container.innerHTML = '';
  container.appendChild(newProjBtn);

  // Filter and sort top-level projects
  const topLevelProjects = globalProjectData
    .filter(p => p.parentProjectID === null || p.pinToDash === true)
    .sort((a, b) => (a.placement.dashboardOrder ?? 0) - (b.placement.dashboardOrder ?? 0));

  topLevelProjects.forEach(project => {
    const tile = createProjectTile(structuredClone(project));
    container.appendChild(tile);
  });

  addDragLogicForTiles()
}

// Create the full project tile element
function createProjectTile(projectData) {
  const tile = document.createElement('div');
  tile.className = 'projectTile';
  tile.draggable = 'true';
  tile.setAttribute('projectid', projectData.uniqueProjectID); // ID gets converted to lowercase during setAttribute() call

  const renderAsSingleTask = !hasChildren(projectData.uniqueProjectID) || !projectData.parentProjectID === null;

  tile.appendChild(createProjectTitle({ titleText: projectData.projectTitle, renderAsSingleTask}));
  tile.appendChild(createProjectDescription(projectData.projectDescription));
  tile.appendChild(createProgressBar({ projectData, editable: false, renderAsSingleTask }));
  tile.appendChild(createProjectActions({}));

  addTileEventListeners(projectData, tile) // TO-DO: Group all scattered listeners

  return tile;
}

function addTileEventListeners(projectData, projectTile) {
  
  projectTile.addEventListener('click', () => openProjectView(projectData));

  const deleteBtn = projectTile.querySelector('.projectActionsDropDown button[title="Delete"]');
  deleteBtn.addEventListener('click', async (e) => {
    e.stopPropagation(); // prevent project from opening
    await triggerDeleteProjectCascade(projectData, projectTile);
  });
  
}

// Title section
function createProjectTitle({ titleText, renderAsSingleTask }) {
  const title = document.createElement('h3');
  title.className = 'projectTitle';
  if(renderAsSingleTask) title.innerHTML = `<i class="fa-solid fa-rectangle-list"></i> ${titleText ? titleText : 'New Task'}`;
  if(!renderAsSingleTask) title.innerHTML = `<i class="fa-solid fa-folder"></i> ${titleText ? titleText : 'New Project'}`;
  if(titleText && titleText.length > 15) title.title = titleText; // A tooltip for long titles
  return title;
}

// Description paragraph
function createProjectDescription(descText) {
  const desc = document.createElement('div');
  desc.className = 'projectDescription';
  desc.textContent = descText.length > 65 
    ? descText.slice(0, 65) + '...'
    : descText;
  return desc;
}

// Progress bar + task info
//    Logic reused from projectView
//    Logic can be found in /js/projectView/topPanel/progressBar.js

// Ellipsis action menu (i.e, projectActions)
//    was moved to /js/projectView/header.js

// Drag Logic for Tile Rearrangment

function addDragLogicForTiles() {

  const projectTiles = document.querySelectorAll('.projectTile');
  
  projectTiles.forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('drop', handleDrop);
  });

  function handleDragStart(e) {
    draggedItem = this; // store reference
  }
  
  function handleDragOver(e) {
    e.preventDefault(); // REQUIRED to allow drop
  }
  
  function handleDrop(e) {
    e.preventDefault();
    if (this !== draggedItem) {
      // swap elements
      const list = this.parentNode;
      list.insertBefore(draggedItem, this);
    }

    updateDashboardOrder();
  }
  
  function updateDashboardOrder() {
    const tiles = Array.from(document.querySelectorAll('.projectTile'));
    tiles.forEach((tile, index) => {
      const projectID = tile.getAttribute('projectid');
      const singleProject = globalProjectData.find(p => p.uniqueProjectID === projectID);
      if (singleProject) singleProject.placement.dashboardOrder = index + 1;
    });

    saveProjectsToLocalStorage();
  }
}

