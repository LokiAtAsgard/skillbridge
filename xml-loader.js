var cachedListingsData = null;

function loadListings(callbackFunction, params) {
  var query = params || {};

  // If we have cache and no specific params, use cache
  if (cachedListingsData && !params) {
    callbackFunction(cachedListingsData);
    return;
  }

  var queryString = Object.keys(query).map(function(k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(query[k]);
  }).join('&');

  fetch('/api/get-listings' + (queryString ? '?' + queryString : ''))
    .then(function(res) {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then(function(rows) {
      var listings = rows.map(mapRow);
      if (!params) cachedListingsData = listings;
      callbackFunction(listings);
    })
    .catch(function(err) {
      console.error('Failed to load listings:', err);
      callbackFunction(getFallbackListings());
    });
}

// Keep loadXMLListings as an alias so existing pages still work
function loadXMLListings(cb) {
  loadListings(cb);
}

function mapRow(r) {
  return {
    id:        String(r.id),
    title:     r.title     || '',
    company:   r.company   || '',
    type:      r.type      || '',
    industry:  r.industry  || '',
    city:      r.city      || '',
    allowance: String(r.allowance || 0),
    duration:  r.duration  || '',
    slots:     String(r.slots || 1),
    skills:    r.skills    || '',
    verified:  r.verified  ? 'true' : 'false',
    featured:  r.featured  ? 'true' : 'false',
    status:    r.status    || 'active',
    posted:    r.posted    || '',
    icon:      r.icon      || '💼'
  };
}

function applyListingFilters(listingsArray, searchText, typeFilter, cityFilter, industryFilter, allowanceFilter) {
  return listingsArray.filter(function(l) {
    var s = (searchText || '').toLowerCase();
    var matchSearch   = !s || l.title.toLowerCase().includes(s) || l.company.toLowerCase().includes(s) || l.skills.toLowerCase().includes(s);
    var matchType     = !typeFilter     || l.type     === typeFilter;
    var matchCity     = !cityFilter     || l.city     === cityFilter;
    var matchIndustry = !industryFilter || l.industry === industryFilter;
    var matchAllowance= !allowanceFilter|| parseInt(l.allowance) >= parseInt(allowanceFilter);
    return matchSearch && matchType && matchCity && matchIndustry && matchAllowance;
  });
}

function buildJobCardHTML(l) {
  var skillsHTML = l.skills.split(',').map(function(s) {
    return '<span class="card-skill-tag">' + s.trim() + '</span>';
  }).join('');
  var typeCls    = l.type === 'internship' ? 'card-type-badge internship-badge' : 'card-type-badge';
  var featuredHTML = l.featured === 'true' ? '<span class="card-featured-tag">Featured</span>' : '';
  var verifiedHTML = l.verified === 'true' ? '<span class="card-verified-tag">&#10003; PESO</span>' : '';

  return '<div class="job-card-item' + (l.featured === 'true' ? ' is-featured' : '') + '" data-id="' + l.id + '">' +
    '<div class="card-banner-area">' + l.icon + featuredHTML + verifiedHTML + '</div>' +
    '<div class="card-body-area">' +
    '<span class="' + typeCls + '">' + l.type + '</span>' +
    '<div class="card-company">' + l.company + '</div>' +
    '<div class="card-title">' + l.title + '</div>' +
    '<div class="card-location">&#128205; ' + l.city + '</div>' +
    '<div class="card-skills">' + skillsHTML + '</div>' +
    '<div class="card-stats">' +
    '<div><div class="card-stat-val">' + formatCurrency(l.allowance) + '</div><div class="card-stat-key">Per Day</div></div>' +
    '<div><div class="card-stat-val">' + l.duration + '</div><div class="card-stat-key">Duration</div></div>' +
    '<div><div class="card-stat-val">' + l.slots + '</div><div class="card-stat-key">Slots</div></div>' +
    '</div></div>' +
    '<div class="card-action-row">' +
    '<button class="card-act-btn card-act-no"   onclick="handleCardAction(\'pass\',' + l.id + ')">&#8595; Pass</button>' +
    '<button class="card-act-btn card-act-save"  onclick="handleCardAction(\'save\',' + l.id + ')">&#128278; Save</button>' +
    '<button class="card-act-btn card-act-yes"   onclick="handleCardAction(\'yes\','  + l.id + ')">&#8593; Interested</button>' +
    '</div></div>';
}

function renderListingCards(listingsArray, gridElementId) {
  var grid = document.getElementById(gridElementId);
  if (!grid) return;
  if (!listingsArray.length) {
    grid.innerHTML = '<div class="loading-placeholder">No listings found.</div>';
    return;
  }
  grid.innerHTML = listingsArray.map(buildJobCardHTML).join('');
}

function handleCardAction(actionType, listingId) {
  var session = JSON.parse(localStorage.getItem('sb_session') || 'null');
  var listing  = (cachedListingsData || []).find(function(l) { return String(l.id) === String(listingId); });

  if (actionType === 'yes') {
    if (!session || !session.access_token) {
      showToast('Please log in to express interest.', 'warn');
      setTimeout(function() { window.location.href = 'login.html'; }, 1500);
      return;
    }
    var matches = JSON.parse(localStorage.getItem('sb_local_matches') || '[]');
    if (listing && !matches.find(function(m) { return String(m.listing.id) === String(listingId); })) {
      matches.push({ id: 'match_' + Date.now(), listing: listing, timestamp: new Date().toISOString() });
      localStorage.setItem('sb_local_matches', JSON.stringify(matches));
    }
    showToast('Interested! Check My Matches.');
  } else if (actionType === 'save') {
    var bookmarks = JSON.parse(localStorage.getItem('sb_bookmarks_full') || '[]');
    var exists    = bookmarks.find(function(b) { return String(b.id) === String(listingId); });
    if (!exists && listing) {
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
    var card = document.querySelector('[data-id="' + listingId + '"]');
    if (card) {
      card.style.transition = 'opacity .3s, transform .3s';
      card.style.opacity    = '0';
      card.style.transform  = 'translateX(-20px)';
      setTimeout(function() { if (card.parentNode) card.parentNode.removeChild(card); }, 300);
    }
  }
}

function getFallbackListings() {
  return [];
}