# Wave 2 — 문제은행 (B1–B5 병렬 → B6 단독)

> **CCDAK 우선 원칙**: 전체 852문항 중 CCDAK가 588문항(69%)이다.
> B2(318) · B3(240) · B4(30+플래시카드 232장)이 CCDAK 담당이고, 여기에 자원이 집중된다.

각 프롬프트 앞에 `README.md` 공통 프리앰블 + 아래 **Wave 2 공통 블록**을 붙인다.

---

## Wave 2 공통 블록 (B1~B6 전부에 포함)

```
## Wave 2 공통 지침

시작 전 반드시 읽으세요:
- docs/QUESTION_SCHEMA.md          ← 스키마. 한 글자도 어기지 마세요
- docs/CCDAK_TOPIC_CHECKLIST.md    ← 필수 출제 토픽. 커버리지 감사 대상
- docs/VERSION_POLICY.md           ← 버전 처리 규칙
- data/questions/basics-ch01.json  ← Wave 0이 만든 품질 레퍼런스 10문항
- 당신 담당 도메인에 해당하는 basics/*.html 본문 (사이트 내용과 문제가 어긋나면 안 됨)

### 절대 금지
- 시험 덤프 사이트 참조·복제 (examtopics, validexamdumps, pass4success,
  skillcertpro, itexams, examcollection 등)
- danielsobrado/CCDAK-Exam-Questions 저장소의 **문항 텍스트 복사 또는 변형**
  → 이 저장소는 CC BY-NC-ND 4.0. NoDerivatives라 변형도 위반입니다.
    docs/CCDAK_TOPIC_CHECKLIST.md에 정리된 **주제 목록만** 참고하세요.
    문항은 전부 공식 문서를 근거로 새로 창작합니다. 문장 구조 모방도 금지.

### 문항 품질 기준 (Wave 3 C2가 전수 검증합니다)
1. 정답이 **공식 문서로 확정 가능**해야 합니다. 애매하면 버리세요.
2. 설정 기본값을 묻는 문항은 **WebFetch로 kafka.apache.org에서 확인한 뒤** 씁니다.
   확인 못 했으면 그 문항을 만들지 마세요.
3. 오답 선택지는 **실제로 헷갈릴 만한 것**이어야 합니다.
   "Kafka는 그 기능을 지원하지 않는다" 류의 더미 남발 금지.
4. 선택지 길이를 비슷하게. 정답만 유독 길면 패턴으로 뚫립니다.
5. 세트 내 정답 분포: A/B/C/D 각 20~30%.
6. 난이도 비율 easy:medium:hard = 3:5:2.
7. explanation은 **원리로** 설명. 문제문 반복 금지. 3~6문장.
8. distractorNotes는 **모든 오답**에 작성. "틀렸습니다"만 쓰지 말 것.
9. refs는 공식 문서 URL만. **앵커까지 정확히**
   (예: https://kafka.apache.org/documentation/#producerconfigs_acks)
10. chapter 필드 필수 — 결과 리포트의 복습 링크가 이 값에 의존합니다.

### ⚠️ 문항 유형은 4가지입니다 — 객관식만 만들지 마세요

Confluent 공식 자료:
> Question types vary, and include multiple-choice, **matching, list order**.

실제 시험에 **연결형(matching)** 과 **순서 배열형(ordering)** 이 나옵니다.
객관식만 연습하면 세 유형 중 둘을 시험장에서 처음 보게 됩니다.
`docs/QUESTION_SCHEMA.md`의 §matching 유형 상세 / §ordering 유형 상세를 반드시 읽으세요.

**유형 배분 (당신 세트에서 지켜야 하는 비율)**
| type | 도메인 연습 | 모의고사 |
|---|---:|---:|
| `single` | 60% | 60% |
| `multiple` | 20% | 15% |
| `matching` | 12% | 15% |
| `ordering` | 8% | 10% |

matching/ordering이 자연스러운 소재는 QUESTION_SCHEMA.md에 목록으로 정리되어 있습니다.
(설정명↔기본값, 예외↔원인, SMT↔용도, 호환성모드↔배포순서, 연산↔stateless/stateful /
 트랜잭션 API 순서, reassign 워크플로, KRaft 부트스트랩 절차, 업그레이드 단계 등)

**억지로 만들지 마세요.** 순서가 객관적으로 확정되지 않는 것을 ordering으로,
범주가 섞인 것을 matching으로 만들면 나쁜 문항이 됩니다. 위 소재 목록에서 고르세요.

### 출제 각도도 섞으세요 (위 type과는 별개 축)
| 각도 | 비율 | 예 |
|---|---|---|
| 개념 판별 | 30% | "다음 중 cooperative 리밸런스의 특징은?" |
| 설정값·기본값 | 20% | "Kafka 3.0 이상 acks 기본값은?" |
| 시나리오 판단 | 30% | 상황 서술 → "무엇이 원인인가 / 무엇을 해야 하는가" |
| 코드·설정 판독 | 15% | code 블록 제시 → 동작 예측 |
| 계산 | 5% | 파티션·처리량·디스크 산정 |

### 완료 전 자가 검증
`node tools/validate.mjs --questions` 를 실행해 당신 파일의 오류를 0으로 만드세요.
그 후 다음을 직접 세어 리포트에 넣으세요:
- 총 문항 수 / 난이도 분포 / **유형 분포(single/multiple/matching/ordering)** /
  정답 분포(A,B,C,D) / 커버한 체크리스트 태그 목록
```

---

## B1 — 기본개념 확인문제 (120문항)

```
소유 파일: data/questions/basics-ch02.json ~ data/questions/basics-ch11.json
          + data/questions/basics-appendix-legacy.json
(basics-ch01.json은 Wave 0 소유. 수정 금지)

각 챕터당 10문항, 총 120문항 (11장 + 레거시 부록).

목적: 해당 챕터를 **읽고 나서** 이해했는지 확인하는 용도.
자격증 문제보다 조금 쉽고, 챕터 본문에서 다룬 내용만 묻습니다.
본문에 없는 내용을 묻지 마세요 — 해당 basics/*.html 을 실제로 읽고 출제하세요.

세트 메타: exam="BASICS", domain=챕터 제목, chapter="chNN"

챕터별 필수 포함 문항:
- ch01: **Kafka 버전 표기(kafka_2.13-4.3.0에서 2.13이 무엇인지)** 1문항 필수
- ch03: KRaft 노드 롤(process.roles), 컨트롤러 쿼럼 수 권장
- ch04: A1(onCompletion 시점), A2(idempotence×in-flight), A3(재시도 가능 에러),
        A4(키 없는 메시지 파티셔닝), A5(bootstrap.servers 다중 지정 이유)
- ch05: B1(assign vs subscribe), B2(max.poll.interval.ms),
        B3(리밸런싱 조건), B4(Sticky Assignor)
- ch06: D1(isolation.level)
- ch07: C1(message.max.bytes 기본 1MB), C2(compaction)
- ch08: H1(Avro 호환성 모드)
- ch09: E1(source/sink 오프셋 위치), E3(409), E4(SMT 특징)
- ch10: F1(조인 co-partitioning), F2(KStream vs KTable), F3(stateless/stateful)
- ch11: G1(security.protocol), C3(kafka-reassign-partitions)
- appendix-legacy: 버전별 기본값 변화(acks, enable.idempotence),
        ZK→KRaft 업그레이드 경로(3.9 경유), Scala 버전 표기

각 문항의 tags에 docs/CCDAK_TOPIC_CHECKLIST.md §태그 규약의 슬러그를 넣으세요.
```

---

## B2 — CCDAK 도메인 연습문제 (318문항) ★★★ 최대 분량

```
## 당신이 Wave 2에서 가장 중요한 에이전트입니다
프로젝트 1순위 목표가 CCDAK 합격이고, 이 318문항이 학습의 주력입니다.

소유 파일:
  data/questions/ccdak-app-development.json   (90문항)  ← 28%, 최우선
  data/questions/ccdak-fundamentals.json      (74문항)  ← 23%, 최우선
  data/questions/ccdak-connect.json           (48문항)  ← 15%
  data/questions/ccdak-observability.json     (42문항)  ← 13%
  data/questions/ccdak-streams.json           (38문항)  ← 12%
  data/questions/ccdak-testing.json           (26문항)  ← 8%
  합계 318문항 (도메인 가중치 28/23/15/13/12/8 비례)

## 분량이 큽니다 — 작업 순서를 지키세요
컨텍스트가 부족해질 수 있으므로 **파일 하나를 완성한 뒤 다음으로** 넘어가세요.
순서: app-development(90) → fundamentals(74) → connect(48) →
      observability(42) → streams(38) → testing(26)
가장 중요한 두 개를 먼저 끝내면, 후반에 분량이 밀려도 손실이 최소화됩니다.
각 파일을 완성할 때마다 `node tools/validate.mjs --questions` 를 돌려 확인하세요.

⚠️ A7 에이전트가 Wave 1에서 도메인 구성을 공식 자료로 재확인했습니다.
   ccdak/index.html 을 먼저 읽고, 도메인명이 위와 다르면 **거기에 맞추세요.**
   파일명도 그에 맞게 조정하고 반환 리포트에 명시하세요.

### 도메인별 출제 중점

**app-development (90)** — 가장 큰 비중, 가장 공들일 것
- 체크리스트 A1~A6, B1~B5, D1 **전부 커버**
- Producer API: send/콜백/Future, 직렬화, 파티셔너, 트랜잭션 API 호출 순서
- Consumer API: poll 루프, 커밋 전략, seek/pause, ConsumerRebalanceListener
- 코드 판독 문항 비중을 높게 (Java 스니펫 제시 → 동작·출력·예외 예측)
- 흔한 함정: send()가 언제 블로킹되는가, close() 시 flush 동작,
  auto commit이 실제로 커밋되는 시점

**fundamentals (74)**
- 아키텍처, 파티션/복제/ISR, 오프셋 4종 구분, 리더 선출
- KRaft (노드 롤, 컨트롤러 쿼럼) — Kafka 4.x이므로 비중 있게
- 리텐션 vs 컴팩션 (C2), 메시지 크기(C1)
- Schema Registry 호환성 (H1) — 매트릭스 판단 문항 최소 3개
- 전달 보장 의미론

**connect (48)**
- E1(오프셋 저장 위치 비대칭), E2(로그 조회), E3(409), E4(SMT) 전부
- standalone vs distributed, 내부 토픽 3종, converter, DLQ 설정
- REST API 엔드포인트 판독
- task 수와 병렬성

**observability (42)**
- 클라이언트 메트릭(producer/consumer), consumer lag 해석
- 어떤 메트릭이 무엇을 의미하는가 → 증상 판단 시나리오
- 로깅 설정, 인터셉터(ProducerInterceptor/ConsumerInterceptor)
- JMX 노출

**streams (38)**
- F1, F2, F3 전부
- 윈도우 타입 구분, grace period, 조인 매트릭스
- 상태 저장소·changelog, exactly_once_v2
- 리파티션 유발 연산 판별 (시험 단골)

**testing (26)**
- I1 전부. TopologyTestDriver 비중 높게 (가장 자주 출제)
- MockProducer/MockConsumer, Testcontainers, EmbeddedKafka
- kafka-producer-perf-test / consumer-perf-test 옵션과 출력 해석
- 상황별 도구 선택 문항
```

---

## B3 — CCDAK 모의고사 4세트 (240문항) ★★★

```
## 왜 4세트인가
실전 감각은 반복 응시로만 생깁니다. 2세트는 두 번째 응시에서 이미 기억으로 풀립니다.
4세트면 240문항 × 90분 훈련이 가능하고, 학습 후 재응시로 성장을 측정할 수 있습니다.

소유 파일: data/questions/ccdak-mock-1.json ~ ccdak-mock-4.json
각 60문항. 90분 기준. 합계 240문항.

### 필수 요건
1. **B2가 만든 도메인 연습문제(318문항)와 중복되지 않는 새 문항**이어야 합니다.
   B2 파일이 아직 없을 수 있으므로, 작업 종료 시점에 존재하면 읽어서
   같은 사실을 같은 각도로 묻는 문항을 제거하세요.
   B6이 최종 중복 감사를 하므로, tags를 성실히 달아 주세요.
2. **4세트끼리도 중복되지 않아야 합니다.** 세트 간 같은 사실을 다룰 수는 있으나
   반드시 다른 각도로 (예: 세트1은 설정값 직접 질문, 세트2는 시나리오 판단).
3. **도메인 가중치대로 배분** (세트당):
   app-development 17 / fundamentals 14 / connect 9 /
   observability 8 / streams 7 / testing 5  (= 60)
   각 문항의 domain 필드로 구분. 세트의 domain은 "Mixed".
4. **실제 시험 난이도**로. 챕터 확인문제보다 어렵게.
   easy:medium:hard = 2:5:3
5. **4세트의 난이도가 서로 비슷해야 합니다.** 한 세트만 어려우면 진단이 왜곡됩니다.
   작성 후 각 세트의 hard 비율과 코드 판독 문항 수를 세어 균형을 맞추세요.
6. 문항 순서를 도메인별로 뭉치지 말고 **섞으세요** (실제 시험처럼).
7. 유형 배분 준수: `single` 36 / `multiple` 9 / `matching` 9 / `ordering` 6 (= 60).
   네 유형이 모두 들어가야 합니다.
8. **코드 판독 문항을 세트당 최소 12개.** CCDAK는 Java 스니펫 판독이 자주 나옵니다.

### 세트별 성격 차별화 (중복 방지 + 훈련 효과)
- **mock-1**: 표준 세트. 도메인 가중치 그대로, 난이도 평균. 첫 실력 측정용
- **mock-2**: 시나리오·코드 판독 비중을 높인 세트 (실무형)
- **mock-3**: 설정값·기본값·API 세부 비중을 높인 세트 (암기형)
- **mock-4**: 난이도 상위. hard 40%. 최종 점검용
  → mock-4만 easy:medium:hard = 1:5:4 로 예외 허용

세트 메타: setId="ccdak-mock-1", exam="CCDAK", domain="Mixed", mock=true
```

---

## B4 — CCDAK 진단 테스트 + 플래시카드 데이터 ★★

```
소유 파일:
  data/questions/ccdak-diagnostic.json   (30문항)
  data/flashcards/ccdak-configs.json
  data/flashcards/ccdak-app-development.json
  data/flashcards/ccdak-fundamentals.json
  data/flashcards/ccdak-connect.json
  data/flashcards/ccdak-observability.json
  data/flashcards/ccdak-streams.json
  data/flashcards/ccdak-testing.json
  data/flashcards/ccdak-exceptions.json

## 1. 진단 테스트 (30문항) — 정확한 진단이 목적

**6개 도메인 × 5문항.** 이 30문항의 목적은 점수가 아니라 **취약점 판별**입니다.
따라서 일반 문항과 설계가 다릅니다.

설계 원칙:
- 각 도메인의 **가장 대표적인 5개 개념**을 고릅니다. 변두리 지식 금지.
- 난이도는 medium 중심 (easy 1 / medium 3 / hard 1 per 도메인).
  너무 쉬우면 다 맞아서 진단이 안 되고, 너무 어려우면 다 틀려서 진단이 안 됩니다.
- **한 문항이 한 개념만 측정**해야 합니다. 두 개념을 섞으면 어느 쪽이 약한지 모릅니다.
- 도메인 간 난이도를 맞추세요. 한 도메인만 어려우면 그 도메인이 항상 약점으로 나옵니다.
- 모든 문항의 `domain` 필드가 정확해야 합니다 (진단 로직이 이 값으로 집계).
- B2·B3와 중복되어도 무방합니다 (진단은 별개 목적). 단 tags는 달아 주세요.

도메인별 측정 대상 (각 5문항):
- app-development: acks/멱등성, 콜백 시점, assign vs subscribe,
  max.poll.interval.ms, 커밋 전략
- fundamentals: 파티션/복제/ISR, 오프셋 4종, retention vs compaction,
  메시지 크기 설정, 스키마 호환성
- connect: source vs sink 오프셋 위치, distributed 모드, converter, SMT, DLQ
- observability: consumer lag 정의, 프로듀서 메트릭, 브로커 핵심 메트릭,
  인터셉터, 로깅
- streams: KStream vs KTable, stateless vs stateful, 조인 co-partitioning,
  윈도우 타입, 상태 저장소
- testing: TopologyTestDriver, MockProducer, Testcontainers,
  perf-test 도구, 도구 선택 판단

세트 메타: setId="ccdak-diagnostic", exam="CCDAK", domain="Mixed",
          diagnostic=true, questionsPerDomain=5

## 2. 플래시카드 데이터

`assets/js/flashcard.js`(Wave 0)가 소비하는 형식을 **먼저 확인**하세요.
Wave 0의 반환 리포트나 flashcard.js 코드에서 실제 스키마를 읽고 맞추세요.
예상 형식:
```json
{
  "deck": "ccdak-configs",
  "title": "CCDAK — 반드시 외울 설정 기본값",
  "cards": [
    {
      "id": "fc-cfg-001",
      "front": "`enable.idempotence` 기본값 (Kafka 3.0 이상)",
      "back": "**true**\n\n활성 시 `max.in.flight.requests.per.connection` ≤ 5,\n`acks=all`, `retries > 0`이 강제됩니다.",
      "tags": ["idempotence"],
      "chapter": "ch04",
      "domain": "Application Development"
    }
  ]
}
```

### 덱 구성
| 덱 | 카드 수 | 내용 |
|---|---:|---|
| ccdak-configs | 60 | **설정명 → 기본값 + 의미.** 가장 중요한 덱 |
| ccdak-app-development | 40 | 개념 → 정의 (Producer/Consumer/트랜잭션) |
| ccdak-fundamentals | 35 | 아키텍처·스토리지·스키마 개념 |
| ccdak-connect | 20 | Connect 개념·REST 엔드포인트·SMT |
| ccdak-observability | 18 | 메트릭명 → 의미·임계값 |
| ccdak-streams | 22 | DSL 연산 → stateless/stateful/리파티션 여부 |
| ccdak-testing | 12 | 도구 → 용도 |
| ccdak-exceptions | 25 | 예외 클래스명 → 원인·재시도 가능 여부 |
| **합계** | **232** | |

### 카드 작성 규칙
- **앞면은 짧게.** 한 줄. "다음 중~" 같은 문항 형식 금지 — 이건 문제가 아니라 카드입니다
- **뒷면은 답 + 한 문장 근거.** 3줄 이내
- **설정 기본값은 전부 공식 문서로 확인.** 확인 못 하면 카드를 만들지 마세요
- 카드 하나에 사실 하나. 여러 개를 묶으면 부분적으로 알 때 판정이 안 됩니다
- 마크다운 인라인 서식(`code`, **강조**) 허용. flashcard.js가 렌더링하는지 확인
- `ccdak-configs` 덱은 소속(프로듀서/컨슈머/브로커/토픽)을 뒷면에 명시하세요.
  소속 혼동이 시험 함정의 큰 축입니다
```

---

## B5 — CCAAK 도메인 연습 + 모의고사 1세트 (144문항)

```
소유 파일:
  data/questions/ccaak-fundamentals.json      (12)
  data/questions/ccaak-security.json          (14)
  data/questions/ccaak-connect.json           (10)
  data/questions/ccaak-deployment.json        (12)
  data/questions/ccaak-cluster-config.json    (12)
  data/questions/ccaak-observability.json     (12)
  data/questions/ccaak-troubleshooting.json   (12)
  data/questions/ccaak-mock-1.json            (60)
  합계 144문항

⚠️ CCAAK는 이 프로젝트의 **우선순위 5위**입니다 (PLAN.md 최상단 표).
   CCDAK만큼의 분량은 아니지만 **정확성 기준은 동일**합니다.
   양을 줄이는 것이지 품질을 줄이는 것이 아닙니다.

⚠️ Wave 1 A8이 공식 자료로 도메인을 확정했습니다. ccaak/index.html 을 먼저 읽고
   도메인 구성이 다르면 거기에 맞추세요. 가중치가 확정되지 않았다면 위 배분을
   그대로 쓰되, 반환 리포트에 "가중치 미확정 상태로 균등 배분함"을 명시하세요.

### CCAAK 문항의 성격 (CCDAK와 다릅니다)
개발자가 아니라 **운영자·SRE에게 묻는 문제**입니다.
- 코드 판독 문항 비중을 낮추고 **CLI 명령 판독 / 시나리오 판단 / 장애 대응** 비중을 높이세요.
- "이 증상일 때 가장 먼저 확인할 것은?" 형태의 **우선순위 판단 문항**을 많이 넣으세요.
- 실제 CLI 출력(kafka-consumer-groups --describe, kafka-topics --describe 등)을
  code 블록으로 제시하고 해석을 묻는 문항을 도메인당 최소 2개.

### 도메인별 중점
- **fundamentals(12)**: 복제·ISR·리더 선출·HW/LEO, KRaft 아키텍처
- **security(14)**: G1 필수. SASL 메커니즘 선택, listeners/advertised.listeners/
  listener.security.protocol.map 조합 판독, ACL 명령, TLS 설정, 인증 실패 진단
- **connect(10)**: E2(워커 장애 로그), E3(409), 분산 모드 운영, 워커 스케일링,
  내부 토픽 RF 설정, 커넥터 재시작 vs task 재시작
- **deployment(12)**: 컨트롤러 쿼럼 사이징(3 vs 5), 랙 인식, 브로커 사이징,
  멀티 DC, MirrorMaker 2, 디스크 레이아웃, JVM/OS 설정
- **cluster-config(12)**: C3(kafka-reassign-partitions) 필수.
  kafka-configs 동적 설정(브로커/토픽/사용자), 쿼터, 롤링 업그레이드 절차,
  로그 디렉터리 관리, 토픽 설정 오버라이드 우선순위
- **observability(12)**: 필수 JMX 메트릭의 의미와 임계값,
  UnderReplicatedPartitions·OfflinePartitionsCount·ActiveControllerCount 해석,
  lag 측정 3가지 방법
- **troubleshooting(12)**: URP 발생 시 절차, 디스크 풀, 리밸런스 스톰,
  느린 컨슈머, 컨트롤러 이상, 브로커 재시작 후 복구 지연

### 모의고사 1세트 (60문항)
- 7개 도메인에 균등 배분 (도메인당 8~9문항)
- 도메인 연습 84문항과 **중복 없는 새 문항**
- **시나리오·장애 대응 문항 비중 50% 이상**
- CLI 출력 판독 문항 최소 8개
- easy:medium:hard = 2:5:3
- 유형 배분: single 36 / multiple 9 / matching 9 / ordering 6

세트 메타: setId="ccaak-mock-1", exam="CCAAK", domain="Mixed", mock=true
```

---

## B6 — 매니페스트 · 중복 감사 (마지막에 실행)

```
소유 파일: data/questions/manifest.json

⚠️ 이 에이전트는 B1~B5가 **모두 끝난 뒤** 실행합니다.
   Wave 2 내에서 유일하게 순차 실행되는 에이전트입니다.
   (병렬로 띄우려면 Wave 2를 B1~B5 병렬 → B6 단독의 2단계로 나누세요.)

### 작업
1. data/questions/*.json 을 전부 읽어 manifest.json 생성
   (docs/QUESTION_SCHEMA.md §매니페스트 형식)
   - exams 블록의 도메인 가중치는 ccdak/index.html, ccaak/index.html에서
     확정된 값을 가져옵니다. **확정 안 된 값은 null로 두세요.** 추정 금지.

2. **id 중복 검사** — 전역 유일해야 합니다. 중복 발견 시 뒤에 오는 세트의 id를
   재부여하고 리포트에 기록.

3. **의미 중복 감사** — 같은 사실을 같은 각도로 묻는 문항 쌍을 찾습니다.
   판단 기준: tags가 2개 이상 겹치고 + question 텍스트의 핵심 명사구가 유사.
   - 도메인 연습 vs 모의고사 사이의 중복이 가장 문제입니다.
   - 발견 시 **모의고사 쪽 문항을 다른 각도로 재작성**하세요
     (삭제하면 60문항이 깨집니다).

4. **커버리지 감사** — docs/CCDAK_TOPIC_CHECKLIST.md의 태그 규약 슬러그
   (producer-callback ~ kafka-testing, 총 24개)가 각각 최소 1문항에
   존재하는지 확인. 누락된 태그는 **CRITICAL로 리포트**하고,
   해당 도메인 파일에 문항을 직접 추가해 채우세요.

5. **★ CCDAK 배분 검증** — 프로젝트 1순위 목표이므로 별도 확인:
   - CCDAK 문항이 전체의 65% 이상인가
   - 도메인별 문항 수가 가중치(28/23/15/13/12/8)에 비례하는가
     → 편차 10% 이상이면 리포트에 명시
   - 모의고사 4세트가 각각 정확히 60문항이고 도메인 배분이 동일한가
   - 4세트의 hard 비율이 서로 비슷한가 (mock-4는 예외적으로 높음)
   - 진단 테스트가 정확히 6도메인 × 5문항인가

6. **★ 플래시카드 검증** — data/flashcards/*.json
   - 스키마 일치, id 중복 0
   - 설정 기본값 카드의 값이 문제은행의 같은 사실과 **모순되지 않는가**
     → 모순 발견 시 어느 쪽이 맞는지 판정해서 CRITICAL로 보고
   - 덱별 카드 수가 계획(60/40/35/20/18/22/12/25 = 232)과 일치

7. **분포 리포트 생성** — 반환 텍스트에 표로:
   | 세트 | 문항수 | easy/medium/hard | 정답 A/B/C/D | multiple 수 |

8. `node tools/validate.mjs --questions` 최종 통과 확인.

### 반환 리포트에 반드시 포함
- 전체 문항 수
- 중복으로 재작성한 문항 목록
- 커버리지 누락이 있었다면 어떤 태그였고 어떻게 채웠는지
- 정답 분포가 편중된 세트 목록 (30% 초과)
```
