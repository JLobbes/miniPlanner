// js/searchProjectTreeView/viewport.js

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
      newScale = zoomLevels.find(z => z > current) ?? zoomLevels[zoomLevels.length - 1];
    } else {
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
    uniqueProjectID: 'theVirtualRoot',
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

    addProjectTreeNodeListener(nodeCircle, node);
    svg.appendChild(nodeCircle);
  });

  canvas.replaceChildren(svg);
}

function addProjectTreeNodeListener(nodeCircle, nodeData) {

  nodeCircle.addEventListener('mouseover', () => {
    if (!globalVariables.projectTreePopUpsEnabled) return;

    const alreadyCreated = document.querySelector(`#popup-${nodeData.uniqueProjectID}`);
    if(alreadyCreated) return;

    if(nodeCircle.classList.contains('theVirtualRoot')) {
      createFauxPopUpForDashboard(nodeCircle);
    } else {
      document.body.appendChild(createProjectTilePopUp(nodeCircle, nodeData));
    }
  })
}

function createFauxPopUpForDashboard(nodeCircle) {

  const fauxData = {
    projectTitle: 'Dashboard',
    uniqueProjectID: 'theVirtualRoot',
    projectDescription: 'Drop tiles here to become parentless',
    projectStatus: 'virtualRoot',
  }
  document.body.appendChild(createProjectTilePopUp(nodeCircle, fauxData));
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

function focusOnNode(
  targetNodeCircle,
  { inputScale = null, nodeX = 0.5, nodeY = 0.5, animate = true } = {}
) {
  hideSearchProjectTreeSearchResults();

  const svg = targetNodeCircle?.ownerSVGElement;
  const viewport = svg?.closest('.searchProjectTreeViewport');
  if (!svg || !viewport) return;

  const currentScale = globalVariables.projectTreeScale;
  const targetScale = inputScale ?? currentScale;
  const duration = 400;

  const doPan = () => {
    const pt = svg.createSVGPoint();
    pt.x = targetNodeCircle.cx.baseVal.value;
    pt.y = targetNodeCircle.cy.baseVal.value;

    const nodeScreen = pt.matrixTransform(svg.getScreenCTM());
    const viewportRect = viewport.getBoundingClientRect();

    const desiredX = viewportRect.left + viewportRect.width * nodeX;
    const desiredY = viewportRect.top + viewportRect.height * nodeY;

    const dx = desiredX - nodeScreen.x;
    const dy = desiredY - nodeScreen.y;

    if (animate) svg.style.transition = `transform ${duration}ms ease`;

    globalVariables.projectTreeX += dx;
    globalVariables.projectTreeY += dy;

    svg.style.transform = `
      translate(${globalVariables.projectTreeX}px, ${globalVariables.projectTreeY}px)
      scale(${globalVariables.projectTreeScale})
    `;

    flashTargetNodeAnimation();

    if (animate) {
      setTimeout(() => (svg.style.transition = ''), duration);
    }
  };

  // ---------- ZOOM (only if needed) ----------
  if (targetScale !== currentScale) {
    if (animate) svg.style.transition = `transform ${duration}ms ease`;

    fadeCanvasOut();

    globalVariables.projectTreeScale = targetScale;
    svg.style.transform = `
      translate(${globalVariables.projectTreeX}px, ${globalVariables.projectTreeY}px)
      scale(${targetScale})
    `;

    setTimeout(() => {
      svg.style.transition = '';
      fadeCanvasIn();
      doPan(); // pan AFTER zoom
    }, animate ? duration : 0);
  } else {
    // ---------- PAN ONLY ----------
    doPan();
  }
}

function fadeCanvasOut() {
  const canvas = document.querySelector('.searchProjectTreeCanvas');
  if (canvas) canvas.style.opacity = '0';
}

function fadeCanvasIn() {
  const canvas = document.querySelector('.searchProjectTreeCanvas');
  if (canvas) canvas.style.opacity = '1';
}

function reRenderProjectTreeViewPort() {

  const searchProjectTreeView = document.querySelector('.searchProjectTreeView');
  if (!searchProjectTreeView) return;

  // Clear current view
  const viewport = document.querySelector('.searchProjectTreeViewport');
  viewport.innerHTML = '';

  const canvas = document.createElement('div');
  canvas.className = 'searchProjectTreeCanvas';

  viewport.append(canvas);
  searchProjectTreeView.append(viewport);

  addSearchProjectTreePanZoom(viewport, canvas);
  clearAllPopUps();

  // Rebuild the radial project tree
  renderRadialProjectTree();
}


function restoreFocusNode(zoomScaleBeforeReRender) {
  const id = globalVariables.projectTreeFocusNodeID;
  if (!id) return;

  const node = document.querySelector(`.projectTreeNode.${id}`);
  if (!node) return;

  focusOnNode(node, {
    inputScale: zoomScaleBeforeReRender,
    animate: true
  });
}

function storeFocusNode(nodeID) {
  
  globalVariables.projectTreeFocusNodeID = nodeID;
}
