/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import HeroSection from "@/components/HeroSection";
import PreLoader from "@/components/PreLoader";

type Guest = {
  id: string;
  name: string;
  attended: boolean;
  transport: "SELF" | "SPONSOR" | null;
  groom: boolean;
};

export default function Home() {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Gọi API ngay khi vào trang
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
      setError("Missing guest ID in URL");
      setLoading(false);
      return;
    }

    fetch(`/api/rsvp?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Guest not found");
        return res.json();
      })
      .then((data: Guest) => {
        setGuest(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load guest information");
        setLoading(false);
      });
  }, []);

  // Hiển thị PreLoader cho đến khi tất cả assets load xong
  if (!assetsLoaded) {
    return <PreLoader onComplete={() => setAssetsLoaded(true)} />;
  }

  return (
    <>
      {/* Top Header Title */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 text-neutral-900 font-extrabold text-[20px] sm:text-[28px] md:text-[36px] z-[500] font-carry whitespace-nowrap px-4">
        Dong Pham&apos;s Wedding
      </div>
      <HeroSection guest={guest} loading={loading} error={error} />
    </>
  );
}
