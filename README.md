# EXPOSURECALC

> 카메라 노출 삼각형 계산기 — 셔터속도 · 조리개 · ISO를 직관적으로 계산합니다

**[→ Live Demo](https://benz-kim.github.io/exposurecalc)**

<br>

## Background & Motivation

사진을 배우기 시작하면 누구나 한 번쯤 막히는 지점이 있습니다. 바로 **노출 삼각형(Exposure Triangle)** 입니다.

셔터속도를 올리면 ISO를 올려야 하는지, 조리개를 조이면 EV가 어떻게 바뀌는지 — 이 관계를 머릿속으로 계산하는 것은 초보자에게 쉽지 않습니다. 기존 앱들은 기능은 많지만 UI가 복잡하거나, 단순하지만 판단 근거를 알려주지 않는 경우가 많았습니다.

EXPOSURECALC는 세 가지 목표로 만들었습니다.

- **즉각적인 피드백** — 슬라이더를 움직이는 즉시 EV와 판정이 바뀐다
- **이유를 알려주는 판정** — "노출 부족"이 아니라 왜 부족한지, 어떤 환경에 맞는지 설명한다
- **현장에서 쓸 수 있는 UI** — 스마트폰으로도 한 손으로 조작 가능한 모바일 퍼스트 설계

<br>

## Project Overview

| 항목 | 내용 |
|---|---|
| 유형 | 싱글 페이지 웹 앱 (SPA) |
| 빌드 도구 | 없음 (순수 HTML/CSS/JS) |
| 외부 의존성 | exifr (EXIF 파싱), Google Fonts |
| 반응형 | 모바일 · 태블릿 · 데스크탑 완전 지원 |
| 오프라인 | 로컬 파일로 바로 실행 가능 |

### 핵심 기능

**노출 삼각형 계산기**
셔터속도 · 조리개 · ISO 슬라이더를 움직이면 EV가 실시간으로 계산됩니다. 값 하나를 🔒 잠금하면 나머지 두 값으로 목표 EV를 맞출 수 있습니다. 맑은 야외 / 실내 / 야경 / 인물 / 스포츠 씬 프리셋도 제공합니다.

**노출 판정 패널**
Sunny 16 법칙 기반으로 현재 EV가 어떤 환경에 적합한지 7단계로 판정합니다. 컬러 미터 바로 노출 과부족을 시각화하고, 세팅별 주의사항도 안내합니다.

**동일 노출 조합 추천**
같은 EV를 유지하면서 셔터속도 · 조리개 · ISO를 다양하게 조합한 테이블을 보여줍니다. 동체 정지, 아웃포커스, 저노이즈 등 촬영 목적에 맞는 조합을 고를 수 있습니다.

**사진 EXIF 불러오기**
사진 파일을 업로드하면 촬영 당시의 셔터속도 · 조리개 · ISO를 자동으로 읽어옵니다. 버튼 하나로 계산기에 바로 적용할 수 있습니다.

<br>

## Tech Stack

| 분류 | 사용 기술 | 선택 이유 |
|---|---|---|
| 마크업 | HTML5 | — |
| 스타일 | CSS3 (Custom Properties, Grid, Flexbox) | 프레임워크 없이 반응형 구현 |
| 로직 | Vanilla JavaScript (ES6+) | 번들러 불필요, 즉시 실행 가능 |
| EXIF 파싱 | [exifr](https://github.com/MikeKovarik/exifr) | 경량 CDN 로드, 브라우저 호환성 우수 |
| 폰트 | DM Mono, Bebas Neue, DM Sans | Google Fonts |
| 아이콘 | SVG (인라인) | 외부 아이콘 라이브러리 미사용 |

<br>

## 반응형 UI

| 환경 | 브레이크포인트 | 레이아웃 |
|---|---|---|
| 데스크탑 | 1025px+ | 3열 그리드, 전체 패널 |
| 태블릿 | 641 ~ 1024px | 3열 그리드, 하단 EV 바 |
| 모바일 | 640px 이하 | 탭 전환(셔터/조리개/ISO), 하단 고정 EV 바 |

모바일에서는 화면 하단에 EV 숫자 + 컬러 미터 + 판정 텍스트가 항상 고정 표시되어 슬라이더를 조작하면서도 결과를 바로 확인할 수 있습니다.

<br>

## 파일 구조

```
exposurecalc/
├── index.html        # 메인 HTML 구조
├── style.css         # 전체 스타일 (반응형 포함)
├── script.js         # 계산 로직 및 UI 상호작용
└── favicon.svg       # 조리개 모양 SVG 파비콘
```

<br>

## 로컬 실행

빌드 과정 없이 바로 실행됩니다.

```bash
git clone https://github.com/Benz-Kim/exposurecalc.git
cd exposurecalc
open index.html
```

또는 VS Code Live Server 등 정적 서버로 서빙해도 됩니다.

<br>

## 디자인 시스템

```css
/* 주요 색상 변수 */
--bg:       #0d0d0d   /* 배경 */
--surface:  #161616   /* 패널 */
--accent:   #e8c84a   /* 골드 — 주요 강조 */
--green:    #5ae8a0   /* 적정 노출 */
--red:      #e85a4a   /* 노출 과부족 */
--text:     #f0ece0   /* 본문 */
--text-dim: #7a7568   /* 보조 텍스트 */
```

<br>

## License

MIT © [Benz-Kim](https://github.com/Benz-Kim)
