# 문제 JSON 스키마

모든 문제은행 파일은 이 스키마를 따른다. `tools/validate.mjs`가 강제 검증한다.

---

## ⚠️ 문항 유형은 3가지다 (객관식만이 아니다)

Confluent 공식 자료:
> Certification exams are 90 minute proctored exams.
> **Question types vary, and include multiple-choice, matching, list order.**

즉 실제 시험에는 **연결형(matching)** 과 **순서 배열형(list order)** 이 나온다.
객관식만 연습하면 세 유형 중 둘을 처음 보는 상태로 시험장에 들어간다.

| `type` | 대응 시험 유형 | 채점 |
|---|---|---|
| `single` | multiple-choice (단일 정답) | 정답 1개 일치 |
| `multiple` | multiple-choice (복수 정답) | 전부 일치 (부분 점수 없음) |
| **`matching`** | **matching** | 모든 쌍 일치 |
| **`ordering`** | **list order** | 순서 완전 일치 |

### 유형 배분 목표 (세트별)

| 유형 | 도메인 연습 | 모의고사 |
|---|---:|---:|
| `single` | 60% | 60% |
| `multiple` | 20% | 15% |
| `matching` | 12% | 15% |
| `ordering` | 8% | 10% |

> 실제 시험의 유형 비율은 Confluent가 공개하지 않는다. 위 값은 "세 유형 모두
> 충분히 연습된다"를 보장하기 위한 **연습용 배분**이며, 사이트에 실제 시험 비율로
> 표기하지 않는다.

### Kafka 내용에 잘 맞는 유형 매칭

**`matching`이 자연스러운 소재**
- 설정명 ↔ 기본값 (`acks` ↔ `all`, `message.max.bytes` ↔ 1MB)
- 설정명 ↔ 소속 (프로듀서/컨슈머/브로커/토픽)
- 예외 클래스 ↔ 원인 (또는 재시도 가능 여부)
- SMT 이름 ↔ 용도
- 호환성 모드 ↔ 배포 순서 (BACKWARD ↔ 컨슈머 먼저)
- Streams 연산 ↔ stateless/stateful/리파티션 유발
- JMX 메트릭 ↔ 의미
- 커넥터 종류 ↔ 오프셋 저장 위치
- 윈도우 타입 ↔ 특성

**`ordering`이 자연스러운 소재**
- 트랜잭션 API 호출 순서 (`initTransactions` → `beginTransaction` → … → `commit`)
- Producer 전송 파이프라인 단계 순서
- 리밸런스 진행 단계
- `kafka-reassign-partitions` 워크플로 (`--generate` → `--execute` → `--verify`)
- KRaft 클러스터 부트스트랩 절차 (`random-uuid` → `format` → 기동)
- 2.x → 3.9 → 4.x 업그레이드 단계
- 스키마 진화 배포 순서
- Connect source의 SMT/converter 적용 순서
- 장애 대응 우선순위 (무엇을 먼저 확인하는가)

---

## 파일 구조

`data/questions/*.json`

```json
{
  "setId": "ccdak-appdev",
  "title": "CCDAK — Application Development",
  "exam": "CCDAK",
  "domain": "Application Development",
  "kafkaVersion": "4.3",
  "questions": [ /* Question 객체 배열 */ ]
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|:--:|---|
| `setId` | string | ✅ | 파일명과 동일 (확장자 제외). kebab-case |
| `title` | string | ✅ | UI 표시명 |
| `exam` | `"CCDAK"` \| `"CCAAK"` \| `"BASICS"` | ✅ | 소속 시험 |
| `domain` | string | ✅ | 도메인명. `BASICS`면 챕터 제목 |
| `kafkaVersion` | string | ✅ | 문제 작성 기준 버전 |
| `questions` | Question[] | ✅ | 최소 1개 |

## Question 객체

```json
{
  "id": "ccdak-appdev-042",
  "exam": "CCDAK",
  "domain": "Application Development",
  "chapter": "ch04",
  "difficulty": "medium",
  "type": "single",
  "question": "프로듀서를 아래와 같이 설정했다. 브로커 하나가 다운되어 ISR이 2로 줄었을 때 동작으로 옳은 것은?",
  "code": {
    "lang": "properties",
    "body": "acks=all\nenable.idempotence=true\n# topic: replication.factor=3, min.insync.replicas=3"
  },
  "choices": [
    { "id": "A", "text": "정상적으로 전송된다." },
    { "id": "B", "text": "NotEnoughReplicasException이 발생하며 전송이 실패한다." },
    { "id": "C", "text": "acks=1로 자동 강등되어 전송된다." },
    { "id": "D", "text": "메시지가 조용히 유실된다." }
  ],
  "answer": ["B"],
  "explanation": "min.insync.replicas=3이므로 ISR이 3 미만이 되면 acks=all 요청은 충족될 수 없습니다. 브로커는 NotEnoughReplicasException(또는 NotEnoughReplicasAfterAppendException)을 반환하고, 프로듀서는 재시도 가능한 예외로 간주해 재시도합니다. min.insync.replicas는 브로커/토픽 레벨 설정이며 프로듀서가 자동으로 낮출 수 없습니다.",
  "distractorNotes": {
    "A": "ISR이 min.insync.replicas 미만이면 acks=all 쓰기는 거부됩니다.",
    "C": "acks는 프로듀서 설정이며 런타임에 자동 강등되지 않습니다.",
    "D": "예외가 명시적으로 반환되므로 조용한 유실이 아닙니다. 조용한 유실은 acks=0일 때의 특성입니다."
  },
  "refs": [
    { "title": "Kafka Docs — Topic Configs: min.insync.replicas", "url": "https://kafka.apache.org/documentation/#topicconfigs_min.insync.replicas" }
  ],
  "tags": ["acks", "min.insync.replicas", "isr", "durability"]
}
```

| 필드 | 타입 | 필수 | 규칙 |
|---|---|:--:|---|
| `id` | string | ✅ | `{exam-소문자}-{domain-slug}-{3자리}`. **전역 유일** |
| `exam` | enum | ✅ | `CCDAK` \| `CCAAK` \| `BASICS` |
| `domain` | string | ✅ | 세트의 `domain`과 일치 |
| `chapter` | string | ✅ | 연계 학습 챕터 `ch01`~`ch11`. 결과 리포트가 이 값으로 복습 링크를 만든다 |
| `difficulty` | enum | ✅ | `easy` \| `medium` \| `hard` — 세트 내 비율 **3 : 5 : 2** |
| `type` | enum | ✅ | `single` \| `multiple` \| `matching` \| `ordering` |
| `question` | string | ✅ | 200자 이내 권장. `multiple`이면 끝에 `(2개 선택)` 명시 |
| `code` | object \| null | — | `{ lang, body }`. 코드/설정이 필요할 때만 |
| `choices` | array | `single`/`multiple`만 | **정확히 4개** (`multiple`은 5개 허용). `id`는 `A`,`B`,`C`,`D`,`E` |
| `answer` | string[] | `single`/`multiple`/`ordering` | `single` 1개 / `multiple` 2개 이상 / `ordering`은 정답 순서의 item id 배열 |
| `pairs` | array | `matching`만 | 아래 §matching 참조 |
| `items` | array | `ordering`만 | 아래 §ordering 참조 |
| `explanation` | string | ✅ | **3~6문장.** 정답을 원리로 설명. 문제문 반복 금지 |
| `distractorNotes` | object | ✅ | **모든 오답 선택지**에 대해 1~2문장 |
| `refs` | array | ✅ | 최소 1개. **공식 문서 URL만** (kafka.apache.org / cwiki.apache.org / docs.confluent.io) |
| `tags` | string[] | ✅ | 2~5개. 소문자, 설정명은 원문 그대로 |

## `matching` 유형 상세

```json
{
  "id": "ccdak-fundamentals-071",
  "exam": "CCDAK",
  "domain": "Fundamentals",
  "chapter": "ch04",
  "difficulty": "medium",
  "type": "matching",
  "question": "각 설정을 Kafka 4.x 기준 기본값과 연결하세요.",
  "pairs": [
    { "id": "p1", "left": "acks", "right": "all" },
    { "id": "p2", "left": "enable.idempotence", "right": "true" },
    { "id": "p3", "left": "message.max.bytes", "right": "1048588 (약 1MB)" },
    { "id": "p4", "left": "max.poll.interval.ms", "right": "300000" }
  ],
  "extraRights": ["1", "false", "60000"],
  "explanation": "…",
  "distractorNotes": {
    "p1": "acks 기본값은 3.0부터 all입니다. 2.x에서는 1이었습니다.",
    "p3": "정확히는 1048588 bytes입니다. 1MB(1048576)보다 약간 큽니다."
  },
  "refs": [ … ],
  "tags": ["defaults", "acks", "idempotence"]
}
```

| 필드 | 규칙 |
|---|---|
| `pairs` | **3~6개.** 각 항목에 `id`(`p1`…), `left`(고정 항목), `right`(정답 대응값) |
| `left` | 화면 왼쪽에 고정 표시. 순서 그대로 노출 |
| `right` | 정답 대응값. **엔진이 셔플해서 선택지 풀을 만든다** |
| `extraRights` | 선택. 정답이 아닌 미끼 값. 넣으면 난이도가 크게 올라간다 (권장) |
| `distractorNotes` | 키를 `pairs[].id`로. **혼동하기 쉬운 쌍에만** 작성 (전부 아님) |

**작성 규칙**
- `left` 항목끼리 **같은 범주**여야 한다. 설정명과 예외명을 섞지 말 것
- `right` 값이 서로 명확히 구별되어야 한다. 두 `left`가 같은 `right`를 가질 수 있으면 안 됨
- `extraRights`를 1~3개 넣어 "남는 것 없이 1:1 대응"으로 답을 역추론하는 것을 막을 것
- 채점은 **전부 맞아야 정답** (부분 점수 없음). 시험과 동일

**UI 요구사항 (Wave 0 quiz.js)**
- 각 `left` 항목마다 `<select>` 하나. 옵션은 셔플된 `right` + `extraRights`
- **드래그 앤 드롭을 유일한 조작 수단으로 만들지 말 것** — 접근성 차단
- 키보드만으로 완주 가능
- 채점 후 틀린 쌍만 표시하고 정답 쌍을 병기

---

## `ordering` 유형 상세

```json
{
  "id": "ccdak-app-development-088",
  "exam": "CCDAK",
  "domain": "Application Development",
  "chapter": "ch06",
  "difficulty": "medium",
  "type": "ordering",
  "question": "트랜잭션 프로듀서의 API 호출을 올바른 순서로 배열하세요.",
  "items": [
    { "id": "i1", "text": "initTransactions()" },
    { "id": "i2", "text": "beginTransaction()" },
    { "id": "i3", "text": "send() — 레코드 전송" },
    { "id": "i4", "text": "sendOffsetsToTransaction()" },
    { "id": "i5", "text": "commitTransaction()" }
  ],
  "answer": ["i1", "i2", "i3", "i4", "i5"],
  "explanation": "initTransactions()는 프로듀서 생애에 한 번만 호출하며 …",
  "distractorNotes": {
    "i1": "initTransactions()를 트랜잭션마다 호출하는 것으로 착각하기 쉽습니다. 초기화 시 1회입니다."
  },
  "refs": [ … ],
  "tags": ["transactions", "eos"]
}
```

| 필드 | 규칙 |
|---|---|
| `items` | **4~6개.** 각 항목에 `id`(`i1`…), `text` |
| `answer` | 정답 순서의 `id` 배열. `items`와 개수가 같아야 함 |
| `items` 배열 순서 | **정답 순서로 쓰지 말 것.** 엔진이 셔플하지만, 데이터 자체가 정답 순이면 유출 위험 |

**작성 규칙**
- 순서가 **객관적으로 하나로 확정**되어야 한다. "보통 이렇게 한다" 수준은 금지
- 병렬 가능한 단계(순서가 바뀌어도 되는 것)를 넣지 말 것
- 각 항목이 명확히 구별되는 단계여야 한다
- 채점은 **완전 일치**

**UI 요구사항 (Wave 0 quiz.js)**
- 항목마다 위/아래 이동 `<button>` 제공 (키보드 접근 가능)
- 또는 각 항목에 순번 `<select>` — 어느 쪽이든 **드래그 없이 완주 가능**해야 함
- 채점 후 제출 순서와 정답 순서를 나란히 표시

---

## 품질 규칙

1. **정답은 하나로 확정 가능해야 한다.** "가장 적절한" 류의 주관적 판단 문제 금지.
2. **오답은 그럴듯해야 한다.** 명백히 틀린 더미 선택지(예: "Kafka는 이 기능을 지원하지 않는다") 남발 금지.
3. **선택지 길이를 비슷하게.** 정답만 길면 패턴으로 맞힐 수 있다.
4. **정답 분포 균등.** 세트 내 A/B/C/D 정답 비율이 각 20~30% 범위.
5. **버전 의존 문제는 버전을 명시.** "Kafka 4.x 기준" 등.
6. **덤프 복제 금지.** 전 문항 공식 문서 기반 자체 창작.
7. **`chapter` 매핑 필수.** 결과 리포트의 복습 추천이 이 값에 의존한다.

## 매니페스트 (`data/questions/manifest.json`)

```json
{
  "generatedAt": "2026-07-28",
  "kafkaVersion": "4.3",
  "sets": [
    {
      "setId": "ccdak-appdev",
      "file": "ccdak-appdev.json",
      "exam": "CCDAK",
      "domain": "Application Development",
      "count": 42,
      "mock": false
    }
  ],
  "exams": {
    "CCDAK": {
      "label": "Confluent Certified Developer for Apache Kafka",
      "durationMin": 90,
      "mockQuestionCount": 60,
      "domains": [
        { "name": "Application Development", "weight": 28 },
        { "name": "Fundamentals", "weight": 23 },
        { "name": "Kafka Connect", "weight": 15 },
        { "name": "Application Observability", "weight": 13 },
        { "name": "Kafka Streams", "weight": 12 },
        { "name": "Application Testing", "weight": 8 }
      ]
    }
  }
}
```

> `weight` 값은 Wave 3 C1 에이전트가 공식 Exam Guide로 확정하기 전까지 **잠정치**다.
> UI는 `weight`가 `null`이면 퍼센트를 표시하지 않는다.
