// 내 식물 저장소. 브라우저(localStorage)에만 저장한다.
// 칸은 9개(선반 3줄 × 3칸). 빈 칸은 null.

const KEY = 'plant-app/v1';
export const SLOT_COUNT = 9;

function emptyState() {
  return { slots: Array(SLOT_COUNT).fill(null) };
}

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const data = JSON.parse(raw);
    if (!Array.isArray(data.slots)) return emptyState();
    const slots = data.slots.slice(0, SLOT_COUNT);
    while (slots.length < SLOT_COUNT) slots.push(null);
    return { slots };
  } catch {
    return emptyState();
  }
}

function write(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 저장하지 못해도 화면은 계속 쓸 수 있게 둔다.
  }
}

let state = read();

export function getSlots() {
  return state.slots;
}

export function findPlant(id) {
  return state.slots.find((p) => p && p.id === id) || null;
}

export function hasEmptySlot() {
  return state.slots.some((p) => p === null);
}

/**
 * 식물 하나를 첫 빈 칸에 넣는다.
 * plant: { kind, nickname, light } — light는 'bright' | 'normal' | 'dark'
 */
export function addPlant({ kind, nickname, light }) {
  const index = state.slots.findIndex((p) => p === null);
  if (index < 0) return null;
  const plant = {
    id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    kind,
    nickname,
    light,
    status: null,          // null | 'ok' | 'help'
    lastSolution: null,    // 마지막으로 본 해결책 번호
  };
  state.slots[index] = plant;
  write(state);
  return plant;
}

export function removePlant(id) {
  const index = state.slots.findIndex((p) => p && p.id === id);
  if (index < 0) return;
  state.slots[index] = null;
  write(state);
}

/** 상태와 마지막으로 본 해결책 번호를 저장한다. status: 'ok' | 'help' | null */
export function setResult(id, status, lastSolution = null) {
  const plant = findPlant(id);
  if (!plant) return;
  plant.status = status;
  plant.lastSolution = lastSolution;
  write(state);
}

/** 두 칸의 자리를 바꾼다(빈 칸 포함). */
export function swapSlots(a, b) {
  if (a === b) return;
  const slots = state.slots;
  [slots[a], slots[b]] = [slots[b], slots[a]];
  write(state);
}
