// js/searchProjectTree.js

function createSearchProjectTreeView() {

  const searchProjectTreeView = document.createElement('div');
  searchProjectTreeView.className = 'searchProjectTreeView';

  createSearchProjectTreeViewHeader(searchProjectTreeView);

  return searchProjectTreeView;
}

function createSearchProjectTreeViewHeader(searchProjectTreeView) {

  const header = document.createElement('div');
  header.className = 'searchProjectTreeHeader';

  const escapeSearchViewBtn = document.createElement('button')
  escapeSearchViewBtn.className = 'escapeSearchViewBtn';
  escapeSearchViewBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`
  header.append(escapeSearchViewBtn);
  searchProjectTreeView.append(header);

  addCloseSearchProjectTreeListener(searchProjectTreeView, escapeSearchViewBtn);

  return header;
}

function addCloseSearchProjectTreeListener(searchProjectTreeView, escapeSearchViewBtn) {
  escapeSearchViewBtn.addEventListener('click', () => {
    closeSearchProjectTreeView(searchProjectTreeView, escHandler)
  });

  const escHandler = addCloseSearchProjectTreeEscapePressListener(escapeSearchViewBtn);
}

function addCloseSearchProjectTreeEscapePressListener(escapeSearchViewBtn) {

  const escHandler = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      escapeSearchViewBtn.click();   
    }
  };

  document.addEventListener('keydown', escHandler);
  return escHandler;
}

function openSearchProjectTreeView() {
  
  openedSearchViews = document.querySelector('.searchProjectTreeView');
  if(openedSearchViews) return;
  
  const searchProjectTreeView = createSearchProjectTreeView();
  document.body.append(searchProjectTreeView);
  
  triggerDropDown({ element: searchProjectTreeView, className: 'active', delay: 20, hideDashboardActions: false });
};


function closeSearchProjectTreeView(searchProjectTreeView, escHandler) {
  
  searchProjectTreeView.classList.remove('active');
  setTimeout(() => {
    // Allow for slide up animation
    document.removeEventListener('keydown', escHandler);
    searchProjectTreeView.remove();
  }, 1500);
}