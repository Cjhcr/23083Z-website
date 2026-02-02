// 1. Typewriter Effect Logic
const textToType = "VEX TEAM 23083Z";
const typeWriterElement = document.getElementById('typewriter-text');
let typeIndex = 0;

function typeWriter() {
    if (typeIndex < textToType.length) {
        typeWriterElement.textContent += textToType.charAt(typeIndex);
        typeIndex++;
        setTimeout(typeWriter, 100); 
    }
}

// 2. Countdown Timer Logic
function startCountdown() {
    const targetDate = new Date('Feb 03, 2026 09:00:00').getTime();
    const timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;
        if (distance < 0) {
            clearInterval(timerInterval);
            document.getElementById("countdown").innerHTML = "EVENT STARTED!";
            return;
        }
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        document.getElementById("days").innerText = days < 10 ? '0' + days : days;
        document.getElementById("hours").innerText = hours < 10 ? '0' + hours : hours;
        document.getElementById("minutes").innerText = minutes < 10 ? '0' + minutes : minutes;
        document.getElementById("seconds").innerText = seconds < 10 ? '0' + seconds : seconds;
    }, 1000);
}

// 3. Scroll Animation
const observerOptions = { threshold: 0.1 };
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('scroll-visible');
        }
    });
}, observerOptions);

// 4. Page Switching Logic
function switchTab(tabId, updateHistory = true) {
    const targetSection = document.getElementById(tabId);
    const currentSection = document.querySelector('.page-section.active-page');
    if (!targetSection || currentSection === targetSection) return;

    const showNewSection = () => {
        document.querySelectorAll('.page-section').forEach(sec => {
            sec.classList.remove('active-page', 'visible');
        });
        window.scrollTo(0, 0);
        targetSection.classList.add('active-page');
        setTimeout(() => { targetSection.classList.add('visible'); }, 50);

        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        // Fixed selector logic for active tab highlight
        const clickedLink = document.querySelector(`.nav-item[onclick="switchTab('${tabId}')"]`);
        if(clickedLink) clickedLink.classList.add('active');

        const menuToggle = document.getElementById('mobile-menu-btn');
        const navMenu = document.getElementById('nav-menu');
        if(menuToggle && navMenu) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }

        if(tabId === 'home') {
            targetSection.classList.add('home-active');
        } else {
            document.querySelectorAll('.home-active').forEach(el => el.classList.remove('home-active'));
            if(tabId === 'home') targetSection.classList.add('home-active');
        }
        if(updateHistory) { history.pushState({tabId: tabId}, null, `#${tabId}`); }
    };

    if (currentSection) {
        currentSection.classList.remove('visible');
        setTimeout(() => { showNewSection(); }, 400);
    } else { showNewSection(); }
}

window.addEventListener('popstate', (event) => {
    if (event.state && event.state.tabId) { switchTab(event.state.tabId, false); } else { switchTab('home', false); }
});

// 5. Lightbox Logic
const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
lightbox.innerHTML = `<span id="lightbox-close">&times;</span><img id="lightbox-img" src="" alt="Enlarged Image">`;
document.body.appendChild(lightbox);
const lightboxImg = document.getElementById('lightbox-img');

function bindLightboxEvents() {
    const galleryImages = document.querySelectorAll('.gallery-item img');
    galleryImages.forEach(img => {
        img.addEventListener('click', e => {
            lightboxImg.src = e.target.src;
            lightbox.classList.add('active');
        });
    });
}
lightbox.addEventListener('click', e => { if (e.target !== lightboxImg) lightbox.classList.remove('active'); });

// Fullscreen ESC handler (Shared)
document.addEventListener('keydown', (e) => { 
    if(e.key === 'Escape') {
        if(lightbox.classList.contains('active')) lightbox.classList.remove('active');
        const fs = document.querySelector('.fullscreen');
        if(fs) toggleFullScreen(fs.id);
    }
});

// 6. AUTO LOAD IMAGES Logic
function loadGallery(containerId, folderName, totalCount, filePrefix) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let html = '';
    for (let i = 1; i <= totalCount; i++) {
        html += `<div class="gallery-item scroll-hidden"><img src="${folderName}/${filePrefix}-${i}.jpg" alt="Photo ${i}"></div>`;
    }
    container.innerHTML = html;
    container.querySelectorAll('.scroll-hidden').forEach(el => { scrollObserver.observe(el); });
}

// --- 7. TOURNAMENT MANAGER LOGIC ---
let teamData = []; let matches = []; let currentEventName = ""; let currentRankingMode = 'Practice';
const teamNumInput = document.getElementById('team-number');
if(teamNumInput) { teamNumInput.addEventListener('input', function() { this.value = this.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6); }); }

function saveToStorage() {
    const data = { teams: teamData, matches: matches, eventName: currentEventName, mode: currentRankingMode };
    localStorage.setItem('vex_reaper_tm_v5', JSON.stringify(data));
}
function loadFromStorage() {
    const data = localStorage.getItem('vex_reaper_tm_v5');
    if (data) {
        const parsed = JSON.parse(data);
        teamData = parsed.teams || []; matches = parsed.matches || [];
        currentEventName = parsed.eventName || "Restored Event"; currentRankingMode = parsed.mode || 'Practice';
        document.getElementById('event-name').value = currentEventName; 
        document.getElementById('tm-title').innerText = currentEventName;
        document.getElementById('rank-fs-title').innerText = currentEventName;
        document.getElementById('sched-fs-title').innerText = currentEventName;
        
        document.getElementById('tm-setup').style.display = 'none'; document.getElementById('tm-dashboard').style.display = 'grid';
        renderTeamList(); renderMatches(); updateRankings(); populateMatchSelector(); switchRankingMode(currentRankingMode);
    } else { alert("No saved tournament found."); }
}
function addTeam() {
    const num = document.getElementById('team-number').value.trim().toUpperCase();
    const name = document.getElementById('team-name').value.trim();
    if (num && !teamData.find(t => t.number === num)) {
        teamData.push({ 
            number: num, name: name, 
            p_wp:0, p_ap:0, p_sp:0, p_wins:0, p_losses:0, p_ties:0, p_matches:0,
            q_wp:0, q_ap:0, q_sp:0, q_wins:0, q_losses:0, q_ties:0, q_matches:0
        });
        renderTeamList(); document.getElementById('team-number').value=''; document.getElementById('team-name').value='';
        // Set focus back to number input for quick adding
        document.getElementById('team-number').focus();
    }
}
function renderTeamList() { document.getElementById('team-list-display').innerHTML = teamData.map(t => `<div class="team-tag"><span class="num">${t.number}</span>${t.name ? `<span style="color:#aaa; font-size:0.8em; border-left:1px solid #444; padding-left:5px;">${t.name}</span>` : ''}<i class="fa-solid fa-times delete-btn" onclick="removeTeam('${t.number}')"></i></div>`).join(''); }
function removeTeam(number) { teamData = teamData.filter(t => t.number !== number); renderTeamList(); }

function startTournament() {
    if (teamData.length < 4) { document.getElementById('setup-error').style.display = 'block'; return; }
    currentEventName = document.getElementById('event-name').value || "VEX Tournament";
    document.getElementById('tm-title').innerText = currentEventName;
    document.getElementById('rank-fs-title').innerText = currentEventName;
    document.getElementById('sched-fs-title').innerText = currentEventName;
    
    generateSchedule(); updateRankings(); renderMatches(); saveToStorage();
    document.getElementById('tm-setup').style.display = 'none'; document.getElementById('tm-dashboard').style.display = 'grid';
}

function generateSchedule() {
    matches = []; let matchId = 1;
    if (teamData.length < 4) {
         const totalMatches = teamData.length * 2;
         for(let i=0; i<totalMatches; i++) {
             let s = [...teamData].sort(() => 0.5 - Math.random());
             matches.push(createMatch(matchId++, 'P' + (i+1), 'Practice', s[0], null, s[1], null));
         }
    } else {
        const practiceMatchCount = Math.ceil(teamData.length / 4); 
        for(let i=0; i<practiceMatchCount; i++) { 
            let s = [...teamData].sort(() => 0.5 - Math.random()); 
            matches.push(createMatch(matchId++, 'P' + (i+1), 'Practice', s[0], s[1], s[2], s[3])); 
        }
        const totalQuals = teamData.length; 
        for(let i=0; i<totalQuals; i++) { let s = [...teamData].sort(() => 0.5 - Math.random()); matches.push(createMatch(matchId++, 'Q' + (i+1), 'Qualification', s[0], s[1], s[2], s[3])); }
    }
    populateMatchSelector();
}
function createMatch(id, label, type, r1, r2, b1, b2) {
    return { id, label, type, red1: r1?r1.number:'', red2: r2?r2.number:'', blue1: b1?b1.number:'', blue2: b2?b2.number:'', redScore: 0, blueScore: 0, status: "scheduled" };
}
function renderMatches() {
    document.getElementById('match-list').innerHTML = matches.map(m => `
        <div class="match-row ${m.status === 'completed' ? 'completed' : ''}" id="match-row-${m.label}" onclick="loadMatchIntoCalc('${m.label}')" style="opacity: ${m.status==='completed'?0.5:1}">
            <div class="match-name">${m.label}</div>
            <div class="alliance">
                <span class="red-alliance">${m.red1}${m.red2 ? ' / ' + m.red2 : ''}</span>
                <span style="color:#444; margin: 0 10px;">vs</span>
                <span class="blue-alliance">${m.blue1}${m.blue2 ? ' / ' + m.blue2 : ''}</span>
            </div>
            <div class="match-score">${m.status === 'completed' ? m.redScore + ' - ' + m.blueScore : '-'}</div>
        </div>
    `).join('');
}
function switchRankingMode(mode) {
    currentRankingMode = mode;
    document.getElementById('tab-practice').classList.toggle('active', mode === 'Practice');
    document.getElementById('tab-qual').classList.toggle('active', mode === 'Qualification');
    updateRankings();
}
function updateRankings() {
    const prefix = currentRankingMode === 'Practice' ? 'p_' : 'q_';
    teamData.sort((a, b) => {
        const aAvgWP = a[prefix+'matches'] > 0 ? a[prefix+'wp'] / a[prefix+'matches'] : 0;
        const bAvgWP = b[prefix+'matches'] > 0 ? b[prefix+'wp'] / b[prefix+'matches'] : 0;
        if (bAvgWP !== aAvgWP) return bAvgWP - aAvgWP;
        
        const aAvgAP = a[prefix+'matches'] > 0 ? a[prefix+'ap'] / a[prefix+'matches'] : 0;
        const bAvgAP = b[prefix+'matches'] > 0 ? b[prefix+'ap'] / b[prefix+'matches'] : 0;
        if (bAvgAP !== aAvgAP) return bAvgAP - aAvgAP;
        
        const aAvgSP = a[prefix+'matches'] > 0 ? a[prefix+'sp'] / a[prefix+'matches'] : 0;
        const bAvgSP = b[prefix+'matches'] > 0 ? b[prefix+'sp'] / b[prefix+'matches'] : 0;
        return bAvgSP - aAvgSP;
    });
    
    document.getElementById('ranking-body').innerHTML = teamData.map((t, index) => {
        const matches = t[prefix+'matches'] || 1; 
        const avgWP = (t[prefix+'wp'] / (t[prefix+'matches'] || 1)).toFixed(2);
        const avgAP = (t[prefix+'ap'] / (t[prefix+'matches'] || 1)).toFixed(2);
        const avgSP = (t[prefix+'sp'] / (t[prefix+'matches'] || 1)).toFixed(2);
        return `<tr><td class="rank-num">${index + 1}</td><td class="team-cell"><span style="font-weight:bold">${t.number}</span> <span style="font-size:0.85em;color:#aaa">${t.name||''}</span></td><td>${t[prefix+'matches']>0?avgWP:'-'}</td><td>${t[prefix+'matches']>0?avgAP:'-'}</td><td>${t[prefix+'matches']>0?avgSP:'-'}</td><td>${t[prefix+'wins']}-${t[prefix+'losses']}-${t[prefix+'ties']}</td></tr>`;
    }).join('');
}

// Scoring Logic
function loadMatchIntoCalc(label) {
    const select = document.getElementById('calc-match-select'); select.value = label; loadMatchForScoring();
}
function calculateTotal() {
    let rScore = parseInt(document.getElementById('red-score-input').value) || 0;
    if(rScore < 0) { rScore = 0; document.getElementById('red-score-input').value = 0; }
    let bScore = parseInt(document.getElementById('blue-score-input').value) || 0;
    if(bScore < 0) { bScore = 0; document.getElementById('blue-score-input').value = 0; }
    
    document.getElementById('score-red-display').innerText = rScore;
    document.getElementById('score-blue-display').innerText = bScore;
}
function clearScores() {
    document.getElementById('red-score-input').value = 0;
    document.getElementById('blue-score-input').value = 0;
    document.getElementById('red-auto').checked = false;
    document.getElementById('blue-auto').checked = false;
    document.getElementById('red-wp').checked = false;
    document.getElementById('blue-wp').checked = false;
    calculateTotal();
}
function loadMatchForScoring() {
    const label = document.getElementById('calc-match-select').value;
    document.querySelectorAll('.match-row').forEach(r => r.classList.remove('active'));
    const row = document.getElementById(`match-row-${label}`); if(row) row.classList.add('active');
    
    const match = matches.find(m => m.label === label);
    if(match) {
        const rTeamText = match.red2 ? `${match.red1} / ${match.red2}` : match.red1;
        const bTeamText = match.blue2 ? `${match.blue1} / ${match.blue2}` : match.blue1;
        document.getElementById('score-red-team').innerText = rTeamText;
        document.getElementById('score-blue-team').innerText = bTeamText;
    }
}
function populateMatchSelector() {
    document.getElementById('calc-match-select').innerHTML = matches.map(m => {
        const rTeamText = m.red2 ? `${m.red1} / ${m.red2}` : m.red1;
        const bTeamText = m.blue2 ? `${m.blue1} / ${m.blue2}` : m.blue1;
        return `<option value="${m.label}">${m.label}: ${rTeamText} vs ${bTeamText}</option>`;
    }).join('');
}
function submitMatchScore() {
    const matchLabel = document.getElementById('calc-match-select').value;
    const match = matches.find(m => m.label === matchLabel); if (!match) return;

    match.redScore = parseInt(document.getElementById('score-red-display').innerText);
    match.blueScore = parseInt(document.getElementById('score-blue-display').innerText);
    match.status = 'completed';
    
    // Save checkbox states for WP/AP calc
    match.flags = {
        rWP: document.getElementById('red-wp').checked,
        bWP: document.getElementById('blue-wp').checked,
        rBonus: document.getElementById('red-auto').checked,
        bBonus: document.getElementById('blue-auto').checked
    };
    
    if(match.type === 'Qualification' && currentRankingMode !== 'Qualification') switchRankingMode('Qualification');
    recalculateAllRankings(); renderMatches(); updateRankings(); saveToStorage();
    
    clearScores();
    
    const nextMatch = matches.find(m => m.id === match.id + 1);
    if (nextMatch) loadMatchIntoCalc(nextMatch.label);
}
function recalculateAllRankings() {
    teamData.forEach(t => { 
        t.p_wp=0; t.p_ap=0; t.p_sp=0; t.p_wins=0; t.p_losses=0; t.p_ties=0; t.p_matches=0;
        t.q_wp=0; t.q_ap=0; t.q_sp=0; t.q_wins=0; t.q_losses=0; t.q_ties=0; t.q_matches=0;
    });
    matches.forEach(m => {
        if (m.status === 'completed') {
            const prefix = m.type === 'Practice' ? 'p_' : 'q_';
            const r = [teamData.find(t=>t.number===m.red1), teamData.find(t=>t.number===m.red2)].filter(x=>x);
            const b = [teamData.find(t=>t.number===m.blue1), teamData.find(t=>t.number===m.blue2)].filter(x=>x);
            
            r.forEach(t=>t[prefix+'matches']++);
            b.forEach(t=>t[prefix+'matches']++);
            
            let rWP = 0; let bWP = 0;
            if (m.redScore > m.blueScore) { rWP+=2; r.forEach(t=>t[prefix+'wins']++); b.forEach(t=>t[prefix+'losses']++); }
            else if (m.blueScore > m.redScore) { bWP+=2; b.forEach(t=>t[prefix+'wins']++); r.forEach(t=>t[prefix+'losses']++); }
            else { rWP+=1; bWP+=1; r.forEach(t=>t[prefix+'ties']++); b.forEach(t=>t[prefix+'ties']++); }
            
            if(m.flags) {
                if(m.flags.rWP) rWP+=1;
                if(m.flags.bWP) bWP+=1;
                if(m.flags.rBonus && m.flags.bBonus) { r.forEach(t=>t[prefix+'ap']+=5); b.forEach(t=>t[prefix+'ap']+=5); }
                else if(m.flags.rBonus) { r.forEach(t=>t[prefix+'ap']+=10); }
                else if(m.flags.bBonus) { b.forEach(t=>t[prefix+'ap']+=10); }
            }

            let loserScore = Math.min(m.redScore, m.blueScore);
            r.forEach(t=>{ t[prefix+'wp']+=rWP; t[prefix+'sp']+=loserScore; }); 
            b.forEach(t=>{ t[prefix+'wp']+=bWP; t[prefix+'sp']+=loserScore; });
        }
    });
}

// --- AUDIO ---
function playSound(type) {
    let id = '';
    // Match sound to audio tag ID
    switch(type) {
        case 'start': id = 'sfx-start'; break;
        case 'pause': id = 'sfx-pause'; break;
        case 'abort': id = 'sfx-abort'; break;
        case 'stop': id = 'sfx-stop'; break;
        case 'warning': id = 'sfx-warning'; break;
    }
    if(id) {
        const el = document.getElementById(id);
        if(el) {
            el.currentTime = 0;
            el.play().catch(e => {
                console.warn("Audio play failed", e);
                // Fallback beep
                playTone(type === 'start' ? 600 : 200, 'square', 0.5);
            });
        }
    }
}

// Fallback tone generator
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, type, duration) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
}

// --- TIMER (REVISED WORKFLOW) ---
let timerInterval; let timeLeft = 0; let currentMode = 'match'; 
let matchState = 'ready'; // ready, auto, ended_auto, ready_driver, driver, paused, ended_match

function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60); const s = timeLeft % 60;
    const display = document.getElementById('timer-val');
    display.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    
    const phaseText = document.getElementById('timer-phase');
    if(matchState === 'ready') phaseText.innerText = currentMode === 'match' ? "AUTONOMOUS READY" : "SKILLS READY";
    else if(matchState === 'auto') phaseText.innerText = "AUTONOMOUS";
    else if(matchState === 'ended_auto') phaseText.innerText = "AUTO ENDED";
    else if(matchState === 'ready_driver') phaseText.innerText = "DRIVER READY";
    else if(matchState === 'driver') phaseText.innerText = "DRIVER CONTROL";
    else if(matchState === 'paused') phaseText.innerText = "PAUSED";
    else if(matchState === 'ended_match') phaseText.innerText = "MATCH ENDED";

    display.classList.remove('timer-warning');
    document.body.classList.remove('flash-active');

    if(currentMode === 'match') {
        if(matchState === 'driver' && timeLeft <= 20 && timeLeft > 0) {
            display.classList.add('timer-warning');
            if(timeLeft === 20) document.body.classList.add('flash-active');
        }
        
        if(matchState === 'driver' && timeLeft <= 10) display.style.color = '#E74C3C'; 
        else if(matchState === 'driver') display.style.color = 'white';
        else if(matchState === 'paused') display.style.color = '#F39C12';
        else display.style.color = 'white';
    }
}

function updateButtons() {
    const btnStart = document.getElementById('btn-start');
    const btnPause = document.getElementById('btn-pause');
    const btnSwitch = document.getElementById('btn-switch');
    const btnReset = document.getElementById('btn-reset');
    
    btnStart.style.display = 'inline-block';
    btnPause.style.display = 'none';
    btnSwitch.style.display = 'none';
    btnStart.disabled = false;
    
    // Logic for Reset/Skip button
    if (matchState === 'auto' || matchState === 'driver') {
        btnReset.innerText = "SKIP";
        btnReset.className = "timer-btn btn-skip";
        btnReset.onclick = skipTimer;
    } else {
        btnReset.innerText = "RESET";
        btnReset.className = "timer-btn btn-reset";
        btnReset.onclick = resetTimer;
    }
    
    if (matchState === 'ready' || matchState === 'ready_driver') {
        btnStart.innerText = "START";
    } else if (matchState === 'auto' || matchState === 'driver') {
        btnStart.style.display = 'none';
        btnPause.style.display = 'inline-block';
        btnPause.innerText = "PAUSE";
    } else if (matchState === 'paused') {
        btnStart.style.display = 'none';
        btnPause.style.display = 'inline-block';
        btnPause.innerText = "RESUME";
    } else if (matchState === 'ended_auto') {
        btnStart.style.display = 'none';
        btnSwitch.style.display = 'inline-block';
    } else if (matchState === 'ended_match') {
        btnStart.disabled = true;
        btnStart.innerText = "ENDED";
    }
}

function setTimerMode(mode) {
    currentMode = mode; 
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active')); 
    event.target.classList.add('active');
    resetTimer();
}

function resetTimer() {
    clearInterval(timerInterval); timerInterval = null;
    if (currentMode === 'skills') { timeLeft = 60; } 
    else { timeLeft = 15; }
    matchState = 'ready';
    updateTimerDisplay();
    updateButtons();
}

function skipTimer() {
    // Skips current phase
    if (matchState === 'auto') {
        clearInterval(timerInterval);
        playSound('pause');
        matchState = 'ended_auto';
    } else if (matchState === 'driver') {
        clearInterval(timerInterval);
        playSound('stop');
        matchState = 'ended_match';
    }
    updateTimerDisplay();
    updateButtons();
}

function handleResetSkip() {
    if (document.getElementById('btn-reset').innerText === "SKIP") {
        skipTimer();
    } else {
        resetTimer();
    }
}

function toggleTimer() {
    if(matchState === 'ready' || matchState === 'ready_driver') {
        startTimerInterval();
    }
}

function startTimerInterval() {
    playSound('start');
    
    if(matchState === 'ready') matchState = currentMode === 'skills' ? 'driver' : 'auto';
    else if(matchState === 'ready_driver') matchState = 'driver';
    
    updateButtons();
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            // Check for warning at 20s left
            if(currentMode === 'match' && matchState === 'driver' && timeLeft === 20) {
                playSound('warning');
            }
            
            timeLeft--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            
            if(currentMode === 'match' && matchState === 'auto') {
                playSound('pause');
                matchState = 'ended_auto';
            } else {
                playSound('stop');
                matchState = 'ended_match';
            }
            updateButtons();
            updateTimerDisplay();
        }
    }, 1000);
}

function pauseTimer() {
    if(timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        matchState = 'paused';
        playSound('abort');
    } else {
        if(currentMode === 'match' && timeLeft <= 15 && timeLeft > 0 && matchState !== 'driver') matchState = 'auto'; 
        else matchState = 'driver';
        startTimerInterval();
        return; 
    }
    updateButtons();
    updateTimerDisplay();
}

function switchToDriver() {
    timeLeft = 105; // 1:45
    matchState = 'ready_driver';
    updateTimerDisplay();
    updateButtons();
}

function toggleFullScreen(id) { 
    const el = document.getElementById(id); el.classList.toggle('fullscreen'); 
    if(el.classList.contains('fullscreen')) document.body.classList.add('no-scroll');
    else document.body.classList.remove('no-scroll');
}

// --- 8. DOM LOADED & INIT (Merged) ---
const mediaCount = 12; 
const robotCount = 22; 

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(typeWriter, 500); 
    startCountdown();
    loadGallery('media-gallery', 'media', mediaCount, 'media');
    loadGallery('robot-gallery', 'robot', robotCount, 'robot');
    bindLightboxEvents();

    const menuToggle = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            // Added no-scroll toggle for mobile menu consistency with original styles
            if(navMenu.classList.contains('active')) document.body.classList.add('no-scroll'); 
            else document.body.classList.remove('no-scroll');
        });
    }

    // Handle Hash Navigation
    const hash = window.location.hash.substring(1); 
    if (hash) { switchTab(hash, false); } 
    else { 
        const home = document.getElementById('home');
        if(home) { home.classList.add('active-page', 'visible'); }
    }

    // Scroll Back To Top
    const backToTopBtn = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { backToTopBtn.classList.add('show'); } 
        else { backToTopBtn.classList.remove('show'); }
    });
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Match List Auto Scroll
    const matchListContainer = document.getElementById('match-list-container');
    if (matchListContainer) {
        matchListContainer.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
        });
    }
    
    // Initialize Timer
    resetTimer();
});