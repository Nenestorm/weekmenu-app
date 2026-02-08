// Toast notificatie component

/**
 * Toon een toast notificatie.
 * @param {string} message - De tekst
 * @param {'info'|'success'|'error'|'warning'} type - Type notificatie
 * @param {number} duration - Duur in ms (standaard 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    // Trigger slide-in animatie
    requestAnimationFrame(() => {
        toast.classList.add('toast--visible');
    });

    // Verwijder na duur
    setTimeout(() => {
        toast.classList.remove('toast--visible');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        }, { once: true });
        // Fallback: verwijder na 500ms als transitionend niet vuurt
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 500);
    }, duration);
}
