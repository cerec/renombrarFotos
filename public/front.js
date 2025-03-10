document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.querySelector('textarea');
    const fileInput = document.getElementById('fileInput');
    const nextStepButton = document.getElementById('nextstep');
    let array1 = [];

    // Function to validate "Product_Color" pattern
    function isValidProductColor(input) {
        const pattern = /^[A-Za-z0-9]+_[A-Za-z0-9]{3}$/;
        return pattern.test(input);
    }

    // Function to check if array1 has at least one valid entry 
    function checkArray1() {
        if (array1.length > 0) {
            nextStepButton.style.display = 'block';
        }
        else {
            nextStepButton.style.display = 'none';
        }
    }

    // Event listener for textarea input
    textarea.addEventListener('input', () => {
        const lines = textarea.value.split('\n');
        array1 = lines.filter(line => isValidProductColor(line.trim()));
        console.log('Array1:', array1);
        checkArray1();
    });

    // Event listener for file input
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                const validEntries = jsonData.map(row => row[0]).filter(cell => isValidProductColor(cell));

                textarea.value = validEntries.join('\n');
                const event = new Event('input', { bubbles: true });
                textarea.dispatchEvent(event)
                fileInput.value = '';
            };
            reader.readAsArrayBuffer(file);
        }
    });

    // Event listener for "Next Step" button
    nextStepButton.addEventListener('click', () => {
        document.body.innerHTML = `
            <div class="container" id="step2">
                <h1>Select Directory</h1>
                <button id="selectDirectory">Select Directory</button>
                <button id="renamePhotos">Rename Photos</button>
            </div>
        `;
        // Reinitialize event listeners for the new content
        initializeStep2();
    });

    // Function to initialize event listeners for step 2
    function initializeStep2() {
        const selectDirectoryButton = document.getElementById('selectDirectory');
        const renamePhotosButton = document.getElementById('renamePhotos');
        let array2 = [];

        // Event listener for directory selection
        selectDirectoryButton.addEventListener('click', async () => {
            try {
                const directoryHandle = await window.showDirectoryPicker();
                for await (const entry of directoryHandle.values()) {
                    if (entry.kind === 'file' && !entry.name.endsWith('FLATSQUARE.jpg')) {
                        array2.push(entry.name);
                    }
                }
                console.log('Array2:', array2);
            } catch (error) {
                console.error('Error selecting directory:', error);
            }
        });

        // Function to compare and sort filenames
        function compareAndSort(array1, array2) {
            let sortedFiles = [];
            array1.forEach(item => {
                let matches = array2.filter(file => file.startsWith(item));
                matches.sort((a, b) => {
                    // Custom sorting logic
                    let order = ['MOD', 'ED', 'FLATFRONT', 'FLATBACK'];
                    let aIndex = order.findIndex(o => a.includes(o));
                    let bIndex = order.findIndex(o => b.includes(o));
                    return aIndex - bIndex;
                });
                sortedFiles.push(...matches);
            });
            return sortedFiles;
        }

        // Event listener for renaming photos
        renamePhotosButton.addEventListener('click', () => {
            const sortedFiles = compareAndSort(array1, array2);
            console.log('Sorted Files:', sortedFiles);
            // Implement renaming logic here
        });
    }
});




