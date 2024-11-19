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

    // Render the Rosary steps with today's mystery highlighted
    function renderRosary() {
        if (!rosaryData || !rosaryData.rosary) {
            console.error('Rosary data is not available');
            return;
        }

        rosaryContainer.innerHTML = '';
        const todayMystery = getTodayMystery();

        if (todayMystery) {
            // Display today's mystery type and its prayers
            const mysteryHeader = document.createElement('h2');
            mysteryHeader.textContent = `Today's Mystery: ${todayMystery.type}`;
            rosaryContainer.appendChild(mysteryHeader);

            todayMystery.mysteries.forEach((mystery, i) => {
                const mysteryDetail = document.createElement('p');
                mysteryDetail.textContent = `${i + 1}. ${mystery}`;
                rosaryContainer.appendChild(mysteryDetail);
            });
        } else {
            console.error('No mystery found for today');
        }

        // Render the steps of the rosary
        rosaryData.rosary.steps.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.classList.add('step');
            if (index === currentStepIndex) {
                stepDiv.classList.add('highlight');
            }
            stepDiv.setAttribute('tabindex', '0');

            const stepTitle = document.createElement('h3');
            stepTitle.textContent = `${step.step}. ${step.name}`;
            stepDiv.appendChild(stepTitle);

            if (step.prayer && step.prayer[currentLanguage]) {
                const prayerText = document.createElement('p');
                prayerText.textContent = step.prayer[currentLanguage];
                stepDiv.appendChild(prayerText);
            }

            if (step.details) {
                const detailsText = document.createElement('p');
                detailsText.textContent = step.details;
                stepDiv.appendChild(detailsText);
            }

            rosaryContainer.appendChild(stepDiv);
        });
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
        }
    });
});
