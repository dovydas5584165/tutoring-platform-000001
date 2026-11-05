'use client';

import React, { useState, useEffect } from 'react';

// ---- Nustatymai, kuriuos galite keisti ----
const FIT_CHANCE = 0.25; // Tikimybė, kad skaičius tiks (25%)
const NUM_CHIPS = 24; // Skaičių kiekis tinklelyje
const FILES_PER_FOLDER = 5;
const BUCKETS = ['Džiaugsmas', 'Liūdesys', 'Pyktis', 'Ramybė'];
const COMPLIMENTS = [
  'Puikus darbas! Tavo loginis mąstymas tiesiog žiba!',
  'Oho, koks atkaklumas! Tu tikras skaičių meistras!',
  'Nuostabu! Su tokia kantrybe gali kalnus nuversti!',
];
const CLAIM_INSTRUCTIONS =
  'Padaryk šio ekrano nuotrauką (screenshot) ir atsiųsk ją mums el. paštu labas@tiksliukai.lt arba per socialinius tinklus!';
const ORGANISER = 'tiksliukai.lt';

const newNumber = () => Math.floor(Math.random() * 99) + 1;

function chance(p: number): boolean {
  if (typeof window !== 'undefined' && window.crypto) {
    const a = new Uint32Array(1);
    window.crypto.getRandomValues(a);
    return a[0] / 4294967296 < p;
  }
  return Math.random() < p;
}

function makeCode(prefix: string): string {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = prefix + '-';
  for (let i = 0; i < 6; i++) {
    s += c[Math.floor(Math.random() * c.length)];
  }
  return s;
}

export default function SortNumbersGame() {
  const [chips, setChips] = useState<number[]>([]);
  const [files, setFiles] = useState<number[]>(() => BUCKETS.map(() => 0));
  const [selected, setSelected] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [freeCode, setFreeCode] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [msg, setMsg] = useState<{ text: string; kind?: 'ok' | 'miss' }>({
    text: 'Pasirink skaičių ir pradėk.',
  });
  const [bouncingChip, setBouncingChip] = useState<number | null>(null);
  const [dragOverBucket, setDragOverBucket] = useState<number | null>(null);

  // Generuojame pradinius skaičius tik kliento pusėje (išvengiama Next.js hydration klaidos)
  useEffect(() => {
    setChips(Array.from({ length: NUM_CHIPS }, () => newNumber()));
  }, []);

  const rulesText = `Kiekvienas skaičius turi ${Math.round(
    FIT_CHANCE * 100
  )}% tikimybę tikti. Užpildyk visus ${
    BUCKETS.length
  } aplankus (po ${FILES_PER_FOLDER} failus) ir laimėk nemokamą pamoką. Vienas prizas vienam asmeniui, į grynuosius pinigus nekeičiama. Organizatorius: ${ORGANISER}.`;

  const place = (bucketIdx: number, chipIdxOverride?: number) => {
    const activeChip = chipIdxOverride !== undefined ? chipIdxOverride : selected;

    if (activeChip === null) {
      setMsg({ text: 'Pirmiausia pasirink skaičių.' });
      return;
    }
    if (files[bucketIdx] >= FILES_PER_FOLDER) {
      setMsg({ text: 'Šis aplankas jau pilnas.' });
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setSelected(null);

    if (chance(FIT_CHANCE)) {
      const nextFiles = [...files];
      nextFiles[bucketIdx]++;
      setFiles(nextFiles);

      const nextChips = [...chips];
      nextChips[activeChip] = newNumber();
      setChips(nextChips);

      if (nextFiles.every((f) => f >= FILES_PER_FOLDER)) {
        if (!freeCode) {
          setFreeCode(makeCode('TIK-FREE'));
        }
        setMsg({
          text: 'Visi aplankai užpildyti! Laimėjai nemokamą pamoką!',
          kind: 'ok',
        });
      } else if (nextFiles[bucketIdx] === FILES_PER_FOLDER) {
        const comp = COMPLIMENTS[completedCount % COMPLIMENTS.length];
        setCompletedCount((prev) => prev + 1);
        setMsg({
          text: `Aplankas „${BUCKETS[bucketIdx]}“ pilnas! ${comp}`,
          kind: 'ok',
        });
      } else {
        setMsg({
          text: `Skaičius tiko į „${BUCKETS[bucketIdx]}“!`,
          kind: 'ok',
        });
      }
    } else {
      setMsg({ text: 'Netiko! Skaičius grįžta atgal.', kind: 'miss' });
      setBouncingChip(activeChip);
      setTimeout(() => {
        setBouncingChip((prev) => (prev === activeChip ? null : prev));
      }, 300);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-[#eef1ff] text-[#141b3a] font-sans">
      <style>{`
        @keyframes chip-bounce {
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-chip-bounce {
          animation: chip-bounce 0.3s ease-in-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-chip-bounce { animation: none; }
        }
      `}</style>

      <main className="w-full max-w-[580px] bg-white rounded-[20px] p-6 shadow-[0_12px_32px_rgba(81,112,255,0.15)]">
        <h1 className="m-0 mb-1 text-2xl font-bold tracking-tight">
          Surūšiuok skaičius
        </h1>
        <p className="m-0 mb-[18px] text-[#5f6788] leading-[1.45]">
          Pasirink skaičių ir įdėk jį į aplanką. Jis gali tikti arba netikti.
          Užpildyk aplanką (5 failai) ir gauk komplimentą, o užpildęs visus
          keturis - laimėk nemokamą pamoką!
        </p>

        {/* Skaičių tinklelis */}
        <div
          className="grid grid-cols-6 gap-2 mb-[18px]"
          aria-label="Skaičiai"
        >
          {chips.map((n, i) => {
            const isSelected = i === selected;
            const isBouncing = i === bouncingChip;
            return (
              <button
                key={i}
                type="button"
                draggable
                onClick={() => setSelected(isSelected ? null : i)}
                onDragStart={(e) => {
                  setSelected(i);
                  e.dataTransfer.setData('text/plain', String(i));
                }}
                className={`font-bold text-[1.05rem] py-2.5 rounded-xl border-2 border-transparent cursor-grab transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#5170FF] focus-visible:outline-offset-2 ${
                  isSelected
                    ? 'bg-[#5170FF] text-white'
                    : 'bg-[#dfe5ff] text-[#141b3a] hover:bg-[#d0d8ff]'
                } ${isBouncing ? 'animate-chip-bounce' : ''}`}
              >
                {n}
              </button>
            );
          })}
        </div>

        {/* Aplankai */}
        <div className="grid grid-cols-2 gap-2.5">
          {BUCKETS.map((name, i) => {
            const isFull = files[i] >= FILES_PER_FOLDER;
            const isOver = dragOverBucket === i;
            return (
              <button
                key={name}
                type="button"
                disabled={isFull}
                onClick={() => place(i)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!isFull) setDragOverBucket(i);
                }}
                onDragLeave={() => setDragOverBucket(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverBucket(null);
                  const draggedIdx = e.dataTransfer.getData('text/plain');
                  const parsedIdx =
                    draggedIdx !== '' ? parseInt(draggedIdx, 10) : undefined;
                  place(i, parsedIdx);
                }}
                className={`text-left p-3.5 rounded-[14px] border-2 transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#5170FF] focus-visible:outline-offset-2 ${
                  isFull
                    ? 'cursor-default bg-[#dfe5ff] border-[#dfe5ff]'
                    : isOver
                    ? 'cursor-pointer bg-white border-[#5170FF]'
                    : 'cursor-pointer bg-white border-[#dfe5ff] hover:border-[#5170FF]'
                }`}
              >
                <span className="block font-bold mb-2 text-[#141b3a]">
                  {name}
                </span>
                <span className="flex gap-[5px]">
                  {Array.from({ length: FILES_PER_FOLDER }).map((_, f) => {
                    const isFilled = f < files[i];
                    return (
                      <span
                        key={f}
                        className={`flex-1 h-3 rounded-[3px] transition-colors ${
                          isFilled
                            ? isFull
                              ? 'bg-[#1f9d6b]'
                              : 'bg-[#5170FF]'
                            : 'bg-[#dfe5ff]'
                        }`}
                      />
                    );
                  })}
                </span>
              </button>
            );
          })}
        </div>

        {/* Pranešimai ir statistika */}
        <p
          role="status"
          aria-live="polite"
          className={`min-h-[1.5em] mt-4 mb-0 font-semibold text-center ${
            msg.kind === 'ok'
              ? 'text-[#1f9d6b]'
              : msg.kind === 'miss'
              ? 'text-[#e0566b]'
              : 'text-[#141b3a]'
          }`}
        >
          {msg.text}
        </p>

        <p className="mt-2.5 mb-0 text-center text-[#5f6788] text-[0.85rem]">
          {attempts > 0 ? `Bandymai: ${attempts}` : ''}
        </p>

        {/* Prizas */}
        {freeCode && (
          <div className="mt-3.5 p-3.5 rounded-xl bg-[#dfe5ff] leading-[1.5]">
            <b className="text-[#5170FF]">Laimėjai nemokamą pamoką!</b> Tavo
            laimėjimo kodas: <b className="text-[#5170FF]">{freeCode}</b>{' '}
            (atlikta per {attempts} bandymus).
            <br />
            {CLAIM_INSTRUCTIONS}
          </div>
        )}

        {/* Taisyklės */}
        <p className="mt-3 mb-0 text-[#5f6788] text-[0.75rem] leading-[1.45]">
          {rulesText}
        </p>
      </main>
    </div>
  );
}
