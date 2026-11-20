// 5. 해결책: 식물 카드 → 지금 모습 → 이유 → 해야 할 일
// 6. 막다른 화면: 해결책이 없거나 "여기에 없어요"를 골랐을 때
import { findPlant, setResult } from '../store.js';
import { findSolution, todoFor } from '../content/solutions.js';
import { getFlow, levelFor, questionPath } from '../flow.js';
import { plantArt, pot, statusBadge } from '../components/parts.js';
import { esc, t, tPlain } from '../lib/text.js';
import { getContent } from '../content/content.js';

const DETAIL_SCALE = 1.75; // 상세 화면은 홈의 1.75배 (design-system.md)

export function renderResult(root, plantId) {
  const plant = findPlant(plantId);
  if (!plant) { location.replace('#/'); return; }
  const f = getFlow(plantId);
  // 새로고침 등으로 고른 내용이 없으면 증상 고르기부터 다시
  if (!f.symptom) { location.replace(`#/plant/${plantId}`); return; }
  if (f.symptom === 'none') { location.replace(`#/plant/${plantId}/deadend`); return; }

  // 모든 질문에 답했는지 확인 (주소를 직접 열었을 때 대비)
  const path = questionPath(f, plant);
  if (path.some((id) => f.answers[id] == null)) { location.replace(`#/plant/${plantId}`); return; }

  const sol = findSolution({
    symptom: f.symptom,
    answers: f.answers,
    kind: plant.kind,
    lightLabel: tPlain(`register.light.${plant.light}`),
  });
  if (!sol) { location.replace(`#/plant/${plantId}/deadend`); return; }

  // 상태는 식물에 저장해서 홈에도 보여준다
  const level = levelFor(f);
  setResult(plantId, level, sol.id);

  const { todo, extra } = todoFor(sol, plant.kind);

  document.body.classList.add('bg-soft');
  root.innerHTML = `
    <section class="result">
      <header class="top-bar">
        <a class="back" href="#/" aria-label="${t('a11y.back')}">
          <svg width="10" height="19" viewBox="0 0 10 19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 1 L1 9.5 L9 18"/></svg>
        </a>
        <h1 class="t-title">${esc(plant.nickname)}</h1>
      </header>

      <div class="plant-card" style="--pot-bottom:${cardPotBottom()}px">
        <div class="card-stage">${pot(DETAIL_SCALE)}${plantArt(plant.kind, DETAIL_SCALE)}</div>
        <p class="t-name card-name">${esc(plant.nickname)}</p>
        <p class="t-kind card-kind">${esc(plant.kind)}</p>
        <div class="card-status">${statusBadge(level)}</div>
      </div>

      ${sol.draft ? `<p class="t-desc unsure">${t('solution.unsure')}</p>` : ''}

      <div class="sections">
        ${section(t('solution.now'), esc(sol.now))}
        ${section(t('solution.reason'), esc(sol.reason))}
        ${section(t('solution.todo'), esc(todo) + (extra ? `<br>${esc(extra)}` : ''))}
      </div>
    </section>`;
}

/**
 * 식물 카드의 화분 아랫면 위치 = 위 여백 16 + 가장 키 큰 식물의 높이(×1.75).
 * 식물마다 화분 자리가 달라지지 않게 모든 식물 중 가장 큰 것에 맞춘다(design-system.md).
 */
const CARD_TOP_GAP = 16;
function cardPotBottom() {
  const arts = Object.values(getContent().art);
  const tallest = Math.max(...arts.map((a) => (a.height + a.bottom) * DETAIL_SCALE));
  return Math.ceil(CARD_TOP_GAP + tallest);
}

function section(title, body) {
  return `<section class="sol-section">
    <h2 class="t-section">${title}</h2>
    <p class="t-body">${body}</p>
  </section>`;
}

export function renderDeadend(root, plantId) {
  // 안내가 없는 조합은 상태 자리를 비워 둔다(design-system.md "상태 표시").
  // 지난번에 본 상태가 남아 있으면 사용자가 그 상태로 오해할 수 있어서 지운다.
  // 단, "여기에 없어요"로 온 경우는 증상 고르기에서 이미 "괜찮아요"로 저장했으니 지우지 않는다.
  const f = getFlow(plantId);
  if (findPlant(plantId) && f.symptom && f.symptom !== 'none') setResult(plantId, null, null);

  root.innerHTML = `
    <section class="deadend">
      <div class="screen-head">
        <h1 class="t-title">${t('deadend.title')}</h1>
        <p class="t-desc">${t('deadend.guide')}</p>
      </div>
      <a class="btn btn-secondary deadend-btn" href="#/">${t('deadend.home')}</a>
    </section>`;
}
