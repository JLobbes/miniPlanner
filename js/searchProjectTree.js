// js/searchProjectTree.js

function createSearchProjectTreeView() {

  const searchProjectTreeView = document.createElement('div');
  searchProjectTreeView.className = 'searchProjectTreeView';

  createSearchProjectTreeViewHeader(searchProjectTreeView);
  createSearchProjectTreeViewport(searchProjectTreeView);

  return searchProjectTreeView;
}

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

function createSearchProjectTreeSearchBar(searchProjectTreeView) {

  const searchBarWrapper = document.createElement('div');
  searchBarWrapper.className = 'searchBarWrapper';

  // The searchButton has no function, search is done on 'input'. 
  // But serves currently as an icon only. 

  const searchButton = document.createElement('button');
  searchButton.disabled = true;
  searchButton.className = 'executeSearchProjectTreeBtn';
  searchButton.tabIndex = '2';
  searchButton.innerHTML = `<span class="fa-solid fa-search"></span>`;

  const searchBarInput = document.createElement('input');
  searchBarInput.className = 'searchBarInput';
  searchBarInput.tabIndex = '2';
  searchBarInput.type = 'text';

  const searchResultContainer = document.createElement('ul');
  searchResultContainer.classList = 'projectTreeSearchResults';

  searchBarWrapper.append(searchBarInput, searchButton, searchResultContainer);

  addSearchProjectTreeSearchBarListeners(searchBarInput, searchProjectTreeView);

  return searchBarWrapper;
}

function addSearchProjectTreeSearchBarListeners(searchBarInput, searchProjectTreeView) {

  searchBarInput.addEventListener('focus', () => {
    showSearchProjectTreeSearchResults();
  });
  
  globalListeners.input = (e) => {
    const searchValue = searchBarInput.value.trim();
    renderSearchResults({ results: runProjectTreeSearch(searchValue), allResults: false });
  }

  const handleClickAway = (e) => {
    if (e.target.closest('.projectTreeSearchResult')) return;
    if (e.target.closest('.searchBarInput')) return;

    hideSearchProjectTreeSearchResults();
  };

  globalListeners.click = handleClickAway;
}

function clearSearchProjectTreeSearchResults() {
  const searchResultsLocation = document.querySelector('.projectTreeSearchResults');
  searchResultsLocation.innerHTML = ``;
}

function hideSearchProjectTreeSearchResults() {
  const searchResultsLocation = document.querySelector('.projectTreeSearchResults');
  searchResultsLocation.style.display = 'none';
}

function showSearchProjectTreeSearchResults() {
  const searchResultsLocation = document.querySelector('.projectTreeSearchResults');
  searchResultsLocation.style.display = '';
}


function runProjectTreeSearch(searchValue) {
  if (!searchValue) return globalProjectData;

  return globalProjectData
    .map(project => {
      const titleScore = fuzzyScore(searchValue, project.projectTitle);
      const descScore = fuzzyScore(searchValue, project.projectDescription);
      const bestScore = titleScore !== -1 ? titleScore : descScore;
      return { project, score: bestScore };
    })
    .filter(item => item.score !== -1)
    .sort((a, b) => a.score - b.score)
    .map(item => item.project);
}

function fuzzyScore(query, text) {
  query = query.toLowerCase();
  text = text.toLowerCase();

  let qi = 0;
  let firstMatch = -1;

  for (let ti = 0; ti < text.length && qi < query.length; ti++) {
    if (text[ti] === query[qi]) {
      if (firstMatch === -1) firstMatch = ti;
      qi++;
    }
  }
  return qi === query.length ? firstMatch : -1;
}

function renderSearchResults({ results, allResults = false }) {

  const renderLocation = document.querySelector('.projectTreeSearchResults');
  clearSearchProjectTreeSearchResults();
  
  const topTen = results.slice(0, 10);
  const resultsForRender = (allResults) ? results : topTen;
  resultsForRender.forEach(singleResult => {

    const searchResultLine = document.createElement('button');
    searchResultLine.classList = 'projectTreeSearchResult';
    searchResultLine.tabIndex = '2';
    searchResultLine.title = `${singleResult.projectTitle}`;

    const icon = document.createElement('span');
    const renderAsSingleTask = !hasChildren(singleResult.uniqueProjectID) || !singleResult.parentProjectID === null;
    icon.className = `${ (renderAsSingleTask) ? 'fa-regular fa-rectangle-list' : 'fa-solid fa-folder' }`; 
    icon.classList.add('projectIcon');

    const projectTitle = document.createElement('p');
    projectTitle.className = 'projectTitle';
  
    projectTitle.innerText = `${singleResult.projectTitle}`;

    addFocusOnSearchResultListener(searchResultLine, singleResult.uniqueProjectID);
    
    searchResultLine.append(icon, projectTitle);
    renderLocation.append(searchResultLine);
  })
}

function addFocusOnSearchResultListener(searchResult, idOfTargetNode) {

  searchResult.addEventListener('click', () => {
    targetNode = document.querySelector(`.projectTreeNode.${idOfTargetNode}`);

    const zoomedOut = (globalVariables.projectTreeScale === 0.5);
    focusOnNode(targetNode, zoomedOut ? 2 : globalVariables.projectTreeScale);
  });
}

function createSearchProjectTreeViewport(searchProjectTreeView) {
  const viewport = document.createElement('div');
  viewport.className = 'searchProjectTreeViewport';

  const canvas = document.createElement('div');
  canvas.className = 'searchProjectTreeCanvas';

  viewport.append(canvas);
  searchProjectTreeView.append(viewport);

  addSearchProjectTreePanZoom(viewport, canvas);

  return viewport;
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

function addSearchProjectTreePanZoom(viewport, canvas) {
  globalVariables.projectTreeX = 0;
  globalVariables.projectTreeY = 0;
  globalVariables.projectTreeScale = 1;
  let isPanning = false;
  let startX, startY;

  const updateTransform = () => {
    const svg = canvas.querySelector('svg');
    if(svg) {
      svg.style.transform = `translate(${globalVariables.projectTreeX}px, ${globalVariables.projectTreeY}px) scale(${globalVariables.projectTreeScale})`;
    }
  };

  // PAN
  viewport.addEventListener('mousedown', e => {
    isPanning = true;
    startX = e.clientX - globalVariables.projectTreeX;
    startY = e.clientY - globalVariables.projectTreeY;
    viewport.style.cursor = 'grabbing';
  });

  viewport.addEventListener('mousemove', e => {
    if (!isPanning) return;
    globalVariables.projectTreeX = e.clientX - startX;
    globalVariables.projectTreeY = e.clientY - startY;
    updateTransform();
  });

  viewport.addEventListener('mouseup', () => {
    isPanning = false;
    viewport.style.cursor = 'grab';
  });

  // ZOOM (wheel) with fixed steps
  let lastZoomTime = 0;
  const zoomLevels = [0.5, 1, 2, 3];

  viewport.addEventListener('wheel', e => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastZoomTime < 200) return; // 200ms cooldown
    lastZoomTime = now;

    const current = globalVariables.projectTreeScale;
    let newScale;

    if (e.deltaY < 0) {
      // scroll up → zoom in
      newScale = zoomLevels.find(z => z > current) ?? zoomLevels[zoomLevels.length - 1];
    } else {
      // scroll down → zoom out
      newScale = [...zoomLevels].reverse().find(z => z < current) ?? zoomLevels[0];
    }

    if (newScale !== current) {
      globalVariables.projectTreeScale = newScale;
      clearAllPopUps();
      updateTransform();
    }
  }, { passive: false });

  globalListeners.ctrlPlus = () => {
    const current = globalVariables.projectTreeScale;
    const newScale =
      zoomLevels.find(z => z > current) ??
      zoomLevels[zoomLevels.length - 1];

    if (newScale !== current) {
      globalVariables.projectTreeScale = newScale;
      clearAllPopUps();
      updateTransform();
    }
  };

  globalListeners.ctrlMinus = () => {
    const current = globalVariables.projectTreeScale;
    const newScale =
      [...zoomLevels].reverse().find(z => z < current) ??
      zoomLevels[0];

    if (newScale !== current) {
      globalVariables.projectTreeScale = newScale;
      clearAllPopUps();
      updateTransform();
    }
  };

}

function renderSearchProjectTree() {
  const canvas = document.querySelector('.searchProjectTreeCanvas');
  canvas.innerHTML = '';

  const tree = buildGlobalProjectTree();
  tree.forEach(node => {
    canvas.append(renderTreeNode(node));
  });
}

function renderRadialProjectTree() {
  const canvas = document.querySelector('.searchProjectTreeCanvas');
  canvas.innerHTML = '';

  const tree = buildGlobalProjectTree(); // Array of root nodes
  const nodes = [];

  // Canvas center
  const centerX = canvas.offsetWidth / 2;
  const centerY = canvas.offsetHeight / 2;

  const virtualRoot = {
    children: tree,
    uniqueProjectID: 'virtualRoot'
  };
  layoutRadial(virtualRoot, centerX, centerY, 0, 2 * Math.PI, 0, nodes);


  drawRadialTree(nodes, canvas);
}

function drawRadialTree(nodes, canvas) {
  const minX = Math.min(...nodes.map(n => n.x)) - 50;
  const maxX = Math.max(...nodes.map(n => n.x)) + 50;
  const minY = Math.min(...nodes.map(n => n.y)) - 50;
  const maxY = Math.max(...nodes.map(n => n.y)) + 50;

  const byId = Object.fromEntries(
    nodes.map(n => [n.node.uniqueProjectID, n])
  );

  const svgNS = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute(
    "viewBox",
    `${minX} ${minY} ${maxX - minX} ${maxY - minY}`
  );

  // Lines
  nodes.forEach(({ node }) => {
    node.children.forEach(child => {
      const parent = byId[node.uniqueProjectID];
      const kid = byId[child.uniqueProjectID];

      const line = document.createElementNS(svgNS, "line");
      line.classList.add('projectTreeLine');
      line.setAttribute("x1", parent.x);
      line.setAttribute("y1", parent.y);
      line.setAttribute("x2", kid.x);
      line.setAttribute("y2", kid.y);

      svg.appendChild(line);
    });
  });

  // Nodes (dots)
  nodes.forEach(({ node, x, y }) => {
    const nodeCircle = document.createElementNS(svgNS, "circle");
    nodeCircle.draggable = true;
    nodeCircle.classList.add("projectTreeNode");
    if (node.projectStatus) {
      nodeCircle.classList.add(
        `statusShowing${(node.projectStatus != 'In Progress' ? node.projectStatus : 'InProgress').replace(' ', '')}`
      );
    }
    nodeCircle.classList.add(`${node.uniqueProjectID}`);
    nodeCircle.setAttribute('cx', x);
    nodeCircle.setAttribute('cy', y);

    addProjectTreeNodeListener(nodeCircle, node, x, y);
    svg.appendChild(nodeCircle);
  });

  canvas.replaceChildren(svg);
}

function addProjectTreeNodeListener(nodeCircle, nodeData) {

  nodeCircle.addEventListener('mouseover', () => {
    if (!globalVariables.projectTreePopUpsEnabled) return;
    document.body.appendChild(createProjectTilePopUp(nodeCircle, nodeData));
  })
}

function createProjectTilePopUp(nodeCircle, nodeData) {
  
  const projectTilePopUp = document.createElement('div');
  projectTilePopUp.className = 'projectTilePopUp';
  projectTilePopUp.id = `popup-${nodeData.uniqueProjectID}`;

  // Get the circle's position on the screen
  const rect = nodeCircle.getBoundingClientRect();

  // Position popup absolutely
  projectTilePopUp.style.position = 'absolute';
  projectTilePopUp.style.left = `${rect.left + 20}px`;
  projectTilePopUp.style.top = `${rect.top - 0}px`;

  // TO-DO: add content
  projectTilePopUp.appendChild(createProjectTile({ projectData: nodeData, forDashboard: false, forPopUp: true }));
  
  addRemoveProjectTilePopUpListeners(projectTilePopUp, nodeCircle);

  return projectTilePopUp;
}

function addRemoveProjectTilePopUpListeners(projectTilePopUp, nodeCircle) {
  projectTilePopUp.removeTimeout = null;
  projectTilePopUp.tapedUp = false; // Allows semi-permanent pin for reLocation

  const scheduleRemove = () => {
    if (projectTilePopUp.tapedUp) return;
    projectTilePopUp.removeTimeout = setTimeout(() => {
      projectTilePopUp.remove();
    }, 500);
  };

  const cancelRemove = () => {
    clearTimeout(projectTilePopUp.removeTimeout);
  };

  nodeCircle.addEventListener('mouseleave', scheduleRemove);
  projectTilePopUp.addEventListener('mouseenter', cancelRemove);
  projectTilePopUp.addEventListener('mouseleave', scheduleRemove);

}

function clearAllPopUps() {
  
  const projectTilePopUps = document.querySelectorAll('.projectTilePopUp');
  projectTilePopUps.forEach(popUp => {
    popUp.remove();
  });
}

function layoutRadial(node, centerX, centerY, startAngle, endAngle, depth, layout) {
  const radius = depth * 300; // distance per level
  const angle = (startAngle + endAngle) / 2;

  const x = centerX + radius * Math.cos(angle);
  const y = centerY + radius * Math.sin(angle);

  layout.push({ node, x, y });

  const children = node.children || [];
  if (!children.length) return layout;

  // Total size of all children
  const totalSize = children.reduce((sum, child) => sum + getSubtreeSize(child), 0);

  let currentAngle = startAngle;

  children.forEach(child => {
    const childSize = getSubtreeSize(child);
    const minAngle = 0.05; // ~3 degrees
    const angleSpan = Math.max(minAngle, (endAngle - startAngle) * (childSize / totalSize));

    // const angleSpan = (endAngle - startAngle) * (childSize / totalSize);
    const childStart = currentAngle;
    const childEnd = currentAngle + angleSpan;

    layoutRadial(child, centerX, centerY, childStart, childEnd, depth + 1, layout);
    currentAngle += angleSpan;
  });

  return layout;
}

function getSubtreeSize(node) {
  if (!node.children || node.children.length === 0) return 1;
  return 1 + node.children.reduce((sum, child) => sum + getSubtreeSize(child), 0);
}

function focusOnNode(targetNodeCircle, targetScale = null, animate = true) {
  hideSearchProjectTreeSearchResults();

  const svgElement = targetNodeCircle.ownerSVGElement;
  const viewportElement = svgElement?.closest('.searchProjectTreeViewport');
  if (!svgElement || !viewportElement) return;

  const currentTreeScale = globalVariables.projectTreeScale;
  const desiredTreeScale = targetScale ?? currentTreeScale;

  // Create a point in SVG coordinate space
  const svgPoint = svgElement.createSVGPoint();
  svgPoint.x = targetNodeCircle.cx.baseVal.value;
  svgPoint.y = targetNodeCircle.cy.baseVal.value;

  // Convert SVG coordinates to screen coordinates
  const nodeScreenPoint = svgPoint.matrixTransform(
    svgElement.getScreenCTM()
  );

  const viewportRect = viewportElement.getBoundingClientRect();

  // How much scaling is changing
  const scaleRatio = desiredTreeScale / currentTreeScale;

  // Translation needed to center the node in the viewport
  const translateX =
    (viewportRect.width / 2 - (nodeScreenPoint.x - viewportRect.left)) *
    scaleRatio;

  const translateY =
    (viewportRect.height / 2 - (nodeScreenPoint.y - viewportRect.top)) *
    scaleRatio;

  if (animate) {
    svgElement.style.transition = 'transform 400ms ease';
  }

  // Update global transform state
  globalVariables.projectTreeX += translateX;
  globalVariables.projectTreeY += translateY;
  globalVariables.projectTreeScale = desiredTreeScale;

  // Apply transform
  svgElement.style.transform = `
    translate(${globalVariables.projectTreeX}px, ${globalVariables.projectTreeY}px)
    scale(${globalVariables.projectTreeScale})
  `;

  flashTargetNodeAnimation();

  if (animate) {
    setTimeout(() => {
      svgElement.style.transition = '';
    }, 400);
  }
}

function flashTargetNodeAnimation() {

  const existingHighlights = document.querySelector('.highlightNodeWrapper');
  if(existingHighlights) {
    existingHighlights.forEach(highlight => {
      highlight.remove();
    });
  } 

  const highlightNodeWrapper = document.createElement('div');
  highlightNodeWrapper.className = 'highlightNodeWrapper';
  highlightNodeWrapper.innerHTML = '<span class="fa-regular fa-circle"></span>'

  
  setTimeout(() => {
    document.body.appendChild(highlightNodeWrapper);
  }, 400);

  setTimeout(() => {
    highlightNodeWrapper.remove();
  }, 1300);

  return highlightNodeWrapper;
}

function addReLocateProjectDropZones() {
  console.log("adding drop zones");
}
