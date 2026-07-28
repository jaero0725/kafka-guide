# kafka-guide

Apache Kafka **4.3** 기준 한국어 학습 가이드 — 기본개념 11장, 실무 예제 12개, 실수 케이스 10개,
빠른참조 7종, CCDAK · CCAAK 대비 자료, 그리고 브라우저에서 바로 푸는 **852문항** 문제은행.

의존성 0. CDN · 웹폰트 · 프레임워크를 쓰지 않는 정적 사이트이므로 오프라인에서도 열립니다.

## 바로 보기

```bash
npm run serve          # python3 -m http.server 8000
# http://localhost:8000
```

`file://`로 직접 열어도 대부분 동작하지만, 브라우저가 로컬 `fetch`를 막기 때문에
검색 · 문제 풀이 · 진도 대시보드는 HTTP로 띄워야 합니다.

## 구성

| 경로 | 내용 |
| --- | --- |
| `basics/` | 기본개념 11장 + `appendix-legacy.html`(2.x·ZooKeeper 시절 레거시) |
| `practice/` | 실무 예제 12개 — KRaft 클러스터 구축, EOS 파이프라인, CDC, Streams 집계, MirrorMaker 2 등 |
| `cases/` | 실수 케이스 10개 — 증상 → 원인 → 재현 → 해결 → 예방 체크리스트 |
| `cheatsheet/` | CLI · 설정값 · JMX 메트릭 · 트러블슈팅 결정 트리 · 보안 · Streams · Connect |
| `ccdak/` | 도메인별 요약 6종, 학습 플랜, 함정 사전, 벼락치기, 플래시카드 232장 |
| `ccaak/` | 운영·SRE 관점 블루프린트 요약 7종 + 시험 전략 |
| `quiz/` | 문제 풀이 허브 · 진단 테스트 · 오답 노트 · 결과 |
| `assets/diagrams/` | SVG 다이어그램 85개 (테마 토큰 기반, 8개는 인터랙티브) |
| `data/questions/` | 문제은행 31세트 852문항 + `manifest.json` |
| `docs/` | 콘텐츠 스타일 가이드, 버전 정책, 문항 스키마, 다이어그램 카탈로그, 사실 근거 목록 |
| `tools/` | 빌드·검증 스크립트 (Node 18+, 외부 패키지 없음) |

## 기준

- **버전** — 서술은 Kafka 4.3.x 기준입니다. 3.6~3.9와 동작이 다른 지점은 버전 노트로 병기하고,
  2.x는 레거시 부록에서만 다룹니다. `kafka_2.13-4.3.1.tgz`의 **2.13은 Scala 버전**이며
  Kafka 버전이 아닙니다 (자세한 내용은 `docs/VERSION_POLICY.md`).
- **메타데이터** — KRaft 전용. ZooKeeper는 4.0에서 제거되었으므로 역사적 맥락에서만 언급합니다.
- **사실 확인** — 설정명 · 기본값 · CLI 옵션은 Apache Kafka 공식 문서와 소스에서 확인한 값만 씁니다.
  확인 경로는 `docs/FACT_SOURCES.md`에 파일·라인 단위로 남겨 두었습니다.
- **문항 출처** — 852문항 전부 자체 창작입니다. 시험 덤프 사이트는 참조하지 않으며,
  `tools/validate.mjs`가 덤프 호스트 링크를 빌드 실패로 처리합니다.
  참고한 공개 리포지터리는 **다룰 주제 목록**으로만 사용했습니다 (CC BY-NC-ND 라이선스 준수).
- **진도 저장** — 브라우저 `localStorage`만 씁니다. 서버로 전송되는 데이터가 없습니다.

## 빌드

```bash
npm run build
```

세 단계를 순서대로 실행합니다.

1. `tools/inline-diagrams.mjs` — HTML의 `<figure data-diagram="D-030">` 자리에
   `assets/diagrams/`의 SVG를 정적으로 치환합니다 (멱등). 리포지터리에는 플레이스홀더만 저장하고,
   치환된 결과는 빌드 산출물입니다.
2. `tools/build-index.mjs` — `data/toc.json`(목차 · 페이지네이션),
   `assets/diagrams/index.json`(다이어그램 매핑), `data/search-index.json`(전문 검색)을 생성합니다.
3. `tools/validate.mjs --all --strict --deploy` — 링크 · 접근성 · 다이어그램 규약 · 문항 스키마 ·
   금지 표현(`--zookeeper` 등 4.x에서 사라진 옵션) · 덤프 호스트를 검사합니다.
   경고 하나라도 남으면 `--strict`에서 exit 1 입니다.

개별 실행:

```bash
npm run validate       # 검증만
npm run index          # 인덱스 재생성만
npm run check-inline   # 치환 없이 누락된 SVG만 확인
```

## 배포

정적 파일이므로 빌드 산출물을 그대로 올리면 됩니다.
Vercel은 프레임워크 프리셋 **Other**, 빌드 명령 `npm run build`,
출력 디렉터리 `.`(리포지터리 루트)로 설정합니다.

## 라이선스

작성한 문서 · 문항 · 다이어그램은 이 리포지터리의 저작물입니다.
Apache Kafka는 Apache Software Foundation의, CCDAK · CCAAK는 Confluent의 상표이며
이 리포지터리는 두 기관과 무관한 비공식 자료입니다.
