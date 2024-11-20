document.addEventListener('DOMContentLoaded', () => {
    let rosaryData;
    const rosaryContainer = document.getElementById('rosaryContainer');
    const languageSelect = document.getElementById('language');
    let currentStepIndex = 0;
    let currentLanguage = 'English';

    // Fetch the JSON data from the rosary.json file
    fetch('rosary.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load rosary.json: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            rosaryData = data;
            renderRosary(); // Render the rosary after the data is loaded
        })
        .catch(error => {
            console.error('Error fetching the JSON data:', error);
        });

    // Helper function to detect the current day and get the mystery for today
    function getTodayMystery() {
        if (!rosaryData || !rosaryData.rosary || !rosaryData.rosary.mysteries) {
            console.error('Mysteries data is missing or undefined');
            return null;
        }
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = days[new Date().getDay()];

        // Find the mystery for today
        return rosaryData.rosary.mysteries.find(mystery => mystery.days.includes(today));
    }
    function renderRosary() {
        if (!rosaryData || !rosaryData.rosary) {
            console.error('Rosary data is not available');
            return;
        }
    
        rosaryContainer.innerHTML = '';
        const todayMystery = getTodayMystery();
        let stepCounter = 1; // Initialize step counter for sequential numbering
    
        if (todayMystery) {
            // Display today's mystery type
            const mysteryHeader = document.createElement('h2');
            mysteryHeader.textContent = `Today's Mystery: ${todayMystery.type}`;
            rosaryContainer.appendChild(mysteryHeader);
        } else {
            console.error('No mystery found for today');
            return;
        }
    
        // Render initial steps (Sign of the Cross, Apostles' Creed, Three Hail Marys, Glory Be)
        rosaryData.rosary.steps.forEach((step) => {
            if (
                step.name !== "Announce the First Mystery" &&
                step.name !== "Ten Hail Marys" &&
                step.name !== "Our Father" &&
                step.name !== "Fatima Prayer" &&
                step.name !== "Hail, Holy Queen" &&
                step.name !== "Final Prayer" &&
                step.name !== "Sign of the Cross (Ending)" &&
                !step.name.includes("Repeat Steps")
            ) {
                // Only allow one "Glory Be" before the first mystery
                if (step.name === "Glory Be" && stepCounter > 4) return;
    
                addStep(`${stepCounter}. ${step.name}`, step.prayer ? step.prayer[currentLanguage] : step.details);
                stepCounter++; // Increment the step counter
            }
        });
    
        // Render the five mysteries in full
        todayMystery.mysteries.forEach((mystery, i) => {
            addStep(`${stepCounter}. Mystery ${i + 1}: ${mystery}`, `Reflect on the ${mystery}`);
            stepCounter++;
    
            // Render "Our Father"
            addStepFromJson("Our Father", stepCounter++);
    
            // Render "Ten Hail Marys"
            const hailMaryStep = rosaryData.rosary.steps.find(s => s.name === "Ten Hail Marys");
            if (hailMaryStep) {
                addStep(`${stepCounter}. ${hailMaryStep.name}`, hailMaryStep.prayer[currentLanguage]);
                stepCounter++;
            }
    
            // Render "Glory Be"
            addStepFromJson("Glory Be", stepCounter++);
    
            // Render "Fatima Prayer"
            addStepFromJson("Fatima Prayer", stepCounter++);
        });
    
        // Render final prayers (Hail, Holy Queen, Final Prayer, Sign of the Cross (Ending))
        addStepFromJson("Hail, Holy Queen", stepCounter++);
        addStepFromJson("Final Prayer", stepCounter++);
        addStepFromJson("Sign of the Cross (Ending)", stepCounter++);
    }
    
    
    
    // Helper function to add a step to the container
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

// Modified helper function to add a step by name and step number
function addStepFromJson(stepName, stepNumber) {
    const step = rosaryData.rosary.steps.find(s => s.name === stepName);
    if (step) {
        addStep(`${stepNumber}. ${step.name}`, step.prayer ? step.prayer[currentLanguage] : step.details);
    }
}
    // Language change event for dropdown
    languageSelect.addEventListener('change', (event) => {
        currentLanguage = event.target.value;
        renderRosary();
    });

    // Keyboard navigation for highlighting and language change
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
            if (currentStepIndex < rosaryData.rosary.steps.length - 1) {
                currentStepIndex++;
                renderRosary();
                document.querySelectorAll('.step')[currentStepIndex].focus();
            }
        } else if (event.key === 'ArrowUp') {
            if (currentStepIndex > 0) {
                currentStepIndex--;
                renderRosary();
                document.querySelectorAll('.step')[currentStepIndex].focus();
            }
        } else if (event.key.toUpperCase() === 'E') {
            currentLanguage = 'English';
            languageSelect.value = 'English'; // Update the dropdown for visual indication
            renderRosary();
        } else if (event.key.toUpperCase() === 'J') {
            currentLanguage = 'Japanese';
            languageSelect.value = 'Japanese'; // Update the dropdown for visual indication
            renderRosary();
        } else if (event.key === 'n') {
            // Move to the next step
            if (currentStepIndex < rosaryData.rosary.steps.length - 1) {
                currentStepIndex++;
                renderRosary();
                document.querySelectorAll('.step')[currentStepIndex].focus();
            }
        } else if (event.key === 'N') {
            // Move to the previous step
            if (currentStepIndex > 0) {
                currentStepIndex--;
                renderRosary();
                document.querySelectorAll('.step')[currentStepIndex].focus();
            }
        }
    });
});
