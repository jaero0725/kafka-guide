# Wave 1 — 본문 콘텐츠 (8 에이전트 병렬)

각 프롬프트 앞에 `README.md`의 공통 프리앰블 + 아래 **Wave 1 공통 블록**을 붙인다.

---

## Wave 1 공통 블록 (A1~A8 전부에 포함)

```
## Wave 1 공통 지침

### 최우선 목표: CCDAK 합격
PLAN.md 최상단 우선순위 표를 먼저 읽으세요.
CCDAK의 Application Development(28%) + Fundamentals(23%) = 51%입니다.
ch04·ch05·ch06(App Dev)와 ch02·ch07·ch08(Fundamentals)이 시험의 절반을 담당합니다.
당신 담당이 여기 걸리면 **가장 높은 완성도**를 요구받습니다. 분량을 아끼지 마세요.
반대로 CCAAK 전용 내용(ch03, ch11 일부)은 정확하되 밀도는 그보다 낮아도 됩니다.

### 시험 포인트 박스를 적극적으로 쓰세요
CCDAK 출제 지점마다 `.note--exam`을 삽입하고 **어느 도메인인지 명시**하세요.
```html
<aside class="note note--exam">
  <strong>시험 포인트 · Application Development</strong>
  <code>enable.idempotence=true</code>일 때
  <code>max.in.flight.requests.per.connection</code>은 5 이하여야 합니다.
  6 이상으로 설정하면 <code>ConfigException</code>이 발생합니다.
</aside>
```
독자가 이 박스만 훑어도 시험 대비가 되어야 합니다. 챕터당 최소 4개.

먼저 basics/ch01.html 을 **전체 읽으세요.** 이것이 레퍼런스 페이지입니다.
당신이 만드는 모든 페이지는 이 파일의 구조·클래스·톤을 그대로 복제해야 합니다.
assets/css/main.css 에 정의된 컴포넌트 클래스만 사용하세요. 새 클래스를 만들지 마세요.
CSS 파일을 수정하지 마세요 (Wave 0 소유).

각 페이지 필수 요소:
- <title>: "{페이지 제목} — Kafka Guide"
- <meta name="description">
- .breadcrumb, .page__header(eyebrow/h1/lead), .pager
- 모든 h2/h3에 영문 kebab-case id
- 최소 3개의 내부 상호 링크 (CONTENT_STYLE_GUIDE §4)
- 최소 1개의 표
- 마지막에 "공식 문서 출처" 섹션 (실제 URL)

### ⚠️ 다이어그램: SVG를 그리지 마세요 — 플레이스홀더만

시각화 전담 에이전트 3명(V1–V3)이 지금 **동시에** 다이어그램 83개를 만들고 있습니다.
당신이 SVG를 직접 그리면 중복·스타일 불일치가 생깁니다.

```html
<figure class="diagram" data-diagram="D-030">
  <figcaption>Producer 전송 파이프라인 — <code>send()</code>부터 콜백까지</figcaption>
</figure>
```

- `data-diagram` ID는 **`docs/DIAGRAM_CATALOG.md`에 있는 것만** 사용. 임의 생성 금지.
- `<figcaption>`은 당신이 씁니다. 다이어그램이 무엇을 보여주는지 한 문장으로.
- 카탈로그에서 **당신 담당 챕터에 배정된 모든 ID를 빠짐없이 참조**하세요.
  참조되지 않은 SVG는 고아 파일로 Wave 3에서 잡힙니다.
- 카탈로그에 없는데 꼭 필요한 다이어그램이 있으면, **플레이스홀더를 넣지 말고**
  반환 리포트에 "신규 다이어그램 요청: 제목 + 내용"으로 적으세요.
- 개발 중에는 다이어그램이 빈 칸으로 보입니다. 정상입니다. Wave 4가 채웁니다.

사실 확인:
설정명·기본값·CLI 옵션·클래스명은 WebFetch로 kafka.apache.org 공식 문서에서
확인한 뒤 작성합니다. 확인 못 한 수치는 쓰지 않습니다.
확인하지 못해 생략한 항목은 반환 리포트에 반드시 나열하세요.

작업 후 `node tools/validate.mjs --links --html` 을 실행해 당신이 만든 파일에
대한 오류를 0으로 만드세요. (다른 에이전트 파일이 아직 없어서 나는 링크 오류는
리포트에 "미생성 파일 링크"로 분류해 남기고 넘어갑니다.)
```

---

## A1 — 기본개념 ch02 ~ ch04

```
소유 파일: basics/ch02.html, basics/ch03.html, basics/ch04.html
(ch01은 Wave 0이 만든 레퍼런스입니다. 수정하지 마세요.)

### ch02 — 아키텍처와 핵심 개념
- 클러스터 구성 요소: 브로커, 컨트롤러, 클라이언트 (SVG 전체 구조도)
- 토픽 → 파티션 → 세그먼트 → 레코드 계층 (SVG)
- 오프셋: log-end-offset, high watermark, log-start-offset, committed offset의 차이
  → 이 4개를 한 장의 다이어그램으로 구분해 보여주는 것이 이 챕터의 핵심 가치
- 복제: 리더/팔로워, ISR, replica.lag.time.max.ms, unclean leader election
- 파티션 할당과 리더 선출
- 레코드 구조: key, value, timestamp, headers
- 설정 표: replication.factor, min.insync.replicas, unclean.leader.election.enable,
  num.partitions, default.replication.factor
- 흔한 오해 3개 (예: "파티션 수는 많을수록 좋다", "RF=3이면 무조건 안전하다")
- 연계 링크: cases/case03.html, cases/case05.html, cases/case06.html,
  cheatsheet/config.html

### ch03 — KRaft와 클러스터 메타데이터
**이 챕터가 이 사이트의 가장 큰 차별점입니다. 공을 들이세요.**
- 왜 ZooKeeper를 제거했는가 (KIP-500): 이중 운영 부담, 메타데이터 확장 한계,
  컨트롤러 페일오버 지연
- KRaft 아키텍처: 컨트롤러 쿼럼, __cluster_metadata 토픽, Raft 합의
- 노드 롤: process.roles=broker / controller / broker,controller (combined)
  → combined 모드의 용도와 프로덕션 권장 사항
- 클러스터 부트스트랩: kafka-storage.sh random-uuid / format --cluster-id
  (실제 명령어를 공식 문서에서 확인해 그대로)
- 메타데이터 스냅샷, controller.quorum.voters vs controller.quorum.bootstrap.servers
- 컨트롤러 수 권장(3 또는 5)과 이유
- 3.x → 4.x 마이그레이션 개요 (ZK 모드에서 오는 경우)
- SVG: ZooKeeper 아키텍처 vs KRaft 아키텍처 비교도
- 설정 표: process.roles, node.id, controller.listener.names,
  controller.quorum.*, metadata.log.dir
- .note--version 박스로 3.x와의 차이를 명확히
- 연계 링크: cheatsheet/cli.html, ccaak/index.html

### ch04 — Producer 심화
- 전송 파이프라인: send() → 직렬화 → 파티셔너 → RecordAccumulator(배치) →
  Sender 스레드 → 브로커 (SVG 시퀀스 다이어그램)
- 배치와 지연: batch.size, linger.ms, buffer.memory, max.block.ms 의 상호작용
- acks=0/1/all의 정확한 의미와 min.insync.replicas와의 결합
- 멱등성 프로듀서: enable.idempotence=true (4.x 기본값 확인할 것),
  PID/시퀀스 번호, 중복 제거 범위와 한계
- 순서 보장: max.in.flight.requests.per.connection 과 retries의 관계
  (멱등성 켰을 때 in-flight 5까지 순서 보장되는 이유)
- 파티셔너: 기본 파티셔너 동작(4.x 기준 sticky partitioning 포함), 커스텀 파티셔너
- 압축: gzip/snappy/lz4/zstd 비교표 (압축률 vs CPU vs 지연)
- 에러 처리: retriable vs non-retriable, delivery.timeout.ms, request.timeout.ms
- 설정 표 (위 항목 전부, 기본값 공식 문서 확인)
- 흔한 오해 3개 (예: "retries=0이어야 중복이 없다", "acks=all이면 유실이 없다")
- 연계 링크: basics/ch06.html, cases/case03.html, cases/case04.html,
  practice/ex03.html, cheatsheet/config.html
```

---

## A2 — 기본개념 ch05 ~ ch08

```
소유 파일: basics/ch05.html ~ basics/ch08.html

### ch05 — Consumer 심화
- 컨슈머 그룹과 파티션 소유권 모델 (SVG)
- poll 루프의 실제 동작: fetch → 큐 → 처리 → 커밋
- 하트비트 vs poll 간격: session.timeout.ms, heartbeat.interval.ms,
  max.poll.interval.ms, max.poll.records 의 관계
  → 이 4개 설정의 상호작용을 타임라인 SVG로 그릴 것 (이 챕터의 핵심)
- 리밸런스: eager vs cooperative sticky, static membership(group.instance.id)
- **KIP-848 새 컨슈머 그룹 프로토콜 (Kafka 4.0 GA)**: group.protocol=consumer,
  브로커 주도 할당, 기존 프로토콜과의 차이, 마이그레이션 — 반드시 다룰 것
- 오프셋 커밋: 자동 vs 수동(sync/async), __consumer_offsets,
  auto.offset.reset(earliest/latest/none), offsets.retention.minutes
- 파티션 할당 전략: Range, RoundRobin, Sticky, CooperativeSticky
- seek/pause/resume, ConsumerRebalanceListener
- 설정 표 + 흔한 오해 3개
- 연계 링크: cases/case01.html, cases/case02.html, practice/ex04.html

### ch06 — 전달 보장과 트랜잭션
- at-most-once / at-least-once / exactly-once의 정확한 정의와 설정 조합
- 왜 "정확히 한 번"이 어려운가: 중복은 재시도에서, 유실은 커밋 순서에서
- 멱등 프로듀서 = 파티션 단위 중복 제거 (트랜잭션과 다름)
- 트랜잭션: transactional.id, 트랜잭션 코디네이터, __transaction_state,
  initTransactions/beginTransaction/sendOffsetsToTransaction/commit|abort
- consume-transform-produce 패턴 (SVG 흐름도)
- isolation.level=read_committed 와 LSO(Last Stable Offset)
- EOS의 경계: Kafka 내부에서만 성립. 외부 시스템(DB/API)에는 적용 안 됨
  → 그래서 컨슈머 멱등성이 여전히 필요하다는 점을 강조
- Kafka Streams의 processing.guarantee=exactly_once_v2
- 흔한 오해 3개 (예: "EOS 켜면 DB 중복도 막힌다")
- 연계 링크: cases/case07.html, practice/ex05.html

### ch07 — 스토리지·리텐션·컴팩션
- 로그 세그먼트 물리 구조: .log/.index/.timeindex/.snapshot, 활성 세그먼트
- 리텐션: retention.ms, retention.bytes, segment.ms, segment.bytes
  → 삭제가 세그먼트 단위로 일어나므로 segment 설정이 실제 보관량을 좌우한다는 점
- 컴팩션: cleanup.policy=compact, tombstone(null value),
  min.cleanable.dirty.ratio, delete.retention.ms, min.compaction.lag.ms
  → 컴팩션 전/후 로그 상태를 SVG로 비교
- compact,delete 조합
- Tiered Storage: remote.storage.enable, local.retention.*, 사용 시나리오와 제약
- 디스크 사용량 산정 공식 (처리량 × 보관기간 × RF × (1 - 압축률))
- 페이지 캐시와 zero-copy가 성능에 기여하는 원리
- 흔한 오해 3개 (예: "컴팩션은 중복을 즉시 제거한다")
- 연계 링크: cases/case08.html, cheatsheet/config.html

### ch08 — 스키마와 직렬화
- 직렬화 선택지 비교표: JSON / Avro / Protobuf / JSON Schema
  (스키마 진화, 크기, 언어 지원, 도구)
- Schema Registry 아키텍처: subject, version, schema id, wire format
  (magic byte + 4byte schema id + payload) — SVG로 바이트 레이아웃 표현
- subject naming strategy: TopicName / RecordName / TopicRecordName
- 호환성 모드 전부: BACKWARD, BACKWARD_TRANSITIVE, FORWARD, FORWARD_TRANSITIVE,
  FULL, FULL_TRANSITIVE, NONE
  → **어떤 스키마 변경이 어떤 모드에서 허용/거부되는지 매트릭스 표** (핵심 산출물)
- 안전한 스키마 진화 규칙 (필드 추가 시 default 필수 등)
- 컨슈머/프로듀서 우선 배포 순서 (BACKWARD면 컨슈머 먼저)
- KafkaAvroSerializer 설정, auto.register.schemas의 위험
- 흔한 오해 3개
- 연계 링크: cases/case09.html, practice/ex07.html
```

---

## A3 — 기본개념 ch09 ~ ch11 + 레거시 부록

```
소유 파일: basics/ch09.html, basics/ch10.html, basics/ch11.html,
          basics/appendix-legacy.html

### ch09 — Kafka Connect
- 아키텍처: worker / connector / task / converter / transform (SVG)
- standalone vs distributed 모드 비교표
- 내부 토픽: config.storage.topic, offset.storage.topic, status.storage.topic
  (권장 설정: RF, 파티션 수, cleanup.policy=compact)
- Source vs Sink 커넥터의 오프셋 관리 차이
- Converter: key.converter / value.converter, schemas.enable,
  Avro/JSON/Protobuf/String/ByteArray
- SMT(Single Message Transform): 자주 쓰는 것 10개 표로
- 에러 처리와 DLQ: errors.tolerance, errors.deadletterqueue.topic.name,
  errors.log.enable, errors.retry.timeout
- REST API 주요 엔드포인트 표
- 태스크 재분배와 확장 전략
- 흔한 오해 3개 (예: "커넥터를 늘리면 무조건 빨라진다")
- 연계 링크: practice/ex08.html, cheatsheet/connect.html

### ch10 — Kafka Streams와 ksqlDB
- Streams가 뭘 해결하는가 (라이브러리 vs 클러스터)
- 토폴로지: source → processor → sink (SVG)
- KStream vs KTable vs GlobalKTable — 의미론 차이 표 + 변환 관계
- 상태 저장소: RocksDB, changelog 토픽, standby replica, 복구
- 윈도우: tumbling / hopping / sliding / session — SVG 비교
- 조인 매트릭스: KStream-KStream / KStream-KTable / KStream-GlobalKTable /
  KTable-KTable (윈도우 필요 여부, co-partitioning 요구사항)
- co-partitioning 요구사항 (파티션 수·파티셔너 일치)
- 시간 개념: event time / processing time / ingestion time,
  TimestampExtractor, grace period
- 병렬성: 태스크 = 파티션 수, num.stream.threads
- processing.guarantee=exactly_once_v2
- 인터랙티브 쿼리
- **Streams Rebalance Protocol (4.1 Early Access)** 간단 언급
- ksqlDB: Streams 위의 SQL 계층. 스트림/테이블 DDL 예시, 언제 쓰나
- 흔한 오해 3개
- 연계 링크: practice/ex09.html, cheatsheet/streams.html

### ch11 — 운영 기초
분량이 크므로 4개 대섹션으로 구성합니다.

(1) 보안
- 4계층: 암호화(TLS) / 인증(SASL) / 인가(ACL) / 감사
- SASL 메커니즘: PLAIN, SCRAM-SHA-256/512, GSSAPI(Kerberos), OAUTHBEARER
  — 비교표와 선택 기준
- listeners / advertised.listeners / listener.security.protocol.map 관계
  → 이 3개의 관계를 SVG로 명확히 (운영자가 가장 많이 틀리는 부분)
- ACL: 리소스 타입, 오퍼레이션, kafka-acls 예시, super.users
- KRaft에서의 보안 설정 차이

(2) 모니터링
- 반드시 봐야 할 브로커 메트릭: UnderReplicatedPartitions,
  OfflinePartitionsCount, ActiveControllerCount, RequestHandlerAvgIdlePercent,
  NetworkProcessorAvgIdlePercent, IsrShrinksPerSec, LeaderElectionRateAndTimeMs
- 프로듀서/컨슈머 클라이언트 메트릭
- Consumer lag 측정 방법 3가지와 각각의 함정
- JMX → Prometheus → Grafana 파이프라인 개요
- 알림 임계값 가이드 표

(3) 성능 튜닝
- 처리량 vs 지연 트레이드오프 표 (설정별로 어느 쪽에 유리한가)
- OS 레벨: 파일 디스크립터, vm.swappiness, 페이지 캐시, 디스크 레이아웃
- JVM: 힙 크기 권장, GC 선택
- 네트워크/IO 스레드 튜닝: num.network.threads, num.io.threads
- 용량 산정 워크시트 (파티션 수·브로커 수·디스크 산정 공식)

(4) Share Groups / Queues (KIP-932, 4.2 production-ready)
- 컨슈머 그룹과 뭐가 다른가 (파티션 배타 할당 없음, 레코드 단위 ack)
- 언제 쓰나: 작업 큐 패턴, 처리 시간 편차가 큰 워크로드
- ack 타입(ACCEPT/RELEASE/REJECT/RENEW), 전달 시도 카운트
- 제약 사항
→ 최신 기능이므로 반드시 공식 문서/KIP-932 페이지로 사실 확인할 것

- 연계 링크: cheatsheet/security.html, cheatsheet/metrics.html,
  cheatsheet/troubleshooting.html, ccaak/index.html

### appendix-legacy — 버전 표기와 레거시 (2.x / 3.x)

**docs/VERSION_POLICY.md §3 을 그대로 구현합니다. 먼저 읽으세요.**

1. **버전 표기 읽는 법** (가장 앞에 배치 — 혼동이 가장 잦은 지점)
   - kafka_2.13-4.3.0.tgz 에서 2.13은 **Scala 버전**, 4.3.0이 Kafka 버전
   - Kafka 2.13이라는 버전은 존재하지 않음 (2.8 다음이 3.0)
   - _2.12는 구 배포판, 현행은 _2.13 전용
   - Scala를 직접 쓰지 않으면 _2.13을 고르면 됨 (브로커는 JVM 바이너리)
   - 도식 SVG 1개로 파일명 분해
2. **Kafka 2.x / 3.x를 아직 쓰는 조직을 위한 안내**
   - ZooKeeper 기반 운영: 앙상블 구성, --zookeeper CLI,
     ZK에 저장되던 것들(토픽 메타데이터, ACL, 동적 설정, 컨트롤러 선출, 브로커 등록)
   - ZK 시대의 흔한 장애: 세션 타임아웃, ZK 디스크 풀, split-brain
   - **이 페이지 안에서만 ZooKeeper 서술이 허용됩니다.**
3. **버전별 주요 변경 타임라인 표** (2.0 → 4.3)
   2.4 sticky assignor / 2.8 KRaft EA / 3.0 기본값 변경(acks=all,
   enable.idempotence=true) / 3.3 KRaft production-ready / 3.6 Tiered Storage EA /
   **3.9 마지막 ZK 지원 버전** / 4.0 ZK 제거·KIP-848 GA /
   4.1 Share Groups preview / 4.2 Share Groups GA / 4.3 최신
   → **각 항목을 공식 릴리스 노트로 검증**하세요. 틀리면 Wave 3에서 CRITICAL입니다.
4. **업그레이드 경로**: 2.x → 3.9 → 4.x
   - 왜 3.9를 반드시 경유해야 하는가
   - ZK → KRaft 마이그레이션 절차 개요
   - inter.broker.protocol.version 단계적 상향
   - 롤링 업그레이드 시 주의점
5. **레거시 → 현행 대응표**: 옛날 명령·설정 → 지금은 무엇인가
   (--zookeeper → --bootstrap-server, zookeeper.connect → controller.quorum.*, 등)
6. **버전 병기 항목 표** (VERSION_POLICY.md §2의 10개 행) —
   각 칸을 공식 문서로 확인해 채우고, 확인 못 한 칸은 비운 뒤 리포트에 남기세요

출처: https://kafka.apache.org/documentation/#upgrade ,
      https://kafka.apache.org/blog/releases/ , 각 릴리스 노트
```

---

## A4 — 실무 예제 (practice/)

```
소유 파일: practice/ex01.html ~ practice/ex12.html

PLAN.md §2-2 의 12개 예제를 작성합니다.

각 예제 페이지 구조:
1. 시나리오 — 어떤 비즈니스 요구에서 출발하는가 (2~3문장, 구체적으로)
2. 아키텍처 다이어그램 (SVG)
3. 사전 요구사항 (버전 명시: Kafka 4.3, Java 17, Docker Compose v2 등)
4. 전체 코드 — figure.code로. **복사해서 바로 돌아가는 완전한 코드**여야 합니다.
   조각난 스니펫 금지. 필요하면 여러 파일로 나누되 각각 완전하게.
5. 실행 방법 (명령어 순서대로)
6. 검증 방법 (무엇을 보면 성공인지 — 콘솔 출력 예시, CLI 확인 명령)
7. 프로덕션 고려사항 (로컬 예제와 실제 운영의 차이 3가지 이상)
8. 자주 하는 실수 (.note--warn) + 관련 케이스 스터디 링크

코드 품질 기준:
- Java는 Kafka 4.3 클라이언트 API 기준. deprecated API 사용 금지
- Spring Boot 예제는 spring-kafka 최신 안정 버전 (버전 번호를 WebFetch로 확인)
- 모든 설정값에 왜 그 값인지 주석
- 예외 처리 생략 금지 (프로덕션 코드 기준)
- docker-compose는 **KRaft 모드**로 작성 (ZooKeeper 컨테이너 절대 금지).
  ex01의 3노드 KRaft compose 파일이 다른 예제의 기반이 되므로 가장 공들여 작성하고,
  나머지 예제는 "ex01의 클러스터를 사용합니다"로 참조

우선순위: ex01(KRaft compose), ex03(무손실 프로듀서), ex05(EOS), ex06(DLQ)이
가장 자주 참조됩니다. 이 4개에 가장 많은 분량을 쓰세요.
```

---

## A5 — 실수 케이스 스터디 (cases/)

```
소유 파일: cases/case01.html ~ cases/case10.html

PLAN.md §2-3 의 10개 케이스를 작성합니다.

**이 섹션이 사이트의 가장 큰 차별점입니다.** 교과서적 설명이 아니라
"실제로 새벽에 깨어나 겪는 장애"처럼 읽혀야 합니다.

각 케이스 페이지 구조 (고정):
1. 🚨 상황
   - 구체적 서비스 맥락으로 시작. "주문 이벤트를 처리하는 서비스에서
     배포 30분 뒤 CS 문의가 폭증했다." 같은 식.
   - 규모를 숫자로 (일 500만 건, 파티션 24개, 브로커 3대 등)
2. 📉 관측된 증상
   - **실제 로그 스니펫** (figure.code, lang-bash). 실제 Kafka가 뱉는
     예외 메시지·경고를 정확히 써야 합니다. 지어내지 마세요 —
     공식 소스나 문서에서 확인된 메시지만.
   - 메트릭이 어떻게 보였는지 서술 (consumer lag 그래프 모양 등)
3. 🔍 원인 분석
   - 조사 과정을 **단계별로** — 어떤 명령을 쳤고 무엇이 나왔는지.
     kafka-consumer-groups --describe 출력 예시 등 실제 CLI 출력 형태로.
   - 왜 이 현상이 일어나는지 원리 설명 (관련 챕터 링크)
4. 🧪 재현 방법
   - practice/ex01.html 의 KRaft compose 기반으로 **최소 재현 코드**
   - 독자가 직접 재현할 수 있어야 합니다
5. ✅ 해결
   - .diff 컴포넌트로 Before/After 설정 비교
   - 즉시 조치 / 근본 해결 구분
6. 🛡️ 예방 체크리스트
   - 배포 전 확인할 항목 목록 (체크박스 형태)
7. 🎓 시험 포인트 (.note--exam)
   - 이 케이스가 CCDAK/CCAAK 어느 도메인과 연결되는지, 시험에서 어떻게 물어보는지

케이스별 필수 정확성 포인트:
- case01: auto.offset.reset의 정확한 동작과 그룹 ID가 새 그룹일 때의 분기
- case02: max.poll.interval.ms 초과 시 브로커가 실제로 뱉는 로그 메시지 정확히
- case03: unclean.leader.election.enable의 4.x 기본값을 공식 문서에서 확인
- case05: 파티션 수 증가의 실제 비용 (파일 핸들, 메모리, 리밸런스, end-to-end 지연)
- case06: min.insync.replicas가 acks=all과만 상호작용한다는 점
- case08: cleanup.policy 변경이 기존 데이터에 소급 적용되지 않는 점
- case09: 호환성 모드별 배포 순서(컨슈머 먼저 vs 프로듀서 먼저)
- case10: 4개 설정의 정확한 이름과 각각이 어디(브로커/토픽/프로듀서/컨슈머)에
  속하는지 — max.message.bytes(토픽/브로커), max.request.size(프로듀서),
  fetch.max.bytes / max.partition.fetch.bytes(컨슈머), replica.fetch.max.bytes(브로커)

로그 메시지와 예외 클래스명은 반드시 공식 문서/소스에서 확인하세요.
확인 못 한 로그는 "다음과 같은 형태의 로그가 나타납니다"로 완화해서 쓰고,
확인 실패 항목을 반환 리포트에 남기세요.
```

---

## A6 — 치트시트 (cheatsheet/)

```
소유 파일: cheatsheet/cli.html, config.html, metrics.html,
          troubleshooting.html, security.html, streams.html, connect.html

치트시트의 목표: **시험 직전 또는 장애 대응 중에 5초 안에 찾을 수 있을 것.**
설명은 최소, 표와 검색성이 전부입니다.

공통 요구사항:
- 각 페이지 상단에 **페이지 내 필터 입력창**을 둡니다.
  `<input class="cheat-filter" data-target="#table-id">` 형태로 마크업만 두고,
  필터링 동작은 assets/js/app.js 에 이미 구현되어 있는지 확인하세요.
  없으면 반환 리포트에 "app.js에 cheat-filter 핸들러 필요"로 보고하세요
  (직접 app.js를 수정하지 마세요 — Wave 0 소유).
- 모든 표는 `.config-table` + `<th scope="col">`
- 코드/명령은 복사 가능한 figure.code

### cli.html
kafka-topics / kafka-console-producer / kafka-console-consumer /
kafka-consumer-groups / kafka-configs / kafka-acls / kafka-reassign-partitions /
kafka-storage / kafka-log-dirs / kafka-dump-log / kafka-get-offsets /
kafka-leader-election / kafka-share-groups(4.2+)
- **목적 기반 표**: "무엇을 하고 싶은가 → 명령어" 순서로 구성
  (알파벳순 나열 금지. 사람은 명령어 이름이 아니라 목적으로 찾습니다)
- 모든 명령은 --bootstrap-server 사용. --zookeeper 절대 금지
- 자주 쓰는 원라이너 20개 별도 섹션 (lag 확인, 오프셋 리셋, 설정 조회 등)

### config.html
Broker / Topic / Producer / Consumer / Streams / Connect 6개 표.
컬럼: 설정명 | 기본값 | 범위·타입 | 설명 | 튜닝 포인트
- 각 설정 30~50개씩. **기본값은 전부 공식 문서에서 확인**
- 처리량 우선 / 지연 우선 / 내구성 우선 **3가지 프리셋 표** 추가 (이게 가장 유용)

### metrics.html
- 필수 브로커 JMX 메트릭 표: MBean 이름 | 의미 | 정상 범위 | 이상 시 의미 | 조치
- 프로듀서/컨슈머 클라이언트 메트릭
- Consumer lag 측정 3가지 방법 비교
- 알림 룰 예시 (PromQL)

### troubleshooting.html
- **증상 기반 의사결정 트리를 SVG 플로우차트로** (이 페이지의 핵심)
  최소 3개: (a) 컨슈머가 안 읽는다 (b) 프로듀서 전송 실패 (c) 브로커 성능 저하
- 증상 → 확인 명령 → 원인 후보 → 조치 표
- 자주 보는 예외 20개: 예외명 | 원인 | 조치 | 관련 케이스 링크
  (예외 클래스명은 정확히. Kafka 소스/문서에서 확인)

### security.html
- SSL(양방향/단방향), SASL_PLAINTEXT, SASL_SSL 설정 스니펫 복붙 가능하게
- SCRAM 사용자 생성, ACL 부여 명령 예시
- listeners / advertised.listeners 조합 패턴 5가지 (내부/외부/도커/K8s)
- 트러블슈팅: 인증 실패 시 로그 읽는 법

### streams.html
- DSL 연산자 표: 연산 | 입력 → 출력 타입 | 상태 저장 여부 | 리파티션 유발 여부
  (리파티션 유발 여부가 실무에서 가장 중요합니다)
- 윈도우 타입 비교표
- 조인 매트릭스
- 설정 핵심 15개

### connect.html
- REST API 엔드포인트 전체 표: 메서드 | 경로 | 용도 | curl 예시
- 커넥터 공통 설정
- SMT 목록 표: 이름 | 용도 | 주요 파라미터
- 커넥터 상태 코드와 대응
```

---

## A7 — CCDAK 챕터 (ccdak/) ★★★ 최우선 에이전트

```
## 당신이 이 프로젝트에서 가장 중요한 에이전트입니다

프로젝트 1순위 목표가 **CCDAK 합격**이고, 당신이 그 목표의 중심 산출물을 만듭니다.
다른 에이전트보다 더 많은 분량과 더 높은 완성도를 요구받습니다.

소유 파일:
  ccdak/index.html
  ccdak/domain-{app-development,fundamentals,connect,observability,streams,testing}.html
  ccdak/exam-tips.html
  ccdak/flashcards.html   ← 신규
  ccdak/cram.html         ← 신규
  ccdak/traps.html        ← 신규

### 사전 조사 (필수)
WebFetch로 아래를 조사해 도메인 구성을 확정하세요:
- https://www.confluent.io/certification/ (403이면 developer.confluent.io 경유)
- Confluent 공식 CCDAK Exam Guide / Study Guide 문서
**덤프 사이트는 조사 대상에서 제외합니다.**

조사 기준 잠정 도메인 (확인해서 다르면 실제 값으로 교체하고 리포트에 명시):
- Application Development 28%
- Fundamentals 23%
- Kafka Connect 15%
- Application Observability 13%
- Kafka Streams 12%
- Application Testing 8%

⚠️ Confluent는 문항 수·합격 점수를 공개하지 않습니다.
"미공개"로 표기하고, 모의고사 60문항/90분은 "연습용 벤치마크"라고 명시하세요.
추정치를 사실처럼 쓰지 마세요.

### ccdak/index.html
- 시험 개요 표: 대상, 시간(90분), 응시료(USD 150), 유효기간(2년),
  재응시 대기(7일), 언어(영어), 문항수(미공개), 합격점(미공개)
- 도메인 블루프린트 표 + 가중치 도넛/바 차트 (인라인 SVG)
- **도메인 ↔ 기본개념 챕터 매핑표** (이 페이지의 핵심 가치)
- **4주 학습 플랜** 표: 주차 | 학습 챕터 | 실습 예제 | 풀 문제 세트 | 목표 정답률
- 시험 신청 절차 요약
- 각 도메인 페이지로 링크

### ccdak/domain-{slug}.html (6개)
slug: app-development, fundamentals, connect, observability, streams, testing

각 페이지 구조:
1. 이 도메인이 묻는 것 (2~3문장)
2. 핵심 개념 요약 — 기본개념 챕터의 압축판. 시험에 나오는 것만.
3. **반드시 외워야 할 설정값 표** (설정명 | 기본값 | 시험 포인트)
4. **자주 나오는 함정** 5개 이상 — 헷갈리는 개념 쌍을 비교표로
   (예: acks vs min.insync.replicas, retention vs compaction,
    session.timeout.ms vs max.poll.interval.ms)
5. 코드 읽기 문제 대비: 시험에 나오는 형태의 코드 스니펫과 판독 포인트
6. 관련 케이스 스터디 링크
7. 도메인 미니 퀴즈:
   <div class="quiz-embed" data-set="ccdak-{slug}" data-count="10"></div>

### ccdak/exam-tips.html
- 시험 당일 체크리스트 (프록터링 환경 준비)
- 문제 유형 패턴 분석: 설정값 묻기 / 시나리오 판단 / 코드 판독 / 계산
- 시간 배분 전략 (90분 / 문항당 배분 / 표시하고 넘어가는 기준)
- 오답 유도 패턴: 어떤 선택지가 함정으로 자주 나오는가
- 진단 테스트(quiz/diagnostic.html)와 모의고사 4세트로 이어지는 링크

### ccdak/traps.html — 함정 사전 (신규, 핵심 산출물)

**헷갈리는 개념 쌍 40개**를 좌우 비교표로 정리합니다.
독자가 시험 3일 전에 이 페이지만 반복해서 볼 수 있어야 합니다.

각 항목 형식: 
| | A | B |
|---|---|---|
| 무엇인가 | | |
| 어디 설정인가 | 프로듀서/컨슈머/브로커/토픽 | |
| 언제 발동하는가 | | |
| 혼동 시 결과 | | |
| 시험에서의 출제 형태 | | |

필수 포함 쌍 (최소 이 25개 + 15개 추가):
1. session.timeout.ms vs max.poll.interval.ms
2. acks vs min.insync.replicas
3. retention vs compaction (cleanup.policy)
4. assign() vs subscribe()
5. 멱등 프로듀서 vs 트랜잭션
6. at-least-once vs exactly-once
7. read_uncommitted vs read_committed
8. high watermark vs LEO vs committed offset
9. map vs mapValues (리파티션 유발 여부)
10. KStream vs KTable
11. KTable vs GlobalKTable
12. eager vs cooperative 리밸런스
13. Range vs RoundRobin vs Sticky vs CooperativeSticky
14. BACKWARD vs FORWARD 호환성 (배포 순서!)
15. TRANSITIVE vs 비-TRANSITIVE
16. source vs sink 커넥터의 오프셋 저장 위치
17. standalone vs distributed Connect
18. SMT vs Kafka Streams (어디까지 SMT로 할 것인가)
19. max.request.size vs message.max.bytes vs fetch.max.bytes
20. request.timeout.ms vs delivery.timeout.ms
21. retries vs delivery.timeout.ms (4.x에서 실질 상한은 무엇인가)
22. auto.offset.reset earliest vs latest vs none
23. SASL_PLAINTEXT vs SASL_SSL
24. 인증(authentication) vs 인가(authorization/ACL)
25. tumbling vs hopping vs sliding vs session 윈도우

그리고 **오답 유도 패턴 분석** 섹션:
- "가장 적절한"류 문항에서 함정 선택지의 특징
- 절대적 표현("항상", "절대", "모든")이 들어간 선택지
- 설정을 프로듀서/컨슈머 소속을 바꿔놓은 선택지
- 기본값을 미묘하게 바꿔놓은 선택지
- 버전에 따라 답이 달라지는 문항 식별법

다이어그램 플레이스홀더: D-134 (헷갈리는 설정 쌍 비교)

### ccdak/cram.html — 벼락치기 (신규)

**시험 D-1에 이 한 페이지만 읽으면 되는 단일 페이지 요약.**
- 페이지 내 목차 (긴 페이지이므로 필수)
- 도메인별 순서로 배치, 각 도메인 상단에 가중치 표기
- 형식은 **밀도 최우선**: 짧은 불릿 + 표. 서술형 문장 최소화
- 반드시 외워야 할 설정 기본값 표 (한 곳에 모아서)
- 반드시 외워야 할 숫자: message.max.bytes 1MB, in-flight 5,
  컨트롤러 쿼럼 3/5, 기본 파티션 수 등
- API 호출 순서: 트랜잭션 / Streams / Connect REST
- 다이어그램 플레이스홀더: D-133 (설정값 관계도) — 이 페이지의 핵심
- **`@media print` 대응**: 인쇄해서 볼 수 있어야 합니다.
  사이드바·버튼 숨김, 페이지 나눔이 표 중간에서 끊기지 않게

### ccdak/flashcards.html — 암기 카드 (신규)

`assets/js/flashcard.js`(Wave 0이 구현)와 `data/flashcards/*.json`(B4가 생성)을 씁니다.
당신은 **UI 페이지만** 만듭니다. 카드 데이터는 만들지 마세요.

- 덱 선택 UI: 도메인별 6덱 + "설정 기본값" 덱 + "예외 클래스" 덱
- 진행 상황 표시 (전체 / 학습 중 / 졸업)
- 조작 안내 (Space 뒤집기, 1 몰랐음, 2 알았음, → 다음)
- 카드 컨테이너 마크업: `<div id="flashcard-app" data-deck="ccdak-configs">`
  → flashcard.js가 이 요소를 찾아 렌더링합니다.
     Wave 0이 정한 실제 규약을 assets/js/flashcard.js에서 읽어 맞추세요.
- 데이터가 아직 없을 때 에러 없이 안내 표시
```

---

## A8 — CCAAK 챕터 (ccaak/)

```
소유 파일: ccaak/index.html, ccaak/domain-*.html, ccaak/exam-tips.html

### 사전 조사 (필수 — A7보다 중요)
CCAAK는 **공개 자료 간 도메인 가중치가 서로 다릅니다.**
WebFetch로 Confluent 공식 자료를 조사해 확정하세요. 덤프 사이트 제외.

조사 기준 잠정 섹션 (7개, 가중치는 출처별 불일치):
- Kafka Fundamentals
- Kafka Security
- Kafka Connect
- Deployment Architecture
- Cluster Configuration
- Observability
- Troubleshooting

⚠️ **가중치를 공식 자료로 확정하지 못하면 퍼센트를 표시하지 마세요.**
섹션 목록만 노출하고, "Confluent 공식 Exam Guide 기준 확인 필요"를
반환 리포트에 CRITICAL로 보고하세요. 추정 숫자를 쓰는 것보다 안 쓰는 게 낫습니다.

### ccaak/index.html
- 시험 개요 표 (A7과 동일 형식)
- **CCDAK와의 차이** 비교표 — 누가 어느 걸 봐야 하는지, 겹치는 영역
  (수험생이 가장 궁금해하는 부분입니다)
- 도메인 블루프린트 + 챕터 매핑표
- 4주 학습 플랜 (운영자 관점: 실습 클러스터 구축 → 장애 주입 → 복구 훈련)
- 실습 필수 항목: KRaft 클러스터 직접 구축, 브로커 장애 시뮬레이션,
  파티션 재할당, ACL 설정, lag 모니터링

### ccaak/domain-{slug}.html (7개)
slug: fundamentals, security, connect, deployment, cluster-config,
      observability, troubleshooting

각 페이지 구조 (운영자 관점으로 A7과 다르게):
1. 이 도메인이 묻는 것
2. 핵심 개념 요약 (운영 관점)
3. **필수 CLI 명령어** — 이 도메인에서 손에 익어야 할 명령들
4. **반드시 외워야 할 설정값 표**
5. **장애 시나리오와 대응** 3개 이상 (CCAAK는 시나리오 문제 비중이 큽니다)
6. 자주 나오는 함정
7. 관련 케이스 스터디 링크
8. 미니 퀴즈: <div class="quiz-embed" data-set="ccaak-{slug}" data-count="10"></div>

도메인별 중점:
- fundamentals: 아키텍처, 복제, ISR, 리더 선출 (KRaft 기준)
- security: SASL 메커니즘별 설정, ACL, TLS, listeners 조합 — 가장 실수 많은 영역
- connect: 분산 모드 운영, 워커 스케일링, 내부 토픽 관리, 커넥터 장애 복구
- deployment: 노드 롤, 컨트롤러 쿼럼 사이징, 랙 인식(rack awareness),
  멀티 DC, MirrorMaker 2, 하드웨어 사이징
- cluster-config: 브로커/토픽 동적 설정(kafka-configs), 쿼터, 로그 디렉터리,
  파티션 재할당, 롤링 업그레이드 절차
- observability: JMX 메트릭, lag 모니터링, 알림 임계값, 로그 분석
- troubleshooting: URP/OfflinePartitions 대응, 디스크 풀, 리밸런스 스톰,
  느린 컨슈머, 컨트롤러 이슈 — 의사결정 트리 포함

### ccaak/exam-tips.html
- A7과 동일 형식이되 **운영 시나리오 판단 문제 대비**에 초점
- "이 증상이면 무엇을 먼저 확인하는가" 패턴 정리
```

---

## Wave 1 완료 후 사람이 확인할 것

- [ ] 8개 에이전트 결과물의 시각적 톤이 일치하는가 (다르면 Wave 3 C4가 잡음)
- [ ] `node tools/validate.mjs --links --html` 결과에서 CDN 참조·`--zookeeper` 검출 0
- [ ] A7/A8이 보고한 "확인 실패 항목"에 CCAAK 가중치가 포함되었는가 → Wave 3 C1로 이관
