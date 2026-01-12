// js/searchProjectTreeView/header/main.js

function createSearchProjectTreeViewHeader(searchProjectTreeView) {

  const header = document.createElement('div');
  header.className = 'searchProjectTreeHeader';

  header.append(createSearchProjectTreeSearchBar(searchProjectTreeView));

  const escapeSearchViewBtn = document.createElement('button')
  escapeSearchViewBtn.tabIndex = '1';
  escapeSearchViewBtn.className = 'escapeSearchViewBtn';
  escapeSearchViewBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`
  header.append(escapeSearchViewBtn);
  searchProjectTreeView.append(header);

  addCloseSearchProjectTreeListeners(searchProjectTreeView, escapeSearchViewBtn);

  return header;
}

function addCloseSearchProjectTreeListeners(searchProjectTreeView, escapeSearchViewBtn) {
  escapeSearchViewBtn.addEventListener('click', () => {
    closeSearchProjectTreeView(searchProjectTreeView);
  });

  addCloseSearchProjectTreeEscapePressListener(escapeSearchViewBtn)
}

function addCloseSearchProjectTreeEscapePressListener(escapeSearchViewBtn) {

  globalListeners.esc = () => escapeSearchViewBtn.click();
}