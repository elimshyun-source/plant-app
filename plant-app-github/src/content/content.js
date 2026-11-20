// plants.md, ui-text.md, design-system.md(일러스트 표)를 읽어 앱에서 쓰는 모양으로 바꾼다.
import { loadMd, tables } from './md.js';

let content = null;

export async function loadContent() {
  if (content) return content;
  const [plantsMd, uiMd, designMd] = await Promise.all([
    loadMd('plants.md'),
    loadMd('ui-text.md'),
    loadMd('design-system.md'),
  ]);

  // 식물 목록: "잎 증상 해결책"이 "있음"인 식물만 등록할 수 있다 (plants.md "쓰는 법").
  // (파일 맨 위 제목도 "식물 목록"이라서, 제목이 아니라 열 이름으로 표를 찾는다)
  const plantTable = tables(plantsMd).find((tb) => tb.header.includes('식물 이름') && tb.header.includes('잎 증상 해결책'));
  if (!plantTable) throw new Error('plants.md에서 식물 목록 표를 찾지 못했어요');
  const plants = plantTable.rows
    .filter((r) => (r['잎 증상 해결책'] || '').startsWith('있음'))
    .map((r) => ({ name: r['식물 이름'] }));

  // 화면 문구: 표의 "키 | 문구"
  const ui = {};
  for (const t of tables(uiMd)) {
    if (!t.header.includes('키')) continue;
    for (const r of t.rows) ui[r['키']] = r['문구'];
  }

  // 식물 일러스트: design-system.md "식물 일러스트"의 표
  const art = {};
  for (const t of tables(designMd)) {
    if (!t.header.includes('식물 이름') || !t.header.includes('파일')) continue;
    for (const r of t.rows) {
      art[r['식물 이름']] = {
        file: `assets/plants/${r['파일']}`,
        height: Number(r['홈 높이']),
        bottom: Number(r['아랫면 (화분 아랫면에서 위로)']),
      };
    }
  }

  content = { plants, ui, art };
  return content;
}

export function getContent() {
  return content;
}
