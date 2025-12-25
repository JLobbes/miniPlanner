// /js/dashboard.js



function addSearchProjectTreeListener() {

  const searchProjectTreeBtn = document.querySelector('#searchProjectTreeBtn');
  searchProjectTreeBtn.addEventListener('click', () => {
    openSearchProjectTreeView();
    // renderSearchProjectTree();
    renderRadialProjectTree();
  });

  const ctrlSHandler = (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      searchProjectTreeBtn.click();
    }
  };

  document.addEventListener('keydown', ctrlSHandler);
}

function addUploadProjectDataListener() {

  const uploadProjectDataBtn = document.querySelector('#uploadDataBtn');
  uploadProjectDataBtn.addEventListener('click', () => {
    triggerUploadProjectData();
  });
}

function addDownloadProjectDataListener() {

  const downloadProjectDataBtn = document.querySelector('#downloadDataBtn');
  downloadProjectDataBtn.addEventListener('click', () => {
    downloadProjectData();
  });
}

function hideDashboardActionsElipses() {
  
  const dashboardActionsDropDownBtn = document.querySelector('#dashboardActions');
  dashboardActionsDropDownBtn.style.display = 'none';
}

function showDashboardActions() {

  const dashboardActionsDropDownBtn = document.querySelector('#dashboardActions');
  dashboardActionsDropDownBtn.style.display = '';
}