# Deepria Cloud: Android WebView에서 PWA로 전환 — 구현 인수인계

## 목표와 범위

`https://deepria.cloud`를 Android에서 설치 가능한 **온라인 우선 PWA**로 전환한다. 기존 Android WebView 앱은 PWA의 운영 검증이 끝날 때까지 유지한다.

1차 전환의 완료 기준은 다음과 같다.

- Android Chrome 및 Samsung Internet에서 앱을 설치하고 standalone 창으로 실행할 수 있다.
- Google/GitHub OAuth 로그인, 세션 복구와 로그아웃이 웹 브라우저만으로 작동한다.
- 메모, 할 일, 채팅, 파일 업로드 및 다운로드가 설치된 PWA에서 작동한다.
- 정적 앱 자원은 캐시되어 재방문이 빠르고, 오프라인에서는 명확한 안내를 제공한다.

다음은 1차 범위에서 제외한다.

- 오프라인 메모/할 일 편집과 재접속 동기화
- Web Push 알림
- 백그라운드 대용량 업로드
- Android 네이티브 프로젝트의 삭제 또는 Play Store 출시 정책 변경

## 현재 진행 상황 (2026-08-26)

현재 상태: **PWA 기반 구현과 운영 배포, Android Chrome 설치·인증·주요 기능 QA 완료. 교차 브라우저·오프라인·업데이트 QA 진행 필요.**

완료된 내용:

- `vite-plugin-pwa`와 Workbox 기반 service worker를 적용했다.
- 앱 셸을 precache하고, 화면 이동은 network-first + 앱 셸 fallback으로 구성했다.
- `/api/**`와 S3 presigned 요청은 service worker에서 캐시하지 않는다.
- 연결 상태, 오프라인 요청 오류, 새 버전 적용 안내 UX를 추가했다.
- Android 앱의 기존 꽃 런처 이미지를 192x192, 512x512, maskable 512x512 PWA 아이콘으로 적용했다.
- 운영 `manifest.webmanifest`와 `sw.js`가 각각 올바른 MIME 타입으로 응답함을 확인했다.
- Amplify SPA rewrite에서 `webmanifest`를 정적 확장자로 제외했다.
- 운영 직접 진입 경로 `/memo`, `/memo/edit/:id`, `/chat`가 `200 text/html`로 응답함을 확인했다.
- API CORS가 `https://deepria.cloud`를 origin으로 반환하고 credentials를 허용함을 확인했다.
- Android Chrome에서 꽃 아이콘으로 설치되고 주소창 없는 standalone 창으로 실행됨을 확인했다.
- Android Chrome PWA에서 Google/GitHub 인증, 로그아웃, 재실행 후 세션 복구가 통과했다.
- 메모, 할 일, 채팅, 계정, 파일 업로드·다운로드 기능 QA가 통과했다.
- `pnpm run lint`, `pnpm run test:unit`(9개), `pnpm run build`가 통과했다.

다음 작업:

1. 비행기 모드의 앱 셸·오프라인 안내와 새 버전 업데이트 적용을 검증한다.
2. Samsung Internet에서 설치와 standalone 실행 및 핵심 기능을 반복 검증한다.
3. 운영 로그에서 CORS/OAuth/S3 오류가 없는지 확인한다.
4. 위 검증이 모두 통과한 뒤 WebView 전용 인증·다운로드 브리지 제거 여부를 결정한다.

## 사전 확인 사항

구현에 앞서 배포 담당자 또는 인프라 접근 권한이 있는 담당자가 아래를 확인해야 한다.

- [x] 프론트엔드 운영 Origin: `https://deepria.cloud`
- [x] API 운영 Origin: `https://api.deepria.cloud`
- [x] API CORS 응답이 프론트엔드 Origin `https://deepria.cloud`와 정확히 일치함
- [ ] API 인증 쿠키의 `Secure` 속성을 응답 헤더 또는 운영 설정에서 직접 확인함
- [x] 프론트엔드/API 조합에서 앱 재실행 후 로그인 세션이 유지됨
- [x] Google 및 GitHub OAuth callback과 원래 PWA 복귀가 정상 작동함
- [x] AWS Amplify가 Vue Router의 직접 진입 경로(`/memo`, `/memo/edit/:id`, `/chat` 등)를 `index.html`로 rewrite함
- [x] S3 CORS가 브라우저 기반 presigned 업로드/다운로드를 허용하며 multipart ETag를 노출함

위 조건이 충족되지 않으면 PWA 자체는 설치되어도 로그인·새로고침·파일 기능이 실패할 수 있다.

## 권장 작업 순서

### 1. PWA 기반 추가

예상: 0.5~1일

- [x] `vite-plugin-pwa`를 개발 의존성으로 추가한다.
- [x] `vite.config.js`에 VitePWA 플러그인을 추가한다.
- [x] `public/manifest.webmanifest`를 생성한다.
- [x] `index.html`에 manifest, theme-color, Apple touch icon 메타 정보를 추가한다.
- [x] Android 앱의 꽃 이미지를 사용한 192x192, 512x512, maskable 아이콘을 준비한다.
- [x] 앱 표시명 `Deepria Cloud`, 짧은 이름 `Deepria`, `start_url: /`, `display: standalone`, 색상을 확정한다.
- [x] `main.js`에서 service worker 등록과 업데이트 감지 UX를 구현한다.

권장 초기 캐시 정책:

- 앱 셸(HTML, JS, CSS, 폰트, 아이콘): precache
- 페이지 이동: network-first + cache fallback
- `/api/**`: 네트워크 전용. 인증된 응답을 service worker에 캐시하지 않는다.
- S3 presigned URL: 네트워크 전용

### 2. 오프라인 및 업데이트 UX

예상: 0.5~1일

- [x] 오프라인 화면 이동 시 캐시된 Vue 앱 셸과 전역 상태 안내를 표시한다.
- [x] `online`/`offline` 이벤트로 연결 상태 안내를 제공한다.
- [x] 새 service worker가 대기 상태이면 사용자가 새 버전을 적용할 수 있게 안내한다.
- [x] 로그인·파일 업로드·다운로드·채팅 요청이 오프라인일 때 오류 메시지를 일관되게 표시한다.

### 3. 배포 및 브라우저 기반 인증 검증

예상: 1일

- [x] 운영 배포에서 manifest와 service worker의 응답 헤더/경로를 확인한다.
- [x] Android Chrome PWA에서 Google 로그인을 실행하고 원래 URL로 복귀하는지 확인한다.
- [x] GitHub 로그인도 같은 방식으로 확인한다.
- [x] 새로고침 및 앱 재실행 후 `/api/auth/me`로 세션이 복구되는지 확인한다.
- [x] 인증 실패 응답에서 `Access-Control-Allow-Origin: https://deepria.cloud`와 credentials 허용을 확인한다.

### 4. WebView 전용 프론트엔드 코드 제거

예상: 0.5~1일. 3단계가 통과한 뒤에만 진행한다.

- [ ] `src/pages/Auth/Login.vue`에서 Android WebView/브리지 감지와 `mobile-login` 흐름을 제거한다.
- [ ] 로그인은 모든 플랫폼에서 `authApi.loginUrl(provider, returnTo)`를 통해 일반 웹 OAuth로 통일한다.
- [ ] `src/shared/composables/useDownload.js`에서 `Android`, `AndroidBridge`, `ReactNativeWebView`, `webkit` 브리지를 제거한다.
- [ ] 다운로드는 브라우저 anchor 기반 흐름을 유지하고 Android Chrome에서 결과를 확인한다.
- [ ] `src/shared/utils/platform.js`의 WebView 감지 코드가 다른 기능에서 쓰이지 않는지 확인 후 삭제한다.
- [ ] 아래 문자열로 잔존 브리지 참조를 검색한다: `Android`, `AndroidBridge`, `ReactNativeWebView`, `mobile-auth-code`, `deepriaCompleteMobileLogin`, `isWebView`.

주의: 위 변경은 PWA가 실제 기기에서 로그인·다운로드까지 통과한 후 수행한다. 기존 APK를 즉시 깨지 않기 위해, 필요하다면 해당 정리는 별도 후속 PR로 분리한다.

### 5. 실제 기기 QA 및 전환

예상: 1~2일

- [x] Android Chrome에서 설치 메뉴의 "앱 설치"가 보인다.
- [x] 꽃 아이콘으로 설치되고 주소창 없이 standalone 창으로 열린다.
- [ ] Samsung Internet에서도 설치 및 실행된다.
- [x] 설치된 앱의 첫 실행과 재실행을 확인한다.
- [ ] 새 service worker 업데이트 적용 후 실행을 확인한다.
- [x] Google/GitHub 로그인, 로그아웃, 세션 복구를 확인한다.
- [x] 파일 선택, 소형 파일 업로드, multipart 업로드, 다운로드를 확인한다.
- [x] 메모, 할 일, 채팅, 계정, 직접 URL 접근 및 새로고침을 확인한다.
- [ ] 비행기 모드에서 캐시된 앱 셸과 오프라인 안내가 표시되는지 확인한다.
- [ ] 실제 운영 로그에서 CORS/OAuth/파일 오류가 없는지 확인한다.

## 파일별 변경 지점

| 파일 | 작업 |
| --- | --- |
| `blog_vue3_front/package.json` | PWA 플러그인 의존성 추가 |
| `blog_vue3_front/vite.config.js` | VitePWA 플러그인 및 Workbox 캐시 정책 |
| `blog_vue3_front/index.html` | manifest와 PWA 메타 태그 |
| `blog_vue3_front/public/` | manifest, PWA 아이콘, 오프라인 자원 |
| `blog_vue3_front/src/main.js` | service worker 등록 및 업데이트 처리 |
| `blog_vue3_front/src/pages/Auth/Login.vue` | 검증 완료 후 WebView 전용 OAuth 제거 |
| `blog_vue3_front/src/shared/composables/useDownload.js` | 검증 완료 후 네이티브 다운로드 브리지 제거 |
| `blog_vue3_front/src/shared/utils/platform.js` | 참조가 없으면 삭제 |
| 배포 설정(AWS Amplify) | SPA rewrite와 cache-control 정책 확인 |
| `blog_rust_lambda` 배포 환경 변수 | CORS, 인증 쿠키, OAuth 운영 URL 확인 |

## 검증 명령

프론트엔드 디렉터리에서 아래를 실행한다.

```sh
pnpm install
pnpm run lint
pnpm run test:unit
pnpm run build
pnpm run preview
```

빌드만 통과했다고 PWA 전환이 완료된 것은 아니다. HTTPS 배포 환경과 실제 Android 브라우저에서 설치·OAuth·파일 흐름을 반드시 검증한다.

## 완료 보고에 포함할 내용

- 변경 파일과 캐시 전략
- 적용된 manifest 값 및 아이콘 목록
- Amplify SPA rewrite와 API CORS 확인 결과
- Android Chrome/Samsung Internet별 QA 결과
- OAuth 제공자별 로그인 검증 결과
- 알려진 제한 사항: 온라인 전용 API 데이터, 미구현 푸시/오프라인 동기화
- 기존 AOS 앱을 유지·안내·종료할 다음 의사결정
