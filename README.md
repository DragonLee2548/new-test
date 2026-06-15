# 데이트 신청 시뮬레이션 💌

여자친구에게 데이트를 신청하는 4단계 시뮬레이션 게임입니다. "거절/도망" 버튼은
누를 수 없게 장난을 치고, 정답 버튼만 누를 수 있도록 유도합니다. 최종 선택은
프로젝트 내부 파일에 (시간 + 데이터) 형태로 저장됩니다.

## 기술 스택

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- framer-motion (버튼 도망/축소/와리가리 애니메이션)

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속.

## GitHub Pages 배포

저장소 Settings → Pages → Source를 **GitHub Actions**로 설정한 뒤 `main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동 배포합니다.

- 배포 URL: `https://<username>.github.io/new-test/`
- GitHub Pages는 정적 사이트라 `/api/submit` 저장 기능은 동작하지 않습니다 (로컬 `npm run dev`에서만 저장됨)
- 이미지 경로는 `NEXT_PUBLIC_BASE_PATH=/new-test` 로 빌드되어 서브경로에서도 정상 표시됩니다

## 시나리오

1. **데이트 수락** — `좋습니다.`만 누를 수 있음. `생각좀 해보겠습니다.`는 도망가고,
   `싫어요.`는 작아지며 비활성화됨.
2. **요일 선택** — 6/17·6/18·6/19 중 선택. `이번주 바빠요~`는 모양이 변형되며
   와리가리 도망쳐서 못 누름.
3. **음식 선택** — 이모지 8종 중 하나 선택.
4. **최종 확인** — 진행 시 선택 내용이 저장되고 완료 화면 표시.

## 데이터 저장

제출 시 `app/api/submit` 라우트가 다음 두 파일에 누적 저장합니다.

- `data/submissions.json` — 구조화된 기록
  ```json
  [{ "createdAt": "...", "accept": "좋습니다.", "day": "6월18일(목)", "food": "🍣 초밥은 진리" }]
  ```
- `data/submissions.txt` — 메모장 스타일 (시간 + 데이터)
  ```
  2026. 6. 15. 오전 10:00:00 | 데이트수락:좋습니다. | 요일:6월18일(목) | 음식:🍣 초밥은 진리
  ```
