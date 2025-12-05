// js/main.js

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  loadDataToGlobalProjects();
  renderProjectsToDash();

  // TO-DO: decide wethere these two should be in dashboard.js or not.
  addDownloadProjectDataListener();
  addUploadProjectDataListener();
  console.log('Page loaded and ready!');
  
});

const homeView = document.getElementById('homeView');
let projectViews = document.getElementsByClassName('projectView');
const newProjBtn = document.querySelectorAll('.newProjectButton')[0];

homeView.addEventListener('click', () => {
  closeAllProjectViews({});
});

newProjBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevents the event from bubbling up to homeView
  openNewProject({});
});

let draggedItem = null; // Used globally
let depth = null; // Used globally
const globalProjectData = [];

function loadDataToGlobalProjects() {
  globalProjectData.length = 0; // clear existing

  const storedData = loadProjectsFromLocalStorage();

  if (storedData.length > 0) {
    globalProjectData.push(...storedData);
  }

  console.log('Loaded project data:', globalProjectData);
}

