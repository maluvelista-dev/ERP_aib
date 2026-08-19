const THEME_STORAGE_KEY = 'ordersweb.theme';

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    return;
  }
}

function getPreferredTheme() {
  const storedTheme = getStoredTheme();

  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function updateThemeControls(theme) {
  document.querySelectorAll('[data-theme-toggle]').forEach((toggle) => {
    toggle.checked = theme === 'dark';
  });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  storeTheme(theme);
  updateThemeControls(theme);
}

applyTheme(getPreferredTheme());

function resetPdfButtons() {
  document.querySelectorAll('.js-generate-pdf-form button[type="submit"]').forEach((button) => {
    button.disabled = false;
    button.textContent = button.dataset.idleLabel || 'Gerar PDF';
    button.removeAttribute('aria-busy');
  });
}

function syncQuantityFields(row) {
  const unitInput = row.querySelector('.js-unit-quantity');
  const boxInput = row.querySelector('.js-box-quantity');
  const productInput = row.querySelector('.js-order-product');
  if (!unitInput || !boxInput) return;

  const unitQuantity = Number(unitInput.value || 0);
  const boxQuantity = Number(boxInput.value || 0);
  const hasBoth = unitQuantity > 0 && boxQuantity > 0;
  const hasProduct = Boolean(productInput?.value);
  const message = hasBoth
    ? 'Informe unidades ou caixas, nunca os dois no mesmo produto.'
    : hasProduct && unitQuantity <= 0 && boxQuantity <= 0
      ? 'Informe a quantidade em unidades ou em caixas.'
      : '';

  unitInput.setCustomValidity(message);
  boxInput.setCustomValidity(message);
  unitInput.readOnly = !hasBoth && boxQuantity > 0;
  boxInput.readOnly = !hasBoth && unitQuantity > 0;
  unitInput.classList.toggle('bg-body-secondary', unitInput.readOnly);
  boxInput.classList.toggle('bg-body-secondary', boxInput.readOnly);
}

function syncAllQuantityFields() {
  document.querySelectorAll('.order-item-row').forEach(syncQuantityFields);
}

function resetOrderForms() {
  document.querySelectorAll('.js-order-form').forEach((form) => {
    delete form.dataset.submitting;
    const button = form.querySelector('button[type="submit"]');

    if (button) {
      button.disabled = false;
      button.textContent = button.dataset.idleLabel || 'Salvar pedido';
      button.removeAttribute('aria-busy');
    }
  });
}

const orderDraftEndpoint = '/orders/drafts';
let orderDraftTimer;

function readLocalOrderDraft(key) {
  if (!key) return null;
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function writeLocalOrderDraft(form) {
  const key = form.dataset.draftKey;
  if (!key) return null;
  const draft = {
    entries: Array.from(new FormData(form).entries()),
    savedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(key, JSON.stringify(draft));
    return draft;
  } catch {
    return draft;
  }
}

function removeLocalOrderDraft(key) {
  if (!key) return;
  try {
    localStorage.removeItem(key);
  } catch {
    return;
  }
}

async function syncOrderDraft(draft, statusElement = null) {
  if (!draft?.entries?.length) return false;
  if (statusElement) statusElement.textContent = 'Salvando rascunho...';

  try {
    const response = await fetch(orderDraftEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ entries: draft.entries })
    });
    if (!response.ok) throw new Error('draft_save_failed');
    if (statusElement) statusElement.textContent = 'Rascunho salvo.';
    return true;
  } catch {
    if (statusElement) statusElement.textContent = 'Sem conexão. Rascunho salvo neste aparelho.';
    return false;
  }
}

function scheduleOrderDraftSave(form) {
  if (form.dataset.draftEnabled !== 'true' || form.dataset.submitting === 'true') return;
  const draft = writeLocalOrderDraft(form);
  const statusElement = form.querySelector('.js-draft-status');
  if (statusElement) statusElement.textContent = 'Alterações salvas neste aparelho.';
  clearTimeout(orderDraftTimer);
  orderDraftTimer = setTimeout(() => syncOrderDraft(draft, statusElement), 800);
}

async function syncLocalDraftBeforeResume(link) {
  const draft = readLocalOrderDraft(link.dataset.draftKey);
  if (draft) await syncOrderDraft(draft);
  window.location.assign(link.href);
}

async function initializeOrderDrafts() {
  const created = new URLSearchParams(window.location.search).get('created') === '1';
  document.querySelectorAll('.js-resume-order-draft').forEach((link) => {
    if (created) removeLocalOrderDraft(link.dataset.draftKey);
    if (readLocalOrderDraft(link.dataset.draftKey)) link.classList.remove('d-none');
  });

  const form = document.querySelector('.js-order-form[data-draft-enabled="true"]');
  if (!form) return;
  const localDraft = readLocalOrderDraft(form.dataset.draftKey);
  if (form.dataset.resumingDraft === 'true' && form.dataset.draftSynced !== 'true' && localDraft) {
    const synced = await syncOrderDraft(localDraft, form.querySelector('.js-draft-status'));
    if (synced) window.location.replace('/orders/new?resumeDraft=1&synced=1');
  }
}

window.addEventListener('pageshow', () => {
  resetPdfButtons();
  resetOrderForms();
  syncAllQuantityFields();
});

document.addEventListener('htmx:afterSwap', syncAllQuantityFields);
document.addEventListener('htmx:afterSwap', (event) => {
  const form = event.target.closest?.('.js-order-form') || document.querySelector('.js-order-form');
  if (form) scheduleOrderDraftSave(form);
});

document.addEventListener('input', (event) => {
  const quantityInput = event.target.closest('.js-unit-quantity, .js-box-quantity');
  if (quantityInput) syncQuantityFields(quantityInput.closest('.order-item-row'));
  const orderForm = event.target.closest('.js-order-form');
  if (orderForm) scheduleOrderDraftSave(orderForm);
});

document.addEventListener('change', (event) => {
  const productInput = event.target.closest('.js-order-product');
  if (productInput) syncQuantityFields(productInput.closest('.order-item-row'));
  const orderForm = event.target.closest('.js-order-form');
  if (orderForm) scheduleOrderDraftSave(orderForm);
});

document.addEventListener('click', (event) => {
  const removeButton = event.target.closest('.js-remove-order-item');

  if (removeButton) {
    const form = removeButton.closest('.js-order-form');
    removeButton.closest('.order-item-row')?.remove();
    if (form) scheduleOrderDraftSave(form);
    return;
  }

  const removeManualButton = event.target.closest('.js-remove-manual-order-item');

  if (removeManualButton) {
    const form = removeManualButton.closest('.js-order-form');
    removeManualButton.closest('.manual-order-item-row')?.remove();
    if (form) scheduleOrderDraftSave(form);
    return;
  }

  const priceButton = event.target.closest('.js-toggle-custom-price');

  if (priceButton) {
    const panel = priceButton.closest('.order-item-row')?.querySelector('.js-custom-price-panel');
    const willOpen = panel?.classList.contains('d-none');

    panel?.classList.toggle('d-none', !willOpen);
    priceButton.setAttribute('aria-expanded', String(willOpen));
    priceButton.innerHTML = willOpen ? 'Usar pre&ccedil;o original' : 'Personalizar pre&ccedil;o';

    if (!willOpen && panel) {
      panel.querySelectorAll('input').forEach((input) => {
        input.value = '';
      });
    }
    const form = priceButton.closest('.js-order-form');
    if (form) scheduleOrderDraftSave(form);
    return;
  }

  const resumeDraftLink = event.target.closest('.js-resume-order-draft');
  if (resumeDraftLink) {
    event.preventDefault();
    syncLocalDraftBeforeResume(resumeDraftLink);
  }
});

document.addEventListener('change', (event) => {
  const themeToggle = event.target.closest('[data-theme-toggle]');

  if (themeToggle) {
    applyTheme(themeToggle.checked ? 'dark' : 'light');
    return;
  }

  const productSelect = event.target.closest('.js-order-product');

  if (productSelect) {
    const row = productSelect.closest('.order-item-row');
    const option = productSelect.selectedOptions[0];
    const unitPrice = option?.dataset.unitPrice;
    const boxPrice = option?.dataset.boxPrice;
    const money = (value) => Number(value).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    row?.querySelector('.js-original-unit-price')?.replaceChildren(
      document.createTextNode(unitPrice ? `Preço original: R$ ${money(unitPrice)}` : 'Preço original não informado.')
    );
    row?.querySelector('.js-original-box-price')?.replaceChildren(
      document.createTextNode(boxPrice ? `Preço original: R$ ${money(boxPrice)}` : 'Preço por caixa não informado.')
    );
    return;
  }

  const toggle = event.target.closest('.js-customer-active-toggle');

  if (!toggle) {
    return;
  }

  if (toggle.dataset.storageKey) {
    localStorage.setItem(toggle.dataset.storageKey, String(toggle.checked));
  }

  toggle.closest('form')?.requestSubmit();
});

document.addEventListener('submit', (event) => {
  const discardDraftForm = event.target.closest('.js-discard-order-draft');
  if (discardDraftForm) {
    removeLocalOrderDraft(discardDraftForm.dataset.draftKey);
    return;
  }

  const clearHistoryForm = event.target.closest('.js-clear-order-history-form');

  if (clearHistoryForm) {
    const scope = clearHistoryForm.dataset.historyScope || 'dos pedidos';
    const confirmed = window.confirm(`Limpar o histórico ${scope}? Esta ação não pode ser desfeita.`);

    if (!confirmed) {
      event.preventDefault();
    }

    return;
  }

  const orderForm = event.target.closest('.js-order-form');

  if (orderForm) {
    if (orderForm.dataset.submitting === 'true') {
      event.preventDefault();
      return;
    }

    orderForm.dataset.submitting = 'true';
    const button = orderForm.querySelector('button[type="submit"]');

    if (button) {
      button.dataset.idleLabel = button.textContent.trim();
      button.disabled = true;
      button.textContent = 'Salvando pedido...';
      button.setAttribute('aria-busy', 'true');
    }

    return;
  }

  const pdfForm = event.target.closest('.js-generate-pdf-form');

  if (pdfForm) {
    const button = pdfForm.querySelector('button[type="submit"]');

    if (button) {
      button.dataset.idleLabel = button.textContent.trim();
      button.disabled = true;
      button.textContent = 'Gerando PDF...';
      button.setAttribute('aria-busy', 'true');
    }

    return;
  }

  const deleteOrderForm = event.target.closest('.js-delete-order-form');

  if (!deleteOrderForm) {
    const deleteCustomerForm = event.target.closest('.js-delete-customer-form');

    if (!deleteCustomerForm) {
      return;
    }

    const customerName = deleteCustomerForm.dataset.customerName || 'cliente';
    const confirmedCustomer = window.confirm(`Excluir definitivamente ${customerName}?`);

    if (!confirmedCustomer) {
      event.preventDefault();
    }

    return;
  }

  const orderNumber = deleteOrderForm.dataset.orderNumber || '';
  const confirmed = window.confirm(`Excluir definitivamente o pedido ${orderNumber}?`);

  if (!confirmed) {
    event.preventDefault();
  }
});

window.addEventListener('online', () => {
  const form = document.querySelector('.js-order-form[data-draft-enabled="true"]');
  if (form) syncOrderDraft(writeLocalOrderDraft(form), form.querySelector('.js-draft-status'));
});

initializeOrderDrafts();
