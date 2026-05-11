var allLoadedListings    = [];
var currentViewMode      = 'list';
var swipeFrontCardIndex  = 0;

var dragStartX     = 0;
var dragStartY     = 0;
var currentDragX   = 0;
var currentDragY   = 0;
var isDraggingCard = false;

var SWIPE_THRESHOLD = 55;
var TILT_FACTOR     = 0.05;

window.addEventListener('DOMContentLoaded', function() {
  loadXMLListings(function(loadedListings) {
    allLoadedListings = loadedListings;
    renderListingCards(allLoadedListings, 'jobCardsGrid');
    updateResultsCount(allLoadedListings.length);
    buildSwipeDeck(allLoadedListings);
  });
});

function applyAllFilters() {
  var searchText       = document.getElementById('filterSearch').value;
  var typeFilter       = document.getElementById('filterOpportunityType').value;
  var cityFilter       = document.getElementById('filterLocation').value;
  var industryFilter   = document.getElementById('filterIndustry').value;
  var allowanceFilter  = document.getElementById('filterAllowance').value;
  var sortOrderValue   = document.getElementById('sortOrder').value;

  var filteredListings = applyListingFilters(allLoadedListings, searchText, typeFilter, cityFilter, industryFilter, allowanceFilter);

  if (sortOrderValue === 'allowance') {
    filteredListings.sort(function(listingA, listingB) {
      return parseInt(listingB.allowance) - parseInt(listingA.allowance);
    });
  } else if (sortOrderValue === 'newest') {
    filteredListings.sort(function(listingA, listingB) {
      return new Date(listingB.posted) - new Date(listingA.posted);
    });
  }

  renderListingCards(filteredListings, 'jobCardsGrid');
  updateResultsCount(filteredListings.length);
  buildSwipeDeck(filteredListings);

  if (filteredListings.length === 0) {
    showNoMatchesDialog();
  }
}

function resetAllFilters() {
  document.getElementById('filterSearch').value          = '';
  document.getElementById('filterOpportunityType').value = '';
  document.getElementById('filterLocation').value        = '';
  document.getElementById('filterIndustry').value        = '';
  document.getElementById('filterAllowance').value       = '';
  document.getElementById('sortOrder').value             = 'match';
  renderListingCards(allLoadedListings, 'jobCardsGrid');
  updateResultsCount(allLoadedListings.length);
  buildSwipeDeck(allLoadedListings);
}

function updateResultsCount(totalCount) {
  var countLabel = document.getElementById('resultsCountLabel');
  if (countLabel) countLabel.textContent = totalCount + ' listing' + (totalCount !== 1 ? 's' : '') + ' found';
}

function switchToListView() {
  currentViewMode = 'list';
  document.getElementById('listViewArea').style.display  = 'block';
  document.getElementById('swipeViewArea').style.display = 'none';
  document.getElementById('btnListView').classList.add('is-active');
  document.getElementById('btnSwipeView').classList.remove('is-active');
}

function switchToSwipeView() {
  currentViewMode = 'swipe';
  document.getElementById('listViewArea').style.display  = 'none';
  document.getElementById('swipeViewArea').style.display = 'block';
  document.getElementById('btnListView').classList.remove('is-active');
  document.getElementById('btnSwipeView').classList.add('is-active');
}

function buildSwipeDeck(listingsForDeck) {
  var deckWrapper = document.getElementById('swipeDeckWrap');
  if (!deckWrapper) return;
  swipeFrontCardIndex = 0;
  deckWrapper.innerHTML = '';
  if (listingsForDeck.length === 0) {
    deckWrapper.innerHTML = '<div style="text-align:center;padding:40px;color:#9ca39c;">No cards to show.</div>';
    return;
  }

  var maxCardsToRender = Math.min(listingsForDeck.length, 3);
  for (var cardIndex = maxCardsToRender - 1; cardIndex >= 0; cardIndex--) {
    var swipeCardElement  = document.createElement('div');
    swipeCardElement.className = 'swipe-card-item ' + getStackClass(cardIndex);
    swipeCardElement.id        = 'swipeCard_' + cardIndex;
    swipeCardElement.innerHTML = buildSwipeCardHTML(listingsForDeck[cardIndex]);
    deckWrapper.appendChild(swipeCardElement);
  }

  attachSwipeListeners(listingsForDeck);
  updateSwipeProgress(swipeFrontCardIndex, listingsForDeck.length);
}

function getStackClass(cardIndexInStack) {
  if (cardIndexInStack === 0) return 'stack-front';
  if (cardIndexInStack === 1) return 'stack-middle';
  return 'stack-back';
}

function buildSwipeCardHTML(listingItem) {
  var skillTagsHTML = listingItem.skills.split(',').map(function(skillName) {
    return '<span class="card-skill-tag">' + skillName.trim() + '</span>';
  }).join('');
  var typeBadgeClass = listingItem.type === 'internship' ? 'card-type-badge internship-badge' : 'card-type-badge';
  return '<div class="swipe-hint swipe-hint-yes"  id="hintYes">&#8593; YES</div>' +
    '<div class="swipe-hint swipe-hint-no"   id="hintNo">&#8595; NO</div>' +
    '<div class="swipe-hint swipe-hint-bookmark" id="hintSave">&#8594; SAVE</div>' +
    '<div class="swipe-hint swipe-hint-undo" id="hintUndo">&#8592; UNDO</div>' +
    '<div class="card-banner-area">' + listingItem.icon +
    (listingItem.verified === 'true' ? '<span class="card-verified-tag">&#10003; PESO</span>' : '') + '</div>' +
    '<div class="card-body-area">' +
    '<span class="' + typeBadgeClass + '">' + listingItem.type + '</span>' +
    '<div class="card-company">' + listingItem.company + '</div>' +
    '<div class="card-title">' + listingItem.title + '</div>' +
    '<div class="card-location">&#128205; ' + listingItem.city + '</div>' +
    '<div class="card-skills">' + skillTagsHTML + '</div>' +
    '<div class="card-stats">' +
    '<div><div class="card-stat-val">' + formatCurrency(listingItem.allowance) + '</div><div class="card-stat-key">Per Day</div></div>' +
    '<div><div class="card-stat-val">' + listingItem.duration + '</div><div class="card-stat-key">Duration</div></div>' +
    '</div></div>' +
    '<div class="card-action-row">' +
    '<button class="card-act-btn card-act-no"   onclick="triggerDeckSwipe(\'down\')">&#8595; Pass</button>' +
    '<button class="card-act-btn card-act-save"  onclick="triggerDeckSwipe(\'right\')">&#128278; Save</button>' +
    '<button class="card-act-btn card-act-yes"   onclick="triggerDeckSwipe(\'up\')">&#8593; Interested</button>' +
    '</div>';
}

function attachSwipeListeners(listingsForDeck) {
  var frontCard = document.querySelector('.swipe-card-item.stack-front');
  if (!frontCard) return;

  frontCard.addEventListener('mousedown', function(mouseEvent) {
    isDraggingCard = true;
    dragStartX     = mouseEvent.clientX;
    dragStartY     = mouseEvent.clientY;
    frontCard.style.transition = '';
  });

  document.addEventListener('mousemove', function(mouseMoveEvent) {
    if (!isDraggingCard) return;
    currentDragX = mouseMoveEvent.clientX - dragStartX;
    currentDragY = mouseMoveEvent.clientY - dragStartY;
    var cardRotation = currentDragX * TILT_FACTOR;
    frontCard.style.transform = 'translate(' + currentDragX + 'px,' + currentDragY + 'px) rotate(' + cardRotation + 'deg)';
    updateDragHints(currentDragX, currentDragY, frontCard);
  });

  document.addEventListener('mouseup', function() {
    if (!isDraggingCard) return;
    isDraggingCard = false;
    hideAllHints(frontCard);
    var dominantDirection = getDominantDirection(currentDragX, currentDragY);
    var dragMagnitude     = Math.max(Math.abs(currentDragX), Math.abs(currentDragY));
    if (dragMagnitude >= SWIPE_THRESHOLD) {
      triggerDeckSwipe(dominantDirection);
    } else {
      resetFrontCardPosition(frontCard);
    }
  });

  frontCard.addEventListener('touchstart', function(touchEvent) {
    isDraggingCard = true;
    dragStartX     = touchEvent.touches[0].clientX;
    dragStartY     = touchEvent.touches[0].clientY;
    frontCard.style.transition = '';
  }, { passive: true });

  document.addEventListener('touchmove', function(touchMoveEvent) {
    if (!isDraggingCard) return;
    currentDragX = touchMoveEvent.touches[0].clientX - dragStartX;
    currentDragY = touchMoveEvent.touches[0].clientY - dragStartY;
    var cardRotation = currentDragX * TILT_FACTOR;
    frontCard.style.transform = 'translate(' + currentDragX + 'px,' + currentDragY + 'px) rotate(' + cardRotation + 'deg)';
    updateDragHints(currentDragX, currentDragY, frontCard);
  }, { passive: true });

  document.addEventListener('touchend', function() {
    if (!isDraggingCard) return;
    isDraggingCard = false;
    hideAllHints(frontCard);
    var dominantDirection = getDominantDirection(currentDragX, currentDragY);
    var dragMagnitude     = Math.max(Math.abs(currentDragX), Math.abs(currentDragY));
    if (dragMagnitude >= SWIPE_THRESHOLD) {
      triggerDeckSwipe(dominantDirection);
    } else {
      resetFrontCardPosition(frontCard);
    }
  });
}

function getDominantDirection(deltaX, deltaY) {
  var absX = Math.abs(deltaX);
  var absY = Math.abs(deltaY);
  if (absX > absY) return deltaX > 0 ? 'right' : 'left';
  return deltaY > 0 ? 'down' : 'up';
}

function updateDragHints(deltaX, deltaY, cardElement) {
  var dominantDir  = getDominantDirection(deltaX, deltaY);
  var dragDistance = Math.max(Math.abs(deltaX), Math.abs(deltaY));
  var hintOpacity  = Math.max(0, Math.min((dragDistance - 20) / 40, 1));

  var hintYes  = cardElement.querySelector('#hintYes');
  var hintNo   = cardElement.querySelector('#hintNo');
  var hintSave = cardElement.querySelector('#hintSave');
  var hintUndo = cardElement.querySelector('#hintUndo');

  if (hintYes)  hintYes.style.opacity  = dominantDir === 'up'    ? hintOpacity : 0;
  if (hintNo)   hintNo.style.opacity   = dominantDir === 'down'  ? hintOpacity : 0;
  if (hintSave) hintSave.style.opacity = dominantDir === 'right' ? hintOpacity : 0;
  if (hintUndo) hintUndo.style.opacity = dominantDir === 'left'  ? hintOpacity : 0;
}

function hideAllHints(cardElement) {
  ['#hintYes','#hintNo','#hintSave','#hintUndo'].forEach(function(hintSelector) {
    var hintElement = cardElement.querySelector(hintSelector);
    if (hintElement) hintElement.style.opacity = 0;
  });
}

function resetFrontCardPosition(cardElement) {
  cardElement.style.transition = 'transform .3s ease';
  cardElement.style.transform  = '';
  setTimeout(function() { cardElement.style.transition = ''; }, 320);
}

function triggerDeckSwipe(swipeDirection) {
  var frontCard = document.querySelector('.swipe-card-item.stack-front');
  if (!frontCard) return;

  if (swipeDirection === 'up') {
    animateSwipeExit(frontCard, 0, -400, 0, function() { showToast('Interested! Waiting for employer match.'); });
  } else if (swipeDirection === 'down') {
    animateSwipeExit(frontCard, 0, 500, 0, function() { showToast('Passed.', 'warn'); });
  } else if (swipeDirection === 'right') {
    animateSwipeExit(frontCard, 400, -40, 15, function() { showToast('Bookmarked for later.'); });
  } else if (swipeDirection === 'left') {
    frontCard.style.transition = 'transform .25s ease';
    frontCard.style.transform  = 'translateX(-60px) rotate(-5deg)';
    setTimeout(function() {
      frontCard.style.transform = '';
      setTimeout(function() { frontCard.style.transition = ''; }, 200);
    }, 250);
    showToast('Undone.');
    return;
  }
}

function animateSwipeExit(cardElement, exitX, exitY, exitRotation, onCompleteCallback) {
  cardElement.style.transition = 'transform .38s ease, opacity .38s ease';
  cardElement.style.transform  = 'translate(' + exitX + 'px,' + exitY + 'px) rotate(' + exitRotation + 'deg)';
  cardElement.style.opacity    = '0';
  setTimeout(function() {
    cardElement.remove();
    var nextCard = document.querySelector('.swipe-card-item.stack-middle');
    if (nextCard) {
      nextCard.className = 'swipe-card-item stack-front';
      nextCard.style.transition = 'transform .3s ease';
      nextCard.style.transform  = '';
      setTimeout(function() { nextCard.style.transition = ''; }, 320);
    }
    var backCard = document.querySelector('.swipe-card-item.stack-back');
    if (backCard) {
      backCard.className = 'swipe-card-item stack-middle';
      backCard.style.transition = 'transform .3s ease';
      setTimeout(function() { backCard.style.transition = ''; }, 320);
    }
    swipeFrontCardIndex++;
    if (typeof allLoadedListings !== 'undefined') {
      updateSwipeProgress(swipeFrontCardIndex, allLoadedListings.length);
    }
    if (onCompleteCallback) onCompleteCallback();
  }, 400);
}

function updateSwipeProgress(currentIndex, totalCount) {
  var progressLabel = document.getElementById('swipeProgress');
  if (progressLabel) {
    progressLabel.textContent = 'Card ' + (currentIndex + 1) + ' of ' + totalCount;
  }
}