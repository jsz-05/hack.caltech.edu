// Google Form IDs
const SPONSOR_FORM_ID = '1FAIpQLScaXKKqWv3xH95D01U6Kcp6-kWObQMms3LS3NSfGSl_Ohop3A';
const JUDGE_FORM_ID = '1FAIpQLSfAk9FEG4FRKXO4A-rtqRN32xl9ZSW32fpWcjA8hGjIK3C41A';

// Form field mappings
const sponsorFormFields = {
    'name': 'entry.1972753818',
    'company': 'entry.298471248',
    'email': 'entry.1403727519',
    'inquiry': 'entry.1550975964'
};

const judgeFormFields = {
    'name': 'entry.1393572412',
    'company': 'entry.1417270478',
    'email': 'entry.695580584',
    'experience': 'entry.1475204026'
};

// Modal functions
function openModal() {
    document.getElementById('application-modal').style.display = 'block';
    document.getElementById('role-selection').style.display = 'block';
    document.getElementById('sponsor-form').style.display = 'none';
    document.getElementById('judge-form').style.display = 'none';
}

function closeModal() {
    document.getElementById('application-modal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('application-modal');
    if (event.target == modal) {
        closeModal();
    }
}

function showForm(role) {
    document.getElementById('role-selection').style.display = 'none';
    document.getElementById(`${role}-form`).style.display = 'block';
}

async function submitForm(event, role) {
    event.preventDefault();
    
    const form = document.getElementById(`${role}-form`);
    const submitButton = form.querySelector('.submit-btn');
    submitButton.classList.add('loading');
    
    const formData = new FormData(form);
    const formId = role === 'sponsor' ? SPONSOR_FORM_ID : JUDGE_FORM_ID;
    const fieldMappings = role === 'sponsor' ? sponsorFormFields : judgeFormFields;
    
    // Create an object with mapped field names
    let formEntries = {};
    formData.forEach((value, key) => {
        formEntries[fieldMappings[key]] = value;
    });

    try {
        // Send POST request to Google Forms
        const response = await fetch(`https://docs.google.com/forms/d/e/${formId}/formResponse`, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(formEntries),
        });

        // Show success message
        submitButton.classList.remove('loading');
        alert('Application submitted successfully!');
        form.reset();
        closeModal();
    } catch (error) {
        console.error('Error submitting form:', error);
        submitButton.classList.remove('loading');
        alert('There was an error submitting your application. Please try again.');
    }
}