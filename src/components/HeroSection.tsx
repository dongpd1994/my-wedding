/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import SplitText from "./lib/SplitText";
import RsvpForm from "./RsvpForm";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

type Guest = {
  id: string;
  name: string;
  attended: boolean;
  transport: "SELF" | "SPONSOR" | null;
  groom: boolean;
};

interface HeroSectionProps {
  guest: Guest | null;
  loading: boolean;
  error: string | null;
}

export default function HeroSection({ guest, loading, error }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);
  const leftOverlayRef = useRef<HTMLDivElement>(null);
  const rightOverlayRef = useRef<HTMLDivElement>(null);
  const titleWrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLImageElement>(null);
  const leftNameRef = useRef<HTMLDivElement>(null);
  const rightNameRef = useRef<HTMLDivElement>(null);
  const waveOverlayRef = useRef<HTMLDivElement>(null);
  const waveAnimatingRef = useRef(false); // Flag để prevent re-entry
  const galleryRef = useRef<HTMLDivElement>(null);
  const horizontalTextRef = useRef<HTMLDivElement>(null);
  const horizontalGalleryRef = useRef<HTMLDivElement>(null);

  const [showNames, setShowNames] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showHorizontalGallery, setShowHorizontalGallery] = useState(false);
  const [showRsvp, setShowRsvp] = useState(false);

  useLayoutEffect(() => {
    if (
      !containerRef.current ||
      !bgRef.current ||
      !fgRef.current ||
      !titleWrapperRef.current ||
      !titleRef.current
    )
      return;

    const ctx = gsap.context(() => {
      // Timeline cho scroll animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "8% top",
          scrub: 1,
          markers: false,
        },
      });

      // Phase 1: Scale ảnh nền + di chuyển lên + overlay biến mất (0-50% scroll)
      tl.to(bgRef.current, {
        scale: 1,
        top: "0vh",
        ease: "none",
        duration: 0.5,
      });

      tl.to(
        [leftOverlayRef.current, rightOverlayRef.current],
        {
          width: "0%",
          ease: "none",
          duration: 0.5,
        },
        0
      );

      // Phase 2: Fade in 2 người (50-100% scroll)
      tl.to(
        fgRef.current,
        {
          opacity: 1,
          ease: "none",
          duration: 0.5,
        },
        0.5
      );

      // Timeline to scale and move the title
      const titleScaleTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "5% top", // Animation completes when user has scrolled 30% of the viewport
          scrub: 1,
        },
      });

      // Animate the scale of the inner text
      titleScaleTl.to(
        titleRef.current,
        {
          scale: 1.5,
          transformOrigin: "center center", // Scale from center
          ease: "none",
        },
        0
      );

      // Animate position to 30px from top (simulating sticky)
      titleScaleTl.to(
        titleWrapperRef.current,
        {
          top: "150px",
          ease: "none",
        },
        0
      );

      // Sau khi 2 người hiển thị rõ (70%), chuyển ảnh sang absolute để scroll xuống
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "13% top",
        onEnter: () => {
          if (bgRef.current && fgRef.current && containerRef.current) {
            // Chuyển sang fixed
            bgRef.current.style.position = "fixed";
            fgRef.current.style.position = "fixed";
          }
        },
        onLeaveBack: () => {
          if (bgRef.current && fgRef.current) {
            bgRef.current.style.position = "fixed";
            bgRef.current.style.top = "0vh";

            fgRef.current.style.position = "fixed";
            fgRef.current.style.top = "0px";
          }
        },
      });

      // Trigger hiển thị tên SAU KHI animation xong (50%)
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "13% top",
        onEnter: () => {
          // Mount SplitText để chạy animation từng chữ nhảy lên
          setTimeout(() => {
            setShowNames(true);
          }, 250);
        },
        onLeaveBack: () => {
          // Unmount khi scroll lên
          setShowNames(false);
        },
      });

      // Trigger ẩn tên khi scroll xuống tiếp - floating fade out
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "16% top", // Khi scroll đến 65% container
        onEnter: () => {
          // Floating effect - chỉ animate translateY và opacity của wrapper
          // Không ảnh hưởng đến animation SplitText bên trong
          gsap.to([leftNameRef.current, rightNameRef.current], {
            opacity: 0,
            y: -80,
            duration: 1.2,
            ease: "power2.inOut",
          });
        },
        onLeaveBack: () => {
          // Reset về vị trí ban đầu khi scroll lên
          gsap.to([leftNameRef.current, rightNameRef.current], {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          });
        },
      });

      // Trigger ẩn foreground (2 người) và title khi scroll xuống tiếp
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "20% top", // Sau khi names đã bắt đầu ẩn
        onEnter: () => {
          // Ẩn fgRef và titleWrapperRef - chạy 1 phát, không scrub
          gsap.to([fgRef.current, titleWrapperRef.current], {
            opacity: 0,
            duration: 1.5,
            ease: "power2.inOut",
          });
        },
        onLeaveBack: () => {
          // Hiện lại khi scroll lên
          gsap.to([fgRef.current, titleWrapperRef.current], {
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
          });
        },
      });

      // Trigger hiệu ứng sóng nước lan tỏa
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "22% top", // Sau khi fgRef và title đã bắt đầu ẩn
        markers: false,
        onEnter: () => {
          // Prevent re-entry nếu đang animate
          if (waveAnimatingRef.current) {
            console.log("⚠️ Wave already animating, skipping");
            return;
          }

          const container = waveOverlayRef.current;
          if (!container) return;

          waveAnimatingRef.current = true;
          console.log("🌊 Wave trigger entered");

          // Hiển thị gallery sau khi wave animation bắt đầu
          setTimeout(() => {
            setShowGallery(true);

            // Setup fade in/out cho images sau khi gallery hiển thị
            setTimeout(() => {
              const images = document.querySelectorAll(".gallery-image-item");
              if (images.length === 0) return;

              const totalImages = images.length;
              const startPercent = 30; // Bắt đầu ở 90% container
              const percentPerImage = 3; // Mỗi ảnh chiếm 1.5% scroll (chậm hơn)

              images.forEach((img, index) => {
                const start = startPercent + index * percentPerImage;

                ScrollTrigger.create({
                  trigger: containerRef.current,
                  start: `${start}% top`,
                  onEnter: () => {
                    console.log(`📸 Image ${index} fade in at ${start}%`);

                    // Ẩn tất cả ảnh khác và disable pointer events
                    images.forEach((otherImg, otherIndex) => {
                      if (otherIndex !== index) {
                        gsap.to(otherImg, {
                          opacity: 0,
                          duration: 0.5,
                          onComplete: () => {
                            // Ẩn hoàn toàn sau khi fade out
                            (otherImg as HTMLElement).style.visibility =
                              "hidden";
                          },
                        });
                        // Disable pointer events và z-index thấp cho ảnh ẩn
                        (otherImg as HTMLElement).style.pointerEvents = "none";
                        (otherImg as HTMLElement).style.zIndex = "0";
                      }
                    });

                    // Fade in ảnh hiện tại
                    (img as HTMLElement).style.visibility = "visible";
                    gsap.to(img, {
                      opacity: 1,
                      duration: 0.8,
                      ease: "power2.out",
                    });
                    // Enable pointer events và z-index cao cho ảnh hiện tại
                    (img as HTMLElement).style.pointerEvents = "auto";
                    (img as HTMLElement).style.zIndex = "10";
                  },
                  onLeaveBack: () => {
                    console.log(
                      `📸 Image ${index} fade out, showing previous image`
                    );

                    // Fade out ảnh hiện tại
                    gsap.to(img, {
                      opacity: 0,
                      duration: 0.5,
                      onComplete: () => {
                        (img as HTMLElement).style.visibility = "hidden";
                      },
                    });
                    // Disable pointer events cho ảnh ẩn
                    (img as HTMLElement).style.pointerEvents = "none";
                    (img as HTMLElement).style.zIndex = "0";

                    // Hiện ảnh trước đó (nếu có)
                    if (index > 0) {
                      const prevImg = images[index - 1];
                      (prevImg as HTMLElement).style.visibility = "visible";
                      gsap.to(prevImg, {
                        opacity: 1,
                        duration: 0.8,
                        ease: "power2.out",
                      });
                      // Enable pointer events cho ảnh trước
                      (prevImg as HTMLElement).style.pointerEvents = "auto";
                      (prevImg as HTMLElement).style.zIndex = "10";
                    }
                  },
                });
              });

              // Setup horizontal text với hiệu ứng chữ bay vào
              const textElement = horizontalTextRef.current;
              if (textElement) {
                console.log("✅ Setting up horizontal text");

                // Ban đầu ẩn text và set vị trí ban đầu
                gsap.set(textElement, { opacity: 0, xPercent: 0 });

                const split = new GSAPSplitText(textElement, {
                  type: "chars, words",
                });

                // Tính toán end point cho text: ảnh cuối ở startPercent + (totalImages * percentPerImage)
                const textStartPercent = startPercent + 1.5; // Text bắt đầu sau ảnh đầu tiên 1.5%
                const textEnd = startPercent + totalImages * percentPerImage;

                // Fade in text khi bắt đầu (sau 1.5%)
                ScrollTrigger.create({
                  trigger: containerRef.current,
                  start: `${textStartPercent}% top`,
                  onEnter: () => {
                    gsap.to(textElement, {
                      opacity: 1,
                      duration: 0.8,
                      ease: "power2.out",
                    });
                  },
                  onLeaveBack: () => {
                    gsap.to(textElement, {
                      opacity: 0,
                      duration: 0.5,
                    });
                  },
                });

                // Horizontal scroll animation - BẮT ĐẦU từ textStartPercent
                const scrollTween = gsap.fromTo(
                  textElement,
                  {
                    xPercent: 0, // Bắt đầu từ vị trí gốc
                  },
                  {
                    xPercent: -100, // Scroll hết text như code gốc
                    ease: "none",
                    scrollTrigger: {
                      trigger: containerRef.current,
                      start: `${textStartPercent}% top`, // BẮT ĐẦU từ sau ảnh đầu 1.5%
                      end: `${textEnd}% top`, // Cùng lúc với ảnh cuối
                      scrub: 1,
                      onUpdate: (self) => {
                        console.log(
                          `📝 Text progress: ${(self.progress * 100).toFixed(
                            1
                          )}%`
                        );
                      },
                    },
                  }
                );

                // Animate từng char bay vào - chữ thẳng khi vào, xiêu vẹo khi đang bay
                if (split.chars) {
                  split.chars.forEach((char) => {
                    gsap.fromTo(
                      char,
                      {
                        yPercent: "random(-200, 200)",
                        rotation: "random(-20, 20)",
                      },
                      {
                        yPercent: 0,
                        rotation: 0,
                        ease: "back.out(1.2)",
                        scrollTrigger: {
                          trigger: char,
                          containerAnimation: scrollTween,
                          start: "left 100%",
                          end: "left 60%",
                          scrub: 1,
                        },
                      }
                    );
                  });

                  console.log(
                    `✅ ${split.chars.length} chars animated (${textStartPercent}% - ${textEnd}%)`
                  );
                }

                // Setup horizontal gallery sau khi text hết
                const horizontalGalleryStartPercent = textEnd + 1.5; // 46.5%

                ScrollTrigger.create({
                  trigger: containerRef.current,
                  start: `${horizontalGalleryStartPercent}% top`,
                  onEnter: () => {
                    console.log(
                      `🖼️ Horizontal gallery starts at ${horizontalGalleryStartPercent}%`
                    );

                    // Ẩn gallery cũ và text
                    if (galleryRef.current) {
                      gsap.to(galleryRef.current, {
                        opacity: 0,
                        duration: 0.8,
                        ease: "power2.out",
                      });
                    }

                    setShowHorizontalGallery(true);

                    // Setup scroll animation cho gallery
                    setTimeout(() => {
                      const galleryContainer = horizontalGalleryRef.current;
                      if (!galleryContainer) return;

                      const galleryEndPercent =
                        horizontalGalleryStartPercent + 20; // 20% scroll cho gallery

                      // Tính width thực tế của gallery sau khi render
                      const galleryWidth = galleryContainer.scrollWidth;
                      const viewportWidth = window.innerWidth;
                      const scrollDistance = -(
                        galleryWidth -
                        viewportWidth +
                        50
                      ); // Thêm 50px để ảnh cuối cách mép phải

                      console.log(
                        `🖼️ Gallery width: ${galleryWidth}px, viewport: ${viewportWidth}px, scroll distance: ${scrollDistance}px`
                      );

                      gsap.fromTo(
                        galleryContainer,
                        {
                          x: 0,
                        },
                        {
                          x: scrollDistance, // Scroll bằng pixel để chính xác
                          ease: "none",
                          scrollTrigger: {
                            trigger: containerRef.current,
                            start: `${horizontalGalleryStartPercent}% top`,
                            end: `${galleryEndPercent}% top`,
                            scrub: 1,
                            onUpdate: (self) => {
                              console.log(
                                `🖼️ Gallery progress: ${(
                                  self.progress * 100
                                ).toFixed(1)}%`
                              );
                            },
                          },
                        }
                      );

                      // Setup RsvpForm sau khi gallery scroll hết
                      const rsvpStartPercent = galleryEndPercent + 0.5; // Giảm xuống 0.5% để form xuất hiện sớm hơn

                      ScrollTrigger.create({
                        trigger: containerRef.current,
                        start: `${rsvpStartPercent}% top`,
                        onEnter: () => {
                          console.log(
                            `📋 RsvpForm appears at ${rsvpStartPercent}%`
                          );

                          // Ẩn horizontal gallery
                          if (horizontalGalleryRef.current) {
                            gsap.to(
                              horizontalGalleryRef.current.parentElement,
                              {
                                opacity: 0,
                                duration: 0.8,
                                ease: "power2.out",
                              }
                            );
                          }

                          setShowRsvp(true);
                        },
                        onLeaveBack: () => {
                          console.log("📋 Hiding RsvpForm");
                          setShowRsvp(false);

                          // Hiện lại horizontal gallery
                          if (horizontalGalleryRef.current) {
                            gsap.to(
                              horizontalGalleryRef.current.parentElement,
                              {
                                opacity: 1,
                                duration: 0.8,
                                ease: "power2.out",
                              }
                            );
                          }
                        },
                      });
                    }, 300);
                  },
                  onLeaveBack: () => {
                    console.log("🖼️ Hiding horizontal gallery");
                    setShowHorizontalGallery(false);

                    // Hiện lại gallery cũ
                    if (galleryRef.current) {
                      gsap.to(galleryRef.current, {
                        opacity: 1,
                        duration: 0.8,
                        ease: "power2.out",
                      });
                    }
                  },
                });
              }
            }, 100);
          }, 1000); // Delay 1s để wave animation chạy một chút

          // Lấy SVG và ripples ngay
          const svg = container.querySelector("svg");
          if (!svg) {
            console.error("❌ SVG not found");
            waveAnimatingRef.current = false;
            return;
          }

          const ripples = svg.querySelectorAll("circle.wave-ripple");
          console.log(`✅ Found ${ripples.length} ripples`);

          if (ripples.length === 0) {
            waveAnimatingRef.current = false;
            return;
          }

          // KILL TẤT CẢ ANIMATIONS CŨ
          gsap.killTweensOf([container, ...Array.from(ripples)]);

          // Force reset bằng DOM trực tiếp
          ripples.forEach((ripple) => {
            ripple.setAttribute("r", "0");
            ripple.setAttribute("opacity", "0");
          });

          // Fade in container
          gsap.to(container, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          });

          // Tính toán max radius để phủ toàn màn hình
          const maxRadius = Math.sqrt(
            window.innerWidth ** 2 + window.innerHeight ** 2
          );

          // Fade out overlay sớm (sau 2.5s) để không che text
          setTimeout(() => {
            console.log("🌊 Fading out wave overlay early");
            gsap.to(container, {
              opacity: 0,
              duration: 1.5,
              ease: "power2.inOut",
            });
          }, 2500);

          let completedCount = 0;

          // Animate từng sóng
          ripples.forEach((ripple, i) => {
            console.log(`🌊 Animating wave ${i}`, ripple);

            // Mỗi sóng có delay và tốc độ khác nhau (3 sóng)
            const delay = i * 0.5; // 0s, 0.5s, 1s
            const duration = 3.5 + i * 0.8; // 3.5s, 4.3s, 5.1s

            // Dùng timeline với ease mượt mà
            const tl = gsap.timeline({
              delay,
              onStart: () => console.log(`🌊 Wave ${i} started`),
              onComplete: () => {
                console.log(`🌊 Wave ${i} completed`);
                completedCount++;
                if (completedCount === ripples.length) {
                  waveAnimatingRef.current = false;
                  console.log("✅ All waves completed");
                }
              },
            });

            // Giai đoạn 1: Burst nhanh
            tl.to(ripple, {
              attr: { r: maxRadius * 0.12 },
              opacity: 0.7,
              duration: 0.25,
              ease: "power2.out",
            });

            // Giai đoạn 2: Lan tỏa chậm dần
            tl.to(ripple, {
              attr: { r: maxRadius * 1.4 },
              opacity: 0,
              duration: duration,
              ease: "sine.out",
            });
          });
        },
        onLeaveBack: () => {
          const container = waveOverlayRef.current;
          if (!container) return;

          console.log("🔙 Wave leaving back - resetting");

          // FORCE reset flag ngay lập tức
          waveAnimatingRef.current = false;

          // Ẩn gallery khi scroll lên
          setShowGallery(false);

          // Reset tất cả SVG ripples trước
          const svg = container.querySelector("svg");
          if (svg) {
            const ripples = svg.querySelectorAll("circle.wave-ripple");

            // Kill tất cả animations
            gsap.killTweensOf([container, ...Array.from(ripples)]);

            // Force reset bằng DOM
            ripples.forEach((ripple) => {
              ripple.setAttribute("r", "0");
              ripple.setAttribute("opacity", "0");
            });
          }

          // Reset container opacity về 0
          gsap.to(container, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              console.log("✅ Wave overlay hidden");
            },
          });
        },
        onEnterBack: () => {
          console.log("🔄 Wave enter back - do nothing");
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#F6F0D7]"
      style={{ height: "2200vh" }}
    >
      {/* Layer 1: Background Image - Bờ sông */}
      <div
        ref={bgRef}
        className="fixed z-0 bg-no-repeat origin-center"
        style={{
          backgroundImage: "url(/top-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          scale: "0.9",
          top: "30vh",
          left: 0,
          right: 0,
          width: "100vw",
          height: "100vh",
        }}
      />

      {/* Layer 2: Overlay trắng bên trái */}
      <div
        ref={leftOverlayRef}
        className="fixed left-0 top-0 z-10 h-screen bg-[#F6F0D7]"
        style={{ width: "10%" }}
      />

      {/* Layer 3: Overlay trắng bên phải */}
      <div
        ref={rightOverlayRef}
        className="fixed right-0 top-0 z-10 h-screen bg-[#F6F0D7]"
        style={{ width: "10%" }}
      />

      {/* Layer 4: Content - Nội dung chính */}
      <div className="relative z-20 flex min-h-screen w-full items-center justify-center py-32 px-8">
        <div
          ref={titleWrapperRef}
          className="fixed"
          style={{
            top: "35%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 300,
          }}
        >
          <img
            ref={titleRef}
            src="/top-logo.svg"
            alt="Đông & Hải"
            className="w-[380px] h-auto object-contain"
          />
        </div>
      </div>

      {/* Layer 5: Foreground Image - 2 người (PNG trong suốt) */}
      <div
        ref={fgRef}
        className="pointer-events-none fixed z-30 bg-no-repeat"
        style={{
          backgroundImage: "url(/top-obj-bg.png)",
          backgroundSize: "auto 75vh",
          backgroundPosition: "38.5% 72.5%",
          opacity: 0,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      {/* Wave overlay - Sóng nước lan tỏa bằng SVG */}
      <div
        ref={waveOverlayRef}
        className="fixed inset-0 z-50 pointer-events-none"
        style={{
          opacity: 0, // Ban đầu ẩn hoàn toàn
        }}
      >
        {/* Background blur khi sóng lan tỏa */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(246, 240, 215, 0.35)",
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",
          }}
        />
        {/* SVG sóng nước */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Radial gradient cho hiệu ứng 3D */}
            <radialGradient id="wave-gradient">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
              <stop offset="30%" stopColor="rgba(255, 255, 255, 0.3)" />
              <stop offset="60%" stopColor="rgba(246, 240, 215, 0.2)" />
              <stop offset="100%" stopColor="rgba(246, 240, 215, 0)" />
            </radialGradient>
          </defs>
          {/* 3 sóng đồng tâm */}
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              className="wave-ripple"
              data-wave-index={i}
              cx="50%"
              cy="50%"
              r="0"
              fill="url(#wave-gradient)"
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="3"
              opacity="0"
              style={{
                filter: "blur(2px)", // Blur nhẹ cho mượt
              }}
            />
          ))}
        </svg>
      </div>

      {/* Tên hiển thị sau khi animation xong */}
      {showNames && (
        <>
          {/* Tên bên phải - Đông Phạm */}
          <div
            ref={rightNameRef}
            className="fixed z-40 text-7xl text-white/80"
            style={{
              right: "13%",
              top: "50%",
              transform: "translateY(-50%)",
              fontFamily: "THViettay, sans-serif",
              fontWeight: "bold",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
              textRendering: "optimizeLegibility",
              lineHeight: "1.2",
              padding: "20px",
            }}
          >
            <SplitText
              text="Đông Phạm"
              className="!overflow-visible"
              tag="h2"
              splitType="chars"
              delay={80}
              duration={0.8}
              from={{ opacity: 0, y: 50, rotateX: -90 }}
              to={{ opacity: 1, y: 0, rotateX: 0 }}
              threshold={0.1}
              rootMargin="0px"
            />
          </div>

          {/* Tên bên trái - Ngô Hải */}
          <div
            ref={leftNameRef}
            className="fixed z-40 text-7xl text-white/80"
            style={{
              left: "18%",
              top: "50%",
              transform: "translateY(-50%)",
              fontFamily: "THViettay, sans-serif",
              fontWeight: "bold",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
              textRendering: "optimizeLegibility",
              lineHeight: "1.2",
              padding: "20px",
            }}
          >
            <SplitText
              text="Ngô Hải"
              className="!overflow-visible"
              tag="h2"
              splitType="chars"
              delay={80}
              duration={0.8}
              from={{ opacity: 0, y: 50, rotateX: -90 }}
              to={{ opacity: 1, y: 0, rotateX: 0 }}
              threshold={0.1}
              rootMargin="0px"
            />
          </div>
        </>
      )}

      {/* Image Gallery Section - Hiển thị sau wave */}
      {showGallery && (
        <div
          ref={galleryRef}
          className="fixed inset-0 z-[60] flex pointer-events-none"
          style={{
            animation: "fadeIn 0.8s ease-out",
          }}
        >
          {/* Cột trái - Images (trong suốt, nhìn xuyên xuống blur) */}
          <div
            className="w-1/2 relative flex items-center justify-center pointer-events-auto"
            style={{ perspective: "1000px" }}
          >
            {[
              "3I7A5209.jpg",
              "3I7A5323.jpg",
              "DongHai.41029.jpg",
              "DongHai.40867.jpg",
              "DongHai.41149.jpg",
            ].map((src, index) => (
              <div
                key={index}
                className="gallery-image-item absolute inset-0 flex items-center justify-center p-12"
                style={{
                  opacity: 0,
                  visibility: "hidden",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
                onMouseMove={(e) => {
                  const container = e.currentTarget;
                  const img = container.querySelector("img");
                  if (!img) return;

                  const rect = container.getBoundingClientRect();
                  const offsetX = e.clientX - rect.left - rect.width / 2;
                  const offsetY = e.clientY - rect.top - rect.height / 2;

                  // Tính toán rotation dựa trên vị trí chuột
                  const rotateAmplitude = 14;
                  const rotationX =
                    (offsetY / (rect.height / 2)) * -rotateAmplitude;
                  const rotationY =
                    (offsetX / (rect.width / 2)) * rotateAmplitude;

                  console.log(
                    `🖱️ Mouse move - rotateX: ${rotationX.toFixed(
                      1
                    )}, rotateY: ${rotationY.toFixed(1)}`
                  );

                  // Animate với GSAP
                  gsap.to(img, {
                    rotateX: rotationX,
                    rotateY: rotationY,
                    duration: 0.3,
                    ease: "power2.out",
                    transformPerspective: 1000,
                    force3D: true,
                  });
                }}
                onMouseEnter={(e) => {
                  const img = e.currentTarget.querySelector("img");
                  if (!img) return;

                  console.log("👆 Mouse enter - scaling to 1.05");

                  gsap.to(img, {
                    scale: 1.05,
                    duration: 0.5,
                    ease: "back.out(1.2)",
                    force3D: true,
                  });
                }}
                onMouseLeave={(e) => {
                  const img = e.currentTarget.querySelector("img");
                  if (!img) return;

                  console.log("👋 Mouse leave - reset transform");

                  gsap.to(img, {
                    scale: 1,
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.5,
                    ease: "back.out(1.2)",
                    force3D: true,
                  });
                }}
              >
                <img
                  src={`/img/${src}`}
                  alt={`Gallery ${index + 1}`}
                  className="max-w-[50%] max-h-full object-contain rounded-2xl shadow-2xl"
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Cột phải - Horizontal Text (trong suốt, nhìn xuyên xuống blur) */}
          <div className="w-1/2 flex items-center justify-start pointer-events-auto relative overflow-hidden">
            <div
              ref={horizontalTextRef}
              className="text-3xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap pl-12"
              style={{
                willChange: "transform",
                opacity: 0, // Ẩn hoàn toàn cho đến khi fade in
              }}
            >
              Rain falls the whole night, my love overflows just like rainwater.
              The fallen leaves in the yard, thickly overlaps with my lingering
              thoughts. A few words of dispute, cannot cool my warmth. You
              appear in my poem&apos;s every page.
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Gallery Section - Scroll ngang các ảnh */}
      {showHorizontalGallery && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-start pointer-events-none"
          style={{
            animation: "fadeIn 0.8s ease-out",
          }}
        >
          <div
            ref={horizontalGalleryRef}
            className="flex items-center gap-[50px] pl-12 pr-[50px]"
            style={{
              willChange: "transform",
            }}
          >
            {[
              "DongHai.41622.jpg",
              "DongHai.41419.jpg",
              "DongHai.41304.jpg",
              "DongHai.41182.jpg",
              "DongHai.41078.jpg",
              "DongHai.41049.jpg",
              "3I7A5373.jpg",
              "3I7A5369.jpg",
              "3I7A5228.jpg",
              "3I7A5119.jpg",
              "3I7A5090.jpg",
              "3I7A5196.jpg",
              "3I7A5176.jpg",
            ].map((src, index) => (
              <div
                key={index}
                className="flex-shrink-0 pointer-events-auto"
                style={{ perspective: "1000px" }}
                onMouseMove={(e) => {
                  const container = e.currentTarget;
                  const img = container.querySelector("img");
                  if (!img) return;

                  const rect = container.getBoundingClientRect();
                  const offsetX = e.clientX - rect.left - rect.width / 2;
                  const offsetY = e.clientY - rect.top - rect.height / 2;

                  const rotateAmplitude = 14;
                  const rotationX =
                    (offsetY / (rect.height / 2)) * -rotateAmplitude;
                  const rotationY =
                    (offsetX / (rect.width / 2)) * rotateAmplitude;

                  gsap.to(img, {
                    rotateX: rotationX,
                    rotateY: rotationY,
                    duration: 0.3,
                    ease: "power2.out",
                    transformPerspective: 1000,
                    force3D: true,
                  });
                }}
                onMouseEnter={(e) => {
                  const img = e.currentTarget.querySelector("img");
                  if (!img) return;

                  gsap.to(img, {
                    scale: 1.05,
                    duration: 0.5,
                    ease: "back.out(1.2)",
                    force3D: true,
                  });
                }}
                onMouseLeave={(e) => {
                  const img = e.currentTarget.querySelector("img");
                  if (!img) return;

                  gsap.to(img, {
                    scale: 1,
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.5,
                    ease: "back.out(1.2)",
                    force3D: true,
                  });
                }}
              >
                <img
                  src={`/img/${src}`}
                  alt={`Gallery ${index + 1}`}
                  className="h-[60vh] w-auto object-contain rounded-2xl shadow-2xl"
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RSVP Form - Nền trong suốt */}
      {showRsvp && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center"
          style={{
            animation: "fadeIn 0.8s ease-out",
          }}
        >
          <RsvpForm guest={guest} loading={loading} error={error} />
        </div>
      )}
    </div>
  );
}
