/* ==========================================
   노출 계산기 — script.js  (전면 재작성)
   ========================================== */

// ── 1. 데이터 ──

const SHUTTERS = [
  { label: '30"',    val: 30      },
  { label: '15"',    val: 15      },
  { label: '8"',     val: 8       },
  { label: '4"',     val: 4       },
  { label: '2"',     val: 2       },
  { label: '1"',     val: 1       },
  { label: '1/2',    val: 0.5     },
  { label: '1/4',    val: 0.25    },
  { label: '1/8',    val: 0.125   },
  { label: '1/15',   val: 1/15    },
  { label: '1/30',   val: 1/30    },
  { label: '1/60',   val: 1/60    },
  { label: '1/125',  val: 1/125   },
  { label: '1/250',  val: 1/250   },
  { label: '1/500',  val: 1/500   },
  { label: '1/1000', val: 1/1000  },
  { label: '1/2000', val: 1/2000  },
  { label: '1/4000', val: 1/4000  },
  { label: '1/8000', val: 1/8000  },
];

const APERTURES = [
  { label: 'f/1',   val: 1    },
  { label: 'f/1.4', val: 1.4  },
  { label: 'f/2',   val: 2    },
  { label: 'f/2.8', val: 2.8  },
  { label: 'f/4',   val: 4    },
  { label: 'f/5.6', val: 5.6  },
  { label: 'f/8',   val: 8    },
  { label: 'f/11',  val: 11   },
  { label: 'f/16',  val: 16   },
  { label: 'f/22',  val: 22   },
  { label: 'f/32',  val: 32   },
];

const ISOS = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200];

const EV_SITUATIONS = [
  { max: 1,  text: '🌑 완전한 어둠 — 장노출 필수',        status: '매우 어두움' },
  { max: 4,  text: '🌃 야간 거리 / 촛불 환경',            status: '어두운 환경' },
  { max: 7,  text: '🌆 야경, 실내 저조도',                status: '저조도'      },
  { max: 10, text: '💡 실내 밝은 조명 / 흐린 야외',       status: '실내 환경'   },
  { max: 13, text: '⛅ 맑은 날 그늘 / 흐린 날 야외',      status: '일반 야외'   },
  { max: 16, text: '☀️ 맑은 날 직사광선 야외',            status: '밝은 야외'   },
  { max: 20, text: '🏔 설원 / 해변 직사광선',             status: '매우 밝음'   },
];

const PRESETS = {
  sunny:    { shutter: 13, aperture: 5, iso: 1 },
  indoor:   { shutter: 10, aperture: 4, iso: 3 },
  night:    { shutter: 4,  aperture: 2, iso: 5 },
  portrait: { shutter: 12, aperture: 1, iso: 2 },
  sport:    { shutter: 15, aperture: 4, iso: 3 },
};

// ── 2. 상태 ──
let locks = { shutter: true, aperture: true, iso: false };
let idx   = { shutter: 12, aperture: 5, iso: 3 };

// ── 3. EV 계산 ──
function calcEV(s, a, i) {
  return Math.log2((a * a) / s) - Math.log2(i / 100);
}

// ── 4. UI 업데이트 ──
function updateUI() {
  document.getElementById('sl-shutter').value  = idx.shutter;
  document.getElementById('sl-aperture').value = idx.aperture;
  document.getElementById('sl-iso').value      = idx.iso;

  document.getElementById('val-shutter').textContent  = SHUTTERS[idx.shutter].label;
  document.getElementById('val-aperture').textContent = APERTURES[idx.aperture].label;
  document.getElementById('val-iso').textContent      = 'ISO ' + ISOS[idx.iso].toLocaleString();

  ['shutter', 'aperture', 'iso'].forEach(k => {
    const panel  = document.getElementById('panel-' + k);
    const btn    = document.getElementById('lock-' + k);
    const slider = document.getElementById('sl-' + k);
    if (locks[k]) {
      panel.classList.remove('locked');
      btn.classList.add('active');
      btn.textContent = '🔒';
      slider.disabled = false;
    } else {
      panel.classList.add('locked');
      btn.classList.remove('active');
      btn.textContent = '🔓';
      slider.disabled = true;
    }
  });

  const ev  = calcEV(SHUTTERS[idx.shutter].val, APERTURES[idx.aperture].val, ISOS[idx.iso]);
  const pct = Math.min(100, Math.max(0, (ev / 20) * 100));

  document.getElementById('ev-display').textContent = ev.toFixed(1);
  document.getElementById('ev-fill').style.width    = pct + '%';
  document.getElementById('ev-marker').style.left   = pct + '%';

  const sit = EV_SITUATIONS.find(s => ev <= s.max) || EV_SITUATIONS[EV_SITUATIONS.length - 1];
  document.getElementById('ev-situation').textContent = sit.text;
  document.getElementById('ev-status').textContent    = sit.status;

  updateCombos(ev);
  updateJudge(ev);
  updateMobileUI(ev);
}

// ── 5. 조합 테이블 ──
function updateCombos(ev) {
  const tbody   = document.getElementById('combo-tbody');
  const selISOs = [100, 400, 1600, 6400];
  const selAps  = [1.4, 2.8, 5.6, 8, 16];
  const combos  = [];

  selISOs.forEach(iso => {
    selAps.forEach(ap => {
      const t = (ap * ap) / Math.pow(2, ev + Math.log2(iso / 100));
      if (t < 0.00005 || t > 60) return;
      const si = SHUTTERS.reduce((b, s, i) =>
        Math.abs(s.val - t) < Math.abs(SHUTTERS[b].val - t) ? i : b, 0);
      let tag = '';
      if      (t >= 1/30)   tag = '<span class="tag tag-motion">모션블러</span>';
      else if (t <= 1/1000) tag = '<span class="tag tag-freeze">순간포착</span>';
      else if (ap <= 2.8)   tag = '<span class="tag tag-portrait">아웃포커싱</span>';
      else if (ap >= 11)    tag = '<span class="tag tag-landscape">풍경</span>';
      combos.push({ shutter: SHUTTERS[si].label, aperture: 'f/' + ap, iso: iso.toLocaleString(), tag });
    });
  });

  const seen = new Set();
  const filtered = combos.filter(c => {
    const key = c.shutter + c.aperture + c.iso;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).slice(0, 8);

  const cS = SHUTTERS[idx.shutter].label;
  const cA = APERTURES[idx.aperture].label;
  const cI = ISOS[idx.iso].toLocaleString();

  tbody.innerHTML = filtered.map(c => {
    const active = c.shutter === cS && c.aperture === cA && c.iso === cI;
    return `<tr class="${active ? 'active-row' : ''}">
      <td>${c.shutter}</td><td>${c.aperture}</td><td>ISO ${c.iso}</td><td>${c.tag || '—'}</td>
    </tr>`;
  }).join('');
}

// ── 6. 노출 판정 ──
function updateJudge(ev) {
  const sVal = SHUTTERS[idx.shutter].val;
  const iVal = ISOS[idx.iso];
  const aVal = APERTURES[idx.aperture].val;

  let icon, title, desc, envText, panelClass;

  if (ev < 2) {
    // 블로그 별사진 예시: F/16, 30s, ISO 3200 → EV ≈ -2
    icon = '🌑'; panelClass = 'judge-level-under2';
    title   = '노출이 심각하게 부족해요';
    desc    = '별 사진이나 완전 암흑 촬영처럼 극단적인 장노출 상황 외에는 사진이 거의 검게 나와요. 조리개를 최대로 열고, 셔터를 길게 하고, ISO를 높여야 해요.';
    envText = '별 사진(천문 촬영), 완전한 암실 등 빛이 거의 없는 특수 환경 전용 세팅이에요.';
  } else if (ev < 5) {
    // 블로그 야간 시장 예시: F/4.5, 1/10s, ISO 1600 → EV ≈ 3.7
    icon = '🌃'; panelClass = 'judge-level-under1';
    title   = '야간·저조도 환경에서만 적합한 노출이에요';
    desc    = '조명이 있는 야간 거리나 어두운 실내에서는 맞는 세팅이에요. 일반 실내나 낮 야외에서는 사진이 어둡게 나와요.';
    envText = '야간 거리, 야시장, 무드등·촛불 조명 카페 등 어두운 환경에 맞는 세팅이에요.';
  } else if (ev < 8) {
    icon = '💡'; panelClass = 'judge-level-ok';
    title   = '어두운 실내 촬영에 적합한 노출이에요';
    desc    = '카페, 식당처럼 조명이 있는 실내 환경에서 좋은 사진을 얻을 수 있어요. 맑은 야외에서는 사진이 하얗게 날아갈 수 있어요.';
    envText = '일반 실내 조명, 흐린 날 야외, 그늘진 환경에 잘 맞는 세팅이에요.';
  } else if (ev < 12) {
    icon = '✓'; panelClass = 'judge-level-ok';
    title   = '적정 노출이에요';
    desc    = '흐린 날이나 그늘진 야외, 밝은 실내 환경에 딱 맞는 조합이에요. 대부분의 일상 촬영에서 좋은 결과를 기대할 수 있어요.';
    envText = '밝은 실내, 흐린 날 야외, 그늘진 공간에서 좋은 사진을 얻을 수 있어요.';
  } else if (ev < 16) {
    // 블로그 예시: F/10, 1/1000s, ISO 100(추정) → EV ≈ 16.6 (맑은 야외)
    icon = '☀️'; panelClass = 'judge-level-ok';
    title   = '맑은 야외 촬영에 적합한 노출이에요';
    desc    = '맑은 날 직사광선 야외 촬영에 잘 맞는 조합이에요. (Sunny 16 법칙: 맑은 날 ISO 100 기준 f/16, 1/100s가 기준이에요.) 실내에서 이 세팅을 쓰면 사진이 밝게 날아가요.';
    envText = '맑은 날 야외, 직사광선 아래 공원·해변·운동장 등에서 최적인 세팅이에요.';
  } else if (ev < 18) {
    // 블로그 예시: F/7.1, 1/400s → 하늘이 날아가는 과노출
    icon = '⚡'; panelClass = 'judge-level-over1';
    title   = '대부분 환경에서 과노출이 될 수 있어요';
    desc    = '눈밭이나 해변 직사광선처럼 매우 밝은 환경에서만 적합해요. 일반 야외나 실내에서는 밝은 부분(하늘, 조명)이 하얗게 날아가요.';
    envText = '눈밭, 흰 모래사장, 강한 반사광이 있는 극단적 야외 환경에서만 써요.';
  } else {
    icon = '🔆'; panelClass = 'judge-level-over2';
    title   = '노출이 심각하게 과다해요';
    desc    = '이 조합으로는 거의 모든 환경에서 사진이 하얗게 날아가요. 셔터 속도를 더 빠르게 하거나, 조리개를 더 조이거나, ISO를 낮춰야 해요.';
    envText = '일반적인 촬영 환경에서는 사용하기 어려운 극단적 세팅이에요.';
  }

  const needlePct = Math.min(100, Math.max(0, (ev / 20) * 100));
  document.getElementById('judge-needle').style.left = needlePct + '%';

  const panel = document.getElementById('judge-panel');
  panel.className = 'judge-panel ' + panelClass;
  document.getElementById('judge-icon').textContent  = icon;
  document.getElementById('judge-title').textContent = title;
  document.getElementById('judge-desc').textContent  = desc;
  document.getElementById('judge-env').textContent   = '📍 ' + envText;

  const warnings = [];

  // ── ISO 노이즈 경고 ──
  // 블로그 기준: 주간 ISO 100~400 충분, 일몰·야간 400~800, 심야 고ISO
  if (iVal >= 12800) {
    warnings.push('⚠ ISO ' + iVal.toLocaleString() + ' — 노이즈(화면 입자)가 매우 심해져 화질이 크게 떨어져요. 불가피한 경우가 아니면 ISO를 낮추세요.');
  } else if (iVal >= 3200) {
    warnings.push('△ ISO ' + iVal.toLocaleString() + ' — 노이즈가 생길 수 있어요. 조리개를 더 열거나 셔터를 느리게 하면 ISO를 낮출 수 있어요.');
  }

  // ── 셔터 속도 경고 ──
  // 핵심: sVal은 초 단위 — 느린 셔터(긴 시간)일수록 값이 크다
  // 30초=30, 1/30초=0.033, 1/1000초=0.001
  // 버그 수정: >= 로 비교해야 "느린 셔터"를 잡을 수 있음
  if (sVal >= 1) {
    warnings.push('⚠ 셔터 ' + SHUTTERS[idx.shutter].label + ' — 매우 느린 셔터예요. 반드시 삼각대가 필요하며, 피사체가 움직이면 모션 블러가 생겨요. (별, 야경, 빛줄기 등 장노출 촬영에는 의도적으로 사용하기도 해요.)');
  } else if (sVal >= 1/30) {
    warnings.push('⚠ 셔터 ' + SHUTTERS[idx.shutter].label + ' — 느린 셔터로 손떨림이 생길 수 있어요. 삼각대를 사용하거나 단단히 고정하세요. 움직이는 피사체는 흐릿하게 찍혀요.');
  } else if (sVal >= 1/60) {
    warnings.push('△ 셔터 ' + SHUTTERS[idx.shutter].label + ' — 손으로 들고 찍을 때 살짝 흔들릴 수 있어요. 숨을 참고 카메라를 몸에 밀착하거나, 손떨림 방지(OIS) 기능을 켜세요.');
  }
  // 1/125 이상 빠른 셔터: 경고 없음 (일반 핸드헬드 촬영에 안전)

  // ── 조리개 회절 경고 ──
  if (aVal >= 16) {
    warnings.push('△ 조리개 ' + APERTURES[idx.aperture].label + ' — 너무 조이면 렌즈 회절 현상으로 오히려 사진이 뿌옇게 될 수 있어요. 보통 f/11 이하를 권장해요.');
  }

  document.getElementById('judge-warnings').innerHTML = warnings.map(w =>
    '<div class="judge-warn-item">' + w + '</div>'
  ).join('');
}

// ── 8. 모바일 UI ──

let mobileActiveTab = 'shutter'; // 현재 활성 탭

/** 모바일 탭 전환 */
function switchMobileTab(key) {
  mobileActiveTab = key;

  // 탭 버튼 활성화
  ['shutter', 'aperture', 'iso'].forEach(k => {
    const tab = document.getElementById('mpn-' + k);
    if (tab) tab.classList.toggle('active', k === key);
  });

  // 패널 표시/숨김
  ['shutter', 'aperture', 'iso'].forEach(k => {
    const panel = document.getElementById('panel-' + k);
    if (panel) panel.classList.toggle('mobile-active', k === key);
  });
}

/** 모바일 탭 값 + 하단 바 업데이트 */
function updateMobileUI(ev) {
  // 탭 값 업데이트
  const mShutter  = document.getElementById('mpn-val-shutter');
  const mAperture = document.getElementById('mpn-val-aperture');
  const mIso      = document.getElementById('mpn-val-iso');
  if (mShutter)  mShutter.textContent  = SHUTTERS[idx.shutter].label;
  if (mAperture) mAperture.textContent = APERTURES[idx.aperture].label;
  if (mIso)      mIso.textContent      = ISOS[idx.iso].toLocaleString();

  // 잠금 해제된 탭에 calculating 클래스
  ['shutter', 'aperture', 'iso'].forEach(k => {
    const tab = document.getElementById('mpn-' + k);
    if (tab) tab.classList.toggle('calculating', !locks[k]);
  });

  // 하단 바 업데이트
  const bar = document.getElementById('mobile-bottom-bar');
  if (!bar) return;

  const pct = Math.min(100, Math.max(0, (ev / 20) * 100));
  const numEl    = document.getElementById('mbb-ev-num');
  const fillEl   = document.getElementById('mbb-fill');
  const needleEl = document.getElementById('mbb-needle');
  const iconEl   = document.getElementById('mbb-icon');
  const textEl   = document.getElementById('mbb-text');

  if (numEl)    numEl.textContent         = ev.toFixed(1);
  if (fillEl)   fillEl.style.width        = pct + '%';
  if (needleEl) needleEl.style.left       = pct + '%';

  // 판정 레벨
  let lvlClass, icon, text;
  if      (ev < 2)  { lvlClass='mbb-under2'; icon='🌑'; text='노출 심각하게 부족'; }
  else if (ev < 5)  { lvlClass='mbb-under1'; icon='🌃'; text='노출 부족 가능성'; }
  else if (ev < 8)  { lvlClass='mbb-ok';     icon='💡'; text='저조도 실내 적합'; }
  else if (ev < 12) { lvlClass='mbb-ok';     icon='✓';  text='적정 노출'; }
  else if (ev < 16) { lvlClass='mbb-ok';     icon='☀️'; text='맑은 야외 적합'; }
  else if (ev < 18) { lvlClass='mbb-over1';  icon='⚡'; text='과노출 가능성'; }
  else              { lvlClass='mbb-over2';  icon='🔆'; text='과노출 심각'; }

  bar.className = 'mobile-bottom-bar ' + lvlClass;
  if (iconEl) iconEl.textContent = icon;
  if (textEl) textEl.textContent = text;
}

/** 모바일 초기화 */
function initMobile() {
  if (window.innerWidth <= 640) {
    switchMobileTab('shutter');
  } else {
    // 데스크톱: 모든 패널 표시
    ['shutter', 'aperture', 'iso'].forEach(k => {
      const panel = document.getElementById('panel-' + k);
      if (panel) panel.classList.remove('mobile-active');
    });
  }
}

window.addEventListener('resize', function() {
  if (window.innerWidth > 640) {
    ['shutter', 'aperture', 'iso'].forEach(k => {
      const panel = document.getElementById('panel-' + k);
      if (panel) panel.classList.remove('mobile-active');
    });
  } else {
    switchMobileTab(mobileActiveTab);
  }
});


// ── 7. 이벤트 핸들러 ──

function onSliderChange(key) {
  if (!locks[key]) return;
  idx[key] = parseInt(document.getElementById('sl-' + key).value, 10);
  updateUI();
}

function toggleLock(key) {
  const lockedCount = Object.values(locks).filter(Boolean).length;
  if (locks[key]) {
    if (lockedCount === 2) locks[key] = false;
  } else {
    locks[key] = true;
    if (Object.values(locks).filter(Boolean).length === 3) {
      const others = Object.keys(locks).filter(k => k !== key && locks[k]);
      locks[others[0]] = false;
    }
  }
  const lockedKeys = Object.keys(locks).filter(k => locks[k]);
  if (lockedKeys.length < 2) {
    const cand = Object.keys(locks).find(k => !locks[k] && k !== key);
    if (cand) locks[cand] = true;
  }
  updateUI();
}

function applyPreset(name) {
  const p = PRESETS[name];
  if (!p) return;
  locks        = { shutter: true, aperture: true, iso: false };
  idx.shutter  = p.shutter;
  idx.aperture = p.aperture;
  idx.iso      = p.iso;
  updateUI();
}

// ── 8. 초기화 ──
document.getElementById('sl-shutter').max  = SHUTTERS.length - 1;
document.getElementById('sl-aperture').max = APERTURES.length - 1;
document.getElementById('sl-iso').max      = ISOS.length - 1;
updateUI();
initMobile();
