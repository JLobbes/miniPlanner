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
    const tile = createProjectTile({ projectData: structuredClone(project) });
    container.appendChild(tile);
  });

}

// Create the full project tile element
function createProjectTile({ projectData, forDashboard = true, forPopUp = false }) {
  const tile = document.createElement('div');
  tile.className = 'projectTile';
  tile.draggable = 'true';
  tile.setAttribute('projectid', projectData.uniqueProjectID); // ID gets converted to lowercase during setAttribute() call

  const renderAsSingleTask = !hasChildren(projectData.uniqueProjectID) || !projectData.parentProjectID === null;

  tile.appendChild(createProjectTitle({ titleText: projectData.projectTitle, renderAsSingleTask}));
  tile.appendChild(createProjectDescription(projectData.projectDescription));
  tile.appendChild(createProgressBar({ projectData, editable: false, renderAsSingleTask, forProjectTile: true }));
  
  if(forPopUp && !forDashboard) tile.appendChild(createProjectActions({ tapeAction: true }));
  if(forDashboard && !forPopUp) tile.appendChild(createProjectActions({ tapeAction: false }));

  addTileEventListeners({ projectData, projectTile: tile, forDashboard, forPopUp }) // TO-DO: Group all scattered listeners

  return tile;
}

function addTileEventListeners({ projectData, projectTile, forDashboard, forPopUp }) {
  
  projectTile.addEventListener('click', (e) => {
    if (e.target.closest('.projectActionsDropDown button')) return;

    // otherwise
    openProjectView(projectData);
  });

  const deleteBtn = projectTile.querySelector('.projectActionsDropDown .deleteActionBtn');
  deleteBtn.addEventListener('click', async (e) => {
    e.stopPropagation(); // prevent project from opening

    const searchProjectTreeViewOpen = document.querySelector('.searchProjectTreeView');
    if (searchProjectTreeViewOpen) {
      
    }

    await triggerDeleteProjectCascade(projectData, projectTile);
  });

  if(forPopUp) {
    const tapeUpProjectBtn = projectTile.querySelector('.projectActionsDropDown .tapeUpActionBtn');
    tapeUpProjectBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent project from opening
      tapeUpProjectTile(projectTile);
    });
  }
  
  if(forPopUp && !forDashboard) addReLocateDragLogicForTile(projectTile);
  if(forDashboard && !forPopUp) addRerrangeDragLogicForTile(projectTile);

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
function addRerrangeDragLogicForTile(projectTile) {

  projectTile.addEventListener('dragstart', handleDragStart);
  projectTile.addEventListener('dragover', handleDragOver);
  projectTile.addEventListener('drop', handleDrop);

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
    const tiles = Array.from(document.querySelectorAll('#homeViewProjectsWrapper .projectTile'));
    tiles.forEach((tile, index) => {
      const projectID = tile.getAttribute('projectid');
      const singleProject = globalProjectData.find(p => p.uniqueProjectID === projectID);
      if (singleProject) singleProject.placement.dashboardOrder = index + 1;
    });

    saveProjectsToLocalStorage();
  }
}

// Drag Logic for Tile Rearrangement
function addReLocateDragLogicForTile(projectTile) {

  projectTile.addEventListener('dragstart', handleDragStart);
  projectTile.addEventListener('dragover', handleDragOver);
  projectTile.addEventListener('drop', handleDrop);

  // Only add viewport listeners once
  const viewport = document.querySelector('.searchProjectTreeCanvas');
  if (!viewport.dataset.dragListenerAdded) {
    viewport.addEventListener('dragover', handleDragOver);
    viewport.addEventListener('drop', handleDrop);
    viewport.dataset.dragListenerAdded = "true";
  }

  function handleDragStart(e) {
    draggedItem = this; // store reference
  }

  function handleDragOver(e) {
    e.preventDefault(); // required to allow drop
  }

  function handleDrop(e) {
    e.preventDefault();
    const landedOnProjectTile = e.target.closest('.projectTile');
    if (landedOnProjectTile === draggedItem) return;
    const projectTilePopUp = draggedItem.parentElement; // capture immediately

    if (landedOnProjectTile) {
        const newParentID = landedOnProjectTile.getAttribute('projectID');
        const childID = draggedItem.getAttribute('projectID');
        if (childID === 'theVirtualRoot') return; // Don't allow the dashboard to be put in a child.
        updateProjectLocation(childID, newParentID);
    } else if (projectTilePopUp) {
        // Position first
        const rect = projectTilePopUp.getBoundingClientRect();
        projectTilePopUp.style.left = e.clientX - rect.width / 2 + 'px';
        projectTilePopUp.style.top = e.clientY - rect.height / 2 - 58 + 'px';

        // Then tape up (idempotent)
        if (!projectTilePopUp.tapedUp) {
            projectTilePopUp.tapedUp = true;
            const tapeUpBtn = projectTilePopUp.querySelector('.projectActions .tapeUpActionBtn');
            tapeUpBtn.style.display = 'none';

            const unTapeButton = document.createElement('button');
            unTapeButton.className = 'unTapeBtn';
            unTapeButton.innerHTML = "<span class='fa-solid fa-xmark'></span>";
            addUnTapeProjectTilePopUpListener(unTapeButton, projectTilePopUp);
            projectTilePopUp.appendChild(unTapeButton);
        }
    }
  }

  async function updateProjectLocation(childID, newParentID) {
    
    await updateProjectParent(childID, newParentID);
    
    // Now the data is updated, safe to re-render
    
    const previousZoomLevel = globalVariables.projectTreeScale;
    storeFocusNode(newParentID);
    reRenderProjectTreeViewPort();
    restoreFocusNode(previousZoomLevel);
  }
}

function tapeUpProjectTile(projectTile) {

  const projectTilePopUp = projectTile.parentElement;
  
  if(projectTilePopUp.tapedUp) return;
  projectTilePopUp.tapedUp = true;

  const tapeUpBtn = projectTilePopUp.querySelector('.projectActions .tapeUpActionBtn');
  tapeUpBtn.style.display = 'none';

  const unTapeButton = document.createElement('button');
  unTapeButton.className = 'unTapeBtn';
  unTapeButton.innerHTML = `<span class='fa-solid fa-xmark'></span>`;

  addUnTapeProjectTilePopUpListener(unTapeButton, projectTilePopUp);
  
  projectTilePopUp.appendChild(unTapeButton);
}

function addUnTapeProjectTilePopUpListener(unTapeButton, projectTilePopUp) {

  unTapeButton.addEventListener('click', () => {
    projectTilePopUp.remove();
  });
};