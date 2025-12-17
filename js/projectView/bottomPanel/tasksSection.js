// js/projectView/bottomPanel/tasksSection.js

// Listeners
function addNewTaskListener(projectData, projectView) {
  // Applies to large add 'New Task' button in tasksSection

  const addNewTaskBtn = projectView.querySelector('.newTaskBtn');
  addNewTaskBtn.tabIndex = '3';
  addNewTaskBtn.addEventListener('click', () => {
    openNewProject({ parentID: projectData.uniqueProjectID, hasParent: true });

    // Re-render tasksWrapper
    reRenderTaskList(projectView, projectData)
  });
}

function addOpenTaskListener (task, taskUniqueID) {
  // Applies to large task buttons in tasksList

  // Add Listeners to individual task <elem>
  task.addEventListener('click', () => {
    const projectData = getSingleProject(taskUniqueID);
    openProjectView(projectData, true);
  });
}

// Drag Logic for Task Rearrangment, include listeners.

function addDragLogicForTask(taskDiv) {

  taskDiv.addEventListener('dragstart', handleDragStart);
  taskDiv.addEventListener('dragover', handleDragOver);
  taskDiv.addEventListener('drop', handleDrop);
  
  draggedItem = null;

  function handleDragStart(e) {
    draggedItem = this; // global variable, found in /js/main.js
  }
  
  function handleDragOver(e) {
    e.preventDefault(); // REQUIRED to allow drop
  }
  
  function handleDrop(e) {
    e.preventDefault();
    if (this !== draggedItem) {
      // swap elements
      const list = this.parentNode;
      list.insertBefore(draggedItem, this);
    }

    updateTaskOrder();
  }
  
  function updateTaskOrder() {
    const tasks = Array.from(document.querySelectorAll('.task'));
    
    tasks.forEach((task, index) => {
      const projectID = task.getAttribute('taskid');
      const singleProject = globalProjectData.find(p => p.uniqueProjectID === projectID);
      if (singleProject) singleProject.placement[`level${depth}Task`] = index + 1; // depth is a global variable, found in js/main.js
    });
    saveProjectsToLocalStorage();
  }
}

// Element construction
function createTasksWrapper(projectData, projectView) {
  const wrapper = document.createElement('div');
  wrapper.className = 'tasksWrapper';

  const header = document.createElement('h2');
  header.textContent = 'Tasks';
  wrapper.appendChild(header);

  const newTaskBtn = document.createElement('button');
  newTaskBtn.className = 'newTaskBtn';
  newTaskBtn.innerHTML = `<h3><i class="fa-regular fa-rectangle-list"></i> New Task</h3>`;
  wrapper.appendChild(newTaskBtn);

  const tasksList = document.createElement('div');
  tasksList.className = 'tasksList';
  wrapper.appendChild(tasksList);

  // Render tasks (immediate children)
  const clonedData = structuredClone(globalProjectData);
  
  const tasks = clonedData
    .filter(p => p.parentProjectID === projectData.uniqueProjectID)
    .sort((a, b) => (a.placement[`level${depth}Task`] ?? 0) - (b.placement[`level${depth}Task`] ?? 0)); // depth is a global variable, found in js/main.js
  
  tasks.forEach(task => {
    const renderAsSingleTask = !hasChildren(task.uniqueProjectID);

    const taskDiv = document.createElement('div');
    taskDiv.className = 'task';
    taskDiv.draggable = 'true';
    taskDiv.setAttribute('taskID', `${task.uniqueProjectID}`);
    taskDiv.innerHTML = `
      ${ renderAsSingleTask ? 
        '<i class="fa-regular fa-rectangle-list"></i>' :
        '<i class="fa-solid fa-folder"></i>'
      }
      ${ renderAsSingleTask ?
        `<h3 class="taskName">${task.projectTitle ? task.projectTitle : 'New Task'}</h3>` :
        `<h3 class="taskName">${task.projectTitle ? task.projectTitle : 'New Project'}</h3>` 
      }
      <div class="taskStatusBubble statusShowing${task.projectStatus.replace(' ', '')}">${task.projectStatus}</div>
    `;
    addOpenTaskListener(taskDiv, task.uniqueProjectID, projectData, projectView);
    addDragLogicForTask(taskDiv);
    tasksList.appendChild(taskDiv);
  });

  return wrapper;
}


