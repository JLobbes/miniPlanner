// /js/dashboard.js

function addDownloadProjectDataListener() {

  downloadProjectDataBtn = document.querySelector('#downloadDataBtn');
  downloadProjectDataBtn.addEventListener('click', () => {
    downloadProjectData();
  });
  
}

function hideDashboardActions() {
  console.log("hideDashboardActionsDropDown called");

  const dashboardActionsDropDownBtn = document.querySelector('#dashboardActions');
  dashboardActionsDropDownBtn.style.display = 'none';
}

function showDashboardActions() {

  const dashboardActionsDropDownBtn = document.querySelector('#dashboardActions');
  dashboardActionsDropDownBtn.style.display = '';
}