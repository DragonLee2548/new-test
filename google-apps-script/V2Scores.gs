/**
 * v2 미니게임 신기록 저장용 Apps Script
 *
 * 시트 구조:
 *  1행 헤더: 시간 | game | character | difficulty | score | ms | name | at
 *
 * 배포 방법:
 *  1) Google Sheets 새로 만들고 시트 이름은 자유. 1행에 위 헤더 입력.
 *  2) 확장 프로그램 → Apps Script → 이 코드 붙여넣기 → 저장.
 *  3) 배포 → 새 배포 → 유형: 웹 앱
 *     - 실행: 나
 *     - 액세스: 모든 사용자
 *  4) 배포 URL 을 .env.local 의 NEXT_PUBLIC_V2_SCORES_URL 에 넣기.
 *
 * 기록 비교 규칙
 *  - mole(두더지): score 가 클수록 좋음
 *  - maze, rps     : ms 가 작을수록 좋음
 *
 * GET 으로 ?game=mole&character=우사기&difficulty=normal-40s 형태로 조회 가능.
 */

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    const kst = Utilities.formatDate(
      new Date(),
      "Asia/Seoul",
      "yyyy-MM-dd HH:mm:ss",
    );

    sheet.appendRow([
      kst,
      data.game || "",
      data.character || "",
      data.difficulty || "",
      data.score === undefined ? "" : data.score,
      data.ms === undefined ? "" : data.ms,
      data.name || "",
      data.at || "",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    const game = (e.parameter.game || "").toString();
    const character = (e.parameter.character || "").toString();
    const difficulty = (e.parameter.difficulty || "").toString();

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const values = sheet.getDataRange().getValues();
    // header at row 0
    const rows = values.slice(1).filter(function (r) {
      if (game && r[1] !== game) return false;
      if (character && r[2] !== character) return false;
      if (difficulty && r[3] !== difficulty) return false;
      return true;
    });

    const higherIsBetter = game === "mole";

    let top = null;
    rows.forEach(function (r) {
      const score = r[4] === "" ? undefined : Number(r[4]);
      const ms = r[5] === "" ? undefined : Number(r[5]);
      const candidate = {
        game: r[1],
        character: r[2],
        difficulty: r[3],
        score: score,
        ms: ms,
        name: r[6],
        at: r[7],
      };
      if (top === null) {
        top = candidate;
        return;
      }
      if (higherIsBetter) {
        if ((candidate.score || 0) > (top.score || 0)) top = candidate;
      } else {
        const a = candidate.ms === undefined ? Infinity : candidate.ms;
        const b = top.ms === undefined ? Infinity : top.ms;
        if (a < b) top = candidate;
      }
    });

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, top: top }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
