// 1. 홈 (내 식물)
import { getSlots, hasEmptySlot } from '../store.js';
import { icons, shelves } from '../components/parts.js';
import { t } from '../lib/text.js';

export function renderHome(root) {
  root.innerHTML = `
    <section class="home">
      <div class="shelf-head screen-head">
        <div class="title-row">
          <h1 class="t-title">${t('home.title')}</h1>
          <a class="icon-button" href="#/edit" aria-label="${t('a11y.settings')}">${icons.gear}</a>
        </div>
      </div>
      ${shelves(getSlots(), 'home', { canAdd: hasEmptySlot() })}
    </section>`;
}
