// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  loadProjectData();
  renderProjectsToDash();
  console.log('Page loaded and ready!');
  
});

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

const globalProjectData = [];

function loadProjectData() {
  globalProjectData.length = 0; // clear existing
  globalProjectData.push(...testData.map(project => ({ ...project })));
  console.log('globalProjectData:', globalProjectData);
}