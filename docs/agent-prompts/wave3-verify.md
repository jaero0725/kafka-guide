# Wave 3 — 적대적 검증 (5 에이전트 병렬, 읽기 전용)

> **핵심 원칙: 만든 사람이 검증하지 않는다.**
> 이 에이전트들은 파일을 **수정하지 않는다.** 발견 사항을 구조화된 리포트로만 반환한다.
> 수정은 리포트를 받은 뒤 별도 단계에서 담당 에이전트가 수행한다.

각 프롬프트 앞에 `README.md` 공통 프리앰블 + 아래 **Wave 3 공통 블록**을 붙인다.

---

## Wave 3 공통 블록

```
## Wave 3 공통 지침

당신은 **검증 에이전트**입니다. 파일을 수정하지 마세요. Write/Edit 도구를 쓰지 마세요.
(예외: 검증 스크립트를 새로 만들어야 하면 scratchpad 디렉터리에만 작성)

### 태도
당신의 임무는 **틀린 것을 찾는 것**입니다. "대체로 괜찮아 보인다"는 실패한 리뷰입니다.
- 기본값·설정명·CLI 옵션은 **하나하나 공식 문서와 대조**하세요. 그럴듯해 보인다고 넘기지 마세요.
- 자신이 확실하지 않으면 PLAUSIBLE로, 문서로 확인했으면 CONFIRMED로 표시하세요.
- 문제를 못 찾았다면 그것도 명시적으로 보고하세요 (빈 리포트 금지 — 무엇을 검사했는지 쓰세요).

### 리포트 형식 (반환 텍스트를 이 형식으로)

## 요약
- 검사 범위: (파일 수, 항목 수)
- CRITICAL: N건 / MAJOR: N건 / MINOR: N건
- 검사했으나 문제 없던 영역: (나열)

## 발견 사항

### [CRITICAL-01] 제목
- 파일: path/to/file.html:123
- 현재: (인용)
- 문제: (무엇이 왜 틀렸는지)
- 근거: (공식 문서 URL — 앵커까지)
- 수정안: (구체적으로 무엇으로 바꿔야 하는지)
- 확신도: CONFIRMED | PLAUSIBLE
- 담당: (어느 Wave1/2 에이전트가 고쳐야 하는지)

(이하 반복)

### 심각도 기준
- CRITICAL: 기술적으로 **틀린 정보** / 문제 정답 오류 / ZooKeeper를 현행으로 서술 /
  CDN 참조 / 저작권 위반 / 사이트가 동작하지 않음
- MAJOR: 오해를 유발하는 서술 / 누락된 필수 토픽 / 깨진 링크 / 접근성 차단
- MINOR: 표현·일관성·스타일
```

---

## C1 — 기술 정확도 검증 (가장 중요)

```
검사 대상: basics/*.html, practice/*.html, cases/*.html, cheatsheet/*.html,
          ccdak/*.html, ccaak/*.html

### 1. 설정값 전수 대조 (최우선)
사이트 전체에서 **설정명과 기본값이 나오는 모든 지점**을 추출한 뒤,
https://kafka.apache.org/documentation/ 의 다음 섹션과 하나씩 대조하세요:
- #brokerconfigs #topicconfigs #producerconfigs #consumerconfigs
- #connectconfigs #streamsconfigs #adminclientconfigs

특히 다음은 **틀리기 쉬우므로 반드시 확인**:
- message.max.bytes (1MB인가? 정확한 바이트 값은?)
- max.request.size / fetch.max.bytes / max.partition.fetch.bytes / replica.fetch.max.bytes
- max.poll.interval.ms / session.timeout.ms / heartbeat.interval.ms / max.poll.records
- acks / enable.idempotence / max.in.flight.requests.per.connection (4.x 기본값)
- unclean.leader.election.enable (4.x 기본값)
- min.insync.replicas / replication.factor / num.partitions
- retention.ms / segment.bytes / min.cleanable.dirty.ratio / delete.retention.ms
- isolation.level / auto.offset.reset
- delivery.timeout.ms / request.timeout.ms / linger.ms / batch.size
- partition.assignment.strategy / group.protocol

**기본값이 사이트와 문서에서 다르면 전부 CRITICAL입니다.**

### 2. ZooKeeper 잔재 검사
- 모든 HTML에서 `--zookeeper`, `zookeeper.connect`, `zkClient`, ZK 포트 2181 검색
- 발견 시: `docs/VERSION_POLICY.md`가 허용하는 **역사적 맥락 / 레거시 부록**
  안에 있는지 확인. 그 밖이면 CRITICAL.

### 3. 버전 정보 검증 (docs/VERSION_POLICY.md 기준)
- §2의 "버전 병기 필요 항목" 표 10개 행이 **실제로 정확한지** 릴리스 노트로 검증
  (https://kafka.apache.org/blog/releases/ 및 각 릴리스 노트)
- `basics/appendix-legacy.html`의 버전 타임라인이 정확한지 (2.4/2.8/3.0/3.3/3.6/3.9/4.0/4.1/4.2)
- "kafka_2.13-x.y.z의 2.13은 Scala 버전"이 ch01·appendix·cli 치트시트에
  실제로 서술되어 있는지 (없으면 MAJOR)
- 4.x에서 Java 최소 버전, 지원 Scala 버전이 정확한지

### 4. 자격증 정보 확정 (Wave 1에서 미해결로 남은 항목)
- **CCAAK 도메인 가중치**를 Confluent 공식 자료로 확정하세요.
  → 확정했으면 정확한 값을, 확정 못 했으면 "공식 미공개/확인 불가"를 명확히 보고.
  → **덤프 사이트에서 가져온 숫자는 근거로 인정하지 않습니다.**
- CCDAK 도메인 가중치(28/23/15/13/12/8)도 동일하게 재확인
- 문항 수·합격 점수가 사이트 어딘가에 **단정적으로 서술**되어 있지 않은지 검사
  (Confluent 미공개 사항이므로 단정하면 CRITICAL)
- 응시료·시간·유효기간·재응시 대기 재확인

### 5. 예외 클래스명·로그 메시지 검증
cases/*.html 의 로그 스니펫과 예외명이 실재하는지 확인.
Kafka 소스(github.com/apache/kafka)나 공식 문서로 대조.
지어낸 로그 메시지는 CRITICAL.

### 6. 커버리지 감사
docs/CCDAK_TOPIC_CHECKLIST.md 의 A1~I1 **전 항목**에 대해:
- 본문 어느 페이지에서 다뤄지는가 (경로:줄 번호로 명시)
- "반드시 다룰 포인트" 세부 항목이 실제로 서술되어 있는가
- 누락 시 MAJOR로 보고 (어느 챕터에 추가해야 하는지 명시)

특히 다음은 서술이 미묘하므로 정확성을 집중 검사:
- A4: 키 없는 메시지 파티셔닝이 "순수 라운드로빈"으로만 서술되어 있으면 부정확.
  sticky partitioning(2.4+)과 시험에서의 "round-robin" 표현을 **둘 다** 설명해야 함
- E1: source는 Connect 내부 offset 토픽, sink는 __consumer_offsets — 뒤바뀌지 않았는지
- F3: mapValues는 리파티션 미유발, map/selectKey는 유발 — 정확한지
- H1: BACKWARD면 컨슈머 먼저, FORWARD면 프로듀서 먼저 — 뒤바뀌지 않았는지
- D1: isolation.level은 컨슈머 설정 — 프로듀서 설정으로 잘못 쓰지 않았는지

### 7. 저작권 검사
- danielsobrado/CCDAK-Exam-Questions (CC BY-NC-ND 4.0)의 문장이
  사이트나 문제은행에 복제·변형되어 들어갔는지 표본 검사
- 덤프 사이트 URL이 refs나 링크에 들어갔는지 전수 검색 → 발견 시 CRITICAL
```

---

## C2 — 문제 정답·해설 검증

```
검사 대상: data/questions/*.json 전체 (약 620문항)

### 방법
문항 수가 많으므로 **전수 + 표본 심층**의 2단계로 진행하세요.

**1단계 — 전수 기계 검사** (scratchpad에 스크립트를 짜서 실행)
- 스키마 위반
- id 중복
- answer가 choices에 없는 경우
- distractorNotes 누락 (오답 중 하나라도 빠지면)
- refs가 비었거나 비공식 도메인
- 정답 분포 편중 (한 선택지가 세트 내 35% 초과)
- **유형 분포**: single/multiple/matching/ordering 비율이 계획(60/15~20/12~15/8~10)에서
  크게 벗어난 세트 → matching/ordering이 0개인 세트는 MAJOR
- `matching`: pairs 3~6개, id 유일, right 값 중복, extraRights와 정답 겹침
- `ordering`: items 4~6개, answer 길이 일치, answer의 id가 전부 items에 존재
- 선택지 길이 편향 (정답이 항상 최장이면 경고)
- explanation이 60자 미만 (성의 없음)
- chapter 필드 누락 또는 존재하지 않는 챕터 참조

**2단계 — 표본 심층 검증**
다음을 **전부** 심층 검증하세요 (표본이 아니라 전수):
- `difficulty: "hard"` 문항 전부
- 설정 기본값을 묻는 문항 전부 (공식 문서 대조)
- `type: "multiple"` 문항 전부 (복수 정답 문제는 오류율이 높습니다)
- **`type: "matching"` 문항 전부** — 쌍 대응이 실제로 1:1로 확정되는가,
  두 left가 같은 right를 가질 수 있으면 애매한 문항(MAJOR),
  extraRights가 실제로는 정답이 될 수 있으면 CRITICAL
- **`type: "ordering"` 문항 전부** — 순서가 객관적으로 하나로 확정되는가,
  병렬 가능한(순서가 바뀌어도 되는) 단계가 섞여 있으면 CRITICAL,
  items 배열이 정답 순서로 저장되어 있으면 유출 위험(MINOR)
- CCDAK_TOPIC_CHECKLIST 태그가 달린 문항 전부

나머지 문항은 세트별 20% 무작위 표본.

### 각 문항에서 확인할 것
1. **정답이 실제로 정답인가** — 공식 문서로 근거 확인
2. **오답이 실제로 오답인가** — 조건에 따라 맞을 수도 있는 선택지가 있으면
   문제가 애매한 것. MAJOR로 보고
3. **정답이 둘 이상 성립하지 않는가** (single 타입인데 복수 정답 가능) → CRITICAL
4. **explanation이 정답을 실제로 설명하는가** — 동어반복이면 MAJOR
5. **refs URL이 실제로 그 내용을 담고 있는가** — WebFetch로 표본 확인.
   404이거나 무관한 페이지면 MAJOR
6. **문제문이 사이트 본문과 모순되지 않는가** — 해당 chapter의 HTML과 대조.
   모순은 CRITICAL (어느 쪽이 맞는지도 판정해서 보고)
7. **버전 의존 문항에 버전이 명시되어 있는가**

### 리포트 추가 요구사항
공통 형식에 더해 다음 표를 포함하세요:

| 세트 | 검사 문항 | CRITICAL | MAJOR | MINOR |

그리고 **정답이 틀린 문항 목록**을 별도로 뽑아 주세요:
| id | 현재 answer | 올바른 answer | 근거 URL |
```

---

## C3 — 링크 · 스키마 · 빌드 검증

```
### 1. tools/validate.mjs 전체 실행
node tools/validate.mjs --all
→ 출력 전문을 리포트에 포함. 오류가 있으면 파일별로 분류.

### 2. 링크 무결성 (스크립트가 놓치는 것)
- 모든 상대 경로 링크의 대상 파일 존재 확인
- 앵커 링크(#id)의 대상 id가 실제 그 페이지에 있는지
- **외부 URL 생존 확인**: refs와 "공식 문서 출처" 섹션의 URL을
  WebFetch로 표본 확인 (404, 리다이렉트, 앵커 소실)
  → 앵커가 사라진 경우가 흔합니다 (Kafka 문서가 개편되면서)
- 상호 링크 최소 3개 규칙(CONTENT_STYLE_GUIDE §4) 위반 페이지 목록

### 3. 자산 무결성
- **CDN/외부 호스트 참조 전수 검색** (`http://`, `https://` 로 시작하는
  src/href 중 문서 링크가 아닌 것) → 발견 시 CRITICAL
- 인라인 <style>, <script> 검출 (SVG 제외)
- 모든 CSS 클래스가 assets/css에 실제로 정의되어 있는지
  → 정의되지 않은 클래스를 쓰는 페이지 목록 (스타일이 안 먹습니다)
- 반대로, 정의됐지만 아무도 안 쓰는 클래스 목록 (MINOR)

### 4. 데이터 무결성
- data/toc.json의 모든 항목이 실제 파일과 대응하는지
- manifest.json의 세트가 실제 파일과 개수까지 일치하는지
- quiz-embed의 data-set 값이 실제 존재하는 setId인지
  → **이게 틀리면 퀴즈가 로드되지 않습니다. 전수 확인 필수**
- 문항의 chapter 값이 실제 존재하는 페이지인지

### 5. 실제 렌더링 검증 (Playwright, Chromium /opt/pw-browsers)
- **모든 페이지를 순회**하며 콘솔 에러/경고 수집 → 페이지별 목록
- 404 네트워크 요청 수집
- 각 페이지의 문서 스크롤 폭 > 뷰포트 폭인지 확인 (360px에서) → 가로 스크롤 검출
- quiz/index.html에서 각 모드(study/exam/domain/review/random) 진입 후
  1문항씩 실제 응답 → 채점 동작 확인
- localStorage 초기화 후 재방문 시 정상 동작 확인
```

---

## C4 — UI/UX · 접근성 · 일관성 검증

```
### 1. 시각적 일관성 (8개 콘텐츠 에이전트가 만든 결과의 톤 편차 검출)
Playwright로 각 섹션 대표 페이지 스크린샷 (라이트/다크 × 1280px/360px):
basics/ch01, ch03, ch05, ch09, ch11, appendix-legacy,
practice/ex01, ex05, cases/case01, case07,
cheatsheet/cli, config, troubleshooting,
ccdak/index, ccdak/domain-app-development,
ccaak/index, ccaak/domain-security, quiz/index

비교 항목:
- 제목 계층·간격이 페이지마다 다른가
- 표 스타일이 통일되어 있는가
- .note 박스 사용 패턴이 일관적인가 (어떤 페이지는 남발, 어떤 페이지는 전무)
- 코드블록 캡션 유무가 들쭉날쭉한가
- SVG 다이어그램의 선 굵기·폰트 크기·색이 페이지마다 다른가 ← 가장 흔한 편차
- 페이지 도입부 구조(eyebrow/h1/lead)가 통일되어 있는가

**편차를 발견하면 "어느 페이지를 기준으로 어떻게 맞춰야 하는지" 명시하세요.**
기준은 basics/ch01.html (Wave 0 레퍼런스)입니다.

### 2. 다크모드
- 모든 대표 페이지에서 라이트/다크 전환 시 깨지는 요소 검출
- **SVG 다이어그램이 다크모드에서 안 보이는 경우** (하드코딩된 #000 등) ← 최다 발생
- 코드 하이라이팅 대비
- .note 박스 배경/텍스트 대비
- 토글이 미디어쿼리를 양방향으로 이기는지 (라이트 선호 사용자가 다크로,
  다크 선호 사용자가 라이트로 전환 가능한지)

### 3. 반응형
- 360px / 768px / 1024px / 1280px
- 가로 스크롤 발생 페이지
- 표·코드블록이 자체 컨테이너에서 스크롤되는가 (body가 밀리면 안 됨)
- 모바일에서 사이드바 드로어 동작
- 터치 타겟 크기 (퀴즈 선택지 44px 이상)

### 4. 접근성
- 대비비 4.5:1 (본문), 3:1 (큰 텍스트·UI 요소) — 라이트/다크 **양쪽**
- 제목 계층 건너뜀 (h2 다음 h4)
- 표에 scope 속성, caption
- SVG에 role="img" + aria-label
- 폼 요소에 레이블
- 포커스 표시 제거 여부
- **키보드만으로 퀴즈 완주** — 실제로 Tab/화살표/Enter만으로 시도해 보고 결과 보고
- 스크린리더 관점: 채점 결과가 aria-live로 안내되는가
- skip-link 동작

### 5. 사용성
- 검색 기능이 실제로 유용한가 (대표 질의 10개로 테스트:
  "acks", "리밸런스", "max.poll.interval.ms", "컴팩션", "SASL",
  "409", "isolation level", "co-partition", "2.13", "SMT")
  → 원하는 페이지가 상위에 나오는가
- 치트시트의 필터 입력이 동작하는가
- 퀴즈 결과 리포트의 복습 링크가 올바른 챕터로 가는가
- 진도 대시보드가 실제 진도를 반영하는가
- 이전/다음 pager가 논리적 순서인가
```

---

## C5 — 시각화 검증 (신규)

```
검사 대상: assets/diagrams/*.svg (87개), 그리고 이를 참조하는 HTML 플레이스홀더

다이어그램은 **틀리면 글보다 강하게 오학습을 만듭니다.** 텍스트보다 엄격하게 보세요.

### 1. 기계 검사 (tools/validate.mjs --diagrams + 직접 스크립트)
- 하드코딩 색: `#000`, `#fff`, `black`, `white`, `fill="#`, `stroke="#` → **전부 CRITICAL**
- `width=`/`height=` 하드코딩, `viewBox` 누락
- `role="img"` / `<title>` / `<desc>` / `aria-labelledby` 누락
- `font-family` 지정
- `<script>` 태그 존재 (금지)
- 외부 참조(`href="http`, `xlink:href` 외부, `@import`)
- 파일 크기 20KB 초과
- base64 데이터 URI
- **양방향 일치**: HTML의 모든 data-diagram ID ↔ 실제 SVG 파일
  → 참조는 있는데 파일 없음 (CRITICAL — 빈 칸으로 배포됨)
  → 파일은 있는데 참조 없음 (MAJOR — 고아 파일)
- DIAGRAM_CATALOG.md에 없는 ID 사용
- viewBox 폭이 720이 아닌 파일

### 2. 사실 정확성 검증 (가장 중요)
다이어그램이 표현하는 **내용이 맞는지** 공식 문서로 대조하세요.
아래는 특히 틀리기 쉬운 것들입니다. **전부 확인하세요.**

- **D-030 / D-036**: 콜백이 Sender 스레드에서 실행되는가? 애플리케이션 스레드로
  그려져 있으면 CRITICAL. 파이프라인 단계 순서가 맞는가?
- **D-032**: acks=0/1/all 각각의 유실 지점이 정확한가?
- **D-033**: 멱등성이 PID + 파티션별 시퀀스 번호 기반인가? 중복 판별 주체가 브로커인가?
- **D-034**: 키 없는 메시지가 "순수 라운드로빈"으로만 그려져 있으면 부정확 (MAJOR).
  sticky batching이 표현되어야 함
- **D-042**: 하트비트 축과 poll 축이 **분리**되어 있는가?
  session.timeout.ms와 max.poll.interval.ms를 같은 축에 그렸으면 CRITICAL
- **D-040 / D-046**: 파티션 할당 알고리즘이 실제 동작과 일치하는가?
  → Range/RoundRobin/Sticky/CooperativeSticky 각각 실제로 시뮬레이션해서
     결과가 Kafka 구현과 맞는지 확인. **대충 나눠놨으면 MAJOR**
- **D-052**: LSO 위치와 read_committed 가시성 범위가 맞는가?
- **D-054**: EOS 경계선이 Kafka 내부/외부를 정확히 가르는가?
- **D-061**: 삭제가 세그먼트 단위로 표현되었는가? 레코드 단위로 그렸으면 CRITICAL
- **D-062**: 활성 세그먼트가 컴팩션 대상에서 제외되어 있는가? tombstone 처리가 맞는가?
- **D-071**: wire format 바이트 수가 맞는가? (magic 1 + schema id 4)
- **D-072**: **호환성 매트릭스의 모든 셀을 공식 문서로 검증.** 이 다이어그램이
  틀리면 실무에서 장애를 만듭니다. 셀 하나하나 확인하세요
- **D-073**: BACKWARD → 컨슈머 먼저 / FORWARD → 프로듀서 먼저. 뒤바뀌었으면 CRITICAL
- **D-081**: source는 Connect offset 토픽, sink는 `__consumer_offsets`.
  뒤바뀌었으면 CRITICAL
- **D-082**: source와 sink의 SMT/converter 순서가 서로 반대인가?
- **D-093**: co-partitioning 3요건이 맞는가? GlobalKTable 예외가 표현되었는가?
- **D-094**: map은 리파티션 유발, mapValues는 미유발. 뒤바뀌었으면 CRITICAL
- **D-101**: listeners / advertised.listeners / protocol.map 관계가 정확한가?
- **D-106**: 버전 타임라인의 각 항목이 실제 릴리스와 맞는가? (릴리스 노트로 대조)
- **D-119**: 5개 메시지 크기 설정의 소속(브로커/토픽/프로듀서/컨슈머)이 맞는가?
- **D-133**: 설정값 관계도의 모든 간선이 실제 의존 관계인가?
  → 존재하지 않는 관계를 그렸으면 MAJOR. 이 다이어그램은 시험 직전 복습용이라
     틀리면 피해가 큽니다

### 3. 일관성 검증 (V1/V2/V3 세 에이전트의 편차)
Playwright로 87개를 전부 렌더링해 비교하세요.
- 선 굵기가 파일마다 다른가 (--dg-sw-1/2 외 값 사용)
- 텍스트 크기가 파일마다 다른가
- 노드 모양·모서리 반경이 다른가
- 화살표 머리 스타일이 다른가
- 레이블 배치 관행이 다른가 (안 vs 밖)
- 강조 사용이 과한 파일 (전부 accent면 강조가 없는 것)
- 여백이 극단적으로 다른가

**기준은 `assets/diagrams/D-012-offset-anatomy.svg`** (Wave 0 레퍼런스)입니다.
편차를 발견하면 어느 파일을 어떻게 맞춰야 하는지 명시하세요.

### 4. 다크모드 검증 (최다 발생 결함)
- 87개 전부 라이트/다크 스크린샷
- **다크에서 선이나 텍스트가 안 보이는 파일 목록** — 토큰을 잘못 쓴 것
- 대비비 3:1 미달 요소
- 반투명(`opacity`, `fill-opacity`) 사용 시 다크에서 뭉개지는지

### 5. 반응형·가독성
- 360px 폭으로 축소해 렌더링 → **텍스트를 읽을 수 있는가**
  → 못 읽는 파일 목록. 13px 미달 텍스트를 쓴 것
- 다이어그램이 자체 컨테이너에서 스크롤되는가 (body를 밀지 않는가)

### 6. 인터랙티브 검증 (8종 + V1 추가분)
D-012, D-034, D-040, D-046, D-062, D-064, D-072, D-133

각각에 대해 실제로 조작하며 확인:
- 컨트롤이 동작하는가
- **키보드만으로 조작 가능한가** (Tab으로 도달, Enter/Space/화살표로 조작)
  → div+click으로 만든 컨트롤이 있으면 CRITICAL (접근성 차단)
- `prefers-reduced-motion: reduce`에서 애니메이션이 제거되는가
- JS 없이도 초기 상태가 의미를 전달하는가
- 상태 변화가 `aria-live`로 안내되는가
- 조작을 반복해도 상태가 깨지지 않는가 (경계값: 컨슈머 0명, 파티션 1개 등)
- 같은 페이지에 인터랙티브 다이어그램이 2개 있어도 서로 간섭하지 않는가
  (SVG 내부 id 충돌)

### 리포트 추가 요구사항
공통 형식에 더해:

| 다이어그램 | 사실정확성 | 다크모드 | 360px | 접근성 |
|---|:--:|:--:|:--:|:--:|

그리고 **다시 그려야 하는 파일 목록**을 별도로:
| ID | 문제 | 담당(V1/V2/V3) | 수정 범위(부분/전면) |
```

---

## Wave 3 이후 처리

1. 4개 리포트를 병합해 CRITICAL 목록을 만든다.
2. 각 항목의 "담당" 필드에 따라 **원래 만든 에이전트를 재실행**해 수정한다
   (SendMessage로 컨텍스트를 유지한 채 이어서 지시하는 것이 효율적).
3. 수정 후 C1·C2·C3·C5를 **재실행**해 CRITICAL 0을 확인한다.
4. CRITICAL 0이 되기 전에는 Wave 4로 넘어가지 않는다.

### CCDAK 우선 처리 원칙

CRITICAL이 많아 전부 처리할 시간이 없다면 **이 순서로** 처리한다.
1. CCDAK 문항의 정답 오류 (C2) — 오학습 직결
2. CCDAK ★★★ 다이어그램의 사실 오류 (C5)
3. ch04·ch05·ch06·ch02·ch07·ch08 본문의 기술 오류 (C1) — App Dev + Fundamentals 51%
4. 사이트가 동작하지 않는 결함 (C3)
5. 접근성 차단 (C4, C5)
6. 나머지

CCAAK 관련 MAJOR/MINOR는 마지막이다.
