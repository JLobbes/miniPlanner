// js/searchProjectTreeView/header/main.js

function createSearchProjectTreeViewHeader(searchProjectTreeView) {

  const header = document.createElement('div');
  header.className = 'searchProjectTreeHeader';

  header.append(createSearchProjectTreeSearchBar(searchProjectTreeView));

  const escapeSearchViewBtn = document.createElement('button')
  escapeSearchViewBtn.tabIndex = '1';
  escapeSearchViewBtn.className = 'escapeSearchViewBtn';
  escapeSearchViewBtn.innerHTML = `<span class="fa-solid fa-xmark"></span>`
  header.append(escapeSearchViewBtn);

  const openFilterPanelBtn = document.createElement('button')
  openFilterPanelBtn.tabIndex = '2';
  openFilterPanelBtn.className = 'openFilterPanelBtn';
  openFilterPanelBtn.innerHTML = `<span class="fa-solid fa-circle-minus"></span>`;
  header.append(openFilterPanelBtn);
  
  const { filterPanel, buttons } = createFilterPanel();
  header.append(filterPanel);
  
  searchProjectTreeView.append(header);

  addCloseSearchProjectTreeListeners(searchProjectTreeView, escapeSearchViewBtn);
  addOpenFilterPanelListeners(searchProjectTreeView, openFilterPanelBtn, filterPanel, buttons);
  addPanelButtonListnerers(searchProjectTreeView, buttons);

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

function addOpenFilterPanelListeners(searchProjectTreeView, openFilterPanelBtn, filterPanel, buttons) {
  filterPanel.removeTimeout = null;

  const scheduleClose = () => {
    clearTimeout(filterPanel.removeTimeout);
    
    filterPanel.removeTimeout = setTimeout(() => {
      blurButtons();
      closeFilterPanel(filterPanel);
      filterPanel.removeTimeout = null;
    }, 500);
  };

  const cancelRemove = () => clearTimeout(filterPanel.removeTimeout);

  const openIfClosed = () => {
    if (!filterPanel.classList.contains('open')) {
      openFilterPanel(filterPanel);
    } else {
      cancelRemove();
    }
  };

  function blurButtons () {
    buttons.forEach(button => {
      button.blur();
    })
  }

  // --- open button events ---
  ['mouseover', 'focus'].forEach(evt =>
    openFilterPanelBtn.addEventListener(evt, openIfClosed)
  );
  ['mouseleave', 'blur'].forEach(evt =>
    openFilterPanelBtn.addEventListener(evt, scheduleClose)
  );

  // --- panel events ---
  ['mouseover', 'focus'].forEach(evt =>
    filterPanel.addEventListener(evt, cancelRemove)
  );
  ['mouseleave', 'blur'].forEach(evt =>
    filterPanel.addEventListener(evt, scheduleClose)
  );

  // --- buttons inside panel ---
  buttons.forEach(btn => {
    ['mouseover', 'focus'].forEach(evt => btn.addEventListener(evt, openIfClosed));
    btn.addEventListener('blur', scheduleClose);
  });

  // --- click outside closes ---
  searchProjectTreeView.addEventListener('click', e => {
    if (!e.target.closest('.filterPanel') && !e.target.closest('.openFilterPanelBtn')) {
      scheduleClose();
    }
  });
}

function addPanelButtonListnerers(searchProjectTreeView, buttons) {
  
  buttons.forEach(button => { 
    button.addEventListener('click', () => {
      toggleButtonCrossout(button);
      toggleProjectTreeFilterStatus(button);
    });
  });

  function toggleProjectTreeFilterStatus(button) {
    let status = button.targetStatus;
    if (status === 'InProgress') status = 'In Progress';
    const arr = globalVariables.filteredOutStatuses;

    if (arr.includes(status)) {
      // remove the status if already in the array
      const index = arr.indexOf(status);
      arr.splice(index, 1);
    } else {
      // limit to 5 active filters
      if (arr.length >= 5) {
        const oldestStatus = arr[0].replace(' ', '');
        const oldestBtn = buttons.filter(button => button.targetStatus === oldestStatus)[0];
        if (oldestBtn) toggleButtonCrossout(oldestBtn);
        arr.shift(); // remove first (oldest) status

      }
      arr.push(status); // add new one
    }

    filterOutProjectTreeViewStatus();
  }

  function filterOutProjectTreeViewStatus() {
    saveSettings();
    reRenderProjectTreeViewPort();
    return;
  }
}

function toggleButtonCrossout(button) {
    button.classList.toggle('crossed');
    if (button.targetStatus === 'Dead') button.classList.toggle('dead'); 
  }

function openFilterPanel(searchProjectTreeHeader) {
  searchProjectTreeHeader.classList.add('open');
}

function closeFilterPanel(searchProjectTreeHeader) {
  searchProjectTreeHeader.classList.remove('open');
}

function createFilterPanel() {
  const filterPanel = document.createElement('div');
  filterPanel.className = 'filterPanel';

  const buttons = [];

  const nodeTypes = [
    'InProgress',
    'Complete',
    'Dead',
    'Paused',
    'Delayed',
    'Planned'
  ];

  nodeTypes.forEach(nodeType => {
    const btn = document.createElement('button');
    btn.targetStatus = `${nodeType}`;
    btn.className = 'filterNodeBtn';
    btn.tabIndex = 2;

    if(globalVariables.filteredOutStatuses.includes('In Progress') && nodeType === 'InProgress') {
      btn.classList.add('crossed');
    }
    if(globalVariables.filteredOutStatuses.includes(nodeType)) {
      btn.classList.add('crossed');
      if (btn.targetStatus === 'Dead') btn.classList.add('dead'); 
    }

    const svgNS = "http://www.w3.org/2000/svg";
    const iconContainer = document.createElementNS(svgNS, "svg");
    iconContainer.classList.add('filterNodeIcon');

    const nodeCircle = document.createElementNS(svgNS, "circle");
    nodeCircle.classList.add('circleIcon', `statusShowing${nodeType}`);
    nodeCircle.setAttribute("cx", 10);
    nodeCircle.setAttribute("cy", 10);

    iconContainer.append(nodeCircle);
    btn.append(iconContainer);
    filterPanel.append(btn);

    buttons.push(btn);
  });

  return { filterPanel, buttons };
}
