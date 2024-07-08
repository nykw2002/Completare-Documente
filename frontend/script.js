document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('dropzone');
    const documentA = document.getElementById('document-a').querySelector('.document-content');
    const documentB = document.getElementById('document-b').querySelector('.document-content');
    const addFieldButton = document.getElementById('add-field');
    const agentInstructions = document.getElementById('agent-instructions');
    const legendItems = document.getElementById('legend-items');
    const savedInstruction1 = document.getElementById('saved-instruction-1');

    let uploadedFiles = [];

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.backgroundColor = '#555';
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.style.backgroundColor = '#444';
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.backgroundColor = '#444';
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    addFieldButton.addEventListener('click', addLegendField);

    savedInstruction1.addEventListener('click', () => {
        agentInstructions.value = "These are the saved instructions for project 1.";
    });

    function handleFiles(files) {
        uploadedFiles = Array.from(files);
        displayDocuments();
        processDocuments();
    }

    function displayDocuments() {
        if (uploadedFiles.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                documentA.textContent = e.target.result;
            };
            reader.readAsText(uploadedFiles[0]);
        }
        if (uploadedFiles.length > 1) {
            const reader = new FileReader();
            reader.onload = (e) => {
                documentB.textContent = e.target.result;
            };
            reader.readAsText(uploadedFiles[1]);
        }
    }

    async function processDocuments() {
        const formData = new FormData();
        uploadedFiles.forEach((file, index) => {
            formData.append(`file${index}`, file);
        });
        formData.append('instructions', agentInstructions.value);

        try {
            const response = await fetch('http://localhost:8000/process', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            console.log(result);
            highlightDocuments(result.extracted_fields);
        } catch (error) {
            console.error('Error processing documents:', error);
        }
    }

    function highlightDocuments(extractedFields) {
        const documents = [documentA, documentB];
        documents.forEach((doc, index) => {
            let content = doc.textContent;
            Object.entries(extractedFields).forEach(([field, value]) => {
                const color = getLegendColor(field);
                content = content.replace(new RegExp(value, 'g'), `<span style="background-color: ${color};">${value}</span>`);
            });
            doc.innerHTML = content;
        });
    }

    function addLegendField() {
        const newField = document.createElement('div');
        newField.className = 'legend-item';
        const color = getRandomColor();
        newField.innerHTML = `
            <span class="legend-color" style="background-color: ${color};"></span>
            <span class="legend-text">
                <input type="text" placeholder="Enter field name">
            </span>
        `;
        legendItems.insertBefore(newField, addFieldButton);
    }

    function getRandomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }

    function getLegendColor(field) {
        const legendItem = Array.from(legendItems.getElementsByClassName('legend-item')).find(item => 
            item.querySelector('.legend-text').textContent.includes(field)
        );
        return legendItem ? legendItem.querySelector('.legend-color').style.backgroundColor : getRandomColor();
    }
});