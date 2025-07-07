// Ensure Firebase modules are loaded before script.js runs
// This assumes the index.html script imports and exposes them to window.firebase
if (typeof window.firebase === 'undefined') {
    console.error("Firebase modules not loaded. Please ensure index.html imports them correctly.");
}

const {
    initializeApp,
    getAuth,
    signInAnonymously,
    signInWithCustomToken,
    onAuthStateChanged
} = window.firebase;

const {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    collection,
    query,
    orderBy,
    addDoc,
    getDocs
} = window.firebase;


// =========================================================================
// FIREBASE CONFIGURATION (IMPORTANT: Replace with your actual Firebase config)
// =========================================================================
// These variables are provided by the Canvas environment.
// For local testing, you might need to hardcode a dummy config or ensure these are defined.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let userId = null; // Will store the authenticated user's ID
let isAuthReady = false; // Flag to ensure Firestore operations wait for auth

// =========================================================================
// DATA AND STATE MANAGEMENT
// =========================================================================

// Default pinned sites
const defaultPinnedSites = [
    { id: "google", name: "Google", url: "https://google.com", favicon: "https://www.google.com/favicon.ico", order: 0 },
    { id: "youtube", name: "YouTube", url: "https://youtube.com", favicon: "https://www.youtube.com/favicon.ico", order: 1 },
    { id: "wikipedia", name: "Wikipedia", url: "https://wikipedia.org", favicon: "https://www.wikipedia.org/static/favicon/wikipedia.ico", order: 2 },
    { id: "gmail", name: "Gmail", url: "https://mail.google.com", favicon: "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico", order: 3 },
    { id: "github", name: "GitHub", url: "https://github.com", favicon: "https://github.githubassets.com/favicons/favicon.ico", order: 4 }
];

// Search engines configuration with icon URLs
const searchEngines = {
    google: {
        name: "Google",
        url: "https://www.google.com/search?q=",
        icon: "https://www.google.com/favicon.ico",
        color: "#4285F4"
    },
    bing: {
        name: "Bing",
        url: "https://www.bing.com/search?q=",
        icon: "https://www.bing.com/favicon.ico",
        color: "#008373"
    },
    duckduckgo: {
        name: "DuckDuckGo",
        url: "https://duckduckgo.com/?q=",
        icon: "https://duckduckgo.com/favicon.ico",
        color: "#DE5833"
    },
    youtube: {
        name: "YouTube",
        url: "https://www.youtube.com/results?search_query=",
        icon: "https://www.youtube.com/favicon.ico",
        color: "#FF0000"
    },
    wikipedia: {
        name: "Wikipedia",
        url: "https://en.wikipedia.org/w/index.php?search=",
        icon: "https://www.wikipedia.org/static/favicon/wikipedia.ico",
        color: "#636466"
    }
};

// Default background images (URLs, as local folder selection is not viable for GitHub Pages)
const defaultBackgroundImages = [
    "https://images.unsplash.com/photo-1505506874110-6a7a69069a08?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
];

// Current state
let state = {
    pinnedSites: [],
    currentSearchEngine: "google",
    backgroundDirectory: "Using default backgrounds", // Simulated path
    backgroundImages: [...defaultBackgroundImages],
    currentBackgroundIndex: 0,
    editingSite: null,
    isDragging: false,
    theme: "dark"
};

// =========================================================================
// DOM ELEMENTS
// =========================================================================
const elements = {
    themeBtn: document.getElementById('themeBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    settingsMenu: document.getElementById('settingsMenu'),
    changeFolderBtn: document.getElementById('changeFolderBtn'),
    resetFolderBtn: document.getElementById('resetFolderBtn'),
    folderPath: document.getElementById('folderPath'),
    folderSpinner: document.getElementById('folderSpinner'),
    folderInput: document.getElementById('folderInput'), // Still exists but not used for actual file system access
    engineSelector: document.getElementById('engineSelector'),
    engineDropdown: document.getElementById('engineDropdown'),
    currentEngine: document.getElementById('currentEngine'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    sitesGrid: document.getElementById('sitesGrid'),
    siteModal: document.getElementById('siteModal'),
    modalTitle: document.getElementById('modalTitle'),
    siteName: document.getElementById('siteName'),
    siteUrl: document.getElementById('siteUrl'),
    closeModal: document.getElementById('closeModal'),
    cancelBtn: document.getElementById('cancelBtn'),
    saveBtn: document.getElementById('saveBtn'),
    deleteBtn: document.getElementById('deleteBtn'),
    toast: document.getElementById('toast'),
    backgroundContainer: document.querySelector('.background-container'),
    userIdDisplay: document.getElementById('userIdDisplay')
};

// =========================================================================
// INITIALIZATION
// =========================================================================
document.addEventListener('DOMContentLoaded', async () => {
    // Authenticate user
    try {
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }
    } catch (error) {
        console.error("Firebase authentication failed:", error);
        showToast("Authentication failed. Some features may not work.");
    }

    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
        if (user) {
            userId = user.uid;
            elements.userIdDisplay.textContent = userId;
            isAuthReady = true;
            console.log("Firebase Auth Ready. User ID:", userId);
            // Load user data from Firestore once authenticated
            loadUserData();
        } else {
            userId = null;
            elements.userIdDisplay.textContent = "Not authenticated";
            isAuthReady = false;
            console.log("Firebase Auth Not Ready. No user signed in.");
            // If no user, revert to default state
            state.pinnedSites = [...defaultPinnedSites];
            state.currentSearchEngine = "google";
            state.theme = "dark";
            state.backgroundDirectory = "Using default backgrounds";
            state.backgroundImages = [...defaultBackgroundImages];
            initializeUI();
        }
    });

    setupEventListeners();
    startBackgroundRotation();
});

async function loadUserData() {
    if (!isAuthReady || !userId) {
        console.warn("Attempted to load user data before authentication is ready.");
        return;
    }

    try {
        const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/data/user_settings`);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            state.pinnedSites = userData.pinnedSites || [...defaultPinnedSites];
            state.currentSearchEngine = userData.currentSearchEngine || "google";
            state.theme = userData.theme || "dark";
            state.backgroundDirectory = userData.backgroundDirectory || "Using default backgrounds";
            state.backgroundImages = userData.backgroundImages || [...defaultBackgroundImages];
            console.log("User data loaded from Firestore:", userData);
        } else {
            console.log("No user data found in Firestore. Using default settings and saving them.");
            await saveUserData(); // Save default settings if none exist
        }
    } catch (e) {
        console.error("Error loading user data:", e);
        showToast("Error loading your settings.");
        // Fallback to default if Firestore load fails
        state.pinnedSites = [...defaultPinnedSites];
        state.currentSearchEngine = "google";
        state.theme = "dark";
        state.backgroundDirectory = "Using default backgrounds";
        state.backgroundImages = [...defaultBackgroundImages];
    } finally {
        initializeUI();
        // Set up real-time listener for pinned sites
        setupPinnedSitesListener();
        // Set up real-time listener for settings
        setupSettingsListener();
    }
}

async function saveUserData() {
    if (!isAuthReady || !userId) {
        console.warn("Attempted to save user data before authentication is ready.");
        return;
    }

    try {
        const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/data/user_settings`);
        await setDoc(userDocRef, {
            pinnedSites: state.pinnedSites,
            currentSearchEngine: state.currentSearchEngine,
            theme: state.theme,
            backgroundDirectory: state.backgroundDirectory,
            backgroundImages: state.backgroundImages
        }, { merge: true }); // Use merge to avoid overwriting other fields if they exist
        console.log("User data saved to Firestore.");
    } catch (e) {
        console.error("Error saving user data:", e);
        showToast("Error saving your settings.");
    }
}

function setupPinnedSitesListener() {
    if (!isAuthReady || !userId) return;

    const pinnedSitesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/data/pinned_sites`);
    onSnapshot(pinnedSitesCollectionRef, (snapshot) => {
        const sites = [];
        snapshot.forEach(doc => {
            sites.push({ id: doc.id, ...doc.data() });
        });
        // Sort by 'order' property
        state.pinnedSites = sites.sort((a, b) => (a.order || 0) - (b.order || 0));
        renderPinnedSites();
    }, (error) => {
        console.error("Error listening to pinned sites:", error);
        showToast("Error loading pinned sites in real-time.");
    });
}

function setupSettingsListener() {
    if (!isAuthReady || !userId) return;

    const userSettingsDocRef = doc(db, `artifacts/${appId}/users/${userId}/data/user_settings`);
    onSnapshot(userSettingsDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();
            // Only update settings that are not being actively edited or that need real-time sync
            if (state.currentSearchEngine !== userData.currentSearchEngine) {
                setSearchEngine(userData.currentSearchEngine);
            }
            if (state.theme !== userData.theme) {
                state.theme = userData.theme;
                document.body.setAttribute('data-theme', state.theme);
                updateThemeIcon();
            }
            if (JSON.stringify(state.backgroundImages) !== JSON.stringify(userData.backgroundImages)) {
                state.backgroundImages = userData.backgroundImages || [...defaultBackgroundImages];
                state.backgroundDirectory = userData.backgroundDirectory || "Using default backgrounds";
                elements.folderPath.textContent = state.backgroundDirectory;
                loadBackgroundImages();
            }
            console.log("User settings updated from Firestore real-time.");
        }
    }, (error) => {
        console.error("Error listening to user settings:", error);
    });
}


function setupEventListeners() {
    // Theme toggle
    elements.themeBtn.addEventListener('click', toggleTheme);

    // Settings button
    elements.settingsBtn.addEventListener('click', toggleSettingsMenu);

    // Change folder button (simulated)
    elements.changeFolderBtn.addEventListener('click', () => {
        // This will simulate selecting a new set of default images
        state.backgroundImages = [
            "https://images.unsplash.com/photo-1506744038136-465a04a532b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
            "https://images.unsplash.com/photo-1542273917363-3b18107e4133?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
            "https://images.unsplash.com/photo-1502672260266-b25818f288ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        ];
        state.backgroundDirectory = "Simulated New Defaults";
        loadBackgroundImages();
        saveUserData();
        showToast("Background images updated to simulated new defaults!");
    });

    // Reset folder button
    elements.resetFolderBtn.addEventListener('click', resetBackgroundDirectory);

    // Search engine selector
    elements.engineSelector.addEventListener('click', toggleEngineDropdown);

    // Search functionality
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    elements.searchBtn.addEventListener('click', performSearch);

    // Modal controls
    elements.closeModal.addEventListener('click', closeSiteModal);
    elements.cancelBtn.addEventListener('click', closeSiteModal);
    elements.saveBtn.addEventListener('click', saveSite);
    elements.deleteBtn.addEventListener('click', () => deleteSite(state.editingSite.id)); // Pass ID directly

    // Close dropdowns and modals when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.engineSelector.contains(e.target)) {
            elements.engineDropdown.classList.remove('active');
        }

        if (!elements.settingsMenu.contains(e.target) && e.target !== elements.settingsBtn) {
            elements.settingsMenu.classList.remove('active');
        }

        if (!elements.siteModal.contains(e.target) && e.target !== elements.siteModal && elements.siteModal.classList.contains('active')) {
            // Check if the click was outside the modal content but inside the modal overlay
            if (e.target === elements.siteModal) {
                closeSiteModal();
            }
        }
    });
}

function initializeUI() {
    // Set current search engine
    setSearchEngine(state.currentSearchEngine);

    // Apply theme
    document.body.setAttribute('data-theme', state.theme);
    updateThemeIcon();

    // Display pinned sites (will be updated by Firestore listener)
    renderPinnedSites();

    // Set folder path display
    elements.folderPath.textContent = state.backgroundDirectory;

    // Load and display the images
    loadBackgroundImages();
}

// =========================================================================
// THEME MANAGEMENT
// =========================================================================
async function toggleTheme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    document.body.setAttribute('data-theme', state.theme);
    updateThemeIcon();
    await saveUserData(); // Save theme preference to Firestore
}

function updateThemeIcon() {
    const icon = elements.themeBtn.querySelector('i');
    if (state.theme === "dark") {
        icon.className = "fas fa-moon";
    } else {
        icon.className = "fas fa-sun";
    }
}

// =========================================================================
// DYNAMIC BACKGROUNDS (SIMULATED FOR GITHUB PAGES)
// =========================================================================
// The folder selection functionality is simulated as direct file system access
// via <input type="file" webkitdirectory> is not supported for security reasons
// on static web pages like GitHub Pages.
function resetBackgroundDirectory() {
    state.backgroundDirectory = "Using default backgrounds";
    state.backgroundImages = [...defaultBackgroundImages];
    elements.folderPath.textContent = state.backgroundDirectory;

    loadBackgroundImages();
    saveUserData();
    showToast("Background directory reset to original defaults.");
}

function loadBackgroundImages() {
    // Clear existing images
    elements.backgroundContainer.querySelectorAll('.background-image').forEach(el => el.remove());

    // Add new images
    state.backgroundImages.forEach((src, index) => {
        const img = document.createElement('img');
        img.classList.add('background-image');
        img.src = src;
        if (index === state.currentBackgroundIndex) {
            img.classList.add('active');
        }
        elements.backgroundContainer.appendChild(img);
    });
}

function startBackgroundRotation() {
    // Change background every 30 seconds
    setInterval(() => {
        changeBackground();
    }, 30000);
}

function changeBackground() {
    const images = document.querySelectorAll('.background-image');

    // Fade out current image
    if (images.length > 0) {
        images[state.currentBackgroundIndex].classList.remove('active');
    }

    // Select next image
    state.currentBackgroundIndex = (state.currentBackgroundIndex + 1) % state.backgroundImages.length;

    // Fade in new image
    if (images.length > 0) {
        images[state.currentBackgroundIndex].classList.add('active');
    }
}

// =========================================================================
// PINNED SITES (Firestore Integrated)
// =========================================================================
function renderPinnedSites() {
    elements.sitesGrid.innerHTML = '';

    state.pinnedSites.forEach((site) => {
        const siteCard = document.createElement('div');
        siteCard.className = 'site-card';
        siteCard.draggable = true;
        siteCard.dataset.id = site.id;

        siteCard.innerHTML = `
            <div class="site-icon">
                ${site.favicon
                    ? `<img src="${site.favicon}" alt="${site.name}" onerror="this.parentNode.innerHTML='<i class=\'fas fa-globe\'></i>'">`
                    : `<i class="fas fa-globe"></i>`}
            </div>
            <span class="site-name">${site.name}</span>
            <div class="site-actions">
                <button class="action-btn site-menu-btn">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="action-menu">
                    <div class="action-item edit-site">
                        <i class="fas fa-edit"></i> Edit
                    </div>
                    <div class="action-item delete-site">
                        <i class="fas fa-trash"></i> Delete
                    </div>
                </div>
            </div>
        `;

        // Click to open site
        siteCard.querySelector('.site-icon').addEventListener('click', () => {
            window.open(site.url, '_blank');
        });

        // Site menu actions
        const menuBtn = siteCard.querySelector('.site-menu-btn');
        const actionMenu = siteCard.querySelector('.action-menu');

        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close any other open menus
            document.querySelectorAll('.action-menu').forEach(menu => {
                if (menu !== actionMenu) menu.classList.remove('active');
            });
            actionMenu.classList.toggle('active');
        });

        // Edit action
        siteCard.querySelector('.edit-site').addEventListener('click', () => {
            openSiteModal(site);
        });

        // Delete action
        siteCard.querySelector('.delete-site').addEventListener('click', async () => {
            await deleteSite(site.id);
            actionMenu.classList.remove('active');
        });

        // Drag and drop functionality
        siteCard.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', site.id);
            siteCard.classList.add('dragging');
            state.isDragging = true;
        });

        siteCard.addEventListener('dragend', () => {
            siteCard.classList.remove('dragging');
            state.isDragging = false;
        });

        siteCard.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        siteCard.addEventListener('drop', async (e) => {
            e.preventDefault();
            const sourceId = e.dataTransfer.getData('text/plain');
            if (sourceId !== site.id) {
                await reorderSites(sourceId, site.id);
            }
        });

        elements.sitesGrid.appendChild(siteCard);
    });

    // Add the "+" button for adding new sites
    const addCard = document.createElement('div');
    addCard.className = 'site-card';
    addCard.innerHTML = `
        <div class="site-icon" style="background: var(--overlay);">
            <i class="fas fa-plus" style="color: var(--primary); font-size: 24px;"></i>
        </div>
        <span class="site-name">Add Site</span>
    `;

    addCard.addEventListener('click', () => {
        openSiteModal();
    });

    elements.sitesGrid.appendChild(addCard);
}

async function reorderSites(sourceId, targetId) {
    if (!isAuthReady || !userId) {
        showToast("Please wait for authentication to reorder sites.");
        return;
    }

    const sourceIndex = state.pinnedSites.findIndex(s => s.id == sourceId);
    const targetIndex = state.pinnedSites.findIndex(s => s.id == targetId);

    if (sourceIndex >= 0 && targetIndex >= 0) {
        // Create a mutable copy for reordering
        const reorderedSites = [...state.pinnedSites];
        const [movedSite] = reorderedSites.splice(sourceIndex, 1);
        reorderedSites.splice(targetIndex, 0, movedSite);

        // Update the 'order' field for all sites based on their new position
        const batchUpdates = [];
        for (let i = 0; i < reorderedSites.length; i++) {
            const site = reorderedSites[i];
            const siteDocRef = doc(db, `artifacts/${appId}/users/${userId}/data/pinned_sites`, site.id);
            batchUpdates.push(updateDoc(siteDocRef, { order: i }));
        }

        try {
            await Promise.all(batchUpdates);
            showToast("Sites reordered successfully!");
            // The onSnapshot listener will re-render the sites automatically
        } catch (e) {
            console.error("Error reordering sites:", e);
            showToast("Failed to reorder sites.");
        }
    }
}

function openSiteModal(site = null) {
    elements.modalTitle.textContent = site ? "Edit Site" : "Add New Site";
    elements.siteName.value = site ? site.name : "";
    elements.siteUrl.value = site ? site.url : "https://";
    elements.deleteBtn.style.display = site ? "block" : "none";

    if (site) {
        state.editingSite = site;
        elements.deleteBtn.dataset.id = site.id;
    } else {
        state.editingSite = null;
    }

    elements.siteModal.classList.add('active');
}

function closeSiteModal() {
    elements.siteModal.classList.remove('active');
    state.editingSite = null;
}

async function saveSite() {
    if (!isAuthReady || !userId) {
        showToast("Please wait for authentication to save sites.");
        return;
    }

    const name = elements.siteName.value.trim();
    let url = elements.siteUrl.value.trim();

    if (!name || !url) {
        showToast("Please fill in both fields");
        return;
    }

    // Ensure URL starts with http:// or https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    // Simple URL validation
    if (!isValidUrl(url)) {
        showToast("Please enter a valid URL (include http:// or https://)");
        return;
    }

    try {
        if (state.editingSite) {
            // Update existing site in Firestore
            const siteDocRef = doc(db, `artifacts/${appId}/users/${userId}/data/pinned_sites`, state.editingSite.id);
            const updatedData = {
                name: name,
                url: url
            };

            // Fetch new favicon if URL changed
            if (state.editingSite.url !== url) {
                const favicon = await fetchFavicon(url);
                updatedData.favicon = favicon;
            }

            await updateDoc(siteDocRef, updatedData);
            showToast("Site updated successfully!");
        } else {
            // Add new site to Firestore
            const favicon = await fetchFavicon(url);
            const newSiteData = {
                name: name,
                url: url,
                favicon: favicon,
                // Assign an order at the end of the current list
                order: state.pinnedSites.length > 0 ? Math.max(...state.pinnedSites.map(s => s.order || 0)) + 1 : 0
            };
            await addDoc(collection(db, `artifacts/${appId}/users/${userId}/data/pinned_sites`), newSiteData);
            showToast("Site added successfully!");
        }
        closeSiteModal();
    } catch (e) {
        console.error("Error saving site:", e);
        showToast(`Failed to ${state.editingSite ? "update" : "add"} site.`);
    }
}

async function deleteSite(id) {
    if (!isAuthReady || !userId) {
        showToast("Please wait for authentication to delete sites.");
        return;
    }
    try {
        const siteDocRef = doc(db, `artifacts/${appId}/users/${userId}/data/pinned_sites`, id);
        await deleteDoc(siteDocRef);
        showToast("Site deleted successfully!");
        closeSiteModal();
    } catch (e) {
        console.error("Error deleting site:", e);
        showToast("Failed to delete site.");
    }
}

async function fetchFavicon(url) {
    // Try to get favicon from Google's favicon service
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
        return ""; // Return empty if fails
    }
}

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

// =========================================================================
// SEARCH FUNCTIONALITY
// =========================================================================
function toggleEngineDropdown() {
    elements.engineDropdown.classList.toggle('active');

    // Add event listeners to engine options
    if (elements.engineDropdown.classList.contains('active')) {
        document.querySelectorAll('.search-engine-option').forEach(option => {
            option.onclick = async () => { // Use onclick to easily remove previous listeners
                const engine = option.dataset.engine;
                setSearchEngine(engine);
                elements.engineDropdown.classList.remove('active');
                await saveUserData(); // Save search engine preference
            };
        });
    }
}

function setSearchEngine(engine) {
    if (searchEngines[engine]) {
        state.currentSearchEngine = engine;
        const { icon } = searchEngines[engine];

        // Update logo with icon
        elements.currentEngine.innerHTML = `<img src="${icon}" alt="${engine}">`;
    }
}

function performSearch() {
    const query = elements.searchInput.value.trim();
    if (query) {
        const searchUrl = searchEngines[state.currentSearchEngine].url + encodeURIComponent(query);
        window.open(searchUrl, '_blank');
        elements.searchInput.value = '';
    }
}

// =========================================================================
// UI HELPERS
// =========================================================================
function toggleSettingsMenu() {
    elements.settingsMenu.classList.toggle('active');
}

function showToast(message) {
    elements.toast.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    elements.toast.classList.add('show');

    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}
