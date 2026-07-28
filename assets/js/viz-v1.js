/* ==========================================================================
   Kafka Guide — V1 인터랙티브 다이어그램 로직 (viz-v1.js)
   --------------------------------------------------------------------------
   ★ Wave 0 / Wave 4 에게 ★
   assets/js/viz.js 는 Wave 0 소유이므로 수정하지 않았습니다. 대신 V1 이 담당하는
   인터랙티브 3종의 로직만 이 파일에 담았습니다. 동작시키려면 페이지에서
   viz.js **다음에** 이 파일을 로드해야 합니다.

     <script src="../assets/js/viz.js" defer></script>
     <script src="../assets/js/viz-v1.js" defer></script>   ← 이 줄 추가
     <script src="../assets/js/app.js" defer></script>

   (또는 이 파일의 register 블록 3개를 viz.js 의 REGISTRY 섹션으로 옮겨도 됩니다.
    그 경우 이 파일은 삭제하면 됩니다. 두 곳에 동시에 두지는 마세요.)

   담당 다이어그램
     D-034  키 있음/없음 파티셔닝
     D-040  리밸런스 시뮬레이터
     D-046  파티션 할당 전략 4종 비교

   파티션 할당 알고리즘의 근거 (Apache Kafka 4.3 소스)
     clients/.../consumer/RangeAssignor.java              — 토픽별로 나누고 앞쪽 몇 명이 1개 더
     clients/.../consumer/RoundRobinAssignor.java         — 정렬된 전체 파티션을 순환 배정
     clients/.../consumer/internals/AbstractStickyAssignor.java
                                                          — ConstrainedAssignmentBuilder (구독이 모두 같을 때)
     clients/.../consumer/CooperativeStickyAssignor.java  — sticky 와 같은 결과를 만든 뒤
                                                            소유자가 바뀌는 파티션을 1차에서 빼 둔다
     clients/.../producer/internals/BuiltInPartitioner.java
                                                          — partitionForKey = toPositive(murmur2(key)) % N
     clients/.../common/utils/Utils.java                  — murmur2 (little-endian)
   ========================================================================== */
(function (global) {
  'use strict';

  var KG = global.KG;
  if (!KG || !KG.viz) {
    if (global.console) console.error('[viz-v1] viz.js 가 먼저 로드되어야 합니다');
    return;
  }
  var register = KG.viz.register;

  /* ======================================================================
     1. murmur2 — Kafka Utils.murmur2 의 자바스크립트 포팅
     ---------------------------------------------------------------------
     Java 는 int 연산이므로 JS 에서는 Math.imul 과 | 0 으로 32비트를 유지합니다.
     4바이트 묶음은 little-endian 으로 읽습니다 (Utils.java 의 INT_HANDLE).
     ====================================================================== */
  function murmur2(bytes) {
    var length = bytes.length;
    var seed = 0x9747b28c;
    var m = 0x5bd1e995;
    var r = 24;
    var h = (seed ^ length) | 0;
    var len4 = length >> 2;
    for (var i = 0; i < len4; i++) {
      var i4 = i << 2;
      var k = (bytes[i4] | (bytes[i4 + 1] << 8) | (bytes[i4 + 2] << 16) | (bytes[i4 + 3] << 24)) | 0;
      k = Math.imul(k, m);
      k ^= k >>> r;
      k = Math.imul(k, m);
      h = Math.imul(h, m);
      h ^= k;
    }
    var index = len4 << 2;
    switch (length - index) {
      case 3:
        h ^= (bytes[index + 2] & 0xff) << 16;
        /* falls through */
      case 2:
        h ^= (bytes[index + 1] & 0xff) << 8;
        /* falls through */
      case 1:
        h ^= bytes[index] & 0xff;
        h = Math.imul(h, m);
    }
    h ^= h >>> 13;
    h = Math.imul(h, m);
    h ^= h >>> 15;
    return h | 0;
  }
  function utf8(str) {
    if (global.TextEncoder) return new global.TextEncoder().encode(str);
    var out = [], s = unescape(encodeURIComponent(str));
    for (var i = 0; i < s.length; i++) out.push(s.charCodeAt(i) & 0xff);
    return out;
  }
  function toPositive(n) { return n & 0x7fffffff; }
  /** BuiltInPartitioner.partitionForKey 와 동일 */
  function partitionForKey(key, numPartitions) {
    return toPositive(murmur2(utf8(key))) % numPartitions;
  }

  /* ======================================================================
     2. 파티션 할당 알고리즘
     ---------------------------------------------------------------------
     파티션 표현: { t: 토픽인덱스, p: 파티션번호, key: 't0p3' }
     정렬 기준
       · 전체 정렬 = 토픽 이름 → 파티션 번호  (RoundRobinAssignor.allPartitionsSorted)
       · 소유 파티션 정렬 = 파티션 번호 → 토픽 이름 (AbstractStickyAssignor.assignOwnedPartitions)
     ====================================================================== */
  function makePartitions(numTopics, partsPerTopic) {
    var out = [];
    for (var t = 0; t < numTopics; t++) {
      for (var p = 0; p < partsPerTopic; p++) out.push({ t: t, p: p, key: 't' + t + 'p' + p });
    }
    return out;                       // 이미 토픽 → 파티션 순
  }
  function emptyAssign(consumers) {
    var a = {};
    consumers.forEach(function (c) { a[c] = []; });
    return a;
  }

  /** RangeAssignor — 토픽별로 파티션/컨슈머, 나머지는 앞쪽 컨슈머가 1개씩 더 */
  function assignRange(consumers, parts) {
    var assign = emptyAssign(consumers);
    var N = consumers.length;
    if (!N) return { assign: assign, transferring: {} };
    var byTopic = {};
    parts.forEach(function (pp) { (byTopic[pp.t] = byTopic[pp.t] || []).push(pp); });
    Object.keys(byTopic).sort().forEach(function (t) {
      var list = byTopic[t].slice().sort(function (a, b) { return a.p - b.p; });
      var n = Math.floor(list.length / N);
      var rem = list.length % N;
      var idx = 0;
      consumers.forEach(function (c, i) {
        var cnt = n + (i < rem ? 1 : 0);
        for (var k = 0; k < cnt; k++) assign[c].push(list[idx++]);
      });
    });
    return { assign: assign, transferring: {} };
  }

  /** RoundRobinAssignor — 정렬된 전체 파티션을 컨슈머에게 순환 배정 */
  function assignRoundRobin(consumers, parts) {
    var assign = emptyAssign(consumers);
    var N = consumers.length;
    if (!N) return { assign: assign, transferring: {} };
    parts.forEach(function (pp, i) { assign[consumers[i % N]].push(pp); });
    return { assign: assign, transferring: {} };
  }

  /**
   * AbstractStickyAssignor 의 ConstrainedAssignmentBuilder 를 옮긴 것.
   * 구독이 모두 같고 rack 정보가 없는 경우(학습용 시뮬레이터의 조건)에 해당합니다.
   *
   * prev: { 파티션key: 이전소유자 } — 이미 그룹을 떠난 컨슈머의 소유는 무효로 봅니다.
   * 반환 transferring: 이전 소유자가 아직 살아 있는데 다른 컨슈머로 넘어가는 파티션.
   *                    CooperativeStickyAssignor 가 1차 리밸런스에서 빼 두는 대상입니다.
   */
  function assignSticky(consumers, parts, prev) {
    var assign = emptyAssign(consumers);
    var N = consumers.length, P = parts.length;
    if (!N) return { assign: assign, transferring: {} };

    var minQ = Math.floor(P / N);
    var maxQ = Math.ceil(P / N);
    var expectedOver = P % N;
    var currentOver = 0;

    var owned = {};
    consumers.forEach(function (c) { owned[c] = []; });
    parts.forEach(function (pp) {
      var o = prev && prev[pp.key];
      if (o && owned[o]) owned[o].push(pp);
    });
    // 파티션 번호 → 토픽 순 (Java 와 동일)
    consumers.forEach(function (c) {
      owned[c].sort(function (a, b) { return a.p - b.p || a.t - b.t; });
    });

    var assignedKeys = {};
    var maybeRevoked = {};            // 파티션key → 쿼터 초과로 회수된 이전 소유자
    var unfilledUnder = [];           // minQ 미달 컨슈머
    var unfilledExactly = [];         // 정확히 minQ 이고 maxQ 후보인 컨슈머

    consumers.forEach(function (c) {
      var mine = owned[c];
      if (mine.length < minQ) {
        mine.forEach(function (pp) { assign[c].push(pp); assignedKeys[pp.key] = 1; });
        unfilledUnder.push(c);
      } else if (mine.length >= maxQ && currentOver < expectedOver) {
        currentOver++;
        if (currentOver === expectedOver) unfilledExactly.length = 0;
        mine.slice(0, maxQ).forEach(function (pp) { assign[c].push(pp); assignedKeys[pp.key] = 1; });
        mine.slice(maxQ).forEach(function (pp) { maybeRevoked[pp.key] = c; });
      } else {
        mine.slice(0, minQ).forEach(function (pp) { assign[c].push(pp); assignedKeys[pp.key] = 1; });
        mine.slice(minQ).forEach(function (pp) { maybeRevoked[pp.key] = c; });
        if (currentOver < expectedOver) unfilledExactly.push(c);
      }
    });

    var unassigned = parts.filter(function (pp) { return !assignedKeys[pp.key]; });
    unfilledUnder.sort();
    unfilledExactly.sort();

    var transferring = {};
    var idx = 0;
    unassigned.forEach(function (pp) {
      var c = null;
      if (unfilledUnder.length) {
        if (idx >= unfilledUnder.length) idx = 0;
        c = unfilledUnder[idx];
        assign[c].push(pp);
        if (assign[c].length === minQ) {
          unfilledUnder.splice(idx, 1);
          unfilledExactly.push(c);
        } else {
          idx++;
        }
      } else if (unfilledExactly.length) {
        c = unfilledExactly.shift();
        assign[c].push(pp);
        if (assign[c].length === maxQ) currentOver++;
      }
      if (c && maybeRevoked[pp.key] && maybeRevoked[pp.key] !== c) transferring[pp.key] = c;
    });

    return { assign: assign, transferring: transferring };
  }

  /** CooperativeStickyAssignor — 목표 할당은 sticky 와 동일. 차이는 리밸런스 프로토콜뿐 */
  function assignCooperativeSticky(consumers, parts, prev) {
    return assignSticky(consumers, parts, prev);
  }

  var ASSIGNORS = {
    range: { fn: assignRange, label: 'RangeAssignor', protocol: 'eager' },
    roundrobin: { fn: assignRoundRobin, label: 'RoundRobinAssignor', protocol: 'eager' },
    sticky: { fn: assignSticky, label: 'StickyAssignor', protocol: 'eager' },
    cooperative: { fn: assignCooperativeSticky, label: 'CooperativeStickyAssignor', protocol: 'cooperative' }
  };

  function runAssignor(name, consumers, parts, prev) {
    var a = ASSIGNORS[name] || ASSIGNORS.range;
    var res = a.fn(consumers, parts, prev);
    var owner = {};
    Object.keys(res.assign).forEach(function (c) {
      res.assign[c].forEach(function (pp) { owner[pp.key] = c; });
    });
    return { assign: res.assign, owner: owner, transferring: res.transferring || {}, meta: a };
  }

  /* 테스트·검증용 공개 (Wave 0 의 KG.viz 는 건드리지 않고 별도 이름공간) */
  KG.v1 = {
    murmur2: murmur2,
    partitionForKey: partitionForKey,
    makePartitions: makePartitions,
    runAssignor: runAssignor,
    assignors: ASSIGNORS
  };

  /* ======================================================================
     D-034 — 키 있음 / 없음 파티셔닝
     ---------------------------------------------------------------------
     SVG 훅
       mode-label            현재 모드 설명 <text>
       formula               파티션 결정식 <text>
       col-0 … col-7         파티션 열 <g>            (파티션 수보다 큰 열은 hidden)
       bar-0 … bar-7         건수 막대 <rect>
       cnt-0 … cnt-7         건수 숫자 <text>
       seq-0 … seq-23        전송 순서 칸 <g> (안에 rect + text)
       seqtext-0 … seqtext-23  칸 안의 파티션 번호 <text>
       total                 총 전송 건수 <text>
     ====================================================================== */
  var D034_KEYS = ['order-42', 'order-43', 'user-1001', 'user-1002', 'cart-7'];
  var D034_BAR_BASE = 300;      // 막대 바닥 y (SVG 와 일치)
  var D034_BAR_MAX = 196;       // 막대 최대 높이
  var D034_SEQ = 24;            // 전송 순서 칸 개수
  var D034_STICKY_RUN = 5;      // 그림에서 한 배치로 축약한 건수

  register('D-034', function (ctx) {
    // SVG 파일의 정적 초기 상태(키 order-42 · 파티션 6개 · 8건 전송)와 같은 값으로 시작합니다.
    // JS 없이 본 그림과 JS 로드 직후의 그림이 달라지지 않아야 합니다.
    var st = { counts: [0, 0, 0, 0, 0, 0, 0, 0], seq: [], total: 0, sticky: 0, stickyLeft: D034_STICKY_RUN, rr: 0 };
    function seedState() {
      resetState();
      var p0 = partitionForKey('order-42', 6);
      for (var i = 0; i < 8; i++) { st.counts[p0]++; st.total++; st.seq.push(p0); }
    }

    var ctrl = ctx.bindControls({
      items: [
        { type: 'select', name: 'mode', label: '파티셔닝 모드', value: 'key',
          options: [
            { value: 'key', label: '키 있음 — murmur2(key) % N' },
            { value: 'sticky', label: '키 없음 — sticky batching (실제 동작)' },
            { value: 'rr', label: '키 없음 — 순수 라운드로빈 (비교용)' }
          ] },
        { type: 'select', name: 'key', label: '레코드 키', value: 'order-42',
          options: D034_KEYS.map(function (k) { return { value: k, label: k }; }) },
        { type: 'range', name: 'parts', label: '파티션 수', min: 3, max: 8, step: 1, value: 6,
          format: function (v) { return v + '개'; } },
        { type: 'button', name: 'send1', label: '1건 전송', variant: 'primary',
          onClick: function (v) { send(v, 1); } },
        { type: 'button', name: 'send10', label: '10건 전송',
          onClick: function (v) { send(v, 10); } },
        { type: 'reset', label: '초기화' }
      ],
      onChange: function (v, api, meta) {
        if (meta.type === 'select' || meta.type === 'range' || meta.type === 'reset') resetState();
        render(v);
      }
    });

    function resetState() {
      st.counts = [0, 0, 0, 0, 0, 0, 0, 0];
      st.seq = [];
      st.total = 0;
      st.sticky = 0;
      st.stickyLeft = D034_STICKY_RUN;
      st.rr = 0;
    }

    function nextPartition(v) {
      var n = v.parts;
      if (v.mode === 'key') return partitionForKey(v.key, n);
      if (v.mode === 'rr') return (st.rr++) % n;
      // sticky: 한 배치를 다 채운 뒤 다음 파티션으로 전환 (BuiltInPartitioner 는 무작위로 고릅니다)
      if (st.stickyLeft <= 0) {
        st.sticky = Math.floor(Math.random() * n);
        st.stickyLeft = D034_STICKY_RUN;
      }
      if (st.sticky >= n) st.sticky = 0;
      st.stickyLeft--;
      return st.sticky;
    }

    function send(v, count) {
      for (var i = 0; i < count; i++) {
        var p = nextPartition(v);
        st.counts[p]++;
        st.total++;
        st.seq.push(p);
        if (st.seq.length > D034_SEQ) st.seq.shift();
      }
      render(v);
    }

    function render(v) {
      var n = v.parts, i;

      // 열 표시 / 숨김
      for (i = 0; i < 8; i++) {
        ctx.setState('col-' + i, i < n ? null : 'hidden');
      }

      var max = 1;
      for (i = 0; i < n; i++) if (st.counts[i] > max) max = st.counts[i];
      for (i = 0; i < 8; i++) {
        var bar = ctx.q('bar-' + i);
        if (bar) {
          var h = i < n ? Math.round(D034_BAR_MAX * (st.counts[i] / max)) : 0;
          bar.setAttribute('y', String(D034_BAR_BASE - h));
          bar.setAttribute('height', String(h));
          bar.setAttribute('data-state', (i < n && st.counts[i] > 0) ? 'on' : 'off');
        }
        ctx.text('cnt-' + i, i < n ? st.counts[i] : '');
      }

      // 전송 순서 스트립
      for (i = 0; i < D034_SEQ; i++) {
        var has = i < st.seq.length;
        ctx.setState('seq-' + i, has ? 'on' : 'off');
        ctx.text('seqtext-' + i, has ? st.seq[i] : '·');
      }

      ctx.text('total', st.total);

      if (v.mode === 'key') {
        ctx.text('mode-label', '키 있음 — 같은 키는 언제나 같은 파티션으로 갑니다 (파티션 단위 순서 보장)');
        ctx.text('formula', 'toPositive(murmur2("' + v.key + '")) % ' + n + ' = ' + partitionForKey(v.key, n));
      } else if (v.mode === 'sticky') {
        ctx.text('mode-label', '키 없음 · sticky batching — 한 파티션에 배치가 찰 때까지 몰아 보낸 뒤 다음 파티션으로 전환합니다');
        ctx.text('formula', '전환 기준은 batch.size(16384 B) — 이 그림에서는 ' + D034_STICKY_RUN + '건을 한 배치로 축약했습니다');
      } else {
        ctx.text('mode-label', '키 없음 · 순수 라운드로빈 — 매 건마다 다음 파티션으로 (Kafka 의 실제 기본 동작이 아닙니다)');
        ctx.text('formula', '전송 순번 % ' + n + ' — 시험에서 "round-robin" 으로 표현되는 모델입니다');
      }

      var used = 0;
      for (i = 0; i < n; i++) if (st.counts[i] > 0) used++;
      var list = [{ label: '총 전송', value: st.total + '건' }, { label: '사용된 파티션', value: used + ' / ' + n }];
      for (i = 0; i < n; i++) list.push({ label: 'p' + i, value: st.counts[i] });
      ctrl.readout(list);

      ctrl.announce(
        (v.mode === 'key' ? '키 ' + v.key + ' 는 파티션 ' + partitionForKey(v.key, n) + ' 로 갑니다. '
          : v.mode === 'sticky' ? 'sticky 모드입니다. 같은 파티션이 연속으로 나타납니다. '
          : '라운드로빈 모드입니다. 파티션이 매번 바뀝니다. ') +
        '총 ' + st.total + '건을 보내 ' + used + '개 파티션을 사용했습니다.'
      );
    }

    seedState();
    render(ctrl.values());
  });

  /* ======================================================================
     D-040 — 리밸런스 시뮬레이터
     ---------------------------------------------------------------------
     SVG 훅
       cell-{r}-{p}     r=0..4 컨슈머, p=0..7 파티션. <g> 안에 rect + text
       cellt-{r}-{p}    칸 안의 상태 문자 <text>
       row-{r}          컨슈머 행 <g>
       rowlabel-{r}     컨슈머 이름 <text>
       rowstate-{r}     컨슈머 상태 <text>
       strategy-label   전략 설명 <text>
       round-label      리밸런스 단계 설명 <text>
     ====================================================================== */
  var D040_PARTS = 8;
  var D040_MAX_C = 5;

  register('D-040', function (ctx) {
    var parts = makePartitions(1, D040_PARTS);
    var st = { active: 3, prev: {}, timer: null, generation: 0 };

    function names(n) {
      var out = [];
      for (var i = 0; i < n; i++) out.push('C' + (i + 1));
      return out;
    }

    var ctrl = ctx.bindControls({
      items: [
        { type: 'select', name: 'strategy', label: '할당 전략', value: 'range',
          options: [
            { value: 'range', label: 'RangeAssignor (eager)' },
            { value: 'roundrobin', label: 'RoundRobinAssignor (eager)' },
            { value: 'sticky', label: 'StickyAssignor (eager)' },
            { value: 'cooperative', label: 'CooperativeStickyAssignor' }
          ] },
        { type: 'button', name: 'add', label: '컨슈머 추가', variant: 'primary',
          onClick: function (v) { change(v, 'add'); } },
        { type: 'button', name: 'remove', label: '컨슈머 제거 (정상 종료)',
          onClick: function (v) { change(v, 'remove'); } },
        { type: 'button', name: 'crash', label: '컨슈머 크래시',
          onClick: function (v) { change(v, 'crash'); } },
        { type: 'reset', label: '처음 상태로' }
      ],
      onChange: function (v, api, meta) {
        if (meta.type === 'select') { rebalance(v, '전략 변경'); return; }
        if (meta.type === 'reset') {
          st.active = 3; st.prev = {}; st.generation = 0;
          rebalance(v, '초기화');
        }
      }
    });

    function change(v, kind) {
      if (kind === 'add') {
        if (st.active >= D040_MAX_C) { ctrl.announce('컨슈머는 최대 ' + D040_MAX_C + '명까지입니다.'); return; }
        st.active++;
        rebalance(v, '컨슈머 ' + st.active + '번 합류');
      } else {
        if (st.active <= 1) { ctrl.announce('컨슈머가 1명뿐이라 더 줄일 수 없습니다.'); return; }
        var gone = 'C' + st.active;
        st.active--;
        // 떠난 컨슈머의 소유는 무효가 됩니다 (누구도 그 파티션을 갖고 있지 않은 상태)
        Object.keys(st.prev).forEach(function (k) { if (st.prev[k] === gone) delete st.prev[k]; });
        rebalance(v, kind === 'crash'
          ? gone + ' 크래시 — 세션 타임아웃 뒤 리밸런스'
          : gone + ' 정상 종료 — LeaveGroup 즉시 리밸런스');
      }
    }

    function rebalance(v, why) {
      if (st.timer) { global.clearTimeout(st.timer); st.timer = null; }
      var consumers = names(st.active);
      var res = runAssignor(v.strategy, consumers, parts, st.prev);
      st.generation++;

      var cooperative = res.meta.protocol === 'cooperative';
      var moving = Object.keys(res.transferring);

      if (cooperative && moving.length) {
        // 1차 리밸런스: 옮겨 갈 파티션은 이전 소유자에게서 회수하고 아직 할당하지 않습니다.
        var hold = {};
        moving.forEach(function (k) { hold[k] = 1; });
        paint(res, consumers, st.prev, hold);
        ctx.text('round-label', '1차 리밸런스 — 이동 대상 ' + moving.length + '개만 회수 (나머지는 계속 처리)');
        ctrl.announce(why + '. cooperative 프로토콜이라 1차 리밸런스에서 이동 대상 ' + moving.length +
          '개만 회수하고 나머지 파티션은 처리를 계속합니다.');
        summarize(v, res, consumers, moving.length, 1);
        var finish = function () {
          st.timer = null;
          paint(res, consumers, st.prev, null);
          ctx.text('round-label', '2차 리밸런스 완료 — 회수된 ' + moving.length + '개를 새 소유자에게 할당');
          st.prev = res.owner;
          summarize(v, res, consumers, moving.length, 2);
          ctrl.announce('2차 리밸런스가 끝나 회수된 파티션이 새 소유자에게 할당되었습니다.');
        };
        if (ctx.reducedMotion) finish();
        else st.timer = global.setTimeout(finish, 1100);
        return;
      }

      // eager: 전원이 전체 반납한 뒤 재할당 (한 번에 끝납니다)
      paint(res, consumers, st.prev, null);
      ctx.text('round-label', cooperative
        ? '리밸런스 완료 — 옮겨 갈 파티션이 없어 회수도 없었습니다'
        : 'eager 리밸런스 — 전원이 전체 반납 후 재할당 (그 사이 모든 처리가 멈춥니다)');
      st.prev = res.owner;
      summarize(v, res, consumers, 0, 1);
      ctrl.announce(why + '. ' + res.meta.label + ' 로 재할당했습니다.');
    }

    function paint(res, consumers, prevOwner, hold) {
      for (var r = 0; r < D040_MAX_C; r++) {
        var alive = r < consumers.length;
        var c = 'C' + (r + 1);
        ctx.setState('row-' + r, alive ? null : 'off');
        ctx.text('rowstate-' + r, alive ? (res.assign[c] ? res.assign[c].length + '개 담당' : '') : '없음');

        for (var p = 0; p < D040_PARTS; p++) {
          var key = 't0p' + p;
          var state = 'off', label = '';
          if (alive) {
            var held = hold && hold[key];
            var owner = res.owner[key];
            if (held) {
              if (prevOwner[key] === c) { state = 'error'; label = '회수'; }
            } else if (owner === c) {
              if (prevOwner[key] === c) { state = 'done'; label = '유지'; }
              else { state = 'active'; label = '신규'; }
            }
          }
          ctx.setState('cell-' + r + '-' + p, state);
          ctx.text('cellt-' + r + '-' + p, label);
        }
      }
      // 보류 중인 파티션은 컬럼 머리글에 표시
      for (var q = 0; q < D040_PARTS; q++) {
        var k2 = 't0p' + q;
        ctx.setState('col-' + q, hold && hold[k2] ? 'error' : null);
      }
    }

    function summarize(v, res, consumers, moving, round) {
      var kept = 0, added = 0;
      Object.keys(res.owner).forEach(function (k) {
        if (st.prev[k] === res.owner[k]) kept++; else added++;
      });
      ctx.text('strategy-label', res.meta.label + ' · ' +
        (res.meta.protocol === 'cooperative' ? 'cooperative 프로토콜 (증분 재할당)' : 'eager 프로토콜 (전체 회수)'));
      ctrl.readout([
        { label: '활성 컨슈머', value: consumers.length + '명' },
        { label: '파티션', value: D040_PARTS + '개' },
        { label: '소유자 유지', value: kept + '개' },
        { label: '소유자 변경', value: added + '개' },
        { label: '리밸런스 단계', value: round + '차' },
        { label: '중단된 파티션', value: (res.meta.protocol === 'cooperative' ? moving : D040_PARTS) + '개' }
      ]);
    }

    rebalance(ctrl.values(), '초기 상태');
  });

  /* ======================================================================
     D-046 — 파티션 할당 전략 4종 비교
     ---------------------------------------------------------------------
     SVG 훅 (k = 0..3 패널, r = 0..4 행)
       p{k}-title       패널 제목 <text>
       p{k}-row-{r}     행 <g>
       p{k}-name-{r}    컨슈머 이름 <text>
       p{k}-assign-{r}  할당 결과 <text>
       p{k}-summary     유지/이동 요약 <text>
       note             조건 설명 <text>
     ====================================================================== */
  var D046_ORDER = ['range', 'roundrobin', 'sticky', 'cooperative'];

  register('D-046', function (ctx) {
    var ctrl = ctx.bindControls({
      items: [
        { type: 'range', name: 'consumers', label: '컨슈머 수', min: 1, max: 5, step: 1, value: 3,
          format: function (v) { return v + '명'; } },
        { type: 'range', name: 'parts', label: '토픽당 파티션 수', min: 2, max: 8, step: 1, value: 8,
          format: function (v) { return v + '개'; } },
        { type: 'range', name: 'topics', label: '토픽 수', min: 1, max: 2, step: 1, value: 1,
          format: function (v) { return v + '개'; } },
        { type: 'toggle', name: 'afterLeave', label: '직전에 컨슈머 1명이 이탈한 상황', value: false },
        { type: 'reset', label: '기본값으로' }
      ],
      onChange: render
    });

    function names(n) {
      var out = [];
      for (var i = 0; i < n; i++) out.push('C' + (i + 1));
      return out;
    }
    function fmt(list) {
      if (!list || !list.length) return '(없음)';
      // 읽기 쉽도록 토픽 → 파티션 순으로 정렬해 표시합니다 (할당 순서 자체는 의미 없음)
      var s = list.slice().sort(function (a, b) { return a.t - b.t || a.p - b.p; })
        .map(function (pp) { return 't' + pp.t + 'p' + pp.p; });
      if (s.length > 7) return s.slice(0, 6).join(' ') + ' …+' + (s.length - 6);
      return s.join(' ');
    }

    function render(v) {
      var parts = makePartitions(v.topics, v.parts);
      var consumers = names(v.consumers);

      // 이탈 시나리오: 먼저 (N+1)명으로 배정한 결과를 이전 상태로 두고, 마지막 1명을 빼고 다시 배정
      var prevByStrategy = {};
      D046_ORDER.forEach(function (name) {
        if (!v.afterLeave) { prevByStrategy[name] = {}; return; }
        var before = runAssignor(name, names(v.consumers + 1), parts, {});
        var gone = 'C' + (v.consumers + 1);
        var prev = {};
        Object.keys(before.owner).forEach(function (k) {
          if (before.owner[k] !== gone) prev[k] = before.owner[k];
        });
        prevByStrategy[name] = prev;
      });

      var sameAsRR = true;
      var rrOwner = null;
      var readout = [];

      D046_ORDER.forEach(function (name, k) {
        var prev = prevByStrategy[name];
        var res = runAssignor(name, consumers, parts, prev);
        ctx.text('p' + k + '-title', res.meta.label);

        for (var r = 0; r < 5; r++) {
          var alive = r < consumers.length;
          ctx.setState('p' + k + '-row-' + r, alive ? null : 'hidden');
          ctx.text('p' + k + '-name-' + r, alive ? consumers[r] : '');
          ctx.text('p' + k + '-assign-' + r, alive ? fmt(res.assign[consumers[r]]) : '');
        }

        var kept = 0, moved = 0;
        Object.keys(res.owner).forEach(function (key) {
          if (!v.afterLeave) return;
          if (prev[key] && prev[key] === res.owner[key]) kept++;
          else if (prev[key]) moved++;
        });

        if (v.afterLeave) {
          ctx.text('p' + k + '-summary', '이탈 전 할당 유지 ' + kept + '개 · 이동 ' + moved + '개');
        } else {
          var sizes = consumers.map(function (c) { return res.assign[c].length; });
          ctx.text('p' + k + '-summary', '컨슈머별 담당: ' + sizes.join(' / ') + ' (총 ' + parts.length + '개)');
        }

        if (name === 'roundrobin') rrOwner = JSON.stringify(res.owner);
        if (name === 'sticky' && rrOwner !== null && JSON.stringify(res.owner) !== rrOwner) sameAsRR = false;
        readout.push({ label: res.meta.label.replace('Assignor', ''), value: v.afterLeave ? kept + '개 유지' : sizes0(res, consumers) });
      });

      function sizes0(res, cs) {
        return cs.map(function (c) { return res.assign[c].length; }).join('/');
      }

      var note;
      if (v.afterLeave) {
        note = '컨슈머 1명 이탈 후 재할당 — Sticky 계열만 이전 할당을 최대한 유지합니다. Range·RoundRobin 은 이전 할당을 보지 않습니다.';
      } else if (sameAsRR) {
        note = '이전 할당이 없는 첫 배정에서는 Sticky 결과가 RoundRobin 과 같습니다 — 차이는 재할당 때 드러납니다. 토글을 켜 보세요.';
      } else {
        note = '구독이 같고 파티션 수가 나뉘는 조건에서는 Sticky 가 RoundRobin 과 같은 균형 배분을 만듭니다.';
      }
      ctx.text('note', note);
      ctx.text('cond', '조건: 컨슈머 ' + v.consumers + '명 · 토픽 ' + v.topics + '개 × 파티션 ' + v.parts +
        '개 = 총 ' + parts.length + '개' + (v.afterLeave ? ' · 직전 1명 이탈' : ' · 첫 배정'));

      ctrl.readout(readout);
      ctrl.announce('CooperativeSticky 의 최종 할당은 Sticky 와 같습니다. 다른 것은 리밸런스 프로토콜입니다. ' + note);
    }

    render(ctrl.values());
  });

})(typeof window !== 'undefined' ? window : globalThis);
