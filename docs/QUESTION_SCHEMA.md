# 문제 JSON 스키마

모든 문제은행 파일은 이 스키마를 따른다. `tools/validate.mjs`가 강제 검증한다.

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
| `type` | enum | ✅ | `single` \| `multiple` |
| `question` | string | ✅ | 200자 이내 권장. `multiple`이면 끝에 `(2개 선택)` 명시 |
| `code` | object \| null | — | `{ lang, body }`. 코드/설정이 필요할 때만 |
| `choices` | array | ✅ | **정확히 4개** (`multiple`은 5개 허용). `id`는 `A`,`B`,`C`,`D`,`E` |
| `answer` | string[] | ✅ | `single`이면 1개, `multiple`이면 2개 이상 |
| `explanation` | string | ✅ | **3~6문장.** 정답을 원리로 설명. 문제문 반복 금지 |
| `distractorNotes` | object | ✅ | **모든 오답 선택지**에 대해 1~2문장 |
| `refs` | array | ✅ | 최소 1개. **공식 문서 URL만** (kafka.apache.org / cwiki.apache.org / docs.confluent.io) |
| `tags` | string[] | ✅ | 2~5개. 소문자, 설정명은 원문 그대로 |

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
