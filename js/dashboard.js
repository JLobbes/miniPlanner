// /js/dashboard.js



function addSearchProjectTreeListener() {

  const searchProjectTreeBtn = document.querySelector('#searchProjectTreeBtn');
  searchProjectTreeBtn.addEventListener('click', () => {
    openSearchProjectTreeView();
  });

  globalListeners.ctrlS = () => searchProjectTreeBtn.click();
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