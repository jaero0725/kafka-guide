# 다이어그램 카탈로그

> 시각화는 **별도 트랙**이다. 콘텐츠 에이전트와 시각화 에이전트가 같은 파일을 다투지 않도록
> 다이어그램을 독립 파일로 분리하고, 콘텐츠는 플레이스홀더로만 참조한다.

---

## 1. 분리 구조 (충돌 방지의 핵심)

### 콘텐츠 에이전트가 쓰는 것 — 플레이스홀더만

```html
<figure class="diagram" data-diagram="D-030">
  <figcaption>Producer 전송 파이프라인 — <code>send()</code> 호출부터 브로커 응답까지</figcaption>
</figure>
```

`data-diagram` 값과 `<figcaption>`만 쓴다. **SVG를 직접 그리지 않는다.**

### 시각화 에이전트가 쓰는 것 — 독립 SVG 파일

```
assets/diagrams/D-030-producer-pipeline.svg
```

### 결합 방식 (2중 안전장치)

| 시점 | 방법 |
|---|---|
| **개발 중 (런타임)** | `app.js`가 `data-diagram`을 찾아 해당 SVG를 fetch → 인라인 삽입 |
| **배포 시 (빌드 타임)** | `tools/inline-diagrams.mjs`가 플레이스홀더를 실제 SVG로 **정적 치환** |

정적 치환을 하는 이유: `file://`로 열 때 fetch가 막히고, 인라인이어야 CSS 변수(다크모드)가 SVG 내부까지 닿는다. 런타임 fetch는 개발 편의용 폴백이다.

> ⚠️ **Wave 4의 `inline-diagrams.mjs` 실행이 필수다.** 이걸 안 돌리면 다이어그램이 빈 칸으로 배포된다.
> 미치환 플레이스홀더가 남아 있으면 `validate.mjs`가 오류로 잡는다.

---

## 2. 다이어그램 작성 규칙 (일관성이 전부)

Wave 0이 `assets/css/viz.css`에 다이어그램 디자인 토큰을 정의한다. 모든 SVG는 이를 따른다.

### 필수 규칙

```svg
<svg viewBox="0 0 720 320" role="img" aria-labelledby="d030-title d030-desc"
     class="kg-diagram" preserveAspectRatio="xMidYMid meet">
  <title id="d030-title">Producer 전송 파이프라인</title>
  <desc id="d030-desc">send() 호출이 직렬화, 파티셔너, RecordAccumulator를 거쳐
    Sender 스레드가 브로커로 배치 전송하는 흐름</desc>
  <!-- 본문 -->
</svg>
```

| 규칙 | 내용 |
|---|---|
| 크기 | `viewBox`만 지정. `width`/`height` 하드코딩 **금지** (반응형) |
| 좌표계 | 폭 **720** 기준. 높이는 내용에 맞게. 모바일에서 축소되어도 읽히도록 |
| 색 | **하드코딩 금지.** `var(--dg-stroke)`, `var(--dg-fill)`, `var(--dg-accent)`, `var(--dg-muted)`, `var(--dg-danger)`, `var(--dg-ok)`, `currentColor`만 |
| 폰트 | `font-family` 지정 금지 (CSS가 상속). 크기는 `--dg-fs-*` 클래스로 |
| 최소 글자 크기 | 13px 상당. 360px 화면에서 720 → 약 0.5배 축소되므로 그 이하는 못 읽음 |
| 선 굵기 | `--dg-sw-1`(1.5) / `--dg-sw-2`(2.5). 임의 값 금지 |
| 접근성 | `role="img"` + `<title>` + `<desc>` + `aria-labelledby` **전부 필수** |
| 텍스트 | `<text>`로. 이미지에 글자를 굽지 않음. 한국어 사용 |
| 색만으로 구분 금지 | 색 + 패턴/레이블/아이콘 병기 |
| 파일 크기 | 개당 20KB 이하. base64 이미지 삽입 금지 |

### 다크모드
`viz.css`의 토큰이 라이트/다크 양쪽에 정의되므로, 토큰만 쓰면 자동 대응된다.
**SVG 안에 `#000`, `#fff`, `black`, `white`가 등장하면 Wave 3에서 CRITICAL이다.**

### 인터랙티브 다이어그램
`assets/js/viz.js`가 제공하는 프리미티브를 사용한다 (Wave 0이 구현).
- 상태 없는 정적 SVG + 컨트롤(버튼/슬라이더/체크박스)로 SVG 속성을 갱신하는 방식
- 애니메이션은 `prefers-reduced-motion`을 존중
- **키보드로 모든 컨트롤 조작 가능** (버튼/입력 요소 사용, 클릭 핸들러만 있는 div 금지)
- JS 없이도 초기 상태가 의미를 전달해야 함 (progressive enhancement)

---

## 3. 카탈로그

**우선순위 표기**
- ★★★ = CCDAK 최우선 (Application Development 28% / Fundamentals 23%) — **가장 공들일 것**
- ★★ = CCDAK 중요 (Connect / Streams / Observability / Testing)
- ★ = CCAAK 중심 또는 보조
- 🖱 = 인터랙티브

### ch01 — Kafka 개요

| ID | 제목 | 우선 | 내용 |
|---|---|:--:|---|
| D-001 | 메시지 큐 vs 분산 커밋 로그 | ★ | 소비 후 삭제 vs 로그에 남고 오프셋으로 읽음. 좌우 비교 |
| D-002 | Kafka 생태계 지도 | ★ | Broker · Producer · Consumer · Connect · Streams · Schema Registry · ksqlDB 관계 |
| D-003 | 버전 표기 분해 | ★ | `kafka_2.13-4.3.0.tgz` → Scala 2.13 / Kafka 4.3.0 지시선 분해 |

### ch02 — 아키텍처 (CCDAK Fundamentals)

| ID | 제목 | 우선 | 내용 |
|---|---|:--:|---|
| D-010 | 클러스터 전체 구조 | ★★★ | 브로커 3대 + 컨트롤러 쿼럼 + 클라이언트. KRaft 기준 |
| D-011 | 토픽→파티션→세그먼트→레코드 계층 | ★★★ | 4단 중첩 구조. 파일 확장자(.log/.index/.timeindex)까지 |
| D-012 🖱 | **오프셋 4종 구분** | ★★★ | log-start / committed / high watermark / LEO를 한 로그 위에. 슬라이더로 컨슈머 진행·복제 진행을 움직이며 4개가 어떻게 벌어지는지 체험. **가장 많이 헷갈리는 개념** |
| D-013 | 복제와 ISR | ★★★ | 리더/팔로워, ISR 집합, 팔로워 지연 시 ISR 축소 → `min.insync.replicas` 미달 |
| D-014 | 레코드 구조 | ★★ | key / value / timestamp / headers / 메타데이터 |

### ch03 — KRaft (CCAAK 중심)

| ID | 제목 | 우선 | 내용 |
|---|---|:--:|---|
| D-020 | ZooKeeper vs KRaft 비교 | ★ | 2.x 아키텍처와 4.x 아키텍처 좌우 배치 |
| D-021 | 컨트롤러 쿼럼과 메타데이터 로그 | ★ | `__cluster_metadata`, Raft 리더, 스냅샷 |
| D-022 | 노드 롤 조합 | ★ | broker / controller / combined 3가지 배치 |

### ch04 — Producer (CCDAK 최우선 도메인)

| ID | 제목 | 우선 | 내용 |
|---|---|:--:|---|
| D-030 | **Producer 전송 파이프라인** | ★★★ | `send()` → 직렬화 → 파티셔너 → RecordAccumulator(배치) → Sender 스레드 → 브로커 → 응답 → 콜백. **어느 단계가 어느 스레드인지 색으로 구분** |
| D-031 | 배치와 `linger.ms` 타임라인 | ★★★ | `batch.size` 도달 vs `linger.ms` 만료 — 둘 중 먼저 오는 쪽에 전송 |
| D-032 | **acks 0/1/all 시퀀스 비교** | ★★★ | 3개 시퀀스 다이어그램 나란히. 각 경우 유실 지점을 X로 표시 |
| D-033 | 멱등성 중복 판별 | ★★★ | PID + 파티션별 시퀀스 번호. 재시도 시 브로커가 중복 폐기하는 과정 |
| D-034 🖱 | **키 있음/없음 파티셔닝** | ★★★ | 키 있으면 `murmur2(key)%N` 결정적, 키 없으면 sticky batching. 버튼으로 메시지를 계속 보내며 파티션 분배 관찰. **"라운드로빈"과 sticky의 차이를 눈으로** |
| D-035 | 압축 트레이드오프 | ★★ | gzip/snappy/lz4/zstd — 압축률 vs CPU vs 지연 |
| D-036 | **`onCompletion()` 호출 시점** | ★★★ | send() 즉시 반환 → 배치 → 브로커 응답 → **Sender 스레드에서** 콜백. 어느 시점에 호출되는지 타임라인 |
| D-037 | 재시도와 `delivery.timeout.ms` 예산 | ★★★ | `request.timeout.ms` × 재시도 ≤ `delivery.timeout.ms` 포함 관계 |
| D-038 | 프로듀서 핵심 메트릭 지도 | ★★ | `record-send-rate`, `record-error-rate`, `request-latency-avg`, `buffer-available-bytes`가 D-030 파이프라인의 어느 단계를 관측하는지 겹쳐 표시 (CCDAK Observability 13%) |
| D-039 | 프로듀서 지연 분해 | ★★ | 배치 대기 / 전송 / 브로커 처리 / 응답 각 구간 |

### ch05 — Consumer (CCDAK 최우선 도메인)

| ID | 제목 | 우선 | 내용 |
|---|---|:--:|---|
| D-040 🖱 | **리밸런스 시뮬레이터** | ★★★ | 파티션 8개 + 컨슈머 N명. 버튼으로 컨슈머 추가/제거/크래시 → 할당 변화 애니메이션. 할당 전략(Range/RoundRobin/Sticky/CooperativeSticky) 선택 가능. **이 사이트의 대표 시각화** |
| D-041 | poll 루프 내부 동작 | ★★★ | fetch 요청 → 내부 큐 → `max.poll.records` 만큼 반환 → 처리 → 커밋 |
| D-042 | **타임아웃 4종 타임라인** | ★★★ | `heartbeat.interval.ms` / `session.timeout.ms` / `max.poll.interval.ms` / `max.poll.records`. 하트비트 축과 poll 축이 **별개**임을 시각적으로 분리. 처리 지연 시 어느 쪽이 먼저 터지는지 |
| D-043 | eager vs cooperative 리밸런스 | ★★★ | 전체 회수(stop-the-world) vs 증분 재할당 |
| D-044 | **`assign()` vs `subscribe()`** | ★★★ | 그룹 조정 참여 여부, 리밸런스 유무, `group.id` 필요 여부 |
| D-045 | 커밋 시점별 유실/중복 | ★★★ | 처리 전 커밋(유실) vs 처리 후 커밋(중복) |
| D-046 🖱 | 파티션 할당 전략 4종 비교 | ★★★ | 같은 조건에서 4개 전략의 할당 결과를 나란히. 컨슈머/파티션 수 조절 |
| D-047 | static membership | ★★ | `group.instance.id`로 재시작 시 리밸런스 회피 |
| D-048 | 컨슈머 lag의 정확한 정의 | ★★ | ⚠️ **정정(V1 확인)**: `LEO − committed offset`이 아니라 **`high watermark − CURRENT-OFFSET`**. `KafkaConsumer.endOffsets()` javadoc 기준 `LOG-END-OFFSET`은 리더 LEO가 아니라 **high watermark**(`read_committed`면 LSO)다. 복제가 끝나지 않은 구간은 lag에 포함되지 않는다 (CCDAK Observability 13%) |
| D-049 | lag 측정 3가지 방법 비교 | ★★ | CLI / 클라이언트 메트릭 / 브로커 메트릭 — 각각 무엇을 측정하고 어떤 함정이 있는지 |

### ch06 — 전달 보장·트랜잭션 (CCDAK)

| ID | 제목 | 우선 | 내용 |
|---|---|:--:|---|
| D-050 | 3가지 전달 보장 비교 | ★★★ | at-most-once / at-least-once / exactly-once — 설정 조합과 결과 |
| D-051 | 트랜잭션 흐름 | ★★★ | `initTransactions` → `beginTransaction` → send/sendOffsets → commit/abort. 코디네이터와 `__transaction_state` 포함 |
| D-052 | `read_committed`와 LSO | ★★★ | 진행 중 트랜잭션 때문에 커밋된 뒤 메시지도 안 보이는 상황 |
| D-053 | consume-transform-produce | ★★★ | 오프셋 커밋이 트랜잭션에 포함되는 구조 |
| D-054 | **EOS의 경계** | ★★★ | Kafka 내부는 EOS, 외부 DB/API 호출은 아님 → 컨슈머 멱등성 필요. **가장 흔한 오해** |

### ch07 — 스토리지·리텐션·컴팩션 (CCDAK Fundamentals)

| ID | 제목 | 우선 | 내용 |
|---|---|:--:|---|
| D-060 | 로그 세그먼트 물리 구조 | ★★ | 활성 세그먼트 + 봉인된 세그먼트, 인덱스 파일 |
| D-061 | retention 삭제 단위 | ★★★ | **세그먼트 단위로 삭제**되므로 `segment.ms`/`segment.bytes`가 실제 보관량을 좌우 |
| D-062 🖱 | **컴팩션 before/after** | ★★★ | 키 중복 로그 → 컴팩션 → 키별 최신값. tombstone 처리, 활성 세그먼트 제외. 버튼으로 컴팩션 실행 |
| D-063 | Tiered Storage | ★ | 로컬 디스크 + 원격 스토리지 계층 |
| D-064 🖱 | 디스크 산정 계산기 | ★★ | 처리량·보관기간·RF·압축률 입력 → 필요 용량 |

### ch08 — 스키마 (CCDAK)

| ID | 제목 | 우선 | 내용 |
|---|---|:--:|---|
| D-070 | Schema Registry 아키텍처 | ★★★ | 프로듀서 등록 → id 수신 → 메시지에 id 포함 → 컨슈머 조회 |
| D-071 | **wire format 바이트 레이아웃** | ★★★ | magic byte(1) + schema id(4) + payload. 실제 바이트 눈금 |
| D-072 🖱 | **호환성 모드 매트릭스** | ★★★ | 변경 유형(필드 추가/삭제/타입 변경/이름 변경) × 모드(BACKWARD/FORWARD/FULL/NONE + TRANSITIVE) → 허용/거부. 셀 클릭 시 이유 표시 |
| D-073 | **배포 순서** | ★★★ | BACKWARD → 컨슈머 먼저 / FORWARD → 프로듀서 먼저. 뒤바꾸면 무슨 일이 생기는지 |
| D-074 | subject naming strategy | ★★ | Topic / Record / TopicRecord 3가지 |

### ch09 — Connect (CCDAK 15%)

| ID | 제목 | 우선 | 내용 |
|---|---|:--:|---|
| D-080 | Connect 아키텍처 | ★★ | worker 3대 / connector / task 분산, 리더 워커 |
| D-081 | **source vs sink 오프셋 저장 위치** | ★★ | source → Connect `offset.storage.topic` / sink → `__consumer_offsets`. **비대칭이 핵심** |
| D-082 | converter와 SMT 체인 위치 | ★★ | source: SMT → converter → Kafka / sink: Kafka → converter → SMT → 대상 |
| D-083 | DLQ 흐름 | ★★ | `errors.tolerance`, DLQ 토픽, 헤더에 실패 원인 |
| D-084 | task 재분배 | ★★ | 워커 이탈 시 task 재할당 |

### ch10 — Streams (CCDAK 12%)

| ID | 제목 | 우선 | 내용 |
|---|---|:--:|---|
| D-090 | 토폴로지 | ★★ | source → processor → sink, sub-topology 경계 |
| D-091 | KStream vs KTable vs GlobalKTable | ★★ | 같은 입력에 대한 해석 차이. 같은 키 반복 시 결과 비교 |
| D-092 | 윈도우 4종 비교 | ★★ | tumbling / hopping / sliding / session — 같은 이벤트 열에 대해 |
| D-093 | **조인 매트릭스 + co-partitioning** | ★★ | 4가지 조인 조합, 윈도우 필요 여부, co-partitioning 요구(키 동일·파티션 수 동일·파티셔너 동일) |
| D-094 | **stateless vs stateful + 리파티션** | ★★ | 연산 목록을 3열로: stateless / stateful / **리파티션 유발**. `map`은 유발, `mapValues`는 미유발 |
| D-095 | 상태 저장소와 changelog | ★★ | RocksDB + changelog 토픽 + standby replica 복구 |
| D-096 | 태스크와 스레드 병렬성 | ★★ | 파티션 수 = 태스크 수, `num.stream.threads` 배치 |

### ch11 — 운영 (CCAAK 중심)

| ID | 제목 | 우선 | 내용 |
|---|---|:--:|---|
| D-100 | 보안 4계층 | ★ | 암호화 / 인증 / 인가 / 감사 |
| D-101 | **listeners 3종 관계** | ★ | `listeners` / `advertised.listeners` / `listener.security.protocol.map`. 내부·외부 클라이언트가 각각 어디로 붙는지. **운영자 최다 실수** |
| D-102 | SASL 메커니즘 비교 | ★ | PLAIN / SCRAM / GSSAPI / OAUTHBEARER |
| D-103 | ACL 모델 | ★ | principal × resource × operation |
| D-104 | 핵심 메트릭 대시보드 | ★ | URP / OfflinePartitions / ActiveController / RequestHandlerIdle 배치 예시 |
| D-105 | Share Groups vs Consumer Groups | ★ | 파티션 배타 할당 vs 협력 소비, 레코드 단위 ack |

### 부록 — 레거시

| ID | 제목 | 우선 | 내용 |
|---|---|:--:|---|
| D-106 | 버전 타임라인 | ★ | 2.0 → 4.3 주요 변경 가로 타임라인 |
| D-107 | 업그레이드 경로 | ★ | 2.x → 3.9 → 4.x, ZK→KRaft 마이그레이션 |

### 케이스 스터디

| ID | 제목 | 우선 |
|---|---|:--:|
| D-110 ~ D-119 | 케이스 1~10 각각의 **장애 발생 시퀀스** | ★★★ (case 1,2,3,4,7,10) / ★★ (나머지) |

각 케이스 다이어그램은 "정상 흐름 → 어디서 어긋나는지 → 결과" 3단 구성.

### 치트시트

| ID | 제목 | 우선 | 내용 |
|---|---|:--:|---|
| D-120 | 트러블슈팅 결정 트리 — 컨슈머가 안 읽는다 | ★★★ | 분기 플로우차트 |
| D-121 | 결정 트리 — 프로듀서 전송 실패 | ★★★ | |
| D-122 | 결정 트리 — 브로커 성능 저하 | ★ | |
| D-123 | 설정 프리셋 3종 비교 | ★★ | 처리량 우선 / 지연 우선 / 내구성 우선 |

### CCDAK 전용 (최우선 제작)

| ID | 제목 | 우선 | 내용 |
|---|---|:--:|---|
| D-130 | 도메인 가중치 | ★★★ | 6개 도메인 비중 (28/23/15/13/12/8) |
| D-131 | 도메인 ↔ 챕터 매핑 | ★★★ | 어느 도메인이 어느 챕터로 커버되는지 연결선 |
| D-132 | 4주 학습 플랜 | ★★★ | 주차별 학습·실습·문제풀이 간트 |
| D-133 🖱 | **설정값 관계도** | ★★★ | 프로듀서·브로커·토픽·컨슈머 설정이 서로 어떻게 얽히는지 한 장. 노드 클릭 시 관련 설정 하이라이트. 예: `acks` ↔ `min.insync.replicas` ↔ `replication.factor`, `max.request.size` ↔ `message.max.bytes` ↔ `fetch.max.bytes`. **시험 직전 한 장 요약으로 가장 유용** |
| D-134 | 헷갈리는 설정 쌍 비교 | ★★★ | `session.timeout.ms` vs `max.poll.interval.ms`, retention vs compaction, `acks` vs `min.insync.replicas` 등 6쌍 |

---

## 4. 총계와 배분

| 구분 | 개수 |
|---|---:|
| ★★★ CCDAK 최우선 | 38 |
| ★★ CCDAK 중요 | 28 |
| ★ 보조 | 21 |
| 🖱 인터랙티브 | 8 |
| **합계** | **87** |

> V1이 CCDAK Observability(13%) 도메인 보강용으로 D-038·D-039·D-048·D-049 4개를
> 추가했다 (2026-07-28 반영). 원 계획 83개 + 4개 = 87개.

### 시각화 에이전트 배분 (Wave 1과 병렬)

| 에이전트 | 담당 | 개수 |
|---|---|---:|
| **V1** | ch04·ch05 (CCDAK 최우선 도메인) + D-012·D-013 | 22 |
| **V2** | ch06·ch07·ch08·ch09·ch10 (CCDAK 나머지) | 27 |
| **V3** | ch01·ch02·ch03·ch11·부록 + 케이스 + 치트시트 + CCDAK 전용 | 34 |

V1이 가장 중요하고 양도 많으므로 인터랙티브 3종(D-034·D-040·D-046)을 포함한다.
V3은 개수가 많지만 대부분 정적·단순하다.

**모든 시각화 에이전트는 `assets/diagrams/` 아래 자기 ID 파일만 소유한다.** 콘텐츠 HTML을 건드리지 않는다.
