// /js/dashboard.js


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

function hideDashboardActions() {
  
  const dashboardActionsDropDownBtn = document.querySelector('#dashboardActions');
  dashboardActionsDropDownBtn.style.display = 'none';
}

function showDashboardActions() {
  console.log("showDashboardActions called");

  const dashboardActionsDropDownBtn = document.querySelector('#dashboardActions');
  dashboardActionsDropDownBtn.style.display = '';
}