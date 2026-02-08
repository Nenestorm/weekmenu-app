// Modal dialog component

const overlay = () => document.getElementById('modal-overlay');

/**
 * Toon een modal dialog.
 * @param {Object} config
 * @param {string} config.title - Titel van de modal
 * @param {string} config.body - HTML content van de body
 * @param {Function} config.onConfirm - Callback bij bevestiging
 * @param {string} [config.confirmText='OK'] - Tekst op de bevestigknop
 * @param {string} [config.cancelText='Annuleren'] - Tekst op de annuleerknop
 * @param {boolean} [config.danger=false] - Maak bevestigknop rood
 */
export function showModal({ title, body, onConfirm, confirmText = 'OK', cancelText = 'Annuleren', danger = false }) {
    const el = overlay();
    if (!el) return;

    const btnClass = danger ? 'btn btn-danger' : 'btn btn-primary';

    el.innerHTML = `
        <div class="modal">
            <div class="modal__header">
                <h3>${title}</h3>
            </div>
            <div class="modal__body">${body}</div>
            <div class="modal__footer">
                <button class="btn btn-ghost modal__cancel">${cancelText}</button>
                <button class="${btnClass} modal__confirm">${confirmText}</button>
            </div>
        </div>
    `;

    el.classList.remove('hidden');

    // Event listeners
    el.querySelector('.modal__cancel').addEventListener('click', hideModal);
    el.querySelector('.modal__confirm').addEventListener('click', () => {
        onConfirm();
        hideModal();
    });

    // Sluit bij klikken buiten de modal
    el.addEventListener('click', (e) => {
        if (e.target === el) hideModal();
    }, { once: true });

    // Focus op de bevestigknop
    el.querySelector('.modal__confirm').focus();
}

/**
 * Verberg de modal.
 */
export function hideModal() {
    const el = overlay();
    if (el) {
        el.classList.add('hidden');
        el.innerHTML = '';
    }
}
