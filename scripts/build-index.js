#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * build-index.js
 * --------------------------------------------------------------------------
 * 카테고리 폴더(<category>/*.html)를 스캔해 각 강의 HTML에서 메타데이터를
 * 추출하고, index.html 의 카드 그리드를 자동 재생성한다.
 *
 *  사용:
 *    node scripts/build-index.js
 *
 *  인덱스 마커:
 *    index.html 안에 아래 두 마커가 있어야 한다.
 *      <!-- AUTO-CARDS:START -->
 *      <!-- AUTO-CARDS:END -->
 *    스크립트는 두 마커 사이의 내용을 통째로 교체한다.
 *
 *  새 카테고리 추가:
 *    아래 CATEGORIES 배열에 한 줄 넣고 폴더만 만들면 끝.
 *    실제 강의 HTML이 0개면 자동으로 "(예정)" 라벨이 붙는다.
 * --------------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const START_MARK = '<!-- AUTO-CARDS:START -->';
const END_MARK = '<!-- AUTO-CARDS:END -->';

/**
 * 카테고리 표시 순서.
 *  - dir       : 실제 폴더 이름
 *  - icon      : 카테고리 헤더의 이모지
 *  - title     : 카테고리 표시 제목
 *  - upcoming  : 폴더에 실제 파일이 없어도 표시할 "예정" 카드 목록
 */
const CATEGORIES = [
  {
    dir: 'frame',
    icon: '🪟',
    title: 'Frame · GUI 프로그래밍',
    upcoming: [],
  },
  {
    dir: 'network',
    icon: '🌐',
    title: 'Network · 네트워크 프로그래밍',
    upcoming: [
      {
        title: 'TCP / UDP 비교',
        desc: '신뢰성 vs 성능. DatagramSocket을 이용한 UDP 통신 예제까지 포함 예정.',
        tags: ['UDP'],
      },
    ],
  },
  {
    dir: 'database',
    icon: '🗄️',
    title: 'Database · 데이터베이스 연동',
    upcoming: [],
  },
  {
    dir: 'thread',
    icon: '🧵',
    title: 'Threads · 멀티스레드',
    upcoming: [
      {
        title: 'Thread 기초',
        desc: 'Thread 클래스 / Runnable 인터페이스, 라이프사이클, 동기화(synchronized).',
        tags: ['Thread'],
      },
    ],
  },
  {
    dir: 'collection',
    icon: '📦',
    title: 'Collections · 컬렉션 프레임워크',
    upcoming: [
      {
        title: 'List / Set / Map',
        desc: 'ArrayList, LinkedList, HashSet, HashMap의 내부 구조와 사용 시점.',
        tags: ['Generic'],
      },
    ],
  },
];

const TAG_LIMIT = 2;        // 카드에 노출할 태그 개수
const DESC_LIMIT = 130;     // 카드 설명 최대 길이
const INDENT = '  ';        // 출력 들여쓰기 (index.html .content 내부 기준)

// ── 유틸 ──────────────────────────────────────────────────────────────────
// HTML → 플레인 텍스트.
//   1) <br> 을 공백으로,  나머지 태그 제거
//   2) 자주 쓰이는 엔티티 디코드 ( escapeHtml 이 다시 인코딩하므로 이중 이스케이프 방지 )
function stripHtml(s) {
  const noTags = s
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '');
  const decoded = noTags
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&'); // amp 는 마지막에 (다른 엔티티 디코드를 깨뜨리지 않도록)
  return decoded.replace(/\s+/g, ' ').trim();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// "17", "17-2", "17-0" 등을 정렬 키로. bare "17"은 "17-1"처럼 취급해
//   17-0 → 17 → 17-2 → 17-3 ... 순서가 자연스럽게 나오도록 한다.
function chapterSortKey(ch) {
  if (!ch) return [9999, 9999];
  const parts = ch.split('-').map(n => Number(n));
  if (parts.length === 1) return [parts[0], 1];
  return parts;
}

// HTML 파일에서 카드 메타데이터 추출
function extractMeta(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');

  // chapter — <title>Chapter 17-5 · ... </title>
  let chapter = '';
  const t = html.match(/<title>([^<]+)<\/title>/i);
  if (t) {
    const m = t[1].match(/Chapter\s*([\d-]+)/i);
    if (m) chapter = m[1];
  }

  // title — <h1 class="page-title">…</h1>
  // <br> 또는 부제용 <span> 이전까지만 메인 타이틀로 사용
  let title = '';
  const h1 = html.match(/<h1[^>]*class=["']page-title["'][^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    const head = h1[1].split(/<br\s*\/?>|<span/i)[0];
    title = stripHtml(head);
  }

  // description — <p class="page-sub">…</p>
  let desc = '';
  const p = html.match(/<p[^>]*class=["']page-sub["'][^>]*>([\s\S]*?)<\/p>/i);
  if (p) desc = stripHtml(p[1]);
  if (desc.length > DESC_LIMIT) desc = desc.slice(0, DESC_LIMIT - 1) + '…';

  // tags — <span class="tag">…</span> 우선, 없으면 <span class="chip">…</span>
  let tagMatches = [...html.matchAll(/<span[^>]*class=["']tag["'][^>]*>([\s\S]*?)<\/span>/gi)];
  if (tagMatches.length === 0) {
    tagMatches = [...html.matchAll(/<span[^>]*class=["']chip["'][^>]*>([\s\S]*?)<\/span>/gi)];
  }
  const tags = tagMatches
    .map(m => stripHtml(m[1]))
    .filter(Boolean)
    .slice(0, TAG_LIMIT);

  return { chapter, title, desc, tags };
}

// ── 카드 빌더 ─────────────────────────────────────────────────────────────
function tagSpans(tags, indentLevel) {
  const pad = INDENT.repeat(indentLevel);
  return tags
    .map(t => `${pad}<span class="card-tag">${escapeHtml(t)}</span>`)
    .join('\n');
}

function buildLectureCard(href, meta) {
  const num = meta.chapter ? `CHAPTER ${meta.chapter}` : '강의';
  return `      <a class="card" href="${href}">
        <div class="card-num">${escapeHtml(num)}</div>
        <div class="card-title">${escapeHtml(meta.title)}</div>
        <div class="card-desc">${escapeHtml(meta.desc)}</div>
        <div class="card-foot">
          <div class="card-tags">
${tagSpans(meta.tags, 6)}
          </div>
          <span class="card-cta">강의 보기 →</span>
        </div>
      </a>`;
}

function buildUpcomingCard(c) {
  return `      <div class="card upcoming">
        <div class="card-num">예정</div>
        <div class="card-title">${escapeHtml(c.title)}</div>
        <div class="card-desc">${escapeHtml(c.desc)}</div>
        <div class="card-foot">
          <div class="card-tags">
${tagSpans(c.tags || [], 6)}
          </div>
          <span class="card-cta">준비 중</span>
        </div>
      </div>`;
}

function buildCategorySection(cat) {
  const dirAbs = path.join(ROOT, cat.dir);
  let realCards = [];
  let realCount = 0;

  if (fs.existsSync(dirAbs)) {
    const files = fs
      .readdirSync(dirAbs)
      .filter(f => f.toLowerCase().endsWith('.html'))
      .sort();

    const items = files
      .map(file => ({
        file,
        href: `./${cat.dir}/${file}`,
        meta: extractMeta(path.join(dirAbs, file)),
      }))
      .filter(x => x.meta.title); // page-title 없는 파일은 스킵

    items.sort((a, b) => {
      const ka = chapterSortKey(a.meta.chapter);
      const kb = chapterSortKey(b.meta.chapter);
      for (let i = 0; i < Math.max(ka.length, kb.length); i++) {
        const va = ka[i] ?? 0;
        const vb = kb[i] ?? 0;
        if (va !== vb) return va - vb;
      }
      return a.file.localeCompare(b.file);
    });

    realCount = items.length;
    realCards = items.map(x => buildLectureCard(x.href, x.meta));
  }

  const upcomingCards = (cat.upcoming || []).map(buildUpcomingCard);
  const allCards = [...realCards, ...upcomingCards];
  if (allCards.length === 0) return null;

  const meta = realCount > 0 ? `${cat.dir}/` : `${cat.dir}/ (예정)`;

  return {
    realCount,
    upcomingCount: upcomingCards.length,
    html: `  <!-- ${cat.title} -->
  <section class="category">
    <div class="category-head">
      <span class="category-icon">${cat.icon}</span>
      <span class="category-title">${escapeHtml(cat.title)}</span>
      <span class="category-meta">${escapeHtml(meta)}</span>
    </div>
    <div class="card-grid">
${allCards.join('\n\n')}
    </div>
  </section>`,
  };
}

// ── 엔트리 ────────────────────────────────────────────────────────────────
function main() {
  if (!fs.existsSync(INDEX)) {
    console.error(`✗ index.html not found at ${INDEX}`);
    process.exit(1);
  }
  const original = fs.readFileSync(INDEX, 'utf8');
  const startIdx = original.indexOf(START_MARK);
  const endIdx = original.indexOf(END_MARK);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    console.error(`✗ index.html에 마커가 없습니다.`);
    console.error(`  추가하세요:`);
    console.error(`    ${START_MARK}`);
    console.error(`    ... (이 안의 내용은 자동 생성됩니다)`);
    console.error(`    ${END_MARK}`);
    process.exit(1);
  }

  const built = CATEGORIES.map(buildCategorySection).filter(Boolean);
  const sectionsHtml = built.map(b => b.html).join('\n\n');

  const before = original.slice(0, startIdx + START_MARK.length);
  const after = original.slice(endIdx);
  const next = `${before}\n\n${sectionsHtml}\n\n  ${after}`;

  if (next === original) {
    console.log('= index.html 변경 없음 (already up-to-date).');
    return;
  }

  fs.writeFileSync(INDEX, next, 'utf8');
  console.log('✓ index.html 카드 그리드 재생성 완료.');
  CATEGORIES.forEach((c, i) => {
    const b = built[i];
    if (!b) return;
    console.log(
      `  ${c.icon}  ${c.dir.padEnd(11)}  ` +
        `lectures=${String(b.realCount).padStart(2)}  ` +
        `upcoming=${String(b.upcomingCount).padStart(2)}`
    );
  });
}

main();
