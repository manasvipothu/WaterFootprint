import { auth, db, storage } from './firebase-config.js';
import { onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, query, where, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// DOM Elements
const loader = document.getElementById('loader');
const profileContent = document.getElementById('profile-content');
const userNameEl = document.getElementById('user-name');
const userEmailEl = document.getElementById('user-email');
const userInitialEl = document.getElementById('user-initial');
const memberSinceEl = document.getElementById('member-since');
const historyContainer = document.getElementById('history-container');
const logoutBtn = document.getElementById('logout-btn');

// Avatar Upload Elements
const defaultIcon = document.getElementById('default-icon');
const profileImg = document.getElementById('profile-img');
const uploadOverlay = document.getElementById('upload-overlay');
const imageUpload = document.getElementById('image-upload');

// Modal Elements
const modal = document.getElementById('breakdownModal');
const closeBtn = document.querySelector('.close-btn');
const modalDate = document.getElementById('modal-date');
const modalTotal = document.getElementById('modal-total');
const modalGrid = document.getElementById('modal-grid');

// Store fetched data for modal
let calculationsData = [];

// Format Date
function formatDate(timestamp) {
    if (!timestamp) return 'Unknown Date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Fetch user history from Firestore
async function fetchUserHistory(userId) {
    try {
        const historyQuery = query(
            collection(db, "user_calculations"),
            where("userId", "==", userId)
            // Removed orderBy and limit to prevent Firestore Composite Index errors
        );

        const querySnapshot = await getDocs(historyQuery);
        
        if (querySnapshot.empty) {
            historyContainer.innerHTML = `
                <div class="no-data">
                    <i class='bx bx-data' style="font-size: 40px; margin-bottom: 10px;"></i>
                    <p>No calculation history found yet.</p>
                    <p style="font-size: 13px; margin-top: 5px;">Go to the calculator to get started!</p>
                </div>
            `;
            return;
        }

        let html = '';
        calculationsData = [];

        querySnapshot.forEach((doc) => {
            calculationsData.push(doc.data());
        });
        
        // Sort locally in JS to avoid Firestore composite index requirement!
        calculationsData.sort((a, b) => {
            const timeA = (a.timestamp && a.timestamp.toMillis) ? a.timestamp.toMillis() : 0;
            const timeB = (b.timestamp && b.timestamp.toMillis) ? b.timestamp.toMillis() : 0;
            return timeB - timeA; // Descending
        });
        
        // Take top 10
        calculationsData = calculationsData.slice(0, 10);

        let index = 0;
        calculationsData.forEach((data) => {
            const dateStr = formatDate(data.timestamp);
            const totalLiters = parseFloat(data.waterUsage).toFixed(2);
            
            html += `
                <div class="history-card">
                    <div>
                        <div class="history-date">${dateStr}</div>
                        <div class="history-value">${totalLiters} <span>Liters/Year</span></div>
                    </div>
                    <div class="history-details">
                        <button class="history-details-btn" data-index="${index}">View Breakdown</button>
                    </div>
                </div>
            `;
            index++;
        });

        historyContainer.innerHTML = html;

        // Attach click listeners to new buttons
        document.querySelectorAll('.history-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                showModal(calculationsData[idx]);
            });
        });

    } catch (error) {
        console.error("Error fetching history:", error);
        historyContainer.innerHTML = `
            <div class="no-data" style="color: #ff4d4d; background: rgba(255, 77, 77, 0.1);">
                <i class='bx bx-error-circle' style="font-size: 30px;"></i>
                <p>Failed to load history.</p>
                <p style="font-size: 12px;">Make sure Firestore rules allow reading your own documents.</p>
                <p style="font-size: 10px; margin-top: 5px; color: #aaa;">${error.message}</p>
            </div>
        `;
    }
}

function showModal(data) {
    if (!data || !data.breakdown) {
        console.error("No breakdown data available");
        return;
    }

    modalDate.innerText = formatDate(data.timestamp);
    modalTotal.innerText = `Total: ${parseFloat(data.waterUsage).toFixed(2)} Liters`;
    
    let gridHtml = '';
    const breakdown = data.breakdown;
    
    // Nice friendly names instead of keys
    const names = {
        Shower: 'Shower', Toilet: 'Toilet', Dishwasher: 'Dishwasher',
        Drinking: 'Drinking Water', Watering: 'Watering Plants', Sink: 'Sink Usage',
        Cooking: 'Cooking', Lawn: 'Lawn/Garden', Vehicle: 'Vehicle Washing',
        CoffeeTea: 'Coffee/Tea', VegetarianDiet: 'Vegetarian Diet', 
        NonVegetarianDiet: 'Non-veg Diet', Recycling: 'Recycling Savings',
        DonateClothes: 'Donating Clothes'
    };

    for (const [key, val] of Object.entries(breakdown)) {
        if (parseFloat(val) !== 0) {
            const displayName = names[key] || key;
            const displayVal = parseFloat(val);
            const colorCode = displayVal < 0 ? '#4CAF50' : 'white'; // green for savings
            const prefix = displayVal > 0 ? '+' : '';
            
            gridHtml += `
                <div class="breakdown-item">
                    <span>${displayName}</span>
                    <strong style="color: ${colorCode}">${prefix}${displayVal.toFixed(1)} L</strong>
                </div>
            `;
        }
    }

    if (data.recommendations && data.recommendations.length > 0) {
        gridHtml += `
            <div style="grid-column: 1 / -1; margin-top: 15px; background: rgba(0, 180, 216, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #00b4d8;">
                <h4 style="color: #00b4d8; margin: 0 0 10px 0;"><i class='bx bx-bulb'></i> Topics & Recommendations</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #ddd; line-height: 1.6;">
                    ${data.recommendations.map(r => `<li>${r}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    modalGrid.innerHTML = gridHtml;
    modal.style.display = 'block';
}

// Modal closing
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => {
    if (e.target == modal) modal.style.display = "none";
}

// Auth State Check
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        
        // Setup UI
        const name = user.displayName || 'Water Saver';
        const initial = user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
        
        userNameEl.innerText = name;
        userEmailEl.innerText = user.email;
        
        if (user.photoURL) {
            profileImg.src = user.photoURL;
            profileImg.style.display = 'block';
            if (defaultIcon) defaultIcon.style.display = 'none';
            userInitialEl.innerText = "";
            userInitialEl.appendChild(profileImg);
            userInitialEl.appendChild(uploadOverlay);
        } else if (!user.photoURL) {
            userInitialEl.innerText = initial;
            userInitialEl.appendChild(uploadOverlay);
        }
        
        if (user.metadata && user.metadata.creationTime) {
            memberSinceEl.innerText = `Member since: ${new Date(user.metadata.creationTime).toLocaleDateString()}`;
        } else {
            memberSinceEl.style.display = 'none';
        }

        // Fetch Data
        fetchUserHistory(user.uid).then(() => {
            // Hide loader, show content
            loader.style.display = 'none';
            profileContent.style.display = 'block';
        });

    } else {
        // No user signed in, redirect to login
        window.location.href = 'auth.html';
    }
});

// Logout handling
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error("Sign Out Error", error);
    });
});

// Profile Picture Upload Logic
userInitialEl.addEventListener('mouseenter', () => {
    if (uploadOverlay) uploadOverlay.style.display = 'block';
});
userInitialEl.addEventListener('mouseleave', () => {
    if (uploadOverlay) uploadOverlay.style.display = 'none';
});
userInitialEl.addEventListener('click', () => {
    if (imageUpload) imageUpload.click();
});

imageUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file || !auth.currentUser) return;
    
    // Show uploading state
    uploadOverlay.innerText = "Uploading...";
    uploadOverlay.style.display = 'block';

    try {
        const storageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        
        await updateProfile(auth.currentUser, { photoURL: downloadURL });
        
        // Update UI
        profileImg.src = downloadURL;
        profileImg.style.display = 'block';
        if (defaultIcon) defaultIcon.style.display = 'none';
        
        // Clear initial text node securely
        while (userInitialEl.firstChild) {
            userInitialEl.removeChild(userInitialEl.firstChild);
        }
        userInitialEl.appendChild(profileImg);
        userInitialEl.appendChild(uploadOverlay);
        
    } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image. Please check your Storage Security Rules.");
    } finally {
        uploadOverlay.innerText = "Upload";
        uploadOverlay.style.display = 'none';
    }
});
