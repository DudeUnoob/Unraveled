"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { normalizeQueryText } from "@/lib/normalizeQuery";

interface TrendGalleryCardProps {
  id: string;
  queryText: string;
  label: string;
  weeksRemaining: number;
  confidence: number;
  createdAt: string;
  index: number;
}

export function TrendGalleryCard({
  id,
  queryText,
  label,
  createdAt,
  index,
}: TrendGalleryCardProps) {
  const displayName = normalizeQueryText(queryText);
  const date = new Date(createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const isTombstone = label === "Fading" || label === "Dead";
  const statusText =
    label === "Timeless"
      ? "Enduring"
      : label === "Dead"
        ? "Flatlined"
        : label === "Fading"
          ? "Fading"
          : "Trending";
  const pillBg = isTombstone ? "bg-[#2e2d2d]" : "bg-[#5c6c47]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <Link href={`/analyze/${id}`} className="block">
        {isTombstone ? (
          <TombstoneCard
            displayName={displayName}
            date={date}
            statusText={statusText}
            pillBg={pillBg}
          />
        ) : (
          <SageCard
            displayName={displayName}
            date={date}
            statusText={statusText}
            pillBg={pillBg}
          />
        )}
      </Link>
    </motion.div>
  );
}

function SageCard({
  displayName,
  date,
  statusText,
  pillBg,
}: {
  displayName: string;
  date: string;
  statusText: string;
  pillBg: string;
}) {
  return (
    <div
      className="bg-[#c2c8ac] rounded-[30px] shadow-[0px_4px_5.5px_0px_rgba(0,0,0,0.25)] flex flex-col text-white"
      style={{ width: 280, height: 286 }}
    >
      {/* Date — top */}
      <div className="pt-6 px-6 text-center font-serif text-[20px]">{date}</div>

      {/* Title — center, grows */}
      <div className="flex-1 flex items-center justify-center px-6 py-3">
        <h3 className="font-serif font-bold text-[30px] leading-tight text-center capitalize line-clamp-3">
          {displayName}
        </h3>
      </div>

      {/* Status + pill — bottom */}
      <div className="pb-6 px-6 flex items-center justify-between">
        <span className="font-serif text-[20px]">{statusText}</span>
        <div
          className={`${pillBg} rounded-[20px] flex items-center justify-center`}
          style={{ height: 38, width: 116 }}
        >
          <span className="font-serif text-[16px] text-white">View more</span>
        </div>
      </div>
    </div>
  );
}

function TombstoneCard({
  displayName,
  date,
  statusText,
  pillBg,
}: {
  displayName: string;
  date: string;
  statusText: string;
  pillBg: string;
}) {
  return (
    <div
      className="relative overflow-hidden shadow-[0px_4px_5.5px_0px_rgba(0,0,0,0.25)] flex flex-col text-white"
      style={{
        width: 280,
        height: 340,
        borderTopLeftRadius: 90,
        borderTopRightRadius: 90,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
      }}
    >
      {/* Stone background image */}
      <img
        src="/gallery/tombstone-bg.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Dark overlay for legibility */}
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full px-6">
        {/* R.I.P */}
        <div className="pt-8 text-center font-drama text-[32px] not-italic tracking-wide">
          R.I.P
        </div>

        {/* Date */}
        <div className="pt-1 text-center font-serif text-[20px]">{date}</div>

        {/* Title — grows */}
        <div className="flex-1 flex items-center justify-center py-2">
          <h3 className="font-serif font-medium text-[28px] leading-tight text-center capitalize line-clamp-2">
            {displayName}
          </h3>
        </div>

        {/* Status + pill — bottom */}
        <div className="pb-6 flex items-center justify-between">
          <span className="font-serif text-[20px]">{statusText}</span>
          <div
            className={`${pillBg} rounded-[20px] flex items-center justify-center`}
            style={{ height: 38, width: 116 }}
          >
            <span className="font-serif text-[16px] text-white">View more</span>
          </div>
        </div>
      </div>
    </div>
  );
}
