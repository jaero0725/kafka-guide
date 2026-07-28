# Wave 0 — 기반 구축 (단독 에이전트, 동기 실행)

> ⚠️ 이 Wave가 **가장 중요하다.** 이후 19개 에이전트가 여기서 만든 shell/CSS/컴포넌트를
> 그대로 복제한다. 결과물이 만족스러울 때까지 이 단계에서 반복한 뒤 Wave 1로 넘어간다.

`docs/agent-prompts/README.md`의 공통 프리앰블을 앞에 붙여 사용.

---

## 프롬프트

```
당신의 임무는 Kafka Guide 사이트의 **기반 시스템 전체**를 구축하는 것입니다.
당신이 만든 것을 이후 19개 에이전트가 복제합니다. 완성도가 사이트 전체 품질을 결정합니다.

## 소유 경로 (이 밖의 파일은 만들지도, 수정하지도 마세요)
- assets/css/tokens.css, assets/css/main.css, assets/css/code.css
- assets/js/app.js, assets/js/quiz.js, assets/js/progress.js, assets/js/highlight.js
- tools/build-index.mjs, tools/validate.mjs
- basics/ch01.html  ← 레퍼런스 샘플 페이지 (완성본)
- data/questions/basics-ch01.json ← 샘플 문제 10문항
- data/toc.json ← 초기 스켈레톤만 (Wave 4가 최종 생성)
- quiz/index.html, quiz/review.html, quiz/result.html
- index.html ← 최소 스텁만 (Wave 4가 대시보드로 완성)

## 1. 디자인 시스템 (assets/css/tokens.css)

CSS 커스텀 프로퍼티로 토큰을 정의합니다.
- 색: 배경/표면/테두리/본문/보조텍스트/링크/강조(accent) + 시맨틱(info/warn/danger/success/exam)
- 다이어그램 전용 토큰: --diagram-stroke, --diagram-fill, --diagram-accent
- 타이포: 시스템 폰트 스택만 사용 (웹폰트 금지).
  본문 16px/1.7, 코드 14px, 모듈러 스케일로 h1~h4
- 간격: --space-1 ~ --space-8 (4px 배수)
- 반경, 그림자, 최대 본문 폭(--content-max: 76ch)

**다크모드 필수 요건**: `@media (prefers-color-scheme: dark)` 기본값 +
`:root[data-theme="dark"]` / `:root[data-theme="light"]` 명시적 오버라이드가
양방향 모두 미디어쿼리를 이깁니다. 토글이 항상 동작해야 합니다.

성격: 기술 문서 사이트. 차분하고 밀도 높게. 장식 최소. 가독성 최우선.
참고 감각: MDN / Stripe Docs 계열. 화려한 그라디언트·애니메이션 금지.

## 2. 레이아웃 (assets/css/main.css)

- 3단 구조: 좌측 사이드바(섹션 네비) / 본문 / 우측 목차(On this page)
- ≤1024px: 우측 목차 숨김. ≤768px: 사이드바를 햄버거 드로어로.
- **360px에서 가로 스크롤 0.** 표·코드블록·다이어그램은 각자
  `overflow-x:auto` 컨테이너 안에서만 스크롤됩니다. body는 절대 가로 스크롤 금지.
- `docs/CONTENT_STYLE_GUIDE.md` §3-3의 **모든 컴포넌트 클래스를 구현**하세요:
  .objectives / .note(--warn,--danger,--version,--exam) / figure.code + figcaption
  / .config-table / .diff / .quiz-embed / figure.diagram / .breadcrumb / .pager
  / .skip-link / .page__eyebrow / .page__lead
- 코드블록에 **복사 버튼** (JS로 주입, 마크업에 하드코딩하지 않음)
- 인쇄 스타일(@media print): 사이드바·버튼 숨김

## 3. 경량 신택스 하이라이터 (assets/js/highlight.js)

외부 라이브러리 금지이므로 직접 구현합니다.
- 지원 언어: java, properties, bash, json, yaml, sql, python, javascript, xml
- `<code class="lang-*">` 를 찾아 토큰(주석/문자열/키워드/숫자/속성)을 span으로 감쌉니다
- 완벽할 필요 없습니다. 주석·문자열·키워드·숫자만 구분되어도 충분합니다.
- **정규식 치환 전 반드시 HTML 이스케이프.** XSS·마크업 깨짐 방지.
- 100줄 코드블록 20개가 있는 페이지에서 체감 지연이 없어야 합니다.

## 4. 사이트 셸 (assets/js/app.js)

- `data/toc.json`을 fetch해서 `#sidebar-mount`에 사이드바 렌더링
  - **`file://`로 열 때 fetch가 실패하는 문제**: 실패 시 하드코딩된 fallback TOC로
    graceful degradation. 콘솔 에러로 죽지 않게.
- 현재 페이지 하이라이트 (`data-section`/`data-page` 속성 기준)
- 본문 h2/h3를 스캔해 우측 "On this page" 목차 자동 생성 + 스크롤 스파이
- 다크모드 토글 (localStorage `kg:settings`)
- **클라이언트 사이드 전문 검색**: `data/search-index.json` 로드,
  `/` 키로 검색창 포커스, 제목·본문 스니펫 매칭, 결과 즉시 표시.
  인덱스가 없으면 검색 UI를 숨깁니다 (Wave 4에서 생성됨).
- 이전/다음 페이지 pager 자동 생성
- 읽음 처리: 페이지 80% 스크롤 시 `kg:progress:read`에 기록

## 5. 진도 저장 (assets/js/progress.js)

localStorage 키:
```
kg:progress:read   → string[]  (page-id 목록)
kg:progress:quiz   → { [questionId]: { attempts, correct, streak, lastAt } }
kg:progress:exams  → [{ examId, setId, score, total, byDomain, durationSec, at }]
kg:settings        → { theme, fontSize }
```
- 모든 읽기/쓰기는 이 모듈을 통해서만. try/catch로 감싸 저장 실패 시에도 동작.
- 스키마 버전 필드를 두고, 버전 불일치 시 안전하게 초기화.
- 전체 초기화 API 제공.

## 6. 퀴즈 엔진 (assets/js/quiz.js) — 핵심 산출물

`docs/QUESTION_SCHEMA.md` 스키마를 소비합니다.

### 두 가지 진입점
(a) **인라인 위젯**: 콘텐츠 페이지의 `<div class="quiz-embed" data-set="basics-ch04" data-count="10">`
    를 찾아 학습 모드 퀴즈를 렌더링
(b) **퀴즈 허브**: quiz/index.html 에서 모드·세트 선택 후 전체 화면 응시

### 모드
| 모드 | 동작 |
|---|---|
| study | 제출 즉시 정답·explanation·distractorNotes 표시. 문항별 진행 |
| exam | 60문항/90분 타이머, flag 표시, 미답 목록, 마지막 일괄 채점, 종료 확인 다이얼로그 |
| domain | 특정 domain만 필터, 문항 수 선택(10/20/전체) |
| review | kg:progress:quiz에서 오답 문항만 추출. **3회 연속 정답 시 졸업 처리** |
| random | 전체 은행에서 N문항 무작위 |

### 요구사항
- `type: "multiple"`은 체크박스, `single`은 라디오. **부분 정답 없음** (전부 맞아야 정답)
- 선택지 순서 셔플 옵션 (`answer`의 id 매핑이 깨지지 않도록 주의)
- exam 모드: 타이머 0이 되면 자동 제출. 새로고침 대비 진행 상태 localStorage 임시 저장
- **키보드 완주 가능**: 1~5로 선택지 토글, Enter 제출/다음, F로 flag
- `aria-live="polite"`로 채점 결과 안내
- 결과 리포트(quiz/result.html): 총점 / 도메인별 정답률 (순수 CSS 또는 인라인 SVG 바차트,
  차트 라이브러리 금지) / 취약 도메인 Top 3 → 해당 `chapter` 학습 페이지 링크 /
  오답 목록 펼쳐보기 / 소요 시간
- 문항 로딩은 `data/questions/manifest.json`을 먼저 읽어 세트 목록을 파악한 뒤
  필요한 파일만 lazy fetch

## 7. 툴링

### tools/validate.mjs (Node 18+, 의존성 0, 내장 모듈만)
```
node tools/validate.mjs [--links] [--questions] [--html] [--all]
```
- `--links`: 모든 HTML의 상대 링크 대상 파일 존재 여부, 앵커(#id) 존재 여부
- `--questions`: data/questions/*.json 스키마 검증
  → 필수 필드, id 전역 유일성, answer가 choices에 존재,
     모든 오답에 distractorNotes 존재, refs 도메인 화이트리스트,
     difficulty 비율, 정답 분포 편중 경고
- `--html`: CDN 참조 검출(치명), 인라인 style/script 검출, 이미지 alt 누락,
  `--zookeeper` 문자열 검출(치명), h2/h3 id 누락
- 종료 코드: 오류 있으면 1. 파일:라인 형식으로 출력.

### tools/build-index.mjs
- 모든 HTML을 스캔해 `data/toc.json`, `data/search-index.json` 생성
- search-index: { path, title, section, headings[], text (본문 텍스트, 태그 제거, 압축) }
- 인덱스 크기가 1.5MB 넘으면 본문 텍스트를 페이지당 앞 3000자로 절삭하고 경고 출력

## 8. 레퍼런스 샘플 페이지 (basics/ch01.html) — 매우 중요

**"1장 · Kafka 개요와 이벤트 스트리밍"을 완성도 100%로 작성합니다.**
이후 모든 콘텐츠 에이전트가 이 파일을 열어 구조를 복제합니다.
따라서 **CONTENT_STYLE_GUIDE §3-3의 모든 컴포넌트가 최소 1회씩 등장해야 합니다.**

내용 구성:
- 학습 목표 4개
- 왜 Kafka인가: 전통적 메시지 큐 vs 분산 커밋 로그 (비교표)
- 핵심 추상: 이벤트, 토픽, 파티션, 오프셋 (SVG 다이어그램 1개 이상)
- Kafka 생태계 지도: Broker / Producer / Consumer / Connect / Streams /
  Schema Registry / ksqlDB (SVG 다이어그램)
- 대표 사용 사례 4가지
- Kafka 4.x가 이전과 다른 점 (KRaft, KIP-848, Share Groups) — .note--version 사용
- 흔한 오해 3개 — .note--warn 사용
- 시험 포인트 — .note--exam 사용
- 관련 링크 (다른 챕터·치트시트)
- `<div class="quiz-embed" data-set="basics-ch01" data-count="10"></div>`
- 공식 문서 출처

내용의 사실 관계는 WebFetch로 kafka.apache.org에서 확인하세요.

## 9. 샘플 문제 (data/questions/basics-ch01.json)
QUESTION_SCHEMA.md를 정확히 따라 10문항. 퀴즈 엔진 동작 검증용이자
Wave 2 에이전트의 품질 레퍼런스가 됩니다. 대충 만들지 마세요.

## 10. 스텁
- index.html: 최소한의 랜딩 (제목 + 섹션 카드 링크). Wave 4가 대시보드로 확장.
- data/toc.json: 전체 페이지 구조를 미리 반영한 스켈레톤
  (아직 없는 페이지도 항목으로 넣되 `"exists": false` 표시)
- quiz/index.html, quiz/review.html, quiz/result.html: 엔진과 연결된 실동작 페이지

## 완료 조건 (자가 검증)
작업을 마치기 전 다음을 직접 실행해 통과시키세요:
1. `node tools/validate.mjs --all` → 오류 0
2. `node tools/build-index.mjs` → 정상 생성
3. basics/ch01.html 을 Playwright(Chromium, /opt/pw-browsers)로 열어
   - 라이트/다크 모두 스크린샷 (데스크톱 1280px, 모바일 360px)
   - 인라인 퀴즈에서 1문항 실제로 풀어 채점 동작 확인
   - 콘솔 에러 0건 확인
4. quiz/index.html 에서 exam 모드 진입 → 타이머 동작 확인

반환 시 스크린샷 파일 경로와 위 4개 항목의 결과를 명시하세요.
```

---

## 이 Wave 후 사람이 확인할 것

- [ ] `basics/ch01.html` 라이트/다크 스크린샷이 마음에 드는가
- [ ] 360px에서 가로 스크롤이 없는가
- [ ] 인라인 퀴즈가 실제로 채점되는가
- [ ] 코드 하이라이팅이 읽을 만한가
- [ ] 사이드바가 `file://`로 열어도 깨지지 않는가

**이 체크리스트가 통과할 때까지 Wave 1로 넘어가지 않는다.**
