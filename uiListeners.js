// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded and ready!');
});

const homeView = document.getElementById('homeView');
const projectView = document.getElementById('projectView');
const newProjBtn = document.querySelectorAll('.newProjectButton')[0];

homeView.addEventListener('click', () => {
  console.log('home view has been clicked')
  if (projectView.classList.contains('active')) {
    projectView.classList.remove('active');
  }
});

newProjBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevents the event from bubbling up to homeView
  console.log('Create a new project!');
  projectView.classList.add('active');
});
