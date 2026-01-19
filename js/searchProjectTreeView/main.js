// js/searchProjectTree.js

function createSearchProjectTreeView(targetNodeID) {

  const searchProjectTreeView = document.createElement('div');
  searchProjectTreeView.className = 'searchProjectTreeView';

  createSearchProjectTreeViewHeader(searchProjectTreeView);
  createSearchProjectTreeViewport(searchProjectTreeView);

  return searchProjectTreeView;
}


function openSearchProjectTreeView(targetNodeID) {

  const openedSearchViews = document.querySelector('.searchProjectTreeView');
  if(openedSearchViews) return;
  
  const searchProjectTreeView = createSearchProjectTreeView(targetNodeID);
  document.body.append(searchProjectTreeView);

  // TO-DO: Consider moving this to somewhere inside createSearchProjectTreeView(), that seems more appropriate.
  renderRadialProjectTree();
  

  triggerDropDown({ element: searchProjectTreeView, className: 'active', delay: 20, hideDashboardActions: false });

  if(targetNodeID) {
    const targetNode = document.querySelector(`.projectTreeNode.${targetNodeID}`);
    focusOnNode(targetNode);
  }

  setInterval(() => {
    globalVariables.projectTreePopUpsEnabled = true;
    checkFullyOpened(searchProjectTreeView);
  }, 500);
};

function checkFullyOpened(element) {
  if (!element) return;

  const onTransitionEnd = (e) => {
    if (e.propertyName !== 'bottom') return;

    element.removeEventListener('transitionend', onTransitionEnd);

    // 🔥 do your "after the fact" stuff here
    console.log('Search Project Tree View fully opened');
  };

  element.addEventListener('transitionend', onTransitionEnd);
}

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
  }, 500);
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

