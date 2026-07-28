# 버전 정책 — 어떤 버전을 기준으로 쓸 것인가

> 모든 콘텐츠 에이전트는 이 문서를 `CONTENT_STYLE_GUIDE.md`와 함께 읽는다.

---

## 1. "2.13"은 Kafka 버전이 아니다 — Scala 버전이다

배포 파일명이 이렇게 생겼기 때문에 매우 흔하게 혼동된다.

```
kafka_2.13-4.3.0.tgz
      ↑        ↑
   Scala    Kafka
   2.13     4.3.0
```

| 표기 | 의미 |
|---|---|
| `kafka_2.13` | **Scala 2.13**으로 컴파일된 배포판. 현행 Kafka가 지원하는 유일한 Scala 버전 |
| `-4.3.0` | **Apache Kafka 버전** |
| `_2.12` | 과거 배포판. 최신 Kafka에서는 제공되지 않음 |

- Scala를 직접 쓰지 않는다면 `_2.13`을 고르면 된다. 브로커는 JVM 바이너리로 동작하므로 Java만 있으면 된다.
- Scala 버전은 Kafka 클라이언트 API(Java)와 무관하다.
- **Kafka 2.13이라는 버전은 존재하지 않는다.** Kafka는 2.8 다음이 3.0이다.

### 사이트 반영 위치 (반드시 다룰 것)
1. `basics/ch01.html` — "Kafka 버전 표기 읽는 법" 서브섹션 (.note 박스)
2. `cheatsheet/cli.html` — 다운로드/설치 섹션 상단 노트
3. `practice/ex01.html` — docker 이미지 태그·다운로드 URL 설명 시 명시
4. 문제은행 — `basics-ch01` 세트에 이 내용을 묻는 문항 1개 필수 포함

---

## 2. 세 개의 버전 트랙을 병기한다

현실적으로 많은 조직이 아직 2.x / 3.x를 운영 중이다. 최신만 다루면 실무에서 못 쓰고,
구버전만 다루면 시험에서 틀린다. **기본은 4.x, 차이는 병기**한다.

| 트랙 | 범위 | 사이트에서의 취급 |
|---|---|---|
| **현행 (기준)** | Kafka **4.3.x** | 모든 본문의 기본 서술. 설정 기본값·CLI·API는 여기에 맞춘다 |
| **직전 LTS성** | Kafka **3.6 ~ 3.9** | KRaft/ZK 공존기. 차이가 있으면 `.note--version`으로 병기 |
| **레거시** | Kafka **2.x (2.0~2.8)** | ZooKeeper 필수 시대. 별도 부록 페이지에서 집중 처리 |

### `.note--version` 병기 규칙

버전에 따라 **동작이나 기본값이 다른 항목**은 본문에 다음을 삽입한다.

```html
<aside class="note note--version">
  <strong>버전 노트</strong>
  <table class="config-table">
    <tr><th scope="row">Kafka 2.x</th><td>기본값 false, ZooKeeper에 저장</td></tr>
    <tr><th scope="row">Kafka 3.x</th><td>3.0부터 기본값 true</td></tr>
    <tr><th scope="row">Kafka 4.3</th><td>동일. ZooKeeper 경로 제거</td></tr>
  </table>
</aside>
```

### 반드시 버전 병기가 필요한 항목 (최소 목록)

| 항목 | 2.x | 3.x | 4.x |
|---|---|---|---|
| 메타데이터 저장소 | ZooKeeper | ZK / KRaft 공존 | **KRaft 전용** |
| `enable.idempotence` 기본값 | false | 3.0부터 true | true |
| `acks` 기본값 | 1 | 3.0부터 all | all |
| 컨슈머 리밸런스 프로토콜 | eager 중심 | cooperative 도입 | **KIP-848 GA** |
| `--zookeeper` CLI 옵션 | 사용 | deprecated | **제거됨** |
| 파티션 할당 기본 전략 | Range | Range/Cooperative | **`[RangeAssignor, CooperativeStickyAssignor]`** ✔확인 |
| Queues / Share Groups | 없음 | 없음 | **4.2 GA** |
| Tiered Storage | 없음 | 3.6 EA → 3.9 GA | 지원 |
| Java 최소 버전 | 8 | 8/11 | **17·21·25 완전 지원. 8은 4.0에서 제거** ✔확인 |
| Scala 배포판 | 2.12 / 2.13 | 2.12 / 2.13 | **2.13 전용** |

> ⚠️ 위 표의 값들도 **에이전트가 공식 문서로 재확인**한 뒤 쓴다.
> 확인 못 한 칸은 비우고 반환 리포트에 남긴다. 추정치를 채우지 않는다.

---

## 3. 레거시 부록 페이지 (신규)

`basics/appendix-legacy.html` — **Wave 1 A3 에이전트가 추가로 담당**한다.

내용:
1. **버전 표기 읽는 법** (본 문서 §1 전체)
2. **Kafka 2.x / 3.x 아직 쓰는 조직을 위한 안내**
   - ZooKeeper 기반 운영: 앙상블 구성, `--zookeeper` CLI, ZK에 저장되던 것들
     (토픽 메타데이터, ACL, 동적 설정, 컨트롤러 선출, 브로커 등록)
   - ZK 시대의 흔한 장애: ZK 세션 타임아웃, ZK 디스크 풀, split-brain
3. **버전별 주요 변경 타임라인** (2.0 → 4.3) 표
   - 2.4 sticky assignor / 2.5 EOS 개선 / 2.8 KRaft EA·ZK-free 미리보기
   - 3.0 기본값 변경(acks=all, idempotence=true) / 3.3 KRaft production-ready
   - 3.6 Tiered Storage EA / 3.9 마지막 ZK 지원 버전
   - 4.0 ZK 제거·KIP-848 GA / 4.1 Share Groups preview / 4.2 Share Groups GA
   → 이 타임라인 자체를 공식 릴리스 노트로 검증할 것
4. **업그레이드 경로**: 2.x → 3.9 → 4.x (3.9를 반드시 경유해야 하는 이유,
   ZK → KRaft 마이그레이션 절차 개요, `inter.broker.protocol.version` 단계적 상향)
5. **레거시 → 현행 대응표**: 옛날 명령/설정 → 지금은 무엇으로 바뀌었는가

출처: https://kafka.apache.org/documentation/#upgrade , 각 릴리스 노트

---

## 4. 문제은행에서의 버전 처리

- 문제는 **기본적으로 4.3 기준**으로 출제한다.
- 버전에 따라 답이 갈리는 문항은 **문제문에 버전을 명시**한다.
  - ❌ "`enable.idempotence`의 기본값은?"
  - ✅ "Kafka 3.0 이상에서 `enable.idempotence`의 기본값은?"
- 버전 차이 자체를 묻는 문항을 세트당 1~2개 배치한다 (실무 이관 시 자주 걸리는 지점).
- 각 문항 JSON에 `kafkaVersion` 세트 필드가 이미 있으며, 개별 문항이 다른 버전을
  전제하면 `tags`에 `version-2x` / `version-3x`를 추가한다.
