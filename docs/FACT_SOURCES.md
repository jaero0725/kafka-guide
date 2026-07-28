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
