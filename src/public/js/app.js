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
  const button = event.target.closest('.js-remove-order-item');

  if (!button) {
    return;
  }

  button.closest('.row')?.remove();
});

document.addEventListener('change', (event) => {
  const themeToggle = event.target.closest('[data-theme-toggle]');

  if (themeToggle) {
    applyTheme(themeToggle.checked ? 'dark' : 'light');
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
