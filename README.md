# CHZ Cat Town 🐾

> 고양이가 되어 작은 픽셀 마을을 산책하고, 게시판·상점·집에서 이야기를 만나는 공간 기반 커뮤니티.

**MVP v0.1** — React 웹 UI와 Phaser 3 게임 공간을 연결한, 브라우저에서 플레이 가능한 싱글 플레이 프로토타입입니다. 전투나 퀘스트 대신 작은 마을을 탐험하며 커뮤니티 기능으로 자연스럽게 이어지는 경험에 집중합니다.

## 주요 기능

- 코드로 그린 따뜻한 픽셀 마을과 방향별 고양이 걷기 애니메이션
- WASD / 방향키 이동, 대각선 속도 정규화, 부드러운 카메라 추적
- 건물·나무·게시판·분수 충돌 및 맵 경계 제한
- 장소 근처에서 안내 표시 → **E** 입력 → React 모달 열기
- 게시판 샘플 글과 본문, 상점 상품 미리보기, 프로필
- **치즈·삼색·턱시도·고등어·검은·흰고양이** 6종 선택 및 즉시 적용
- 선택한 고양이의 로컬 저장 및 다음 방문 시 복원
- 전체화면 전환과 해제 (미지원 환경에서는 브라우저 창 확장 모드)
- 모달 표시 중 이동 중지, ESC 닫기, 모달 키보드 포커스 관리

## 기술 스택

| 영역        | 사용 기술                                  |
| ----------- | ------------------------------------------ |
| 웹 UI       | React 19, TypeScript strict, Vite 7        |
| 픽셀 공간   | Phaser 3, Arcade Physics, Canvas 렌더러    |
| UI 상태     | Zustand                                    |
| 데이터 조회 | TanStack Query + 비동기 Mock 서비스        |
| 검증        | Playwright, TypeScript, Vite 프로덕션 빌드 |

현재 버전은 프론트엔드만 실행합니다. 서버나 데이터베이스, API 키가 필요하지 않습니다. 외부 유료 에셋이나 외부 폰트도 사용하지 않습니다.

## 시작하기

### 준비

- Node.js **22.12 이상** (Node.js 24 환경에서 검증)
- npm
- 키보드가 있는 데스크톱 브라우저 권장

### 설치 및 실행

```sh
git clone https://github.com/CHZEE93/CHZ_Cat_Town.git
cd CHZ_Cat_Town
npm ci
npm run dev
```

터미널에 표시되는 주소를 브라우저에서 엽니다. 기본 주소는 `http://localhost:5173`이며 포트가 사용 중이면 달라질 수 있습니다.

### 명령어

| 명령어            | 설명                                          |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | 개발 서버 실행                                |
| `npm run build`   | TypeScript 검사 후 `dist/`에 배포용 빌드 생성 |
| `npm run preview` | 빌드 결과 로컬 확인                           |
| `npm test`        | Playwright 브라우저 테스트                    |

## 조작법

| 입력 / 버튼                    | 동작                   |
| ------------------------------ | ---------------------- |
| WASD 또는 방향키               | 이동 (175px/s)         |
| E                              | 가까운 장소와 상호작용 |
| ESC / 닫기 / 모달 바깥 클릭    | 모달 닫기              |
| 마을 오른쪽 위 **전체화면**    | 전체화면 진입 / 해제   |
| 마을 오른쪽 위 **고양이 선택** | 고양이 종류 변경       |
| 헤더 **CHZ**                   | 프로필 열기            |
| 헤더 **?**                     | 이용 안내              |

- **Cat Board**: 광장 북쪽. 샘플 게시글을 누르면 본문을 펼칩니다.
- **Cat Shop**: 광장 동쪽. 생선·털실공·발바닥 쿠션·리본을 구경합니다.
- **Cat House**: 마을 북쪽. 프로필과 고양이 선택을 확인합니다.

선택한 고양이는 해당 브라우저의 `localStorage`에 저장됩니다. 계정이나 서버 간 동기화는 제공하지 않습니다.

## 프로젝트 구조

```text
src/
├── api/                    # 교체 가능한 비동기 Mock 서비스
├── components/             # GameCanvas, Modal, 고양이 선택, 전체화면
├── features/               # 게시판·상점·프로필·안내 React UI
├── game/
│   ├── config/             # 이동 속도, 맵·상호작용 설정, 고양이 종류
│   ├── entities/           # CatPlayer 이동·방향·애니메이션
│   ├── events/             # 타입 지정 Event Bus
│   ├── scenes/             # TownScene 게임 흐름
│   └── world/              # 맵·충돌체·픽셀 텍스처 생성
├── stores/                 # UI 상태 및 고양이 선택 저장
├── App.tsx                 # 웹 레이아웃과 모달 구성
├── main.tsx                # React 및 QueryClient 초기화
└── style.css

tests/                      # 실제 브라우저 조작 테스트
```

### React와 Phaser의 역할 분리

Phaser는 맵·플레이어·이동·충돌·카메라·근접 판정을 담당합니다. React는 헤더·안내·모달·전체화면·고양이 선택을 담당합니다.

양쪽은 `src/game/events/EventBus.ts`의 타입 지정 이벤트로 통신합니다.

```text
Phaser → OPEN_BOARD / OPEN_SHOP / OPEN_PROFILE / NEARBY / READY → React
React  → UI_BLOCKED / SET_CAT → Phaser
```

Zustand에는 UI와 외형 선택만 저장하며, 플레이어 좌표와 물리 상태는 Phaser가 관리합니다. Mock 데이터는 `src/api/townService.ts`에서 제공하고 TanStack Query로 조회합니다.

## 검증

처음 한 번 브라우저를 설치한 뒤 테스트합니다.

```sh
npx playwright install chromium
npm test
npm run build
```

Playwright가 개발 서버를 실행하거나 이미 실행 중인 `localhost:5173` 서버를 사용합니다. 다음 흐름을 검증합니다.

- 이동, 게시판 충돌, 근접 안내, E 상호작용
- 게시판·프로필·상점 모달 열기와 닫기
- 전체화면 전환 및 캔버스 크기 변경
- 고양이 6종 선택, 새로고침 후 선택 복원
- 게임 탐험 중 브라우저 콘솔 / 런타임 오류 확인

실패 시 스크린샷은 `test-results/`에 생성됩니다. 별도 lint 명령은 아직 설정하지 않았습니다. Phaser를 포함한 번들 크기에 대한 Vite 경고는 발생할 수 있으며 빌드 실패는 아닙니다.

## 현재 범위와 향후 확장

현재 게시판과 상점, 프로필 데이터는 Mock입니다. 실제 글 작성·수정·삭제, 상품 구매, 로그인, 채팅 및 멀티플레이는 구현하지 않았습니다.

향후 확장 지점:

- `townService`를 FastAPI REST API 호출로 교체
- FastAPI·SQLAlchemy·Pydantic·PostgreSQL을 이용한 서버 구성
- WebSocket을 통한 원격 플레이어 위치 및 방향 동기화
- 별도 remote player 엔티티 추가
- `catTexture.ts`의 생성형 그림을 실제 spritesheet 에셋으로 교체
- 서버 도입 시 Docker Compose 구성

백엔드, WebSocket 및 Docker Compose는 현재 저장소에 포함되어 있지 않습니다.
