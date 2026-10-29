# Deepria Cloud 사용자 문구 한글화 실행 계획

작성일: 2026년 10월 29일

상태: 과업 등록 완료, 구현 예정

우선순위: P1

## 1. 목표

사용자가 실제 제품에서 접하는 기본 문구를 자연스러운 한국어로 통일한다. 현재 일부 한글화된 메뉴·홈 동작·설정 본문을 기준으로 기능 설명, 알림, 접근성 정보, 브랜드 그래픽까지 연결한다. A B C와 각 디자인의 라이트·다크에서 조판과 정보 위계를 유지한다.

이 문서는 구현 범위와 완료 기준을 정의한다. 과업 등록 시점에는 문구 변경을 실제 제품 코드에 적용하지 않았다. 전체 실행 상태는 [리뉴얼 계획서](ui-ux-improvement-plan-2026-10-29.md)를 기준으로 관리한다.

## 2. 과업 목록

| ID | 세부 작업 | 우선순위 | 상태 | 산출물 |
| --- | --- | --- | --- | --- |
| LOC-01 | 화면·공통 UI·상태·브랜드·동적 메시지 목록과 용어집 | P1 | 예정 | 위치, 현재 문구, 제안 문구, 사용 상태와 예외가 있는 목록 |
| LOC-02 | 파일·폴더·공유·업로드·할 일 한글화 | P1 | 예정 | 전체 작업 흐름의 한국어 기본 문구 |
| LOC-03 | 로그인·계정 메시지·메모·대화·공통 안내 한글화 | P1 | 예정 | 한국어 상태·알림·확인창·툴팁·접근성 라벨 |
| LOC-04 | 홈·사이드바·설정·그래픽 슬로건 한글화 | P1 | 예정 | 세 디자인의 한국어 그래픽과 크기별 조판 |
| LOC-05 | 동작·데이터 호환·레이아웃 회귀 검수 | P1 | 예정 | 잔여 영어 점검표, 기능 검사, 테마별 비교 캡처 |

## 3. 실제 코드에서 확인한 대상

아래 예시는 현재 소스에서 확인한 문구다. LOC-01에서 동적 문자열과 의존 라이브러리의 기본 표시까지 보완하며, 이 표를 문자열 전체 개수로 해석하지 않는다.

| 영역 | 현재 예시 | 변경 방향 | 주요 위치 |
| --- | --- | --- | --- |
| 파일 화면 | File Storage, Vault, Shared with me, Upload Settings, Security Check | 파일, 파일 보관함, 공유받은 파일, 업로드 설정, 보호 확인 | [S3.vue](../src/pages/Util/S3.vue) |
| 파일 목록과 폴더 | File Library, Loading files, files available, Ascending, All files, Unassigned, No folders yet | 파일 목록, 파일을 불러오는 중, 파일 N개, 오름차순, 전체 파일, 미분류, 아직 폴더가 없습니다 | [StorageFileList.vue](../src/features/storage/components/StorageFileList.vue), [StorageDirectoryTree.vue](../src/features/storage/components/StorageDirectoryTree.vue) |
| 업로드와 공유 | Choose file, Start Upload, People with access, Access removed, Folder added | 파일 선택, 업로드 시작, 접근 가능한 사용자, 접근 권한 해제, 폴더 추가 | [StorageUploadPanel.vue](../src/features/storage/components/StorageUploadPanel.vue), [S3.vue](../src/pages/Util/S3.vue) |
| 할 일 | Tasks, Task Description, Group, Priority, Done, All changes saved | 할 일, 작업 내용, 그룹, 우선순위, 완료, 변경사항을 저장했습니다 | [Todo.vue](../src/pages/Util/Todo.vue), [TodoQuickAdd.vue](../src/features/todo/components/TodoQuickAdd.vue) |
| 할 일 기본 표시 | Default, High | 기본 그룹, 높음 등 실제 의미에 맞춘 기본값 | [useTodos.js](../src/features/todo/composables/useTodos.js), [TodoBoard.vue](../src/features/todo/components/TodoBoard.vue) |
| 로그인 | Sign in, Continue with Google, Completing sign in | 로그인, Google로 계속하기, 로그인 처리 중 | [Login.vue](../src/pages/Auth/Login.vue) |
| 계정 동적 메시지 | Preferences saved, Friend request sent, Remove friend, Turn dark mode on | 환경설정을 저장했습니다, 친구 요청을 보냈습니다, 친구 삭제, 다크 모드 켜기 | [Account.vue](../src/pages/Auth/Account.vue) |
| 메모 | words | N단어로 표기하고 현재 단어 수 계산 의미 유지 | [MemoEditor.vue](../src/pages/Memo/MemoEditor.vue) |
| 대화 | New Chat, Assistant | 새 대화, AI 도우미로 기본 표시 통일 | [Chat.vue](../src/pages/Chat.vue), [chatStore.js](../src/features/chat/store/chatStore.js), [ChatSessionSidebar.vue](../src/features/chat/components/ChatSessionSidebar.vue), [ChatMessageList.vue](../src/features/chat/components/ChatMessageList.vue) |
| 공통 모달과 오류 | Close modal, Operation successful, An error occurred, Request failed, Download failed | 모달 닫기, 완료했습니다, 오류가 발생했습니다, 요청 실패, 다운로드 실패와 재시도 안내 | [BaseModal.vue](../src/components/base/BaseModal.vue), [useAsync.js](../src/shared/composables/useAsync.js), [http.js](../src/shared/api/http.js), [useDownload.js](../src/shared/composables/useDownload.js), [useStorage.js](../src/features/storage/composables/useStorage.js) |
| 홈과 사이드바 | A SPACE TO MAKE IT YOURS, CAPTURE, CONTINUE, MEMO, MY WORKSPACE, YOUR PERSONAL SPACE | 나만의 작업 공간, 빠른 기록, 이어서 작업하기, 메모, 내 작업 공간, 나만의 공간 | [Index.vue](../src/pages/Index.vue), [NavigationPC.vue](../src/components/NavigationPC.vue) |
| 설정과 그래픽 | MAKE IT YOURS, Make room, SPACE FOR POSSIBILITY, THINK → CAPTURE → CREATE | 나에게 맞는 공간, 생각을 위한 여백, 가능성을 펼치는 공간, 생각 → 기록 → 완성 | [AppearanceSettings.vue](../src/features/appearance/components/AppearanceSettings.vue), [WorkspaceArtwork.vue](../src/features/appearance/components/WorkspaceArtwork.vue) |
| 라이브러리 기본 UI | 확인·취소, 입력 지우기, 빈 상태 등 라이브러리 기본 문구 | Ant Design 한국어 locale 적용과 자체 확인창 문구를 함께 점검 | [App.vue](../src/App.vue), 각 화면의 모달 호출 |

## 4. 용어와 문장 규칙

| 의미 | 기본 표기 |
| --- | --- |
| Home, Workspace | 홈, 작업 공간 |
| Memos, Tasks, Storage, Chat | 메모, 할 일, 파일, 대화 |
| Settings, Preferences | 설정, 환경설정 |
| Group, Priority | 그룹, 우선순위 |
| Upload, Download, Preview | 업로드, 다운로드, 미리보기 |
| Shared with me, People with access | 공유받은 파일, 접근 가능한 사용자 |
| Save, Cancel, Confirm, Retry | 저장, 취소, 확인, 다시 시도 |
| Delete, Remove access | 삭제, 접근 권한 해제 |
| Loading, Saving, Saved, Save failed | 불러오는 중, 저장 중, 저장됨, 저장 실패 |
| New Chat, Assistant | 새 대화, AI 도우미 |
| words, files available | N단어, 파일 N개 |

버튼은 짧은 동작형, 설명과 알림은 자연스러운 존댓말을 사용한다. 실패 안내에는 가능한 경우 다음 행동을 포함한다. 삭제와 공유 해제처럼 결과가 다른 동작은 용어를 구분한다. 기존의 파일별 보호 키 기능은 일반적인 로그인 비밀번호와 구분한다.

날짜·시간은 한국어 형식과 사용자의 현지 시간 기준을 유지한다. 키보드 안내는 Enter·Shift·Ctrl·⌘ 표기를 유지하면서 주변 설명을 한글로 작성한다. 단어 수와 글자 수는 의미가 다르므로 계산 방식을 바꾸지 않고 단위를 번역한다.

## 5. 번역 대상과 보존 대상

### 한글화 대상

- 화면 제목, 부제, 섹션명, 설명, 버튼, 탭, 필터, 입력 예시와 placeholder.
- 토스트, 확인창, 기본 버튼, 빈 상태, 검색 결과 없음, 로딩, 실패와 재시도.
- title, aria-label, 스크린 리더 전용 안내와 의미 있는 이미지 대체 텍스트.
- 개수·날짜·정렬·파일 상태 등 조합해서 만들어지는 문장.
- 기본 새 대화 제목과 AI 도우미 역할 표시.
- 홈·사이드바·테마 설정·브랜드 그래픽의 영문 슬로건과 보조 문구.

### 의미와 식별자를 유지할 대상

- Deepria Cloud, Google, GitHub 등 공식 명칭과 필요한 AI·Markdown 표기.
- 파일 확장자, MIME 유형, 코드, URL과 키보드 키 이름.
- 사용자 메모·대화·파일명·폴더명·직접 설정한 그룹명·대화 제목.
- API 경로와 필드, enum·테마 ID, 저장 키, 내부 폴더 ID, 이벤트·함수·변수 이름.
- 기술 로그와 진단용 원본 오류. 사용자 안내로 노출할 문구는 별도로 정리한다.

Dashboard처럼 기능에 연결된 폴더는 내부 식별자와 화면 이름을 분리해 다룬다. 시스템 기본 표시를 한국어로 바꾸기 위해 사용자 폴더를 이름 변경하거나 대량 저장하지 않는다.

새 대화 기본 제목은 생성·목록·fallback·자동 제목 생성 조건을 함께 변경한다. 기존 영어 기본 제목과 사용자 지정 제목의 구분이 불확실하면 저장 내용을 일괄 수정하지 않고 호환 정책을 먼저 정한다.

## 6. 구현 방식

1. 사용자 노출 위치와 동작을 먼저 수집하고 용어집에 맞춰 문구를 확정한다.
2. 파일과 할 일을 먼저 처리하고 로그인·계정 메시지·메모·대화·공통 UI로 확장한다.
3. 반복되는 상태·확인 문구는 공통 상수나 헬퍼로 관리한다. 이번 범위만을 위해 언어 전환 기능을 새로 도입하지 않는다.
4. API의 영어 메시지를 그대로 토스트로 전달하는 경로를 확인한다. 알려진 오류 코드·상태에 한국어 안내를 연결하고, 알 수 없는 오류는 재시도 가능한 일반 안내로 처리한다. 업로드 CORS·다운로드 URL 등 진단 정보는 보존한다.
5. Ant Design의 한국어 locale을 실제 설치 버전에서 확인해 연결하고, 명시적으로 설정한 확인창·툴팁 문구도 점검한다.
6. 브랜드 그래픽과 보조 문구를 한글화하고 각 디자인의 조판을 조정한다.
7. 개발용 디자인 프리뷰에서 제품과 같은 문구를 공유하는 부분은 함께 갱신한다. 기존 캡처와 과거 문서는 역사적 기록으로 남긴다.

코드 전체의 영어를 문자열 치환하지 않는다. 번역은 사용자 노출 문자열에 한정하고, 이벤트 핸들러와 함수 참조·템플릿 표현식이 바뀌지 않았는지 diff와 빌드로 확인한다.

## 7. 검증과 완료 기준

- [ ] LOC-01 문구 목록에 위치·현재 값·한국어 값·사용 상태·예외를 기록했다.
- [ ] LOC-02 LOC-03 화면과 공통 안내를 구현했다.
- [ ] LOC-04의 장식 영문과 그래픽을 한국어로 재구성했다.
- [ ] 버튼과 제목뿐 아니라 로딩·빈 상태·실패·성공·확인·툴팁·aria-label을 확인했다.
- [ ] 새 대화 생성·자동 제목·이름 변경과 기존 저장 데이터를 검증했다.
- [ ] 파일·폴더·공유·보호 키·할 일 그룹의 식별자와 사용자 이름을 보존했다.
- [ ] 6개 테마에서 360·390·430·768·1024·1280·1440px와 전환점 전후를 점검했다.
- [ ] 긴 한글, 숫자, 영문 고유명사, 오류 안내가 섞여도 잘림과 가로 넘침이 없다.
- [ ] 모바일 키보드와 스크린 리더에 맞는 동작명·안내가 전달된다.
- [ ] lint·필요한 테스트·빌드를 통과하고 실제 브라우저에서 주요 동작을 확인했다.
- [ ] 정적 검색과 실제 렌더링을 함께 사용해 남은 영어를 분류했다.
- [ ] 허용된 고유명사·키 이름·사용자 콘텐츠를 제외한 사용자 노출 영어를 해소했다.

서버에서 오는 영어, 조건부 확인창과 오류 문구는 소스 정적 검색만으로 완료 처리하지 않는다. 정상·실패 응답과 실제 화면을 확인한다. 이미지나 그래픽 안의 문구도 캡처로 검수한다.

## 8. 산출물과 예상 작업량

문구 목록과 용어집 1일, 기능·공통 안내 적용 2~3일, 그래픽 조판·회귀 검수 1~2일로 총 4~6작업일을 초안으로 잡는다. 오류 코드 확인이나 실제 기기 확보가 필요하면 일정을 조정한다.

최종 산출물은 적용 코드, 사용자 문구 목록과 예외, 동작 검증 결과, 테마별 대표 비교 캡처다. 구현·검증·main 반영·운영 배포 상태를 구분해 기록한다.
