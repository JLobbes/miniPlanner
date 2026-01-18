// js/searchProjectTreeView/header/projectTreeSearch.js

function addSearchProjectTreeSearchBarListeners(searchBarInput, searchProjectTreeView) {

  searchBarInput.addEventListener('focus', () => {
    const searchValue = searchBarInput.value.trim();
    if (searchValue && searchValue !== '') {
      showSearchProjectTreeSearchResults();
      renderSearchResults({ results: runProjectTreeSearch(searchValue), showAllResults: false });
    }
  });
  
  globalListeners.input = (e) => {
    const searchValue = searchBarInput.value.trim();
    if (searchValue && searchValue !== '') {
      showSearchProjectTreeSearchResults();
      renderSearchResults({ results: runProjectTreeSearch(searchValue), showAllResults: false });
    } else {
      clearSearchProjectTreeSearchResults();
    }
  }

  const handleClickAway = (e) => {
    if (e.target.closest('.projectTreeSearchResult')) return;
    if (e.target.closest('.showWeakMatchesBtn')) return;
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
  if (!searchValue) return;

  const preFiltered = filterOutExcludedStatuses(
    globalProjectData,
    globalVariables.filteredOutStatuses
  );

  return preFiltered
    .map(project => {
      const titleScore = fuzzyScore(searchValue, project.projectTitle, 2);
      const descriptionScore = fuzzyScore(searchValue, project.projectDescription);
      const totalScore = titleScore + descriptionScore;

      return {
        ...project,
        score: totalScore
      };
    })
    .sort((a, b) => b.score - a.score);
}


function clearSearchProjectTreeSearchResults() {
  const searchResultsLocation = document.querySelector('.projectTreeSearchResults');
  searchResultsLocation.classList.remove('showingFullResults');
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

function fuzzyScore(query, text, weight = 1) {
  if (!query || !text) return 0;

  query = query.toLowerCase();
  text = text.toLowerCase();

  let score = 0;
  let queryIndex = 0;
  let lastMatchedTextIndex = -1;

  for (
    let textIndex = 0;
    textIndex < text.length && queryIndex < query.length;
    textIndex++
  ) {
    if (text[textIndex] === query[queryIndex]) {
      // progressive reward: later query chars are worth more
      score += weight * 10 * (queryIndex + 1);

      // penalize gaps between matches
      if (lastMatchedTextIndex !== -1) {
        score -= weight * (textIndex - lastMatchedTextIndex - 1);
      }

      lastMatchedTextIndex = textIndex;
      queryIndex++;
    }
  }

  return score;
}


function renderSearchResults({ results, showAllResults = false }) {

  if (!results) return;
  if (results.length === 0) {
    return; 
    
    // TO-DO: use this for show 'no-results' later.
  } 

  const renderLocation = document.querySelector('.projectTreeSearchResults');
  clearSearchProjectTreeSearchResults();
  
  const highConfidence = results.filter(project => project.score >= 100)
  const topTen = highConfidence.slice(0, 10);
  const resultsForRender = (showAllResults) ? results : topTen;
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

    addFocusOnSearchResultListener(searchResultLine, singleResult.uniqueProjectID, singleResult.projectStatus);
    
    searchResultLine.append(icon, projectTitle);
    renderLocation.append(searchResultLine);
  })

  if (!showAllResults && highConfidence.length < results.length ) {
    const showWeakMatchesBtn = document.createElement('button');
    showWeakMatchesBtn.classList.add('showWeakMatchesBtn');
    showWeakMatchesBtn.innerHTML = `
      <span>?</span>
      <span>Show Weak</span>
      <span>Matches</span>
      `
    renderLocation.appendChild(showWeakMatchesBtn);
  
    const view = document.querySelector('.searchProjectTreeView');
    view._handleShowWeakResultsListener = addShowWeakResultsListener(results, showWeakMatchesBtn);
  } else {
    renderLocation.classList.add('showingFullResults');
  }
}

function addFocusOnSearchResultListener(searchResult, idOfTargetNode) {

  searchResult.addEventListener('click', () => {

    targetNode = document.querySelector(`.projectTreeNode.${idOfTargetNode}`);

    const zoomedOut = (globalVariables.projectTreeScale === 0.5);
    focusOnNode(targetNode, { inputScale: zoomedOut ? 2 : globalVariables.projectTreeScale });
  });
}

function addShowWeakResultsListener(results, showWeakMatchesBtn) {

  const handleShowWeakResultsListener = () => {
    
    renderSearchResults({ results, showAllResults: true });  
  }

  showWeakMatchesBtn.addEventListener('click', handleShowWeakResultsListener);

  return handleShowWeakResultsListener
}
