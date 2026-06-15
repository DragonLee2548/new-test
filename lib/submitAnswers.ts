export type SubmissionPayload = {
  accept: string;
  day: string;
  food: string;
};

/** Google Sheets Apps Script Web App URL */
async function submitToGoogleSheets(payload: SubmissionPayload): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL;
  if (!url) return false;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    if (res.ok) return true;
  } catch {
    // CORS 등으로 응답을 못 읽어도 no-cors 재시도
  }

  try {
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return true;
  } catch {
    return false;
  }
}

/** Google Forms formResponse URL + entry ID */
async function submitToGoogleForm(payload: SubmissionPayload): Promise<boolean> {
  const action = process.env.NEXT_PUBLIC_GOOGLE_FORM_ACTION;
  const entryAccept = process.env.NEXT_PUBLIC_GOOGLE_FORM_ENTRY_ACCEPT;
  const entryDay = process.env.NEXT_PUBLIC_GOOGLE_FORM_ENTRY_DAY;
  const entryFood = process.env.NEXT_PUBLIC_GOOGLE_FORM_ENTRY_FOOD;

  if (!action || !entryAccept || !entryDay || !entryFood) return false;

  const body = new URLSearchParams();
  body.set(entryAccept, payload.accept);
  body.set(entryDay, payload.day);
  body.set(entryFood, payload.food);

  try {
    await fetch(action, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    return true;
  } catch {
    return false;
  }
}

/** 로컬 개발용 파일 저장 API */
async function submitToLocalApi(payload: SubmissionPayload): Promise<boolean> {
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * 제출 우선순위: Google Sheets → Google Forms → 로컬 API(개발)
 * GitHub Pages에서는 Sheets/Forms 중 설정된 쪽으로 저장됩니다.
 */
export async function submitAnswers(
  payload: SubmissionPayload,
): Promise<{ ok: boolean; via?: "google-sheets" | "google-form" | "local" }> {
  if (await submitToGoogleSheets(payload)) {
    return { ok: true, via: "google-sheets" };
  }
  if (await submitToGoogleForm(payload)) {
    return { ok: true, via: "google-form" };
  }
  if (await submitToLocalApi(payload)) {
    return { ok: true, via: "local" };
  }
  return { ok: false };
}
