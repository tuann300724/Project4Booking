import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import { useUser } from "../context/UserContext";

const PromoWheel = ({ isOpen, onClose }) => {
  const [prizes, setPrizes] = useState([]);
  const [loadingPrizes, setLoadingPrizes] = useState(false);
  const [prizesError, setPrizesError] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const { user } = useUser();
  const [countWheel, setCountWheel] = useState(null);

  const wheelRef = useRef(null);
  const buttonRef = useRef(null);

  // Fetch prizes from API when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoadingPrizes(true);
      setPrizesError("");
      fetch("http://localhost:8080/api/prizes")
        .then((res) => {
          if (!res.ok) throw new Error("Lỗi khi lấy danh sách phần thưởng");
          return res.json();
        })
        .then((data) => setPrizes(data))
        .catch((err) => setPrizesError(err.message))
        .finally(() => setLoadingPrizes(false));
    }
  }, [isOpen]);

  // Fetch countWheel from API when modal opens
  useEffect(() => {
    if (isOpen && user?.id) {
      fetch(`http://localhost:8080/api/users/${user.id}`)
        .then((res) => res.json())
        .then((data) => setCountWheel(data.countWheel))
        .catch(() => setCountWheel(0));
    }
  }, [isOpen, user]);

  // Thêm kiểm tra lượt quay
  const canUserSpin = typeof countWheel === "number" && countWheel > 0;

  // Xác định index "Chúc bạn may mắn lần sau"
  const BETTER_LUCK_INDEX = prizes.findIndex((p) =>
    p.label?.toLowerCase().includes("may mắn")
  );

  // Quay vòng quay
  const spinWheel = () => {
    if (spinning || !canUserSpin) return;
    setSpinning(true);
    setShowResult(false);
    setSelectedPrize(null);

    // Xác suất trúng "Chúc bạn may mắn lần sau" 10%, còn lại random các phần thưởng khác
    let prizeIndex;
    if (Math.random() < 0.1 && BETTER_LUCK_INDEX !== -1) {
      prizeIndex = BETTER_LUCK_INDEX;
    } else {
      const otherPrizes = prizes
        .map((_, i) => i)
        .filter((i) => i !== BETTER_LUCK_INDEX);
      prizeIndex = otherPrizes[Math.floor(Math.random() * otherPrizes.length)];
    }
    const prize = prizes[prizeIndex];
    const segmentAngle = 360 / prizes.length;
    const targetAngle =
      360 * 5 + (360 - prizeIndex * segmentAngle - segmentAngle / 2);
    setWheelRotation(targetAngle);
    setTimeout(() => {
      setSpinning(false);
      setSelectedPrize(prize);
      setShowResult(true);
      // Nếu trúng thưởng, gọi API lưu voucher và trừ lượt quay
      if (prize.code) {
        saveVoucherToAPI(prize);
        // Trừ lượt quay
        if (user?.id) {
          fetch(`http://localhost:8080/api/users/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ countWheel: countWheel - 1 }),
          }).then(() => setCountWheel(countWheel - 1));
        }
      } else {
        // Nếu không trúng, vẫn trừ lượt quay
        if (user?.id) {
          fetch(`http://localhost:8080/api/users/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ countWheel: countWheel - 1 }),
          }).then(() => setCountWheel(countWheel - 1));
        }
      }
    }, 5000);
  };

  // Function to save voucher to API
  const saveVoucherToAPI = async (prize) => {
    // Only save vouchers if there's an actual prize (code is not null)
    if (!prize || !prize.code) return;

    try {
      // Create start date (now) and end date (24 hours from now)
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 24);

      // Format dates as ISO strings
      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = endDate.toISOString();

      // Get discount value from the prize
      let discountValue;
      if (prize.discountType === "percentage") {
        // Convert percentage to number (e.g., "10%" to 10)
        discountValue = parseInt(prize.value.replace(/%/g, ""), 10);
      } else if (prize.discountType === "fixed") {
        // Convert fixed amount (e.g., "50.000đ" to 50000)
        discountValue = parseInt(prize.value.replace(/\D/g, ""), 10);
      }
      let userId = user?.id;
      if (!userId) {
        try {
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            userId = parsedUser.id;
          }
        } catch (error) {}
      }
      // Prepare the voucher data
      const voucherData = {
        code: prize.code,
        discountType: prize.discountType,
        discountValue: discountValue,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        used: false,
        userId: userId,
      };

      // Make the API call
      const response = await fetch("http://localhost:8080/api/vouchers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(voucherData),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error saving voucher:", error);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã sao chép mã: ${code}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Vòng quay may mắn
        </h2>
        {countWheel !== null && (
          <div className="mb-2 text-sm text-gray-600">
            Lượt quay còn lại:{" "}
            <span className="font-bold text-purple-600">{countWheel}</span>
          </div>
        )}
        {!canUserSpin && (
          <div className="mb-4 text-red-500 font-semibold">
            Bạn đã hết lượt quay. hoá đơn trên 500k sẽ được cộng thêm lượt quay
          </div>
        )}
        {loadingPrizes ? (
          <p className="text-gray-600 mb-6">Đang tải phần thưởng...</p>
        ) : prizesError ? (
          <p className="text-red-500 mb-6">{prizesError}</p>
        ) : prizes.length === 0 ? (
          <p className="text-gray-500 mb-6">Không có phần thưởng nào.</p>
        ) : (
          <>
            {!showResult ? (
              <>
                <p className="text-gray-600 mb-6">
                  {canUserSpin
                    ? "Quay để nhận mã giảm giá đặc biệt!"
                    : "Bạn không có lượt quay nào cả."}
                </p>

                <div className="relative w-64 h-64 mx-auto mb-6">
                  {/* Spin pointer */}
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 
                              border-l-[10px] border-l-transparent 
                              border-b-[25px] border-b-red-600 
                              border-r-[10px] border-r-transparent 
                              z-10"
                  ></div>

                  {/* Wheel */}
                  <div
                    ref={wheelRef}
                    className="w-full h-full rounded-full border-4 border-gray-200 relative overflow-hidden"
                    style={{
                      transform: `rotate(${wheelRotation}deg)`,
                      transition: spinning
                        ? "transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                        : "none",
                    }}
                  >
                    {prizes.map((prize, index) => {
                      const angle = (360 / prizes.length) * index;
                      return (
                        <div
                          key={index}
                          className="absolute top-0 left-0 w-full h-full origin-bottom-center text-white font-medium text-xs"
                          style={{
                            transform: `rotate(${angle}deg)`,
                            clipPath: `polygon(50% 0%, 50% 50%, 100% 0%)`,
                          }}
                        >
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{
                              backgroundColor: prize.color,
                              transform: "rotate(45deg)",
                            }}
                          >
                            <span
                              className="transform -rotate-90 absolute text-center"
                              style={{
                                width: "80px",
                                top: "40px",
                                left: "calc(50% - 55px)",
                              }}
                            >
                              {prize.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  ref={buttonRef}
                  onClick={spinWheel}
                  disabled={spinning || !canUserSpin}
                  className={`px-6 py-3 rounded-lg text-white font-bold shadow-lg transition-all
            ${
              spinning || !canUserSpin
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105"
            }`}
                >
                  {spinning
                    ? "Đang quay..."
                    : !canUserSpin
                    ? "Hết lượt quay"
                    : "Quay ngay!"}
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <div
                  className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4`}
                  style={{ backgroundColor: selectedPrize.color }}
                >
                  <span className="text-white text-lg font-bold">
                    {selectedPrize.value || "!"}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2">
                  {selectedPrize.code
                    ? "Chúc mừng! Bạn đã nhận được:"
                    : "Chúc bạn may mắn lần sau"}
                </h3>

                {selectedPrize.code && (
                  <>
                    <p className="text-gray-600 mb-4">{selectedPrize.label}</p>

                    <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between mb-6">
                      <span className="font-mono font-bold text-purple-700">
                        {selectedPrize.code}
                      </span>
                      <button
                        onClick={() => copyCode(selectedPrize.code)}
                        className="bg-purple-600 text-white text-sm px-2 py-1 rounded hover:bg-purple-700"
                      >
                        Sao chép
                      </button>
                    </div>
                  </>
                )}

                <div className="flex justify-center space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default PromoWheel;
