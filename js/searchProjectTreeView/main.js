// js/searchProjectTree.js

function createSearchProjectTreeView() {

  const searchProjectTreeView = document.createElement('div');
  searchProjectTreeView.className = 'searchProjectTreeView';

  createSearchProjectTreeViewHeader(searchProjectTreeView);
  createSearchProjectTreeViewport(searchProjectTreeView);

  return searchProjectTreeView;
}


function openSearchProjectTreeView() {

  openedSearchViews = document.querySelector('.searchProjectTreeView');
  if(openedSearchViews) return;
  
  const searchProjectTreeView = createSearchProjectTreeView();
  document.body.append(searchProjectTreeView);

  // TO-DO: Consider moving this to somewhere inside createSearchProjectTreeView(), that seems more appropriate.
  renderRadialProjectTree();
  
  triggerDropDown({ element: searchProjectTreeView, className: 'active', delay: 20, hideDashboardActions: false });
  setInterval(() => {
    globalVariables.projectTreePopUpsEnabled = true;
  }, 1500);
};


function closeSearchProjectTreeView(searchProjectTreeView) {
  globalVariables.projectTreePopUpsEnabled = false;
  globalVariables.projectTreeScale = 1;
  globalVariables.projectTreeFocusNodeID = null;

  clearAllPopUps();

  searchProjectTreeView.classList.remove('active');
  setTimeout(() => {
    // Allow for slide up animation
    clearSearchProjectTreeViewGlobalListeners();

    searchProjectTreeView.remove();
  }, 1500);
}

function clearSearchProjectTreeViewGlobalListeners() {

  const projectViewOpen = document.querySelector('.projectView');
  if(projectViewOpen) globalListeners.esc = () => closeAllProjectViews({});
  if(!projectViewOpen) globalListeners.esc = null;
  globalListeners.click = null;
  globalListeners.ctrlMinus = null;
  globalListeners.ctrlPlus= null;
  globalListeners.ctrlS = null;
  globalListeners.input = null
}

