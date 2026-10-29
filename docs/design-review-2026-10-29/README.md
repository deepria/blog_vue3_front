# Deepria Cloud 첫 디자인 비교

작성일: 2026년 10월 29일

> 후속 구현: 세 방향을 모두 [실제 설정에서 선택 가능한 제품 테마](../theme-implementation-2026-10-29/README.md)로 적용했다. 아래는 초기 탐색 단계의 기록이다.

리뉴얼 1차 구현은 개발용 디자인 프리뷰다. 세 가지 시각 방향을 같은 콘텐츠로 비교하고, A 방향의 홈과 메모를 두 기기와 두 테마로 구체화했다. 실제 제품 화면으로의 전환은 후속 단계다.

## 실행과 확인

프런트엔드 폴더에서 `npm run dev -- --host 127.0.0.1`을 실행하고 [디자인 프리뷰](http://127.0.0.1:5173/design-preview)를 연다. 로그인과 API 연결이 필요하지 않다. 이 경로와 전용 컴포넌트는 운영 빌드에서 제외된다.

- [스크린샷 비교 보드](index.html)
- [A 편집 디자인](http://127.0.0.1:5173/design-preview?direction=editorial)
- [B 그래픽 스튜디오](http://127.0.0.1:5173/design-preview?direction=studio)
- [C 작업 콘솔](http://127.0.0.1:5173/design-preview?direction=console&theme=dark)
- [A 메모 밝은 테마](http://127.0.0.1:5173/design-preview?direction=editorial&screen=memo)
- [A 메모 어두운 테마](http://127.0.0.1:5173/design-preview?direction=editorial&screen=memo&theme=dark)

상단 도구에서 방향, 홈·메모, 테마를 전환할 수 있다. 창 크기에 따라 모바일과 태블릿 구성이 적용된다. 클립보드 입력과 복사, 샘플 저장 표시, 메모 선택·검색·새 문서·읽기·편집을 지원한다. 샘플 편집 내용은 새로고침하면 초기화된다. 할 일·파일·대화 메뉴는 이번 탐색에서 비활성 상태다.

## 세 방향의 차이

| 방향 | 시각적 특징 | 발전 시 확인할 점 |
| --- | --- | --- |
| A 편집 디자인 | 따뜻한 중성 바탕, 파란 강조, 큰 제목, 가벼운 목록, 풍경을 추상화한 그래픽 | 많은 데이터에서도 제목·본문·보조 정보의 밀도를 조절하기 |
| B 그래픽 스튜디오 | 어두운 내비게이션, 라임과 바이올렛, 굵은 제목과 타이포그래피 그래픽, 각진 면 | 긴 작업 화면에서 강한 대비의 사용량 조절 |
| C 작업 콘솔 | 격자와 궤도 그래픽, 제한된 곡률, 정밀한 메타 정보, 밀도 높은 구성 | 장문 읽기와 낮 환경 가독성 |

A를 계획서의 우선 후보로 구체화했으며 최종 선택된 디자인을 의미하지 않는다. 서체는 현재 기기의 시스템 한글 서체를 사용한다. Pretendard 등 브랜드 서체 도입과 실제 꽃 아이콘의 통합은 후속 디자인 작업이다. 그래픽은 CSS로 제작했으며 사용자 사진이나 외부 미디어를 사용하지 않는다.

## 비교 이미지

| 화면 | 데스크톱 | 모바일 |
| --- | --- | --- |
| 기존 홈 | [이미지](before-home-desktop.png) | [이미지](before-home-mobile.png) |
| 기존 메모 | [이미지](before-memo-desktop.png) | [이미지](before-memo-mobile.png) |
| 기존 파일 | [이미지](before-files-desktop.png) | [이미지](before-files-mobile.png) |
| 기존 채팅 | [이미지](before-chat-desktop.png) | [이미지](before-chat-mobile.png) |
| A 홈 | [이미지](editorial-home-desktop.png) | [이미지](editorial-home-mobile.png) |
| B 홈 | [이미지](studio-home-desktop.png) | [이미지](studio-home-mobile.png) |
| C 홈 | [이미지](console-home-desktop.png) | [이미지](console-home-mobile.png) |
| A 홈 밝은 테마 | [이미지](editorial-home-light-desktop.png) | [이미지](editorial-home-light-mobile.png) |
| A 홈 어두운 테마 | [이미지](editorial-home-dark-desktop.png) | [이미지](editorial-home-dark-mobile.png) |
| A 메모 밝은 테마 | [이미지](editorial-memo-light-desktop.png) | [이미지](editorial-memo-light-mobile.png) |
| A 메모 어두운 테마 | [이미지](editorial-memo-dark-desktop.png) | [이미지](editorial-memo-dark-mobile.png) |

기존 화면은 API 응답을 샘플 계정·클립보드·메모·파일 데이터로 대체하고 외부 네트워크 요청을 차단해 캡처했다. 홈 갤러리는 비활성이고 채팅은 빈 대화 상태다. 운영 데이터나 로그인 세션을 사용하지 않았다. 화면 캡처 시 개발 도구 배지만 숨겼다. 모바일 전체 페이지 캡처의 하단 탭은 첫 뷰포트 위치에 표시되며 실제 화면에서는 스크롤 중에도 하단에 고정된다.

기존 캡처 크기는 데스크톱 1440×1000, 모바일 390×844다. 디자인 시안 캡처는 데스크톱 1440×1100, 모바일 390×844이며 긴 화면은 전체 페이지를 저장했다. 따라서 화면 점유율과 작업 시간의 정량 비교 자료로 사용하지 않는다. 스타일과 구성을 비교하기 위한 자료다.

## 검증 결과

- ESLint, 기존 단위 테스트 17개, 운영 빌드 통과.
- 브라우저에서 44개 화면·너비 조합의 가로 넘침과 런타임 오류를 확인했다. 가로 넘침과 오류는 없었고 프리뷰의 실제 API 호출도 0건이었다. [검사 기록](browser-checks.json)
- 검사 너비는 360·390·430·768·1024·1280·1440px다. 이 검사는 에뮬레이션이며 실제 기기 QA를 대체하지 않는다.
- 방향 전환 중 클립보드 입력 유지, 샘플 저장 표시, 새 메모, 편집·읽기, 메모 선택·검색, 테마와 URL 복원, 모바일 탐색을 확인했다.
- 운영 산출물에서 디자인 프리뷰 모듈과 경로가 제외됨을 확인한다.

## 다음 구현 범위

1. 실제 화면과 비교해 대표 시안의 제목 크기, 보조 정보, 이미지 비율과 모바일 밀도를 조정한다.
2. 선택 방향의 브랜드 심벌·서체와 색상 대비를 확정하고 공통 토큰으로 분리한다.
3. 파일·채팅·할 일·로그인·계정의 시각 구성을 확장한다.
4. 메모 저장 경쟁, 조회 오류 등 P0 기반 작업을 기존 기능과 결합한다.
5. 실제 기기와 PWA에서 검수한 뒤 제품 화면으로 단계적으로 전환한다.

## 작업 보존

- 원본 main: `88f9f7836469ec5bda7e7f00b0cbd0728d954641`
- 로컬 백업 브랜치: `codex/backup-main-20261029`
- 작업 브랜치: `codex/design-renewal-20261029`
- 기존 미커밋 문서 보존 커밋: `8c0704e`

백업 브랜치는 main과 동일한 커밋을 가리킨다. 미커밋이었던 PWA 인수인계 변경과 두 계획 문서는 작업 브랜치의 첫 체크포인트에 함께 보존했다. 백엔드와 Android 저장소는 변경하지 않았다.
