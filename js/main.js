// js/main.js

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  loadDataToGlobalProjects();
  loadSettings();
  renderProjectsToDash();

  // TO-DO: decide whether these three should be in dashboard.js or not.
  addGlobalListeners();
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
      if (e.target.closest('.projectView')) return;
      if (e.target.closest('#searchProjectTreeBtn')) return;
      if (e.target.closest('.escapeSearchViewBtn')) return;
    
      // Otherwise
      closeAllProjectViews({});
    });
  }

  catch(e) {
    console.error('return to dashboard click listener failed to add added');
  }
}

newProjBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevents the event from bubbling up to homeView
  openNewProject({});
});

let draggedItem = null; // Used globally
let depth = null; // Used globally
let handleProjViewEscape = null; //Used globally 
const globalProjectData = [];

const globalVariables = {
  projectTreePopUpsEnabled: false,
  globalProjectTree: [], // Data
  projectTreeX: 0,
  projectTreeY: 0,
  projectTreeScale: 1,
  projectTreeFocusNodeID: null,
  filteredOutStatuses: [],

  SETTINGS_KEY: 'miniPlannerSettings',
}

function loadDataToGlobalProjects() {
  globalProjectData.length = 0; // clear existing

  const storedData = loadProjectsFromLocalStorage();

  if (storedData.length > 0) {
    globalProjectData.push(...storedData);
  }

  console.log('Loaded project data:', globalProjectData);
}

function loadSettings() {
  const stored = localStorage.getItem(globalVariables.SETTINGS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);

      globalVariables.filteredOutStatuses = parsed.filterOutStatuses;
    } catch (err) {
      console.error('Failed to parse settings from localStorage:', err);
      globalVariables.filteredOutStatuses = [];
    }
  } else {
    globalVariables.filteredOutStatuses = [];
  }
}

function saveSettings() {
  try {
    const settings = {
      filterOutStatuses: structuredClone(globalVariables.filteredOutStatuses),
    }

    localStorage.setItem(globalVariables.SETTINGS_KEY, JSON.stringify(settings));
    console.log('Settings saved to local storage');
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}