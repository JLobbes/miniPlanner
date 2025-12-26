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

  header.append(createSearchProjectTreeSearchBar());

  const escapeSearchViewBtn = document.createElement('button')
  escapeSearchViewBtn.tabIndex = '1';
  escapeSearchViewBtn.className = 'escapeSearchViewBtn';
  escapeSearchViewBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`
  header.append(escapeSearchViewBtn);
  searchProjectTreeView.append(header);

  addCloseSearchProjectTreeListener(searchProjectTreeView, escapeSearchViewBtn);

  return header;
}

function createSearchProjectTreeSearchBar() {

  const searchBarWrapper = document.createElement('div');
  searchBarWrapper.className = 'searchBarWrapper';

  const searchButton = document.createElement('button');
  searchButton.className = 'executeSearchProjectTreeBtn';
  searchButton.tabIndex = '2';
  searchButton.innerHTML = `<span class="fa-solid fa-search"></span>`;

  const searchBarInput = document.createElement('input');
  searchBarInput.className = 'searchBarInput';
  searchBarInput.tabIndex = '2';
  searchBarInput.type = 'text';

  searchBarWrapper.append(searchBarInput, searchButton);

  addSearchProjectTreeSearchBarListeners(searchBarInput);

  return searchBarWrapper;
}

function addSearchProjectTreeSearchBarListeners(searchBarInput) {

  searchBarInput.addEventListener('input', () => {
    const searchValue = searchBarInput.value.trim();
    console.log(runProjectTreeSearch(searchValue));
  }); 
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

function addSearchProjectTreePanZoom(viewport, canvas) {
  let x = 0, y = 0, scale = 1;
  let isPanning = false;
  let startX, startY;

  const updateTransform = () => {
    // canvas.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    const svg = canvas.querySelector('svg');
    if(svg) {
      svg.setAttribute('transform', `translate(${x}, ${y}) scale(${scale})`);
    }
  };

  // PAN
  viewport.addEventListener('mousedown', e => {
    isPanning = true;
    startX = e.clientX - x;
    startY = e.clientY - y;
    viewport.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', e => {
    if (!isPanning) return;
    x = e.clientX - startX;
    y = e.clientY - startY;
    updateTransform();
  });

  document.addEventListener('mouseup', () => {
    isPanning = false;
    viewport.style.cursor = 'grab';
  });

  // ZOOM (wheel)
  viewport.addEventListener('wheel', e => {
    e.preventDefault();

    const zoomIntensity = 0.1;
    const direction = e.deltaY > 0 ? -1 : 1;
    const factor = 1 + zoomIntensity * direction;

    scale = Math.min(Math.max(scale * factor, 0.2), 5);
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

function renderTreeNode(node) {
  const wrapper = document.createElement('div');
  wrapper.className = 'treeNode';
  wrapper.textContent = node.projectTitle || 'Untitled';

  if (node.children.length) {
    const children = document.createElement('div');
    children.className = 'treeChildren';

    node.children.forEach(child => {
      children.append(renderTreeNode(child));
    });

    wrapper.append(children);
  }

  return wrapper;
}

function renderRadialProjectTree() {
  const canvas = document.querySelector('.searchProjectTreeCanvas');
  canvas.innerHTML = '';

  const tree = buildGlobalProjectTree(); // Array of root nodes
  const layout = [];

  // Canvas center
  const centerX = canvas.offsetWidth / 2;
  const centerY = canvas.offsetHeight / 2;

  const virtualRoot = {
    children: tree,
    uniqueProjectID: 'virtualRoot'
  };
  layoutRadial(virtualRoot, centerX, centerY, 0, 2 * Math.PI, 0, layout);


  drawRadialTree(layout, canvas);
  // drawRadialLines(layout, canvas);
  // drawRadialNodes(layout, canvas);
}

function drawRadialTree(layout, canvas) {
  const minX = Math.min(...layout.map(n => n.x)) - 50;
  const maxX = Math.max(...layout.map(n => n.x)) + 50;
  const minY = Math.min(...layout.map(n => n.y)) - 50;
  const maxY = Math.max(...layout.map(n => n.y)) + 50;

  const byId = Object.fromEntries(layout.map(n => [n.node.uniqueProjectID, n]));

  let svgContent = '';

  // Lines
  layout.forEach(({ node }) => {
    node.children.forEach(child => {
      const parent = byId[node.uniqueProjectID];
      const kid = byId[child.uniqueProjectID];
      svgContent += `<line x1="${parent.x}" y1="${parent.y}" x2="${kid.x}" y2="${kid.y}" stroke="black" stroke-width="2" />`;
    });
  });

  // Nodes (dots)
  layout.forEach(({ node, x, y }) => {
    svgContent += `<circle cx="${x}" cy="${y}" r="5" fill="black" />`;
  });

  // Single SVG container
  canvas.innerHTML = `<svg width="100%" height="100%" viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}">${svgContent}</svg>`;
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