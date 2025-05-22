import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

/**
* Format a date string into a readable format
*/
export const formatDate = (
dateString: string | Date,
formatString: string = 'MMM d, yyyy'
): string => {
try {
const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;

if (!isValid(date)) {
return 'Invalid date';
}

return format(date, formatString);
} catch (error) {
console.error('Error formatting date:', error);
return 'Invalid date';
}
};

/**
* Format a date as relative time (e.g., "2 days ago")
*/
export const formatRelativeTime = (dateString: string | Date): string => {
try {
const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;

if (!isValid(date)) {
return 'Invalid date';
}

return formatDistanceToNow(date, { addSuffix: true });
} catch (error) {
console.error('Error formatting relative time:', error);
return 'Invalid date';
}
};

/**
* Format a date for an article or blog post
*/
export const formatArticleDate = (dateString: string | Date): string => {
return formatDate(dateString, 'MMMM d, yyyy');
};

/**
* Format a date and time
*/
export const formatDateTime = (dateString: string | Date): string => {
return formatDate(dateString, 'MMM d, yyyy h:mm a');
};

/**
* Get a timestamp for filenames or IDs
*/
export const getTimestamp = (): string => {
return format(new Date(), 'yyyyMMdd_HHmmss');
};