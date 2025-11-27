/*
bidd-sportv2/src/scripts/app.js

Extracted client JS (initial stub)

This module contains the initial extraction of the large inline script into a standalone ES module.
It preserves DOM IDs and wires up basic behaviors so the page doesn't break after the refactor.

Notes:
- This is an initial stub. Many data-layer functions (Firestore queries, PDF generation, CSV import)
  are intentionally left as placeholders so we can incrementally implement them next.
- It expects the Firebase SDK and `firebaseConfig` (if used) to still be loaded globally as before.
- The DOM components are server-rendered by Astro and the IDs are preserved so the script continues
  to find elements by ID.
*/

let app = null;
let auth = null;
let db = null;

let userId = null;
let currentMeetId = null;
let currentEventId = null;
let currentMeet = null;
let currentMeetName = '';
let currentEventName = '';
let currentEvent = null;
let currentParticipants = [];
let currentSortOrder = 'placing';
let currentGenderView = 'Male';
let deleteContext = null;

let meetsUnsubscribe = null;
let eventsUnsubscribe = null;
let resultsUnsubscribe = null;
let parsedCsvData = null;

const houseColors = {
  Mason: { bg: 'bg-yellow-200', text: 'text-yellow-800', border: 'border-yellow-400' },
  Sheppard: { bg: 'bg-green-200', text: 'text-green-800', border: 'border-green-400' },
  Sumner: { bg: 'bg-red-200', text: 'text-red-800', border: 'border-red-400' },
  Taylor: { bg: 'bg-blue-200', text: 'text-blue-800', border: 'border-blue-400' },
};

// --- DOM lookups (guarded) ---
const $ = id => document.getElementById(id);

const loadingEl = $('loading');
const loadingMessage = $('loading-message');
const mainContentEl = $('mainContent');

const meetsView = $('meetsView');
const meetsGrid = $('meetsGrid');
const noMeetsMessage = $('noMeetsMessage');
const addMeetBtn = $('addMeetBtn');
const addMeetModal = $('addMeetModal');
const addMeetForm = $('addMeetForm');
const editMeetModal = $('editMeetModal');
const editMeetForm = $('editMeetForm');
const deleteMeetBtn = $('deleteMeetBtn');

const eventsView = $('eventsView');
const eventsGrid = $('eventsGrid');
const noEventsMessage = $('noEventsMessage');
const backToMeetsBtn = $('backToMeetsBtn');
const addEventBtn = $('addEventBtn');
const addEventModal = $('addEventModal');
const addEventForm = $('addEventForm');
const editEventModal = $('editEventModal');
const editEventForm = $('editEventForm');

const shareLinkBtn = $('shareLinkBtn');
const shareLinkModal = $('shareLinkModal');
const shareableLinkInput = $('shareableLink');
const copyLinkBtn = $('copyLinkBtn');
const shareLinkDescription = $('shareLinkDescription');

const signupView = $('signupView');
const signupCompetitionName = $('signupCompetitionName');
const signupEventsGrid = $('signupEventsGrid');
const noSignupEventsMessage = $('noSignupEventsMessage');
const publicSignupModal = $('publicSignupModal');
const publicSignupForm = $('publicSignupForm');
const signupEventName = $('signupEventName');
const signupEventIdInput = $('signupEventId');
const signupFormContainer = $('signupFormContainer');
const signupMessageContainer = $('signupMessageContainer');
const signupMessage = $('signupMessage');

const resultsView = $('resultsView');
const resultsContainer = $('resultsContainer');
const resultsEventName = $('resultsEventName');
const resultsEventInfo = $('resultsEventInfo');
const resultsMaleRecordInfo = $('resultsMaleRecordInfo');
const resultsFemaleRecordInfo = $('resultsFemaleRecordInfo');
const resultsTableBody = $('resultsTableBody');
const noParticipantsMessage = $('noParticipantsMessage');
const backToEventsBtn = $('backToEventsBtn');
const addParticipantBtn = $('addParticipantBtn');
const addParticipantModal = $('addParticipantModal');
const addParticipantForm = $('addParticipantForm');

const editParticipantModal = $('editParticipantModal');
const editParticipantForm = $('editParticipantForm');
const editParticipantIdInput = $('editParticipantId');
const editAthleteNameInput = $('editAthleteName');
const editGenderSelect = $('editGender');
const editHouseGroupSelect = $('editHouseGroup');

const editResultModal = $('editResultModal');
const editResultForm = $('editResultForm');
const editResultAthleteName = $('editResultAthleteName');
const editResultParticipantId = $('editResultParticipantId');

const deleteEventBtn = $('deleteEventBtn');
const deleteConfirmModal = $('deleteConfirmModal');
const confirmDeleteBtn = $('confirmDeleteBtn');
const deleteConfirmText = $('deleteConfirmText');

const uploadCsvBtn = $('uploadCsvBtn');
const csvFileInput = $('csvFileInput');
const csvUploadModal = $('csvUploadModal');
const confirmCsvImport = $('confirmCsvImport');
const csvFirstNameSelect = $('csvFirstName');
const csvSurnameSelect = $('csvSurname');
const csvGenderSelect = $('csvGender');
const csvHouseGroupSelect = $('csvHouseGroup');
const csvAgeGroupSelect = $('csvAgeGroup');
const csvPreviewHead = $('csvPreviewHead');
const csvPreviewBody = $('csvPreviewBody');
const housePointsList = $('housePointsList');
const housePointsTitle = $('housePointsTitle');
const eventsTitle = $('eventsTitle');
const printHousePointsBtn = $('printHousePointsBtn');
const printResultsBtn = $('printResultsBtn');
const printQualifiersBtn = $('printQualifiersBtn');
const sortByNameBtn = $('sortByNameBtn');
const maleTab = $('maleTab');
const femaleTab = $('femaleTab');

let isScorerMode = false;

// --- Small utilities ---
function showView(view) {
  if (meetsView) meetsView.classList.toggle('hidden', view !== 'meets');
  if (eventsView) eventsView.classList.toggle('hidden', view !== 'events');
  if (resultsView) resultsView.classList.toggle('hidden', view !== 'results');
  if (signupView) signupView.classList.add('hidden'); // Always hide admin when showing public
}

function formatTime(seconds) {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return 'N/A';
  const totalSeconds = parseFloat(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const paddedMins = String(mins).padStart(2, '0');
  const paddedSecs = secs.toFixed(2).padStart(5, '0');
  return `${paddedMins}:${paddedSecs}`;
}

function isTimeBased(type) {
  return type === 'Time';
}

// --- Placeholder / Not-yet-implemented functions ---
// These are intentionally lightweight stubs so we can iteratively implement each feature.

function renderMeets(meets = []) {
  if (!meetsGrid) return;
  meetsGrid.innerHTML = '';
  if (noMeetsMessage) noMeetsMessage.classList.toggle('hidden', meets.length > 0);

  meets.forEach(meet => {
    const card = document.createElement('div');
    card.className = 'bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow relative';
    const cardContent = document.createElement('div');
    cardContent.className = 'cursor-pointer';
    cardContent.innerHTML = `<h3 class="text-xl font-bold text-slate-800 truncate">${meet.name}</h3>`;
    cardContent.addEventListener('click', () => {
      currentMeetId = meet.id;
      currentMeetName = meet.name;
      currentMeet = meet;
      if (housePointsTitle) housePointsTitle.textContent = `Team Points: ${meet.name}`;
      if (eventsTitle) eventsTitle.textContent = `Events: ${meet.name}`;
      showView('events');
      fetchEvents(meet.id).catch(err => console.error('fetchEvents error:', err));
    });
    card.appendChild(cardContent);

    if (!isScorerMode) {
      const editBtn = document.createElement('button');
      editBtn.className = 'absolute top-2 right-2 p-1 rounded-full hover:bg-slate-200';
      editBtn.innerHTML = '✎';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (editMeetForm) {
          try {
            editMeetForm.elements.meetId.value = meet.id;
            editMeetForm.elements.meetName.value = meet.name;
            editMeetForm.elements.ageGroups.value = (meet.ageGroups || []).join('\n');
          } catch (e) { /* ignore */ }
        }
        if (editMeetModal && typeof editMeetModal.showModal === 'function') editMeetModal.showModal();
      });
      card.appendChild(editBtn);
    }

    meetsGrid.appendChild(card);
  });
}

async function fetchMeets() {
  // Placeholder: the real implementation should attach a Firestore snapshot listener
  // and call `renderMeets` with the fetched meets.
  console.warn('fetchMeets: not fully implemented yet. Implement Firestore listener here.');
  // For now, hide loading and show empty state:
  if (loadingEl) loadingEl.classList.add('hidden');
  if (mainContentEl) mainContentEl.classList.remove('hidden');
  showView('meets');
}

// Minimal event rendering placeholder
function renderEvents(events = []) {
  if (!eventsGrid) return;
  eventsGrid.innerHTML = '';
  if (noEventsMessage) noEventsMessage.classList.toggle('hidden', events.length > 0);

  events.forEach(event => {
    const card = document.createElement('div');
    card.className = 'bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow relative';
    const cardContent = document.createElement('div');
    cardContent.className = 'cursor-pointer';
    cardContent.innerHTML = `<h3 class="text-xl font-bold text-slate-800 truncate">${event.name}</h3><p class="text-slate-500 capitalize">${event.ageGroup || ''}</p>`;
    cardContent.addEventListener('click', () => {
      currentEventId = event.id;
      currentEventName = event.name;
      currentEvent = event;
      currentSortOrder = 'placing';
      currentGenderView = 'Male';
      updateTabs();
      if (resultsEventName) resultsEventName.textContent = event.name;
      if (resultsEventInfo) resultsEventInfo.textContent = `Results in ${event.units || ''}.`;
      showView('results');
      fetchResults(currentMeetId, event.id, event).catch(err => console.error('fetchResults error:', err));
    });
    card.appendChild(cardContent);
    eventsGrid.appendChild(card);
  });
}

async function fetchEvents(meetId) {
  console.warn('fetchEvents: placeholder - implement Firestore for events');
  // For demonstration, call calculateAndRenderHousePoints if possible
  try {
    await calculateAndRenderHousePoints(meetId);
  } catch (e) { /* ignore */ }
  // Call renderEvents with empty list to keep UI consistent
  renderEvents([]);
}

function renderParticipants(participants = [], event = {}) {
  currentParticipants = participants;
  // Minimal render: create simple rows
  if (!resultsTableBody || !resultsContainer) return;

  resultsTableBody.innerHTML = '';
  const participantsOfGender = participants.filter(p => p.gender === currentGenderView);
  const hasParticipants = participantsOfGender.length > 0;
  if (noParticipantsMessage) noParticipantsMessage.classList.toggle('hidden', hasParticipants);
  resultsContainer.querySelector('table')?.classList.toggle('hidden', !hasParticipants);

  participantsOfGender.forEach((p, i) => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-200 hover:bg-slate-50';
    const placing = p.placing || (i + 1);
    const hasResult = p.result !== null && p.result !== undefined;
    const displayResult = hasResult ? (isTimeBased(event.eventType) ? formatTime(p.result) : p.result) : 'N/A';
    const houseColor = houseColors[p.houseGroup] || { bg: 'bg-gray-200', text: 'text-gray-800' };
    const houseBadge = `<span class="px-2 py-1 text-xs font-semibold leading-tight rounded-full ${houseColor.bg} ${houseColor.text}">${p.houseGroup || ''}</span>`;
    tr.innerHTML = `<td class="p-3 font-medium">${placing}</td><td class="p-3">${p.athleteName || ''}</td><td class="p-3">${houseBadge}</td><td class="p-3 text-center"><input type="checkbox" class="participation-check h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" ${p.participated ? 'checked' : ''}></td><td class="p-3">${displayResult}</td><td class="p-3"></td>`;
    resultsTableBody.appendChild(tr);
  });
}

// --- CSV / PDF / House points placeholders ---
function handleFileSelect() {
  console.warn('CSV parsing not yet implemented in stub.');
}
async function handleConfirmCsvImport() {
  console.warn('CSV import not yet implemented in stub.');
}

async function calculateAndRenderHousePoints(meetId) {
  console.warn('calculateAndRenderHousePoints: placeholder - implement aggregation over events/results.');
  if (!housePointsList) return;
  housePointsList.innerHTML = '<li><div class="flex justify-between items-center mb-1"><span class="font-semibold text-slate-800">Mason</span><span class="font-bold text-xl text-indigo-600">0</span></div></li>';
}

// --- Basic handlers and wiring ---
function updateTabs() {
  if (!maleTab || !femaleTab) return;
  if (currentGenderView === 'Male') {
    maleTab.classList.add('tab-active');
    femaleTab.classList.remove('tab-active');
  } else {
    femaleTab.classList.add('tab-active');
    maleTab.classList.remove('tab-active');
  }
}

function attachBasicUiEventHandlers() {
  // Generic cancel buttons close their parent dialog
  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dlg = e.target.closest('dialog');
      if (dlg && typeof dlg.close === 'function') dlg.close();
    });
  });

  if (addMeetBtn && addMeetModal) {
    addMeetBtn.addEventListener('click', () => {
      if (typeof addMeetModal.showModal === 'function') addMeetModal.showModal();
    });
  }

  if (addEventBtn && addEventModal) {
    addEventBtn.addEventListener('click', () => {
      // populate age groups if available
      try {
        const ageGroupSelect = addEventForm?.elements?.ageGroup;
        if (ageGroupSelect) {
          ageGroupSelect.innerHTML = '';
          (currentMeet?.ageGroups || []).forEach(ag => {
            const option = new Option(ag, ag);
            ageGroupSelect.add(option);
          });
        }
      } catch (e) { /* ignore */ }
      if (typeof addEventModal.showModal === 'function') addEventModal.showModal();
    });
  }

  if (addParticipantBtn && addParticipantModal) {
    addParticipantBtn.addEventListener('click', () => {
      if (typeof addParticipantModal.showModal === 'function') addParticipantModal.showModal();
    });
  }

  if (backToMeetsBtn) {
    backToMeetsBtn.addEventListener('click', () => {
      if (eventsUnsubscribe) { try { eventsUnsubscribe(); } catch (e) {} eventsUnsubscribe = null; }
      currentMeetId = null;
      showView('meets');
    });
  }

  if (backToEventsBtn) {
    backToEventsBtn.addEventListener('click', async () => {
      if (resultsUnsubscribe) { try { resultsUnsubscribe(); } catch (e) {} resultsUnsubscribe = null; }
      currentEventId = null;
      showView('events');
      try { await calculateAndRenderHousePoints(currentMeetId); } catch (e) { /* ignore */ }
    });
  }

  if (shareLinkBtn) {
    shareLinkBtn.addEventListener('click', () => {
      const url = `${window.location.origin}${window.location.pathname}?signup=${currentMeetId || ''}`;
      if (shareLinkDescription) shareLinkDescription.textContent = 'Share this link with participants to allow them to sign up for events in this competition.';
      if (shareableLinkInput) shareableLinkInput.value = url;
      if (shareLinkModal && typeof shareLinkModal.showModal === 'function') shareLinkModal.showModal();
    });
  }

  if (copyLinkBtn && shareableLinkInput) {
    copyLinkBtn.addEventListener('click', () => {
      shareableLinkInput.select();
      document.execCommand('copy');
      copyLinkBtn.textContent = 'Copied!';
      setTimeout(() => { copyLinkBtn.textContent = 'Copy Link'; }, 2000);
    });
  }

  if (csvFileInput) {
    csvFileInput.addEventListener('change', () => handleFileSelect());
  }

  if (uploadCsvBtn) {
    uploadCsvBtn.addEventListener('click', () => {
      if (csvFileInput) csvFileInput.click();
    });
  }

  if (maleTab) {
    maleTab.addEventListener('click', () => {
      currentGenderView = 'Male';
      updateTabs();
      renderParticipants(currentParticipants, currentEvent);
    });
  }

  if (femaleTab) {
    femaleTab.addEventListener('click', () => {
      currentGenderView = 'Female';
      updateTabs();
      renderParticipants(currentParticipants, currentEvent);
    });
  }
}

// --- Initialization ---
async function init() {
  console.log('app.js initializing...');

  attachBasicUiEventHandlers();

  // Check for Firebase presence. If the project uses Firebase as before, the global functions
  // should be available. We'll attempt to initialize if firebaseConfig exists, otherwise show
  // a helpful message and fall back to non-Firestore behavior.
  try {
    if (typeof firebaseConfig !== 'undefined' && firebaseConfig) {
      // The inline HTML originally used firebase v9 modular functions like initializeApp, getFirestore, etc.
      // Here we attempt to use those globals if present. If the environment uses SDKs via modules,
      // the integrator should replace this with proper imports.
      if (typeof initializeApp === 'function') {
        app = initializeApp(firebaseConfig);
      } else {
        console.warn('initializeApp not found as global - skipping firebase initialization.');
      }

      if (typeof getFirestore === 'function' && app) {
        db = getFirestore(app);
      }
      if (typeof getAuth === 'function' && app) {
        auth = getAuth(app);
      }

      // After hooking up, fetch meets (or set up auth as the original did).
      try {
        await fetchMeets();
      } catch (e) {
        console.error('Error fetching meets during init:', e);
      }
    } else {
      // No firebaseConfig present - show page but keep admin/backend features disabled.
      if (loadingMessage) loadingMessage.innerHTML = '<strong>Configuration Incomplete.</strong><br>Firebase config is missing.';
      if (loadingEl) loadingEl.classList.add('hidden');
      if (mainContentEl) mainContentEl.classList.remove('hidden');
      showView('meets');
      console.warn('firebaseConfig not found. Running in limited mode.');
      // Render empty meets to ensure UI is usable in stub mode
      renderMeets([]);
    }
  } catch (error) {
    console.error('Initialization error:', error);
    if (loadingMessage) loadingMessage.innerHTML = `<strong>Initialization failed</strong><br>${error.message || String(error)}`;
    if (loadingEl) loadingEl.classList.add('hidden');
  }
}

// Kick off
init();
