# GitHub Copilot Instructions

## 다른 프로젝트에서 이 지시사항 사용하기
이 지시사항 시스템을 다른 프로젝트에서도 사용하려면:
1. 이 프로젝트의 `.github/copilot-instructions.md` 파일을 새 프로젝트의 `.github/` 폴더로 복사
2. `.github/.prompt.txt` 파일도 함께 복사
3. 세션 관리 시스템을 사용하려면:
   - `.github/session-manager.md` 복사
   - `.github/current-session.md` 복사
   - `.github/project-context.md` 복사
   - `.github/work-history.md` 복사
   - `.github/sessions/` 폴더 구조 생성
4. **(선택) 프로젝트 목표 문서**: `.github/project-goal.md` 생성 (프로젝트 특성에 맞게)
5. 프로젝트별 특성에 맞게 내용 수정

---

git message 는 한국어로 생성해야 합니다.
생각 내용도 한국어로 생성해야 합니다.

지시한 사항을 묻지 않고 ./.github/.prompt.txt 에 업데이트 합니다.
매 작업을 시작할 때마다 ./.github/.prompt.txt 를 읽고 내용을 따릅니다.

모르는 내용이 있으면 mcp-websearch의 도구를 사용하여 직접 웹 검색을 수행합니다.
- `mcp_mcp-websearch_web_search` - 프로그래밍 관련 질문, API 사용법, 라이브러리 문서 등을 직접 검색
- `mcp_mcp-websearch_web_fetch` - 특정 URL의 문서나 가이드를 가져와서 읽기
- 사용자에게 ChatGPT에게 물어보라고 요청하지 않음

## 프로젝트 목표 및 컨텍스트 (최우선!)

### 작업 시작 전 필수 확인
**모든 작업을 시작하기 전에 프로젝트 맥락을 이해해야 합니다.**

다음 파일들을 확인하세요:
1. **`.github/project-context.md`** (필수) - 프로젝트 전체 맥락, 기술 스택, 개발 환경
2. **`.github/project-goal.md`** (선택) - 상세한 프로젝트 목표, 아키텍처, 체크리스트
   - 이 파일이 있다면 반드시 먼저 읽기
   - 없다면 project-context.md만 참조

작업 시작 시:
1. `.github/project-context.md` 읽기 (필수)
2. `.github/project-goal.md` 읽기 (있는 경우)
3. 현재 작업이 프로젝트 목표와 부합하는지 확인
4. 필요한 기술 스택 및 설정 정보 파악
5. 작업 진행

## 코드 품질 관리 및 에러 검증

### 코드 변경 후 반드시 에러 확인 (중요!)
**모든 코드 변경 작업 완료 후 반드시 `get_errors` 도구로 문법 오류 확인:**

1. **에러 확인 및 수정 절차**
   ```
   1. 코드 수정 완료
   2. get_errors 도구 실행하여 컴파일 에러 확인
   3. 에러 발견 시 즉시 수정
      - import 누락: 필요한 import 문 추가
      - 타입 불일치: 올바른 타입으로 수정
      - 메서드 시그니처 오류: 정확한 파라미터/리턴 타입 사용
   4. 다시 get_errors로 검증
   5. 에러 없을 때까지 반복
   ```

2. **주의사항**
   - 프로젝트별 빌드 시스템 확인 (npm, Maven, Gradle 등)
   - 의존성 관리 파일 확인 (package.json, pom.xml, build.gradle 등)
   - 언어별 특성 고려

## MCP Tools 사용 규칙

### 사용 가능한 MCP 서버
VSCode의 `mcp.json`에 다음 MCP 서버들이 등록되어 있습니다:

1. **mcp-websearch** - 웹 검색 및 크롤링
   - Repository: https://github.com/lisyoen/mcp-websearch
   - 설치 경로: `D:\git\mcp-websearch`
   - `mcp_mcp-websearch_web_search` - Bing 검색
   - `mcp_mcp-websearch_web_fetch` - URL 페이지 가져오기
   - `mcp_mcp-websearch_web_scrape` - CSS 선택자로 스크래핑
   - `mcp_mcp-websearch_web_crawl` - BFS 크롤링

2. **mcp-fileops** - 로컬 파일 작업
   - Repository: https://github.com/lisyoen/mcp-fileops
   - 설치 경로: `D:\git\mcp-fileops`
   - `mcp_mcp-fileops_read_file` - 파일 읽기
   - `mcp_mcp-fileops_write_to_file` - 파일 쓰기
   - `mcp_mcp-fileops_append_to_file` - 파일에 추가
   - `mcp_mcp-fileops_list_directory` - 디렉토리 목록
   - `mcp_mcp-fileops_delete_file` - 파일 삭제
   - `mcp_mcp-fileops_open_file_vscode` - VSCode에서 파일 열기

### MCP 서버 자동 설치 및 설정
필요한 MCP 서버가 없는 경우 자동으로 설치합니다:

<<<<<<< Updated upstream
1. **디렉토리 존재 확인**
=======
이 프로젝트는 VSCode 확장 프로그램으로, 프로젝트 내부 파일은 기본 VSCode 도구를 사용하고,
**프로젝트 외부 파일 (예: 다른 프로젝트, 설정 파일 등)에만 MCP 도구를 사용합니다.**

1. **파일 읽기**: `mcp_mcp-fileops_read_file`
   ```
   Tool: mcp_mcp-fileops_read_file
   Args: { "path": "파일경로" }
   ```

2. **파일 쓰기** (생성/덮어쓰기): `mcp_mcp-fileops_write_to_file`
   - **반드시** 파일을 먼저 VSCode에서 연 후 사용
   ```
   Tool: mcp_mcp-fileops_write_to_file
   Args: { "path": "파일경로", "content": "..." }
   ```

3. **파일에 추가**: `mcp_mcp-fileops_append_to_file`
   - **반드시** 파일을 먼저 VSCode에서 연 후 사용
   ```
   Tool: mcp_mcp-fileops_append_to_file
   Args: { "path": "파일경로", "content": "..." }
   ```

4. **디렉토리 목록**: `mcp_mcp-fileops_list_directory`
   ```
   Tool: mcp_mcp-fileops_list_directory
   Args: { "path": "디렉토리경로" }
   ```

5. **파일 삭제**: `mcp_mcp-fileops_delete_file`
   ```
   Tool: mcp_mcp-fileops_delete_file
   Args: { "path": "파일경로" }
   ```

### 파일 생성/쓰기 작업 (프로젝트 외부 파일)
**프로젝트 외부 파일 (.github/, 설정 파일 등) 생성 및 수정 시:**

**올바른 순서 (필수!):**
1. **먼저** PowerShell로 파일을 VSCode에서 열기 (파일이 없어도 열림)
>>>>>>> Stashed changes
   ```powershell
   Test-Path "D:\git\mcp-websearch"
   Test-Path "D:\git\mcp-fileops"
   ```

2. **없으면 Git Clone 및 빌드**
   ```powershell
   # mcp-websearch 설치
   if (!(Test-Path "D:\git\mcp-websearch")) {
       cd D:\git
       git clone https://github.com/lisyoen/mcp-websearch.git
       cd mcp-websearch
       npm install
       npm run build
   }
   
   # mcp-fileops 설치
   if (!(Test-Path "D:\git\mcp-fileops")) {
       cd D:\git
       git clone https://github.com/lisyoen/mcp-fileops.git
       cd mcp-fileops
       npm install
       npm run build
   }
   ```

3. **VSCode MCP 설정 확인**
   - 설정 파일: `$env:APPDATA\Code\User\mcp.json`
   - 필요 시 자동으로 서버 등록 추가

### 파일 작업 도구 사용 우선순위

**원칙: 빌트인 도구 우선, 실패 시에만 MCP 도구 사용**

#### 파일 작업 우선순위

1. **파일 읽기**
   - 1순위: `read_file` (빌트인 도구)
   - 2순위: `mcp_mcp-fileops_read_file` (빌트인 실패 시)

2. **디렉토리 목록**
   - 1순위: `list_dir` (빌트인 도구)
   - 2순위: `mcp_mcp-fileops_list_directory` (빌트인 실패 시)

3. **파일 생성**
   - 1순위: `create_file` (빌트인 도구)
   - 2순위: `mcp_mcp-fileops_write_to_file` (빌트인 실패 시)

4. **파일 수정**
   - 1순위: `replace_string_in_file` (빌트인 도구)
   - 2순위: `mcp_mcp-fileops_write_to_file` (빌트인 실패 시)

5. **파일에 내용 추가**
   - 작업 영역 내: 빌트인 도구 사용 (필요 시 파일 읽기 + 수정)
   - 작업 영역 외: `mcp_mcp-fileops_append_to_file`

6. **파일 삭제**
   - PowerShell 명령 또는 `mcp_mcp-fileops_delete_file`

#### MCP 도구를 사용해야 하는 경우
- ✅ 작업 영역(workspace) 외부 파일 작업
- ✅ 빌트인 도구 실패 시
- ✅ 특수한 파일 시스템 작업

#### 빌트인 도구 사용 시 주의사항
- `replace_string_in_file`: 변경 전후 3-5줄 컨텍스트 포함
- `create_file`: 완전한 파일 내용 제공
- 에러 발생 시 MCP 도구로 대체

## 작업 세션 연속성 관리

### 세션 관리 파일 구조

1. **`.github/current-session.md`** - 현재 활성 세션 정보 (간략)
   - 현재 세션 ID만 표시
   - 상세 내용은 세션 파일 참조

2. **`.github/session-manager.md`** - 최근 10개 세션 목록
   - 최근 작업만 추적
   - 오래된 세션은 work-history.md로 이동

3. **`.github/sessions/session-ID.md`** - 각 세션의 상세 정보
   - 작업 목적, 계획, 진행 상황, 결과
   - 모든 세션 정보는 여기에만 기록

4. **`.github/work-history.md`** - 완료된 옛날 세션 아카이브

5. **`.github/project-context.md`** - 프로젝트 전체 맥락

### 작업 시작 시

1. **Git 동기화 및 세션 확인**
   ```
   git pull
   ```

2. **현재 세션 확인**
   - `.github/current-session.md` 읽기 → 현재 세션 ID 확인
   - `.github/sessions/session-ID.md` 읽기 → 상세 정보 로드
   - `.github/project-context.md` 읽기 → 프로젝트 맥락 확인
   - `.github/project-goal.md` 읽기 (있는 경우) → 프로젝트 목표 확인

3. **새 작업 시작하는 경우**
   - 새 세션 파일 생성 (`.github/sessions/session-ID.md`)
   - current-session.md 업데이트 (새 세션 ID로 변경)
   - session-manager.md에 새 세션 추가
   - TODO 리스트 생성 (manage_todo_list 도구)

### 작업 중

- **세션 파일만 업데이트**: `.github/sessions/session-ID.md`
- 진행 상황, 결정사항, 문제점 등을 지속적으로 기록
- current-session.md와 session-manager.md는 필요 시에만 간단히 업데이트

### 작업 완료 시

1. **세션 파일 완료 처리**
   - `.github/sessions/session-ID.md`: 상태 "완료", 결과 작성
   - 테스트 방법 제시 (중요!)

2. **관리 파일 업데이트**
   - `.github/session-manager.md`: 상태 "완료"로 변경
   - `.github/current-session.md`: 다음 세션 준비 (또는 비우기)

3. **Git 동기화**
   ```
   git add .
   git commit -m "세션 session-ID 완료: [작업 요약]"
   git push
   ```

### 세션 ID 형식

**형식**: `session-YYYYMMDD-XXX-description`
- YYYYMMDD: 날짜 (예: 20251108)
- XXX: 일자별 순차 번호 (001부터)
- description: 간단한 작업 설명 (선택적)

<<<<<<< Updated upstream
**예시**: `session-20251113-001-api-integration`
=======
### 분석 작업 시 실시간 기록 규칙 (중요!)

**문제점**: 분석 작업 중 자주 중단되어 진행 상황 손실

**해결책**: 각 단계마다 즉시 세션 파일에 기록

#### 분석 시작 전 준비
1. `.github/.prompt.txt` 파일 읽기 (분석 워크플로우 규칙)
2. 세션 파일에 "분석 진행 상황" 섹션 생성
3. 전체 분석 단계를 체크리스트로 작성

#### 분석 중 즉시 기록 규칙
**반드시 기록해야 하는 시점**:
- ✅ 각 분석 단계 시작 시
- ✅ 파일 1-2개 읽은 후 발견 사항 기록
- ✅ 중요한 발견이 있을 때마다
- ✅ 검색 후 결과 요약
- ✅ 각 단계 완료 시 + 다음 단계 계획
- ✅ 10-15분마다 진행 상황 요약

**기록 형식**:
```markdown
#### [N]단계: [단계명]
**시작**: YYYY-MM-DD HH:MM
**목적**: 무엇을 알아내려고 하는가

**세부 작업**:
- [ ] 작업 1
- [ ] 작업 2

**탐색한 파일/코드**:
- `파일경로` - 발견 내용 요약

**발견 사항**:
1. 핵심 발견 1
2. 핵심 발견 2

**다음 단계**: 다음에 무엇을 할 것인가
```

#### 중단 후 재개 프로세스
1. 세션 파일의 "분석 진행 상황" 섹션 읽기
2. 체크리스트에서 마지막 완료 단계 확인
3. "다음 단계" 내용 읽고 이어서 진행
4. 중단된 단계가 있으면 해당 단계부터 재시작

**핵심**: 분석 중 언제든 중단되어도 이어갈 수 있도록 발견 사항을 즉시 세션 파일에 기록!

### Git 동기화 절차 (중요!)
**동기화 명령 시 순서**:
1. **먼저** 모든 세션 파일 상태를 "동기화 완료"로 미리 업데이트
2. **그 다음** git add, commit, push 실행
3. 동기화 후 추가 세션 파일 업데이트 금지 (순환 문제 방지)
>>>>>>> Stashed changes

---

**핵심 원칙**: 
- 상세 정보는 **세션 파일 하나**에만 기록
- 관리 파일들은 **참조용으로만** 사용 (최소한의 정보만)
- 중복 기록 금지
