/**
 * Google Sheets 연동용 Apps Script
 *
 * 설정 방법:
 * 1. Google Sheets 새로 만들기 → 1행에 헤더: 시간 | 데이트수락 | 요일 | 음식
 * 2. 확장 프로그램 → Apps Script → 이 코드 붙여넣기
 * 3. 배포 → 새 배포 → 유형: 웹 앱
 *    - 실행: 나
 *    - 액세스: 모든 사용자
 * 4. 배포 URL을 NEXT_PUBLIC_GOOGLE_SHEETS_URL 에 넣기
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
      data.accept || "",
      data.day || "",
      data.food || "",
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

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, message: "데이트 신청 시트 API" }),
  ).setMimeType(ContentService.MimeType.JSON);
}
