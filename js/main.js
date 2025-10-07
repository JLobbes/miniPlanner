// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  loadProjectData();
  renderProjectsToDash();
  console.log('Page loaded and ready!');
  
});

const homeView = document.getElementById('homeView');
let projectViews = document.getElementsByClassName('projectView');
const newProjBtn = document.querySelectorAll('.newProjectButton')[0];

homeView.addEventListener('click', () => {
  closeProjectViews();
});

newProjBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevents the event from bubbling up to homeView
  openNewProject();
});

function closeProjectViews() {
  projectViews = document.getElementsByClassName('projectView');

  for (let i = 0; i < projectViews.length; i++) {
    const openProject = projectViews[i];
    
    if (openProject.classList.contains('active')) {
      openProject.classList.remove('active');
    }
  }
}

function openNewProject() {
  const newProj = createBlankProject();
  globalProjectData.push(newProj);
  renderProjectsToDash();
}

const globalProjectData = [];

function loadProjectData() {
  globalProjectData.length = 0; // clear existing
  globalProjectData.push(...testData.map(project => ({ ...project })));
  console.log('globalProjectData:', globalProjectData);
}

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
