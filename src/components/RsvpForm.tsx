/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import HandwritingText from "./HandwritingText";

type Guest = {
  id: string;
  name: string;
  attended: boolean;
  transport: "SELF" | "SPONSOR" | null;
  groom: boolean;
};

interface RsvpFormProps {
  guest: Guest | null;
  loading: boolean;
  error: string | null;
  isMobile: boolean;
}

export default function RsvpForm({
  guest,
  loading,
  error,
  isMobile,
}: RsvpFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [attended, setAttended] = useState(false);
  const [transport, setTransport] = useState<"SELF" | "SPONSOR">("SELF");

  // Sync attended và transport từ guest data
  useEffect(() => {
    if (guest) {
      setAttended(guest.attended);
      if (guest.transport) {
        setTransport(guest.transport);
      }
    }
  }, [guest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guest) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/rsvp/${guest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attended,
          transport: attended ? transport : undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to update RSVP");

      alert("RSVP updated successfully!");
    } catch {
      alert("Failed to submit RSVP");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="text-center p-8 bg-white/80 rounded-2xl shadow-2xl">
        <p className="text-2xl font-bold">Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center p-8 bg-white/80 rounded-2xl shadow-2xl">
        <p className="text-2xl font-bold text-red-600">Error: {error}</p>
        <p className="mt-4">Please contact the organizer</p>
      </div>
    );

  if (!guest)
    return (
      <div className="text-center p-8 bg-white/80 rounded-2xl shadow-2xl">
        <p className="text-2xl font-bold">Guest not found</p>
      </div>
    );

  return (
    <section className="relative" style={{ zIndex: 50 }}>
      {/* <div className="absolute h-full w-full backdrop-blur-2xl bg-amber-50/20" /> */}
      <div className="mx-auto max-w-3xl text-black p-8">
        <div>
          <p
            className={`font-bold text-white/90 ${
              isMobile ? "text-xl mt-25 text-center" : "text-3xl"
            }`}
          >
            <HandwritingText
              text={`Kính mời: ${guest.name}`}
              className={isMobile ? "text-5xl" : "text-8xl"}
            />
          </p>
          <div
            style={{ fontFamily: "var(--font-oswald)" }}
            className={`text-white/90 text-center  ${
              isMobile ? "text-lg space-y-0.5" : "text-3xl space-y-4"
            }`}
          >
            <div>Tới dự bữa tiệc chung vui với gia đình chúng tôi</div>
            {guest.groom ? (
              <div>Vào hồi 12 giờ 00, Chủ Nhật, ngày 04-01-2026</div>
            ) : (
              <div>Vào hồi 12 giờ 00, Chủ Nhật, ngày 03-01-2026</div>
            )}
            {guest.groom ? (
              <div>Tại tư gia nhà trai: Thôn 7, Vũ Đoài, Vũ Thư, Thái Bình</div>
            ) : (
              <div>Tại tư gia nhà gái: Quỳnh Thọ, Quỳnh Phụ, Thái Bình</div>
            )}

            {guest.groom ? (
              <div>Số điện thoại liên hệ chú rể: 0339518785</div>
            ) : (
              <div>Số điện thoại liên hệ chú rể: 0399142921</div>
            )}

            <form
              onSubmit={handleSubmit}
              className={isMobile ? "space-y-1" : "space-y-3 mt-5"}
            >
              <div>
                <label
                  className={`cursor-pointer flex items-center justify-center ${
                    isMobile ? "mt-6" : "mt-10"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mr-3"
                    checked={attended}
                    onChange={(e) => setAttended(e.target.checked)}
                  />
                  Nếu bạn tham gia được vui lòng tích chọn vào đây.
                </label>
              </div>

              <div
                style={{
                  opacity: attended ? 1 : 0,
                  visibility: attended ? "visible" : "hidden",
                  transition: "opacity 0.3s ease-in-out",
                  height: "auto",
                  minHeight: isMobile ? "40px" : "80px",
                }}
              >
                <div className={isMobile ? "space-y-1" : "space-y-3"}>
                  <p>Chọn phương án di chuyển:</p>
                  <div className="flex items-center justify-center">
                    <label className="mr-12 cursor-pointer flex items-center">
                      <input
                        type="radio"
                        name="transport"
                        value="SELF"
                        className="mr-2"
                        checked={transport === "SELF"}
                        onChange={() => setTransport("SELF")}
                      />
                      Tự đi
                    </label>
                    <label className="cursor-pointer flex items-center">
                      <input
                        type="radio"
                        name="transport"
                        value="SPONSOR"
                        className="mr-2"
                        checked={transport === "SPONSOR"}
                        onChange={() => setTransport("SPONSOR")}
                      />
                      Chủ nhà đặt xe.
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`bg-blue-500/70 backdrop-blur-xl rounded-full cursor-pointer hover:scale-110 transition-all transition-300 ease-in ${
                  isMobile
                    ? "!text-xl px-8 py-1"
                    : "!text-2xl px-10 py-1.5 mt-4"
                }`}
              >
                {submitting ? "Đang gửi..." : "Gửi"}
              </button>
              <div className="flex justify-center mt-4">
                <img
                  src={`/qr/${guest.groom ? "nam.jpg" : "nu.jpg"}`}
                  alt="qr"
                  className="w-[120px] object-contain rounded-xl shadow-2xl"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
