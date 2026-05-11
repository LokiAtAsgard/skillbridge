var editingListingId = null; // Tracks which listing  currently editing
var adminAllListings = [];
var adminAllUsers    = [
  { id:1, name:'Juan dela Cruz',    city:'Batangas City', skills:'Electrical Wiring, Safety Protocols', verified:true  },
  { id:2, name:'Maria Santos',      city:'Lipa City',     skills:'Food Preparation, Customer Service',  verified:true  },
  { id:3, name:'Pedro Reyes',       city:'Calamba',       skills:'PC Assembly, Troubleshooting',        verified:true  },
  { id:4, name:'Ana Bautista',      city:'Santa Rosa',    skills:'Bookkeeping, Excel',                  verified:false },
  { id:5, name:'Carlo Mendoza',     city:'Tanauan',       skills:'Arc Welding, Metal Cutting',          verified:true  },
  { id:6, name:'Liza Cruz',         city:'Lucena',        skills:'Personal Care, First Aid',            verified:true  },
  { id:7, name:'Manny Torres',      city:'Antipolo',      skills:'Engine Repair, Diagnostics',          verified:true  },
  { id:8, name:'Grace Flores',      city:'Batangas City', skills:'HTML, CSS, JavaScript',               verified:false },
  { id:9, name:'Renz Aquino',       city:'Cabuyao',       skills:'Bricklaying, Plastering',             verified:true  },
  { id:10, name:'Sheena Villanueva',city:'Antipolo',      skills:'Photoshop, Social Media',             verified:true  }
];

window.addEventListener('DOMContentLoaded', function() {
  loadXMLListings(function(loadedListings) {
    adminAllListings = loadedListings;
    renderAdminListingsTable(adminAllListings);
    renderAdminUsersTable(adminAllUsers);
    document.getElementById('statTotalListings').textContent = loadedListings.length;
  });
});

function renderAdminListingsTable(listingsToShow) {
  var tableBody = document.getElementById('adminListingsBody');
  if (!tableBody) return;
  tableBody.innerHTML = listingsToShow.map(function(listingItem) {
    var typeBadge = '<span class="badge badge-' + listingItem.type + '">' + listingItem.type + '</span>';
    var statusBadge = '<span class="badge badge-' + listingItem.status + '">' + listingItem.status + '</span>';
    return '<tr>' +
      '<td>' + listingItem.id + '</td>' +
      '<td><strong>' + listingItem.title + '</strong></td>' +
      '<td>' + listingItem.company + '</td>' +
      '<td>' + typeBadge + '</td>' +
      '<td>' + listingItem.city + '</td>' +
      '<td>&#8369;' + listingItem.allowance + '</td>' +
      '<td>' + statusBadge + '</td>' +
      '<td>' +
      '<button class="tbl-btn" onclick="showToast(\'Edit coming soon\')">Edit</button>' +
      '<button class="tbl-btn tbl-btn-danger" onclick="confirmDeleteListing(' + listingItem.id + ')">Delete</button>' +
      '</td></tr>';
  }).join('');
}

function renderAdminUsersTable(usersToShow) {
  var tableBody = document.getElementById('adminUsersBody');
  if (!tableBody) return;
  tableBody.innerHTML = usersToShow.map(function(userItem) {
    var verifiedBadge = userItem.verified
      ? '<span class="badge badge-verified">&#10003; Verified</span>'
      : '<span class="badge badge-pending">Pending</span>';
    return '<tr>' +
      '<td>' + userItem.id + '</td>' +
      '<td><strong>' + userItem.name + '</strong></td>' +
      '<td>' + userItem.city + '</td>' +
      '<td>' + userItem.skills + '</td>' +
      '<td>' + verifiedBadge + '</td>' +
      '<td>' +
      '<button class="tbl-btn" onclick="showToast(\'Profile viewed\')">View</button>' +
      '<button class="tbl-btn tbl-btn-danger" onclick="showToast(\'User flagged\',\'error\')">Flag</button>' +
      '</td></tr>';
  }).join('');
}

function applyAdminListingsFilter() {
  var searchText  = document.getElementById('adminListingsSearch').value.toLowerCase();
  var typeFilter  = document.getElementById('adminFilterType').value.toLowerCase();
  var cityFilter  = document.getElementById('adminFilterCity').value.toLowerCase();
  var statusFilter= document.getElementById('adminFilterStatus').value.toLowerCase();
  var tableBody   = document.getElementById('adminListingsBody');
  var tableRows   = tableBody.getElementsByTagName('tr');
  for (var i = 0; i < tableRows.length; i++) {
    var row        = tableRows[i];
    var rowText    = row.textContent.toLowerCase();
    var matchSearch = !searchText  || rowText.includes(searchText);
    var matchType   = !typeFilter  || rowText.includes(typeFilter);
    var matchCity   = !cityFilter  || rowText.includes(cityFilter);
    var matchStatus = !statusFilter|| rowText.includes(statusFilter);
    row.style.display = (matchSearch && matchType && matchCity && matchStatus) ? '' : 'none';
  }
}

function applyAdminUsersFilter() {
  var searchText    = document.getElementById('adminUsersSearch').value.toLowerCase();
  var cityFilter    = document.getElementById('adminFilterUserCity').value.toLowerCase();
  var verifiedFilter= document.getElementById('adminFilterVerified').value.toLowerCase();
  var tableBody     = document.getElementById('adminUsersBody');
  var tableRows     = tableBody.getElementsByTagName('tr');
  for (var i = 0; i < tableRows.length; i++) {
    var row         = tableRows[i];
    var rowText     = row.textContent.toLowerCase();
    var matchSearch  = !searchText     || rowText.includes(searchText);
    var matchCity    = !cityFilter     || rowText.includes(cityFilter);
    var matchVerified= !verifiedFilter || rowText.includes(verifiedFilter);
    row.style.display = (matchSearch && matchCity && matchVerified) ? '' : 'none';
  }
}

function sortTable(tableBodyId, columnIndex) {
  var tableBody   = document.getElementById(tableBodyId);
  var tableRows   = Array.from(tableBody.getElementsByTagName('tr'));
  var sortedRows  = tableRows.sort(function(rowA, rowB) {
    var cellA = rowA.cells[columnIndex] ? rowA.cells[columnIndex].textContent.trim() : '';
    var cellB = rowB.cells[columnIndex] ? rowB.cells[columnIndex].textContent.trim() : '';
    return cellA.localeCompare(cellB);
  });
  sortedRows.forEach(function(sortedRow) { tableBody.appendChild(sortedRow); });
}

function printAdminTable(tableBodyId, printTitle) {
  var tableBody = document.getElementById(tableBodyId);
  if (!tableBody) return;
  var printWindow = window.open('', '_blank');
  printWindow.document.write(
    '<html><head><title>' + printTitle + '</title>' +
    '<style>body{font-family:Arial,sans-serif;font-size:12px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:7px 10px;text-align:left;}th{background:#f3f4f3;font-weight:700;}</style>' +
    '</head><body><h2>' + printTitle + '</h2>' +
    '<table><tbody>' + tableBody.innerHTML + '</tbody></table>' +
    '</body></html>'
  );
  printWindow.document.close();
  printWindow.print();
}

function confirmDeleteListing(listingId) {
  if (confirm('Delete listing ID ' + listingId + '? This cannot be undone.')) {
    showToast('Listing ' + listingId + ' deleted.', 'error');
  }
}

function saveNewListing() {
  var newTitle    = document.getElementById('newTitle').value.trim();
  var newCompany  = document.getElementById('newCompany').value.trim();
  var newType     = document.getElementById('newType').value;
  var newCity     = document.getElementById('newCity').value.trim();
  var newAllowance= document.getElementById('newAllowance').value.trim();
  var newDuration = document.getElementById('newDuration').value.trim();
  var newSkills   = document.getElementById('newSkills').value.trim();

  if (!newTitle || !newCompany || !newCity) {
    showToast('Title, company, and city are required.', 'error');
    return;
  }

  var newListingEntry = {
    id:       String(adminAllListings.length + 1),
    title:    newTitle,
    company:  newCompany,
    type:     newType,
    industry: 'general',
    city:     newCity,
    allowance:newAllowance || '0',
    duration: newDuration,
    slots:    '1',
    skills:   newSkills,
    verified: 'false',
    featured: 'false',
    status:   'active',
    posted:   new Date().toISOString().split('T')[0],
    icon:     '&#128188;'
  };

  adminAllListings.push(newListingEntry);
  renderAdminListingsTable(adminAllListings);
  document.getElementById('statTotalListings').textContent = adminAllListings.length;
  closeModal('addListingModal');
  showToast('New listing added successfully.');
}



function importXMLFile() {
  var fileInput = document.getElementById('xmlImportFile');
  var statusDiv = document.getElementById('importStatus');
  if (!fileInput.files.length) {
    showToast('Please select a .xml file first.', 'error');
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var parser  = new DOMParser();
    var xmlDoc  = parser.parseFromString(e.target.result, 'text/xml');
    var nodes   = xmlDoc.getElementsByTagName('listing');
    if (nodes.length === 0) {
      showToast('No listings found in XML file.', 'error');
      return;
    }
    adminAllListings = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      adminAllListings.push({
        id:        n.getAttribute('id'),
        title:     getXMLNodeText(n, 'title'),
        company:   getXMLNodeText(n, 'company'),
        type:      getXMLNodeText(n, 'type'),
        industry:  getXMLNodeText(n, 'industry'),
        city:      getXMLNodeText(n, 'city'),
        allowance: getXMLNodeText(n, 'allowance'),
        duration:  getXMLNodeText(n, 'duration'),
        slots:     getXMLNodeText(n, 'slots'),
        skills:    getXMLNodeText(n, 'skills'),
        verified:  getXMLNodeText(n, 'verified'),
        featured:  getXMLNodeText(n, 'featured'),
        status:    getXMLNodeText(n, 'status'),
        posted:    getXMLNodeText(n, 'posted'),
        icon:      getXMLNodeText(n, 'icon')
      });
    }
    cachedListingsData = adminAllListings;
    renderAdminListingsTable(adminAllListings);
    document.getElementById('statTotalListings').textContent = adminAllListings.length;
    statusDiv.textContent = 'Imported ' + nodes.length + ' listing(s) from XML.';
    showToast('XML imported: ' + nodes.length + ' records loaded.');
  };
  reader.readAsText(fileInput.files[0]);
}

function getXMLNodeText(node, tag) {
  var el = node.getElementsByTagName(tag);
  return el.length > 0 ? el[0].textContent.trim() : '';
}

function exportAsXML() {
  var lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<skillbridge>', '  <listings>'];
  adminAllListings.forEach(function(l) {
    lines.push('    <listing id="' + l.id + '">' +
      '<title>' + l.title + '</title>' +
      '<company>' + l.company + '</company>' +
      '<type>' + l.type + '</type>' +
      '<industry>' + l.industry + '</industry>' +
      '<city>' + l.city + '</city>' +
      '<allowance>' + l.allowance + '</allowance>' +
      '<duration>' + l.duration + '</duration>' +
      '<slots>' + l.slots + '</slots>' +
      '<skills>' + l.skills + '</skills>' +
      '<verified>' + l.verified + '</verified>' +
      '<featured>' + l.featured + '</featured>' +
      '<status>' + l.status + '</status>' +
      '<posted>' + l.posted + '</posted>' +
      '<icon>' + l.icon + '</icon>' +
      '</listing>');
  });
  lines.push('  </listings>', '</skillbridge>');
  var blob = new Blob([lines.join('\n')], { type: 'text/xml' });
  var a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'skillbridge_export.xml';
  a.click();
  showToast('XML export downloaded.');
}

function openXSLView() {
  window.open('xml/listings.xml', '_blank');
  showToast('Opening XSL report in new tab.');
}

function exportAsCSV() {
  var csvHeader = 'ID,Title,Company,Type,City,Allowance,Duration,Skills\n';
  var csvRows   = adminAllListings.map(function(listingItem) {
    return [listingItem.id, listingItem.title, listingItem.company, listingItem.type, listingItem.city, listingItem.allowance, listingItem.duration, '"' + listingItem.skills + '"'].join(',');
  }).join('\n');

  var downloadBlob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
  var downloadLink = document.createElement('a');
  downloadLink.href     = URL.createObjectURL(downloadBlob);
  downloadLink.download = 'skillbridge_export.csv';
  downloadLink.click();
  showToast('CSV export downloaded.');
}