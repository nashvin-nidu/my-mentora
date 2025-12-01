document.addEventListener('DOMContentLoaded', () => {
    const videoForm = document.getElementById('videoForm');
    const segmentsList = document.getElementById('segmentsList');
    const addSegmentBtn = document.getElementById('addSegmentBtn');
    const jobIdInput = document.getElementById('jobId');
    const refreshJobIdBtn = document.getElementById('refreshJobId');
    const segmentTemplate = document.getElementById('segmentTemplate');
    const generateBtn = document.getElementById('generateBtn');
    const btnText = generateBtn.querySelector('.btn-text');
    const spinner = generateBtn.querySelector('.spinner');
    const responseArea = document.getElementById('responseArea');
    const responseOutput = document.getElementById('responseOutput');

    // Generate initial Job ID
    generateJobId();

    // Add initial segment
    addSegment();

    // Event Listeners
    refreshJobIdBtn.addEventListener('click', generateJobId);
    addSegmentBtn.addEventListener('click', addSegment);
    videoForm.addEventListener('submit', handleSubmit);

    function generateJobId() {
        const uniqueId = 'job-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        jobIdInput.value = uniqueId;
    }

    function addSegment() {
        const clone = segmentTemplate.content.cloneNode(true);
        const segmentItem = clone.querySelector('.segment-item');
        
        // Setup remove button
        const removeBtn = segmentItem.querySelector('.remove-segment-btn');
        removeBtn.addEventListener('click', () => {
            if (segmentsList.children.length > 1) {
                segmentItem.remove();
                updateSegmentNumbers();
            } else {
                alert('You must have at least one segment.');
            }
        });

        // Setup image preview
        const urlInput = segmentItem.querySelector('.segment-image-url');
        const previewContainer = segmentItem.querySelector('.segment-preview');
        const previewImg = segmentItem.querySelector('.image-preview');

        urlInput.addEventListener('change', () => {
            if (urlInput.value) {
                previewImg.src = urlInput.value;
                previewContainer.classList.remove('hidden');
                previewImg.onerror = () => {
                    previewContainer.classList.add('hidden');
                    // Optional: show error state
                };
            } else {
                previewContainer.classList.add('hidden');
            }
        });

        segmentsList.appendChild(segmentItem);
        updateSegmentNumbers();
    }

    function updateSegmentNumbers() {
        const segments = segmentsList.querySelectorAll('.segment-item');
        segments.forEach((segment, index) => {
            segment.querySelector('.segment-number').textContent = `Segment #${index + 1}`;
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        setLoading(true);
        responseArea.classList.add('hidden');

        const segments = [];
        const segmentItems = segmentsList.querySelectorAll('.segment-item');
        
        segmentItems.forEach(item => {
            const imageUrl = item.querySelector('.segment-image-url').value;
            const duration = parseFloat(item.querySelector('.segment-duration').value);
            
            if (imageUrl) {
                const segment = { imageUrl };
                if (!isNaN(duration)) {
                    segment.duration = duration;
                }
                segments.push(segment);
            }
        });

        const payload = {
            jobId: jobIdInput.value,
            segments: segments
        };

        try {
            console.log('Sending payload:', payload);
            
            const response = await fetch('https://slide-ffmpeg-production.up.railway.app/generate-video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json(); // Assuming JSON response, adjust if text
            
            responseOutput.textContent = JSON.stringify(data, null, 2);
            responseArea.classList.remove('hidden');
            
            // Scroll to response
            responseArea.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error:', error);
            responseOutput.textContent = 'Error: ' + error.message;
            responseArea.classList.remove('hidden');
        } finally {
            setLoading(false);
        }
    }

    function setLoading(isLoading) {
        if (isLoading) {
            generateBtn.disabled = true;
            btnText.classList.add('hidden');
            spinner.classList.remove('hidden');
        } else {
            generateBtn.disabled = false;
            btnText.classList.remove('hidden');
            spinner.classList.add('hidden');
        }
    }
});
