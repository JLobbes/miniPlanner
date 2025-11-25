// js/main.js

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  loadDataToGlobalProjects();
  renderProjectsToDash();
  console.log('Page loaded and ready!');
  
});

const homeView = document.getElementById('homeView');
let projectViews = document.getElementsByClassName('projectView');
const newProjBtn = document.querySelectorAll('.newProjectButton')[0];

homeView.addEventListener('click', () => {
  closeAllProjectViews();
});

newProjBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevents the event from bubbling up to homeView
  openNewProject({});
});

const globalProjectData = [];

function loadDataToGlobalProjects() {
  globalProjectData.length = 0; // clear existing

  // Add test data during development
  globalProjectData.push(...testData.map(project => ({ ...project })));
  console.log('globalProjectData:', globalProjectData);
}

