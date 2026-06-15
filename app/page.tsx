"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import StepCard from "@/components/StepCard";
import { assetPath } from "@/lib/assetPath";
import { submitAnswers } from "@/lib/submitAnswers";
import RunawayButton from "@/components/RunawayButton";
import ShrinkButton from "@/components/ShrinkButton";

type Answers = {
  accept: string;
  day: string;
  food: string;
};

const DAYS = ["6월17일(수)", "6월18일(목)", "6월19일(금)"];

const FOODS = [
  { emoji: "🥩", label: "꼬기꼬기 삼겹살" },
  { emoji: "🥓", label: "닭치고 곱창" },
  { emoji: "🍝", label: "분위기 파스타" },
  { emoji: "🌶️", label: "스트레스 풀자 마라탕" },
  { emoji: "🌮", label: "멕시칸 어때? 화이타!" },
  { emoji: "🍣", label: "초밥은 진리" },
  { emoji: "🍜", label: "후루룩 라멘 타임" },
  { emoji: "🍕", label: "피자는 배신 안 해" },
];

const TOTAL = 4;

export default function Home() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({
    accept: "",
    day: "",
    food: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const goNext = () => setStep((s) => s + 1);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitAnswers(answers);
    } catch {
      // 저장 실패해도 완료 화면은 보여준다
    } finally {
      setSubmitting(false);
      setDone(true);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <AnimatePresence mode="wait">
        {/* ---------------- 완료 화면 ---------------- */}
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[640px] rounded-[2rem] border border-white/70 bg-white/80 p-9 text-center shadow-soft backdrop-blur-sm"
          >
            <div className="animate-floaty">
              <Image src={assetPath("/image/333.png")} alt="고양이 캐릭터" width={160} height={160} className="mx-auto" />
            </div>
            <h1 className="mt-3 text-2xl font-bold text-deeprose">데이트 신청이 전달되었어요! 💌</h1>
            <p className="mt-2 leading-relaxed text-[#4a3640]">
              남자친구에게 선택하신 내용이 전달되었습니다.
              <br />
              감사합니다 😊
            </p>

            <div className="mt-6 space-y-2 rounded-2xl bg-blush/40 p-5 text-left text-[#4a3640]">
              <SummaryRow label="데이트 수락" value={answers.accept} />
              <SummaryRow label="만나는 날" value={answers.day} />
              <SummaryRow label="먹고 싶은 음식" value={answers.food} />
            </div>

            <p className="mt-5 text-sm text-rose/80">※ 이 데이트는 이미 확정되어 무르기가 어렵습니다 🙅‍♀️</p>
          </motion.div>
        ) : (
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="w-full flex justify-center"
          >
            {/* ---------------- 1단계: 데이트 수락 ---------------- */}
            {step === 1 && (
              <StepCard
                step={1}
                total={TOTAL}
                badge="데이트 신청 💘"
                question={"이번주 약속이 없으면\n남자친구가 데이트를 신청하려고 합니다!\n 데이트를 받아들이겠습니까?"}
                hint="(정답은 하나뿐인 것 같아요...?)"
              >
                <div className="flex flex-col items-center gap-4">
                  <RunawayButton label="생각좀 해보겠습니다." />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setAnswers((a) => ({ ...a, accept: "좋습니다." }));
                      goNext();
                    }}
                    className="w-full max-w-xs rounded-2xl bg-rose px-6 py-3 text-lg font-bold text-white shadow-soft"
                  >
                    좋습니다. 💕
                  </motion.button>
                  <ShrinkButton label="싫어요." />
                </div>
              </StepCard>
            )}

            {/* ---------------- 2단계: 요일 선택 ---------------- */}
            {step === 2 && (
              <StepCard step={2} total={TOTAL} badge="날짜 정하기 📅" question={"무슨 요일이 좋나요?"} hint="(편한 날짜를 골라주세요!)">
                <div className="flex flex-col items-center gap-3">
                  {DAYS.map((d) => (
                    <motion.button
                      key={d}
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setAnswers((a) => ({ ...a, day: d }));
                        goNext();
                      }}
                      className="w-full max-w-xs rounded-2xl bg-white px-6 py-3 text-lg font-bold text-deeprose shadow-soft ring-2 ring-rose/30"
                    >
                      {d}
                    </motion.button>
                  ))}
                  <div className="mt-2">
                    <RunawayButton label="이번주 바빠요~" wiggle range={170} />
                  </div>
                </div>
              </StepCard>
            )}

            {/* ---------------- 3단계: 음식 선택 ---------------- */}
            {step === 3 && (
              <StepCard
                step={3}
                total={TOTAL}
                badge="메뉴 고르기 🍽️"
                question={"그날 만나면\n어떤 식사를 먹고 싶나요?"}
                hint="(마음에 드는 메뉴를 하나 골라주세요!)"
              >
                <div className="grid grid-cols-2 gap-3">
                  {FOODS.map((f) => {
                    const value = `${f.emoji} ${f.label}`;
                    return (
                      <motion.button
                        key={f.label}
                        type="button"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setAnswers((a) => ({ ...a, food: value }));
                          goNext();
                        }}
                        className="flex flex-col items-center gap-1 rounded-2xl bg-white px-3 py-4 text-center shadow-soft ring-1 ring-rose/20 transition-colors hover:bg-blush/30"
                      >
                        <span className="text-3xl">{f.emoji}</span>
                        <span className="text-sm font-semibold text-[#4a3640]">{f.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </StepCard>
            )}

            {/* ---------------- 4단계: 최종 확인 ---------------- */}
            {step === 4 && (
              <StepCard
                step={4}
                total={TOTAL}
                badge="마지막 확인 ✨"
                question={"이 데이트를 받아들이면\n무르기가 어렵습니다.\n그래도 진행하시겠습니까?"}
                hint="진행하면 남자친구에게 선택 내용이 전달돼요!"
              >
                <div className="mb-5 space-y-2 rounded-2xl bg-blush/40 p-5 text-left text-[#4a3640]">
                  <SummaryRow label="데이트 수락" value={answers.accept} />
                  <SummaryRow label="만나는 날" value={answers.day} />
                  <SummaryRow label="먹고 싶은 음식" value={answers.food} />
                </div>
                <div className="flex flex-col items-center gap-3">
                  <motion.button
                    type="button"
                    disabled={submitting}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleSubmit}
                    className="w-full max-w-xs rounded-2xl bg-rose px-6 py-3 text-lg font-bold text-white shadow-soft disabled:opacity-60"
                  >
                    {submitting ? "전달하는 중... 💨" : "네, 진행할게요! 💖"}
                  </motion.button>
                  <button type="button" onClick={() => setStep(1)} className="text-sm text-rose/70 underline underline-offset-4">
                    처음부터 다시 (사실 결과는 같아요 😋)
                  </button>
                </div>
              </StepCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-8 text-center text-xs text-rose/60">made with 선위 for 소연</footer>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-rose/80">{label}</span>
      <span className="font-bold">{value || "-"}</span>
    </div>
  );
}
