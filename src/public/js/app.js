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

document.addEventListener('click', (event) => {
  const removeButton = event.target.closest('.js-remove-order-item');

  if (removeButton) {
    removeButton.closest('.order-item-row')?.remove();
    return;
  }

  const removeManualButton = event.target.closest('.js-remove-manual-order-item');

  if (removeManualButton) {
    removeManualButton.closest('.manual-order-item-row')?.remove();
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
  const pdfForm = event.target.closest('.js-generate-pdf-form');

  if (pdfForm) {
    const button = pdfForm.querySelector('button[type="submit"]');

    if (button) {
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
