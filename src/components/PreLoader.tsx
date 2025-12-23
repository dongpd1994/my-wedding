"use client";

import { useEffect, useState } from "react";

interface PreLoaderProps {
  onComplete: () => void;
}

// Danh sách tất cả ảnh cần preload
const IMAGES = [
  // Hero section
  "/top-bg.jpg",
  "/top-obj-bg.png",
  "/top-logo.svg",
  // Gallery 5 ảnh
  "/img/3I7A5209.jpg",
  "/img/3I7A5323.jpg",
  "/img/DongHai.41029.jpg",
  "/img/DongHai.40867.jpg",
  "/img/DongHai.41149.jpg",
  // Horizontal gallery 13 ảnh
  "/img/DongHai.41622.jpg",
  "/img/DongHai.41419.jpg",
  "/img/DongHai.41304.jpg",
  "/img/DongHai.41182.jpg",
  "/img/DongHai.41078.jpg",
  "/img/DongHai.41049.jpg",
  "/img/3I7A5373.jpg",
  "/img/3I7A5369.jpg",
  "/img/3I7A5228.jpg",
  "/img/3I7A5119.jpg",
  "/img/3I7A5090.jpg",
  "/img/3I7A5196.jpg",
  "/img/3I7A5176.jpg",
];

const FONTS = [
  { name: "CarryYou", url: "/fonts/carry-you.regular.ttf" },
  { name: "THViettay", url: "/fonts/viettay-6.otf" },
  { name: "FzManchesterSignature", url: "/fonts/FzManchesterSignature.ttf" },
];

const TOTAL_ASSETS = IMAGES.length + FONTS.length;

export default function PreLoader({ onComplete }: PreLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    let loaded = 0;

    const updateProgress = () => {
      loaded++;
      setLoadedCount(loaded);
      const percent = (loaded / TOTAL_ASSETS) * 100;
      setProgress(percent);

      if (loaded === TOTAL_ASSETS) {
        // Delay nhỏ để user thấy 100%
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    };

    // Preload fonts
    FONTS.forEach((fontConfig) => {
      const font = new FontFace(fontConfig.name, `url(${fontConfig.url})`);
      font
        .load()
        .then((loadedFont) => {
          document.fonts.add(loadedFont);
          console.log(`✅ Font loaded: ${fontConfig.name}`);
          updateProgress();
        })
        .catch((err) => {
          console.error(`❌ Font load failed: ${fontConfig.name}`, err);
          updateProgress(); // Vẫn tăng progress dù fail
        });
    });

    // Preload images
    IMAGES.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        console.log(`✅ Image loaded: ${src}`);
        updateProgress();
      };
      img.onerror = () => {
        console.error(`❌ Image load failed: ${src}`);
        updateProgress(); // Vẫn tăng progress dù fail
      };
      img.src = src;
    });
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F6F0D7]">
      <div className="text-center">
        {/* Logo hoặc title */}
        <h1 className="text-5xl font-bold mb-8 font-carry text-neutral-800">
          Dong Pham&apos;s Wedding
        </h1>

        {/* Progress bar */}
        <div className="w-80 h-2 bg-neutral-300 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-neutral-800 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress text */}
        <p className="text-neutral-600">
          Loading... {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}
