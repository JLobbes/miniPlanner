function renderProjectsToDash() {
  const container = document.getElementById('homeViewProjectsWrapper');
  
  // Clear existing projects (except the newProjectButton)
  const newProjBtn = container.querySelector('.newProjectButton');
  container.innerHTML = '';
  container.appendChild(newProjBtn);

  // Filter and render top-level projects
  const topLevelProjects = globalProjectData.filter(p => p.parentProjectID === null);
  topLevelProjects.forEach(project => {
    const tile = createProjectTile(project);
    container.appendChild(tile);
  });
}

// Create the full project tile element
function createProjectTile(project) {
  const tile = document.createElement('div');
  tile.className = 'projectTile';
  tile.setAttribute('projectid', project.uniqueProjectID); // ID gets converted to lowercase during setAttribute() call

  tile.appendChild(createProjectTitle(project.projectTitle));
  tile.appendChild(createProjectDescription(project.projectDescription));
  tile.appendChild(createProgressBar(project));
  tile.appendChild(createProjectActions());

  addTileEventListeners(project, tile) // TO-DO: Group all scattered listeners

  return tile;
}

function addTileEventListeners(projectData, projectTile) {
  
  projectTile.addEventListener('click', () => openProjectView(projectData));

  const deleteBtn = projectTile.querySelector('.projectActionsDropDown button[title="Delete"]');
  deleteBtn.addEventListener('click', async (e) => {
    e.stopPropagation(); // prevent project from opening
    await deleteProject(projectData, projectTile)
  });
  
}


// Title section
function createProjectTitle(titleText) {
  const title = document.createElement('h3');
  title.className = 'projectTitle';
  title.innerHTML = `<i class="fa-solid fa-folder"></i> ${titleText}`;
  if(titleText.length > 15) title.title = titleText; // A tooltip for long titles
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
function createProgressBar(project) {
  const progressWrapper = document.createElement('div');
  progressWrapper.className = 'progressBarWrapper';

  const percent = calculateProjectProgress(globalProjectData, project.uniqueProjectID);
  const taskCount = calculateProjectTaskCount(globalProjectData, project.uniqueProjectID);
  const status = project.projectStatus;

  progressWrapper.innerHTML = `
    <div class="progressBarDetailsWrapper">
      <div class="progressBarLabelWrapper">
        <p class="progressBarLabel">Progress</p>
      </div>
      <div class="projectBarPercentageWrapper">
        <p class="projectBarPercentage">${percent} %</p>
      </div>
    </div>
    <div class="progressBar">
      <div class="progressBarBackground">
        <div class="progressBarFill" style="width: ${percent}%"></div>
      </div>
    </div>
    <div class="progressBarDetailsWrapper">
      <div class="taskQuantityWrapper">
        <p class="taskQuantity">${taskCount} Task${taskCount !== 1 ? 's' : ''}</p>
      </div>
      <div class="projectStatusWrapper">
        <p class="projectStatusBubble statusShowing${status.replace(' ', '')}">${status}</p>
      </div>
    </div>
  `;

  return progressWrapper;
}

// Calculate percent complete based on immediate subProjects found via parentProjectID
function calculateProjectProgress(globalProjectData, projectID) {
  try {
    if (!projectID) return 0;

    const tasks = globalProjectData.filter(p => p.parentProjectID === projectID);
    if (tasks.length === 0) return 0;

    const completeCount = tasks.filter(t => t.projectStatus.toLowerCase() === 'complete').length;
    return Math.round((completeCount / tasks.length) * 100);
  } catch (error) {
    console.error('Error calculating project progress:', error);
    return 0;
  }
}

// Calculate number of immediate subProjects/Tasks (one level deep, excluding nested children)
function calculateProjectTaskCount(globalProjectData, projectID) {
  try {
    if (!projectID) return 0;

    // Find direct children of the project
    const children = globalProjectData.filter(p => p.parentProjectID === projectID);

    return children.length;
  } catch (error) {
    console.error('Error calculating task count:', error);
    return 0;
  }
}

// Ellipsis action menu (currently static)
function createProjectActions() {
  const wrapper = document.createElement('div');
  wrapper.className = 'projectActionsWrapper';

  wrapper.innerHTML = `
    <div class="projectActions">
      <span>...</span>
      <div class="projectActionsDropDown">
        <button title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
        <button title="Delete"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
  `;

  return wrapper;
}