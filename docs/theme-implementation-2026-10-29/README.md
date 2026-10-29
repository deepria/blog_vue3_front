# A B C 테마 실제 화면 적용

작성일: 2026년 10월 29일

디자인 프리뷰의 세 방향을 실제 제품 테마로 적용했다. 설정의 **작업 공간의 분위기**에서 A 편집 디자인, B 그래픽 스튜디오, C 작업 콘솔을 고르고 라이트·다크를 독립적으로 선택한다. 총 여섯 가지 조합을 지원한다.

## 적용 범위

- 홈, 메모 목록과 편집, 할 일, 파일, 채팅, 설정, 로그인에 공통 팔레트와 디자인 규칙을 적용했다.
- 홈은 실제 클립보드와 최근 메모 API를 사용한다. 기존 갤러리 설정과 이미지 로딩 흐름을 유지한다.
- 테마마다 강조색, 배경과 작업면, 모서리, 제목과 메타 정보, 사이드바와 브랜드 그래픽을 구분한다.
- Ant Design과 자체 UI가 같은 토큰을 사용한다. body로 이동하는 모달·드로어도 같은 색상을 사용한다.
- 데스크톱 사이드바의 설정과 모바일 상단 설정 진입점을 제공한다. 모바일 하단은 핵심 기능 5개로 구성했다.
- 선택은 브라우저에 저장되어 재접속 후 복원된다. 기존 라이트·다크 선택은 유지한다. 계정 간·기기 간 테마 동기화는 포함하지 않는다. 계정에 저장되는 갤러리 옵션과 화면에서 구분한다.
- 기본 디자인은 A이며, 기존 밝기 설정이 없으면 라이트를 사용한다.

프로덕션 화면에 샘플 콘텐츠를 넣지 않았다. 이 폴더의 캡처는 실제 화면을 샘플 API 응답으로 실행한 검증 자료다. 디자인 프리뷰 경로는 개발 모드에서만 유지한다.

## 확인 방법

프런트엔드 폴더에서 `npm run dev -- --host 127.0.0.1`을 실행한다. 기존 인증과 API 연결을 사용해 로그인하고 [설정](http://127.0.0.1:5173/account)에서 테마를 변경한다. 설정 선택과 밝기 변경은 즉시 전체 화면에 적용되며, 테마 선택 때문에 서버 저장 요청이 추가되지는 않는다.

API 연결 없이 시각 방향만 비교하려면 기존 [개발용 프리뷰](http://127.0.0.1:5173/design-preview)를 사용할 수 있다. 실제 기능 검증은 인증된 제품 화면에서 수행한다.

## 실제 화면 캡처

| 조합 | 데스크톱 홈 | 모바일 홈 | 설정 |
| --- | --- | --- | --- |
| A 라이트 | [보기](editorial-light-home-desktop.png) | [보기](editorial-light-home-mobile.png) | [보기](editorial-light-settings-desktop.png) |
| A 다크 | [보기](editorial-dark-home-desktop.png) | [보기](editorial-dark-home-mobile.png) | [보기](editorial-dark-settings-desktop.png) |
| B 라이트 | [보기](studio-light-home-desktop.png) | [보기](studio-light-home-mobile.png) | [보기](studio-light-settings-desktop.png) |
| B 다크 | [보기](studio-dark-home-desktop.png) | [보기](studio-dark-home-mobile.png) | [보기](studio-dark-settings-desktop.png) |
| C 라이트 | [보기](console-light-home-desktop.png) | [보기](console-light-home-mobile.png) | [보기](console-light-settings-desktop.png) |
| C 다크 | [보기](console-dark-home-desktop.png) | [보기](console-dark-home-mobile.png) | [보기](console-dark-settings-desktop.png) |

각 조합의 모바일 설정 캡처도 같은 파일명 규칙의 `settings-mobile.png`로 저장했다. 데스크톱 캡처는 1440×1100, 모바일은 390×844 기준 전체 페이지다. 전체 페이지 캡처에서는 고정 하단 탭이 첫 뷰포트 위치에 표시된다.

## 검증

- ESLint, 단위 테스트 22개, 운영 빌드 통과.
- 여섯 팔레트의 본문·보조 글자, 기본·작업면·패널·상승 표면, 주요 버튼과 내비게이션의 색상 대비를 자동 검증한다. 비활성 요소와 장식 그래픽은 해당 대비 검사 대상이 아니다.
- 개발 환경에서 6개 조합 × 7개 주요 화면 × 2개 화면 크기, 총 84개 조합을 확인했다. 가로 넘침과 런타임 오류는 없었다. [기록](browser-checks.json)
- 운영 빌드에서 6개 조합 × 모바일 주요 4개 화면, 총 24개 조합과 테마·밝기 복원, 클립보드 저장 후 재조회, 모달 열기·닫기, 채팅 입력창과 하단 메뉴의 공간을 확인했다. [기록](production-checks.json)
- 360·430·768·1024·1280px에서 세 디자인의 홈·설정·채팅 45개 조합을 추가 확인했다. 가로 넘침과 런타임 오류는 없었고, 방향키로 테마 선택과 로그인 화면 적용을 확인했다. [기록](responsive-checks.json)
- API 요청은 브라우저에서 샘플 응답으로 대체하고 외부 요청을 차단했다. 운영 사용자 데이터는 사용하지 않았다. 운영 빌드의 테스트는 서비스 워커를 우회해 응답을 일관되게 주입했다. 실제 기기·설치형 PWA·서비스 워커 업데이트 QA는 별도다.

## 함께 수정한 동작

홈 재구성에 따라 클립보드 조회 실패를 빈 값이나 저장 완료로 표시하지 않도록 했다. 조회 실패 시 재시도를 제공하고, 저장 실패 시 입력을 유지한다. 저장 요청 중 추가한 입력도 이전 저장 응답으로 덮지 않도록 했다. 최근 메모 오류는 홈 전체를 막지 않고 독립적인 재시도를 제공한다.

채팅의 모바일 전환 기준을 앱 메뉴와 같은 1024px로 맞췄다. 새 상단 영역과 하단 탭 높이를 반영해 채팅 입력창의 가용 높이를 계산한다.

## 코드

- [팔레트와 저장 규칙](../../src/features/appearance/lib/themes.js)
- [설정 UI](../../src/features/appearance/components/AppearanceSettings.vue)
- [전체 화면 디자인 규칙](../../src/app/styles/appearance.css)
- [실제 홈](../../src/pages/Index.vue)
- [테마 상태](../../src/store/app.js)
- [Ant Design 연결](../../src/App.vue)
- [팔레트와 저장 검증](../../tests/appearance.test.js)

작업 브랜치는 `codex/design-renewal-20261029`다. `main`과 `codex/backup-main-20261029`는 보존한다. 이번 작업은 코드와 빌드 산출물에 적용했으며 운영 서버 배포는 수행하지 않았다.
