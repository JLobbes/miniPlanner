// js/searchProjectTreeView/header/projectTreeSearch.js

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
    focusOnNode(targetNode, { inputScale: zoomedOut ? 2 : globalVariables.projectTreeScale });
  });
}

