// Global variable for property count
let propertyCount = 0;

// Function to format currency as user types
function formatCurrency(input) {
    let value = input.value.replace(/[^\d]/g, '');
    if (value.length > 0) {
        value = parseInt(value).toLocaleString('en-US');
    }
    input.value = value;
    
    validatePropertyValue();
    checkFormCompletion();
}

// Function to format numbers with commas
function formatNumber(num) {
    return num.toLocaleString('en-US');
}

// Function to toggle partner status visibility
function togglePartnerStatus() {
    const purchaseType = getSelectedValue('purchaseType');
    const partnerStatusDiv = document.querySelector('.partner-status');
    
    if (purchaseType === 'jointMarried' || purchaseType === 'jointNotMarried') {
        partnerStatusDiv.classList.remove('hidden');
    } else {
        partnerStatusDiv.classList.add('hidden');
    }
    
    checkFormCompletion();
}

// Function to increment property counter
function incrementCounter() {
    if (propertyCount < 10) {
        propertyCount++;
        document.getElementById('propertyCount').textContent = propertyCount;
        checkFormCompletion();
    }
}

// Function to decrement property counter
function decrementCounter() {
    if (propertyCount > 0) {
        propertyCount--;
        document.getElementById('propertyCount').textContent = propertyCount;
        checkFormCompletion();
    }
}

// Function to check if form is filled out and update button color
function checkFormCompletion() {
    const propertyValue = document.getElementById('propertyValue').value.trim();
    const calculateBtn = document.getElementById('calculateBtn');
    const value = parseInt(propertyValue.replace(/,/g, ''));
    
    if (propertyValue && !isNaN(value) && value >= 100000) {
        calculateBtn.style.backgroundColor = '#052D4A';
        calculateBtn.disabled = false;
    } else {
        calculateBtn.style.backgroundColor = '#5A90AF';
        calculateBtn.disabled = true;
    }
}

// Function to calculate Buyer's Stamp Duty (BSD)
function calculateBSD(propertyValue) {
    let bsd = 0;

    if (propertyValue <= 180000) {
        return propertyValue * 0.01;
    }
    bsd += 180000 * 0.01;

    if (propertyValue <= 360000) {
        return bsd + (propertyValue - 180000) * 0.02;
    }
    bsd += 180000 * 0.02;

    if (propertyValue <= 1000000) {
        return bsd + (propertyValue - 360000) * 0.03;
    }
    bsd += 640000 * 0.03;

    if (propertyValue <= 1500000) {
        return bsd + (propertyValue - 1000000) * 0.04;
    }
    bsd += 500000 * 0.04;

    if (propertyValue <= 3000000) {
        return bsd + (propertyValue - 1500000) * 0.05;
    }
    bsd += 1500000 * 0.05;

    bsd += (propertyValue - 3000000) * 0.06;

    return bsd;
}

// Function to calculate Additional Buyer's Stamp Duty (ABSD)
function calculateABSD(propertyValue) {
    const purchaseType = getSelectedValue('purchaseType');
    const yourStatus = getSelectedValue('yourStatus');
    let absdRate = 0;
    
    if (purchaseType === 'single') {
        if (yourStatus === 'foreigner') {
            absdRate = 0.60;
        } else if (yourStatus === 'permanentResident') {
            if (propertyCount === 0) {
                absdRate = 0.05;
            } else if (propertyCount === 1) {
                absdRate = 0.30;
            } else {
                absdRate = 0.35;
            }
        } else {
            if (propertyCount === 0) {
                absdRate = 0;
            } else if (propertyCount === 1) {
                absdRate = 0.20;
            } else {
                absdRate = 0.30;
            }
        }
    } else {
        const partnerStatus = getSelectedValue('partnerStatus');
        
        if (purchaseType === 'jointMarried' && 
            ((yourStatus === 'singaporean' && (partnerStatus === 'permanentResident' || partnerStatus === 'foreigner')) ||
             (partnerStatus === 'singaporean' && (yourStatus === 'permanentResident' || yourStatus === 'foreigner')))) {
            if (propertyCount === 0) {
                absdRate = 0;
            } else {
                if (yourStatus === 'foreigner' || partnerStatus === 'foreigner') {
                    absdRate = 0.60;
                } else if (yourStatus === 'permanentResident' || partnerStatus === 'permanentResident') {
                    if (propertyCount === 1) {
                        absdRate = 0.30;
                    } else {
                        absdRate = 0.35;
                    }
                }
            }
        }
        else if (yourStatus === 'foreigner' || partnerStatus === 'foreigner') {
            absdRate = 0.60;
        } 
        else if (yourStatus === 'permanentResident' || partnerStatus === 'permanentResident') {
            if (propertyCount === 0) {
                absdRate = 0.05;
            } else if (propertyCount === 1) {
                absdRate = 0.30;
            } else {
                absdRate = 0.35;
            }
        } 
        else {
            if (propertyCount === 0) {
                absdRate = 0;
            } else if (propertyCount === 1) {
                absdRate = 0.20;
            } else {
                absdRate = 0.30;
            }
        }
    }
    
    document.getElementById('summaryABSDRate').textContent = (absdRate * 100) + '%';
    return propertyValue * absdRate;
}

// Function to validate property value
function validatePropertyValue() {
    const propertyValueInput = document.getElementById('propertyValue');
    const errorMessage = document.getElementById('propertyValueError');
    const value = parseInt(propertyValueInput.value.replace(/,/g, ''));
    
    if (isNaN(value) || value < 100000) {
        errorMessage.classList.remove('hidden');
        propertyValueInput.classList.add('error');
        return false;
    } else {
        errorMessage.classList.add('hidden');
        propertyValueInput.classList.remove('error');
        return true;
    }
}

function getSelectedValue(name) {
    const radios = document.getElementsByName(name);
    for (const radio of radios) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return null;
}

// Main function to calculate stamp duty
function calculateStampDuty() {
    const propertyValue = parseFloat(document.getElementById('propertyValue').value.replace(/,/g, '')) || 0;
    const purchaseType = getSelectedValue('purchaseType');
    const yourStatus = getSelectedValue('yourStatus');
    const partnerStatus = getSelectedValue('partnerStatus');
    const propertyCount = parseInt(document.getElementById('propertyCount').textContent) || 0;

    if (!validatePropertyValue()) {
        return;
    }
    
    const bsd = calculateBSD(propertyValue);
    const absd = calculateABSD(propertyValue);
    const totalDuty = bsd + absd;
    
    document.getElementById('initialMessage').classList.add('hidden');
    document.getElementById('summaryResult').classList.remove('hidden');
    document.getElementById('calculateBtn').classList.add('hidden');
    document.getElementById('calculateAgainBtn').classList.remove('hidden');
    
    updateSummary(propertyValue, bsd, absd, totalDuty);
}

function updateSummary(propertyValue, bsd, absd, totalDuty) {
    document.getElementById('summaryPropertyValue').textContent = 'SGD ' + formatNumber(propertyValue);
    document.getElementById('summaryBSD').textContent = 'SGD ' + formatNumber(Math.round(bsd));
    document.getElementById('summaryABSD').textContent = 'SGD ' + formatNumber(Math.round(absd));
    document.getElementById('totalDutyAmount').textContent = 'SGD ' + formatNumber(Math.round(totalDuty));
}

// Function to reset the calculator UI but keep form values
function resetCalculator() {
    document.getElementById('initialMessage').classList.remove('hidden');
    document.getElementById('summaryResult').classList.add('hidden');
    document.getElementById('calculateBtn').classList.remove('hidden');
    document.getElementById('calculateAgainBtn').classList.add('hidden');
    
    checkFormCompletion();
}

// Initialize event listeners when the page loads
window.addEventListener('DOMContentLoaded', function() {
    const propertyValueInput = document.getElementById('propertyValue');
    const purchaseTypeRadios = document.getElementsByName('purchaseType');
    const yourStatusRadios = document.getElementsByName('yourStatus');
    const partnerStatusRadios = document.getElementsByName('partnerStatus');

    if (propertyValueInput) {
        propertyValueInput.addEventListener('input', checkFormCompletion);
    }

    if (purchaseTypeRadios.length > 0) {
        purchaseTypeRadios.forEach(radio => radio.addEventListener('change', checkFormCompletion));
    }

    if (yourStatusRadios.length > 0) {
        yourStatusRadios.forEach(radio => radio.addEventListener('change', checkFormCompletion));
    }

    if (partnerStatusRadios.length > 0) {
        partnerStatusRadios.forEach(radio => radio.addEventListener('change', checkFormCompletion));
    }

    checkFormCompletion();
});
