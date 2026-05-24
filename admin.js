var adminAllListings = [];
var adminAllUsers    = [];
var editingId        = null;

var adminAllUsersStatic = [
  { id:1,  name:'Juan dela Cruz',     city:'Batangas City', skills:'Electrical Wiring, Safety Protocols', verified:true  },
  { id:2,  name:'Maria Santos',       city:'Lipa City',     skills:'Food Preparation, Customer Service',  verified:true  },
  { id:3,  name:'Pedro Reyes',        city:'Calamba',       skills:'PC Assembly, Troubleshooting',        verified:true  },
  { id:4,  name:'Ana Bautista',       city:'Santa Rosa',    skills:'Bookkeeping, Excel',                  verified:false },
  { id:5,  name:'Carlo Mendoza',      city:'Tanauan',       skills:'Arc Welding, Metal Cutting',          verified:true  },
  { id:6,  name:'Liza Cruz',          city:'Lucena',        skills:'Personal Care, First Aid',            verified:true  },
  { id:7,  name:'Manny Torres',       city:'Antipolo',      skills:'Engine Repair, Diagnostics',          verified:true  },
  { id:8,  name:'Grace Flores',       city:'Batangas City', skills:'HTML, CSS, JavaScript',               verified:false },
  { id:9,  name:'Renz Aquino',        city:'Cabuyao',       skills:'Bricklaying, Plastering',             verified:true  },
  { id:10, name:'Sheena Villanueva',  city:'Antipolo',      skills:'Photoshop, Social Media',             verified:true  }
];

window.addEventListener('DOMContentLoaded', function() {
  loadXMLListings(function(loaded) {
    adminAllListings = loaded;
    adminAllUsers    = adminAllUsersStatic;
    renderAdminListingsTable(adminAllListings);
    renderAdminUsersTable(adminAllUsers);
    document.getElementById('statTotalListings').textContent = loaded.length;
    document.getElementById('statActiveUsers').textContent   = adminAllUsers.length;
  });
});

// ── RENDER LISTINGS TABLE ─────────────────────────────────────────────
function renderAdminListingsTable(list) {
  var tbody = document.getElementById('adminListingsBody');
  if (!tbody) return;
  tbody.innerHTML = list.map(function(l) {
    var typeBadge   = '<span class="badge badge-' + l.type   + '">' + l.type   + '</span>';
    var statusBadge = '<span class="badge badge-' + l.status + '">' + l.status + '</span>';
    return '<tr>' +
      '<td>' + l.id + '</td>' +
      '<td><strong>' + l.title + '</strong></td>' +
      '<td>' + l.company + '</td>' +
      '<td>' + typeBadge + '</td>' +
      '<td>' + l.city + '</td>' +
      '<td>&#8369;' + l.allowance + '</td>' +
      '<td>' + statusBadge + '</td>' +
      '<td>' +
        '<button class="tbl-btn" onclick="openEditModal(' + l.id + ')">Edit</button>' +
        '<button class="tbl-btn tbl-btn-danger" onclick="confirmDeleteListing(' + l.id + ')">Delete</button>' +
      '</td></tr>';
  }).join('');
}

// ── RENDER USERS TABLE ────────────────────────────────────────────────
function renderAdminUsersTable(users) {
  var tbody = document.getElementById('adminUsersBody');
  if (!tbody) return;
  tbody.innerHTML = users.map(function(u) {
    var badge = u.verified
      ? '<span class="badge badge-verified">&#10003; Verified</span>'
      : '<span class="badge badge-pending">Pending</span>';
    return '<tr>' +
      '<td>' + u.id + '</td>' +
      '<td><strong>' + u.name + '</strong></td>' +
      '<td>' + u.city + '</td>' +
      '<td>' + u.skills + '</td>' +
      '<td>' + badge + '</td>' +
      '<td>' +
        '<button class="tbl-btn" onclick="showToast(\'Profile viewed\')">View</button>' +
        '<button class="tbl-btn tbl-btn-danger" onclick="showToast(\'User flagged\',\'error\')">Flag</button>' +
      '</td></tr>';
  }).join('');
}

// ── FILTERS ───────────────────────────────────────────────────────────
function applyAdminListingsFilter() {
  var search = document.getElementById('adminListingsSearch').value.toLowerCase();
  var type   = document.getElementById('adminFilterType').value.toLowerCase();
  var city   = document.getElementById('adminFilterCity').value.toLowerCase();
  var status = document.getElementById('adminFilterStatus').value.toLowerCase();
  var rows   = document.getElementById('adminListingsBody').getElementsByTagName('tr');
  for (var i = 0; i < rows.length; i++) {
    var t = rows[i].textContent.toLowerCase();
    rows[i].style.display =
      (!search || t.includes(search)) &&
      (!type   || t.includes(type))   &&
      (!city   || t.includes(city))   &&
      (!status || t.includes(status)) ? '' : 'none';
  }
}

function applyAdminUsersFilter() {
  var search   = document.getElementById('adminUsersSearch').value.toLowerCase();
  var city     = document.getElementById('adminFilterUserCity').value.toLowerCase();
  var verified = document.getElementById('adminFilterVerified').value.toLowerCase();
  var rows     = document.getElementById('adminUsersBody').getElementsByTagName('tr');
  for (var i = 0; i < rows.length; i++) {
    var t = rows[i].textContent.toLowerCase();
    rows[i].style.display =
      (!search   || t.includes(search))   &&
      (!city     || t.includes(city))     &&
      (!verified || t.includes(verified)) ? '' : 'none';
  }
}

// ── SORT ──────────────────────────────────────────────────────────────
function sortTable(bodyId, colIdx) {
  var tbody = document.getElementById(bodyId);
  var rows  = Array.from(tbody.getElementsByTagName('tr'));
  rows.sort(function(a, b) {
    var ca = a.cells[colIdx] ? a.cells[colIdx].textContent.trim() : '';
    var cb = b.cells[colIdx] ? b.cells[colIdx].textContent.trim() : '';
    return ca.localeCompare(cb);
  });
  rows.forEach(function(r) { tbody.appendChild(r); });
}

// ── PRINT ─────────────────────────────────────────────────────────────
function printAdminTable(bodyId, printTitle) {
  var tbody = document.getElementById(bodyId);
  if (!tbody) return;
  var w = window.open('', '_blank');
  w.document.write(
    '<html><head><title>' + printTitle + '</title>' +
    '<style>body{font-family:Arial,sans-serif;font-size:12px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:7px 10px;text-align:left;}th{background:#f3f4f3;font-weight:700;}</style>' +
    '</head><body><h2>' + printTitle + '</h2>' +
    '<table><tbody>' + tbody.innerHTML + '</tbody></table>' +
    '</body></html>'
  );
  w.document.close();
  w.print();
}

// ── ADD LISTING ───────────────────────────────────────────────────────
function saveNewListing() {
  var title    = document.getElementById('newTitle').value.trim();
  var company  = document.getElementById('newCompany').value.trim();
  var type     = document.getElementById('newType').value;
  var city     = document.getElementById('newCity').value.trim();
  var allowance= document.getElementById('newAllowance').value.trim();
  var duration = document.getElementById('newDuration').value.trim();
  var skills   = document.getElementById('newSkills').value.trim();

  if (!title || !company || !city) {
    showToast('Title, company, and city are required.', 'error'); return;
  }

  fetch('/api/add-listing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, company, type, city, allowance, duration, skills, industry: 'general', slots: 1, icon: '💼' })
  })
  .then(function(r) { return r.json(); })
  .then(function(row) {
    var mapped = mapRow(row);
    adminAllListings.push(mapped);
    cachedListingsData = adminAllListings;
    renderAdminListingsTable(adminAllListings);
    document.getElementById('statTotalListings').textContent = adminAllListings.length;
    closeModal('addListingModal');
    showToast('Listing added to database.');
    // clear form
    ['newTitle','newCompany','newCity','newAllowance','newDuration','newSkills'].forEach(function(id) {
      document.getElementById(id).value = '';
    });
  })
  .catch(function() { showToast('Failed to add. Check connection.', 'error'); });
}

// ── EDIT LISTING ──────────────────────────────────────────────────────
function openEditModal(listingId) {
  var listing = adminAllListings.find(function(l) { return String(l.id) === String(listingId); });
  if (!listing) return;
  editingId = listingId;

  document.getElementById('editTitle').value    = listing.title;
  document.getElementById('editCompany').value  = listing.company;
  document.getElementById('editType').value     = listing.type;
  document.getElementById('editCity').value     = listing.city;
  document.getElementById('editAllowance').value= listing.allowance;
  document.getElementById('editDuration').value = listing.duration;
  document.getElementById('editSlots').value    = listing.slots;
  document.getElementById('editSkills').value   = listing.skills;
  document.getElementById('editStatus').value   = listing.status;
  document.getElementById('editIndustry').value = listing.industry;
  document.getElementById('editFeatured').value = listing.featured;
  document.getElementById('editVerified').value = listing.verified;

  openModal('editListingModal');
}

function saveEditListing() {
  if (!editingId) return;

  var body = {
    title:    document.getElementById('editTitle').value.trim(),
    company:  document.getElementById('editCompany').value.trim(),
    type:     document.getElementById('editType').value,
    city:     document.getElementById('editCity').value.trim(),
    allowance:document.getElementById('editAllowance').value,
    duration: document.getElementById('editDuration').value.trim(),
    slots:    document.getElementById('editSlots').value,
    skills:   document.getElementById('editSkills').value.trim(),
    status:   document.getElementById('editStatus').value,
    industry: document.getElementById('editIndustry').value,
    featured: document.getElementById('editFeatured').value,
    verified: document.getElementById('editVerified').value,
    icon:     adminAllListings.find(function(l) { return String(l.id) === String(editingId); })?.icon || '💼'
  };

  if (!body.title || !body.company || !body.city) {
    showToast('Title, company, and city are required.', 'error'); return;
  }

  fetch('/api/update-listing?id=' + editingId, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  .then(function(r) { return r.json(); })
  .then(function(updated) {
    var idx = adminAllListings.findIndex(function(l) { return String(l.id) === String(editingId); });
    if (idx !== -1) {
      adminAllListings[idx] = mapRow(updated);
      cachedListingsData = adminAllListings;
    }
    renderAdminListingsTable(adminAllListings);
    closeModal('editListingModal');
    editingId = null;
    showToast('Listing updated successfully.');
  })
  .catch(function() { showToast('Update failed. Check connection.', 'error'); });
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

// ── DELETE LISTING ────────────────────────────────────────────────────
function confirmDeleteListing(listingId) {
  if (confirm('Delete listing ID ' + listingId + '? This cannot be undone.')) {
    fetch('/api/delete-listing?id=' + listingId, { method: 'DELETE' })
    .then(function(r) { return r.json(); })
    .then(function() {
      adminAllListings = adminAllListings.filter(function(l) { return l.id !== String(listingId); });
      cachedListingsData = adminAllListings;
      renderAdminListingsTable(adminAllListings);
      document.getElementById('statTotalListings').textContent = adminAllListings.length;
      showToast('Listing ' + listingId + ' deleted.', 'error');
    })
    .catch(function() { showToast('Delete failed.', 'error'); });
  }
}

// ── EXPORT ────────────────────────────────────────────────────────────
function exportAsCSV() {
  var header = 'ID,Title,Company,Type,City,Allowance,Duration,Skills\n';
  var rows   = adminAllListings.map(function(l) {
    return [l.id, l.title, l.company, l.type, l.city, l.allowance, l.duration, '"' + l.skills + '"'].join(',');
  }).join('\n');
  var blob = new Blob([header + rows], { type: 'text/csv' });
  var a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'skillbridge_export.csv';
  a.click();
  showToast('CSV exported.');
}

function exportAsJSON() {
  var blob = new Blob([JSON.stringify(adminAllListings, null, 2)], { type: 'application/json' });
  var a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'skillbridge_export.json';
  a.click();
  showToast('JSON exported.');
}