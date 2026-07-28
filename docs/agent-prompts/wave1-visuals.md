# Wave 1 — 시각화 (3 에이전트, 콘텐츠 에이전트와 병렬)

`README.md` 공통 프리앰블 + 아래 **시각화 공통 블록**을 붙여 사용.

---

## 시각화 공통 블록 (V1~V3 전부에 포함)

```
## 당신의 역할

당신은 **다이어그램 전담 에이전트**입니다. HTML 콘텐츠는 만들지 않습니다.
`assets/diagrams/` 아래 **독립 SVG 파일만** 만듭니다.

이유: 콘텐츠 에이전트 8명이 동시에 HTML을 쓰고 있습니다. 당신이 HTML을 건드리면
작업이 충돌해 유실됩니다. 콘텐츠 에이전트는 플레이스홀더만 넣고, Wave 4가
당신의 SVG를 그 자리에 정적 삽입합니다.

## 시작 전 반드시 읽으세요
1. docs/DIAGRAM_CATALOG.md      ← 당신의 작업 명세. §2 작성 규칙을 한 글자도 어기지 마세요
2. assets/css/viz.css           ← 사용 가능한 토큰 목록. 여기 없는 색을 쓰면 안 됩니다
3. assets/js/viz.js             ← 인터랙티브 프리미티브와 registerViz 규약
4. assets/diagrams/D-012-offset-anatomy.svg  ← Wave 0이 만든 레퍼런스.
   구조·네이밍·주석 스타일을 그대로 복제하세요

## 파일명
assets/diagrams/{ID}-{영문-kebab-slug}.svg
예: D-030-producer-pipeline.svg, D-040-rebalance-simulator.svg

## 절대 규칙 (위반 시 Wave 3 C5에서 CRITICAL)
- 색 하드코딩 금지. `#000`, `#fff`, `black`, `white`, 임의 hex 전부 금지.
  `var(--dg-stroke)`, `var(--dg-fill)`, `var(--dg-accent)`, `var(--dg-muted)`,
  `var(--dg-danger)`, `var(--dg-ok)`, `var(--dg-warn)`, `var(--dg-text)`,
  `currentColor` 만 사용.
- `width`/`height` 속성 금지. `viewBox="0 0 720 H"` 만. 폭은 720 고정.
- `role="img"` + `<title id>` + `<desc id>` + `aria-labelledby` 전부 필수.
- `font-family` 지정 금지. 크기는 `class="dg-fs-sm|md|lg"`.
- 최소 텍스트 13px 상당. 360px 화면에서 약 0.5배로 줄어들므로 그보다 작으면 못 읽습니다.
- `<script>` 태그 금지. 인터랙티브 로직은 viz.js의 registerViz로 등록.
- 개당 20KB 이하. base64 이미지 금지. 외부 참조 금지.
- 색만으로 정보 구분 금지 — 레이블/패턴/모양을 병기.
- 한국어 텍스트 사용 (설정명·클래스명은 원문 그대로).

## 사실 정확성
다이어그램은 틀리면 글보다 더 강하게 오학습을 만듭니다.
- 표현하는 내용이 사실인지 **WebFetch로 kafka.apache.org에서 확인**하세요.
- 순서·방향·소속(어느 스레드인지, 어느 컴포넌트가 소유하는지)을 특히 주의.
- 확인 못 한 내용은 다이어그램에 넣지 말고 반환 리포트에 남기세요.

## 품질 기준
- **한 다이어그램은 한 가지를 설명한다.** 욕심내서 다 넣으면 아무것도 전달 안 됩니다.
- 시선 흐름은 좌→우 또는 위→아래. 화살표가 교차하면 배치를 다시 하세요.
- 레이블은 도형 안에. 밖에 두고 지시선을 그리는 건 자리가 없을 때만.
- 여백을 두세요. 720 폭을 꽉 채우지 마세요.
- **핵심 경로 하나를 `--dg-accent`로 강조**하고 나머지는 `--dg-stroke`/`--dg-muted`로.
  전부 강조하면 강조가 없는 것과 같습니다.

## 완료 전 자가 검증
1. `node tools/validate.mjs --diagrams` → 당신 파일 오류 0
2. Playwright(Chromium, /opt/pw-browsers)로 각 SVG를 **라이트/다크 양쪽**에서 렌더링해
   스크린샷. 다크모드에서 안 보이는 요소가 있으면 토큰 사용이 틀린 것입니다.
3. 360px 폭으로 축소해 텍스트 가독성 확인
4. 인터랙티브 다이어그램은 실제로 컨트롤을 조작해 동작 확인 + 키보드만으로 조작 확인

## 반환할 것
- 만든 파일 목록 (ID, 파일명, 무엇을 표현했는지 한 줄)
- 라이트/다크 스크린샷 경로
- 카탈로그 명세와 다르게 만든 것이 있으면 무엇을 왜 바꿨는지
- 사실 확인 실패로 생략한 요소
- 콘텐츠 에이전트에게 전달할 사항 (figcaption에 들어가면 좋을 설명 등)
```

---

## V1 — ch04·ch05 다이어그램 (22개) ★ 최우선

```
## 왜 당신이 가장 중요한가

CCDAK의 **Application Development 도메인이 28%로 최대 비중**이고, 그 내용이
정확히 ch04(Producer)와 ch05(Consumer)입니다. 여기 다이어그램이 좋으면
합격률이 올라갑니다. 22개 중 20개가 ★★★입니다.

## 담당 파일 (docs/DIAGRAM_CATALOG.md 참조)

### ch02에서 가져온 2개 (오프셋·복제는 Producer/Consumer 이해의 전제)
- D-013  복제와 ISR — 리더/팔로워, ISR 축소 시 min.insync.replicas 미달
  (D-012는 Wave 0이 이미 만들었습니다. 열어서 기준으로 삼되 수정하지 마세요.)

### ch04 — Producer (8개, 전부 ★★★)
- D-030  Producer 전송 파이프라인
  → send() → 직렬화 → 파티셔너 → RecordAccumulator → Sender 스레드 → 브로커 → 콜백
  → **어느 단계가 애플리케이션 스레드이고 어느 단계가 Sender 스레드인지 색으로 구분.**
     이 구분이 이 다이어그램의 핵심 가치입니다.
- D-031  배치와 linger.ms 타임라인
  → batch.size 도달 vs linger.ms 만료, 먼저 오는 쪽에 전송. 2가지 시나리오 병치
- D-032  acks 0/1/all 시퀀스 비교
  → 3개 시퀀스를 나란히. 각 경우 브로커 장애 시 **유실 지점을 X 마크와 --dg-danger로**
- D-033  멱등성 중복 판별
  → PID + 파티션별 시퀀스 번호. 재시도로 같은 시퀀스가 다시 와서 브로커가 폐기하는 과정
- D-034 🖱 키 있음/없음 파티셔닝  ← 인터랙티브
  → 키 있으면 murmur2(key)%N 결정적, 키 없으면 sticky batching
  → 버튼으로 메시지 전송 → 파티션 분배 관찰. 키 입력 필드 제공
  → **"순수 라운드로빈"과 sticky의 차이가 눈에 보여야 합니다.**
     시험에서는 "round-robin"으로 출제되기도 하므로 두 모드를 토글로 비교
- D-035  압축 트레이드오프 — gzip/snappy/lz4/zstd, 압축률 vs CPU vs 지연
- D-036  onCompletion() 호출 시점 타임라인  ★★★
  → send() 즉시 반환 → 배치 대기 → 전송 → 브로커 응답 → **Sender 스레드에서 콜백**
  → 애플리케이션 스레드와 Sender 스레드를 두 개의 수평 레인으로 그리고,
     콜백이 어느 레인에서 일어나는지 명확히. **가장 자주 틀리는 개념입니다.**
- D-037  재시도와 delivery.timeout.ms 예산
  → request.timeout.ms × 재시도 횟수 ≤ delivery.timeout.ms 포함 관계를 중첩 막대로

### ch05 — Consumer (8개, 전부 ★★★)
- D-040 🖱 **리밸런스 시뮬레이터**  ← 이 사이트의 대표 시각화. 가장 공들이세요
  → 파티션 8개 + 컨슈머 N명 (1~5명)
  → 버튼: 컨슈머 추가 / 제거 / 크래시
  → 셀렉트: 할당 전략 (Range / RoundRobin / Sticky / CooperativeSticky)
  → 할당 변화를 애니메이션으로. reduced-motion이면 즉시 전환
  → 전략별로 **같은 조작에 대해 결과가 다르다는 것**이 보여야 합니다
     (Sticky는 기존 할당 유지, Range는 뭉치는 경향 등)
  → 실제 할당 알고리즘을 정확히 구현하세요. 대충 나누면 학습에 해가 됩니다
- D-041  poll 루프 내부 동작
  → fetch 요청 → 내부 버퍼 큐 → max.poll.records 만큼 반환 → 처리 → 커밋
  → **poll()이 네트워크 호출이 아니라 버퍼에서 꺼내는 것일 수 있다**는 점 표현
- D-042  타임아웃 4종 타임라인  ★★★
  → heartbeat.interval.ms / session.timeout.ms / max.poll.interval.ms / max.poll.records
  → **하트비트 축과 poll 축을 별개의 수평 레인으로 분리.** 이게 핵심입니다.
     백그라운드 스레드가 하트비트를 보내는 동안 처리가 길어지면
     session은 안 터지고 max.poll.interval이 터진다는 것을 보여야 합니다
  → 정상 / 처리 지연으로 max.poll.interval 초과 2가지 시나리오
- D-043  eager vs cooperative 리밸런스
  → 전체 회수(stop-the-world) vs 증분 재할당. 처리 중단 구간을 --dg-danger로
- D-044  assign() vs subscribe()
  → 그룹 코디네이터 참여 여부, 리밸런스 유무, group.id 필요 여부를 좌우 비교
- D-045  커밋 시점별 유실/중복
  → 처리 전 커밋(크래시 시 유실) vs 처리 후 커밋(크래시 시 중복). 크래시 지점 표시
- D-046 🖱 파티션 할당 전략 4종 비교  ← 인터랙티브
  → 같은 조건에서 4개 전략의 할당 결과를 2×2로 나란히
  → 컨슈머 수·파티션 수·토픽 수 조절 슬라이더
  → D-040과 로직을 공유할 수 있으므로 viz.js에 할당 알고리즘을 공통 함수로 두고
     양쪽에서 쓰세요 (viz.js는 Wave 0 소유이므로 **수정하지 말고**,
     각 SVG의 registerViz 콜백 안에 알고리즘을 두거나 중복 구현하세요.
     viz.js에 공통 함수가 필요하다면 반환 리포트에 요청으로 남기세요)
- D-047  static membership — group.instance.id로 재시작 시 리밸런스 회피

## 총 18개 + 아래 4개 = 22개

### 추가 4개 (ch04·ch05의 Observability 연계 — CCDAK 13% 도메인)
카탈로그에 없으므로 당신이 ID를 부여하세요: D-038, D-039, D-048, D-049
- D-038  프로듀서 핵심 메트릭 지도 — record-send-rate, record-error-rate,
         request-latency-avg, buffer-available-bytes가 어느 단계를 관측하는지
         → D-030 파이프라인 위에 메트릭 관측 지점을 겹쳐 표시하면 효과적
- D-039  프로듀서 지연 분해 — 배치 대기 / 전송 / 브로커 처리 / 응답 각 구간
- D-048  컨슈머 lag의 정확한 정의 — LEO - committed offset, 어디를 재는지
- D-049  컨슈머 lag 측정 3가지 방법 비교 — CLI / 클라이언트 메트릭 / 브로커 메트릭,
         각각 무엇을 측정하고 어떤 함정이 있는지

이 4개를 추가하면 카탈로그와 어긋나므로, **반환 리포트에 신규 ID와 내용을 명시**하세요.
Wave 4가 카탈로그를 갱신하고 콘텐츠 에이전트에게 플레이스홀더 추가를 요청합니다.
```

---

## V2 — ch06~ch10 다이어그램 (27개) ★

```
CCDAK의 Fundamentals(23%) 일부 + Connect(15%) + Streams(12%)를 담당합니다.
합쳐서 시험의 절반에 가깝습니다.

## 담당 파일

### ch06 — 전달 보장·트랜잭션 (5개, 전부 ★★★)
- D-050  3가지 전달 보장 비교 — at-most/at-least/exactly-once.
         설정 조합과 결과(유실/중복)를 매트릭스처럼
- D-051  트랜잭션 흐름 — initTransactions → beginTransaction → send/sendOffsets
         → commit/abort. 트랜잭션 코디네이터와 __transaction_state 포함
- D-052  read_committed와 LSO — 진행 중 트랜잭션 때문에 그 뒤의 커밋된 메시지도
         보이지 않는 상황. **이게 지연을 만든다는 점**이 핵심
- D-053  consume-transform-produce — 오프셋 커밋이 트랜잭션에 포함되는 구조
- D-054  **EOS의 경계**  ← 가장 중요
         → Kafka 내부(토픽→토픽)는 EOS 성립, 외부 DB/HTTP 호출은 성립 안 함
         → 경계선을 명확히 그리고, 경계 밖에서는 컨슈머 멱등성이 필요함을 표현
         → "EOS 켜면 DB 중복도 막힌다"는 오해를 깨는 것이 목적

### ch07 — 스토리지 (5개)
- D-060  로그 세그먼트 물리 구조 (★★) — 활성 세그먼트 + 봉인 세그먼트,
         .log/.index/.timeindex 파일
- D-061  retention 삭제 단위 (★★★) — **세그먼트 단위로 삭제**되므로
         segment.ms/segment.bytes가 실제 보관량을 좌우. retention.ms만 믿으면 안 됨
- D-062 🖱 컴팩션 before/after (★★★) ← 인터падактив
         → 키 중복 로그 → 컴팩션 실행 버튼 → 키별 최신값만 남음
         → tombstone(null value) 처리, delete.retention.ms 후 제거
         → **활성 세그먼트는 컴팩션 대상이 아니라는 점**을 명확히
- D-063  Tiered Storage (★) — 로컬 + 원격 계층
- D-064 🖱 디스크 산정 계산기 (★★) — 처리량·보관기간·RF·압축률 입력 → 필요 용량

### ch08 — 스키마 (5개, 전부 ★★★)
- D-070  Schema Registry 아키텍처 — 프로듀서 등록 → id 수신 → 메시지에 id 포함
         → 컨슈머가 id로 스키마 조회 (캐시 포함)
- D-071  **wire format 바이트 레이아웃** — magic byte(1) + schema id(4) + payload.
         실제 바이트 눈금으로. 왜 스키마 전체를 메시지에 안 넣는지가 보여야 함
- D-072 🖱 **호환성 모드 매트릭스** ← 인터랙티브. 이 사이트에서 가장 유용한 표 중 하나
         → 행: 변경 유형 (default 있는 필드 추가 / default 없는 필드 추가 /
           필드 삭제 / 타입 확대 / 타입 축소 / 필드 이름 변경)
         → 열: BACKWARD / BACKWARD_TRANSITIVE / FORWARD / FORWARD_TRANSITIVE /
           FULL / FULL_TRANSITIVE / NONE
         → 셀: 허용/거부 + 클릭 시 이유 표시
         → **각 셀의 값을 Confluent 공식 문서로 반드시 확인.** 추측 금지.
           확인 못 한 셀은 "확인 필요"로 두고 리포트에 남기세요
- D-073  **배포 순서** — BACKWARD → 컨슈머 먼저 / FORWARD → 프로듀서 먼저.
         뒤바꿨을 때 무슨 일이 생기는지(장애 발생)까지 표현
- D-074  subject naming strategy (★★) — Topic / Record / TopicRecord 3가지

### ch09 — Connect (5개, 전부 ★★)
- D-080  Connect 아키텍처 — worker 3대, connector, task 분산, 리더 워커,
         내부 토픽 3종(config/offset/status)
- D-081  **source vs sink 오프셋 저장 위치** ← 시험 단골
         → source: Connect의 offset.storage.topic
         → sink: __consumer_offsets (일반 컨슈머와 동일)
         → **이 비대칭이 한눈에 보여야 합니다.** 좌우 대비로 그리세요
- D-082  converter와 SMT 체인 위치
         → source: 커넥터 → SMT 체인 → converter → Kafka
         → sink: Kafka → converter → SMT 체인 → 커넥터
         → 순서가 반대라는 점이 핵심
- D-083  DLQ 흐름 — errors.tolerance, DLQ 토픽, 실패 원인이 헤더에 담기는 것
- D-084  task 재분배 — 워커 이탈 시 task가 남은 워커로 재할당

### ch10 — Streams (7개, 전부 ★★)
- D-090  토폴로지 — source → processor → sink, sub-topology 경계와 리파티션 토픽
- D-091  KStream vs KTable vs GlobalKTable
         → 같은 입력 스트림(같은 키가 반복되는)에 대해 3가지 해석의 결과가 다름
         → KStream은 각각 별개 이벤트, KTable은 upsert, null은 삭제
- D-092  윈도우 4종 비교 — tumbling / hopping / sliding / session.
         **같은 이벤트 시퀀스**에 대해 각각 어떻게 묶이는지
- D-093  **조인 매트릭스 + co-partitioning**
         → 4가지 조인(KS-KS / KS-KT / KS-GKT / KT-KT), 윈도우 필요 여부
         → co-partitioning 3요건: 키 동일 / 파티션 수 동일 / 파티셔너 동일
         → GlobalKTable은 co-partitioning 불필요한 이유
- D-094  **stateless vs stateful + 리파티션 유발** ← 시험 단골
         → 3열 배치: stateless / stateful / 리파티션 유발
         → map은 유발, mapValues는 미유발 — 이 대비가 핵심
- D-095  상태 저장소와 changelog — RocksDB + changelog 토픽 + standby 복구
- D-096  태스크와 스레드 병렬성 — 파티션 수 = 태스크 수, num.stream.threads 배치
```

---

## V3 — 개념·운영·케이스·치트시트·CCDAK 전용 (34개)

```
개수가 가장 많지만 대부분 정적·구조가 단순합니다.
단 **CCDAK 전용 5개(D-130~D-134)는 ★★★이므로 여기에 가장 많은 시간을 쓰세요.**
특히 D-133은 시험 직전 복습 효율이 가장 높은 산출물입니다.

## 담당 파일

### ch01 (3개, ★)
- D-001  메시지 큐 vs 분산 커밋 로그 — 소비 후 삭제 vs 로그 유지 + 오프셋
- D-002  Kafka 생태계 지도 — Broker/Producer/Consumer/Connect/Streams/
         Schema Registry/ksqlDB 관계
- D-003  버전 표기 분해 — `kafka_2.13-4.3.0.tgz`를 지시선으로 분해해
         2.13=Scala, 4.3.0=Kafka. **혼동이 가장 잦은 지점이므로 명확하게**

### ch02 (3개, ★★★/★★)  ※ D-012는 Wave 0, D-013은 V1 담당
- D-010  클러스터 전체 구조 (★★★) — 브로커 3대 + 컨트롤러 쿼럼 + 클라이언트, KRaft 기준
- D-011  토픽→파티션→세그먼트→레코드 계층 (★★★) — 4단 중첩, 파일 확장자까지
- D-014  레코드 구조 (★★) — key/value/timestamp/headers/메타데이터

### ch03 (3개, ★)
- D-020  ZooKeeper vs KRaft 비교 — 2.x와 4.x 아키텍처 좌우 배치
- D-021  컨트롤러 쿼럼과 메타데이터 로그 — __cluster_metadata, Raft 리더, 스냅샷
- D-022  노드 롤 조합 — broker / controller / combined

### ch11 (6개, ★)
- D-100  보안 4계층 — 암호화/인증/인가/감사
- D-101  **listeners 3종 관계** ← 운영자 최다 실수
         → listeners / advertised.listeners / listener.security.protocol.map
         → 내부 클라이언트와 외부 클라이언트가 각각 어느 리스너로 붙는지
         → 잘못 설정하면 왜 "연결은 되는데 메타데이터 받고 나서 끊기는지"
- D-102  SASL 메커니즘 비교 — PLAIN/SCRAM/GSSAPI/OAUTHBEARER
- D-103  ACL 모델 — principal × resource × operation
- D-104  핵심 메트릭 대시보드 — URP/OfflinePartitions/ActiveController/
         RequestHandlerIdle 배치 예시
- D-105  Share Groups vs Consumer Groups — 파티션 배타 할당 vs 협력 소비,
         레코드 단위 ack

### 부록 (2개, ★)
- D-106  버전 타임라인 — 2.0 → 4.3 가로 타임라인. 주요 변경 표시
         (2.4 sticky / 2.8 KRaft EA / 3.0 기본값 변경 / 3.3 KRaft GA /
          3.6 Tiered EA / 3.9 마지막 ZK / 4.0 ZK 제거+KIP-848 / 4.2 Share Groups GA)
         → **각 항목을 공식 릴리스 노트로 검증하세요**
- D-107  업그레이드 경로 — 2.x → 3.9 → 4.x, ZK→KRaft 마이그레이션 단계

### 케이스 스터디 (10개, D-110~D-119)
각 케이스의 **장애 발생 시퀀스**. 공통 3단 구성:
정상 흐름 → 어디서 어긋나는지(--dg-danger로 강조) → 결과(유실/중복/장애)

- D-110 case01 auto.offset.reset=latest + 새 그룹 ID → 데이터 유실 (★★★)
- D-111 case02 max.poll.interval.ms 초과 → 무한 리밸런스 루프 (★★★)
- D-112 case03 acks=1 + unclean leader election → 유실 (★★★)
- D-113 case04 키 없는 프로듀싱 → 순서 보장 상실 (★★★)
- D-114 case05 파티션 과다 → 처리량 저하 (★★)
- D-115 case06 min.insync.replicas=1 → 장애 시 유실 (★★)
- D-116 case07 컨슈머 멱등성 부재 → 재처리 시 이중 결제 (★★★)
- D-117 case08 cleanup.policy 오설정 → 상태 토픽 소실 (★★)
- D-118 case09 Schema Registry 호환성 오설정 → 컨슈머 전체 장애 (★★)
- D-119 case10 메시지 크기 설정 불일치 → 무한 재시도 (★★★)
         → 5개 설정(message.max.bytes / max.message.bytes / max.request.size /
           fetch.max.bytes / replica.fetch.max.bytes)이 각각 어디에 속하고
           어디서 막히는지를 경로 위에 표시. **이 다이어그램 하나로 case10이 이해되게**

### 치트시트 (4개)
- D-120  트러블슈팅 결정 트리 — 컨슈머가 안 읽는다 (★★★)
- D-121  결정 트리 — 프로듀서 전송 실패 (★★★)
- D-122  결정 트리 — 브로커 성능 저하 (★)
- D-123  설정 프리셋 3종 비교 (★★) — 처리량 우선/지연 우선/내구성 우선

결정 트리는 **판단 노드(다이아몬드)와 조치 노드(사각형)를 형태로 구분**하고,
각 분기에 실행할 CLI 명령을 짧게 병기하세요. 장애 대응 중에 보는 그림입니다.

### ★ CCDAK 전용 (5개, 전부 ★★★) — 가장 공들일 것
- D-130  도메인 가중치 — 6개 도메인 비중(28/23/15/13/12/8).
         단순 원그래프보다 **면적 비교가 명확한 형태**로. 공부 시간 배분이 보이게
- D-131  도메인 ↔ 챕터 매핑 — 어느 도메인이 어느 챕터로 커버되는지 연결선.
         수험생이 "무엇부터 읽어야 하나"를 이 한 장으로 판단할 수 있어야 함
- D-132  4주 학습 플랜 — 주차별 학습/실습/문제풀이 간트
- D-133 🖱 **설정값 관계도** ← 이 사이트에서 가장 유용할 산출물
         → 프로듀서·브로커·토픽·컨슈머 설정이 서로 어떻게 얽히는지 **한 장**에
         → 필수 클러스터: 
           · 내구성: acks ↔ min.insync.replicas ↔ replication.factor ↔
             unclean.leader.election.enable
           · 메시지 크기: max.request.size ↔ message.max.bytes ↔
             max.message.bytes ↔ fetch.max.bytes ↔ max.partition.fetch.bytes ↔
             replica.fetch.max.bytes
           · 컨슈머 생존: session.timeout.ms ↔ heartbeat.interval.ms ↔
             max.poll.interval.ms ↔ max.poll.records
           · 재시도 예산: retries ↔ request.timeout.ms ↔ delivery.timeout.ms ↔
             max.in.flight.requests.per.connection ↔ enable.idempotence
           · 배치: batch.size ↔ linger.ms ↔ buffer.memory ↔ compression.type
         → 노드를 **소속(프로듀서/브로커/토픽/컨슈머)별로 색 구분**
         → 노드 클릭 시 그 설정과 연관된 노드·간선만 하이라이트, 나머지는 흐리게
         → 이 5개 클러스터가 시험에 나오는 설정 문제의 대부분입니다
- D-134  헷갈리는 설정 쌍 비교 — 6쌍을 좌우 대비로:
         session.timeout.ms vs max.poll.interval.ms /
         retention vs compaction / acks vs min.insync.replicas /
         assign() vs subscribe() / map vs mapValues /
         멱등성 vs 트랜잭션

## 우선순위
시간이 부족하면 이 순서로: D-130~D-134 → 케이스 ★★★ 6개 → D-120/121 →
ch02 3개 → 나머지. **CCDAK 전용을 절대 마지막에 두지 마세요.**
```

---

## Wave 1 시각화 완료 후 확인할 것

- [ ] `node tools/validate.mjs --diagrams` 오류 0 (하드코딩 색 0건)
- [ ] 83개 + V1 추가 4개 = 87개 SVG가 존재
- [ ] 다크모드 스크린샷에서 안 보이는 다이어그램 0개
- [ ] 인터랙티브 8종이 실제로 동작
- [ ] V1이 추가한 신규 ID(D-038/039/048/049)가 카탈로그에 반영되고 플레이스홀더가 추가됨
