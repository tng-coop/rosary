document.addEventListener('DOMContentLoaded', () => {
    let rosaryData;
    const rosaryContainer = document.getElementById('rosaryContainer');
    const languageSelect = document.getElementById('language');
    let currentStepIndex = 0;
    let currentLanguage = 'English';
    const availableLanguages = ['English', 'Japanese'];

    fetch('rosary.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load rosary.json: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            rosaryData = data;
            renderRosary();
        })
        .catch(error => {
            console.error('Error fetching the JSON data:', error);
        });

    function getTodayMystery() {
        if (!rosaryData || !rosaryData.rosary || !rosaryData.rosary.mysteries) {
            console.error('Mysteries data is missing or undefined');
            return null;
        }
        const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        const today = days[new Date().getDay()];
        return rosaryData.rosary.mysteries.find(mystery => mystery.days.includes(today));
    }

    function renderRosary() {
        // 1. Ensure rosary data is loaded
        if (!rosaryData || !rosaryData.rosary) {
            console.error('Rosary data is not available');
            return;
        }
    
        // 2. Remember which step was focused previously
        const previousStepIndex = currentStepIndex;
    
        // 3. Clear any existing content from the container
        rosaryContainer.innerHTML = '';
    
        // 4. Identify today’s Mystery (e.g., Glorious, Joyful, etc.)
        const todayMystery = getTodayMystery();
        if (!todayMystery) {
            console.error('No mystery found for today');
            return;
        }
    
        // 5. Show which Mystery will be prayed today
        const mysteryHeader = document.createElement('h2');
        mysteryHeader.textContent = `Today's Mystery: ${todayMystery.type}`;
        rosaryContainer.appendChild(mysteryHeader);
    
        // 6. Initialize a counter for each step displayed on the screen
        let stepCounter = 1;
    
        // 7. Add standard opening steps
        //    (skips certain steps that will be inserted later, or repeats)
        rosaryData.rosary.steps.forEach(step => {
            const skipList = [
                "Announce the First Mystery",
                "Ten Hail Marys",
                "Our Father",
                "Fatima Prayer",
                "Hail, Holy Queen",
                "Final Prayer",
                "Sign of the Cross (Ending)"
            ];
            
            // Skip if it belongs to the skipList or if it has "Repeat Steps" in its name
            if (skipList.includes(step.name) || step.name.includes("Repeat Steps")) return;
            
            // Special rule: do not repeat the "Glory Be" after 4 times in the opening steps
            if (step.name === "Glory Be" && stepCounter > 4) return;
    
            // Otherwise, add the step and increase the counter
            const textToDisplay = step.prayer ? step.prayer[currentLanguage] : step.details;
            addStep(`${stepCounter}. ${step.name}`, textToDisplay);
            stepCounter++;
        });
    
        // 8. Add the five Mysteries (decades) of the Rosary for today
        todayMystery.mysteries.forEach((mystery, index) => {
            // a) Announce each Mystery and provide its reflection
            addStep(`${stepCounter}. Mystery ${index + 1}: ${mystery.name}`, mystery.reflection[currentLanguage]);
            stepCounter++;
    
            // b) Our Father
            addStepFromJson("Our Father", stepCounter++);
    
            // c) Ten Hail Marys
            const hailMaryStep = rosaryData.rosary.steps.find(s => s.name === "Ten Hail Marys");
            if (hailMaryStep) {
                addStep(`${stepCounter}. ${hailMaryStep.name}`, hailMaryStep.prayer[currentLanguage]);
                stepCounter++;
            }
    
            // d) Glory Be
            addStepFromJson("Glory Be", stepCounter++);
    
            // e) Fatima Prayer
            addStepFromJson("Fatima Prayer", stepCounter++);
        });
    
        // 9. Conclude with the closing prayers
        addStepFromJson("Hail, Holy Queen", stepCounter++);
        addStepFromJson("Final Prayer", stepCounter++);
        addStepFromJson("Sign of the Cross (Ending)", stepCounter++);
    
    }
    

    function addStep(title, content) {
        const stepDiv = document.createElement('div');
        stepDiv.classList.add('step');
        stepDiv.setAttribute('tabindex', '0');
        const stepTitle = document.createElement('h3');
        stepTitle.textContent = title;
        stepDiv.appendChild(stepTitle);
        const stepContent = document.createElement('p');
        stepContent.textContent = content;
        stepDiv.appendChild(stepContent);
        rosaryContainer.appendChild(stepDiv);
    }

    function addStepFromJson(stepName, stepNumber) {
        const step = rosaryData.rosary.steps.find(s => s.name === stepName);
        if (step) {
            addStep(`${stepNumber}. ${step.name}`, step.prayer ? step.prayer[currentLanguage] : step.details);
        }
    }

    languageSelect.addEventListener('change', (event) => {
        currentLanguage = event.target.value;
        renderRosary();
    });

    document.addEventListener('keydown', (event) => {
        const steps = document.querySelectorAll('.step');
        if (event.key === 'ArrowDown' || event.key === 'n') {
            if (currentStepIndex < steps.length - 1) {
                currentStepIndex++;
                renderRosary();
                document.querySelectorAll('.step')[currentStepIndex].focus();
            }
        } else if (event.key === 'ArrowUp' || event.key === 'N') {
            if (currentStepIndex > 0) {
                currentStepIndex--;
                renderRosary();
                document.querySelectorAll('.step')[currentStepIndex].focus();
            }
        } else if (event.key.toUpperCase() === 'E') {
            currentLanguage = 'English';
            languageSelect.value = 'English';
            renderRosary();
        } else if (event.key.toUpperCase() === 'J') {
            currentLanguage = 'Japanese';
            languageSelect.value = 'Japanese';
            renderRosary();
        } else if (event.key.toUpperCase() === 'L') {
            if (availableLanguages.length > 0) {
                const currentIndex = availableLanguages.indexOf(currentLanguage);
                const nextIndex = (currentIndex + 1) % availableLanguages.length;
                currentLanguage = availableLanguages[nextIndex];
                languageSelect.value = currentLanguage;
                renderRosary();
            }
        }
    });
});
