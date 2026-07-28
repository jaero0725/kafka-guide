# 콘텐츠 스타일 가이드 (모든 에이전트 필독)

> 이 문서는 Kafka Guide 사이트의 **모든 콘텐츠 생성 에이전트가 작업 시작 전 반드시 읽어야 하는 계약서**다.
> 여기에 어긋난 산출물은 Wave 3 검증에서 반려된다.

---

## 1. 기술 기준

> 버전 관련 상세 규칙(2.13 혼동, 3-트랙 병기, 레거시 부록)은 **`docs/VERSION_POLICY.md`** 참조. 함께 읽을 것.

### 1-1. Kafka 버전
- **기준 버전: Apache Kafka 4.3.x** (2026-07 기준 최신)
- **`kafka_2.13-4.3.0`의 `2.13`은 Scala 버전이다.** Kafka 버전이 아니다.
  Kafka 2.13이라는 버전은 존재하지 않는다 (2.8 다음이 3.0).
- **KRaft가 유일한 모드다.** ZooKeeper는 4.0에서 완전히 제거되었다.
  - ❌ `--zookeeper localhost:2181` → 존재하지 않는 옵션. 절대 쓰지 말 것
  - ✅ `--bootstrap-server localhost:9092`
  - ZooKeeper 언급은 **"3.x 이전에는 …였다"** 식의 역사적 맥락에서만 허용
- 3.x와 동작이 다른 부분은 다음 박스로 병기한다:
  ```html
  <aside class="note note--version">
    <strong>버전 노트</strong> — Kafka 3.x에서는 …였으나 4.0부터 …로 변경되었습니다.
  </aside>
  ```

### 1-2. 반드시 최신 기준으로 다룰 항목
| 항목 | 상태 |
|---|---|
| KRaft | 4.0부터 유일 모드 |
| KIP-848 새 컨슈머 리밸런스 프로토콜 | 4.0 GA — `group.protocol=consumer` |
| KIP-932 Queues / Share Groups | 4.2부터 production-ready |
| Streams Rebalance Protocol | 4.1 Early Access |
| Tiered Storage | 3.9 GA 이후 안정화 |
| Java 요구사항 | 브로커 Java 17+, 클라이언트 Java 11+ (4.x 기준, 문서에서 재확인할 것) |

### 1-3. 사실 확인 규칙
- **설정명·기본값·CLI 옵션은 반드시 공식 문서에서 확인한 값만 쓴다.** 기억에 의존 금지.
- 확인 도구: `WebFetch`로 https://kafka.apache.org/documentation/ 및 하위 앵커 조회
- 확인 불가능한 수치는 **쓰지 않는다.** "약", "대략" 으로 얼버무리지 말 것.

### 1-4. 출처 정책
- ✅ 허용: `kafka.apache.org`, `cwiki.apache.org` (KIP), `docs.confluent.io`, `developer.confluent.io`, 공식 GitHub
- ❌ **금지: 시험 덤프 사이트** (examtopics, validexamdumps, pass4success, skillcertpro, itexams, examcollection 등)
  - 저작권·자격증 NDA 위반. 문제 복제는 물론 **참조 자체를 금지**한다.
  - 도메인 블루프린트(도메인 이름 목록)만 공식 Confluent 자료에서 가져온다.

---

## 2. 언어와 톤

- **한국어 본문.** 기술 용어는 한국어 뒤 괄호로 원어 병기: `파티션(partition)`, `리밸런스(rebalance)`
- 설정명·클래스명·CLI는 **번역하지 않는다**: `acks`, `max.poll.interval.ms`, `KafkaProducer`
- 톤: **동료 엔지니어에게 설명하듯.** 존댓말(`~합니다`). 과장·감탄사 금지.
  - ❌ "놀랍게도 Kafka는 엄청난 성능을 자랑합니다!"
  - ✅ "Kafka는 순차 디스크 I/O와 페이지 캐시를 활용해 높은 처리량을 얻습니다."
- 한 문단은 3~5문장. 긴 설명은 목록·표·다이어그램으로 분해.
- "쉽게 말해", "즉" 같은 재진술은 개념이 실제로 어려울 때만.

---

## 3. HTML 작성 규칙

### 3-1. 페이지 골격 (모든 콘텐츠 페이지 동일)

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
</head>
<body>
  <a class="skip-link" href="#main">본문 바로가기</a>
  <div id="sidebar-mount" data-section="basics" data-page="ch04"></div>

  <main id="main" class="page" data-page-id="basics/ch04">
    <nav class="breadcrumb" aria-label="경로">…</nav>
    <header class="page__header">
      <p class="page__eyebrow">기본개념 · 4장</p>
      <h1>Producer 심화</h1>
      <p class="page__lead">한 문단 요약</p>
    </header>

    <!-- 본문 섹션들 -->

    <nav class="pager" aria-label="이전/다음">…</nav>
  </main>

  <script src="../assets/js/app.js" defer></script>
  <script src="../assets/js/quiz.js" defer></script>
</body>
</html>
```

> `#sidebar-mount`는 `app.js`가 `data/toc.json`을 읽어 사이드바를 렌더링한다.
> **에이전트는 사이드바 HTML을 직접 작성하지 않는다.**

### 3-2. 필수 규칙
- 외부 CDN·폰트·스크립트 **전면 금지.** 모든 자원은 상대 경로.
- 인라인 `<style>`, `<script>` 금지 (예외: 페이지 고유 SVG 다이어그램은 인라인 허용)
- 상대 경로는 페이지 깊이에 맞게: 루트 하위 1단계면 `../assets/…`
- 시맨틱 태그 사용: `<section>`, `<figure>`, `<figcaption>`, `<aside>`, `<table>` + `<caption>` + `<th scope>`
- 모든 `<h2>`~`<h3>`에 `id` 부여 (목차 앵커용). id는 영문 kebab-case: `id="acks-and-durability"`

### 3-3. 공통 컴포넌트 클래스

| 용도 | 마크업 |
|---|---|
| 학습 목표 | `<section class="objectives">` + `<ul>` |
| 정보 노트 | `<aside class="note">` |
| 주의 | `<aside class="note note--warn">` |
| 위험/함정 | `<aside class="note note--danger">` |
| 버전 노트 | `<aside class="note note--version">` |
| 시험 포인트 | `<aside class="note note--exam">` (CCDAK/CCAAK 어느 도메인인지 명시) |
| 코드 블록 | `<figure class="code"><figcaption>파일명 또는 설명</figcaption><pre><code class="lang-java">…</code></pre></figure>` |
| 설정 표 | `<table class="config-table">` — 컬럼: 설정 / 기본값 / 설명 / 튜닝 포인트 |
| Before/After | `<div class="diff"><div class="diff__before">…</div><div class="diff__after">…</div></div>` |
| 인라인 퀴즈 | `<div class="quiz-embed" data-set="basics-ch04" data-count="10"></div>` |
| 다이어그램 | `<figure class="diagram"><svg …role="img" aria-label="…">…</svg><figcaption>…</figcaption></figure>` |

> `class="lang-*"` 값: `java`, `properties`, `bash`, `json`, `yaml`, `sql`, `python`, `javascript`, `xml`
> `assets/js/highlight.js`가 이 클래스를 읽어 하이라이팅한다.

### 3-4. SVG 다이어그램 규칙
- 직접 작성. 외부 이미지 금지.
- 색상은 `currentColor` 또는 `var(--diagram-*)` 토큰 사용 → 다크모드 자동 대응
- `role="img"` + `aria-label` 필수
- `viewBox` 지정, `width`/`height` 하드코딩 금지 (반응형)

---

## 4. 상호 링크 규칙

콘텐츠는 서로 연결되어야 가치가 생긴다. 각 페이지는 최소 3개의 내부 링크를 포함한다.

| 방향 | 예시 |
|---|---|
| 챕터 → 케이스 | "이 설정을 잘못 두면 어떻게 되는지는 [케이스 3](../cases/case03.html)에서 다룹니다" |
| 챕터 → 치트시트 | "전체 설정 목록은 [설정 치트시트](../cheatsheet/config.html) 참고" |
| 케이스 → 챕터 | "배경 개념은 [6장 전달 보장](../basics/ch06.html) 참고" |
| 자격증 → 챕터 | 도메인별 학습 매핑표 |
| 챕터 → 실무 예제 | "동작하는 코드는 [예제 3](../practice/ex03.html)" |

파일명·경로는 `PLAN.md` §1의 구조를 정확히 따른다. **존재하지 않을 예정인 경로로 링크하지 않는다.**

---

## 5. 접근성

- 색상만으로 정보 전달 금지 (아이콘/텍스트 병기)
- 본문 대비비 4.5:1 이상
- 포커스 링 제거 금지
- 표 헤더 `scope="col"` / `scope="row"`
- 퀴즈: 라디오/체크박스 기반, 키보드만으로 완주 가능, `aria-live`로 채점 결과 안내
- 최소 지원 폭 **360px**

---

## 6. 하지 말아야 할 것

- ❌ ZooKeeper를 현행 아키텍처로 서술 (`basics/appendix-legacy.html` 외에서)
- ❌ "2.13"을 Kafka 버전으로 서술
- ❌ 확인 안 된 설정 기본값·수치 서술
- ❌ 시험 문항 수·합격 점수를 단정 (Confluent 미공개 → "미공개"로 표기)
- ❌ 덤프 문제 복제
- ❌ 외부 CDN 참조
- ❌ 다른 에이전트 소유 파일 수정 (`PLAN.md` §4 소유권 표 준수)
- ❌ `data/toc.json`, `data/search-index.json`, `index.html` 직접 수정 (Wave 4 전용)
- ❌ 사이드바 HTML 하드코딩
- ❌ 이모지 남발 (섹션 헤더 아이콘 용도로만 제한적 사용)
