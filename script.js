let user = 'lulu';

function setUser(selectedUser) {
    user = selectedUser;
    document.getElementById('calculator-heading').innerText = `Payment Calculator for ${user.charAt(0).toUpperCase() + user.slice(1)}`;
}

const API_KEY = 'your_api_key_here'; // Replace with your actual API key
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/NOK`;

async function fetchExchangeRate() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (data.result === 'success') {
            return data.conversion_rates.HUF;
        } else {
            throw new Error('Failed to fetch exchange rate');
        }
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        return 38.17; // Fallback conversion rate in case of error
    }
}

async function calculatePayment() {
    const day = document.getElementById('day').value;
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const taxPercentage = parseFloat(document.getElementById('tax').value) || 13;
    const breakTaken = document.getElementById('break').checked;

    const conversionRate = await fetchExchangeRate();

    if (!startTime || !endTime || isNaN(taxPercentage)) {
        alert('Please fill all fields correctly.');
        return;
    }

    let start = parseTime(startTime);
    let end = parseTime(endTime);

    if (end < start) {
        end += 24 * 60; // Adjust for times crossing midnight
    }

    let totalMinutes = end - start;
    if (breakTaken) {
        totalMinutes -= 30; // Subtract 30 minutes for break if taken
    }

    const totalHours = totalMinutes / 60;
    const baseRate = user === 'krisz' ? 175.37 : 169; // Base hourly rate in NOK
    const additionalBenefits = calculateAdditionalBenefits(day, start, end);
    const grossPayNOK = totalHours * baseRate + additionalBenefits.totalNOK;
    const taxAmountNOK = (grossPayNOK * taxPercentage) / 100;
    const netPayNOK = grossPayNOK - taxAmountNOK;

    const grossPayHUF = grossPayNOK * conversionRate;
    const taxAmountHUF = taxAmountNOK * conversionRate;
    const netPayHUF = netPayNOK * conversionRate;

    document.getElementById('hours-worked').innerText = totalHours.toFixed(2);
    document.getElementById('gross-pay').innerText = `${grossPayNOK.toFixed(2)} kr - ${grossPayHUF.toFixed(2)} huf`;
    document.getElementById('tax-amount').innerText = `${taxAmountNOK.toFixed(2)} kr - ${taxAmountHUF.toFixed(2)} huf`;
    document.getElementById('net-pay').innerText = `${netPayNOK.toFixed(2)} kr - ${netPayHUF.toFixed(2)} huf`;

    document.getElementById('evenings-additional').innerText = `${additionalBenefits.eveningNOK.toFixed(2)} kr - ${(additionalBenefits.eveningNOK * conversionRate).toFixed(2)} huf`;
    document.getElementById('nights-additional').innerText = `${additionalBenefits.nightNOK.toFixed(2)} kr - ${(additionalBenefits.nightNOK * conversionRate).toFixed(2)} huf`;
    document.getElementById('saturday-additional').innerText = `${additionalBenefits.saturdayNOK.toFixed(2)} kr - ${(additionalBenefits.saturdayNOK * conversionRate).toFixed(2)} huf`;
    document.getElementById('sunday-additional').innerText = `${additionalBenefits.sundayNOK.toFixed(2)} kr - ${(additionalBenefits.sundayNOK * conversionRate).toFixed(2)} huf`;
}

function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function calculateAdditionalBenefits(day, start, end) {
    let eveningNOK = 0;
    let nightNOK = 0;
    let saturdayNOK = 0;
    let sundayNOK = 0;

    // Convert time ranges to minutes
    const eveningStart = 18 * 60;
    const eveningEnd = 21 * 60 - 1;
    const lateEveningStart = 21 * 60;
    const lateEveningEnd = 24 * 60 - 1;
    const nightStart = 0;
    const nightEnd = 5 * 60 - 1;
    const saturdayStart = 14 * 60;
    const saturdayEnd = 24 * 60 - 1;
    const sundayStart = 5 * 60;
    const sundayEnd = 24 * 60 - 1;

    // Calculate additional rates based on time ranges
    for (let minute = start; minute < end; minute++) {
        const hour = minute % (24 * 60);

        if (user === 'krisz') {
            if (day !== 'saturday' && day !== 'sunday' && hour >= eveningStart && hour <= lateEveningEnd) {
                eveningNOK += 23 / 60;
            }
            if (hour >= nightStart && hour <= nightEnd) {
                nightNOK += 45 / 60;
            }
            if (day === 'saturday' && hour >= saturdayStart && hour <= saturdayEnd) {
                saturdayNOK += 38 / 60;
            }
            if (day === 'sunday' && hour >= sundayStart && hour <= sundayEnd) {
                sundayNOK += 38 / 60;
            }
        } else if (user === 'lulu') {
            if (day !== 'saturday' && day !== 'sunday' && hour >= eveningStart && hour <= eveningEnd) {
                eveningNOK += 22 / 60;
            }
            if (day !== 'saturday' && day !== 'sunday' && hour >= lateEveningStart && hour <= lateEveningEnd) {
                nightNOK += 45 / 60;
            }
            if (day === 'sunday' && hour >= nightEnd && hour <= sundayEnd) {
                sundayNOK += 279 / 60;
            }
        }
    }

    const totalNOK = eveningNOK + nightNOK + saturdayNOK + sundayNOK;

    return {
        eveningNOK,
        nightNOK,
        saturdayNOK,
        sundayNOK,
        totalNOK
    };
}

function clearForm() {
    document.getElementById('payment-form').reset();
    document.getElementById('hours-worked').innerText = '';
    document.getElementById('gross-pay').innerText = '';
    document.getElementById('tax-amount').innerText = '';
    document.getElementById('net-pay').innerText = '';
    document.getElementById('evenings-additional').innerText = '';
    document.getElementById('nights-additional').innerText = '';
    document.getElementById('saturday-additional').innerText = '';
    document.getElementById('sunday-additional').innerText = '';
}
