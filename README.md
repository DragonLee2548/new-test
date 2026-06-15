# 데이트 신청 시뮬레이션 💌

여자친구에게 데이트를 신청하는 4단계 시뮬레이션 게임입니다.

## 실행 방법

```bash
npm install
cp .env.example .env.local   # Google Sheets/Forms URL 설정
npm run dev
```

브라우저에서 http://localhost:3000 접속.

## 답변 저장 (Google Sheets / Forms)

GitHub Pages는 서버가 없어서 **Google Sheets 또는 Google Forms**로 저장합니다.
둘 중 **하나만** 설정하면 됩니다 (Sheets 추천).

### 방법 A — Google Sheets (추천)

1. [Google Sheets](https://sheets.google.com) 새 스프레드시트 생성
2. 1행 헤더 입력: `시간` | `데이트수락` | `요일` | `음식`
3. **확장 프로그램 → Apps Script** → [`google-apps-script/Code.gs`](google-apps-script/Code.gs) 내용 붙여넣기
4. **배포 → 새 배포 → 웹 앱**
   - 실행: **나**
   - 액세스: **모든 사용자**
5. 배포 URL 복사 → `.env.local`에 설정:
   ```
   NEXT_PUBLIC_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/xxxxx/exec
   ```
6. GitHub Pages 배포 시: 저장소 **Settings → Secrets and variables → Actions → Variables** 에
   `NEXT_PUBLIC_GOOGLE_SHEETS_URL` 추가 후 push

제출하면 시트에 한 줄씩 쌓입니다.

### 방법 B — Google Forms

1. [Google Forms](https://forms.google.com) 새 폼 생성
2. 단답형 질문 3개 추가: `데이트 수락`, `요일`, `음식`
3. 폼 우측 **⋮ → 미리 채우기 링크 받기** → 각 항목에 테스트 값 입력 → 링크 생성
4. 링크 URL에서 `entry.123456789` 형태의 ID 확인
5. `.env.local` 설정:
   ```
   NEXT_PUBLIC_GOOGLE_FORM_ACTION=https://docs.google.com/forms/d/e/FORM_ID/formResponse
   NEXT_PUBLIC_GOOGLE_FORM_ENTRY_ACCEPT=entry.111111111
   NEXT_PUBLIC_GOOGLE_FORM_ENTRY_DAY=entry.222222222
   NEXT_PUBLIC_GOOGLE_FORM_ENTRY_FOOD=entry.333333333
   ```
6. GitHub Variables에도 동일하게 등록

폼 응답은 **응답 → 스프레드시트에 연결**로 시트에서도 볼 수 있습니다.

### 로컬 파일 저장 (개발용)

Google URL을 설정하지 않으면 `npm run dev` 시 `data/submissions.json`, `data/submissions.txt`에 저장됩니다.

## GitHub Pages 배포

Settings → Pages → Source: **GitHub Actions** → `main` push 시 `.github/workflows/nextjs.yml` 배포.

- URL: `https://<username>.github.io/new-test/`
- **Google Sheets/Forms URL을 GitHub Variables에 넣어야** 배포 사이트에서도 저장됩니다.

## 시나리오

1. 데이트 수락 — `좋습니다.`만 가능
2. 요일 선택 — 6/17·6/18·6/19
3. 음식 선택 — 이모지 8종
4. 최종 확인 → Google Sheets/Forms에 저장
