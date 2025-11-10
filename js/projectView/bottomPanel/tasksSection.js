// js/projectView/bottomPanel/tasksSection.js

// Tasks Section
function createTasksWrapper(projectData) {
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
      <h3 class="taskName">${task.projectTitle}</h3>
      <div class="taskStatusBubble statusShowing${task.projectStatus.replace(' ', '')}">${task.projectStatus}</div>
    `;
    tasksList.appendChild(taskDiv);
  });

  return wrapper;
}
