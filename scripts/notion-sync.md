# Notion 페이지 GitHub 업로드 자동화

Notion `CS study` 데이터베이스에서 내 페이지를 Markdown 파일로 변환해 GitHub 레포의 주제별 폴더에 저장하는 스크립트입니다.

## 업로드 규칙

- `1월 2주차`, `1월 3주차` 페이지는 항상 제외합니다.
- `주제`가 비어 있는 페이지는 `00. 자율 주제`에 저장합니다.
- `컴퓨터 구조`, `CPU`, `문자 인식`은 `01. 컴퓨터 구조`에 저장합니다.
- `운영체제`는 `02. 운영체제`에 저장합니다.
- `자료 구조`, `자료구조`, `이진탐색트리`, `알고리즘`은 `03. 자료구조 및 알고리즘`에 저장합니다.
- `네트워크`, `웹/앱`은 `04. 네트워크`에 저장합니다.
- `데이터베이스`는 `05. 데이터베이스`에 저장합니다.
- 파일명은 Notion 페이지의 `제목`과 같게 만들고, 파일 시스템에서 쓸 수 없는 문자만 공백으로 바꿉니다.
- Notion 이미지 파일은 동기화 시점에 다운로드해 `assets/notion/{페이지ID}/` 아래에 저장하고, Markdown에서는 상대경로로 참조합니다.

## 준비

1. Notion에서 internal integration을 만들고 token을 발급합니다.
2. `CS study` 데이터베이스를 integration과 공유합니다.
3. 레포를 fork/clone하고 개인 브랜치를 만듭니다.

```bash
git checkout -b feature/notion-sync-my-pages
```

## 매주 자동 PR 생성 설정

이 레포에는 `.github/workflows/sync-notion.yml` 워크플로를 둘 수 있습니다. 워크플로는 매주 화요일 23:00 KST에 실행되며, `깃헙` 체크박스가 꺼진 모든 페이지를 작성자별로 나누어 Markdown으로 변환한 뒤 작성자별 브랜치와 Pull Request를 만듭니다.

자동 실행을 쓰려면 레포 설정에 아래 값을 추가합니다.

1. `Settings` → `Secrets and variables` → `Actions` → `Secrets`
2. `NOTION_TOKEN` 추가
3. 선택 사항: `Variables`에 `NOTION_DATA_SOURCE_ID` 추가
4. `Settings` → `Actions` → `General`에서 `Workflow permissions`를 `Read and write permissions`로 설정
5. 같은 화면에 `Allow GitHub Actions to create and approve pull requests`가 보이면 활성화

`NOTION_DATA_SOURCE_ID`를 따로 넣지 않으면 스크립트에 들어 있는 기본 `CS study` 데이터 소스를 사용합니다.

수동으로 즉시 실행하려면 GitHub에서 `Actions` → `Sync Notion pages` → `Run workflow`를 누릅니다.

자동화 순서:

1. Notion 데이터베이스에서 `깃헙 = false`인 페이지를 조회합니다.
2. `1월 2주차`, `1월 3주차`는 제외합니다.
3. 페이지를 `발표자` 기준으로 그룹화합니다.
4. 작성자별 브랜치를 만듭니다.
   - 예: `notion-sync/이혜림`
5. 작성자별 페이지를 주제 규칙에 맞춰 Markdown 파일로 생성합니다.
   - 페이지 안의 이미지는 `assets/notion/{페이지ID}/image-01.png` 같은 파일로 함께 저장합니다.
6. 작성자별 브랜치에 커밋하고 push합니다.
7. 작성자별 Pull Request를 생성하거나 기존 PR을 업데이트합니다.
8. PR 생성 또는 업데이트가 성공하면 처리한 Notion 페이지의 `깃헙` 체크박스를 켭니다.

PR 작성자는 `github-actions[bot]`입니다. 작성자 이름은 브랜치명, PR 제목, PR 본문에 들어갑니다.

작성자별 PR 예시:

```plain text
notion-sync/이혜림 -> docs: sync Notion pages for 이혜림
notion-sync/진석 -> docs: sync Notion pages for 진석
```

## 내 Notion user id 확인

```bash
NOTION_TOKEN=secret_xxx node scripts/sync-notion-pages.mjs --list-users
```

출력에서 본인 이름 옆 UUID를 복사합니다.

## 방법 1. 실행할 때 페이지 선택하기

가장 안전한 방식입니다. 스크립트가 후보 페이지 목록과 저장될 경로를 보여주면 번호를 입력합니다.

```bash
NOTION_TOKEN=secret_xxx \
NOTION_USER_ID=본인_USER_ID \
node scripts/sync-notion-pages.mjs --interactive
```

선택 입력 예시:

```plain text
1,3,5-7
all
```

파일을 만들기 전에 결과만 보고 싶으면 `--dry-run`을 같이 붙입니다.

```bash
NOTION_TOKEN=secret_xxx \
NOTION_USER_ID=본인_USER_ID \
node scripts/sync-notion-pages.mjs --interactive --dry-run
```

## 방법 2. Notion에서 선택한 페이지만 가져오기

Notion 데이터베이스의 `깃헙` 체크박스를 “이번에 업로드할 페이지” 표시로 사용합니다.

1. 업로드할 페이지의 `깃헙` 체크박스를 켭니다.
2. 아래 명령을 실행합니다.

```bash
NOTION_TOKEN=secret_xxx \
NOTION_USER_ID=본인_USER_ID \
node scripts/sync-notion-pages.mjs --selected-only
```

Notion 버튼을 만들고 싶다면 버튼 액션을 “현재 페이지의 `깃헙` 체크박스 켜기”로 설정하면 됩니다. 버튼 자체가 로컬 GitHub 업로드 스크립트를 직접 실행하지는 못하므로, 버튼은 선택 표시 역할로 쓰고 실제 변환/커밋은 이 스크립트가 담당합니다.

## 기본 실행

선택 모드를 쓰지 않으면 `발표자`가 본인이고 `깃헙` 체크박스가 꺼져 있는 페이지를 모두 가져옵니다.

```bash
NOTION_TOKEN=secret_xxx \
NOTION_USER_ID=본인_USER_ID \
node scripts/sync-notion-pages.mjs
```

이미 업로드한 페이지까지 포함하려면 `--include-uploaded`를 추가합니다.

```bash
NOTION_TOKEN=secret_xxx \
NOTION_USER_ID=본인_USER_ID \
node scripts/sync-notion-pages.mjs --include-uploaded
```

## 전체 데이터베이스 배치 실행

GitHub Actions에서는 특정 발표자 필터 없이 전체 데이터베이스를 대상으로 실행한 뒤 작성자별로 나눕니다. 작성자 목록만 확인하려면 다음 명령을 사용합니다.

```bash
NOTION_TOKEN=secret_xxx \
node scripts/sync-notion-pages.mjs --all --write-authors /tmp/notion-authors.json
```

특정 작성자의 페이지만 생성하려면 `--user-id`를 사용합니다.

```bash
NOTION_TOKEN=secret_xxx \
node scripts/sync-notion-pages.mjs \
  --user-id 작성자_NOTION_USER_ID \
  --write-page-ids /tmp/notion-synced-pages.json
```

생성 결과에는 Markdown 파일과 이미지 파일이 함께 포함됩니다.

```plain text
00. 자율 주제/Redis를 써보자.md
assets/notion/3334f7753cf280e89bb3d33d75d863b1/image-01.png
```

Actions처럼 PR 생성 후에만 Notion 체크박스를 켜려면 처리한 페이지 ID를 파일로 저장한 뒤, PR 생성이 성공한 다음 별도 명령으로 체크합니다.

```bash
NOTION_TOKEN=secret_xxx \
node scripts/sync-notion-pages.mjs --mark-page-ids /tmp/notion-synced-pages.json
```

## PR 올리기

자동화 파일이 레포에 들어간 뒤에는 직접 PR을 만들 필요가 없습니다. GitHub에서 `Actions` → `Sync Notion pages` → `Run workflow`를 누르면 작성자별 브랜치와 PR이 자동으로 생성됩니다.

매주 자동 실행은 화요일 23:00 KST에 동작합니다.
