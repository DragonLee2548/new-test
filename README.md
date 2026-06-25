# 먼작귀 파티 ✨

치이카와·우사기·하치와레 캐릭터로 즐기는 미니게임 파티입니다.

| 경로 | 설명 |
|------|------|
| `/` | `/v2`로 리다이렉트 |
| `/v2` | 캐릭터 선택 + 게임 허브 |
| `/v2/mole` | 두더지 잡기 (40초 / 60초) |
| `/v2/maze` | 미로 탈출 (하·중·상) |
| `/v2/rps` | 가위바위보 10승 타임어택 |
| `/v1` | 데이트 신청 4단계 시뮬레이션 (레거시) |

## 실행 방법

```bash
npm install
cp .env.example .env.local
npm run dev
```

브라우저에서 http://localhost:3000 접속 → `/v2`로 이동합니다.

## 환경 변수

`.env.example` 참고. 주요 항목:

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_V2_SCORES_URL` | v2 미니게임 신기록 저장 (Google Apps Script) |
| `NEXT_PUBLIC_GOOGLE_SHEETS_URL` | v1 데이트 답변 저장 (Google Sheets) |
| `NEXT_PUBLIC_SITE_URL` | Open Graph 미리보기용 사이트 URL (배포 시 설정) |
| `NEXT_PUBLIC_BASE_PATH` | GitHub Pages 서브경로 (로컬은 비움) |

### v2 신기록 저장 (Google Sheets)

1. [Google Sheets](https://sheets.google.com) 새 스프레드시트 생성
2. 1행 헤더: `시간` | `game` | `character` | `difficulty` | `score` | `ms` | `name` | `at`
3. **확장 프로그램 → Apps Script** → [`google-apps-script/V2Scores.gs`](google-apps-script/V2Scores.gs) 붙여넣기
4. **배포 → 새 배포 → 웹 앱** (실행: 나, 액세스: 모든 사용자)
5. 배포 URL → `.env.local`:
   ```
   NEXT_PUBLIC_V2_SCORES_URL=https://script.google.com/macros/s/xxxxx/exec
   ```
6. GitHub Pages: **Settings → Secrets and variables → Actions → Variables**에 동일하게 등록

URL을 설정하지 않으면 브라우저 `localStorage`에만 기록이 남습니다.

### v1 답변 저장 (Google Sheets / Forms)

v1(`/v1`) 전용. 둘 중 **하나만** 설정하면 됩니다.

#### 방법 A — Google Sheets (추천)

1. [Google Sheets](https://sheets.google.com) 새 스프레드시트 생성
2. 1행 헤더: `시간` | `데이트수락` | `요일` | `음식`
3. **확장 프로그램 → Apps Script** → [`google-apps-script/Code.gs`](google-apps-script/Code.gs) 붙여넣기
4. **배포 → 새 배포 → 웹 앱** (실행: 나, 액세스: 모든 사용자)
5. 배포 URL → `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/xxxxx/exec
   ```

#### 방법 B — Google Forms

1. [Google Forms](https://forms.google.com) 새 폼 생성
2. 단답형 질문 3개: `데이트 수락`, `요일`, `음식`
3. 미리 채우기 링크에서 `entry.xxxxx` ID 확인 후 `.env.local` 설정 (`.env.example` 참고)

#### 로컬 파일 저장 (개발용)

Google URL 없이 `npm run dev` 시 v1 제출은 `data/submissions.json`, `data/submissions.txt`에 저장됩니다.

## GitHub Pages 배포

Settings → Pages → Source: **GitHub Actions** → `main` push 시 `.github/workflows/nextjs.yml`로 배포.

- URL: `https://<username>.github.io/new-test/`
- **Variables에 Google URL 등록**해야 배포 사이트에서도 저장이 동작합니다.
- Open Graph 미리보기는 workflow가 `NEXT_PUBLIC_SITE_URL`을 자동 주입합니다.

## 미니게임 요약

1. **두더지 잡기** — 뿅망치로 두더지 팡팡, 40초 / 60초 모드
2. **미로 탈출** — 방향키로 출구 찾기, 난이도 3단계
3. **가위바위보** — 10번 먼저 이기기, 클리어 시간 기록

캐릭터(우사기 / 치이카와 / 하치와레)를 고르면 각 게임에서 해당 캐릭터 이미지가 적용됩니다.
