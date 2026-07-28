# 사실 확인 소스 — 반드시 읽을 것

> ⚠️ **이 환경의 네트워크 정책이 공식 문서 웹사이트를 차단한다.**
> 계획서가 지시한 "kafka.apache.org에서 확인" 방식은 **동작하지 않는다.**
> 대신 아래의 **1차 소스(Apache Kafka 소스 코드)** 를 사용한다.

---

## 1. 차단된 호스트 (재시도 금지)

에이전트 프록시가 CONNECT 단계에서 403으로 거부한다. 조직 네트워크 정책이며 **재시도하지 말 것.**

```
kafka.apache.org         ✗ 403
docs.confluent.io        ✗ 403
developer.confluent.io   ✗ 403
www.confluent.io         ✗ 403
cwiki.apache.org         ✗ 403   (KIP 페이지)
```

확인 방법: `curl -sS http://127.0.0.1:43467/__agentproxy/status`

**차단되었다고 해서 사실 확인을 생략하지 말 것.** 아래 경로로 확인한다.

## 2. 열려 있는 소스

| 소스 | 상태 | 용도 |
|---|:--:|---|
| **`archive.apache.org`** | ✅ | **공식 site-docs 타르볼 — kafka.apache.org가 서빙하는 문서 전문** |
| `raw.githubusercontent.com` | ✅ | Apache Kafka 소스 코드 — ConfigDef 기본값의 최종 근거 |
| `github.com` | ✅ | 저장소 탐색 |
| WebSearch | ✅ | 릴리스 노트·KIP 내용·서술형 정보 (스니펫으로 반환) |

### ★ 최선의 경로: 공식 site-docs 타르볼

`kafka.apache.org`가 차단되어 있지만, **그 사이트가 서빙하는 문서 전문이 릴리스
타르볼로 배포된다.** `archive.apache.org`는 열려 있다.

```bash
curl -sO https://archive.apache.org/dist/kafka/4.3.1/kafka_2.13-4.3.1-site-docs.tgz
tar xzf kafka_2.13-4.3.1-site-docs.tgz
# → configuration/*.html, getting-started/upgrade.md, operations/*, streams/*, connect/* …
```

이것이 **가장 신뢰할 수 있는 경로**다. 생성된 문서라서 설정 표·기본값·설명이
웹사이트와 완전히 동일하다. 설정 기본값을 대량으로 확인해야 하는 에이전트
(A6 치트시트, B2 문제은행)는 **소스 코드를 파일별로 뒤지지 말고 이 타르볼을 받아라.**

교차 확인이 필요하면 소스 코드의 ConfigDef를 함께 본다.

**핵심**: 공식 문서 웹사이트는 이 소스 코드로부터 생성된다.
즉 소스 코드가 웹사이트보다 **더 권위 있는 1차 소스**다. 우회가 아니라 상위 소스다.

---

## 3. 설정 기본값 — 정확한 파일 경로 (Kafka 4.3 브랜치, 전부 200 확인)

```
https://raw.githubusercontent.com/apache/kafka/4.3/{경로}
```

| 대상 | 경로 |
|---|---|
| **Producer** | `clients/src/main/java/org/apache/kafka/clients/producer/ProducerConfig.java` |
| **Consumer** | `clients/src/main/java/org/apache/kafka/clients/consumer/ConsumerConfig.java` |
| **Topic (이름·설명)** | `clients/src/main/java/org/apache/kafka/common/config/TopicConfig.java` |
| **Topic/Log (기본값)** | `storage/src/main/java/org/apache/kafka/storage/internals/log/LogConfig.java` |
| **Broker (로그·일반)** | `server-common/src/main/java/org/apache/kafka/server/config/ServerLogConfigs.java` |
| **Broker (복제)** | `server/src/main/java/org/apache/kafka/server/config/ReplicationConfigs.java` |
| **Broker (Scala ConfigDef)** | `core/src/main/scala/kafka/server/KafkaConfig.scala` |
| **KRaft 쿼럼** | `raft/src/main/java/org/apache/kafka/raft/QuorumConfig.java` |
| **Streams** | `streams/src/main/java/org/apache/kafka/streams/StreamsConfig.java` |
| **Connect Worker** | `connect/runtime/src/main/java/org/apache/kafka/connect/runtime/WorkerConfig.java` |
| **Connect Sink (DLQ)** | `connect/runtime/src/main/java/org/apache/kafka/connect/runtime/SinkConnectorConfig.java` |
| **AdminClient** | `clients/src/main/java/org/apache/kafka/clients/admin/AdminClientConfig.java` |
| **SSL** | `clients/src/main/java/org/apache/kafka/common/config/SslConfigs.java` |
| **SASL** | `clients/src/main/java/org/apache/kafka/common/config/SaslConfigs.java` |

### 읽는 방법
- **설정 이름과 설명 문자열**은 `*_CONFIG` / `*_DOC` 상수에 있다.
- **기본값**은 `static { CONFIG = new ConfigDef()...define(...) }` 블록의 `define()` 3번째 인자에 있다.
- `TopicConfig.java`에는 **이름과 설명만** 있고 **기본값은 `LogConfig.java`** 의 ConfigDef에 있다.
  토픽 설정 기본값을 확인할 때는 두 파일을 함께 봐야 한다.
- 소스 주석에 **버전별 변경 이력**이 적혀 있는 경우가 많다. 매우 유용하다.

### Confluent Schema Registry · Avro 소스도 열려 있다 (V2 확인)

`docs.confluent.io`는 차단되지만 **`raw.githubusercontent.com`은 apache/kafka 외
저장소에도 열려 있다.** Schema Registry 사실 확인은 이 경로를 쓴다.

```
raw.githubusercontent.com/confluentinc/schema-registry/master/client/src/main/java/
  io/confluent/kafka/schemaregistry/{CompatibilityLevel,CompatibilityChecker,SchemaValidatorBuilder}.java
raw.githubusercontent.com/confluentinc/schema-registry/master/schema-serializer/src/main/java/
  io/confluent/kafka/serializers/{AbstractKafkaSchemaSerDeConfig.java,schema/id/SchemaId.java,subject/*.java}
raw.githubusercontent.com/apache/avro/main/lang/java/avro/src/main/java/org/apache/avro/SchemaCompatibility.java
```

- `api.github.com`은 **403**이지만 raw 파일 직접 접근은 **200**이다.
- `avro.apache.org`는 차단(000).

**호환성 매트릭스를 이 소스로 계산하는 방법** (A2·V2가 독립적으로 같은 결론에 도달):
1. `CompatibilityChecker.java` → 모드별 전략
   (`BACKWARD`=`canReadStrategy`, `FORWARD`=`canBeReadStrategy`, `FULL`=`mutualReadStrategy`,
   `*_TRANSITIVE`=`validateAll`, `NONE`=no-op)
2. `AvroSchema.isBackwardCompatible()` → `SchemaCompatibility.checkReaderWriterCompatibility()` 위임.
   **BACKWARD면 reader=새 스키마, FORWARD면 reader=옛 스키마**
3. `SchemaCompatibility.java` → 판정 규칙
   - reader 필드에 대응하는 writer 필드가 없으면 **reader 쪽 `default` 필수**,
     없으면 `READER_FIELD_MISSING_DEFAULT_VALUE`
   - **writer에만 있는 필드는 무시** (검사 대상 아님)
   - 대응은 이름 또는 **reader 별칭(alias)**
   - 타입 승격만 허용: `LONG←INT`, `FLOAT←INT|LONG`, `DOUBLE←INT|LONG|FLOAT`, `BYTES↔STRING`

### Schema Registry 관련 확인·미확인 정리 (V2)
| 항목 | 상태 |
|---|---|
| wire format 오버헤드 | **정확히 5바이트** (magic 1 + id 4). magic `0x01`은 id 대신 16B GUID. Protobuf만 message index 추가 |
| `delete.retention.ms` | `86400000` (1일) |
| `errors.tolerance` | `none`. **DLQ 설정은 싱크 커넥터 전용** — source에는 `errors.deadletterqueue.*`가 없다 |
| DLQ 토픽 RF 기본 | `3` |
| sink 컨슈머 그룹 id | **`connect-{커넥터 이름}`** → `kafka-consumer-groups.sh`로 lag 조회 가능 |
| `num.stream.threads` / `num.standby.replicas` / `commit.interval.ms` | `1` / `0` / `30000` (EOS 시 `100`) |
| **기본 subject 전략 클래스명** | ⚠️ **쓰지 말 것.** master 소스는 `AssociatedNameStrategy`(레지스트리 조회 후 `TopicNameStrategy` 폴백)인데 `_DOC` 문자열은 여전히 `TopicNameStrategy`라고 말한다. **동작(`{topic}-value`)만 서술하고 클래스명은 단정하지 않는다** |
| **`connect.protocol` 기본값** | ⚠️ **쓰지 말 것.** 문서 서술은 `compatible`, 생성 설정표는 `sessioned`로 **불일치**. "증분 협력 리밸런싱이 기본"으로만 서술 |
| **`min.cleanable.dirty.ratio` 트리거 조건** | ⚠️ dirty ratio 계산에 활성 세그먼트가 포함되는지 미확정. 기본값 `0.5`만 쓰고 트리거 조건은 서술하지 않는다 |

### `docs/` 디렉터리는 없다
`apache/kafka/4.3/docs/configuration.html` 은 **404**다. 문서 HTML을 이 경로에서 찾지 말 것.

---

## 4. 이미 확인된 값 (재확인 불필요, 그대로 사용)

Kafka **4.3** 소스에서 직접 확인했다.

### Producer (`ProducerConfig.java`)
| 설정 | 기본값 | 비고 |
|---|---|---|
| `acks` | `all` | 3.0부터 변경 (이전 `1`) |
| `enable.idempotence` | `true` | 3.0부터 변경 |
| **`linger.ms`** | **`5`** | ⚠️ **4.0에서 `0` → `5`로 변경됨.** 소스 주석에 명시 |
| `batch.size` | `16384` | |
| `max.in.flight.requests.per.connection` | `5` | |
| `delivery.timeout.ms` | `120000` | |

> ⚠️ **`linger.ms=0`으로 쓰면 틀린다.** 시중 자료 대부분이 3.x 기준이라 `0`으로 적혀 있다.
> 이 항목은 `.note--version` 병기 대상이며, 문항으로도 출제 가치가 높다.

### Consumer (`ConsumerConfig.java`)
| 설정 | 기본값 |
|---|---|
| `max.poll.interval.ms` | `300000` |
| `max.poll.records` | `500` |
| `session.timeout.ms` | `45000` |
| `heartbeat.interval.ms` | `3000` |
| `auto.offset.reset` | `latest` |
| `isolation.level` | `read_uncommitted` |
| `partition.assignment.strategy` | `[RangeAssignor, CooperativeStickyAssignor]` |
| `fetch.max.bytes` | `52428800` (50MB) |
| `max.partition.fetch.bytes` | `1048576` (1MB) |
| `group.protocol` | `classic` |

> `group.protocol` 기본값이 `classic`이라는 점에 주의. KIP-848 새 프로토콜은 4.0에서 GA지만
> **기본값은 아니다.** `consumer`로 명시해야 활성화된다. 흔한 오해이므로 본문·문항에 반영할 것.

### Broker / Topic (site-docs 확인)
| 설정 | 기본값 | 비고 |
|---|---|---|
| `message.max.bytes` | **1048588** | 압축 후 배치 기준. "약 1MB"이지만 정확히는 1MB가 아니다 |
| `retention.ms` | `604800000` | 7일 |
| `cleanup.policy` | `delete` | |
| `num.partitions` | `1` | |
| `default.replication.factor` | `1` | |
| `auto.create.topics.enable` | `true` | |

### Producer 추가 (A1이 site-docs + 소스 이중 확인)
| 설정 | 기본값 |
|---|---|
| `buffer.memory` | `33554432` (32MB) |
| `max.block.ms` | `60000` |
| `retries` | `2147483647` |
| `request.timeout.ms` | `30000` |
| `retry.backoff.ms` / `retry.backoff.max.ms` | `100` / `1000` |
| `max.request.size` | `1048576` |
| `compression.type` | `none` (토픽 레벨은 `producer`) |
| gzip / lz4 / zstd 레벨 | `-1` / `9` / `3` |
| `transaction.timeout.ms` | `60000` |

### Broker / 복제 추가 (A1 확인)
| 설정 | 기본값 | 비고 |
|---|---|---|
| **`unclean.leader.election.enable`** | **`false`** | 직접 확인. 유실 위험 설정이므로 기본 비활성 |
| `min.insync.replicas` | `1` | ⚠️ RF=3이어도 기본 1이다. 케이스 6의 원인 |
| `replica.lag.time.max.ms` | `30000` | ISR 이탈 판정 |
| `replica.fetch.max.bytes` | `1048576` | |
| `offsets.topic.replication.factor` | `3` | |
| `auto.leader.rebalance.enable` | `true` | |
| `leader.imbalance.check.interval.seconds` | `300` | |
| `broker.heartbeat.interval.ms` / `broker.session.timeout.ms` | `2000` / `9000` | KRaft |
| `metadata.max.idle.interval.ms` | `500` | |
| `initial.broker.registration.timeout.ms` | `60000` | |
| `controller.quorum.auto.join.enable` | `false` | |

### 소스에서 확인된 동작 (수치 아님)
- `BuiltInPartitioner.partitionForKey` = `Utils.toPositive(Utils.murmur2(key)) % numPartitions`
- 예외 계층: `RetriableException` → `RefreshRetriableException` → `InvalidMetadataException`,
  그리고 `ApplicationRecoverableException`
- 콜백은 Sender 스레드 실행. 실패 시 `metadata` 필드가 **전부 `-1`**.
  같은 파티션 콜백은 순서 보장. **4.3부터 콜백 내 `flush()` 금지**
- `SerializationException`은 **동기로 던져진다** (콜백으로 오지 않음)
- 멱등성: `max.in.flight` 6 이상을 **명시**하면 `ConfigException`,
  다른 설정 충돌 시에는 **조용히 비활성화**. 브로커가 파티션별 최근 배치 5개만 보관
- `Partitioner` 인터페이스에 **`onNewBatch`는 없다** (구버전 자료 오류)
- **4.0에서 제거된 클래스**: `DefaultPartitioner`, `UniformStickyPartitioner`,
  `NotLeaderForPartitionException`
- `--time -1`은 LEO가 아니라 **high watermark**를 반환한다
- ELR (KIP-966): 4.1부터 기본 활성
- 정적 vs 동적 컨트롤러 쿼럼 (KIP-853), `kafka-storage.sh` 포맷 3경로
  (`--standalone` / `--initial-controllers` / `--no-initial-controllers`)

### 4.3에서 바뀐 CLI 옵션 (KIP-1147, A7 확인)
기존 옵션은 **deprecated이며 5.0에서 제거 예정**이다. 시중 자료는 전부 구 옵션이다.

| 도구 | 기존 (deprecated) | 4.3 신규 |
|---|---|---|
| `kafka-consumer-perf-test.sh` | `--messages` | **`--num-records`** |
| `kafka-producer-perf-test.sh` | `--producer-props` | **`--command-property`** |
| perf 공통 | `--producer.config` / `--consumer.config` | **`--command-config`** |

추가된 옵션: `kafka-producer-perf-test.sh`에 `--bootstrap-server`·`--reporting-interval`,
`kafka-consumer-perf-test.sh`에 `--include`.

### 개수를 단정하지 말 것
A3와 A7이 같은 대상을 다르게 셌다 (SMT 16 vs 15, Connect REST 26 vs 20).
세는 기준(predicate 포함 여부, 내부 엔드포인트 포함 여부)이 달라서 생긴 차이다.
**본문·문항에 개수를 쓰지 말고 목록만 실어라.** "SMT는 몇 종인가" 같은 문항도 만들지 말 것.

### 배치 분할 재시도 — 재시도 예산을 소모하지 않는다 (A5·V3 충돌을 소스로 판정)

`Sender.java:676` (Kafka 4.3):
```java
if (error == Errors.MESSAGE_TOO_LARGE && batch.recordCount > 1 && !batch.isDone() &&
        (batch.magic() >= RecordBatch.MAGIC_VALUE_V2 || batch.isCompressed())) {
    // If the batch is too large, we split the batch and send the split batches again.
    // We do not decrement the retry attempts in this case.
```

**두 경로를 구분해야 한다. 이 구분이 시험 가치가 높다.**

| 경로 | 동작 |
|---|---|
| 클라이언트 `max.request.size` 초과 | `RecordTooLargeException` **즉시 실패**. `ApiException` 상속 = 비재시도 |
| 브로커 `message.max.bytes` 초과 | `MESSAGE_TOO_LARGE` → **Sender가 배치를 쪼개 재전송. 재시도 횟수를 소모하지 않음** |

- 분할 조건: `recordCount > 1` 이고 (magic ≥ V2 **또는** 압축된 배치)
- **단일 레코드 배치는 더 쪼갤 수 없어 최종 실패**한다
- 재시도 예산을 안 쓰므로 사실상 멈추지 않고, 요청 수가 폭증해 버퍼가 고갈된다
  → "무한 재시도"처럼 보이는 것은 **애플리케이션 루프가 아니라 클라이언트 내부 동작**이다

> V3가 D-119에 "무한 재시도로 보이는 증상은 대개 애플리케이션 자체 루프"라고 적었으나
> **틀렸다.** A5가 소스로 확인한 내용이 맞아 D-119를 정정했다 (2026-07-28).

### fetch 3종은 하드 상한이 아니다 (V3·A5 공통 확인)
`replica.fetch.max.bytes` / `max.partition.fetch.bytes` / `fetch.max.bytes`는 절대 상한이 아니다.
**첫 배치가 이 값보다 커도 그대로 반환**해 복제·소비가 멈추지 않도록 보장한다 (문서 명시).
→ "큰 레코드가 컨슈머를 멈춘다"는 4.x에서 **오답**이다. 좋은 오답 선택지 소재.

### 하드 게이트는 둘뿐이다
`max.request.size`(프로듀서) 와 `message.max.bytes`/`max.message.bytes`(브로커·토픽).
`message.max.bytes`는 **압축 후 배치 크기** 기준이다.
브로커 `message.max.bytes` ↔ 토픽 `max.message.bytes` — **어순이 반전**되어 있어 자주 틀린다.

### Kafka 4.3 API 변경 — 출제 가치가 높다 (A4 확인)

| 항목 | 4.3 상태 |
|---|---|
| `Consumer.close(Duration)` | **@Deprecated** → `close(CloseOptions)` |
| `sendOffsetsToTransaction(Map, String)` | **오버로드 제거.** `ConsumerGroupMetadata` 변형만 존재 |
| `ConsumerRecords#nextOffsets()` | 신규. **리더 에포크 포함** 커밋 오프셋 제공 |
| Connect `rest.port` | **4.x에 없다.** `listeners=http://:8083` 를 쓴다 |
| 4.0 제거 클래스 | `DefaultPartitioner`, `UniformStickyPartitioner`, `NotLeaderForPartitionException` |

### A4가 확인한 추가 기본값
```
group.coordinator.rebalance.protocols=classic,consumer,streams
num.io.threads=8            num.network.threads=3
transaction.max.timeout.ms=900000
transactional.id.expiration.ms=604800000
transaction.state.log.replication.factor=3   transaction.state.log.min.isr=2
Connect: listeners=http://:8083  plugin.discovery=hybrid_warn
         offset.storage.partitions=25  status.storage.partitions=5
         errors.tolerance=none  errors.deadletterqueue.context.headers.enable=false
MM2:     replication.factor=2  (3이 아니다)   sync.group.offsets.enabled=false
```

### 차단된 추가 호스트
`packages.confluent.io` (CONNECT 403), `quay.io` API, `api.github.com` (403).
→ Confluent Maven 아티팩트 버전은 **GitHub 태그의 `pom.xml`** 로 교차 확인한다
  (예: `raw.githubusercontent.com/confluentinc/schema-registry/v8.2.2/pom.xml`).
→ Debezium 커넥터는 이미지 대신 **Maven Central 플러그인 tarball**을 쓴다.

### Maven/PyPI/npm 확인값 (A4)
```
spring-boot 4.1.0 / spring-kafka 4.1.0 (kafka-clients 4.2.1 관리)
  ⚠️ Spring Boot 4 는 스타터가 spring-boot-starter-kafka,
     자동설정 패키지가 org.springframework.boot.kafka.autoconfigure
avro 1.12.1 / debezium 3.6.0.Final / jmx_prometheus_javaagent 1.0.1
confluent-kafka(python) 2.15.0 / kafkajs 2.2.4
Schema Registry 8.2.2 (Docker Hub 최신 태그 + GitHub v8.2.2 pom.xml 교차 확인)
```

### ⚠️ 공식 문서에 없어서 쓰면 안 되는 것
- **압축 코덱별 압축률·CPU·지연의 구체적 수치.** 공식 문서에 없다.
  상대 비교로만 서술하고, 필요하면 실측을 안내한다.
- **처리량/지연 프리셋의 구체값** (`batch.size=65536` 등)은 공식 권장값이 아니다.
  "방향을 나타내는 출발점"으로 명시할 것.
- `compression.gzip.level=-1`이 실제 매핑되는 레벨 (구현 기본으로만 확인됨)

### 환경 요구사항 (site-docs `operations/java-version.md`)
| 항목 | 값 |
|---|---|
| Java | **17 · 21 · 25 완전 지원.** 11은 clients/streams 등 일부만. **8은 4.0에서 제거** |
| Scala 배포판 | `kafka_2.13-4.3.1.tgz` **단일** (2.12 배포 없음) |
| 4.3 업그레이드 | KRaft 필수. 소프트웨어·메타데이터 **최소 3.3.x**. ZK는 사전 마이그레이션 필수 |
| Share Groups (KIP-932) | **4.2에서 production-ready** (4.1은 preview) — `getting-started/upgrade.md` |

> `VERSION_POLICY.md` §2 표의 "파티션 할당 기본 전략 — 확인 필요" 칸이 해소되었다:
> **`[RangeAssignor, CooperativeStickyAssignor]`** (site-docs 확인).

---

## 5. refs URL 정책 (중요)

문항의 `refs`와 페이지의 "공식 문서 출처"에는 **여전히 `kafka.apache.org` URL을 쓴다.**

- 사이트를 **읽는 사람**은 그 URL을 정상적으로 열 수 있다. 차단은 이 빌드 환경에만 해당한다.
- 즉 **인용은 공식 문서 URL, 검증은 소스 코드**로 분리한다.
- `raw.githubusercontent.com` URL을 `refs`에 넣지 말 것. 학습자에게 부적절하다.
- 단, 소스 코드로만 확인 가능한 미묘한 사실(예: `linger.ms` 변경 시점)은
  `refs`에 공식 문서 URL을 쓰고, 본문에 "Kafka 4.0부터"라고 버전을 명시한다.

앵커 형식 (기존 유지):
```
https://kafka.apache.org/documentation/#producerconfigs_acks
https://kafka.apache.org/documentation/#topicconfigs_min.insync.replicas
https://kafka.apache.org/documentation/#brokerconfigs_message.max.bytes
https://kafka.apache.org/documentation/#consumerconfigs_max.poll.interval.ms
```

> 이 앵커들이 실제로 존재하는지는 이 환경에서 검증할 수 없다.
> Wave 3 C3는 외부 URL 생존 확인을 **"검증 불가"로 보고**하고, 형식 일관성만 검사한다.

---

## 6. 릴리스 노트·KIP·서술형 정보

`cwiki.apache.org`(KIP)와 릴리스 노트 페이지가 차단되어 있으므로 **WebSearch를 사용**한다.
WebSearch는 해당 페이지의 내용을 요약해 반환하므로 사실 확인에 쓸 수 있다.

검색 예:
```
"Apache Kafka 4.2 release announcement share groups production ready"
"KIP-848 consumer rebalance protocol group.protocol consumer GA"
"KIP-932 share groups acknowledgement types ACCEPT RELEASE REJECT"
"Kafka 4.0 linger.ms default changed 0 to 5"
```

**검색 스니펫만으로 확인된 사실은 그 출처를 반환 리포트에 명시**하고,
소스 코드로 교차 확인이 가능하면 반드시 교차 확인한다.

---

## 7. 확인 못 한 항목의 처리

원칙은 그대로다. **추정치를 사실처럼 쓰지 않는다.**

| 상황 | 처리 |
|---|---|
| 소스에서 확인됨 | 그대로 쓴다 |
| WebSearch로만 확인됨 | 쓴다. 단 반환 리포트에 "검색 기반 확인"으로 명시 |
| 어느 쪽으로도 확인 안 됨 | **쓰지 않는다.** 해당 문장/표 칸을 비우고 리포트에 나열 |
| 자격증 정보 (CCAAK 가중치 등) | Confluent 전 도메인이 차단됨 → **확인 불가.** 퍼센트 미표기 |

### CCAAK / CCDAK 도메인 가중치
`confluent.io` 전 도메인이 차단되어 **공식 Exam Guide로 확정할 수 없다.**
- CCDAK 28/23/15/13/12/8 은 WebSearch로 복수 출처에서 일치 확인됨 → 사용하되 "출처: 공개 자료" 표기
- CCAAK 가중치는 출처별 불일치 + 공식 확인 불가 → **퍼센트를 표기하지 않고 섹션 목록만 노출**
- 사이트에 "Confluent 공식 Exam Guide 기준으로 재확인 필요" 주석을 남긴다
- 덤프 사이트 숫자는 근거로 인정하지 않는다 (정책 변경 없음)
