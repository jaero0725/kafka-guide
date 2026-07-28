# 멀티에이전트 프롬프트 — 실행 안내

## 실행 순서

| Wave | 파일 | 에이전트 수 | 실행 방식 |
|---|---|:--:|---|
| 0 | `wave0-foundation.md` | 1 | **동기 단독** — 완료·검토 후 다음 진행 |
| 1 | `wave1-content.md` (A1–A8) + `wave1-visuals.md` (V1–V3) | 11 | **병렬** — 한 메시지에 11개 Agent 호출 |
| 2 | `wave2-questions.md` | 5 + 1 | **B1–B5 병렬 → B6 단독** |
| 3 | `wave3-verify.md` | 5 | **병렬** — 읽기 전용 검증, 리포트 반환 |
| — | (수정 적용) | — | Wave 3 리포트 기반 수정. 담당 에이전트를 SendMessage로 이어서 지시 |
| 4 | `wave4-integration.md` | 1 | **동기 단독** — 다이어그램 인라인·인덱스·최종 통합 |

## 최우선 목표

**CCDAK 합격이 1순위다.** `PLAN.md` 최상단 우선순위 표를 참조.
Application Development(28%) + Fundamentals(23%) = 51%에 자원이 집중된다.
자기 담당이 이 두 도메인에 걸리는 에이전트(A1, A2, A7, V1, B2, B3)는 가장 높은 완성도를 요구받는다.

## 공통 프리앰블

**모든 에이전트 프롬프트 앞에 아래 블록을 붙인다.**

```
당신은 "Kafka Guide" 정적 학습 사이트를 구축하는 팀의 일원입니다.
작업 루트: /home/user/kafka-guide

작업 시작 전 반드시 순서대로 읽으세요:
1. PLAN.md                        — 전체 구조·CCDAK 우선순위·파일 소유권 표
2. docs/CONTENT_STYLE_GUIDE.md    — HTML/톤/기술 기준 (계약서)
3. docs/VERSION_POLICY.md         — 버전 기준·2.13 혼동·레거시 병기 규칙
4. docs/CCDAK_TOPIC_CHECKLIST.md  — 필수 출제 토픽 24개 + 태그 규약
5. docs/DIAGRAM_CATALOG.md        — 다이어그램 83개 카탈로그·작성 규칙·분리 구조
6. docs/FACT_SOURCES.md           — ★ 사실 확인 경로 (공식 문서 웹사이트가 차단됨)
7. docs/QUESTION_SCHEMA.md        — 문제 JSON 스키마 (문제 생성 에이전트만)

절대 규칙:
- 기준 버전은 Apache Kafka 4.3.x. ZooKeeper는 4.0에서 제거되었으므로
  현행 아키텍처로 서술하지 않습니다.
  (예외: basics/appendix-legacy.html 안에서만 ZooKeeper 서술이 허용됩니다.)
- "2.13"은 Kafka 버전이 아니라 Scala 버전입니다 (kafka_2.13-4.3.0).
  이를 Kafka 버전으로 서술하면 즉시 반려됩니다.
- ★ 공식 문서 웹사이트(kafka.apache.org, docs.confluent.io, cwiki.apache.org,
  confluent.io)는 이 환경의 네트워크 정책으로 **차단되어 있습니다. 재시도 금지.**
  설정명·기본값은 Apache Kafka 소스 코드로 확인합니다:
  raw.githubusercontent.com/apache/kafka/4.3/{경로}
  → 파일 경로와 이미 확인된 기본값은 docs/FACT_SOURCES.md 에 정리되어 있습니다.
  기억에 의존하지 마세요. 확인 못 하면 쓰지 마세요.
- linger.ms 기본값은 5입니다 (4.0에서 0→5 변경). group.protocol 기본값은 classic입니다.
  이 두 개는 시중 자료가 거의 다 틀렸으니 특히 주의하세요.
- 시험 덤프 사이트(examtopics, validexamdumps, pass4success, skillcertpro,
  itexams, examcollection 등) 참조·복제 전면 금지.
- 외부 CDN/폰트/스크립트 참조 금지. 모든 자원은 상대 경로.
- PLAN.md §4 파일 소유권 표에 명시된 "당신의 경로" 밖의 파일을 절대 수정하지 마세요.
- data/toc.json, data/search-index.json, index.html 은 Wave 4 전용입니다. 건드리지 마세요.
- 사이드바 HTML을 하드코딩하지 마세요. <div id="sidebar-mount"> 만 둡니다.
- **다이어그램 분리 규칙** (Wave 1의 병렬 실행이 여기에 달려 있습니다):
  · 콘텐츠 에이전트(A1–A8)는 SVG를 그리지 않습니다. 플레이스홀더만 넣습니다:
    <figure class="diagram" data-diagram="D-030"><figcaption>설명</figcaption></figure>
    → 카탈로그에 없는 ID를 임의로 만들지 마세요. docs/DIAGRAM_CATALOG.md의 ID만 씁니다.
  · 시각화 에이전트(V1–V3)는 HTML을 수정하지 않습니다.
    assets/diagrams/{ID}-{slug}.svg 만 만듭니다.

작업 완료 후 반환할 것 (최종 텍스트가 곧 반환값입니다):
- 생성한 파일 목록 (경로)
- 각 파일의 한 줄 요약
- 공식 문서에서 확인하지 못해 생략하거나 추정한 항목 목록 (있으면 반드시 명시)
- 다른 에이전트가 알아야 할 사항 (링크 대상 경로, 명명 규칙 등)
```

## 병렬 실행 예시

Wave 1은 다음처럼 **한 메시지 안에서** 8개 Agent 호출을 동시에 보낸다.

```
Agent(subagent_type="general-purpose", description="기본개념 ch02-04",
      prompt="<공통 프리앰블>\n\n<A1 프롬프트>")
Agent(subagent_type="general-purpose", description="기본개념 ch05-08",
      prompt="<공통 프리앰블>\n\n<A2 프롬프트>")
... (A3~A8 동일)
```

## Wave 사이 게이트

각 Wave 종료 후 다음을 확인하고 넘어간다.

- **Wave 0 후**: `basics/ch01.html`을 브라우저로 열어 레이아웃·다크모드·인라인 퀴즈 동작 확인. **스타일이 마음에 들 때까지 여기서 반복한다** (이후 7개 에이전트가 이 페이지를 기준으로 복제하므로 가장 중요한 게이트).
- **Wave 1 후**: `node tools/validate.mjs --links` 통과
- **Wave 2 후**: `node tools/validate.mjs --questions` 통과, `id` 중복 0
- **Wave 3 후**: 리포트의 CRITICAL 항목 전부 해소
- **Wave 4 후**: 전 페이지 스모크 테스트 + GitHub Pages 배포
