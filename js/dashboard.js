// /js/dashboard.js

function addDownloadProjectDataListener() {

  downloadProjectDataBtn = document.querySelector('#downloadDataBtn');
  downloadProjectDataBtn.addEventListener('click', () => {
    downloadProjectData();
  });
  
}