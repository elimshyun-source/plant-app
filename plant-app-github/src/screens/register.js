// 2. 식물 등록 (3단계): 종류 검색 → 별명 → 햇빛 정도
import { getContent } from '../content/content.js';
import { addPlant, hasEmptySlot } from '../store.js';
import { icons } from '../components/parts.js';
import { esc, t, tPlain } from '../lib/text.js';

const NICKNAME_MAX = 15;
const LIGHTS = ['bright', 'normal', 'dark'];

// 이전 버튼으로 돌아가도 입력한 값이 남도록 등록이 끝날 때까지 기억한다.
let draft = newDraft();
function newDraft() {
  return { query: '', kind: null, nickname: '', light: null };
}

export function renderRegister(root, step) {
  if (!hasEmptySlot()) { location.replace('#/'); return; }
  if (step === 2 && !draft.kind) { location.replace('#/register/1'); return; }
  if (step === 3 && (!draft.kind || !draft.nickname.trim())) { location.replace('#/register/1'); return; }
  if (step === 1) renderKind(root);
  else if (step === 2) renderNickname(root);
  else renderLight(root);
}

/* ---------- 1단계: 종류 검색 ---------- */
function renderKind(root) {
  root.innerHTML = `
    <section class="register">
      <div class="screen-head"><h1 class="t-title">${t('register.kind.title')}</h1></div>
      <input class="field t-choice" type="text" enterkeyhint="search" autocomplete="off"
        placeholder="${esc(tPlain('register.kind.placeholder'))}" value="${esc(draft.query)}"
        aria-label="${esc(tPlain('register.kind.placeholder'))}">
      <div data-results></div>
      <div class="bottom-spacer"></div>
      <div class="bottom-bar">
        <button class="btn btn-primary" type="button" data-next>${t('register.next')}</button>
      </div>
    </section>`;

  const input = root.querySelector('input');
  const results = root.querySelector('[data-results]');
  const next = root.querySelector('[data-next]');

  const update = () => {
    const q = draft.query.trim();
    const plants = getContent().plants;
    if (!q) {
      draft.kind = null;
      results.innerHTML = `<p class="t-desc field-guide">${t('register.kind.guide')}</p>`;
    } else {
      const found = plants.filter((p) => p.name.includes(q));
      if (draft.kind && !found.some((p) => p.name === draft.kind)) draft.kind = null;
      if (found.length === 0) {
        const names = plants.map((p) => p.name).join(', ');
        results.innerHTML = `<div class="no-result">
          <p class="no-result-title">${t('register.kind.empty.title')}</p>
          <p class="t-desc">${t('register.kind.empty.guide', { '식물 이름들': names })}</p>
        </div>`;
      } else {
        results.innerHTML = `<div class="search-results"><ul class="choices" role="radiogroup">
          ${found.map((p) => `<li><button type="button" role="radio" class="choice t-choice"
              aria-checked="${p.name === draft.kind}" data-kind="${esc(p.name)}">
              <span>${highlight(p.name, q)}</span>${icons.check}</button></li>`).join('')}
        </ul></div>`;
      }
    }
    next.disabled = !draft.kind;
  };

  input.addEventListener('input', () => { draft.query = input.value; update(); });
  results.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-kind]');
    if (!btn) return;
    draft.kind = btn.dataset.kind;
    update();
  });
  next.addEventListener('click', () => { if (draft.kind) location.hash = '#/register/2'; });
  update();
}

/** 입력한 글자를 포인트 초록 + Bold로 */
function highlight(name, q) {
  const i = name.indexOf(q);
  if (i < 0) return esc(name);
  return `${esc(name.slice(0, i))}<b>${esc(q)}</b>${esc(name.slice(i + q.length))}`;
}

/* ---------- 2단계: 별명 ---------- */
function renderNickname(root) {
  root.innerHTML = `
    <section class="register">
      <div class="screen-head"><h1 class="t-title">${t('register.nickname.title')}</h1></div>
      <input class="field t-choice" type="text" maxlength="${NICKNAME_MAX}" autocomplete="off"
        value="${esc(draft.nickname)}" aria-label="${esc(tPlain('register.nickname.title'))}">
      <div class="bottom-spacer"></div>
      <div class="bottom-bar">
        <a class="btn btn-secondary" href="#/register/1">${t('register.prev')}</a>
        <button class="btn btn-primary" type="button" data-next>${t('register.next')}</button>
      </div>
    </section>`;

  const input = root.querySelector('input');
  const next = root.querySelector('[data-next]');
  let composing = false;

  // 15자를 넘으면 더 입력되지 않는다. (한글 조합 중에는 끝난 뒤에 자른다)
  const clamp = () => {
    const chars = Array.from(input.value);
    if (chars.length > NICKNAME_MAX) input.value = chars.slice(0, NICKNAME_MAX).join('');
    draft.nickname = input.value;
    next.disabled = !draft.nickname.trim();
  };
  input.addEventListener('compositionstart', () => { composing = true; });
  input.addEventListener('compositionend', () => { composing = false; clamp(); });
  input.addEventListener('input', () => {
    if (composing) { draft.nickname = input.value; next.disabled = !input.value.trim(); return; }
    clamp();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !composing && !next.disabled) next.click();
  });
  next.addEventListener('click', () => {
    clamp();
    if (draft.nickname.trim()) location.hash = '#/register/3';
  });
  clamp();
  input.focus();
}

/* ---------- 3단계: 햇빛 정도 ---------- */
function renderLight(root) {
  root.innerHTML = `
    <section class="register">
      <div class="screen-head"><h1 class="t-title">${t('register.light.title')}</h1></div>
      <ul class="choices" role="radiogroup">
        ${LIGHTS.map((key) => `<li><button type="button" role="radio" class="choice t-choice"
            aria-checked="${draft.light === key}" data-light="${key}">
            <span>${t(`register.light.${key}`)}</span>${icons.check}</button></li>`).join('')}
      </ul>
      <div class="bottom-spacer"></div>
      <div class="bottom-bar">
        <a class="btn btn-secondary" href="#/register/2">${t('register.prev')}</a>
        <button class="btn btn-primary" type="button" data-submit>${t('register.submit')}</button>
      </div>
    </section>`;

  const submit = root.querySelector('[data-submit]');
  const sync = () => {
    root.querySelectorAll('[data-light]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.light === draft.light)));
    submit.disabled = !draft.light;
  };
  root.querySelector('.choices').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-light]');
    if (!btn) return;
    draft.light = btn.dataset.light;
    sync();
  });
  submit.addEventListener('click', () => {
    if (!draft.light) return;
    addPlant({ kind: draft.kind, nickname: draft.nickname.trim(), light: draft.light });
    draft = newDraft();
    location.replace('#/');
  });
  sync();
}

/** 홈에서 더하기를 새로 눌렀을 때 지난 입력을 비운다. */
export function resetRegisterDraft() {
  draft = newDraft();
}
