// js/main.js

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  loadDataToGlobalProjects();
  renderProjectsToDash();

  // TO-DO: decide whether these three should be in dashboard.js or not.
  addSearchProjectTreeListener();
  addDownloadProjectDataListener();
  addUploadProjectDataListener();
  addReturnToDashboardListener();
  console.log('Page loaded and ready!');
  
});

const homeView = document.getElementById('homeView'); // Used Globally
let projectViews = document.getElementsByClassName('projectView');
const newProjBtn = document.querySelectorAll('.newProjectButton')[0];

function addReturnToDashboardListener() {
  try {
    homeView.addEventListener('click', (e) => {
      // Exclude from this listener.
      if (e.target.closest('.projectTile')) return;
      if (e.target.closest('#searchProjectTreeBtn')) return;
      if (e.target.closest('.escapeSearchViewBtn')) return;
    
      // Otherwise
      closeAllProjectViews({});
    });
  }

  catch(e) {
    console.error('return to dashboard click listener not added');
  }
  console.log('return to dashboard click listener added');
}

newProjBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevents the event from bubbling up to homeView
  openNewProject({});
});

let draggedItem = null; // Used globally
let depth = null; // Used globally
let handleProjViewEscape = null; //Used globally 
const globalProjectData = [];
let globalSearchableProjectTree = [];

function loadDataToGlobalProjects() {
  globalProjectData.length = 0; // clear existing

  const storedData = loadProjectsFromLocalStorage();

  if (storedData.length > 0) {
    globalProjectData.push(...storedData);
  }

  console.log('Loaded project data:', globalProjectData);
}

