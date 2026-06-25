"use client";

import Link from "next/link";
import { ReactNode } from "react";
import StarsBg from "./StarsBg";

type Props = {
  children: ReactNode;
  /** When true, renders a back link to /v2 in the top bar. */
  withBack?: boolean;
  topRight?: ReactNode;
};

export default function GameShell({ children, withBack = true, topRight }: Props) {
  return (
    <main className="flash-bg relative min-h-screen overflow-hidden">
      <StarsBg />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5">
        <div className="flex items-center justify-between">
          {withBack ? (
            <Link
              href="/v2"
              className="btn-flash btn-ghost text-base"
              style={{ paddingInline: "1rem", paddingBlock: "0.5rem" }}
            >
              ← 메인
            </Link>
          ) : (
            <span />
          )}
          {topRight}
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">{children}</div>
      </div>
    </main>
  );
}
