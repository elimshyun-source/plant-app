// 1-1. 홈 편집: 끌어서 자리 바꾸기, 빼기 버튼으로 삭제 확인 화면 열기
import { getSlots, swapSlots } from '../store.js';
import { shelves } from '../components/parts.js';
import { t } from '../lib/text.js';

const DRAG_START = 6; // 이만큼 움직여야 끌기로 본다(누르기와 구분)

export function renderEdit(root) {
  root.innerHTML = `
    <section class="edit">
      <div class="shelf-head screen-head">
        <h1 class="t-title">${t('edit.title')}</h1>
        <p class="t-desc">${t('edit.guide')}</p>
      </div>
      <div class="shelves">${shelves(getSlots(), 'edit', { canAdd: false })}</div>
      <div class="bottom-spacer"></div>
      <div class="bottom-bar">
        <a class="btn btn-primary" href="#/">${t('edit.done')}</a>
      </div>
    </section>`;

  const area = root.querySelector('.shelves');

  area.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove]');
    if (btn) location.hash = `#/delete/${btn.dataset.remove}`;
  });

  area.addEventListener('pointerdown', (e) => {
    if (e.target.closest('[data-remove]')) return;
    const stage = e.target.closest('.stage[data-has-plant]');
    if (!stage || e.button > 0) return;
    startDrag(e, stage, () => renderEdit(root));
  });
}

function slotAt(x, y) {
  const el = document.elementFromPoint(x, y);
  const cell = el && el.closest('.edit [data-slot]');
  return cell ? Number(cell.dataset.slot) : null;
}

function startDrag(down, stage, done) {
  const from = Number(stage.dataset.slot);
  const img = stage.querySelector('.plant-art');
  let ghost = null;

  const move = (e) => {
    if (!ghost) {
      if (Math.hypot(e.clientX - down.clientX, e.clientY - down.clientY) < DRAG_START) return;
      ghost = img.cloneNode(true);
      ghost.className = 'drag-ghost';
      ghost.style.bottom = '';
      document.body.appendChild(ghost);
      stage.classList.add('dragging');
    }
    e.preventDefault();
    ghost.style.left = `${e.clientX}px`;
    ghost.style.top = `${e.clientY}px`;
  };

  const end = (e) => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', end);
    window.removeEventListener('pointercancel', end);
    if (!ghost) return;
    ghost.remove();
    stage.classList.remove('dragging');
    const to = e.type === 'pointerup' ? slotAt(e.clientX, e.clientY) : null;
    if (to != null && to !== from) swapSlots(from, to);
    done();
  };

  window.addEventListener('pointermove', move, { passive: false });
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
}
