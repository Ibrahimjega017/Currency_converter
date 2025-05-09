// Configuration
const API_KEY = 'e8b800ab4a3ce1dfe9b34a5d'; // Replace with your actual API key
const BASE_URL = 'https://v6.exchangerate-api.com/v6/';

// DOM Elements
const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const convertBtn = document.getElementById('convert-btn');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');
const loadingDiv = document.getElementById('loading');
const swapBtn = document.getElementById('swap-currencies');
const rateInfoDiv = document.getElementById('rate-info');

// Supported currencies (will be fetched from API)
let currencies = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        showLoading(true);
        currencies = await fetchSupportedCurrencies();
        
        if (currencies.length > 0) {
            populateCurrencyDropdowns();
            setDefaultCurrencies();
        } else {
            showError('No currencies available. Please try again later.');
        }
    } catch (error) {
        showError(`Failed to initialize: ${error.message}`);
    } finally {
        showLoading(false);
    }
});

// Fetch supported currencies from the API
async function fetchSupportedCurrencies() {
    const url = `${BASE_URL}${API_KEY}/codes`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Failed to fetch currency codes');
    }
    
    const data = await response.json();
    
    if (data.result === 'success') {
        return data.supported_codes.map(code => code[0]);
    } else {
        throw new Error(data['error-type'] || 'Unknown error from API');
    }
}

// Populate the currency dropdowns
function populateCurrencyDropdowns() {
    fromCurrencySelect.innerHTML = '';
    toCurrencySelect.innerHTML = '';
    
    currencies.forEach(currency => {
        const option1 = document.createElement('option');
        option1.value = currency;
        option1.textContent = currency;
        fromCurrencySelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = currency;
        option2.textContent = currency;
        toCurrencySelect.appendChild(option2);
    });
}

// Set default currencies
function setDefaultCurrencies() {
    if (currencies.includes('USD')) {
        fromCurrencySelect.value = 'USD';
    }
    if (currencies.includes('EUR')) {
        toCurrencySelect.value = 'EUR';
    }
}

// Convert button click handler
convertBtn.addEventListener('click', async () => {
    try {
        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        
        // Validate input
        if (isNaN(amount) || amount <= 0) {
            showError('Please enter a valid amount greater than 0');
            return;
        }
        
        if (!fromCurrency || !toCurrency) {
            showError('Please select both currencies');
            return;
        }
        
        showLoading(true);
        hideResult();
        hideError();
        
        if (fromCurrency === toCurrency) {
            showResult(`${amount} ${fromCurrency} = ${amount} ${toCurrency}`);
            showRateInfo(`1 ${fromCurrency} = 1 ${toCurrency}`);
            return;
        }
        
        const conversionRate = await getConversionRate(fromCurrency, toCurrency);
        const convertedAmount = (amount * conversionRate).toFixed(2);
        
        showResult(`${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`);
        showRateInfo(`1 ${fromCurrency} = ${conversionRate.toFixed(6)} ${toCurrency}`);
    } catch (error) {
        showError(`Conversion failed: ${error.message}`);
    } finally {
        showLoading(false);
    }
});

// Get conversion rate from API
async function getConversionRate(from, to) {
    const url = `${BASE_URL}${API_KEY}/pair/${from}/${to}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Failed to fetch exchange rate');
    }
    
    const data = await response.json();
    
    if (data.result === 'success') {
        return data.conversion_rate;
    } else {
        throw new Error(data['error-type'] || 'Unknown error from API');
    }
}

// Swap currencies
swapBtn.addEventListener('click', () => {
    const temp = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = temp;
});

// Helper functions for UI updates
function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
    convertBtn.disabled = show;
}

function showResult(message) {
    resultDiv.textContent = message;
    resultDiv.style.display = 'block';
}

function hideResult() {
    resultDiv.style.display = 'none';
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    errorDiv.style.display = 'none';
}

function showRateInfo(message) {
    rateInfoDiv.textContent = message;
}