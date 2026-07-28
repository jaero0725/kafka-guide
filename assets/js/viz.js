/* ==========================================================================
   Kafka Guide — 인터랙티브 다이어그램 프리미티브 (viz.js)
   --------------------------------------------------------------------------
   ★ V1–V3 시각화 에이전트 필독 ★

   왜 SVG 파일 안에 <script> 를 넣지 않는가
     · 인라인 삽입되면 같은 스크립트가 여러 번 실행될 수 있습니다.
     · Artifact/CSP 환경에서 인라인 스크립트가 차단됩니다.
     · CONTENT_STYLE_GUIDE 가 인라인 <script> 를 금지합니다.
   → 그래서 **로직은 이 파일에 id별로 등록**하고, SVG 는 마크업과 data-* 훅만 갖습니다.

   ┌───────────────────────────────────────────────────────────────────────┐
   │ 규약 1. SVG 안의 조작 대상은 id 가 아니라 data-dg 로 표시합니다.       │
   │   <rect data-dg="hw-marker" class="dg-node" …/>                       │
   │   inline-diagrams.mjs 가 id 에 접두어를 붙이므로 id 셀렉터는 깨집니다.│
   │                                                                       │
   │ 규약 2. 로직은 viz.js 하단 REGISTRY 섹션에 등록합니다.                │
   │   KG.viz.register('D-034', function (ctx) { … });                     │
   │                                                                       │
   │ 규약 3. JS 없이도 초기 상태가 의미를 전달해야 합니다                  │
   │   (progressive enhancement). SVG 만 봐도 다이어그램이 성립할 것.      │
   │                                                                       │
   │ 규약 4. 컨트롤은 ctx.bindControls 로만 만듭니다. 실제 <button>/<input>│
   │   이 생성되므로 키보드 조작이 보장됩니다. div+click 금지.             │
   └───────────────────────────────────────────────────────────────────────┘

   initFn(ctx) 의 ctx:
     ctx.id           'D-012'
     ctx.svg          <svg class="kg-diagram">           (DOM)
     ctx.figure       <figure class="diagram">           (DOM)
     ctx.q(name)      svg.querySelector('[data-dg="name"]')
     ctx.qa(name)     Array<Element>  (같은 data-dg 값 전부)
     ctx.qs(sel)      svg.querySelector(sel)   — 임의 CSS 셀렉터
     ctx.qsa(sel)     Array<Element>
     ctx.setState(target, state)     target: 이름 문자열 | 셀렉터 | Element | Element[]
     ctx.text(name, str)            <text data-dg="name"> 의 내용 교체
     ctx.attr(name, obj)            속성 일괄 설정
     ctx.move(name, x, y)           transform: translate(x,y)
     ctx.bindControls(spec)         → controls API (아래)
     ctx.animateAlong(pathName, opts)
     ctx.announce(text)             aria-live 안내
     ctx.readout(items)             .dg-readout 갱신  [{label, value}]
     ctx.reducedMotion              boolean
   ========================================================================== */
(function (global) {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var registry = Object.create(null);   // id → initFn
  var mounted = new (global.WeakSet || Set)();

  /* ---------- 유틸 -------------------------------------------------------- */
  function reducedMotion() {
    try {
      return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) { return false; }
  }
  function toArray(x) { return Array.prototype.slice.call(x || []); }
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function cssEscape(v) { return String(v).replace(/["\\]/g, '\\$&'); }

  /* ======================================================================
     공개 프리미티브 — setNodeState
     ---------------------------------------------------------------------
     노드에 data-state 를 부여합니다. 스타일링은 viz.css 가 담당합니다.
     state 어휘: on | off | active | done | error | pending | hidden | null(제거)
     ====================================================================== */
  function setNodeState(svg, selector, state) {
    if (!svg) return [];
    var nodes;
    if (typeof selector === 'string') {
      nodes = /^[\w-]+$/.test(selector)
        ? toArray(svg.querySelectorAll('[data-dg="' + cssEscape(selector) + '"]'))
        : toArray(svg.querySelectorAll(selector));
    } else if (selector && selector.nodeType === 1) {
      nodes = [selector];
    } else if (selector && selector.length != null) {
      nodes = toArray(selector);
    } else {
      nodes = [];
    }
    nodes.forEach(function (n) {
      if (state == null || state === false || state === '') n.removeAttribute('data-state');
      else n.setAttribute('data-state', String(state));
    });
    return nodes;
  }

  /* ======================================================================
     공개 프리미티브 — animateAlong
     ---------------------------------------------------------------------
     경로(path)를 따라 요소를 이동시킵니다.
     prefers-reduced-motion 이면 즉시 끝 지점으로 이동하고 onDone 을 호출합니다.

       ctx.animateAlong('flow-path', {
         el: 'packet',        // data-dg 이름 | 셀렉터 | Element
         duration: 700,       // ms
         from: 0, to: 1,      // 경로 비율
         onDone: fn
       })
     반환: { cancel() }
     ====================================================================== */
  function animateAlong(svg, pathSelector, opts) {
    opts = opts || {};
    var path = resolveOne(svg, pathSelector);
    var el = resolveOne(svg, opts.el);
    var noop = { cancel: function () {} };
    if (!path || !el || typeof path.getTotalLength !== 'function') return noop;

    var total;
    try { total = path.getTotalLength(); } catch (e) { return noop; }
    if (!total) return noop;

    var from = typeof opts.from === 'number' ? clamp(opts.from, 0, 1) : 0;
    var to = typeof opts.to === 'number' ? clamp(opts.to, 0, 1) : 1;
    var dur = Math.max(0, typeof opts.duration === 'number' ? opts.duration : 600);

    function place(t) {
      var p;
      try { p = path.getPointAtLength(total * t); } catch (e) { return; }
      el.setAttribute('transform', 'translate(' + p.x.toFixed(2) + ',' + p.y.toFixed(2) + ')');
    }

    if (dur === 0 || reducedMotion()) {
      place(to);
      if (typeof opts.onDone === 'function') opts.onDone();
      return noop;
    }

    var start = null, raf = 0, cancelled = false;
    function step(ts) {
      if (cancelled) return;
      if (start === null) start = ts;
      var k = clamp((ts - start) / dur, 0, 1);
      // easeInOutQuad
      var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      place(from + (to - from) * e);
      if (k < 1) raf = global.requestAnimationFrame(step);
      else if (typeof opts.onDone === 'function') opts.onDone();
    }
    place(from);
    raf = global.requestAnimationFrame(step);
    return {
      cancel: function () { cancelled = true; if (raf) global.cancelAnimationFrame(raf); }
    };
  }

  function resolveOne(svg, sel) {
    if (!sel) return null;
    if (sel.nodeType === 1) return sel;
    if (typeof sel !== 'string') return null;
    if (/^[\w-]+$/.test(sel)) {
      return svg.querySelector('[data-dg="' + cssEscape(sel) + '"]') || svg.querySelector(sel);
    }
    return svg.querySelector(sel);
  }

  /* ======================================================================
     공개 프리미티브 — announce (aria-live)
     ====================================================================== */
  function liveRegion(container) {
    if (!container) return null;
    var live = container.querySelector('.dg-live');
    if (!live) {
      live = global.document.createElement('p');
      live.className = 'dg-live';
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      container.appendChild(live);
    }
    return live;
  }
  function announce(container, text) {
    var live = liveRegion(container);
    if (live) live.textContent = text == null ? '' : String(text);
    return live;
  }

  /* ======================================================================
     공개 프리미티브 — bindControls
     ---------------------------------------------------------------------
     실제 <button>/<input>/<select> 만 생성합니다 (키보드 접근 보장).

       var api = bindControls(figure, {
         onChange: function (values, api, meta) { … },
         items: [
           { type:'range',  name:'consumer', label:'컨슈머 진행',
             min:0, max:12, step:1, value:5, format:function(v){return v+' 번';} },
           { type:'select', name:'strategy', label:'할당 전략',
             options:[{value:'range',label:'Range'},…], value:'range' },
           { type:'toggle', name:'compact', label:'컴팩션 켜기', value:false },
           { type:'button', name:'send',    label:'메시지 1건 전송' },
           { type:'reset',  label:'초기화' }
         ]
       });

     api.values()          현재 값 객체
     api.get(name) / api.set(name, v [, silent])
     api.reset()
     api.el                .dg-controls 요소
     api.announce(text)
     api.readout(items)
     ====================================================================== */
  function bindControls(container, spec) {
    spec = spec || {};
    var doc = global.document;
    var items = spec.items || [];
    var values = Object.create(null);
    var defaults = Object.create(null);
    var inputs = Object.create(null);
    var valueLabels = Object.create(null);

    var wrap = doc.createElement('div');
    wrap.className = 'dg-controls';

    var api = {
      el: wrap,
      values: function () {
        var out = {};
        for (var k in values) if (Object.prototype.hasOwnProperty.call(values, k)) out[k] = values[k];
        return out;
      },
      get: function (name) { return values[name]; },
      set: function (name, v, silent) {
        if (!(name in inputs)) { values[name] = v; return api; }
        var input = inputs[name];
        if (input.type === 'checkbox') input.checked = !!v;
        else input.value = String(v);
        syncFrom(name, silent !== false ? true : false);
        return api;
      },
      reset: function () {
        for (var k in defaults) {
          if (!Object.prototype.hasOwnProperty.call(defaults, k)) continue;
          if (inputs[k]) {
            if (inputs[k].type === 'checkbox') inputs[k].checked = !!defaults[k];
            else inputs[k].value = String(defaults[k]);
          }
          values[k] = defaults[k];
          updateLabel(k);
        }
        fire({ name: '__reset__', type: 'reset' });
        return api;
      },
      announce: function (t) { return announce(container, t); },
      readout: function (list) { return renderReadout(container, list); }
    };

    function coerce(item, raw) {
      if (item.type === 'range' || item.type === 'number') {
        var n = parseFloat(raw);
        return isNaN(n) ? (item.value || 0) : n;
      }
      if (item.type === 'toggle') return !!raw;
      return raw;
    }
    function updateLabel(name) {
      var lab = valueLabels[name];
      if (!lab) return;
      var item = lab.__item;
      var v = values[name];
      lab.textContent = typeof item.format === 'function' ? item.format(v) : String(v);
    }
    function syncFrom(name, silent) {
      var item = inputs[name].__item;
      var raw = inputs[name].type === 'checkbox' ? inputs[name].checked : inputs[name].value;
      values[name] = coerce(item, raw);
      updateLabel(name);
      if (!silent) fire({ name: name, type: item.type });
    }
    function fire(meta) {
      if (typeof spec.onChange === 'function') {
        try { spec.onChange(api.values(), api, meta || {}); } catch (e) {
          if (global.console) console.error('[viz] onChange 실패', e);
        }
      }
    }

    items.forEach(function (item, idx) {
      var name = item.name || ('c' + idx);
      var group = doc.createElement('div');
      group.className = 'dg-controls__group';

      if (item.type === 'button' || item.type === 'reset') {
        var btn = doc.createElement('button');
        btn.type = 'button';
        btn.className = 'dg-btn' + (item.variant === 'primary' ? ' dg-btn--primary' : '');
        btn.textContent = item.label || (item.type === 'reset' ? '초기화' : name);
        if (item.title) btn.title = item.title;
        btn.addEventListener('click', function () {
          if (item.type === 'reset') { api.reset(); return; }
          if (typeof item.onClick === 'function') {
            try { item.onClick(api.values(), api); } catch (e) {
              if (global.console) console.error('[viz] onClick 실패', e);
            }
          }
          fire({ name: name, type: 'button' });
        });
        group.appendChild(btn);
        inputs[name] = btn;
        btn.__item = item;
        wrap.appendChild(group);
        return;
      }

      if (item.type === 'toggle') {
        var lw = doc.createElement('label');
        lw.className = 'dg-controls__row';
        var cb = doc.createElement('input');
        cb.type = 'checkbox';
        cb.checked = !!item.value;
        var span = doc.createElement('span');
        span.className = 'dg-controls__label';
        span.textContent = item.label || name;
        lw.appendChild(cb);
        lw.appendChild(span);
        group.appendChild(lw);
        inputs[name] = cb; cb.__item = item;
        defaults[name] = !!item.value;
        values[name] = !!item.value;
        cb.addEventListener('change', function () { syncFrom(name, false); });
        wrap.appendChild(group);
        return;
      }

      if (item.type === 'select') {
        var sid = 'dgc-' + Math.random().toString(36).slice(2, 8);
        var slab = doc.createElement('label');
        slab.className = 'dg-controls__label';
        slab.textContent = item.label || name;
        slab.setAttribute('for', sid);
        var sel = doc.createElement('select');
        sel.id = sid;
        sel.className = 'dg-select';
        (item.options || []).forEach(function (o) {
          var opt = doc.createElement('option');
          var val = (o && typeof o === 'object') ? o.value : o;
          opt.value = String(val);
          opt.textContent = (o && typeof o === 'object') ? (o.label || String(val)) : String(val);
          sel.appendChild(opt);
        });
        if (item.value != null) sel.value = String(item.value);
        group.appendChild(slab);
        group.appendChild(sel);
        inputs[name] = sel; sel.__item = item;
        defaults[name] = sel.value;
        values[name] = sel.value;
        sel.addEventListener('change', function () { syncFrom(name, false); });
        wrap.appendChild(group);
        return;
      }

      // range / number
      var rid = 'dgc-' + Math.random().toString(36).slice(2, 8);
      var rlab = doc.createElement('label');
      rlab.className = 'dg-controls__label';
      rlab.textContent = item.label || name;
      rlab.setAttribute('for', rid);

      var row = doc.createElement('div');
      row.className = 'dg-controls__row';
      var input = doc.createElement('input');
      input.type = item.type === 'number' ? 'number' : 'range';
      input.id = rid;
      input.className = item.type === 'number' ? '' : 'dg-slider';
      if (item.min != null) input.min = String(item.min);
      if (item.max != null) input.max = String(item.max);
      if (item.step != null) input.step = String(item.step);
      input.value = String(item.value != null ? item.value : (item.min != null ? item.min : 0));
      if (item.ariaLabel) input.setAttribute('aria-label', item.ariaLabel);

      var vlab = doc.createElement('output');
      vlab.className = 'dg-slider__value';
      vlab.setAttribute('for', rid);
      vlab.__item = item;

      row.appendChild(input);
      row.appendChild(vlab);
      group.appendChild(rlab);
      group.appendChild(row);

      inputs[name] = input; input.__item = item;
      valueLabels[name] = vlab;
      defaults[name] = coerce(item, input.value);
      values[name] = defaults[name];
      updateLabel(name);

      input.addEventListener('input', function () { syncFrom(name, false); });
      wrap.appendChild(group);
    });

    if (container) {
      // .dg-controls 는 figcaption 앞에 넣습니다 (캡션이 항상 마지막).
      var cap = container.querySelector(':scope > figcaption');
      if (cap) container.insertBefore(wrap, cap);
      else container.appendChild(wrap);
      liveRegion(container);
      if (cap && container.querySelector('.dg-live')) {
        container.insertBefore(container.querySelector('.dg-live'), cap);
      }
    }
    return api;
  }

  function renderReadout(container, list) {
    if (!container) return null;
    var doc = global.document;
    var el = container.querySelector('.dg-readout');
    if (!el) {
      el = doc.createElement('div');
      el.className = 'dg-readout';
      var ctrls = container.querySelector('.dg-controls');
      if (ctrls && ctrls.parentNode === container) container.insertBefore(el, ctrls);
      else {
        var cap = container.querySelector(':scope > figcaption');
        if (cap) container.insertBefore(el, cap); else container.appendChild(el);
      }
    }
    el.innerHTML = (list || []).map(function (it) {
      return '<span>' + esc(it.label) + ' <b>' + esc(it.value) + '</b></span>';
    }).join('');
    return el;
  }

  /* ======================================================================
     등록 · 마운트
     ====================================================================== */
  /**
   * 인터랙티브 다이어그램 초기화 함수 등록.
   * @param {string} id      다이어그램 ID ('D-012')
   * @param {(ctx:object)=>void} initFn
   */
  function register(id, initFn) {
    if (!id || typeof initFn !== 'function') return false;
    registry[String(id).toUpperCase()] = initFn;
    return true;
  }
  function has(id) { return !!registry[String(id || '').toUpperCase()]; }

  function makeCtx(figure, svg, id) {
    var ctx = {
      id: id,
      figure: figure,
      svg: svg,
      reducedMotion: reducedMotion(),
      q: function (name) { return svg.querySelector('[data-dg="' + cssEscape(name) + '"]'); },
      qa: function (name) { return toArray(svg.querySelectorAll('[data-dg="' + cssEscape(name) + '"]')); },
      qs: function (sel) { return svg.querySelector(sel); },
      qsa: function (sel) { return toArray(svg.querySelectorAll(sel)); },
      setState: function (target, state) { return setNodeState(svg, target, state); },
      text: function (name, value) {
        var n = ctx.q(name);
        if (n) n.textContent = value == null ? '' : String(value);
        return n;
      },
      attr: function (name, obj) {
        var nodes = ctx.qa(name);
        nodes.forEach(function (n) {
          for (var k in obj) {
            if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
            if (obj[k] == null) n.removeAttribute(k);
            else n.setAttribute(k, String(obj[k]));
          }
        });
        return nodes;
      },
      move: function (name, x, y) {
        return ctx.attr(name, { transform: 'translate(' + x + ',' + (y || 0) + ')' });
      },
      animateAlong: function (pathSel, opts) { return animateAlong(svg, pathSel, opts); },
      bindControls: function (spec) { return bindControls(figure, spec); },
      announce: function (text) { return announce(figure, text); },
      readout: function (list) { return renderReadout(figure, list); },
      svgEl: function (tag, attrs) {
        var n = global.document.createElementNS(SVG_NS, tag);
        for (var k in (attrs || {})) {
          if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, String(attrs[k]));
        }
        return n;
      }
    };
    return ctx;
  }

  /**
   * figure 안의 인라인 SVG 에 대해 등록된 초기화 함수를 실행합니다.
   * app.js 가 SVG 를 fetch 주입한 직후, 그리고 정적 인라인된 페이지의 DOMContentLoaded 에
   * 호출됩니다. 같은 figure 를 두 번 초기화하지 않습니다.
   */
  function mount(figure) {
    if (!figure || figure.dataset.vizInit === '1') return false;
    var id = (figure.getAttribute('data-diagram') || '').toUpperCase();
    var svg = figure.querySelector('svg');
    if (!svg) return false;
    svg.classList.add('kg-diagram');
    figure.dataset.vizInit = '1';
    var fn = registry[id];
    if (!fn) return false;
    try {
      fn(makeCtx(figure, svg, id));
      return true;
    } catch (e) {
      if (global.console) console.error('[viz] ' + id + ' 초기화 실패', e);
      return false;
    }
  }

  function mountAll(root) {
    var scope = root || global.document;
    if (!scope || !scope.querySelectorAll) return 0;
    var figs = toArray(scope.querySelectorAll('figure.diagram[data-diagram]'));
    var n = 0;
    figs.forEach(function (f) { if (f.querySelector('svg') && mount(f)) n++; });
    return n;
  }

  /* ---------- 공개 -------------------------------------------------------- */
  var api = {
    register: register,
    registerViz: register,   // 명세상의 이름 (별칭)
    has: has,
    mount: mount,
    mountAll: mountAll,
    setNodeState: setNodeState,
    animateAlong: animateAlong,
    bindControls: bindControls,
    announce: announce,
    reducedMotion: reducedMotion,
    SVG_NS: SVG_NS,
    _registry: registry
  };
  global.KG = global.KG || {};
  global.KG.viz = api;
  // 전역 단축 — 명세의 registerViz(id, initFn) 형태를 그대로 지원
  global.registerViz = register;

  /* ==========================================================================
     ────────────────────────── REGISTRY ──────────────────────────
     인터랙티브 다이어그램 로직을 여기에 등록합니다.
     카탈로그의 인터랙티브 8종:
       D-012 오프셋 4종 (Wave 0 구현 — 아래)
       D-034 키 있음/없음 파티셔닝        (V1)
       D-040 리밸런스 시뮬레이터          (V1)
       D-046 파티션 할당 전략 4종 비교    (V1)
       D-062 컴팩션 before/after          (V2)
       D-064 디스크 산정 계산기           (V2)
       D-072 호환성 모드 매트릭스         (V2)
       D-133 설정값 관계도                (V3)
     ========================================================================== */

  /* --------------------------------------------------------------------------
     D-012 — 오프셋 4종 구분 (레퍼런스 구현)
     --------------------------------------------------------------------------
     SVG(assets/diagrams/D-012-offset-anatomy.svg)가 제공해야 하는 data-dg 훅:
       cell-0 … cell-11         레코드 칸 <rect> (12개)
       marker-lso               log-start-offset 마커 <g>
       marker-committed         committed offset 마커 <g>
       marker-hw                high watermark 마커 <g>
       marker-leo               LEO 마커 <g>
       val-lso|val-committed|val-hw|val-leo    각 마커의 숫자 <text>
       span-unread              "아직 안 읽음" 구간 <rect>
       span-unreplicated        "아직 복제 안 됨" 구간 <rect>
       label-unread             구간 레이블 <text>
       label-unreplicated       구간 레이블 <text>
       follower-bar-b / follower-bar-c   팔로워 복제 진행 막대 <rect>
       follower-val-b / follower-val-c   팔로워 LEO 숫자 <text>
       note-hw                  HW 결정 근거 설명 <text>
     기하 상수는 SVG 와 동일해야 합니다 (X0 / CELL_W / N).
     -------------------------------------------------------------------------- */
  register('D-012', function (ctx) {
    var X0 = 96;        // 첫 칸 왼쪽 x  (SVG 와 일치해야 함)
    var CELL_W = 40;    // 칸 폭
    var N = 12;         // 칸 개수 → 오프셋 0..11, LEO 최대 12

    function x(off) { return X0 + CELL_W * off; }

    var ctrl = ctx.bindControls({
      items: [
        { type: 'range', name: 'leader', label: '리더 LEO (기록된 레코드 수)',
          min: 4, max: N, step: 1, value: 12,
          format: function (v) { return 'LEO ' + v; } },
        { type: 'range', name: 'followerB', label: '팔로워 B 복제 진행',
          min: 0, max: N, step: 1, value: 9,
          format: function (v) { return v + ' / ' + N; } },
        { type: 'range', name: 'followerC', label: '팔로워 C 복제 진행',
          min: 0, max: N, step: 1, value: 7,
          format: function (v) { return v + ' / ' + N; } },
        { type: 'range', name: 'consumer', label: '컨슈머 커밋 오프셋',
          min: 0, max: N, step: 1, value: 4,
          format: function (v) { return v === 0 ? '없음(0)' : String(v); } },
        { type: 'range', name: 'start', label: 'log-start-offset (리텐션 삭제)',
          min: 0, max: 6, step: 1, value: 0,
          format: function (v) { return String(v); } },
        { type: 'reset', label: '기본값으로' }
      ],
      onChange: apply
    });

    function apply(v) {
      var leader = v.leader;
      var start = Math.min(v.start, leader);
      var fB = Math.min(v.followerB, leader);
      var fC = Math.min(v.followerC, leader);
      // High watermark = ISR 내 최소 LEO. 리더·팔로워 B·C 중 최소.
      var hw = Math.min(leader, fB, fC);
      // 컨슈머는 HW 를 넘어서 읽을 수 없습니다.
      var committed = clamp(v.consumer, start, hw);

      // 컨트롤 값 보정 (슬라이더끼리 모순되지 않게)
      if (v.start !== start) ctrl.set('start', start);
      if (v.followerB !== fB) ctrl.set('followerB', fB);
      if (v.followerC !== fC) ctrl.set('followerC', fC);
      if (v.consumer !== committed) ctrl.set('consumer', committed);

      // ── 칸 상태 ──
      for (var i = 0; i < N; i++) {
        var cell = ctx.q('cell-' + i);
        if (!cell) continue;
        var st;
        if (i < start) st = 'hidden';              // 리텐션으로 삭제됨
        else if (i >= leader) st = 'off';          // 아직 기록되지 않음
        else if (i < committed) st = 'done';       // 읽고 커밋 완료
        else if (i < hw) st = 'on';               // 읽을 수 있음(아직 안 읽음)
        else st = 'pending';                       // 복제 미완 → 컨슈머에게 안 보임
        cell.setAttribute('data-state', st);
      }

      // ── 마커 위치 ──
      ctx.move('marker-lso', x(start), 0);
      ctx.move('marker-committed', x(committed), 0);
      ctx.move('marker-hw', x(hw), 0);
      ctx.move('marker-leo', x(leader), 0);
      ctx.text('val-lso', start);
      ctx.text('val-committed', committed);
      ctx.text('val-hw', hw);
      ctx.text('val-leo', leader);

      // ── 구간 막대 ──
      setSpan('span-unread', 'label-unread', committed, hw,
        '아직 안 읽음 ' + (hw - committed) + '건');
      setSpan('span-unreplicated', 'label-unreplicated', hw, leader,
        '아직 복제 안 됨 ' + (leader - hw) + '건');

      // ── 팔로워 막대 ──
      setFollower('follower-bar-b', 'follower-val-b', fB);
      setFollower('follower-bar-c', 'follower-val-c', fC);

      // ── HW 결정 근거 ──
      var who = (hw === leader) ? '리더' : (fB <= fC ? '팔로워 B' : '팔로워 C');
      ctx.text('note-hw', 'high watermark = ISR 내 최소 LEO → ' + who + '(' + hw + ')');

      ctx.readout([
        { label: 'log-start-offset', value: start },
        { label: 'committed offset', value: committed },
        { label: 'high watermark', value: hw },
        { label: 'LEO', value: leader },
        { label: '컨슈머 lag', value: (hw - committed) + '건' }
      ]);

      ctrl.announce(
        'log-start-offset ' + start + ', 커밋 오프셋 ' + committed +
        ', high watermark ' + hw + ', LEO ' + leader + '. ' +
        '컨슈머가 읽을 수 있는 구간은 ' + committed + '부터 ' + hw + ' 앞까지 ' +
        (hw - committed) + '건이고, ' + (leader - hw) + '건은 복제가 끝나지 않아 보이지 않습니다.'
      );
    }

    function setSpan(barName, labelName, from, to, text) {
      var bar = ctx.q(barName);
      var w = Math.max(0, (to - from) * CELL_W);
      if (bar) {
        bar.setAttribute('x', String(x(from)));
        bar.setAttribute('width', String(w));
        bar.setAttribute('data-state', w === 0 ? 'hidden' : '');
        if (w === 0) bar.setAttribute('data-state', 'hidden');
        else bar.removeAttribute('data-state');
      }
      var lab = ctx.q(labelName);
      if (lab) {
        lab.setAttribute('x', String(x(from) + w / 2));
        lab.textContent = w === 0 ? '' : text;
      }
    }
    function setFollower(barName, valName, v) {
      var bar = ctx.q(barName);
      if (bar) bar.setAttribute('width', String(Math.max(0, v * CELL_W)));
      var lab = ctx.q(valName);
      if (lab) {
        lab.setAttribute('x', String(x(v) + 6));
        lab.textContent = 'LEO ' + v;
      }
    }

    apply(ctrl.values());
  });

  /* --------------------------------------------------------------------------
     D-133 — 설정값 관계도 (V3)
     --------------------------------------------------------------------------
     SVG(assets/diagrams/D-133-ccdak-config-graph.svg)가 제공하는 훅:
       data-dg="n-{slug}"  설정 노드 <g>  (+ data-n 설정명 / data-o 소속 / data-v 기본값)
       data-dg="edge"      간선 <g>       (+ data-a / data-b — 양 끝 노드의 slug)
     인접 관계는 DOM 의 간선에서 읽으므로 JS 쪽에 관계를 중복 정의하지 않는다.
     -------------------------------------------------------------------------- */
  register('D-133', function (ctx) {
    var nodes = ctx.qsa('[data-dg^="n-"]');
    var edges = ctx.qsa('[data-dg="edge"]');
    if (!nodes.length) return;

    var slugOf = function (n) { return (n.getAttribute('data-dg') || '').slice(2); };
    var nameOf = function (n) { return n.getAttribute('data-n') || slugOf(n); };
    var byId = Object.create(null);
    nodes.forEach(function (n) { byId[slugOf(n)] = n; });

    var adj = Object.create(null);
    edges.forEach(function (e) {
      var a = e.getAttribute('data-a'), b = e.getAttribute('data-b');
      if (!a || !b) return;
      (adj[a] || (adj[a] = [])).push(b);
      (adj[b] || (adj[b] = [])).push(a);
    });

    var options = [{ value: '', label: '전체 보기 (강조 없음)' }];
    nodes.forEach(function (n) { options.push({ value: slugOf(n), label: nameOf(n) }); });

    var ctrl = ctx.bindControls({
      items: [
        { type: 'select', name: 'sel', label: '설정 고르기 (연관 설정만 강조)',
          options: options, value: '' },
        { type: 'reset', label: '전체 보기' }
      ],
      onChange: function (v) { apply(v.sel); }
    });

    function clear() {
      nodes.forEach(function (n) { n.removeAttribute('data-state'); });
      edges.forEach(function (e) { e.removeAttribute('data-state'); });
      ctx.readout([{ label: '선택', value: '없음 — 23개 설정 전체' },
                   { label: '간선', value: edges.length + '개' }]);
      ctrl.announce('강조를 해제했습니다. 설정 ' + nodes.length + '개와 관계 ' +
                    edges.length + '개가 모두 보입니다.');
    }

    function apply(slug) {
      if (!slug || !byId[slug]) { clear(); return; }
      var rel = adj[slug] || [];
      nodes.forEach(function (n) {
        var s = slugOf(n);
        if (s === slug) n.setAttribute('data-state', 'active');
        else if (rel.indexOf(s) >= 0) n.removeAttribute('data-state');
        else n.setAttribute('data-state', 'off');
      });
      edges.forEach(function (e) {
        var on = e.getAttribute('data-a') === slug || e.getAttribute('data-b') === slug;
        e.setAttribute('data-state', on ? 'active' : 'off');
      });
      var el = byId[slug];
      var relNames = rel.map(function (s) { return byId[s] ? nameOf(byId[s]) : s; });
      ctx.readout([
        { label: '선택', value: nameOf(el) },
        { label: '소속', value: el.getAttribute('data-o') || '—' },
        { label: '기본값', value: el.getAttribute('data-v') || '—' },
        { label: '직접 연결', value: rel.length + '개' }
      ]);
      ctrl.announce(nameOf(el) + ' 은 ' + (el.getAttribute('data-o') || '') +
        ' 설정이고 기본값은 ' + (el.getAttribute('data-v') || '') + ' 입니다. 직접 연결된 설정: ' +
        (relNames.length ? relNames.join(', ') : '없음'));
    }

    /* 노드를 마우스·키보드 양쪽에서 고를 수 있게 한다.
       (JS 가 없으면 tabindex 가 붙지 않아 헛도는 포커스가 생기지 않는다) */
    nodes.forEach(function (n) {
      var slug = slugOf(n);
      n.setAttribute('tabindex', '0');
      n.setAttribute('role', 'button');
      n.setAttribute('aria-label', nameOf(n) + ' — 연관 설정만 강조');
      n.style.cursor = 'pointer';
      var pick = function () {
        var cur = ctrl.get('sel') === slug ? '' : slug;
        ctrl.set('sel', cur);
        apply(cur);
      };
      n.addEventListener('click', pick);
      n.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
          ev.preventDefault();
          pick();
        }
      });
    });

    clear();
  });

  /* ---------- 자동 마운트 ------------------------------------------------- */
  if (global.document) {
    var boot = function () { mountAll(global.document); };
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
