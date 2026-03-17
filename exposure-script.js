/* ==========================================
   노출 계산기 — script.js
   ========================================== */

// ==========================================
// 1. 데이터 정의
// ==========================================

/** 셔터 속도 목록 (표시 라벨 + 실제 초 단위 값) */
const SHUTTERS = [
  { label: '30"',    val: 30 },
  { label: '15"',    val: 15 },
  { label: '8"',     val: 8 },
  { label: '4"',     val: 4 },
  { label: '2"',     val: 2 },
  { label: '1"',     val: 1 },
  { label: '1/2',    val: 0.5 },
  { label: '1/4',    val: 0.25 },
  { label: '1/8',    val: 0.125 },
  { label: '1/15',   val: 1 / 15 },
  { label: '1/30',   val: 1 / 30 },
  { label: '1/60',   val: 1 / 60 },
  { label: '1/125',  val: 1 / 125 },
  { label: '1/250',  val: 1 / 250 },
  { label: '1/500',  val: 1 / 500 },
  { label: '1/1000', val: 1 / 1000 },
  { label: '1/2000', val: 1 / 2000 },
  { label: '1/4000', val: 1 / 4000 },
  { label: '1/8000', val: 1 / 8000 },
];

/** 조리개 목록 (f-number) */
const APERTURES = [
  { label: 'f/1',   val: 1 },
  { label: 'f/1.4', val: 1.4 },
  { label: 'f/2',   val: 2 },
  { label: 'f/2.8', val: 2.8 },
  { label: 'f/4',   val: 4 },
  { label: 'f/5.6', val: 5.6 },
  { label: 'f/8',   val: 8 },
  { label: 'f/11',  val: 11 },
  { label: 'f/16',  val: 16 },
  { label: 'f/22',  val: 22 },
  { label: 'f/32',  val: 32 },
];

/** ISO 감도 목록 */
const ISOS = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200];

/** 촬영 환경별 EV 설명 */
const EV_SITUATIONS = [
  { max: 1,  text: '🌑 완전한 어둠 — 장노출 필수',          status: '매우 어두움' },
  { max: 4,  text: '🌃 야간 거리 / 촛불 환경',              status: '어두운 환경' },
  { max: 7,  text: '🌆 야경, 실내 저조도',                  status: '저조도' },
  { max: 10, text: '💡 실내 밝은 조명 / 흐린 야외',         status: '실내 환경' },
  { max: 13, text: '⛅ 맑은 날 그늘 / 흐린 날 야외',        status: '일반 야외' },
  { max: 16, text: '☀️ 맑은 날 직사광선 야외',              status: '밝은 야외' },
  { max: 20, text: '🏔 설원 / 해변 직사광선',               status: '매우 밝음' },
];

/** 촬영 목적 프리셋 */
const PRESETS = {
  sunny:    { shutter: 13, aperture: 5, iso: 1 },  // 1/250, f/8,   ISO 200
  indoor:   { shutter: 10, aperture: 4, iso: 3 },  // 1/30,  f/5.6, ISO 800
  night:    { shutter: 4,  aperture: 2, iso: 5 },  // 4",    f/2.8, ISO 3200
  portrait: { shutter: 12, aperture: 1, iso: 2 },  // 1/125, f/1.4, ISO 400
  sport:    { shutter: 15, aperture: 4, iso: 3 },  // 1/1000,f/5.6, ISO 800
};


// ==========================================
// 2. 상태 (State)
// ==========================================

/** 각 파라미터의 잠금 여부 — true: 사용자 입력 가능, false: 자동 계산 */
let locks = { shutter: true, aperture: true, iso: false };

/** 현재 슬라이더 인덱스 */
let idx = { shutter: 12, aperture: 5, iso: 3 };


// ==========================================
// 3. EV 계산 공식
// ==========================================

/**
 * EV = log2(N² / t) - log2(ISO / 100)
 * @param {number} shutterVal  - 셔터속도 (초)
 * @param {number} apertureVal - 조리개 f값
 * @param {number} isoVal      - ISO 값
 * @returns {number} EV
 */
function calcEV(shutterVal, apertureVal, isoVal) {
  return Math.log2((apertureVal * apertureVal) / shutterVal)
       - Math.log2(isoVal / 100);
}

/**
 * 잠금 해제된 파라미터를 현재 EV 기준으로 역산
 */
function solveUnlocked() {
  const unlocked = Object.keys(locks).find(k => !locks[k]);
  if (!unlocked) return;

  const sVal = SHUTTERS[idx.shutter].val;
  const aVal = APERTURES[idx.aperture].val;
  const iVal = ISOS[idx.iso];
  const targetEV = calcEV(sVal, aVal, iVal);

  if (unlocked === 'shutter') {
    // t = N² / 2^(EV + log2(ISO/100))
    const targetT = (aVal * aVal) / Math.pow(2, targetEV + Math.log2(iVal / 100));
    idx.shutter = SHUTTERS.reduce((best, s, i) =>
      Math.abs(s.val - targetT) < Math.abs(SHUTTERS[best].val - targetT) ? i : best, 0);

  } else if (unlocked === 'aperture') {
    // N = sqrt( 2^(EV + log2(ISO/100)) * t )
    const targetN = Math.sqrt(Math.pow(2, targetEV + Math.log2(iVal / 100)) * sVal);
    idx.aperture = APERTURES.reduce((best, a, i) =>
      Math.abs(a.val - targetN) < Math.abs(APERTURES[best].val - targetN) ? i : best, 0);
  }
  // ISO가 unlocked인 경우: 현재 EV를 그대로 표시 (역산 없이 유지)
}


// ==========================================
// 4. UI 업데이트
// ==========================================

/** 전체 UI를 현재 상태(locks, idx)에 맞게 갱신 */
function updateUI() {
  // 슬라이더 위치 동기화
  document.getElementById('sl-shutter').value  = idx.shutter;
  document.getElementById('sl-aperture').value = idx.aperture;
  document.getElementById('sl-iso').value       = idx.iso;

  // 값 텍스트 업데이트
  document.getElementById('val-shutter').textContent  = SHUTTERS[idx.shutter].label;
  document.getElementById('val-aperture').textContent = APERTURES[idx.aperture].label;
  document.getElementById('val-iso').textContent      = 'ISO ' + ISOS[idx.iso].toLocaleString();

  // 잠금 상태 시각화
  ['shutter', 'aperture', 'iso'].forEach(k => {
    const panel  = document.getElementById('panel-' + k);
    const btn    = document.getElementById('lock-' + k);
    const slider = document.getElementById('sl-' + k);

    if (locks[k]) {
      panel.classList.remove('locked');
      btn.classList.add('active');
      btn.textContent   = '🔒';
      slider.disabled   = false;
    } else {
      panel.classList.add('locked');
      btn.classList.remove('active');
      btn.textContent   = '🔓';
      slider.disabled   = true;
    }
  });

  // EV 계산 및 표시
  const ev  = calcEV(SHUTTERS[idx.shutter].val, APERTURES[idx.aperture].val, ISOS[idx.iso]);
  const pct = Math.min(100, Math.max(0, (ev / 20) * 100));

  document.getElementById('ev-display').textContent  = ev.toFixed(1);
  document.getElementById('ev-fill').style.width      = pct + '%';
  document.getElementById('ev-marker').style.left     = pct + '%';

  // EV 상황 텍스트
  const sit = EV_SITUATIONS.find(s => ev <= s.max) || EV_SITUATIONS[EV_SITUATIONS.length - 1];
  document.getElementById('ev-situation').textContent = sit.text;
  document.getElementById('ev-status').textContent    = sit.status;

  // 동일 노출 조합 테이블
  updateCombos(ev);
}

/**
 * 현재 EV와 같은 노출값을 가진 다양한 조합을 테이블에 표시
 * @param {number} ev - 현재 EV 값
 */
function updateCombos(ev) {
  const tbody       = document.getElementById('combo-tbody');
  const selectedISOs = [100, 400, 1600, 6400];
  const selectedAps  = [1.4, 2.8, 5.6, 8, 16];
  const combos       = [];

  selectedISOs.forEach(iso => {
    selectedAps.forEach(ap => {
      // t = N² / 2^(EV + log2(ISO/100))
      const t = (ap * ap) / Math.pow(2, ev + Math.log2(iso / 100));
      if (t < 0.00005 || t > 60) return;

      const closestSIdx = SHUTTERS.reduce((b, s, i) =>
        Math.abs(s.val - t) < Math.abs(SHUTTERS[b].val - t) ? i : b, 0);
      const sLabel = SHUTTERS[closestSIdx].label;

      // 촬영 특성 태그 결정
      let tag = '';
      if (t >= 1 / 30)   tag = '<span class="tag tag-motion">모션블러</span>';
      else if (t <= 1 / 1000) tag = '<span class="tag tag-freeze">순간포착</span>';
      else if (ap <= 2.8) tag = '<span class="tag tag-portrait">아웃포커싱</span>';
      else if (ap >= 11)  tag = '<span class="tag tag-landscape">풍경</span>';

      combos.push({ shutter: sLabel, aperture: `f/${ap}`, iso: iso.toLocaleString(), tag });
    });
  });

  // 중복 제거 후 최대 8개
  const seen     = new Set();
  const filtered = combos.filter(c => {
    const key = c.shutter + c.aperture + c.iso;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);

  // 현재 설정과 일치하는 행 강조
  const currentS = SHUTTERS[idx.shutter].label;
  const currentA = APERTURES[idx.aperture].label;
  const currentI = ISOS[idx.iso].toLocaleString();

  tbody.innerHTML = filtered.map(c => {
    const isActive = c.shutter === currentS && c.aperture === currentA && c.iso === currentI;
    return `<tr class="${isActive ? 'active-row' : ''}">
      <td>${c.shutter}</td>
      <td>${c.aperture}</td>
      <td>ISO ${c.iso}</td>
      <td>${c.tag || '—'}</td>
    </tr>`;
  }).join('');
}


// ==========================================
// 5. 이벤트 핸들러
// ==========================================

/**
 * 슬라이더 변경 시 호출
 * @param {string} key - 'shutter' | 'aperture' | 'iso'
 */
function onSliderChange(key) {
  if (!locks[key]) return; // 잠금 해제 상태면 슬라이더 비활성
  idx[key] = parseInt(document.getElementById('sl-' + key).value);
  updateUI();
}

/**
 * 잠금 버튼 토글
 * 규칙: 항상 정확히 2개가 잠금 상태여야 함 (1개는 자동 계산)
 * @param {string} key - 'shutter' | 'aperture' | 'iso'
 */
function toggleLock(key) {
  const lockedCount = Object.values(locks).filter(Boolean).length;

  if (locks[key]) {
    // 현재 잠금 → 잠금 해제 (단, 이미 2개만 잠금인 경우에만 허용)
    if (lockedCount === 2) {
      locks[key] = false;
    }
  } else {
    // 현재 해제 → 잠금
    locks[key] = true;
    // 3개 모두 잠금이 되면 기존 잠금 중 하나를 해제
    if (Object.values(locks).filter(Boolean).length === 3) {
      const others = Object.keys(locks).filter(k => k !== key && locks[k]);
      locks[others[0]] = false;
    }
  }

  // 안전 장치: 잠금이 1개 이하가 되면 강제로 1개 추가
  const lockedKeys = Object.keys(locks).filter(k => locks[k]);
  if (lockedKeys.length < 2) {
    const toRelockCandidate = Object.keys(locks).find(k => !locks[k] && k !== key);
    if (toRelockCandidate) locks[toRelockCandidate] = true;
  }

  updateUI();
}

/**
 * 촬영 상황 프리셋 적용
 * @param {string} name - 프리셋 이름 (sunny | indoor | night | portrait | sport)
 */
function applyPreset(name) {
  const p = PRESETS[name];
  if (!p) return;

  locks      = { shutter: true, aperture: true, iso: false };
  idx.shutter  = p.shutter;
  idx.aperture = p.aperture;
  idx.iso      = p.iso;

  updateUI();
}


// ==========================================
// 6. 초기화
// ==========================================

// 슬라이더 max 값을 데이터 배열 길이에 맞게 설정
document.getElementById('sl-shutter').max  = SHUTTERS.length - 1;
document.getElementById('sl-aperture').max = APERTURES.length - 1;
document.getElementById('sl-iso').max      = ISOS.length - 1;

// 첫 렌더링
updateUI();
