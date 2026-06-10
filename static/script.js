// Frontend State Management
const state = {
    rawEntries: [],
    filteredEntries: [],
    activeCategory: 'all',
    searchQuery: '',
    sortOrder: 'desc', // 'desc' = newest first, 'asc' = oldest first
    lastFetched: null,
    feedUpdated: null,
    selectedNotes: [] // IDs of currently selected notes
};

// DOM Elements
const elements = {
    refreshBtn: document.getElementById('refresh-btn'),
    refreshIcon: document.getElementById('refresh-icon'),
    refreshText: document.getElementById('refresh-text'),
    lastFetchedTime: document.getElementById('last-fetched-time'),
    
    // Stats elements
    statTotalReleases: document.getElementById('stat-total-releases'),
    statFeatures: document.getElementById('stat-features'),
    statDeprecations: document.getElementById('stat-deprecations'),
    statOthers: document.getElementById('stat-others'),
    
    // Controls elements
    searchInput: document.getElementById('search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    categoryFilters: document.getElementById('category-filters'),
    sortBtn: document.getElementById('sort-btn'),
    sortText: document.getElementById('sort-text'),
    sortIconDirection: document.getElementById('sort-icon-direction'),
    
    // Status containers
    loadingContainer: document.getElementById('loading-container'),
    errorContainer: document.getElementById('error-container'),
    errorMessage: document.getElementById('error-message'),
    retryBtn: document.getElementById('retry-btn'),
    emptyContainer: document.getElementById('empty-container'),
    resetFiltersBtn: document.getElementById('reset-filters-btn'),
    
    // Timeline container
    timelineContainer: document.getElementById('timeline-container'),
    
    // Toast elements
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message'),

    // Selection Bar elements
    floatingShareBar: document.getElementById('floating-share-bar'),
    selectedCountText: document.getElementById('selected-count-text'),
    clearSelectionBtn: document.getElementById('clear-selection-btn'),
    tweetSelectedBtn: document.getElementById('tweet-selected-btn')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    loadReleaseNotes();
    setupEventListeners();
});

// Event Listeners Setup
function setupEventListeners() {
    // Refresh buttons
    elements.refreshBtn.addEventListener('click', () => loadReleaseNotes(true));
    elements.retryBtn.addEventListener('click', () => loadReleaseNotes(true));
    
    // Search input
    elements.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        toggleClearSearchButton();
        filterAndRender();
    });
    
    elements.clearSearchBtn.addEventListener('click', () => {
        elements.searchInput.value = '';
        state.searchQuery = '';
        toggleClearSearchButton();
        filterAndRender();
        elements.searchInput.focus();
    });

    // Category buttons
    elements.categoryFilters.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.filter-tag');
        if (!targetBtn) return;
        
        // Remove active class from all tags, add to clicked
        document.querySelectorAll('.filter-tag').forEach(tag => tag.classList.remove('active'));
        targetBtn.classList.add('active');
        
        state.activeCategory = targetBtn.dataset.category;
        filterAndRender();
    });
    
    // Sort Button
    elements.sortBtn.addEventListener('click', () => {
        state.sortOrder = state.sortOrder === 'desc' ? 'asc' : 'desc';
        updateSortUI();
        filterAndRender();
    });

    // Reset Filters Empty State button
    elements.resetFiltersBtn.addEventListener('click', () => {
        elements.searchInput.value = '';
        state.searchQuery = '';
        toggleClearSearchButton();
        
        // Reset category filter to All
        document.querySelectorAll('.filter-tag').forEach(tag => {
            if (tag.dataset.category === 'all') {
                tag.classList.add('active');
            } else {
                tag.classList.remove('active');
            }
        });
        state.activeCategory = 'all';
        
        filterAndRender();
    });

    // Timeline item click for selection
    elements.timelineContainer.addEventListener('click', handleTimelineClick);

    // Floating bar actions
    elements.clearSelectionBtn.addEventListener('click', clearSelection);
    elements.tweetSelectedBtn.addEventListener('click', tweetSelectedNotes);
}

// Show/Hide search clear button
function toggleClearSearchButton() {
    if (state.searchQuery.length > 0) {
        elements.clearSearchBtn.style.display = 'block';
    } else {
        elements.clearSearchBtn.style.display = 'none';
    }
}

// Update sorting indicator styles
function updateSortUI() {
    if (state.sortOrder === 'desc') {
        elements.sortText.textContent = 'Newest First';
        elements.sortIconDirection.style.transform = 'rotate(0deg)';
    } else {
        elements.sortText.textContent = 'Oldest First';
        elements.sortIconDirection.style.transform = 'rotate(180deg)';
    }
}

// Fetch Notes from API
async function loadReleaseNotes(forceRefresh = false) {
    showLoading(true);
    showError(false);
    
    const url = forceRefresh ? '/api/notes?refresh=true' : '/api/notes';
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        if (result.status === 'success') {
            // Assign deterministic unique IDs to notes
            result.entries.forEach((entry, entryIdx) => {
                entry.notes.forEach((note, noteIdx) => {
                    note.id = `note-${entryIdx}-${noteIdx}`;
                });
            });

            state.rawEntries = result.entries;
            state.lastFetched = result.last_fetched;
            state.feedUpdated = result.feed_updated;
            
            // Format last fetched time
            elements.lastFetchedTime.textContent = state.lastFetched;
            
            // Clear any previous selections
            clearSelection();

            // Process and filter data
            filterAndRender();
            
            if (forceRefresh) {
                showToast('Release notes updated successfully!', 'success');
            }
        } else {
            throw new Error(result.message || 'Unknown error occurred.');
        }
    } catch (err) {
        console.error('Failed to load release notes:', err);
        showError(true, err.message);
        showToast(`Error: ${err.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// Show/Hide Loading Overlay
function showLoading(isLoading) {
    if (isLoading) {
        elements.loadingContainer.style.display = 'flex';
        elements.timelineContainer.style.display = 'none';
        elements.emptyContainer.style.display = 'none';
        elements.refreshIcon.classList.add('spinning');
        elements.refreshText.textContent = 'Refreshing...';
        elements.refreshBtn.disabled = true;
    } else {
        elements.loadingContainer.style.display = 'none';
        elements.refreshIcon.classList.remove('spinning');
        elements.refreshText.textContent = 'Refresh Feed';
        elements.refreshBtn.disabled = false;
    }
}

// Show/Hide Error Pane
function showError(hasError, message = '') {
    if (hasError) {
        elements.errorContainer.style.display = 'flex';
        elements.errorMessage.textContent = message;
        elements.timelineContainer.style.display = 'none';
        elements.emptyContainer.style.display = 'none';
    } else {
        elements.errorContainer.style.display = 'none';
    }
}

// Core Filter and Sorting Engine
function filterAndRender() {
    const query = state.searchQuery.toLowerCase().trim();
    const cat = state.activeCategory;
    
    let filtered = [];
    
    state.rawEntries.forEach(entry => {
        // Check if date itself matches search query
        const dateMatches = query === "" || entry.date.toLowerCase().includes(query);
        
        // Filter the notes for this day based on active category and search text
        const matchedNotes = entry.notes.filter(note => {
            // Category check
            const categoryMatches = (cat === 'all' || note.type.toLowerCase() === cat.toLowerCase());
            if (!categoryMatches) return false;
            
            // Search text check
            if (query === "") return true; 
            if (dateMatches) return true;  // Keep all category notes if date matches search
            
            // Strip HTML elements to search only text content
            const noteText = note.html.replace(/<[^>]*>/g, '').toLowerCase();
            return note.type.toLowerCase().includes(query) || noteText.includes(query);
        });
        
        if (matchedNotes.length > 0) {
            filtered.push({
                ...entry,
                notes: matchedNotes
            });
        }
    });
    
    // Sort entries by date
    filtered.sort((a, b) => {
        const dateA = new Date(a.updated || a.date);
        const dateB = new Date(b.updated || b.date);
        return state.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    state.filteredEntries = filtered;
    
    // Render
    if (state.filteredEntries.length === 0) {
        elements.timelineContainer.style.display = 'none';
        elements.emptyContainer.style.display = 'flex';
    } else {
        elements.emptyContainer.style.display = 'none';
        elements.timelineContainer.style.display = 'flex';
        renderTimeline();
    }
    
    // Update global dashboard statistics (always based on raw full dataset)
    updateStats();
}

// Update metrics values
function updateStats() {
    let featureCount = 0;
    let deprecationCount = 0;
    let otherCount = 0;
    
    state.rawEntries.forEach(entry => {
        entry.notes.forEach(note => {
            const type = note.type.toLowerCase();
            if (type === 'feature') {
                featureCount++;
            } else if (type === 'deprecation') {
                deprecationCount++;
            } else {
                otherCount++;
            }
        });
    });
    
    elements.statTotalReleases.textContent = state.rawEntries.length;
    elements.statFeatures.textContent = featureCount;
    elements.statDeprecations.textContent = deprecationCount;
    elements.statOthers.textContent = otherCount;
}

// Render release entries list into DOM
function renderTimeline() {
    elements.timelineContainer.innerHTML = '';
    
    state.filteredEntries.forEach((entry, index) => {
        const dayCard = document.createElement('div');
        dayCard.className = 'timeline-day-card';
        dayCard.style.animationDelay = `${Math.min(index * 0.05, 0.4)}s`;
        
        // Format link
        const linkHTML = entry.link 
            ? `<a href="${entry.link}" target="_blank" rel="noopener noreferrer" class="date-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                View on Google
               </a>` 
            : '';
            
        // Generate Notes HTML List
        let notesHTML = '';
        entry.notes.forEach(note => {
            const isSelected = state.selectedNotes.includes(note.id);
            const selectedClass = isSelected ? 'selected' : '';
            
            // Check note.type to color code badges
            notesHTML += `
                <div class="note-item glass-panel ${selectedClass}" data-id="${note.id}">
                    <!-- Custom Checkbox -->
                    <div class="selection-checkbox">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <div class="note-header">
                        <span class="type-badge type-${note.type}">${note.type}</span>
                        <button class="share-x-btn" onclick="shareOnTwitter(this, '${entry.date}', '${note.type}', '${entry.link}')" title="Share this update on X (Twitter)">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            <span>Share</span>
                        </button>
                    </div>
                    <div class="note-body">
                        ${note.html}
                    </div>
                </div>
            `;
        });
        
        dayCard.innerHTML = `
            <div class="day-date-sticky">
                <div class="date-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>${entry.date}</span>
                </div>
                ${linkHTML}
            </div>
            <div class="day-content-panel">
                ${notesHTML}
            </div>
        `;
        
        elements.timelineContainer.appendChild(dayCard);
    });
}

// Show Toast Alert
let toastTimeout;
function showToast(message, type = 'info') {
    elements.toastMessage.textContent = message;
    elements.toast.className = `toast show toast-${type}`;
    
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3500);
}

// Share specific update on X (Twitter)
window.shareOnTwitter = function(buttonEl, date, type, link) {
    const noteItem = buttonEl.closest('.note-item');
    const noteBody = noteItem.querySelector('.note-body');
    
    // Strip HTML elements and trim whitespace
    let plainText = noteBody.innerHTML
        .replace(/<[^>]*>/g, ' ')  // replace tags with spaces
        .replace(/\s+/g, ' ')      // collapse whitespace
        .trim();
        
    // Draft tweet text
    const header = `BigQuery Release Update (${date}) [${type}]:\n`;
    const hashtags = `\n\n#BigQuery #GoogleCloud`;
    const urlText = link ? `\n\nRead more: ${link}` : '';
    
    // Calculate max allowed text length
    // Twitter's limit is 280. URLs count as 23 characters.
    const urlLengthForTwitter = link ? 12 + 23 : 0; // "Read more: " (11) + url (23) + newlines (2)
    const baseLength = header.length + hashtags.length + urlLengthForTwitter;
    const maxTextLen = 280 - baseLength - 5; // buffer of 5 characters
    
    if (plainText.length > maxTextLen) {
        plainText = plainText.substring(0, maxTextLen - 3) + '...';
    }
    
    const tweetText = `${header}"${plainText}"${urlText}${hashtags}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    
    // Open Twitter intent in a new window
    window.open(twitterUrl, '_blank', 'width=550,height=420,toolbar=0,status=0,resizable=1');
};

// Timeline selection click handler
function handleTimelineClick(e) {
    const noteItem = e.target.closest('.note-item');
    if (!noteItem) return;
    
    // Ignore clicks on buttons or links inside the card
    if (e.target.closest('a, button')) return;
    
    const noteId = noteItem.dataset.id;
    if (!noteId) return;
    
    toggleNoteSelection(noteId, noteItem);
}

function toggleNoteSelection(noteId, noteItem) {
    const index = state.selectedNotes.indexOf(noteId);
    if (index > -1) {
        state.selectedNotes.splice(index, 1);
        noteItem.classList.remove('selected');
    } else {
        state.selectedNotes.push(noteId);
        noteItem.classList.add('selected');
    }
    updateSelectionBar();
}

function updateSelectionBar() {
    const count = state.selectedNotes.length;
    elements.selectedCountText.textContent = `${count} update${count !== 1 ? 's' : ''} selected`;
    
    if (count > 0) {
        elements.floatingShareBar.classList.add('show');
    } else {
        elements.floatingShareBar.classList.remove('show');
    }
}

function clearSelection() {
    state.selectedNotes = [];
    document.querySelectorAll('.note-item.selected').forEach(item => {
        item.classList.remove('selected');
    });
    updateSelectionBar();
}

function tweetSelectedNotes() {
    if (state.selectedNotes.length === 0) return;
    
    const selectedNotesData = [];
    state.rawEntries.forEach(entry => {
        entry.notes.forEach(note => {
            if (state.selectedNotes.includes(note.id)) {
                selectedNotesData.push({
                    date: entry.date,
                    type: note.type,
                    link: entry.link,
                    text: note.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
                });
            }
        });
    });
    
    let tweetText = '';
    
    if (selectedNotesData.length === 1) {
        // Single update format
        const note = selectedNotesData[0];
        const header = `BigQuery Release Update (${note.date}) [${note.type}]:\n`;
        const hashtags = `\n\n#BigQuery #GoogleCloud`;
        const urlText = note.link ? `\n\nRead more: ${note.link}` : '';
        
        const urlLengthForTwitter = note.link ? 12 + 23 : 0;
        const baseLength = header.length + hashtags.length + urlLengthForTwitter;
        const maxTextLen = 280 - baseLength - 5;
        
        let plainText = note.text;
        if (plainText.length > maxTextLen) {
            plainText = plainText.substring(0, maxTextLen - 3) + '...';
        }
        tweetText = `${header}"${plainText}"${urlText}${hashtags}`;
    } else {
        // Multiple updates format
        const header = `BigQuery Release Updates:\n`;
        const hashtags = `\n#BigQuery #GoogleCloud`;
        
        // Find if all selected share the same link
        const firstLink = selectedNotesData[0].link;
        const allSameLink = selectedNotesData.every(n => n.link === firstLink);
        const commonLink = allSameLink ? firstLink : 'https://docs.cloud.google.com/bigquery/docs/release-notes';
        const urlText = commonLink ? `\nRead more: ${commonLink}` : '';
        
        const baseLength = header.length + hashtags.length + (commonLink ? 12 + 23 : 0);
        let remainingChars = 280 - baseLength - 10; // 10 char buffer
        
        let listItems = [];
        for (let note of selectedNotesData) {
            // Shorten month names to save space
            let shortDate = note.date.split(',')[0]
                .replace('January', 'Jan')
                .replace('February', 'Feb')
                .replace('March', 'Mar')
                .replace('April', 'Apr')
                .replace('June', 'Jun')
                .replace('July', 'Jul')
                .replace('August', 'Aug')
                .replace('September', 'Sep')
                .replace('October', 'Oct')
                .replace('November', 'Nov')
                .replace('December', 'Dec');
                
            let itemPrefix = `- [${note.type}] `;
            let itemSuffix = ` (${shortDate})`;
            let maxContentLen = remainingChars - itemPrefix.length - itemSuffix.length - 2;
            
            if (maxContentLen <= 5) break; // Out of space
            
            let noteText = note.text;
            if (noteText.length > maxContentLen) {
                noteText = noteText.substring(0, maxContentLen - 3) + '...';
            }
            let listItem = `${itemPrefix}${noteText}${itemSuffix}`;
            listItems.push(listItem);
            remainingChars -= (listItem.length + 1);
        }
        tweetText = `${header}${listItems.join('\n')}${urlText}${hashtags}`;
    }
    
    // Open Twitter web intent
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420,toolbar=0,status=0,resizable=1');
    
    // Clear selection
    clearSelection();
    showToast('Sent selection to Twitter!', 'success');
}

