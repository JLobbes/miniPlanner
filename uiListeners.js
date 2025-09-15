// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  renderProjectsToDash();
  console.log('Page loaded and ready!');

});

const testData = [
  { 
    uniqueProjectID: "proj_7f9b3d21e0c4",
    projectTitle: "Test Project 1",
    projectDescription: `Some mumbo jumbo for my description.`,
    projectStatus: "In Progress",
    created: '2023-07-08T16:38:22Z',
    timeLog: [
      { date: '2023-07-16T17:38:22Z',
        time: 47, // minutes
      },
      { date: '2023-07-17T17:38:22Z',
        time: 23, // minutes
      },
    ],
    noteLog: [
      { date: '2023-07-16T17:38:22Z',
        note: 'Left off writing xyz...', // just text.
      },
      { date: '2023-07-17T17:38:22Z',
        time: 'Don\'t forget to turn off the lights.', // just text
      },
    ],
    parentProjectID: null,
  },
  { 
    uniqueProjectID: "proj_mickey1234",
    projectTitle: "Mickey’s Magical Hat",
    projectDescription: `Helping Mickey find the magic to make his hat float and dance!`,
    projectStatus: "In Progress",
    created: '2025-09-01T09:00:00Z',
    timeLog: [
      { date: '2025-09-02T10:00:00Z', time: 42 },
      { date: '2025-09-03T15:00:00Z', time: 30 },
    ],
    noteLog: [
      { date: '2025-09-02T11:00:00Z', note: "Oops! The hat floated away again..." },
      { date: '2025-09-03T16:00:00Z', note: "Try adding some fairy dust next time!" },
    ],
    parentProjectID: null,
  },
  { 
    uniqueProjectID: "proj_bugs5678",
    projectTitle: "Bugs Bunny’s Carrot Contraption",
    projectDescription: `Inventing the ultimate carrot-powered rocket for a quick getaway!`,
    projectStatus: "Delayed (Elmer keeps chasing)",
    created: '2025-09-05T14:30:00Z',
    timeLog: [
      { date: '2025-09-06T10:00:00Z', time: 55 },
      { date: '2025-09-07T12:00:00Z', time: 20 },
    ],
    noteLog: [
      { date: '2025-09-06T11:30:00Z', note: "Added too many carrots—it's now a veggie overload!" },
      { date: '2025-09-07T13:00:00Z', note: "Need to hide from Elmer before testing again." },
    ],
    parentProjectID: "proj_mickey1234",
  }
]

const homeView = document.getElementById('homeView');
const projectView = document.getElementsByClassName('projectView')[0];
const newProjBtn = document.querySelectorAll('.newProjectButton')[0];

homeView.addEventListener('click', () => {
  openProjectView();
});

newProjBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevents the event from bubbling up to homeView
  closeProjectView();
});

function openProjectView() {
  if (projectView.classList.contains('active')) {
    projectView.classList.remove('active');
  }
}

function closeProjectView() {
  projectView.classList.add('active');
}

function renderProjectsToDash() {
  const container = document.getElementById('homeViewProjectsWrapper');
  
  // Clear existing projects (except the newProjectButton)
  const newProjBtn = container.querySelector('.newProjectButton');
  container.innerHTML = '';
  container.appendChild(newProjBtn);

  // Filter and render top-level projects
  const topLevelProjects = testData.filter(p => p.parentProjectID === null);
  topLevelProjects.forEach(project => {
    const tile = createProjectTile(project);
    container.appendChild(tile);
  });
}

// Create the full project tile element
function createProjectTile(project) {
  const tile = document.createElement('div');
  tile.className = 'projectTile';

  tile.appendChild(createProjectTitle(project.projectTitle));
  tile.appendChild(createProjectDescription(project.projectDescription));
  tile.appendChild(createProgressBar(project));
  tile.appendChild(createProjectActions());

  return tile;
}

// Title section
function createProjectTitle(titleText) {
  const title = document.createElement('h3');
  title.className = 'projectTitle';
  title.innerHTML = `<i class="fa-solid fa-folder"></i> ${titleText}`;
  return title;
}

// Description paragraph
function createProjectDescription(descText) {
  const desc = document.createElement('div');
  desc.className = 'projectDescription';
  desc.textContent = descText;
  return desc;
}

// Progress bar + task info
function createProgressBar(project) {
  const progressWrapper = document.createElement('div');
  progressWrapper.className = 'progressBarWrapper';

  const percent = calculateProjectProgress(project);
  const taskCount = calculateProjectTaskCount(project);
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
        <p class="projectStatusBubble">${status}</p>
      </div>
    </div>
  `;

  return progressWrapper;
}

// Calculate percent complete based on immediate subProjects found via parentProjectID
function calculateProjectProgress(testData, projectID) {
  try {
    if (!projectID) return 0;

    const tasks = testData.filter(p => p.parentProjectID === projectID);
    if (tasks.length === 0) return 0;

    const completeCount = tasks.filter(t => t.projectStatus.toLowerCase() === 'complete').length;
    return Math.round((completeCount / tasks.length) * 100);
  } catch (error) {
    console.error('Error calculating project progress:', error);
    return 0;
  }
}

// Calculate number of immediate subProjects/Tasks (one level deep, excluding nested children)
function calculateProjectTaskCount(testData, projectID) {
  try {
    if (!projectID) return 0;

    // Find direct children of the project
    const children = testData.filter(p => p.parentProjectID === projectID);

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
