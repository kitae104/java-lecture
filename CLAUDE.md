# Java Lecture · 강의 자료 컨벤션

이 문서는 본 프로젝트(Java 수업용 강의 자료 정적 사이트)의 **폴더 구조·파일 네이밍·디자인 토큰·섹션 패턴**을 정의한다. 새 강의를 추가하거나 기존 강의를 수정할 때 반드시 이 문서의 규칙을 따른다.

> **AI 협업 메모:** Claude Code가 이 파일을 자동으로 읽는다. 새 강의 HTML을 만들 때 색상 팔레트·섹션 순서·재사용 클래스명을 그대로 복제하고, 임의로 다른 색이나 레이아웃을 도입하지 말 것.

---

## 1. 프로젝트 개요

- **목적:** Java 수업용 강의 자료를 강의실 빔프로젝터·인쇄·웹 모두에서 가독성 있게 제공.
- **형태:** 빌드 도구 없는 순수 정적 HTML/CSS/JS. 한 강의 = 한 HTML 파일.
- **호스팅:** Vercel (`cleanUrls: true`).
- **목차:** 루트 `index.html`이 카테고리 카드 그리드로 모든 강의를 노출.

---

## 2. 폴더 / 파일 네이밍

```
Java_Lecture/
├── index.html              ← 카테고리 카드 그리드 (목차)
├── CLAUDE.md               ← 본 문서
├── README.md
├── vercel.json
├── .gitignore
├── images/                 ← 모든 이미지 한 곳에
│   └── *.png
└── <category>/             ← 카테고리당 폴더 1개
    └── <topic>_lecture.html
```

**규칙**

| 항목 | 규칙 | 예시 |
|---|---|---|
| 카테고리 폴더 | 영어 소문자 단수형 | `network/`, `thread/`, `collection/`, `io/`, `jdbc/` |
| 강의 파일명 | `{topic}_lecture.html` | `socket_lecture.html`, `tcp_udp_lecture.html` |
| 이미지 경로 | 절대 경로 `/images/{name}.png` | `<img src="/images/socket.png">` |
| 한글 파일명 | 사용 금지 | URL 인코딩 문제 발생 |

---

## 3. 디자인 토큰 (고정 — 변경 금지)

모든 강의 HTML은 `<head>` 안에 아래 `:root` 변수 블록을 그대로 포함한다.

```css
:root {
  --bg:        #ffffff;   /* 페이지 배경 (순백) */
  --bg2:       #f8fafc;   /* 섹션 카드 배경 */
  --bg3:       #f1f5f9;   /* 코드/테이블 헤더 등 */
  --border:    #e2e8f0;   /* 기본 테두리 */
  --border2:   #cbd5e1;   /* 강조 테두리 */
  --text:      #0f172a;   /* 본문 (진한 네이비) */
  --text2:     #475569;   /* 부제·메타 */
  --text3:     #94a3b8;   /* 옅은 보조 */
  --accent:    #2563eb;   /* 강조 (진파랑) */
  --accent2:   #1d4ed8;
  --green:     #15803d;   /* 서버 / 문자열 */
  --orange:    #c2410c;   /* 인라인 코드 */
  --pink:      #be185d;   /* 메서드 / 화살표 */
  --yellow:    #a16207;   /* 주의 / 어노테이션 */
  --purple:    #6d28d9;   /* import / package */
  --mono:      'JetBrains Mono', monospace;
  --sans:      'Noto Sans KR', sans-serif;
  --shadow-sm: 0 1px 2px rgba(15,23,42,0.04);
  --shadow-md: 0 2px 6px rgba(15,23,42,0.06);
}
```

### 신택스 하이라이팅 (코드 블록 전용)

| 클래스 | 색 | 용도 |
|---|---|---|
| `.kw`  | `#1e40af` (진파랑, weight 600) | `public`, `class`, `if`, `try` … |
| `.kw2` | `var(--purple)` (weight 600) | `import`, `package` |
| `.type`| `#0f766e` (틸) | `String`, `Socket`, `BufferedReader` |
| `.str` | `#15803d` (진녹색) | `"문자열"` |
| `.cm`  | `#64748b` italic | `// 주석` |
| `.num` | `var(--orange)` | 숫자 리터럴 |
| `.fn`  | `var(--pink)` | 메서드 호출명 |
| `.cls` | `#0f766e` (weight 600) | 클래스명 (생성자 등) |
| `.ann` | `var(--yellow)` | `@Override` 어노테이션 |

---

## 4. 타이포그래피

```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
```

- **본문:** Noto Sans KR (300 / 400 / 500 / 700)
- **코드:** JetBrains Mono (400 / 500 / 700)
- 본문 line-height `1.7`, 코드 line-height `1.8`, tab-size `4`.

---

## 5. 강의 HTML 필수 섹션 패턴

각 강의 HTML은 다음 5개 섹션을 같은 순서로 갖는다(필요 없는 섹션은 생략 가능, 새 섹션 추가 가능 — 단 번호는 연속).

```
[page-header]   chapter-tag · 제목 · 부제 · meta-chips
[section 01]    개요 (desc 텍스트만)
[section 02]    다이어그램 (이미지 또는 flow-grid)
[section 03]    소스 코드 (필요 시 tab으로 다중 파일, copy 버튼)
[section 04]    실행 순서 (run-steps 번호 카드)
[section 05]    핵심 포인트 / 주의사항 (point-grid)
```

### 헤더 패턴

```html
<div class="page-header">
  <div class="chapter-tag">Chapter NN · 카테고리</div>
  <h1 class="page-title">제목 <span>부제</span></h1>
  <p class="page-sub">한 줄 설명</p>
  <div class="meta-chips">
    <span class="chip">키워드1</span>
    <span class="chip">키워드2</span>
  </div>
</div>
```

### 섹션 패턴

```html
<div class="section">
  <div class="section-head">
    <span class="section-num">01</span>
    <span class="section-title">섹션 제목</span>
  </div>
  <div class="section-body">
    <p class="desc">… <code>code</code> … <strong>강조</strong> …</p>
  </div>
</div>
```

### 코드 블록 패턴 (단일)

```html
<div class="code-card">
  <div class="code-header">
    <div class="code-file">
      <span class="dot dot-r"></span><span class="dot dot-y"></span><span class="dot dot-g"></span>
      <span class="code-filename">FileName<span class="ext">.java</span></span>
    </div>
    <button class="copy-btn" onclick="copyCode('id-of-pre', this)">복사</button>
  </div>
  <pre id="id-of-pre"><span class="kw">public class</span> <span class="cls">Foo</span> { … }</pre>
</div>
```

### 탭 + 코드 (다중 파일)

`tab-wrap` + `tab-btn` + `tab-panel` 구조. `switchTab(name)` JS 함수 그대로 재사용.

### 점 카드 그리드 (핵심 포인트)

```html
<div class="point-grid">
  <div class="point-card">
    <div class="point-icon">🔄</div>
    <div class="point-label">짧은 라벨</div>
    <div class="point-desc">한두 줄 설명</div>
  </div>
</div>
```

---

## 6. 재사용 컴포넌트 클래스명 (참조용)

| 클래스 | 역할 |
|---|---|
| `.section` | 섹션 카드 컨테이너 |
| `.section-head` / `.section-body` | 섹션 헤더 / 본문 |
| `.section-num` / `.section-title` | 섹션 번호 뱃지 / 제목 |
| `.desc` | 본문 단락 (`<p>`에 사용) |
| `.code-card` / `.code-header` / `.code-filename` | 코드 박스 |
| `.copy-btn` | 클립보드 복사 버튼 (`copyCode()` JS 호출) |
| `.tab-wrap` / `.tab-btn` / `.tab-panel` | 탭 UI (`switchTab()`) |
| `.flow-grid` / `.flow-step` / `.flow-arrows` | 좌-중-우 흐름 시각화 |
| `.diagram-wrap` | 이미지 다이어그램 컨테이너 (흰색 배경 박스) |
| `.explain-table` | 코드 설명 테이블 |
| `.tag-c` / `.tag-s` / `.tag-b` | 클라이언트 / 서버 / 공통 태그 뱃지 |
| `.run-steps` / `.run-step` / `.run-num` | 실행 순서 |
| `.point-grid` / `.point-card` | 핵심 포인트 카드 |

---

## 7. 새 강의 추가 체크리스트

1. **카테고리 폴더 확인 / 생성** — `network/`, `thread/` 등.
2. **`socket_lecture.html`을 템플릿으로 복사** — `<head>` 안 `:root` 토큰과 `<style>` 블록 그대로 유지.
3. **헤더·섹션 콘텐츠 교체** — `<title>Chapter NN-N · ...`, `<h1 class="page-title">`, `<p class="page-sub">`, `<span class="tag">` 또는 `<span class="chip">` 가 자동 인덱스 추출의 입력. 누락 없이 채울 것.
4. **이미지가 필요하면** `images/`에 추가하고 `/images/{name}.png` 형태로 참조.
5. **인덱스 카드 자동 생성** — `node scripts/build-index.js` 한 줄. `index.html` 안의 `<!-- AUTO-CARDS:START --> ... <!-- AUTO-CARDS:END -->` 사이를 통째 재생성한다. 직접 손대지 말 것.
   - 새 카테고리(폴더)를 도입할 때만 `scripts/build-index.js` 의 `CATEGORIES` 배열에 한 줄 추가. 폴더에 강의 HTML이 0개면 자동으로 `(예정)` 라벨이 붙는다.
   - 카테고리별 “예정” 카드를 노출하고 싶으면 같은 배열의 `upcoming` 항목으로 정의.
6. **로컬 미리보기:** `npx serve .` 또는 `python -m http.server 8000` 으로 띄워 `/` → 카드 클릭 → 강의 라우팅 확인.
7. **커밋 + 푸시 (한 방에):** `pwsh ./scripts/publish.ps1 -Commit -Push -Message "feat: add <topic> lecture"`. Vercel 이 자동 빌드/배포.
   - 단계별로 보고 싶다면: 인자 없이 실행 → 빌드 + 상태 확인만, `-Commit` → 빌드 + 커밋, 추가로 `-Push` → 푸시까지.

---

## 8. Vercel 배포 메모

`vercel.json`:

- `cleanUrls: true` — `/network/socket_lecture.html`이 `/network/socket_lecture`로도 접근됨.
- `/images/*`에 1년 immutable 캐시 헤더 적용.

배포 단위는 **루트 디렉터리 = 사이트 루트**. 별도 빌드 명령 없음.

---

## 9. 절대 하지 말 것 (Don'ts)

- 다크 테마 색상 변수로 되돌리지 말 것 (수업용으로 가독성 떨어짐).
- 본 문서에 명시되지 않은 색을 임의로 도입하지 말 것 — 새 강의가 색상 팔레트로 보여야 하는 의미가 있다면 본 문서에 먼저 추가하고 토큰 명을 정의한 뒤에 사용.
- 강의 HTML당 외부 CSS 분리 금지 — 한 파일 = 한 강의 원칙 유지(스타일 통째 인라인 `<style>`).
- 한글 폴더명·파일명 금지 (URL 인코딩 / 빌드 환경 호환 문제).
- 강의별로 폰트를 다르게 쓰지 말 것 (Noto Sans KR + JetBrains Mono로 고정).
