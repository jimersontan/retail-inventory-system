/**
 * Format currency values
 */
export const formatCurrency = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(2);
};

/**
 * Format date to readable format
 */
export const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return '—';
    }
};

/**
 * Format date as relative time (e.g., "2 days ago")
 */
export const formatRelativeDate = (dateString) => {
    if (!dateString) return '—';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d ago`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months}mo ago`;
        const years = Math.floor(months / 12);
        return `${years}y ago`;
    } catch (e) {
        return '—';
    }
};

/**
 * Format string as label (capitalize, replace underscores)
 */
export const formatAsLabel = (str) => {
    if (!str) return '';
    return str
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Format percentage
 */
export const formatPercent = (value, decimals = 2) => {
    if (!value) return '0%';
    return parseFloat(value).toFixed(decimals) + '%';
};
