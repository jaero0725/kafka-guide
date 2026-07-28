# Wave 0 인수인계 규약 (Wave 1·2 에이전트 필독)

> Wave 0이 만든 기반의 **실제 API·클래스 어휘·파일 규약**이다.
> 여기 적힌 것과 다르게 쓰면 스타일이 안 먹거나 동작하지 않는다.
> 레퍼런스는 항상 `basics/ch01.html`, `assets/diagrams/D-012-offset-anatomy.svg`,
> `data/questions/basics-ch01.json` 세 파일이다. **먼저 열어 보고 복제하라.**

---

## A. 콘텐츠 에이전트 (A1~A8)

### A-1. 페이지 골격

**`basics/ch01.html`을 복제하는 것이 가장 안전하다.** 핵심만:

```html
<!doctype html>
<html lang="ko" data-theme="auto">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>4장 · Producer 심화 — Kafka Guide</title>
  <meta name="description" content="…">
  <link rel="stylesheet" href="../assets/css/tokens.css">
  <link rel="stylesheet" href="../assets/css/main.css">
  <link rel="stylesheet" href="../assets/css/code.css">
  <link rel="stylesheet" href="../assets/css/viz.css">
</head>
<body>
  <a class="skip-link" href="#main">본문 바로가기</a>
  <div id="sidebar-mount" data-section="basics" data-page="ch04"></div>

  <main id="main" class="page" data-page-id="basics/ch04">
    <nav class="breadcrumb" aria-label="경로">
      <ol><li><a href="../index.html">홈</a></li>
          <li><a href="ch01.html">기본개념</a></li>
          <li><span aria-current="page">4장 · Producer 심화</span></li></ol>
    </nav>
    <header class="page__header">
      <p class="page__eyebrow">기본개념 · 4장</p>
      <h1>Producer 심화</h1>
      <p class="page__lead">한 문단 요약</p>
    </header>
    <section class="objectives" aria-labelledby="objectives-h">
      <h2 id="objectives-h">학습 목표</h2><ul><li>…</li></ul>
    </section>

    <!-- 본문. 모든 h2/h3 에 영문 kebab-case id 필수 -->

    <nav class="pager" aria-label="이전/다음"></nav>   <!-- 비워 두면 app.js가 채움 -->
  </main>

  <script src="../assets/js/progress.js" defer></script>
  <script src="../assets/js/highlight.js" defer></script>
  <script src="../assets/js/viz.js" defer></script>
  <script src="../assets/js/app.js" defer></script>
  <script src="../assets/js/quiz.js" defer></script>
</body>
</html>
```

> ⚠️ **스크립트 5개는 이 순서를 지켜라.** `viz.js`가 `app.js`보다 먼저 등록되어야
> 다이어그램 주입 시 인터랙티브 초기화가 걸린다.
> 루트 깊이 페이지(`index.html`)는 `../` 없이 `assets/…`.

### A-2. 사용 가능한 CSS 클래스 전체

```
구조   .page .page--wide .page__header .page__eyebrow .page__lead .page__meta
       .breadcrumb(>ol>li) .pager(빈 채로) .skip-link
박스   .objectives
       .note .note--warn .note--danger .note--version .note--exam .note--ok
코드   figure.code > figcaption + pre > code.lang-{java|properties|bash|json|yaml|
       sql|python|javascript|xml|text}     ← 복사 버튼은 app.js가 주입
표     table(+caption, th[scope]) .config-table .config-table--plain
       .table-scroll  .t-center .t-nowrap .mark-ok .mark-no
비교   .diff > .diff__before / .diff__after   (::before로 ✕Before/✓After 자동)
배지   .badge .badge--ccdak .badge--ccaak .badge--easy .badge--medium .badge--hard
카드   ul.card-grid > li > a.card > .card__title .card__desc .card__meta
버튼   .btn .btn--primary .btn--ghost .btn--danger .btn--sm .btn--block .icon-btn
기타   .toolbar .field .sr-only kbd
```

**새 클래스를 만들지 마라.** CSS 파일은 Wave 0 소유이므로 수정할 수 없다.
필요한 컴포넌트가 없으면 반환 리포트에 요청으로 남겨라.

### A-3. 반드시 지킬 두 가지

**(1) 표는 항상 `.table-scroll`로 감싼다.** 360px 가로 스크롤 0 조건이 여기 걸린다.
```html
<div class="table-scroll">
  <table class="config-table"><caption>…</caption>…</table>
</div>
```

**(2) 노트 라벨은 `data-label` 속성을 쓴다.** (표준으로 확정)
```html
<aside class="note note--exam" data-label="시험 포인트 · Application Development">
  <code>onCompletion()</code> 콜백은 Sender 스레드에서 실행됩니다.
</aside>
```
`<strong>` 첫자식 방식도 렌더되지만 `data-label`로 통일한다.

### A-4. 이모지를 쓰지 않는다 (확정)

섹션 헤더에 이모지를 붙이지 않는다. `.note`의 `data-label`이 그 역할을 하고,
MDN/Stripe 계열 톤에 맞다. `PLAN.md` §2에 이모지가 붙은 섹션명이 있으나
그건 **계획서 가독성용 표기**이며 페이지에는 넣지 않는다.

### A-5. 플레이스홀더 정확한 마크업

```html
<!-- 다이어그램: SVG 를 그리지 마라. 카탈로그에 있는 ID만 쓴다 -->
<figure class="diagram" data-diagram="D-030">
  <figcaption>Producer 전송 파이프라인 — <code>send()</code> 호출부터 브로커 응답까지</figcaption>
</figure>

<!-- 인라인 퀴즈 -->
<div class="quiz-embed" data-set="basics-ch04" data-count="10"></div>
<!-- 선택 속성: data-mode="study" data-shuffle="false"
     data-shuffle-choices="false" data-title="…" -->
```

---

## B. 시각화 에이전트 (V1~V3)

### B-1. 색을 직접 쓰지 말고 클래스를 써라 (더 안전)

`viz.css`에 유틸리티 클래스 36종이 정의되어 있다.

```
텍스트  .dg-fs-sm(13) .dg-fs-md(15) .dg-fs-lg(18) .dg-fs-xl(22)
        .dg-bold .dg-mono .dg-muted .dg-num
노드    .dg-node   + --alt --accent --danger --ok --warn --muted --empty
선      .dg-edge   + --accent --danger --ok --warn --muted --dashed --dotted --dashdot
화살촉  .dg-marker + --accent --danger --ok --warn --muted   (marker 안의 path 에)
기타    .dg-grid .dg-panel .dg-x .dg-move .dg-hit
```

토큰이 필요하면 25종만 허용된다:
```
색    --dg-stroke --dg-fill --dg-fill-alt --dg-accent --dg-muted
      --dg-danger --dg-ok --dg-warn --dg-text
보조  --dg-bg --dg-accent-soft --dg-danger-soft --dg-ok-soft --dg-warn-soft
      --dg-muted-soft --dg-text-muted --dg-grid
선    --dg-sw-1(1.5) --dg-sw-2(2.5) --dg-sw-hair(0.75)
파선  --dg-dash-1("5 3") --dg-dash-2("2 2") --dg-dash-3("9 4 2 4")
기타  --dg-radius(4) --dg-min-w(720px)
```

> ⚠️ `font-size` / `stroke-width` / `font-family` 속성을 직접 지정하지 마라.
> `validate --diagrams`가 오류로 잡는다.

### B-2. 조작 대상은 `id`가 아니라 `data-dg`로 표시한다 (매우 중요)

`inline-diagrams.mjs`가 모든 `id`에 `{id소문자}-{순번}-` 접두어를 붙인다.
따라서 **id 셀렉터는 인라인 후 전부 깨진다.**

```svg
<g data-dg="cell-0">
  <rect class="dg-node" .../>
  <text class="dg-fs-sm">…</text>
</g>
```
- 텍스트와 도형을 함께 상태 전이시켜야 하면 **`<g data-dg="…">`로 묶어라.**
  `[data-state]`가 그룹에 붙고 CSS가 내부 `.dg-node`까지 스타일링한다.
- `data-state` 어휘: `on | off | active | done | error | pending | hidden`

### B-3. 인터랙티브 로직은 viz.js에 등록한다

SVG 안에 `<script>` / `<style>` / `<image>` / base64는 **금지**다.

```js
KG.viz.register('D-034', function (ctx) { … });   // 전역 registerViz(id, fn) 도 동일
```

`ctx` API:
```
id, svg, figure, reducedMotion
q(name) qa(name) qs(sel) qsa(sel)
setState(target, state)  text(name, v)  attr(name, obj)  move(name, x, y)
bindControls(spec)  animateAlong(pathName, opts)  announce(text)
readout([{label, value}])  svgEl(tag, attrs)
```

`bindControls` spec:
```js
ctx.bindControls({
  onChange: (values, api, meta) => {},
  items: [
    { type:'range',  name:'x', label:'…', min:0, max:12, step:1, value:5,
      format:(v)=>`${v}건` },
    { type:'select', name:'s', label:'…', options:[{value,label}], value:'range' },
    { type:'toggle', name:'t', label:'…', value:false },
    { type:'button', name:'b', label:'…', onClick:(values,api)=>{}, variant:'primary' },
    { type:'reset',  label:'기본값으로' }
  ]
});
// api: values() get(n) set(n,v) reset() announce(t) readout(list) el
```
**컨트롤은 `bindControls`로만 만들어라.** 실제 `<button>`/`<input>`/`<select>`가
생성되어 키보드 조작이 보장된다. 직접 만든 div+click은 접근성 위반으로 반려된다.

### B-4. 그 밖의 규칙

- 좌표계 폭 **720 고정**. `width`/`height` 속성 금지, `viewBox`만.
- **JS 없이도 초기 상태가 의미를 전달**해야 한다. SVG의 초기 값이 실제로 정합해야 한다.
  (D-012는 `lso=0 / committed=4 / hw=7 / leo=12`로 정합하게 두었다)
- 파일명 `assets/diagrams/{ID}-{slug}.svg` — 예 `D-034-key-partitioning.svg`.
  slug는 영문 kebab-case. ID 중복·규칙 위반은 validate가 오류로 잡는다.
- **`<desc>`를 충실히 써라.** `title`/`desc`가 검색 인덱스에 들어가서
  "리밸런스 시뮬레이터"로 검색해 다이어그램을 찾을 수 있다 (검증됨).
- `.dg-scroll` 래퍼는 툴링이 주입한다. SVG 파일에 쓰지 마라.
  좁은 화면에서 축소 대신 720px 1:1 가로 스크롤이 되어 13px가 실제 13px로 렌더된다.
- `assets/diagrams/index.json`은 `build-index.mjs`가 생성한다. **직접 쓰지 마라.**

---

## C. 문제 생성 에이전트 (B1~B5)

### C-1. 4유형 — 엔진이 실제로 강제하는 것

| 유형 | 필수 필드 | 엔진 동작 |
|---|---|---|
| `single` | `choices`(정확히 4) `answer`(1개) | 라디오. 선택지 셔플 후 **표시 순서대로 A/B/C/D 재부여**. `distractorNotes` 키는 원본 id로 쓰고 화면 표시 문자는 엔진이 변환 |
| `multiple` | `choices`(4~5) `answer`(2개+) | 체크박스. 전부 일치만 정답. 문제문에 `(2개 선택)` 필요 |
| `matching` | `pairs`(3~6, `{id,left,right}`) + `extraRights` 권장 | left별 `<select>`. 옵션 = 셔플된 right + extraRights |
| `ordering` | `items`(4~6, `{id,text}`) `answer`(items와 동수) | ▲▼ 버튼. 채점 후 제출/정답 순서 병치 |

**주의**
- **`matching`에는 `answer`를 쓰지 마라.** `pairs[].right`가 정답이다.
- `matching`의 `right` 값 **중복 금지**. `extraRights`가 정답 right와 겹치면 오류.
- `ordering`의 `items` 배열을 **정답 순서로 저장하지 마라** (경고 발생).
- `left` / `text` / `choices[].text`에서 백틱 코드 표기와 `**굵게**`가 렌더된다.
  `aria-live`·`aria-label`은 기호를 제거해 낭독하므로 백틱을 안심하고 써라.

### C-2. 혼합 세트 (모의고사·진단) — 규칙 확정

한 세트 안에 여러 도메인 문항이 섞이는 세트는 **`mock: true` 또는 `diagnostic: true`를
세트 레벨에 명시**하고, 세트 `domain`은 `"Mixed"`로 둔다.

```json
{ "setId":"ccdak-mock-1", "exam":"CCDAK", "domain":"Mixed",
  "kafkaVersion":"4.3", "mock":true, "questions":[…] }

{ "setId":"ccdak-diagnostic", "exam":"CCDAK", "domain":"Mixed",
  "kafkaVersion":"4.3", "diagnostic":true, "questionsPerDomain":5, "questions":[…] }
```

- 문항별 `domain`은 **공식 도메인 문자열과 정확히 일치**해야 한다 (아래 목록).
- `validate.mjs`가 혼합 세트를 인식해 세트/문항 domain 일치 검사를 건너뛰고,
  대신 공식 도메인 목록 소속 여부를 검사한다. (Wave 0이 남긴 이슈 #1 → 해결됨)

**CCDAK 도메인 문자열 (오타 불가)**
```
Application Development
Fundamentals
Kafka Connect
Application Observability
Kafka Streams
Application Testing
```

**CCAAK 도메인 문자열**
```
Kafka Fundamentals
Kafka Security
Kafka Connect
Deployment Architecture
Cluster Configuration
Observability
Troubleshooting
```

### C-3. 진단 모드가 요구하는 것

- `ccdak-diagnostic.json` = **6도메인 × 5문항 = 30**
- `chapter` 필수. `ch01`~`ch11` 또는 `appendix-legacy`
- 학습순서 정렬식: **가중치 × (100 − 정답률) / 100** 내림차순
- 티어: `<60%` 집중학습 / `60~80%` 보강 / `≥80%` 유지
- 결과 리포트가 **유형별 정답률**도 표시한다. 세트마다 4유형을 섞어라.
  matching/ordering이 0건이면 validate가 경고한다.

### C-4. refs 화이트리스트

```
kafka.apache.org      cwiki.apache.org      docs.confluent.io
developer.confluent.io  github.com/apache/kafka
issues.apache.org     archive.apache.org
```
**`raw.githubusercontent.com` 금지** — 학습자에게 부적절하다.
검증은 소스로, 인용은 공식 문서 URL로 분리한다 (`docs/FACT_SOURCES.md` §5).

### C-5. 플래시카드 규약 (B4) — ⚠️ 실제 구현 확인분으로 교체됨

**마운트 셀렉터는 `#flashcard-app`이 아니라 `.flashcard-embed` 클래스다.**
(초기 지시가 실제 `flashcard.js` 구현과 달랐다. A7이 소스 확인 + Playwright 검증.)

```html
<div class="flashcard-embed" data-exam="CCDAK" data-deck="all" data-shuffle="true"></div>
<script src="../assets/js/flashcard.js" defer></script>   <!-- 6번째로 직접 로드 필요 -->
```
`app.js`가 `flashcard.js`를 로드하지 않으므로 **페이지가 직접 로드**해야 한다.

| 속성 | 동작 |
|---|---|
| `data-decks="a,b"` | 이 deckId만 로드 (있으면 `data-exam` 무시) |
| `data-exam="CCDAK"` | `index.json`에서 `deck.exam === "CCDAK"` 인 덱 전부 |
| `data-deck` | 로드된 카드 중 `card.deck === 값` 만 표시. 기본 `"all"` |
| `data-shuffle="false"` / `data-hide-graduated="true"` | 옵션 |

**B4가 반드시 지킬 것**
- **파일명 = `{deckId}.json`.** 엔진은 `index.json`의 `file` 필드를 **무시하고**
  `data/flashcards/{deckId}.json` 으로 fetch한다. 불일치하면 404다.
- `index.json`: `{ generatedAt, decks: [{deckId, file, title, exam, chapter, count}] }`
- 카드: `{ id, deck, front, back, tags, chapter }`.
  `deck` 생략 시 파일의 `deckId`가 자동 주입된다.
- `front`/`back`에 백틱·`**굵게**`·`\n` 사용 가능 (`<code>`/`<strong>`/`<br>`로 렌더)
- **`chapter`는 `ch01`~`ch11` 만.** `basics/{chapter}.html` 복습 링크 생성에 쓰인다
  (`appendix-legacy`를 넣으면 링크가 깨진다)
- `id` **전역 유일** (진도 저장 키). "알았음" 3연속 → 졸업
- 덱이 2개 이상이면 엔진이 `<select>` 덱 선택 UI를 **자동 렌더링**한다.
  그래서 `ccdak/flashcards.html`은 deckId를 하드코딩하지 않았다 —
  **B4가 어떤 deckId를 쓰든 동작한다.**
- 데이터가 없으면 "플래시카드 덱이 아직 없습니다" 안내가 에러 없이 표시된다

### C-6. A7이 만들 파일명 (하드코딩 링크 대상)

진단 학습순서와 결과 리포트가 아래 경로로 **하드코딩 링크**한다. 파일명을 바꾸지 마라.
```
ccdak/domain-app-development.html   ccdak/domain-fundamentals.html
ccdak/domain-connect.html           ccdak/domain-observability.html
ccdak/domain-streams.html           ccdak/domain-testing.html
ccdak/traps.html   ccdak/cram.html   ccdak/flashcards.html
ccdak/exam-tips.html   ccdak/index.html
```

---

## D. 툴링 사용법

```bash
node tools/validate.mjs --all          # links + questions + html + diagrams
node tools/validate.mjs --questions    # 문제은행만
node tools/validate.mjs --diagrams     # 다이어그램만
node tools/validate.mjs --all --strict # 경고를 오류로 승격 (Wave 4 게이트)
node tools/inline-diagrams.mjs --check # 미치환 플레이스홀더 보고
npm run build                          # inline → index → validate --strict --deploy
```

> ⚠️ **순서 주의: `inline-diagrams` → `build-index`.**
> 역순이면 다이어그램 `<title>`/`<desc>` 텍스트가 검색 인덱스에 들어가지 않는다.
> `package.json`의 `build` 스크립트에 순서가 고정되어 있으니 그것을 써라.

`validate.mjs`는 **외부 HTTP 요청을 하지 않는다** (형식·호스트 화이트리스트만 검사).
공식 문서가 차단된 환경이라 URL 생존 확인은 불가능하다.
Wave 3 C3는 이 항목을 **"검증 불가"로 보고**하면 된다.

---

## E. Wave 0이 남긴 미해결 항목의 처리

| # | 항목 | 처리 |
|:--:|---|---|
| 1 | 진단·모의고사 세트의 domain 일치 규칙 충돌 | **해결됨.** `mock`/`diagnostic` 플래그로 혼합 세트를 인식하도록 `validate.mjs` 수정. §C-2 참조 |
| 2 | D-001·D-002·D-003 미생성 (ch01이 참조 중) | **V3 담당.** 현재는 안내 박스가 표시됨 |
| 3 | `manifest.json` 미생성 | **B6 담당.** 그전까지 퀴즈 허브가 31개 후보를 탐색하며 404 폴백 (정상) |
| 4 | `.note` 라벨 방식 이원화 | **`data-label`로 확정.** §A-3 |
| 5 | `--strict` 미통과 (경고 56건) | Wave 1·2가 예정 경로를 채우면 해소. Wave 4가 `--strict`로 게이트 |
| 6 | 툴 실행 순서 | §D에 명시. `npm run build` 사용 |
| 7 | ch01에 D-012가 이미 정적 인라인됨 | 멱등하므로 Wave 4가 다시 돌려도 안전 |

---

## F. Wave 4가 반드시 해야 할 일 (에이전트 보고 누적)

| 출처 | 항목 |
|---|---|
| A8 | **`data/toc.json`의 `ccaak` 섹션에 `domain-*.html` 7개가 없다.** 등록하지 않으면 사이드바·pager에 안 나타난다. 순서: fundamentals → security → connect → deployment → cluster-config → observability → troubleshooting |
| A1 | ch03이 `ccaak/index.html`만 링크했다 (`domain-*`는 toc 미등록이라 회피). toc 등록 후 링크 보강 가능 |
| V1 | 신규 ID **D-038·D-039·D-048·D-049** — 카탈로그 반영 완료. **ch04·ch05에 플레이스홀더 추가 필요** |
| A8 | CCAAK 전용 신규 다이어그램 6개 요청 (범위 관계도, 섹션↔챕터 매핑, 쿼럼 사이징, 재할당 3단계, ISR 3지표 경계, MM2 4패턴) |
| A4 | practice 전용 다이어그램 요청 (반환 리포트 참조) |
| 공통 | `npm run build` = `inline-diagrams` → `build-index` → `validate --all --strict --deploy` 순서 준수 |
| **통합(중요)** | **`assets/js/viz-v1.js`(680줄, D-034·D-040·D-046 구현)를 어떤 HTML도 로드하지 않는다.** 인터랙티브 3종이 죽은 상태다. `basics/ch04.html`(D-034)·`basics/ch05.html`(D-040·D-046)에 `viz.js` **다음** 순서로 `<script src="../assets/js/viz-v1.js" defer></script>` 를 추가하거나, `viz.js`에 병합할 것. V2·V3도 같은 파일을 만들었을 수 있으니 반환 리포트를 확인하라 |

## G. 검증기 오탐 수정 이력

- **2026-07-28**: `validate --diagrams`의 하드코딩 색 검사가 SVG 내부 참조
  `url(#d030-arrow)` / `href="#d047-lane"` 를 hex 색으로 오인해 **54건 오탐**을 냈다.
  (`#d030` 이 4자 hex 패턴과 겹침) → hex 색을 **색을 받는 자리에서만** 찾도록 수정.
  `fill=` / `stroke=` / `style` 선언 안에서만 매칭한다. 진짜 하드코딩 색 검출은 유지.
  → 에이전트가 정상 파일을 "고치려" 하는 낭비를 막기 위한 수정이므로 되돌리지 말 것.

---

## H. 인터랙티브 다이어그램 구현 소유권 (혼동 주의)

Wave 0의 `assets/js/viz.js`가 **인터랙티브 8종 중 5종의 로직을 이미 구현**해 두었다.
시각화 에이전트는 그 5종에 대해 **SVG 마크업만** 만들고 `data-dg` 이름을 맞춰야 한다.

| ID | 로직 위치 | SVG 담당 |
|---|---|---|
| D-012 | `viz.js:575` (완성, 레퍼런스) | Wave 0 (완성) |
| D-133 | `viz.js:710` (완성) | V3 |
| D-062 | `viz.js:815` (완성) | V2 |
| D-064 | `viz.js:897` (완성) | V2 |
| D-072 | `viz.js:997` (완성) | V2 |
| D-034 | `viz-v1.js:273` (V1 구현) | V1 |
| D-040 | `viz-v1.js:415` (V1 구현) | V1 |
| D-046 | `viz-v1.js:576` (V1 구현) | V1 |

> `viz.js`의 주석 안에 `KG.viz.register('D-034', …)` 예시가 있어 실제 등록으로
> 오인하기 쉽다. **실제 등록은 위 5개뿐이다.**

### `data-dg` 이름이 어긋나면 조용히 동작하지 않는다

`viz.js`의 구현이 특정 `data-dg` 값을 `ctx.q()`로 찾는다. 예를 들어
- **D-072**: `cell-{인덱스}`, `cell-cursor`, `row-cursor`, `col-cursor`, `combo`,
  `verdict-text`, `why-1`, `why-2`
- **D-062**: `rec-{인덱스}`, `stage-box`, `stage-label`, `note-1`, `note-2`

SVG를 만들 때 해당 `register()` 블록을 **직접 열어 읽고** 이름을 맞춰야 한다.
`D-012` SVG ↔ `viz.js:575` 짝이 그 대응 관계의 레퍼런스다.

### 컨트롤은 SVG에 넣지 않는다
버튼·슬라이더·셀렉트는 `viz.js`의 `register()` 안에서 `ctx.bindControls`로 생성된다.
SVG는 순수 그래픽 + `data-dg` 훅만 가진다.
