import { t } from './i18n.js';

const START_YEAR  = 2022;
const EMAIL       = 'hajnalneia@gmail.com';

export function renderFooter() {
  const copyright  = document.getElementById('copyright');
  const enquiries  = document.getElementById('enquiries');
  if (!copyright && !enquiries) return;

  const currentYear = new Date().getFullYear();
  const years = currentYear > START_YEAR ? `${START_YEAR}–${currentYear}` : `${START_YEAR}`;

  function update() {
    if (copyright) copyright.textContent = t('copyright').replace('{years}', years);
    if (enquiries) enquiries.innerHTML =
      `${t('enquiries')} <a href="mailto:${EMAIL}">${EMAIL}</a>`;
  }

  update();
  document.addEventListener('langchange', update);
}
