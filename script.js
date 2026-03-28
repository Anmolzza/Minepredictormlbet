document.addEventListener('DOMContentLoaded', () => {
    const mineGrid = document.getElementById('mine-grid');
    const predictBtn = document.getElementById('predict-btn');
    const mineIdInput = document.getElementById('mine-id');
    const gemSlider = document.getElementById('gem-count');
    const gemVal = document.getElementById('gem-count-val');
    const statusBar = document.querySelector('.status-msg');
    const accuracyValue = document.querySelector('.stat-value.text-accent');
    
    let predictionAttempt = 0;

    // Update Slider Value Display
    gemSlider.addEventListener('input', (e) => {
        gemVal.textContent = `${e.target.value} Gems`;
    });

    // Generate 5x5 Grid
    function createGrid() {
        mineGrid.innerHTML = '';
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            mineGrid.appendChild(cell);
        }
    }

    // Hash function to turn string into a seed
    function getSeed(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    // Better seeded random number generator (MurmurHash-style inspired LCG)
    function seededRandom(seed) {
        return function() {
            seed = (seed + 0x6D2B79F5) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), seed | 1);
            t = (t + Math.imul(t ^ (t >>> 7), t | 61)) | 0;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    async function updateStatus(msg) {
        statusBar.textContent = '> ' + msg;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function handlePredict() {
        const id = mineIdInput.value.trim();
        const gemCount = parseInt(gemSlider.value);

        if (!id) {
            updateStatus('ERROR: MISSION ID REQUIRED');
            mineIdInput.style.borderColor = '#ff4b4b';
            setTimeout(() => mineIdInput.style.borderColor = '', 2000);
            return;
        }

        // Reset grid
        createGrid();
        predictBtn.disabled = true;
        predictBtn.style.opacity = '0.5';
        
        // Use salt + attempt to get different patterns on each click
        predictionAttempt++;
        const seedStr = id + "-v3-" + gemCount + "-arr-" + predictionAttempt;
        const seed = getSeed(seedStr);
        const random = seededRandom(seed);
        
        // Scan Animation
        await updateStatus(`SCANNING SECTOR [ROUND ${predictionAttempt}]...`);
        await sleep(400);
        
        const cells = document.querySelectorAll('.cell');
        
        // Visual "Scanning"
        for (let i = 0; i < 20; i++) {
            const index = Math.floor(Math.random() * 25);
            cells[index].classList.add('loading');
            await sleep(40);
            cells[index].classList.remove('loading');
        }

        await sleep(300);

        // Determine Gems and a few "Confirmed Bombs"
        const gemIndices = new Set();
        while(gemIndices.size < gemCount) {
            gemIndices.add(Math.floor(random() * 25));
        }

        const bombIndices = new Set();
        // Add 2-3 "Danger Zones" (Bombs)
        while(bombIndices.size < 3) {
            const bIndex = Math.floor(random() * 25);
            if (!gemIndices.has(bIndex)) bombIndices.add(bIndex);
        }

        // Reveal Results with delay
        await updateStatus('DECODING QUANTUM DATA...');
        
        const allIndices = Array.from(gemIndices).concat(Array.from(bombIndices));
        for (const index of allIndices) {
            await sleep(200);
            if (gemIndices.has(index)) {
                cells[index].classList.add('predict-gem');
            } else {
                cells[index].classList.add('predict-bomb');
            }
        }

        const finalAccuracy = (97 + Math.random() * 2.5).toFixed(1);
        accuracyValue.textContent = finalAccuracy + '%';
        
        await updateStatus(`SUCCESS: ${gemCount} GEMS DETECTED. PREDICTION COMPLETE.`);
        predictBtn.disabled = false;
        predictBtn.style.opacity = '1';
    }

    predictBtn.addEventListener('click', handlePredict);
    
    // Initial setup
    createGrid();
    updateStatus('SYSTEM READY: AWAITING INPUT');
});
