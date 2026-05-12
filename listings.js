var allLoadedListings   = [];
var currentViewMode     = 'list';
var swipeCurrentListings= [];
var swipeFrontIdx       = 0;
var swipeHistory        = [];

var dragStartX   = 0, dragStartY = 0;
var currentDragX = 0, currentDragY = 0;
var isDragging   = false;
var SWIPE_THRESHOLD = 55;
var TILT_FACTOR     = 0.05;

window.addEventListener('DOMContentLoaded', function() {
  var passed = JSON.parse(localStorage.getItem('sb_passed') || '[]');
  loadXMLListings(function(listings) {
    allLoadedListings = listings.filter(function(l) {
      return !passed.includes(String(l.id));
    });
    renderListingCards(allLoadedListings, 'jobCardsGrid');
    updateResultsCount(allLoadedListings.length);
    buildSwipeDeck(allLoadedListings);
  });
});

function applyAllFilters() {
  var searchText      = document.getElementById('filterSearch').value;
  var typeFilter      = document.getElementById('filterOpportunityType').value;
  var cityFilter      = document.getElementById('filterLocation').value;
  var industryFilter  = document.getElementById('filterIndustry').value;
  var allowanceFilter = document.getElementById('filterAllowance').value;
  var sortOrder       = document.getElementById('sortOrder').value;
  var passed          = JSON.parse(localStorage.getItem('sb_passed') || '[]');

  var filtered = applyListingFilters(allLoadedListings, searchText, typeFilter, cityFilter, industryFilter, allowanceFilter);
  filtered = filtered.filter(function(l) { return !passed.includes(String(l.id)); });

  if (sortOrder === 'allowance') {
    filtered.sort(function(a, b) { return parseInt(b.allowance) - parseInt(a.allowance); });
  } else if (sortOrder === 'newest') {
    filtered.sort(function(a, b) { return new Date(b.posted) - new Date(a.posted); });
  }

  renderListingCards(filtered, 'jobCardsGrid');
  updateResultsCount(filtered.length);
  buildSwipeDeck(filtered);
  if (filtered.length === 0) showNoMatchesDialog();
}

function resetAllFilters() {
  document.getElementById('filterSearch').value           = '';
  document.getElementById('filterOpportunityType').value  = '';
  document.getElementById('filterLocation').value         = '';
  document.getElementById('filterIndustry').value         = '';
  document.getElementById('filterAllowance').value        = '';
  document.getElementById('sortOrder').value              = 'match';
  var passed = JSON.parse(localStorage.getItem('sb_passed') || '[]');
  var visible = allLoadedListings.filter(function(l) { return !passed.includes(String(l.id)); });
  renderListingCards(visible, 'jobCardsGrid');
  updateResultsCount(visible.length);
  buildSwipeDeck(visible);
}

function updateResultsCount(n) {
  var el = document.getElementById('resultsCountLabel');
  if (el) el.textContent = n + ' listing' + (n !== 1 ? 's' : '') + ' found';
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

// ── SWIPE DECK (index-based) ────────────────────────────────────────────
function buildSwipeDeck(listings) {
  swipeCurrentListings = listings;
  swipeFrontIdx        = 0;
  swipeHistory         = [];
  renderSwipeDeck();
}

function renderSwipeDeck() {
  var wrap = document.getElementById('swipeDeckWrap');
  if (!wrap) return;
  wrap.innerHTML = '';

  if (!swipeCurrentListings.length || swipeFrontIdx >= swipeCurrentListings.length) {
    wrap.innerHTML = '<div style="text-align:center;padding:40px 20px;color:#9ca39c;"><div style="font-size:48px;margin-bottom:12px;">✅</div><div>No more cards in this view.</div></div>';
    updateSwipeProgress(swipeFrontIdx, swipeCurrentListings.length);
    return;
  }

  var remaining  = swipeCurrentListings.length - swipeFrontIdx;
  var cardCount  = Math.min(3, remaining);

  for (var i = cardCount - 1; i >= 0; i--) {
    var listing = swipeCurrentListings[swipeFrontIdx + i];
    var card    = document.createElement('div');
    card.className = 'swipe-card-item ' + ['stack-front','stack-middle','stack-back'][i];
    card.id        = 'swipeCard_' + i;
    card.innerHTML = buildSwipeCardHTML(listing);
    wrap.appendChild(card);
  }
  attachSwipeListeners();
  updateSwipeProgress(swipeFrontIdx, swipeCurrentListings.length);
}

function buildSwipeCardHTML(item) {
  var skillsHTML = item.skills.split(',').map(function(s) {
    return '<span class="card-skill-tag">' + s.trim() + '</span>';
  }).join('');
  var typeCls = item.type === 'internship' ? 'card-type-badge internship-badge' : 'card-type-badge';
  return '<div class="swipe-hint swipe-hint-yes"  id="hintYes">&#8593; YES</div>' +
    '<div class="swipe-hint swipe-hint-no"   id="hintNo">&#8595; NO</div>' +
    '<div class="swipe-hint swipe-hint-bookmark" id="hintSave">&#8594; SAVE</div>' +
    '<div class="swipe-hint swipe-hint-undo" id="hintUndo">&#8592; UNDO</div>' +
    '<div class="card-banner-area">' + item.icon +
    (item.verified === 'true' ? '<span class="card-verified-tag">&#10003; PESO</span>' : '') + '</div>' +
    '<div class="card-body-area">' +
    '<span class="' + typeCls + '">' + item.type + '</span>' +
    '<div class="card-company">' + item.company + '</div>' +
    '<div class="card-title">' + item.title + '</div>' +
    '<div class="card-location">&#128205; ' + item.city + '</div>' +
    '<div class="card-skills">' + skillsHTML + '</div>' +
    '<div class="card-stats">' +
    '<div><div class="card-stat-val">' + formatCurrency(item.allowance) + '</div><div class="card-stat-key">Per Day</div></div>' +
    '<div><div class="card-stat-val">' + item.duration + '</div><div class="card-stat-key">Duration</div></div>' +
    '</div></div>' +
    '<div class="card-action-row">' +
    '<button class="card-act-btn card-act-no"   onclick="triggerDeckSwipe(\'down\')">&#8595; Pass</button>' +
    '<button class="card-act-btn card-act-save"  onclick="triggerDeckSwipe(\'right\')">&#128278; Save</button>' +
    '<button class="card-act-btn card-act-yes"   onclick="triggerDeckSwipe(\'up\')">&#8593; Interested</button>' +
    '</div>';
}

function attachSwipeListeners() {
  var front = document.querySelector('.swipe-card-item.stack-front');
  if (!front) return;

  front.addEventListener('mousedown', function(e) {
    isDragging = true; dragStartX = e.clientX; dragStartY = e.clientY;
    front.style.transition = '';
  });
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup',   onDragEnd);

  front.addEventListener('touchstart', function(e) {
    isDragging = true; dragStartX = e.touches[0].clientX; dragStartY = e.touches[0].clientY;
    front.style.transition = '';
  }, { passive: true });
  document.addEventListener('touchmove', onTouchMove, { passive: true });
  document.addEventListener('touchend',  onDragEnd);

  function onDragMove(e) {
    if (!isDragging) return;
    currentDragX = e.clientX - dragStartX;
    currentDragY = e.clientY - dragStartY;
    front.style.transform = 'translate(' + currentDragX + 'px,' + currentDragY + 'px) rotate(' + (currentDragX * TILT_FACTOR) + 'deg)';
    updateDragHints(currentDragX, currentDragY, front);
  }
  function onTouchMove(e) {
    if (!isDragging) return;
    currentDragX = e.touches[0].clientX - dragStartX;
    currentDragY = e.touches[0].clientY - dragStartY;
    front.style.transform = 'translate(' + currentDragX + 'px,' + currentDragY + 'px) rotate(' + (currentDragX * TILT_FACTOR) + 'deg)';
    updateDragHints(currentDragX, currentDragY, front);
  }
  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup',   onDragEnd);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend',  onDragEnd);
    hideAllHints(front);
    var dir  = getDominantDirection(currentDragX, currentDragY);
    var dist = Math.max(Math.abs(currentDragX), Math.abs(currentDragY));
    if (dist >= SWIPE_THRESHOLD) {
      triggerDeckSwipe(dir);
    } else {
      front.style.transition = 'transform .3s ease';
      front.style.transform  = '';
      setTimeout(function() { front.style.transition = ''; }, 320);
    }
  }
}

function getDominantDirection(dx, dy) {
  return Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? 'right' : 'left')
    : (dy > 0 ? 'down' : 'up');
}

function updateDragHints(dx, dy, card) {
  var dir     = getDominantDirection(dx, dy);
  var dist    = Math.max(Math.abs(dx), Math.abs(dy));
  var opacity = Math.max(0, Math.min((dist - 20) / 40, 1));
  var map = { up:'#hintYes', down:'#hintNo', right:'#hintSave', left:'#hintUndo' };
  ['#hintYes','#hintNo','#hintSave','#hintUndo'].forEach(function(sel) {
    var el = card.querySelector(sel);
    if (el) el.style.opacity = (map[dir] === sel) ? opacity : 0;
  });
}

function hideAllHints(card) {
  ['#hintYes','#hintNo','#hintSave','#hintUndo'].forEach(function(sel) {
    var el = card.querySelector(sel);
    if (el) el.style.opacity = 0;
  });
}

function triggerDeckSwipe(direction) {
  // UNDO — restore last dismissed card
  if (direction === 'left') {
    if (swipeFrontIdx > 0 && swipeHistory.length > 0) {
      var last = swipeHistory.pop();
      swipeFrontIdx--;
      // Undo pass from localStorage
      if (last.action === 'pass') {
        var passed = JSON.parse(localStorage.getItem('sb_passed') || '[]');
        passed = passed.filter(function(id) { return id !== String(last.listingId); });
        localStorage.setItem('sb_passed', JSON.stringify(passed));
      }
      renderSwipeDeck();
      showToast('Undone!');
    } else {
      // Bounce animation if nothing to undo
      var front = document.querySelector('.swipe-card-item.stack-front');
      if (front) {
        front.style.transition = 'transform .25s ease';
        front.style.transform  = 'translateX(-50px) rotate(-5deg)';
        setTimeout(function() {
          front.style.transform = '';
          setTimeout(function() { front.style.transition = ''; }, 250);
        }, 250);
      }
      showToast('Nothing to undo.', 'warn');
    }
    return;
  }

  var front = document.querySelector('.swipe-card-item.stack-front');
  if (!front || swipeFrontIdx >= swipeCurrentListings.length) return;

  var listing = swipeCurrentListings[swipeFrontIdx];

  if (direction === 'up') {
    doCardAction('yes', listing);
    swipeHistory.push({ action: 'yes', listingId: listing.id });
    animateExit(front, 0, -450, 0, function() { swipeFrontIdx++; renderSwipeDeck(); });
  } else if (direction === 'down') {
    doCardAction('pass', listing);
    swipeHistory.push({ action: 'pass', listingId: listing.id });
    animateExit(front, 0, 520, 0, function() { swipeFrontIdx++; renderSwipeDeck(); });
  } else if (direction === 'right') {
    doCardAction('save', listing);
    swipeHistory.push({ action: 'save', listingId: listing.id });
    animateExit(front, 420, -40, 15, function() { swipeFrontIdx++; renderSwipeDeck(); });
  }
}

function animateExit(card, x, y, rot, cb) {
  card.style.transition = 'transform .38s ease, opacity .38s ease';
  card.style.transform  = 'translate(' + x + 'px,' + y + 'px) rotate(' + rot + 'deg)';
  card.style.opacity    = '0';
  setTimeout(function() { card.remove(); if (cb) cb(); }, 400);
}

function updateSwipeProgress(idx, total) {
  var el = document.getElementById('swipeProgress');
  if (el) el.textContent = (idx < total) ? 'Card ' + (idx + 1) + ' of ' + total : 'All cards viewed';
}

// ── CARD ACTIONS (list view + swipe share this) ─────────────────────────
function doCardAction(actionType, listing) {
  var listingId = listing.id;
  var session   = JSON.parse(localStorage.getItem('sb_session') || 'null');

  if (actionType === 'yes') {
    if (!session || !session.access_token) {
      showToast('Please log in to express interest.', 'warn');
      setTimeout(function() { window.location.href = 'login.html'; }, 1500);
      return;
    }
    var matches = JSON.parse(localStorage.getItem('sb_local_matches') || '[]');
    var exists  = matches.find(function(m) { return String(m.listing.id) === String(listingId); });
    if (!exists) {
      matches.push({ id: 'match_' + Date.now(), listing: listing, timestamp: new Date().toISOString() });
      localStorage.setItem('sb_local_matches', JSON.stringify(matches));
    }
    showToast('Interested! Check My Matches.');

  } else if (actionType === 'save') {
    var bookmarks = JSON.parse(localStorage.getItem('sb_bookmarks_full') || '[]');
    var bExists   = bookmarks.find(function(b) { return String(b.id) === String(listingId); });
    if (!bExists) {
      bookmarks.push(listing);
      localStorage.setItem('sb_bookmarks_full', JSON.stringify(bookmarks));
      showToast('Bookmarked! View in My Matches.');
    } else {
      bookmarks = bookmarks.filter(function(b) { return String(b.id) !== String(listingId); });
      localStorage.setItem('sb_bookmarks_full', JSON.stringify(bookmarks));
      showToast('Removed from bookmarks.', 'warn');
    }

  } else if (actionType === 'pass') {
    var passed = JSON.parse(localStorage.getItem('sb_passed') || '[]');
    if (!passed.includes(String(listingId))) {
      passed.push(String(listingId));
      localStorage.setItem('sb_passed', JSON.stringify(passed));
    }
    showToast('Passed.', 'warn');
    // Remove from list view
    var card = document.querySelector('[data-id="' + listingId + '"]');
    if (card) {
      card.style.transition = 'opacity .3s, transform .3s';
      card.style.opacity    = '0';
      card.style.transform  = 'translateX(-20px)';
      setTimeout(function() { if (card.parentNode) card.parentNode.removeChild(card); }, 300);
    }
  }
}

// Called from list view card buttons
function handleCardAction(actionType, listingId) {
  var listing = (cachedListingsData || allLoadedListings || []).find(function(l) {
    return String(l.id) === String(listingId);
  });
  if (listing) doCardAction(actionType, listing);
}

// ── UNDO for list view ─────────────────────────────────────────────────
function undoLastPass() {
  var passed = JSON.parse(localStorage.getItem('sb_passed') || '[]');
  if (!passed.length) { showToast('Nothing to undo.', 'warn'); return; }
  passed.pop();
  localStorage.setItem('sb_passed', JSON.stringify(passed));
  applyAllFilters();
  showToast('Last pass undone!');
}