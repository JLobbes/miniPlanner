function openProjectViewByID(project) {
  
  if (!project) {
    console.error('Project not found:', projectID);
    return;
  } else {
    console.log('working on project:', project.projectTitle);
  }

  // TO-DO: Make removal intelligent when nested project view becomes 
  //        a real item.
  // Remove any existing projectView
  // const existing = document.querySelector('.projectView');
  // if (existing) {
  //   existing.parentNode.removeChild(existing);
  // }

  // Create and append new projectView
  const projectView = createProjectView(project);
  document.body.appendChild(projectView);

  // Separately trigger drop down using timeouts
  triggerDropDown(projectView, 'active', 20);
}

// Create the full project view element
function createProjectView(project) {
  const projectView = document.createElement('div');
  projectView.className = 'projectView';
  projectView.classList.add('active');

  projectView.appendChild(createProjectViewTitleBar(project));

  return projectView;
}

// Title Section
function createProjectViewTitleBar(project) {
  const titleBarWrapper = document.createElement('div');
  titleBarWrapper.className = 'titleBarWrapper';

  const titleTextWrapper = document.createElement('div');
  titleTextWrapper.className = 'titleTextWrapper';

  const projectTitle = document.createElement('h3');
  projectTitle.className = 'projectTitle';
  projectTitle.innerHTML = `<i class="fa-solid fa-folder"></i> ${project.projectTitle}`;

  const projectDescription = document.createElement('div');
  projectDescription.className = 'projectDescription';
  projectDescription.textContent = project.projectDescription;

  titleTextWrapper.appendChild(projectTitle);
  titleBarWrapper.appendChild(titleTextWrapper);
  titleBarWrapper.appendChild(projectDescription);

  return titleTextWrapper;
}

function triggerDropDown(element, className = 'active', delay = 20) {
  element.classList.remove(className);
  // Force reflow to reset the animation
  void element.offsetWidth;
  setTimeout(() => {
    element.classList.add(className);
  }, delay);
}