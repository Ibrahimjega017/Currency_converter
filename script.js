// Configuration
const API_KEY = 'e8b800ab4a3ce1dfe9b34a5d'; // Replace with your actual API key
const BASE_URL = 'https://v6.exchangerate-api.com/v6/';
const DEFAULT_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'NGN', 'CAD'];

// Currency symbols map
const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    NGN: '₦',
    JPY: '¥',
    CAD: '$'
};

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

// Number formatting function
function formatNumber(num) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
    }).format(num);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        showLoading(true);
        const currencies = await fetchSupportedCurrencies();
        
        if (currencies.length > 0) {
            populateCurrencyDropdowns(currencies);
            setDefaultCurrencies(currencies);
        } else {
            showError('No currencies available. Using default currencies.');
            populateCurrencyDropdowns(DEFAULT_CURRENCIES);
            setDefaultCurrencies(DEFAULT_CURRENCIES);
        }
    } catch (error) {
        showError(`Failed to initialize: ${error.message}`);
        populateCurrencyDropdowns(DEFAULT_CURRENCIES);
        setDefaultCurrencies(DEFAULT_CURRENCIES);
    } finally {
        showLoading(false);
    }
});

// Fetch supported currencies
async function fetchSupportedCurrencies() {
    try {
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
    } catch (error) {
        console.error('Error fetching currencies:', error);
        return DEFAULT_CURRENCIES;
    }
}

// Populate dropdowns
function populateCurrencyDropdowns(currencies) {
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

// Set defaults
function setDefaultCurrencies(currencies) {
    if (currencies.includes('USD')) {
        fromCurrencySelect.value = 'USD';
    }
    if (currencies.includes('NGN')) {
        toCurrencySelect.value = 'NGN';
    }
}

// Conversion handler
convertBtn.addEventListener('click', async () => {
    try {
        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        
        if (isNaN(amount) {
            showError('Please enter a valid number');
            return;
        }
        
        if (amount <= 0) {
            showError('Amount must be greater than 0');
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
            showResult(amount, fromCurrency, toCurrency, amount);
            showRateInfo(fromCurrency, toCurrency, 1, 'Current rate');
            return;
        }
        
        const { rate, time } = await getConversionRate(fromCurrency, toCurrency);
        const convertedAmount = amount * rate;
        
        showResult(amount, fromCurrency, toCurrency, convertedAmount);
        showRateInfo(fromCurrency, toCurrency, rate, time);
    } catch (error) {
        showError(`Conversion failed: ${error.message}`);
    } finally {
        showLoading(false);
    }
});

// Get exchange rate
async function getConversionRate(from, to) {
    const url = `${BASE_URL}${API_KEY}/pair/${from}/${to}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Failed to fetch exchange rate');
    }
    
    const data = await response.json();
    
    if (data.result === 'success') {
        return {
            rate: data.conversion_rate,
            time: data.time_last_update_utc || new Date().toUTCString()
        };
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

// Display result
function showResult(amount, fromCurrency, toCurrency, convertedAmount) {
    const fromSymbol = currencySymbols[fromCurrency] || fromCurrency;
    const toSymbol = currencySymbols[toCurrency] || toCurrency;
    
    resultDiv.innerHTML = `
        <p>${fromSymbol}${formatNumber(amount)} ${fromCurrency} = ${toSymbol}${formatNumber(convertedAmount)} ${toCurrency}</p>
    `;
    resultDiv.style.display = 'block';
}

// Display rate info
function showRateInfo(fromCurrency, toCurrency, rate, time) {
    rateInfoDiv.innerHTML = `
        <p>1 ${fromCurrency} = ${formatNumber(rate)} ${toCurrency}</p>
        <p class="update-time">Rates updated: ${time}</p>
    `;
}

// UI helpers
function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
    convertBtn.disabled = show;
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
