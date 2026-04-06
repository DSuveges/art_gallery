import { t } from './i18n.js';

const START_YEAR = 2022;

export function renderFooter() {
  const el = document.getElementById('copyright');
  if (!el) return;

  const currentYear = new Date().getFullYear();
  const years = currentYear > START_YEAR ? `${START_YEAR}–${currentYear}` : `${START_YEAR}`;
  el.textContent = t('copyright').replace('{years}', years);

  document.addEventListener('langchange', () => {
    el.textContent = t('copyright').replace('{years}', years);
  });
}
