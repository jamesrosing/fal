/**
* Validate an email address
*/
export const isValidEmail = (email: string): boolean => {
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return emailRegex.test(email);
};

/**
* Validate a URL
*/
export const isValidUrl = (url: string): boolean => {
try {
new URL(url);
return true;
} catch (error) {
return false;
}
};

/**
* Validate a phone number (US format)
*/
export const isValidPhoneNumber = (phone: string): boolean => {
// Basic US phone validation - accepts formats like:
// (123) 456-7890, 123-456-7890, 1234567890
const phoneRegex = /^(\+?1[-\s]?)?(\(?\d{3}\)?[-\s]?)?\d{3}[-\s]?\d{4}$/;
return phoneRegex.test(phone);
};

/**
* Format a phone number to (XXX) XXX-XXXX
*/
export const formatPhoneNumber = (phone: string): string => {
// Remove all non-digit characters
const cleaned = phone.replace(/\D/g, '');

// Check if the input is valid
if (cleaned.length !== 10) {
return phone; // Return original if not valid
}

// Format as (XXX) XXX-XXXX
return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
};

/**
* Validate a password (min 8 chars, at least 1 letter and 1 number)
*/
export const isValidPassword = (password: string): boolean => {
return password.length >= 8 &&
/[A-Za-z]/.test(password) &&
/\d/.test(password);
};

/**
* Check if a string is a valid JSON
*/
export const isValidJson = (json: string): boolean => {
try {
JSON.parse(json);
return true;
} catch (error) {
return false;
}
};

/**
* Sanitize a string for use in HTML
*/
export const sanitizeString = (str: string): string => {
return str
.replace(/&/g, '&amp;')
.replace(/</g, '&lt;')
.replace(/>/g, '&gt;')
.replace(/"/g, '&quot;')
.replace(/'/g, '&#039;');
};