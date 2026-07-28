# CCDAK 필수 토픽 체크리스트

> 출처: 사용자 제공 실전 출제 경향 + [danielsobrado/CCDAK-Exam-Questions](https://github.com/danielsobrado/CCDAK-Exam-Questions)의 **토픽 구성**
>
> ⚠️ **저작권 주의**: 위 저장소는 **CC BY-NC-ND 4.0** 라이선스다.
> NoDerivatives 조항 때문에 **문항 텍스트를 복사하거나 변형해서 쓸 수 없다.**
> 이 저장소는 **"어떤 주제가 나오는가"를 파악하는 용도로만** 참조한다.
> 문항은 전부 공식 문서 기반으로 새로 창작한다. 문장 구조 모방도 금지.
> (주제·사실 자체는 저작권 대상이 아니므로 토픽 목록 참조는 문제없다.)

---

## 사용 방법

- **Wave 1 콘텐츠 에이전트**: 담당 챕터에 해당하는 항목이 본문에 **반드시 포함**되었는지 확인
- **Wave 2 문제 생성 에이전트**: 담당 도메인의 항목마다 **최소 1문항 이상** 출제
- **Wave 3 C1 검증 에이전트**: 이 체크리스트를 기준으로 **커버리지 감사** 수행 후 누락 보고

각 항목의 `→` 는 담당 챕터 / 문제 세트다.

---

## A. Producer

| # | 토픽 | 반드시 다룰 포인트 | 담당 |
|:--:|---|---|---|
| A1 | `onCompletion()` 호출 시점 | 콜백은 **Sender 스레드**에서 실행 / 브로커 응답(또는 최종 실패) 시점에 호출 / `send()`는 비동기 즉시 반환 / 콜백 안에서 블로킹 작업 금지 / 같은 파티션 콜백은 순서 보장 / `(metadata, exception)` 중 하나는 null | ch04, ccdak-app-development |
| A2 | `enable.idempotence` × `max.in.flight.requests.per.connection` | 멱등성 켜면 in-flight **5 이하**여야 순서+중복제거 보장 / 5 초과 시 설정 오류 / PID+시퀀스 번호로 브로커가 중복 판별 / 3.0부터 기본 활성 | ch04, ch06 |
| A3 | 재시도 가능한 에러 vs 불가능한 에러 | **retriable**: `LeaderNotAvailableException`, `NotLeaderOrFollowerException`, `NotEnoughReplicasException`, `NetworkException`, `TimeoutException`, `CoordinatorNotAvailableException` / **non-retriable**: `RecordTooLargeException`, `SerializationException`, `AuthorizationException`, `InvalidTopicException` / `RetriableException` 인터페이스 상속 여부가 기준 / `delivery.timeout.ms`가 전체 상한 | ch04, cases/case10 |
| A4 | 키 없는 메시지의 파티션 분배 | 키 있으면 `murmur2(key) % numPartitions` (결정적) / **키 없으면 기본 파티셔너가 sticky batching으로 분배** — "완전한 라운드로빈"이 아니라 **배치 단위 sticky 후 전환** / 2.4 이전 `DefaultPartitioner`는 라운드로빈 / 시험에서는 "round-robin 방식으로 분산"으로 출제되는 경우가 있으므로 **양쪽 서술을 모두 설명**할 것 | ch04, cases/case04 |
| A5 | `bootstrap.servers`에 여러 브로커 지정 이유 | **초기 연결 이중화**(부트스트랩 시점 단일 장애점 제거) / 전체 브로커 목록을 적을 필요 없음 — 하나만 붙으면 메타데이터로 전체 클러스터를 알아냄 / **부하 분산 목적이 아님** (흔한 오답 선택지) | ch04, ch02 |
| A6 | `acks` × `min.insync.replicas` | 조합별 내구성 매트릭스 / `acks=all`일 때만 `min.insync.replicas` 의미 있음 | ch04, ch02, cases/case06 |

## B. Consumer

| # | 토픽 | 반드시 다룰 포인트 | 담당 |
|:--:|---|---|---|
| B1 | `assign()` vs `subscribe()` | `subscribe()`: 그룹 관리 참여, 리밸런스 발생, 자동 파티션 할당, 그룹 오프셋 커밋 / `assign()`: **수동 파티션 지정, 그룹 조정 없음, 리밸런스 없음, `group.id` 없어도 동작** / **둘을 섞어 쓰면 `IllegalStateException`** / `assign()`은 파티션 추가를 자동 감지하지 않음 | ch05, ccdak-app-development |
| B2 | `max.poll.interval.ms` | 두 `poll()` 호출 사이 최대 허용 시간 (기본값 공식 문서 확인 — 300000ms) / 초과 시 컨슈머가 그룹에서 **제거되고 리밸런스** / `session.timeout.ms`(하트비트 기반)와 **다른 축**임을 반드시 구분 / `max.poll.records`를 줄이는 것이 1차 처방 | ch05, cases/case02 |
| B3 | 리밸런싱 발생 조건 | 컨슈머 합류/이탈 / 컨슈머 크래시(session timeout) / `max.poll.interval.ms` 초과 / **토픽 파티션 수 증가** / 구독 패턴에 매칭되는 새 토픽 생성 / 코디네이터 장애 / `assign()` 사용 시에는 발생하지 않음 | ch05, cases/case02 |
| B4 | Sticky Assignor / CooperativeStickyAssignor | 할당 균등성 + **기존 할당 최대한 유지** / Cooperative는 **eager와 달리 전체 파티션을 회수하지 않고 증분 재할당** → stop-the-world 없음 / 마이그레이션 시 두 단계 롤링 필요 / Range/RoundRobin과 비교표 | ch05 |
| B5 | 오프셋 커밋과 `auto.offset.reset` | earliest/latest/none 분기 조건 (**커밋된 오프셋이 없을 때 또는 오프셋이 범위를 벗어났을 때만** 적용) | ch05, cases/case01 |

## C. Topic / Broker / Storage

| # | 토픽 | 반드시 다룰 포인트 | 담당 |
|:--:|---|---|---|
| C1 | 브로커 최대 메시지 크기 | `message.max.bytes` **기본 1MB** (정확히는 1048588 bytes — 공식 문서 확인) / 토픽 레벨 `max.message.bytes`가 오버라이드 / 프로듀서 `max.request.size` / 컨슈머 `fetch.max.bytes`·`max.partition.fetch.bytes` / 팔로워 `replica.fetch.max.bytes` — **5개가 정합해야 함** / 압축 후 크기 기준 | ch07, cases/case10 |
| C2 | Topic Compaction | `cleanup.policy=compact` / 키별 **최신 값만 유지** / **tombstone(value=null)** 으로 삭제 표현, `delete.retention.ms` 후 제거 / 활성 세그먼트는 컴팩션 대상 아님 / `min.cleanable.dirty.ratio`, `min.compaction.lag.ms`, `max.compaction.lag.ms` / `compact,delete` 조합 / **키가 필수** (키 없으면 컴팩션 불가) / 중복 제거는 즉시가 아니라 백그라운드 | ch07, cases/case08 |
| C3 | `kafka-reassign-partitions.sh` | 3단계 워크플로: `--generate` → `--execute` → `--verify` / JSON 재할당 계획 형식 / `--throttle`로 복제 대역폭 제한 (**완료 후 반드시 해제**) / **파티션 수 변경은 불가** — 리더/레플리카 위치만 이동 / 브로커 추가·제거·랙 재배치 시 사용 / `--cancel` | ch11, ccaak-cluster-config, cheatsheet/cli |

## D. Transactions / Delivery

| # | 토픽 | 반드시 다룰 포인트 | 담당 |
|:--:|---|---|---|
| D1 | `isolation.level` | `read_uncommitted`(**기본값**) vs `read_committed` / `read_committed`는 커밋된 트랜잭션 메시지만 반환, **LSO(Last Stable Offset)** 까지만 읽음 / 진행 중 트랜잭션이 있으면 그 뒤 메시지는 커밋돼도 안 보임 → 지연 증가 / 컨트롤 레코드는 애플리케이션에 노출되지 않음 / **컨슈머 설정임** (프로듀서 아님) | ch06, ccdak-app-development |

## E. Kafka Connect

| # | 토픽 | 반드시 다룰 포인트 | 담당 |
|:--:|---|---|---|
| E1 | Source vs Sink 오프셋 저장 위치 | **Source**: 커넥터가 만든 소스 시스템 오프셋을 **`offset.storage.topic`**(distributed) 또는 `offset.storage.file.filename`(standalone)에 저장 / **Sink**: 일반 컨슈머처럼 **`__consumer_offsets`** 에 저장 (Connect 내부 토픽 아님) — **이 비대칭이 핵심 출제 포인트** / 내부 토픽 3종: config/offset/status, 전부 `cleanup.policy=compact` | ch09, ccdak-connect |
| E2 | 워커 장애 시 로그 찾기 | Connect 워커는 각 노드 로컬 파일에 로그를 남기므로 **죽은 노드의 로그를 직접 봐야 함** / 클러스터 전체 조망은 **커넥터 전용 log appender를 추가**해 중앙 집계 (log4j appender 설정으로 커넥터별 로그 분리) / `connect-runtime` 로거 레벨 조정 / **REST API `PUT /admin/loggers/{logger}` 로 런타임 로그 레벨 변경 가능** / `GET /connectors/{name}/status`로 실패한 task의 `trace` 확인 → 그 task가 있던 워커의 로그를 조회 | ch09, ccaak-troubleshooting, cheatsheet/troubleshooting |
| E3 | Connect 409 Conflict | 원인: **리밸런스 진행 중**(워커 합류/이탈로 재구성 중) / 동일 이름 커넥터 **이미 존재** / 요청이 리더가 아닌 워커로 갔는데 포워딩 실패 / 조치: 리밸런스 완료 대기 후 재시도, 이름 충돌 확인 / 409는 재시도 가능한 상태 | ch09, cheatsheet/connect |
| E4 | SMT (Single Message Transform) 특징 | **메시지 단위** 변환 (레코드 하나씩) / **stateless** — 집계·조인 불가 / 여러 개를 **체인**으로 구성, 순서 중요 / source는 쓰기 전, sink는 쓰기 직전 적용 / 커스텀 구현 가능(`Transformation` 인터페이스) / 대표: `InsertField`, `ReplaceField`, `MaskField`, `ValueToKey`, `ExtractField`, `Cast`, `TimestampConverter`, `RegexRouter`, `Filter`, `HoistField`, `Flatten` / **무거운 변환은 SMT가 아니라 Streams로** | ch09, cheatsheet/connect |

## F. Kafka Streams

| # | 토픽 | 반드시 다룰 포인트 | 담당 |
|:--:|---|---|---|
| F1 | 두 토픽 조인 조건 | **co-partitioning 요구사항**: ① 양쪽 **키가 같아야** 함 ② **파티션 수가 동일**해야 함 ③ **같은 파티셔닝 전략** 사용 / 위반 시 `TopologyException` 또는 잘못된 결과 / 불일치 시 `repartition()`으로 강제 재분배 / **GlobalKTable 조인은 co-partitioning 불필요** (전체 복제) / KStream-KStream 조인은 **윈도우 필수** | ch10, ccdak-streams |
| F2 | KStream vs KTable에 적합한 데이터 | **KStream**: 독립적인 사실의 연속 — 클릭, 결제 트랜잭션, 센서 측정, 로그 (**append-only, 같은 키 반복 = 각각 별개 이벤트**) / **KTable**: 키별 최신 상태 — 사용자 프로필, 재고 수량, 계정 잔액 (**upsert 의미, 같은 키 반복 = 갱신, null = 삭제**) / **GlobalKTable**: 작고 자주 안 변하는 참조 데이터 (국가 코드, 환율) / changelog vs record stream 이원성 | ch10, ccdak-streams |
| F3 | stateless vs stateful 연산 | **stateless**: `map`, `mapValues`, `filter`, `filterNot`, `flatMap`, `flatMapValues`, `foreach`, `peek`, `branch`, `merge`, `selectKey`, `to`, `through` / **stateful**: `count`, `reduce`, `aggregate`, 모든 **윈도우 연산**, 모든 **조인**, `suppress` / stateful은 **상태 저장소(RocksDB) + changelog 토픽** 생성 / **키를 바꾸는 연산(`map`, `selectKey`)은 리파티션 유발** — `mapValues`는 유발하지 않음 (**시험 단골**) | ch10, cheatsheet/streams |

## G. Security

| # | 토픽 | 반드시 다룰 포인트 | 담당 |
|:--:|---|---|---|
| G1 | `security.protocol=SASL_SSL`의 의도 | **SASL로 인증 + TLS로 전송 암호화** 두 가지를 동시에 / 4개 값 비교: `PLAINTEXT`(인증X 암호화X), `SSL`(TLS 암호화 + 선택적 mTLS 인증), `SASL_PLAINTEXT`(인증O **암호화X** — 자격증명이 평문으로 흐름), `SASL_SSL`(인증O 암호화O, **프로덕션 권장**) / `SASL_PLAINTEXT` + `PLAIN` 조합은 비밀번호 평문 전송이라 위험 / 인증(authentication) ≠ 인가(authorization, ACL) | ch11, ccaak-security, cheatsheet/security |

## H. Schema Registry

| # | 토픽 | 반드시 다룰 포인트 | 담당 |
|:--:|---|---|---|
| H1 | Avro 스키마 호환성 판단 | **BACKWARD**(기본): 새 스키마로 **옛 데이터**를 읽을 수 있음 → 필드 삭제 OK, default 있는 필드 추가 OK → **컨슈머 먼저 배포** / **FORWARD**: 옛 스키마로 **새 데이터**를 읽을 수 있음 → 필드 추가 OK, default 있는 필드 삭제 OK → **프로듀서 먼저 배포** / **FULL**: 양방향 → default 있는 필드의 추가/삭제만 / `*_TRANSITIVE`: 직전 버전이 아니라 **모든 이전 버전**과 대조 / `NONE`: 검사 안 함 (위험) / **변경 유형 × 모드 허용 매트릭스가 핵심 산출물** / 필드 이름 변경은 어느 모드에서도 위험 (alias 필요) | ch08, cases/case09, ccdak-fundamentals |

## I. Testing

| # | 토픽 | 반드시 다룰 포인트 | 담당 |
|:--:|---|---|---|
| I1 | Kafka 테스팅 도구 | **단위 테스트**: `MockProducer` / `MockConsumer` (kafka-clients), Streams는 **`TopologyTestDriver`** + `TestInputTopic`/`TestOutputTopic` (브로커 불필요, 가장 자주 출제) / **통합 테스트**: **Testcontainers**(`KafkaContainer`), `EmbeddedKafkaCluster`, Spring `@EmbeddedKafka` / **성능 테스트**: **`kafka-producer-perf-test.sh`**, **`kafka-consumer-perf-test.sh`**, `kafka-e2e-latency.sh` — 주요 옵션과 출력 해석 / **목 데이터 생성**: Confluent **`kafka-connect-datagen`** 커넥터, ksqlDB `datagen` / 어떤 상황에 무엇을 쓰는지 **선택 기준 표** | ch10, practice/ex-테스트, ccdak-testing |

---

## 커버리지 감사 기준 (Wave 3 C1)

- [ ] A1~I1 **전 항목**이 최소 1개 챕터 본문에서 다뤄졌는가
- [ ] 각 항목마다 문제은행에 최소 1문항 존재하는가 (`tags`로 추적)
- [ ] "반드시 다룰 포인트"의 세부 사실이 공식 문서와 일치하는가
- [ ] danielsobrado 저장소의 **문장을 복제하거나 변형한 흔적이 없는가** (BY-NC-ND 위반 검사)

## 태그 규약

각 항목에 대응하는 문항의 `tags`에 아래 슬러그를 포함시켜 커버리지를 자동 추적한다.

```
A1 producer-callback   A2 idempotence-inflight  A3 retriable-errors
A4 partitioning        A5 bootstrap-servers     A6 acks-isr
B1 assign-vs-subscribe B2 max-poll-interval     B3 rebalance-triggers
B4 sticky-assignor     B5 offset-reset
C1 message-size        C2 compaction            C3 partition-reassign
D1 isolation-level
E1 connect-offsets     E2 connect-logging       E3 connect-409  E4 smt
F1 stream-join         F2 kstream-vs-ktable     F3 stateless-stateful
G1 security-protocol
H1 schema-compatibility
I1 kafka-testing
```
