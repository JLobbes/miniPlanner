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
    console.log("focus fired");
    showSearchProjectTreeSearchResults();
  });
  
  globalListeners.input = (e) => {
    console.log('input fired')
    const searchValue = searchBarInput.value.trim();
    renderSearchResults({ results: runProjectTreeSearch(searchValue), allResults: false });
  }

  const handleClickAway = (e) => {
    if (e.target.closest('.projectTreeSearchResult')) return;
    if (e.target.closest('.searchBarInput')) return;

    console.log('clicked away anyway');

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

    focusOnNode(targetNode, 2);
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

  renderRadialProjectTree();
  
  triggerDropDown({ element: searchProjectTreeView, className: 'active', delay: 20, hideDashboardActions: false });
};


function closeSearchProjectTreeView(searchProjectTreeView) {
  
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
  globalListeners.ctrlS = null;
  globalListeners.input = null;
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

  // ZOOM (wheel)
  viewport.addEventListener('wheel', e => {
    e.preventDefault();

    const zoomIntensity = 0.1;
    const direction = e.deltaY > 0 ? -1 : 1;
    const factor = 1 + zoomIntensity * direction;

    globalVariables.projectTreeScale = Math.min(Math.max(globalVariables.projectTreeScale * factor, 0.2), 3);
    clearAllPopUps()
    updateTransform();
  }, { passive: false });
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
  projectTilePopUp.style.left = `${rect.left - 5}px`;
  projectTilePopUp.style.top = `${rect.top - 5}px`;

  // TO-DO: add content
  projectTilePopUp.appendChild(createProjectTile(nodeData));
  
  addRemoveProjectTilePopUpListeners(projectTilePopUp);

  return projectTilePopUp;
}

function addRemoveProjectTilePopUpListeners(projectTilePopUp) {

  projectTilePopUp.addEventListener('mouseleave', () => {
    
    setTimeout(() => {
      // projectTilePopUp.remove();
      clearAllPopUps();
    }, 25);
  });
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

function focusOnNode(circle, targetScale = null, animate = true) {

  hideSearchProjectTreeSearchResults();

  const svg = circle.ownerSVGElement;
  const viewport = svg.closest('.searchProjectTreeViewport');
  if (!svg || !viewport) return;

  const currentScale = globalVariables.projectTreeScale;
  const newScale = targetScale ?? currentScale;

  const pt = svg.createSVGPoint();
  pt.x = circle.cx.baseVal.value;
  pt.y = circle.cy.baseVal.value;

  // Transform point to screen coordinates
  const screenPt = pt.matrixTransform(svg.getScreenCTM());

  const vpRect = viewport.getBoundingClientRect();

  // Calculate translation needed to center node **at new scale**
  const scaleRatio = newScale / currentScale;
  const tx = (vpRect.width / 2 - (screenPt.x - vpRect.left)) * scaleRatio;
  const ty = (vpRect.height / 2 - (screenPt.y - vpRect.top)) * scaleRatio;

  if (animate) svg.style.transition = 'transform 400ms ease';

  // Apply translation and scale
  globalVariables.projectTreeX += tx;
  globalVariables.projectTreeY += ty;
  globalVariables.projectTreeScale = newScale;

  svg.style.transform = `translate(${globalVariables.projectTreeX}px, ${globalVariables.projectTreeY}px) scale(${globalVariables.projectTreeScale})`;

  flashCenterArrowAnimation();

  if (animate) setTimeout(() => (svg.style.transition = ''), 400);
}

function flashCenterArrowAnimation() {

  const existingArrows = document.querySelector('.centerArrowWrapper');
  if(existingArrows) {
    existingArrows.forEach(arrow => {
      arrow.remove();
    });
  } 

  const centerArrowWrapper = document.createElement('div');
  centerArrowWrapper.className = 'centerArrowWrapper';
  centerArrowWrapper.innerHTML = '<span class="fa-regular fa-circle"></span>'

  
  setTimeout(() => {
    document.body.appendChild(centerArrowWrapper);
  }, 400);

  setTimeout(() => {
    centerArrowWrapper.remove();
  }, 1300);

  return centerArrowWrapper;
}
