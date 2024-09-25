document.addEventListener('DOMContentLoaded', () => {
    const savedExplanationsContainer = document.getElementById('saved-explanations');

    function displaySavedExplanations(explanations) {
        savedExplanationsContainer.innerHTML = '';
        explanations.forEach((exp, index) => {
            const expElement = document.createElement('div');
            expElement.className = 'saved-explanation';
            expElement.innerHTML = `
                <h3>Highlighted Text</h3>
                <p>${exp.highlighted}</p>
                <h3>Explanation</h3>
                <p>${exp.explained}</p>
                <p><small>${new Date(exp.date).toLocaleString()}</small></p>
                <button class="delete-explanation" data-index="${index}">Delete</button>
            `;
            savedExplanationsContainer.appendChild(expElement);
        });

        // Add delete functionality
        document.querySelectorAll('.delete-explanation').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                chrome.storage.sync.get('savedExplanations', (result) => {
                    const updatedExplanations = result.savedExplanations.filter((_, i) => i !== index);
                    chrome.storage.sync.set({ savedExplanations: updatedExplanations }, () => {
                        displaySavedExplanations(updatedExplanations);
                    });
                });
            });
        });
    }

    chrome.storage.sync.get('savedExplanations', (result) => {
        const savedExplanations = result.savedExplanations || [];
        displaySavedExplanations(savedExplanations);
    });
});