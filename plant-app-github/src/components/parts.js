// 공통 부품: 화분, 식물 일러스트, 아이콘, 상태 표시, 선반.
import { getContent } from '../content/content.js';
import { esc, shortName, t } from '../lib/text.js';

/** 화분: design-system.md "화분" 값으로 코드로 그린다. */
export function pot(scale = 1) {
  const w = 76, h = 52;
  const rimH = 14, bodyTop = 64, bodyBottom = 50, bodyH = 38;
  const x1 = (w - bodyTop) / 2, x2 = x1 + bodyTop;
  const x4 = (w - bodyBottom) / 2, x3 = x4 + bodyBottom;
  return `<svg class="pot" width="${w * scale}" height="${h * scale}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <path d="M${x1} ${rimH} L${x2} ${rimH} L${x3} ${rimH + bodyH} L${x4} ${rimH + bodyH} Z" fill="var(--color-pot-body)"/>
    <rect x="0" y="0" width="${w}" height="${rimH}" rx="4" fill="var(--color-pot-rim)"/>
  </svg>`;
}

/** 식물 일러스트. 아랫면 위치는 design-system.md 표(화분 아랫면에서 위로)를 따른다. */
export function plantArt(kind, scale = 1) {
  const art = getContent().art[kind];
  if (!art) return '';
  return `<img class="plant-art" src="${esc(art.file)}" alt="" draggable="false"
    style="height:${art.height * scale}px; bottom:${art.bottom * scale}px">`;
}

export const icons = {
  gear: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  check: `<svg class="check" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--color-green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 10.5 L8.5 14.5 L15.5 6"/></svg>`,
  plus: `<svg width="12" height="12" viewBox="0 0 12 12" stroke="var(--color-green)" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 1 V11 M1 6 H11"/></svg>`,
  minus: `<svg width="12" height="12" viewBox="0 0 12 12" stroke="var(--color-green)" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M1 6 H11"/></svg>`,
};

/** 상태 표시: 점 + 글자. 상태가 없으면 아무것도 그리지 않는다. */
export function statusBadge(status) {
  if (status !== 'ok' && status !== 'help') return '';
  const key = status === 'ok' ? 'status.ok' : 'status.help';
  return `<span class="status"><span class="dot ${status}" aria-hidden="true"></span><span class="t-desc">${t(key)}</span></span>`;
}

/**
 * 선반 3줄 × 칸 3개.
 * mode: 'home' | 'edit'
 */
export function shelves(slots, mode, { canAdd }) {
  let html = '';
  for (let row = 0; row < 3; row++) {
    let cells = '';
    let labels = '';
    for (let col = 0; col < 3; col++) {
      const i = row * 3 + col;
      const p = slots[i];
      if (p) {
        const label = `${esc(p.nickname)}, ${esc(p.kind)}`;
        if (mode === 'home') {
          cells += `<a class="stage" href="#/plant/${esc(p.id)}" data-slot="${i}" aria-label="${label}">${pot()}${plantArt(p.kind)}</a>`;
        } else {
          cells += `<div class="stage" data-slot="${i}" data-has-plant>${pot()}${plantArt(p.kind)}
            <button class="round-btn minus" type="button" data-remove="${esc(p.id)}" aria-label="${t('a11y.remove', { nickname: p.nickname })}"><span class="circle">${icons.minus}</span></button></div>`;
        }
        labels += `<div class="label-cell" data-slot="${i}">
          <span class="t-name">${esc(shortName(p.nickname))}</span>
          <span class="t-kind">${esc(p.kind)}</span>
          ${statusBadge(p.status)}
        </div>`;
      } else {
        const plus = canAdd && mode === 'home'
          ? `<a class="round-btn plus" href="#/register/1" aria-label="${t('a11y.add')}"><span class="circle">${icons.plus}</span></a>`
          : '';
        cells += `<div class="stage" data-slot="${i}">${pot()}${plus}</div>`;
        labels += `<div class="label-cell" data-slot="${i}"></div>`;
      }
    }
    html += `<div class="shelf-row">
      <div class="shelf-cells">${cells}</div>
      <div class="shelf-bar"></div>
      <div class="shelf-labels">${labels}</div>
    </div>`;
  }
  return html;
}
