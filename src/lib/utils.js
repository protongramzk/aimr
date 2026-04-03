// utils.js

/**
 * Copy text ke clipboard
 * @param {string} text 
 */
export function copyToClipboard(text) {
    if (!navigator.clipboard) {
        // fallback kalau browser lama
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed'; // biar nggak scroll
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            alert('Copied!');
        } catch (err) {
            alert('Copy failed!');
        }
        document.body.removeChild(textarea);
    } else {
        navigator.clipboard.writeText(text)
            .then(() => {
                alert('Copied!');
            })
            .catch(() => {
                alert('Copy failed!');
            });
    }
}
