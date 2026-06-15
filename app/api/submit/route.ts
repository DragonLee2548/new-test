import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

type Submission = {
  createdAt: string;
  accept: string;
  day: string;
  food: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<Submission>;
    const accept = body.accept ?? "";
    const day = body.day ?? "";
    const food = body.food ?? "";

    if (!accept || !day || !food) {
      return NextResponse.json(
        { ok: false, error: "선택이 완료되지 않았어요." },
        { status: 400 },
      );
    }

    const createdAt = new Date().toISOString();
    const dataDir = path.join(process.cwd(), "data");
    await fs.mkdir(dataDir, { recursive: true });

    // 1) 구조화된 JSON 누적 저장
    const jsonPath = path.join(dataDir, "submissions.json");
    let list: Submission[] = [];
    try {
      const raw = await fs.readFile(jsonPath, "utf-8");
      list = JSON.parse(raw) as Submission[];
      if (!Array.isArray(list)) list = [];
    } catch {
      list = [];
    }
    const entry: Submission = { createdAt, accept, day, food };
    list.push(entry);
    await fs.writeFile(jsonPath, JSON.stringify(list, null, 2), "utf-8");

    // 2) 메모장 스타일 텍스트 누적 저장 (시간 + 데이터)
    const kst = new Date().toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
    });
    const line = `${kst} | 데이트수락:${accept} | 요일:${day} | 음식:${food}\n`;
    await fs.appendFile(path.join(dataDir, "submissions.txt"), line, "utf-8");

    return NextResponse.json({ ok: true, entry });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "저장 중 오류가 발생했어요." },
      { status: 500 },
    );
  }
}
