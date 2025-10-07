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
  closeProjectView();
});

newProjBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevents the event from bubbling up to homeView
  openProjectView();
});

function closeProjectView() {
  projectViews = document.getElementsByClassName('projectView');
  console.log(projectViews);

  for (let i = 0; i < projectViews.length; i++) {
    const openProject = projectViews[i];
    
    if (openProject.classList.contains('active')) {
      openProject.classList.remove('active');
    }
  }
}

function openProjectView() {
  projectViews.classList.add('active');
}

const globalProjectData = [];

function loadProjectData() {
  globalProjectData.length = 0; // clear existing
  globalProjectData.push(...testData.map(project => ({ ...project })));
  console.log('globalProjectData:', globalProjectData);
}