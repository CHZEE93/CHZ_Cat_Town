# CHZ Cat Town 🐾

> Low-poly 3D 고양이가 되어 작은 마을을 산책하고, 게시판·상점·집과 상호작용하는 Cozy Social Town.

**MVP v0.2 · 3D 전환** — 기존 React 커뮤니티 UI를 유지하고, Phaser 기반 2D 공간을 Three.js / React Three Fiber와 Rapier로 교체한 브라우저 프로토타입입니다.

## 구현된 기능

- 파스텔 색감의 미니어처 3D 마을: 주택, 상점, 게시판, 분수, 나무와 산책로
- 외부 모델 없이 primitive로 구성한 3D 고양이와 idle / walking 애니메이션
- WASD / 방향키 이동, 화면 기준 이동 방향, 대각선 속도 정규화
- 자유 회전 없는 고정 쿼터뷰 PerspectiveCamera와 부드러운 Follow
- Rapier 기반 건물·나무·게시판·분수 및 마을 경계 충돌
- 장소 근접 안내 → E → 기존 React 게시판·상점·프로필 모달
- 모달 표시 중 이동 정지, ESC·닫기 버튼·모달 바깥 클릭으로 복귀
- 기존 전체화면 전환과 반응형 캔버스 유지
- 기존 치즈·삼색·턱시도·고등어·검은·흰고양이 6종 선택 유지
- 선택한 외형은 3D 모델에 적용되며 브라우저에 저장

## 기술 스택

| 영역           | 사용 기술                                      |
| -------------- | ---------------------------------------------- |
| 서비스 UI      | React 19, TypeScript strict, Vite 7            |
| 3D 렌더링      | Three.js, React Three Fiber, @react-three/drei |
| 물리 / 충돌    | @react-three/rapier (WASM)                     |
| UI / 외형 상태 | Zustand                                        |
| 데이터 조회    | TanStack Query + 비동기 Mock 서비스            |
| 검증           | Playwright, TypeScript, Vite 프로덕션 빌드     |

서버, DB, API 키, 외부 3D 모델, 외부 폰트가 필요하지 않습니다. Phaser는 더 이상 사용하지 않습니다.

## 실행

Node.js **22.12 이상**과 npm이 필요합니다. WebGL 2를 지원하는 데스크톱 브라우저와 키보드를 권장합니다.

```sh
git clone https://github.com/CHZEE93/CHZ_Cat_Town.git
cd CHZ_Cat_Town
npm ci
npm run dev
```

터미널에 표시되는 로컬 URL을 엽니다. 기본 주소는 `http://localhost:5173`입니다. 첫 접속 시 3D 모듈과 Rapier 초기화를 기다리는 안내가 표시됩니다.

| 명령어            | 설명                                    |
| ----------------- | --------------------------------------- |
| `npm run dev`     | 개발 서버 실행                          |
| `npm run build`   | TypeScript 검사와 배포용 빌드 (`dist/`) |
| `npm run preview` | 프로덕션 빌드 미리보기                  |
| `npm test`        | Playwright 브라우저 회귀 테스트         |

## 조작법

| 입력 / 버튼                 | 동작                              |
| --------------------------- | --------------------------------- |
| WASD / 방향키               | 화면 기준 이동. W / ↑는 화면 위쪽 |
| E                           | 가장 가까운 장소와 상호작용       |
| ESC / 닫기 / 모달 바깥 클릭 | 모달 닫기                         |
| 전체화면 / 전체화면 나가기  | 전체화면 전환                     |
| 고양이 선택 / 헤더 CHZ      | 프로필 및 기존 고양이 종류 선택   |
| 헤더 ?                      | 이용 안내                         |

광장 북쪽 **Cat Board**, 광장 동쪽 **Cat Shop**, 마을 북쪽 **Cat House** 앞으로 다가가면 안내가 표시됩니다. 자유 카메라 회전이나 점프는 없습니다. 화면이 좁으면 카메라가 뒤로 물러나 주변 공간을 보여줍니다.

전체화면 API 미지원 시 브라우저 창을 채우는 확장 모드를 사용합니다. 외형 선택은 해당 브라우저의 `localStorage`에 저장되며 계정 동기화는 제공하지 않습니다.

## 구조

```text
src/
├── api/                     # 교체 가능한 비동기 Mock 서비스
├── components/              # Canvas 경계, 모달, 전체화면, 고양이 선택
├── features/                # 기존 게시판·상점·프로필·안내 React UI
├── game/
│   ├── camera/              # 고정 각도 PerspectiveCamera + Follow
│   ├── config/              # 월드 단위 상수, 배치, 테마, 고양이 종류
│   ├── dev/                 # 개발 테스트용 읽기 전용 진단
│   ├── environment/         # Ground, Trees, Buildings, Plaza, Board 등
│   ├── events/              # 기존 타입 지정 Event Bus
│   ├── interaction/         # 공통 Interactable, 근접 판정, E 입력
│   ├── player/              # 3D CatModel, Rapier CatPlayer, 이동 입력
│   ├── runtime/             # 프레임 상태를 보관하는 ref 기반 컨텍스트
│   └── world/               # CatTownWorld 구성과 Physics 경계
├── stores/                  # 기존 Zustand UI 및 외형 저장
├── App.tsx                  # 웹 레이아웃 / HUD / 모달
└── main.tsx                 # React 및 QueryClient 초기화

tests/                       # 실제 키보드 브라우저 검증
```

### 역할과 이벤트

3D 계층은 UI store를 직접 수정하지 않습니다. 기존 이벤트 계약으로 연결합니다.

```text
3D World → OPEN_BOARD / OPEN_SHOP / OPEN_PROFILE / NEARBY / READY → React DOM
React DOM → UI_BLOCKED / SET_CAT → 3D World
```

Zustand는 모달·안내·외형 선택에만 사용합니다. 좌표·속도·키 입력·방향은 게임 내부의 mutable runtime에 보관하고 `useFrame`에서 갱신합니다. React state는 외형이나 UI처럼 실제 변경이 발생할 때만 갱신합니다.

### 이동 / 카메라 / 물리

- X/Z 평면 이동, Y 높이. `PLAYER_SPEED = 4.8` 월드 단위/초.
- 카메라의 고정 수평 축에 맞춰 입력 벡터를 변환하고 정규화합니다.
- `useFrame`에서 이동 의도를 계산하고, Rapier 고정 물리 스텝에 속도를 적용합니다.
- 회전과 수직 이동을 잠근 dynamic rigid body + capsule collider를 사용합니다.
- 건물·게시판은 고정 cuboid, 분수는 고정 cylinder 충돌체입니다.
- 물리 몸체 회전과 외형 회전을 분리하여 기울어지거나 넘어지지 않습니다.
- `FollowCamera`는 지수 보간으로 시선을 이동하며 카메라 방향은 유지합니다.

### 렌더링

지연 로딩되는 3D 모듈, 최대 DPR 1.5, 그림자를 만드는 방향광 하나, 1024px 그림자 맵을 사용합니다. 반복되는 나무와 작은 꽃은 인스턴싱합니다. 표지판 글씨는 로컬 CanvasTexture로 생성합니다. 후처리, 외부 HDR, 외부 모델 다운로드는 없습니다.

모델 교체 시 `CatModel` 또는 환경 컴포넌트의 시각 요소를 GLB/GLTF로 교체하고, 물리 충돌체와 이벤트 계약은 유지할 수 있습니다. 색상은 `game/config/theme.ts`, 배치와 이동 설정은 `game/config/constants.ts`에 모여 있습니다.

## 검증

```sh
npx playwright install chromium
npm test
npm run build
```

테스트는 개발 서버를 실행하거나 이미 실행 중인 `localhost:5173`을 사용합니다. 실제 키보드로 마을을 걸으며 이동·충돌·카메라 추적·모달 중 입력 차단·세 장소 상호작용·전체화면·리사이즈·외형 복원을 확인합니다.

개발 모드의 `?debug=1`은 테스트를 위한 읽기 전용 좌표 진단만 제공합니다. 좌표 이동이나 입력 주입 API는 없고 프로덕션 빌드에는 활성화되지 않습니다. Headless Chromium 테스트는 GPU가 없는 환경에서도 동작하도록 소프트웨어 WebGL 옵션을 사용합니다. 테스트용 소프트웨어 렌더링 속도는 실제 GPU 성능 지표가 아닙니다.

별도 lint 명령은 아직 없습니다. Three.js와 Rapier를 포함하므로 Vite 번들 크기 경고가 발생할 수 있습니다.

## Mock 범위 / 다음 단계

게시판, 상품, 프로필은 여전히 `api/townService.ts`의 샘플 데이터입니다. 글 작성·수정·삭제, 구매, 로그인, 실시간 채팅, 멀티플레이, WebSocket은 구현하지 않았습니다. 서버와 Docker Compose도 아직 포함하지 않습니다.

다음 단계는 실제 기기에서 렌더링 성능과 이동 감각을 확인하고, 필요 시 primitive 모델을 GLB로 교체하는 것입니다. 이후 별도 범위로 Mock 서비스를 FastAPI에 연결하고 원격 플레이어 엔티티와 WebSocket 동기화를 추가할 수 있습니다.

### 기술 문서

- [React Three Fiber hooks](https://r3f.docs.pmnd.rs/api/hooks)
- [React Three Rapier](https://pmndrs.github.io/react-three-rapier/)
- [Drei PerspectiveCamera](https://drei.docs.pmnd.rs/cameras/perspective-camera)
