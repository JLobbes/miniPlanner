// js/projectView/bottomPanel/tasksSection.js

// Listeners
function addNewTaskListener(projectData, projectView) {
  // Applies to large add 'New Task' button in tasksSection

  const addNewTaskBtn = projectView.querySelector('.newTaskBtn');
  addNewTaskBtn.addEventListener('click', () => {
    const parentID = projectData.uniqueProjectID;
    openNewProject(parentID);
  });
}

function addOpenTaskListener (task, taskUniqueID) {
  // Applies to large task buttons in tasksList

  // TO-DO: Add Listeners to individual task <elem>
  task.addEventListener('click', () => {
    const projectData = getSingleProject(taskUniqueID);
    openProjectView(projectData, true);
  });

  // TO-DO: Re-render tasksWrapper
  //        Ensure render includes back button
}

// Element construction
function createTasksWrapper(projectData, projectView) {
  const wrapper = document.createElement('div');
  wrapper.className = 'tasksWrapper';

  const header = document.createElement('h2');
  header.textContent = 'Tasks';
  wrapper.appendChild(header);

  const newTaskBtn = document.createElement('div');
  newTaskBtn.className = 'newTaskBtn';
  newTaskBtn.innerHTML = `<h3><i class="fa-regular fa-rectangle-list"></i> New Task</h3>`;
  wrapper.appendChild(newTaskBtn);

  const tasksList = document.createElement('div');
  tasksList.className = 'tasksList';
  wrapper.appendChild(tasksList);

  // Render tasks (immediate children)
  const tasks = globalProjectData.filter(p => p.parentProjectID === projectData.uniqueProjectID);
  tasks.forEach(task => {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task';
    taskDiv.innerHTML = `
      <i class="fa-regular fa-rectangle-list"></i>
      <h3 class="taskName" taskID="${task.uniqueProjectID}">${task.projectTitle}</h3>
      <div class="taskStatusBubble statusShowing${task.projectStatus.replace(' ', '')}">${task.projectStatus}</div>
    `;
    addOpenTaskListener(taskDiv, task.uniqueProjectID);
    tasksList.appendChild(taskDiv);
  });

  return wrapper;
}
