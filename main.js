var mainNavbar = document.getElementById('mainNavbar');

window.addEventListener('scroll', function() {
  if (!mainNavbar) return;
  if (window.scrollY > 20) {
    mainNavbar.classList.add('scrolled');
  } else {
    mainNavbar.classList.remove('scrolled');
  }
});

function toggleMobileNav() {
  var navLinks = document.getElementById('navLinks');
  if (!navLinks) return;
  navLinks.classList.toggle('is-open');
}

function openModal(modalId) {
  var targetModal = document.getElementById(modalId);
  if (targetModal) targetModal.style.display = 'flex';
}

function closeModal(modalId) {
  var targetModal = document.getElementById(modalId);
  if (targetModal) targetModal.style.display = 'none';
}

document.addEventListener('click', function(clickEvent) {
  if (clickEvent.target.classList.contains('modal-overlay')) {
    clickEvent.target.style.display = 'none';
  }
});

var activeToastTimer = null;

function showToast(toastMessage, toastType) {
  var existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
    clearTimeout(activeToastTimer);
  }
  var toastElement = document.createElement('div');
  toastElement.className = 'toast-notification';
  if (toastType === 'warn')  toastElement.classList.add('warn');
  if (toastType === 'error') toastElement.classList.add('error');
  toastElement.textContent = toastMessage;
  document.body.appendChild(toastElement);
  activeToastTimer = setTimeout(function() {
    if (toastElement.parentNode) toastElement.remove();
  }, 3600);
}

var savedBookmarks = JSON.parse(localStorage.getItem('sb_bookmarks') || '[]');

function toggleBookmark(listingId) {
  var bookmarkPosition = savedBookmarks.indexOf(listingId);
  if (bookmarkPosition === -1) {
    savedBookmarks.push(listingId);
    showToast('Saved to bookmarks');
  } else {
    savedBookmarks.splice(bookmarkPosition, 1);
    showToast('Removed from bookmarks', 'warn');
  }
  localStorage.setItem('sb_bookmarks', JSON.stringify(savedBookmarks));
}

function showNoMatchesDialog() {
  if (document.getElementById('noMatchDialog')) return;
  var dialogElement = document.createElement('div');
  dialogElement.id = 'noMatchDialog';
  dialogElement.className = 'modal-overlay';
  dialogElement.style.display = 'flex';
  dialogElement.innerHTML =
    '<div class="no-match-box">' +
    '<div class="no-match-icon">&#128269;</div>' +
    '<div class="no-match-title">No matches found yet</div>' +
    '<div class="no-match-text">We could not find any listings matching your current skills and location. You can update your preferences to see more results.</div>' +
    '<div class="no-match-actions">' +
    '<button class="btn-outline-small" onclick="document.getElementById(\'noMatchDialog\').remove()">Later</button>' +
    '<button class="btn-primary-small" onclick="document.getElementById(\'noMatchDialog\').remove()">Update Preferences</button>' +
    '</div></div>';
  document.body.appendChild(dialogElement);
}

function formatCurrency(amountValue) {
  return '\u20B1' + parseInt(amountValue).toLocaleString();
}

function formatPostedDate(dateString) {
  var parsedDate  = new Date(dateString);
  var currentDate = new Date();
  var daysDiff    = Math.floor((currentDate - parsedDate) / 86400000);
  if (daysDiff === 0) return 'Today';
  if (daysDiff === 1) return 'Yesterday';
  if (daysDiff < 7)   return daysDiff + ' days ago';
  if (daysDiff < 30)  return Math.floor(daysDiff / 7) + ' weeks ago';
  return parsedDate.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}