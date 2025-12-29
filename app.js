// =======================
// التخزين
// =======================
const appData = {
    users: {},
    currentUser: null,
    isLogin: true,
    currentLanguage: 'ar',
    photoData: { plastic: null, paper: null, metal: null }
};

// =======================
// المكافآت
// =======================
const rewards = [
    { 
        id: 1, 
        name: { ar: 'كرت خصم كارفور 50 جنيه', en: 'Carrefour 50 EGP', fr: 'Carrefour 50 EGP' }, 
        store: { ar: 'كارفور', en: 'Carrefour', fr: 'Carrefour' }, 
        points: 100, 
        image: '🛒' 
    },
    { 
        id: 2, 
        name: { ar: 'كرت خصم كارفور 100 جنيه', en: 'Carrefour 100 EGP', fr: 'Carrefour 100 EGP' }, 
        store: { ar: 'كارفور', en: 'Carrefour', fr: 'Carrefour' }, 
        points: 180, 
        image: '🛒' 
    },
    { 
        id: 3, 
        name: { ar: 'كوبون أكازيون 30 جنيه', en: 'Occasion 30 EGP', fr: 'Occasion 30 EGP' }, 
        store: { ar: 'أكازيون', en: 'Occasion', fr: 'Occasion' }, 
        points: 60, 
        image: '🏪' 
    },
    { 
        id: 4, 
        name: { ar: 'كوبون أكازيون 75 جنيه', en: 'Occasion 75 EGP', fr: 'Occasion 75 EGP' }, 
        store: { ar: 'أكازيون', en: 'Occasion', fr: 'Occasion' }, 
        points: 140, 
        image: '🏪' 
    },
    { 
        id: 5, 
        name: { ar: 'كرت خصم كارفور 200 جنيه', en: 'Carrefour 200 EGP', fr: 'Carrefour 200 EGP' }, 
        store: { ar: 'كارفور', en: 'Carrefour', fr: 'Carrefour' }, 
        points: 350, 
        image: '🛒' 
    },
    { 
        id: 6, 
        name: { ar: 'كوبون أكازيون 150 جنيه', en: 'Occasion 150 EGP', fr: 'Occasion 150 EGP' }, 
        store: { ar: 'أكازيون', en: 'Occasion', fr: 'Occasion' }, 
        points: 270, 
        image: '🏪' 
    }
];

// =======================
// الترجمة
// =======================
function getText(key) {
    const lang = appData.currentLanguage;
    const translations = {
        ar: translations_ar,
        en: translations_en,
        fr: translations_fr
    };
    return translations[lang][key] || key;
}

function updateAllText() {
    // تحديث النصوص
    document.querySelectorAll('[data-translate]').forEach(el => {
        el.textContent = getText(el.getAttribute('data-translate'));
    });
    
    // تحديث placeholders
    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        el.placeholder = getText(el.getAttribute('data-translate-placeholder'));
    });
}

function changeLanguage(lang) {
    appData.currentLanguage = lang;
    
    // تغيير الاتجاه
    if (lang === 'ar') {
        document.documentElement.dir = 'rtl';
    } else {
        document.documentElement.dir = 'ltr';
    }
    
    updateAllText();
    
    // إعادة عرض البيانات
    if (appData.currentUser) {
        showRewards();
        showHistory();
        showStats();
    }
}

// =======================
// الرسائل
// =======================
function showMessage(message, type = 'success') {
    const div = document.createElement('div');
    div.className = type === 'success' ? 'success-msg' : 'info-msg';
    div.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i> ${message}`;
    document.body.appendChild(div);
    
    setTimeout(() => div.remove(), 3500);
}

function showError(message) {
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    setTimeout(() => errorMsg.style.display = 'none', 4000);
}

// =======================
// تسجيل الدخول والخروج
// =======================
function toggleAuthMode(e) {
    e.preventDefault();
    appData.isLogin = !appData.isLogin;
    document.getElementById('nameGroup').style.display = appData.isLogin ? 'none' : 'block';
    updateAllText();
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    const name = document.getElementById('nameInput').value.trim();

    if (!email || !password || (!appData.isLogin && !name)) {
        showError(getText('fillAllFields'));
        return;
    }

    if (appData.isLogin) {
        // تسجيل دخول
        if (!appData.users[email] || appData.users[email].password !== password) {
            showError(getText('invalidCredentials'));
            return;
        }
        appData.currentUser = appData.users[email];
    } else {
        // تسجيل جديد
        if (appData.users[email]) {
            showError(getText('emailExists'));
            return;
        }
        appData.users[email] = {
            email, password, name,
            points: 0,
            redeemedRewards: [],
            recycleHistory: []
        };
        appData.currentUser = appData.users[email];
    }

    // عرض لوحة التحكم
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('dashboard').classList.add('active');
    document.getElementById('userName').textContent = appData.currentUser.name;
    document.getElementById('userPoints').textContent = appData.currentUser.points;
    
    showRewards();
    showHistory();
    showStats();
}

function logout() {
    appData.currentUser = null;
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('emailInput').value = '';
    document.getElementById('passwordInput').value = '';
    document.getElementById('nameInput').value = '';
    appData.isLogin = true;
    document.getElementById('nameGroup').style.display = 'none';
    updateAllText();
}

// =======================
// التبويبات
// =======================
function switchTab(tabName) {
    // إزالة active من الكل
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    
    // إضافة active للمحدد
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName + 'Section').classList.add('active');

    // تحديث البيانات
    if (tabName === 'rewards') showRewards();
    if (tabName === 'history') showHistory();
    if (tabName === 'stats') showStats();
}

// =======================
// التصوير
// =======================
async function takePhoto(type) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        video.onloadedmetadata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            
            // حفظ الصورة
            appData.photoData[type] = canvas.toDataURL('image/jpeg');
            
            // عرض الصورة
            const img = document.getElementById(type + 'Photo');
            img.src = appData.photoData[type];
            img.classList.add('active');
            
            stream.getTracks().forEach(track => track.stop());
            
            // رسائل التحقق
            showMessage(getText('photoTaken'));
            setTimeout(() => showMessage(getText('verifyingPhoto'), 'info'), 500);
            setTimeout(() => {
                showMessage(getText('verificationSuccess'));
                showMessage(getText('willVerifyAtStore'), 'info');
            }, 2000);
        };
    } catch (error) {
        showError(getText('cameraFailed'));
    }
}

// =======================
// إعادة التدوير
// =======================
function recycleItem(type, pointsPerKg) {
    const input = document.getElementById(type + 'Input');
    const amount = parseFloat(input.value);
    
    if (!amount || amount <= 0) {
        showError(getText('enterValidAmount'));
        return;
    }

    if (!appData.photoData[type]) {
        showError(getText('takePhotoFirst'));
        return;
    }

    // إضافة النقاط
    const earnedPoints = Math.floor(amount * pointsPerKg);
    appData.currentUser.points += earnedPoints;
    document.getElementById('userPoints').textContent = appData.currentUser.points;

    // حفظ السجل
    appData.currentUser.recycleHistory.push({
        type, amount, points: earnedPoints,
        photo: appData.photoData[type],
        date: new Date().toISOString()
    });
    
    // تنظيف
    input.value = '';
    document.getElementById(type + 'Photo').classList.remove('active');
    appData.photoData[type] = null;
    
    showMessage(getText('pointsAdded').replace('{points}', earnedPoints));
    showRewards();
    showStats();
}

// =======================
// عرض المكافآت
// =======================
function showRewards() {
    const grid = document.getElementById('rewardsGrid');
    grid.innerHTML = '';

    rewards.forEach(reward => {
        const canRedeem = appData.currentUser && appData.currentUser.points >= reward.points;
        const rewardName = reward.name[appData.currentLanguage];
        const storeName = reward.store[appData.currentLanguage];
        
        const card = document.createElement('div');
        card.className = 'reward-card';
        card.innerHTML = `
            <div class="reward-image">${reward.image}</div>
            <div class="reward-content">
                <div class="reward-name">${rewardName}</div>
                <div class="reward-store"><i class="fas fa-store"></i> ${storeName}</div>
                <div class="reward-points">
                    <span class="points-cost"><i class="fas fa-star"></i> ${reward.points}</span>
                </div>
                <button class="redeem-btn" ${!canRedeem ? 'disabled' : ''}>
                    ${canRedeem ? `<i class="fas fa-check"></i> ${getText('redeem')}` : `<i class="fas fa-lock"></i> ${getText('notEnough')}`}
                </button>
            </div>
        `;
        
        if (canRedeem) {
            card.querySelector('.redeem-btn').onclick = () => redeemReward(reward.id, reward.points);
        }
        
        grid.appendChild(card);
    });
}

// =======================
// استبدال المكافأة
// =======================
function redeemReward(rewardId, points) {
    if (appData.currentUser.points < points) {
        showError(getText('insufficientPoints'));
        return;
    }

    // خصم النقاط
    appData.currentUser.points -= points;
    document.getElementById('userPoints').textContent = appData.currentUser.points;

    // إنشاء كود
    const reward = rewards.find(r => r.id === rewardId);
    const code = Array.from({length: 8}, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('');
    
    // حفظ السجل
    appData.currentUser.redeemedRewards.push({
        reward, code, date: new Date().toISOString()
    });
    
    showRewards();
    showHistory();
    openModal(reward, code);
}

// =======================
// المودال
// =======================
function openModal(reward, code) {
    document.getElementById('couponCode').textContent = code;
    document.getElementById('modalStore').textContent = reward.store[appData.currentLanguage];
    document.getElementById('modalReward').textContent = reward.name[appData.currentLanguage];
    document.getElementById('qrModal').classList.add('active');
}

function closeModal() {
    document.getElementById('qrModal').classList.remove('active');
}

// =======================
// السجل
// =======================
function showHistory() {
    const list = document.getElementById('historyList');
    
    if (!appData.currentUser.redeemedRewards || appData.currentUser.redeemedRewards.length === 0) {
        list.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-inbox"></i>
                <h3>${getText('noRewards')}</h3>
                <p>${getText('startRecycling')}</p>
            </div>
        `;
        return;
    }

    list.innerHTML = '';
    [...appData.currentUser.redeemedRewards].reverse().forEach(item => {
        const date = new Date(item.date).toLocaleString(appData.currentLanguage === 'ar' ? 'ar-EG' : appData.currentLanguage);
        
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="history-info">
                <div class="history-reward">${item.reward.name[appData.currentLanguage]}</div>
                <div class="history-details">
                    <i class="fas fa-store"></i> ${item.reward.store[appData.currentLanguage]} | 
                    <i class="fas fa-calendar"></i> ${date}
                </div>
            </div>
            <div class="history-code">${item.code}</div>
            <button class="view-qr-btn">
                <i class="fas fa-qrcode"></i> ${getText('viewQR')}
            </button>
        `;
        
        div.querySelector('.view-qr-btn').onclick = () => openModal(item.reward, item.code);
        list.appendChild(div);
    });
}

// =======================
// الإحصائيات
// =======================
function showStats() {
    let totalPlastic = 0, totalPaper = 0, totalMetal = 0;

    if (appData.currentUser.recycleHistory) {
        appData.currentUser.recycleHistory.forEach(item => {
            if (item.type === 'plastic') totalPlastic += item.amount;
            if (item.type === 'paper') totalPaper += item.amount;
            if (item.type === 'metal') totalMetal += item.amount;
        });
    }

    const totalRedeemed = appData.currentUser.redeemedRewards?.length || 0;

    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card blue">
            <div class="stat-icon"><i class="fas fa-bottle-water"></i></div>
            <div class="stat-value">${totalPlastic.toFixed(1)}</div>
            <div class="stat-label">${getText('kgPlastic')}</div>
        </div>
        <div class="stat-card green">
            <div class="stat-icon"><i class="fas fa-file-alt"></i></div>
            <div class="stat-value">${totalPaper.toFixed(1)}</div>
            <div class="stat-label">${getText('kgPaper')}</div>
        </div>
        <div class="stat-card orange">
            <div class="stat-icon"><i class="fas fa-box"></i></div>
            <div class="stat-value">${totalMetal.toFixed(1)}</div>
            <div class="stat-label">${getText('kgMetal')}</div>
        </div>
        <div class="stat-card purple">
            <div class="stat-icon"><i class="fas fa-gift"></i></div>
            <div class="stat-value">${totalRedeemed}</div>
            <div class="stat-label">${getText('rewardsRedeemed')}</div>
        </div>
    `;

    // سجل إعادة التدوير
    const recycleList = document.getElementById('recycleHistory');
    
    if (!appData.currentUser.recycleHistory || appData.currentUser.recycleHistory.length === 0) {
        recycleList.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-recycle"></i>
                <h3>${getText('noRecycleHistory')}</h3>
                <p>${getText('startRecyclingEnv')}</p>
            </div>
        `;
        return;
    }

    recycleList.innerHTML = '';
    [...appData.currentUser.recycleHistory].reverse().forEach(item => {
        const date = new Date(item.date).toLocaleString(appData.currentLanguage === 'ar' ? 'ar-EG' : appData.currentLanguage);
        const typeNames = { plastic: getText('plastic'), paper: getText('paper'), metal: getText('metal') };
        const typeIcons = { plastic: 'fa-bottle-water', paper: 'fa-file-alt', metal: 'fa-box' };
        const typeColors = { plastic: '#3b82f6', paper: '#10b981', metal: '#f59e0b' };
        
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="history-info">
                <div class="history-reward">
                    <i class="fas ${typeIcons[item.type]}" style="color: ${typeColors[item.type]}"></i>
                    ${typeNames[item.type]} - ${item.amount} ${appData.currentLanguage === 'ar' ? 'كيلو' : 'kg'}
                </div>
                <div class="history-details">
                    <i class="fas fa-star"></i> +${item.points} ${appData.currentLanguage === 'ar' ? 'نقطة' : 'points'} | 
                    <i class="fas fa-calendar"></i> ${date}
                </div>
            </div>
        `;
        recycleList.appendChild(div);
    });
}

// =======================
// البداية
// =======================
document.addEventListener('DOMContentLoaded', () => {
    // تسجيل الدخول
    document.getElementById('authForm').onsubmit = handleLogin;
    document.getElementById('toggleLink').onclick = toggleAuthMode;
    document.getElementById('logoutBtn').onclick = logout;
    
    // اللغة
    document.getElementById('languageSelector').onchange = (e) => changeLanguage(e.target.value);
    
    // التبويبات
    document.getElementById('tabsContainer').onclick = (e) => {
        const tab = e.target.closest('.tab');
        if (tab) switchTab(tab.dataset.tab);
    };
    
    // أزرار إعادة التدوير
    document.querySelectorAll('.recycle-btn').forEach(btn => {
        btn.onclick = () => recycleItem(btn.dataset.type, parseInt(btn.dataset.points));
    });
    
    // المودال
    document.getElementById('closeModalBtn').onclick = closeModal;
    document.getElementById('qrModal').onclick = (e) => {
        if (e.target.id === 'qrModal') closeModal();
    };
    
    // عرض المكافآت
    showRewards();
    updateAllText();
});