var cachedListingsData = null;

function loadXMLListings(callbackFunction) {
  if (cachedListingsData) {
    callbackFunction(cachedListingsData);
    return;
  }

  fetch('/api/get-listings')
    .then(function(res) {
      if (!res.ok) throw new Error('API not available');
      return res.json();
    })
    .then(function(rows) {
      var listings = rows.map(function(r) {
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
      });
      cachedListingsData = listings;
      callbackFunction(listings);
    })
    .catch(function() {
      console.warn('API unavailable, falling back to XML.');
      loadFromXML(callbackFunction);
    });
}

function loadFromXML(callbackFunction) {
  var xmlRequest = new XMLHttpRequest();
  xmlRequest.open('GET', 'xml/listings.xml', true);
  xmlRequest.onload = function() {
    if (xmlRequest.status === 200) {
      var parsedXMLDoc = xmlRequest.responseXML;
      var listingNodes = parsedXMLDoc.getElementsByTagName('listing');
      var allListings  = [];
      for (var i = 0; i < listingNodes.length; i++) {
        var n = listingNodes[i];
        allListings.push({
          id:        n.getAttribute('id'),
          title:     getXMLText(n, 'title'),
          company:   getXMLText(n, 'company'),
          type:      getXMLText(n, 'type'),
          industry:  getXMLText(n, 'industry'),
          city:      getXMLText(n, 'city'),
          allowance: getXMLText(n, 'allowance'),
          duration:  getXMLText(n, 'duration'),
          slots:     getXMLText(n, 'slots'),
          skills:    getXMLText(n, 'skills'),
          verified:  getXMLText(n, 'verified'),
          featured:  getXMLText(n, 'featured'),
          status:    getXMLText(n, 'status'),
          posted:    getXMLText(n, 'posted'),
          icon:      getXMLText(n, 'icon')
        });
      }
      cachedListingsData = allListings;
      callbackFunction(allListings);
    }
  };
  xmlRequest.onerror = function() {
    callbackFunction(getFallbackListings());
  };
  xmlRequest.send();
}

function getXMLText(parentNode, tagName) {
  var foundElements = parentNode.getElementsByTagName(tagName);
  return foundElements.length > 0 ? foundElements[0].textContent.trim() : '';
}

function applyListingFilters(listingsArray, searchText, typeFilter, cityFilter, industryFilter, allowanceFilter) {
  return listingsArray.filter(function(listingItem) {
    var searchLower    = searchText.toLowerCase();
    var matchesSearch  = !searchText ||
      listingItem.title.toLowerCase().includes(searchLower) ||
      listingItem.company.toLowerCase().includes(searchLower) ||
      listingItem.skills.toLowerCase().includes(searchLower);
    var matchesType     = !typeFilter     || listingItem.type     === typeFilter;
    var matchesCity     = !cityFilter     || listingItem.city     === cityFilter;
    var matchesIndustry = !industryFilter || listingItem.industry === industryFilter;
    var matchesAllowance= !allowanceFilter|| parseInt(listingItem.allowance) >= parseInt(allowanceFilter);
    return matchesSearch && matchesType && matchesCity && matchesIndustry && matchesAllowance;
  });
}

function buildJobCardHTML(listingItem) {
  var skillTagsHTML  = listingItem.skills.split(',').map(function(skillName) {
    return '<span class="card-skill-tag">' + skillName.trim() + '</span>';
  }).join('');
  var typeBadgeClass = listingItem.type === 'internship' ? 'card-type-badge internship-badge' : 'card-type-badge';
  var featuredHTML   = listingItem.featured === 'true' ? '<span class="card-featured-tag">Featured</span>' : '';
  var verifiedHTML   = listingItem.verified === 'true' ? '<span class="card-verified-tag">&#10003; PESO</span>' : '';
  return '<div class="job-card-item' + (listingItem.featured === 'true' ? ' is-featured' : '') + '" data-id="' + listingItem.id + '">' +
    '<div class="card-banner-area">' + listingItem.icon + featuredHTML + verifiedHTML + '</div>' +
    '<div class="card-body-area">' +
    '<span class="' + typeBadgeClass + '">' + listingItem.type + '</span>' +
    '<div class="card-company">' + listingItem.company + '</div>' +
    '<div class="card-title">' + listingItem.title + '</div>' +
    '<div class="card-location">&#128205; ' + listingItem.city + '</div>' +
    '<div class="card-skills">' + skillTagsHTML + '</div>' +
    '<div class="card-stats">' +
    '<div><div class="card-stat-val">' + formatCurrency(listingItem.allowance) + '</div><div class="card-stat-key">Per Day</div></div>' +
    '<div><div class="card-stat-val">' + listingItem.duration + '</div><div class="card-stat-key">Duration</div></div>' +
    '<div><div class="card-stat-val">' + listingItem.slots + '</div><div class="card-stat-key">Slots</div></div>' +
    '</div></div>' +
    '<div class="card-action-row">' +
    '<button class="card-act-btn card-act-no"   onclick="handleCardAction(\'pass\',' + listingItem.id + ')">&#8595; Pass</button>' +
    '<button class="card-act-btn card-act-save"  onclick="handleCardAction(\'save\',' + listingItem.id + ')">&#128278; Save</button>' +
    '<button class="card-act-btn card-act-yes"   onclick="handleCardAction(\'yes\','  + listingItem.id + ')">&#8593; Interested</button>' +
    '</div></div>';
}

function renderListingCards(listingsArray, gridElementId) {
  var gridElement = document.getElementById(gridElementId);
  if (!gridElement) return;
  if (listingsArray.length === 0) {
    gridElement.innerHTML = '<div class="loading-placeholder">No listings found for your filters.</div>';
    return;
  }
  gridElement.innerHTML = listingsArray.map(buildJobCardHTML).join('');
}

function handleCardAction(actionType, listingId) {
  if (actionType === 'yes') {
    showToast('Expressed interest! Waiting for employer match.');
  } else if (actionType === 'save') {
    toggleBookmark(String(listingId));
  } else if (actionType === 'pass') {
    showToast('Passed on this listing.', 'warn');
  }
}

function getFallbackListings() {
  return [
    { id:'1', title:'Electrical Apprentice', company:'Santos Electric Services', type:'apprenticeship', industry:'electrical', city:'Batangas City', allowance:'450', duration:'6 months', slots:'2', skills:'Electrical Wiring, Safety Protocols', verified:'true', featured:'true', status:'active', posted:'2024-11-01', icon:'⚡' },
    { id:'2', title:'IT Support Intern', company:'TechCore Solutions', type:'internship', industry:'it', city:'Calamba', allowance:'500', duration:'3 months', slots:'2', skills:'Troubleshooting, Networking', verified:'true', featured:'true', status:'active', posted:'2024-11-04', icon:'💻' },
    { id:'3', title:'Web Development Intern', company:'DigiPinas Inc.', type:'internship', industry:'it', city:'Santa Rosa', allowance:'550', duration:'3 months', slots:'2', skills:'HTML, CSS, JavaScript', verified:'true', featured:'true', status:'active', posted:'2024-11-05', icon:'🌐' }
  ];
}