# Kafka Guide — 전체 구축 계획

> 최종 산출물: **빌드 없이 브라우저에서 바로 열리는 정적 HTML 학습 사이트**
> (기본개념 11장 + 실무 예제 + 실수 케이스 10 + 치트시트 + CCDAK + CCAAK + 인터랙티브 문제풀이)

---

## 0. 기준 정보 (2026-07 조사 결과)

계획의 전제가 되는 사실 확인 내용. **모든 콘텐츠는 이 기준을 따른다.**

### Apache Kafka 버전 기준
| 항목 | 내용 |
|---|---|
| 최신 안정 버전 | **4.3.1** (2026-06-25, 버그픽스) / 4.3.0 (2026-05-22) |
| 문서 기준 버전 | **4.3.x** — 단, 실무 배포 현실을 고려해 3.x 차이점은 "버전 노트"로 병기 |
| ZooKeeper | **4.0에서 완전 제거.** KRaft가 유일한 모드 |
| KIP-848 (새 컨슈머 리밸런스 프로토콜) | 4.0에서 GA |
| KIP-932 (Queues / Share Groups) | 4.0 EA → 4.1 Preview → **4.2에서 production-ready** |
| Streams Rebalance Protocol | 4.1 Early Access |

> ⚠️ **중요**: 시중 한국어 Kafka 자료 대부분이 ZooKeeper 기반(2.x/3.x)이다.
> 이 가이드의 차별점은 **KRaft-first + Kafka 4.x 기준**이라는 점이다.
> 에이전트는 "ZooKeeper에 접속해서…" 같은 서술을 절대 기본값으로 쓰지 않는다.

### "2.13"은 Kafka 버전이 아니다 — Scala 버전이다

```
kafka_2.13-4.3.0.tgz
      ↑        ↑
   Scala    Kafka
```

배포 파일명 때문에 매우 흔하게 혼동되는 지점이다. **Kafka 2.13이라는 버전은 존재하지 않는다** (2.8 다음이 3.0). `_2.13`은 배포판이 컴파일된 Scala 버전이며, 현행 Kafka가 지원하는 유일한 Scala 버전이다. Scala를 직접 쓰지 않으면 `_2.13`을 고르면 된다.

이 혼동 자체가 실무·시험에서 반복되므로 **사이트에서 명시적으로 다룬다** (ch01 · 레거시 부록 · CLI 치트시트 · 확인문제 1문항 필수).

### 세 개의 버전 트랙을 병기한다

많은 조직이 아직 2.x / 3.x를 운영 중이다. 최신만 다루면 실무에서 못 쓰고, 구버전만 다루면 시험에서 틀린다.

| 트랙 | 범위 | 취급 |
|---|---|---|
| **현행 (기준)** | 4.3.x | 모든 본문의 기본 서술 |
| **직전** | 3.6 ~ 3.9 | 차이가 있으면 `.note--version`으로 병기 |
| **레거시** | 2.x | `basics/appendix-legacy.html`에서 집중 처리 |

상세 규칙과 버전별 차이 표는 **`docs/VERSION_POLICY.md`** 참조. 모든 콘텐츠 에이전트의 필독 문서다.

### 자격증 기준
| | CCDAK | CCAAK |
|---|---|---|
| 정식 명칭 | Confluent Certified Developer for Apache Kafka | Confluent Certified Administrator for Apache Kafka |
| 대상 | 애플리케이션 개발자 | 운영/SRE/플랫폼 엔지니어 |
| 시간 | 90분 (프록터링) | 90분 (프록터링) |
| 응시료 | USD 150 | USD 150 |
| 유효기간 | 2년 | 2년 |
| 재응시 | 7일 대기 | 7일 대기 |
| 도메인(조사 기준) | Application Development 28% / Fundamentals 23% / Kafka Connect 15% / Application Observability 13% / Kafka Streams 12% / Application Testing 8% | Kafka Fundamentals · Security · Kafka Connect · Deployment Architecture · Cluster Configuration · Observability · Troubleshooting (7개 블루프린트 섹션) |

> ⚠️ Confluent는 현재 **고정 문항 수·합격 점수를 공개하지 않는다.**
> 사이트에는 "비공개" 로 표기하고, 모의고사는 **60문항/90분**을 연습용 벤치마크로 사용한다고 명시한다.
> CCAAK 도메인 가중치는 출처별로 값이 엇갈리므로, **Wave 3 검증 에이전트가 공식 Exam Guide PDF로 재확인**한 뒤 확정한다.
> 확정 전까지 사이트에는 가중치 숫자를 단정적으로 쓰지 않고 "섹션 목록"만 노출한다.

### 콘텐츠 출처 정책
- ✅ 허용: kafka.apache.org (문서/KIP/릴리스 노트), cwiki.apache.org KIP 페이지, confluent.io/docs, developer.confluent.io, 공식 GitHub 소스
- ❌ 금지: **덤프 사이트(examtopics, validexamdumps, pass4success, skillcertpro 등)의 문제 복제**
  → 저작권 및 자격증 NDA 위반. 모든 문제는 **공식 문서 기반으로 새로 창작**한다.
  덤프는 "출제 경향 파악"에도 참조하지 않는다. 도메인 블루프린트만 참고한다.
- ⚠️ 제한적 허용: [danielsobrado/CCDAK-Exam-Questions](https://github.com/danielsobrado/CCDAK-Exam-Questions)
  → 저자가 직접 작성한 커뮤니티 학습 문제 모음(덤프 아님)이지만 라이선스가 **CC BY-NC-ND 4.0**이다.
  **NoDerivatives 조항 때문에 문항 텍스트의 복사도, 변형도 불가**하다.
  **"어떤 주제가 출제되는가"를 파악하는 토픽 체크리스트 용도로만** 사용한다.
  주제·사실 자체는 저작권 대상이 아니므로 이 범위의 참조는 문제없다. 문장 구조 모방까지 금지.

### 필수 출제 토픽 체크리스트

실전 출제 경향을 반영한 **24개 필수 토픽**을 `docs/CCDAK_TOPIC_CHECKLIST.md`에 정리했다.
Producer 콜백 호출 시점, `assign()` vs `subscribe()`, 키 없는 메시지의 파티션 분배, Connect source/sink 오프셋 저장 위치의 비대칭, 409 에러 원인, SMT 특성, `isolation.level`, Streams 조인 co-partitioning 조건, stateless/stateful 연산 구분, Avro 호환성 모드별 배포 순서, `security.protocol=SASL_SSL`의 의도, 카프카 테스팅 도구, `kafka-reassign-partitions.sh`, `message.max.bytes` 기본 1MB 등.

이 체크리스트는 **Wave 1(본문 커버리지) → Wave 2(문항 출제) → Wave 3(커버리지 감사)** 3단계에서 강제된다. 각 항목에 태그 슬러그가 부여되어 있어 커버리지를 자동 추적한다.

---

## 1. 사이트 구조

```
kafka-guide/
├── index.html                     # 홈 (학습 경로 · 진도 대시보드)
├── assets/
│   ├── css/
│   │   ├── tokens.css             # 디자인 토큰 (색/타이포/간격/다크모드)
│   │   ├── main.css               # 레이아웃 · 컴포넌트
│   │   └── code.css               # 코드 하이라이팅 테마
│   ├── js/
│   │   ├── app.js                 # 사이드바 · 검색 · 다크모드 · 목차
│   │   ├── quiz.js                # 문제풀이 엔진
│   │   ├── progress.js            # localStorage 진도/오답노트
│   │   └── highlight.js           # 경량 신택스 하이라이터 (자체 구현, CDN 금지)
│   └── img/diagrams/*.svg         # 인라인 SVG 다이어그램
│
├── basics/          ch01.html ~ ch11.html          # 기본개념 11장
│                    appendix-legacy.html           # 버전 표기·2.x/3.x 레거시 부록
├── practice/        ex01.html ~ ex12.html          # 실무 예제
├── cases/           case01.html ~ case10.html      # 실수 케이스 스터디
├── cheatsheet/      cli.html, config.html, metrics.html,
│                    troubleshooting.html, security.html,
│                    streams.html, connect.html      # 빠른참조
├── ccdak/           index.html, domain-*.html, exam-tips.html
├── ccaak/           index.html, domain-*.html, exam-tips.html
├── quiz/            index.html                      # 문제풀이 허브
│                    review.html                     # 오답노트
│                    result.html                     # 결과 리포트
│
├── data/
│   ├── toc.json                   # 전체 목차 (자동 생성)
│   ├── search-index.json          # 검색 인덱스 (자동 생성)
│   └── questions/
│       ├── manifest.json          # 문제은행 목록·메타
│       ├── ccdak-{domain}.json    # 도메인별
│       ├── ccaak-{domain}.json
│       └── basics-ch{NN}.json     # 챕터별 확인문제
│
├── tools/
│   ├── build-index.mjs            # 검색 인덱스 · TOC 생성
│   └── validate.mjs               # 링크/스키마/중복 검증
│
└── docs/
    ├── CONTENT_STYLE_GUIDE.md     # 모든 에이전트 공통 규칙
    ├── VERSION_POLICY.md          # 버전 기준·2.13 혼동·레거시 병기 규칙
    ├── QUESTION_SCHEMA.md         # 문제 JSON 스키마
    ├── CCDAK_TOPIC_CHECKLIST.md   # 필수 출제 토픽 24개 + 태그 규약
    └── agent-prompts/             # 멀티에이전트 프롬프트 (본 계획의 실행 단위)
        ├── README.md              # 실행 순서·공통 프리앰블
        ├── wave0-foundation.md
        ├── wave1-content.md
        ├── wave2-questions.md
        ├── wave3-verify.md
        └── wave4-integration.md
```

### 기술 선택과 근거
| 결정 | 선택 | 근거 |
|---|---|---|
| 프레임워크 | **없음 (Vanilla HTML/CSS/JS)** | 빌드 없이 `file://`로도 열림. 에이전트 병렬 작업 시 의존성 충돌 0 |
| 외부 CDN | **전면 금지** | 오프라인 학습 가능 + Artifact CSP 호환 + 수명 |
| 콘텐츠 저장 | HTML 페이지 (본문) + **JSON (문제)** | 문제를 데이터로 분리해야 퀴즈 엔진이 데이터 주도로 동작하고, 에이전트가 파일 충돌 없이 병렬 생성 가능 |
| 상태 저장 | `localStorage` | 서버 없음. 진도·오답·시험 기록 |
| 배포 | GitHub Pages (`main` 브랜치 루트) | 별도 인프라 불필요 |
| 다이어그램 | 인라인 SVG (직접 작성) | 이미지 의존성 없음, 다크모드에서 `currentColor`로 자동 대응 |

---

## 2. 콘텐츠 설계

### 2-1. 기본개념 11장

| 장 | 제목 | 핵심 내용 | 연계 자격증 |
|---|---|---|---|
| 1 | Kafka 개요와 이벤트 스트리밍 | 왜 Kafka인가, 메시지큐 vs 로그, 생태계 지도, 사용 사례 | 둘 다 |
| 2 | 아키텍처와 핵심 개념 | 브로커·토픽·파티션·오프셋·세그먼트·복제(ISR)·리더/팔로워 | 둘 다 |
| 3 | KRaft와 클러스터 메타데이터 | ZooKeeper 제거 배경, 컨트롤러 쿼럼, 메타데이터 로그, 노드 롤, 마이그레이션 | CCAAK 중심 |
| 4 | Producer 심화 | 전송 흐름, 배치/linger, `acks`, 멱등성, 파티셔너, 압축, 재시도/순서 | CCDAK 중심 |
| 5 | Consumer 심화 | 컨슈머 그룹, 파티션 할당 전략, 리밸런스, **KIP-848 새 프로토콜**, poll 루프, 오프셋 커밋 | CCDAK 중심 |
| 6 | 전달 보장과 트랜잭션 | at-most/at-least/exactly-once, 트랜잭션 코디네이터, EOS v2, `read_committed` | CCDAK 중심 |
| 7 | 스토리지·리텐션·컴팩션 | 로그 세그먼트, retention vs compaction, tombstone, Tiered Storage | 둘 다 |
| 8 | 스키마와 직렬화 | Avro/Protobuf/JSON Schema, Schema Registry, 호환성 모드, 스키마 진화 | CCDAK 중심 |
| 9 | Kafka Connect | 아키텍처(worker/connector/task), standalone vs distributed, SMT, converter, DLQ, REST API | 둘 다 |
| 10 | Kafka Streams와 ksqlDB | KStream/KTable, 상태 저장소, 윈도우, 조인, 토폴로지, 인터랙티브 쿼리 | CCDAK 중심 |
| 11 | 운영 기초 | 보안(SSL/SASL/ACL/RBAC), 모니터링(JMX 핵심 메트릭), 성능 튜닝, 용량 산정, **Share Groups/Queues** | CCAAK 중심 |
| 부록 | **버전 표기와 레거시** | `kafka_2.13-4.3.0` 표기 읽는 법, 2.x/3.x(ZooKeeper 시대) 운영, 버전별 변경 타임라인, 2.x → 3.9 → 4.x 업그레이드 경로, 레거시 명령 대응표 | 실무 |

**챕터 페이지 공통 구조**
1. 🎯 학습 목표 (3~5개 불릿)
2. 📖 본문 (개념 → 다이어그램 → 코드/설정 → 동작 원리)
3. ⚙️ 관련 설정 표 (설정명 / 기본값 / 설명 / 튜닝 포인트)
4. ⚠️ 흔한 오해 (Common Pitfalls) 3개 이상
5. 🔗 관련 케이스 스터디 · 치트시트 링크
6. ✅ 확인 문제 10문항 (인라인 퀴즈 위젯)
7. 📚 공식 문서 출처 링크

### 2-2. 실무 예제 (12개)

| # | 주제 | 스택 |
|---|---|---|
| 1 | 로컬 KRaft 클러스터 구축 | docker-compose (3노드, ZK 없음) |
| 2 | Spring Boot Producer/Consumer 기본 | Spring for Apache Kafka |
| 3 | 안전한 Producer 설정 (무손실) | Java, `acks=all`+idempotence+`min.insync.replicas` |
| 4 | 컨슈머 오프셋 전략 (수동 커밋 · 배치 처리) | Java |
| 5 | Exactly-Once 파이프라인 (consume-transform-produce) | Java Transactional API |
| 6 | DLQ + 재시도 패턴 | Spring Retry / `DefaultErrorHandler` |
| 7 | Avro + Schema Registry 스키마 진화 | Avro, `BACKWARD` 호환 |
| 8 | Kafka Connect CDC 파이프라인 | Debezium(MySQL) → Kafka → S3 Sink |
| 9 | Kafka Streams 실시간 집계 | 윈도우 집계 + 상태 저장소 |
| 10 | 컨슈머 Lag 모니터링 · 알림 | JMX + Prometheus + Grafana |
| 11 | 클러스터 간 복제 | MirrorMaker 2 |
| 12 | 파이썬/Node 클라이언트 | `confluent-kafka-python`, `kafkajs` |

**예제 페이지 공통 구조**: 시나리오 → 아키텍처 다이어그램 → 전체 코드(복사 버튼) → 실행 방법 → 검증 방법 → 프로덕션 고려사항 → 자주 하는 실수

### 2-3. 실수 케이스 스터디 (10개)

실제 프로덕션에서 반복되는 사고를 **증상 기반**으로 구성한다.

| # | 케이스 | 근본 원인 |
|---|---|---|
| 1 | 배포 후 며칠치 데이터가 사라졌다 | `auto.offset.reset=latest` + 컨슈머 그룹 ID 변경 |
| 2 | 컨슈머가 무한 리밸런스 루프에 빠졌다 | `max.poll.interval.ms` 초과 (처리 시간 > 폴 간격) |
| 3 | 브로커 장애 후 메시지가 유실됐다 | `acks=1` + `unclean.leader.election.enable=true` |
| 4 | 같은 주문의 상태가 뒤바뀌어 저장됐다 | 메시지 키 미지정 → 파티션 분산 → 순서 보장 상실 |
| 5 | 파티션을 1000개로 늘렸더니 더 느려졌다 | 파티션 수 과다 → 메타데이터/파일핸들/리밸런스 비용 |
| 6 | RF=3인데 브로커 1대 죽자 유실됐다 | `min.insync.replicas=1` 방치 |
| 7 | 재처리했더니 결제가 두 번 됐다 | 컨슈머 멱등성 부재 (at-least-once 특성 무시) |
| 8 | 상태 토픽 데이터가 조용히 사라졌다 | `cleanup.policy` 오설정 (compact 의도 → delete 동작) |
| 9 | 스키마 배포 후 전체 컨슈머가 죽었다 | Schema Registry 호환성 모드 오설정 (`NONE`) |
| 10 | 큰 메시지가 무한 재시도로 쌓였다 | `max.message.bytes` / `max.request.size` / `fetch.max.bytes` 불일치 |

**케이스 페이지 공통 구조**
1. 🚨 상황 (실제 장애 시나리오 서술)
2. 📉 관측된 증상 (로그 스니펫 · 메트릭 그래프 설명)
3. 🔍 원인 분석 (단계별 추적 과정)
4. 🧪 재현 방법 (docker-compose로 직접 재현 가능한 최소 코드)
5. ✅ 해결 (Before/After 설정 diff)
6. 🛡️ 예방 체크리스트
7. 🎓 관련 시험 포인트 (CCDAK/CCAAK 어느 도메인과 연결되는가)

### 2-4. 빠른참조 (Cheatsheets)

| 파일 | 내용 |
|---|---|
| `cli.html` | `kafka-topics`, `kafka-console-*`, `kafka-consumer-groups`, `kafka-configs`, `kafka-acls`, `kafka-reassign-partitions`, `kafka-storage`(KRaft), `kafka-dump-log` — 목적별 검색 가능한 표 |
| `config.html` | Broker / Topic / Producer / Consumer / Streams / Connect 핵심 설정 — 기본값 · 권장값 · 영향도 |
| `metrics.html` | 반드시 봐야 할 JMX 메트릭 (`UnderReplicatedPartitions`, `RequestHandlerAvgIdlePercent`, consumer lag 등) + 임계값 가이드 |
| `troubleshooting.html` | 증상 → 원인 → 조치 **의사결정 트리** (플로우차트 SVG) |
| `security.html` | SSL/SASL(PLAIN·SCRAM·GSSAPI·OAUTHBEARER)/ACL 설정 스니펫 모음 |
| `streams.html` | Streams DSL 연산자 · 상태 저장소 · 윈도우 타입 요약 |
| `connect.html` | Connect REST API 엔드포인트 · 커넥터 설정 · SMT 목록 |

### 2-5. 자격증 챕터 (CCDAK / CCAAK)

각 자격증마다:
- `index.html` — 시험 개요, 도메인 블루프린트, **4주 학습 플랜**, 챕터 매핑표(도메인 ↔ 기본개념 몇 장)
- `domain-*.html` — 도메인별 핵심 요약 + 시험에 나오는 포인트 + 함정 + 도메인 미니 퀴즈
- `exam-tips.html` — 시험 당일 전략, 자주 헷갈리는 설정값 비교표, 오답 유도 패턴 분석

---

## 3. 문제풀이 엔진 설계

### 3-1. 문제은행 규모 (목표)

| 세트 | 문항 수 |
|---|---|
| 기본개념 챕터별 확인문제 | (11장 + 부록) × 10 = **120** |
| CCDAK 도메인별 연습 | **150** (도메인 가중치 비례 배분) |
| CCAAK 도메인별 연습 | **120** |
| CCDAK 모의고사 2세트 | 60 × 2 = **120** |
| CCAAK 모의고사 2세트 | 60 × 2 = **120** |
| **합계** | **약 630문항** |

> 모의고사 세트는 도메인별 연습 문제와 **중복되지 않는 별도 문항**으로 생성한다.

### 3-2. 문제 JSON 스키마

`docs/QUESTION_SCHEMA.md`에 정식 정의. 요약:

```json
{
  "id": "ccdak-appdev-042",
  "exam": "CCDAK",
  "domain": "Application Development",
  "chapter": "ch04",
  "difficulty": "medium",
  "type": "single",
  "question": "프로듀서가 `acks=all`, `enable.idempotence=true`로 설정되어 있다. ...",
  "code": { "lang": "properties", "body": "acks=all\nretries=2147483647" },
  "choices": [
    { "id": "A", "text": "..." },
    { "id": "B", "text": "..." }
  ],
  "answer": ["B"],
  "explanation": "핵심 근거를 3~6문장으로. 왜 정답인지 원리로 설명.",
  "distractorNotes": {
    "A": "이 선택지가 틀린 이유 — 흔한 오해 지점 지적",
    "C": "..."
  },
  "refs": [
    { "title": "Kafka Docs — Producer Configs", "url": "https://kafka.apache.org/documentation/#producerconfigs" }
  ],
  "tags": ["acks", "idempotence", "ordering"]
}
```

**필수 품질 규칙**
- `explanation`은 정답 근거를 **원리로** 설명 (단순 반복 금지)
- `distractorNotes`는 **모든 오답 선택지**에 대해 작성
- `refs`는 최소 1개, **공식 문서 URL만**
- `type: "multiple"`이면 문제문에 "(2개 선택)" 명시
- 코드/설정 문제는 Kafka **4.3 기준 실제 설정명** 사용

### 3-3. 퀴즈 UI 기능

| 모드 | 동작 |
|---|---|
| **학습 모드** | 문항 제출 즉시 정답·해설·오답 노트 표시 |
| **시험 모드** | 60문항 / 90분 타이머 / 표시(flag) 기능 / 마지막에 일괄 채점 |
| **도메인 연습** | 특정 도메인만 필터링, 문항 수 선택 |
| **오답 노트** | 틀린 문항만 재출제, 3회 연속 정답 시 졸업 |
| **랜덤 챌린지** | 전체 은행에서 N문항 무작위 |

**결과 리포트**: 총점 / 도메인별 정답률 바차트(순수 CSS·SVG) / 취약 도메인 → 해당 챕터 링크 / 오답 목록 / 소요 시간

**진도 저장 (localStorage)**
```
kg:progress:read      → 읽은 페이지 집합
kg:progress:quiz      → { questionId: { attempts, correct, lastAt } }
kg:progress:exams     → 모의고사 응시 이력
kg:settings           → theme, fontSize
```
→ 홈 대시보드에서 "전체 진도 %", "도메인별 숙련도", "다음 학습 추천" 표시. 초기화 버튼 제공.

---

## 4. 멀티에이전트 실행 계획

### 원칙
1. **파일 소유권 배타 할당** — 한 파일은 한 에이전트만 쓴다. 공유 파일(`toc.json`, `search-index.json`)은 스크립트로 자동 생성.
2. **Wave 0 완료 전 Wave 1 착수 금지** — 공통 shell/CSS/JS/스키마가 먼저 고정돼야 스타일이 갈라지지 않는다.
3. **모든 에이전트는 `docs/CONTENT_STYLE_GUIDE.md`를 먼저 읽는다.**
4. **검증은 별도 Wave** — 생성 에이전트가 자기 결과를 검증하지 않는다 (적대적 검증).

### Wave 구성

```
Wave 0 · 기반 구축            [단독, 순차]        1 agent
  └─ 디자인 토큰 · shell · CSS · JS · 퀴즈 엔진 · 스키마 · 샘플 페이지 1개

Wave 1 · 본문 콘텐츠          [병렬]              8 agents
  ├─ A1  기본개념 ch01–04
  ├─ A2  기본개념 ch05–08
  ├─ A3  기본개념 ch09–11
  ├─ A4  실무 예제 12개
  ├─ A5  실수 케이스 10개
  ├─ A6  치트시트 7종
  ├─ A7  CCDAK 챕터
  └─ A8  CCAAK 챕터

Wave 2 · 문제은행             [병렬]              6 agents
  ├─ B1  기본개념 확인문제 110
  ├─ B2  CCDAK 도메인 연습 150
  ├─ B3  CCAAK 도메인 연습 120
  ├─ B4  CCDAK 모의고사 2세트 120
  ├─ B5  CCAAK 모의고사 2세트 120
  └─ B6  문제은행 매니페스트 · 중복 제거

Wave 3 · 검증 (적대적)        [병렬]              4 agents
  ├─ C1  기술 정확도 검증 (Kafka 4.3 공식 문서 대조)
  ├─ C2  문제 정답·해설 검증 (오답 색출)
  ├─ C3  링크·스키마·빌드 검증 (tools/validate.mjs)
  └─ C4  UI/UX·접근성·반응형·다크모드 검증

Wave 4 · 통합                 [단독, 순차]        1 agent
  └─ 검색 인덱스 · TOC 생성 · 홈 대시보드 · 상호 링크 연결 · 최종 스모크 테스트
```

**총 20 에이전트 / 5 Wave.** 예상 소요: Wave당 1회 실행 기준, 순차 5단계.

### 실행 방법
`docs/agent-prompts/` 아래 프롬프트를 Wave 순서대로 사용한다.
- Wave 0, 4는 단일 에이전트 (동기 실행)
- Wave 1, 2, 3은 **한 메시지에 모든 Agent 호출을 담아 병렬 실행**

### 충돌 방지 파일 소유권 표

| 에이전트 | 배타 소유 경로 |
|---|---|
| Wave0 | `assets/**`, `docs/CONTENT_STYLE_GUIDE.md`, `docs/QUESTION_SCHEMA.md`, `tools/**`, `basics/ch01.html`(샘플) |
| A1 | `basics/ch02.html`–`ch04.html` |
| A2 | `basics/ch05.html`–`ch08.html` |
| A3 | `basics/ch09.html`–`ch11.html`, `basics/appendix-legacy.html` |
| A4 | `practice/**` |
| A5 | `cases/**` |
| A6 | `cheatsheet/**` |
| A7 | `ccdak/**` |
| A8 | `ccaak/**` |
| B1 | `data/questions/basics-ch*.json` |
| B2 | `data/questions/ccdak-{domain}.json` |
| B3 | `data/questions/ccaak-{domain}.json` |
| B4 | `data/questions/ccdak-mock-{1,2}.json` |
| B5 | `data/questions/ccaak-mock-{1,2}.json` |
| B6 | `data/questions/manifest.json` |
| C1–C4 | **읽기 전용** — 발견 사항을 리포트로만 반환 |
| Wave4 | `index.html`, `data/toc.json`, `data/search-index.json`, `quiz/**` 최종 조정 |

---

## 5. 품질 기준 (Definition of Done)

- [ ] 모든 페이지가 외부 네트워크 없이 렌더링된다 (CDN 참조 0건)
- [ ] 깨진 내부 링크 0건 (`tools/validate.mjs` 통과)
- [ ] 모든 문제 JSON이 스키마를 통과하고, `id` 중복 0건
- [ ] 모든 문제에 `explanation` + 전 오답 `distractorNotes` + 공식 문서 `refs` 존재
- [ ] ZooKeeper 기반 서술이 "역사적 맥락" 외에 존재하지 않는다
- [ ] 다크모드 / 모바일(360px) / 데스크톱에서 레이아웃 깨짐 없음
- [ ] 키보드만으로 퀴즈 응시 가능, 표에 `scope` 속성, 이미지 대체텍스트 존재
- [ ] 확인되지 않은 시험 정보(문항 수·합격 점수)를 단정적으로 서술하지 않는다
- [ ] 덤프 출처 문제 복제 0건, BY-NC-ND 저장소 문항의 복제·변형 0건
- [ ] `docs/CCDAK_TOPIC_CHECKLIST.md`의 24개 토픽이 본문·문항 모두에서 커버된다
- [ ] `kafka_2.13-4.3.0`의 2.13이 Scala 버전임이 ch01·부록·CLI 치트시트에 명시된다
- [ ] 버전에 따라 동작이 다른 항목에 `.note--version` 병기가 되어 있다

---

## 6. 리스크와 대응

| 리스크 | 영향 | 대응 |
|---|---|---|
| CCAAK 도메인 가중치 출처 불일치 | 학습 배분 오류 | Wave 3 C1이 공식 Exam Guide로 확정. 확정 전 숫자 미표기 |
| 에이전트 간 톤·스타일 편차 | 사이트 일관성 저하 | Wave 0에서 샘플 페이지(ch01) 완성 → 전 에이전트가 이를 복제 기준으로 삼음 |
| 문제 정답 오류 | 학습자 오학습 | Wave 3 C2가 생성 에이전트와 분리되어 전수 검증 |
| 파일 충돌 | 작업 유실 | 배타 소유권 표 강제. 공유 파일은 Wave 4 단독 처리 |
| 콘텐츠 분량 과다로 컨텍스트 초과 | 에이전트 중단 | 에이전트당 페이지 3~4개로 제한. 문제는 도메인 단위로 분할 |
| 자격증 NDA/저작권 | 법적 리스크 | 덤프 참조 전면 금지, 전 문항 자체 창작 명시. BY-NC-ND 저장소는 토픽 목록만 참조, Wave 3 C1이 복제 흔적 검사 |
| 버전 혼동 (2.13을 Kafka 버전으로 오인) | 독자 오학습 | `VERSION_POLICY.md` 강제 + 부록 페이지 + 확인문제 필수 문항 + Wave 3 검증 항목 |
| 3-트랙 병기로 본문이 산만해짐 | 가독성 저하 | 본문은 4.x 단일 서술, 차이는 `.note--version` 박스로 격리. 2.x 상세는 부록으로 분리 |

---

## 7. 다음 단계

1. 이 계획 승인
2. `docs/agent-prompts/` 프롬프트 검토 및 조정
3. **Wave 0 실행** (단독) → 샘플 페이지 확인 후 스타일 승인
4. Wave 1 → 2 → 3 → 4 순차 실행
5. GitHub Pages 배포

---

## 출처

- [Apache Kafka 4.3.0 Release Announcement](https://kafka.apache.org/blog/2026/05/22/apache-kafka-4.3.0-release-announcement/)
- [Apache Kafka 4.2.0 Release Announcement](https://kafka.apache.org/blog/2026/02/17/apache-kafka-4.2.0-release-announcement/)
- [Apache Kafka 4.0.0 Release Announcement](https://kafka.apache.org/blog/2025/03/18/apache-kafka-4.0.0-release-announcement/)
- [Release Announcements | Apache Kafka](https://kafka.apache.org/blog/releases/)
- [Apache Kafka 4.0 Release: Default KRaft, Queues, Faster Rebalances — Confluent](https://www.confluent.io/blog/latest-apache-kafka-release/)
- [Confluent Certification for Apache Kafka](https://www.confluent.io/certification/)
- [CCDAK Exam Syllabus — VMExam](https://www.vmexam.com/confluent/ccdak-confluent-certified-developer-apache-kafka)
- [CCAAK Exam Syllabus — VMExam](https://www.vmexam.com/confluent/confluent-apache-kafka-administrator-certification-exam-syllabus)
- [Downloads | Apache Kafka](https://kafka.apache.org/community/downloads/) — Scala 배포판 표기
- [org.apache.kafka:kafka_2.13 — Maven Central](https://central.sonatype.com/artifact/org.apache.kafka/kafka_2.13)
- [danielsobrado/CCDAK-Exam-Questions](https://github.com/danielsobrado/CCDAK-Exam-Questions) — 토픽 체크리스트 참조용 (CC BY-NC-ND 4.0, 문항 복제·변형 불가)
- [Upgrading | Apache Kafka](https://kafka.apache.org/documentation/#upgrade)
