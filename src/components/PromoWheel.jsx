import React, { useState, useEffect, useRef, useCallback } from 'react';
import Modal from './Modal';

const prizes = [
  { label: 'Giảm 10%', color: '#ff6b6b', code: 'SPIN10', value: '10%', discountType: "percentage" },
  { label: 'Giảm 5%', color: '#4ecdc4', code: 'SPIN5', value: '5%', discountType: "percentage" },
  { label: 'Giảm 50K', color: '#ff9f43', code: 'SPIN50K', value: '50.000đ', discountType: "fixed" },
  { label: 'Chúc bạn may mắn lần sau', color: '#bbb', code: null, value: null, discountType: null },
  { label: 'Giảm 20%', color: '#e056fd', code: 'SPIN20', value: '20%', discountType: "percentage" },
  { label: 'Giảm 100K', color: '#f53b57', code: 'SPIN100K', value: '100.000đ', discountType: "fixed" },
  { label: 'Giảm 1%', color: '#5f27cd', code: 'SPIN1', value: '1%', discountType: "percentage" },
  { label: 'Giảm 15%', color: '#0abde3', code: 'SPIN15', value: '15%', discountType: "percentage" },
];

// Index of "Chúc bạn may mắn lần sau" prize
const BETTER_LUCK_INDEX = 3;

// Constants
const COOLDOWN_SECONDS = 10; // 10 seconds for testing

const PromoWheel = ({ isOpen, onClose, userId = 3 }) => {
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [lastSpinTime, setLastSpinTime] = useState(() => {
    return localStorage.getItem('lastSpinTime') || null;
  });
  const [canSpin, setCanSpin] = useState(() => {
    const lastSpin = localStorage.getItem('lastSpinTime');
    if (!lastSpin) return true;
    
    // Check if cooldown period has passed since last spin
    const lastSpinDate = new Date(parseInt(lastSpin));
    const now = new Date();
    const secondsPassed = (now - lastSpinDate) / 1000;
    return secondsPassed >= COOLDOWN_SECONDS;
  });
  const [countdown, setCountdown] = useState(0);
  const [timeDisplay, setTimeDisplay] = useState('');
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', or null
  
  const wheelRef = useRef(null);
  const buttonRef = useRef(null);
  const intervalRef = useRef(null);

  // Format time remaining for display
  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return '';
    return `${seconds} giây`;
  };

  // Function to check if user can spin and update countdown
  const checkSpinEligibility = useCallback(() => {
    const lastSpin = localStorage.getItem('lastSpinTime');
    if (!lastSpin) {
      setCanSpin(true);
      setCountdown(0);
      setTimeDisplay('');
      return 0;
    }
    
    // Check if cooldown period has passed since last spin
    const lastSpinDate = new Date(parseInt(lastSpin));
    const now = new Date();
    const secondsPassed = (now - lastSpinDate) / 1000;
    const secondsUntilNextSpin = Math.max(0, Math.ceil(COOLDOWN_SECONDS - secondsPassed));
    
    const canSpinNow = secondsPassed >= COOLDOWN_SECONDS;
    setCanSpin(canSpinNow);
    setCountdown(canSpinNow ? 0 : secondsUntilNextSpin);
    setTimeDisplay(formatTimeRemaining(secondsUntilNextSpin));
    
    return secondsUntilNextSpin;
  }, []);

  // Update countdown on a regular basis
  const startCountdownTimer = useCallback(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // For testing, update every second
    const updateInterval = 1000; // 1 second
    
    // Start a new interval
    intervalRef.current = setInterval(() => {
      const timeLeft = checkSpinEligibility();
      
      // If time is up, clear the interval
      if (timeLeft <= 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, updateInterval);
  }, [checkSpinEligibility]);

  // Reset everything when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSpinning(false);
      setWheelRotation(0);
      setSelectedPrize(null);
      setShowResult(false);
      
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      // Check spin eligibility on open and start timer if needed
      const timeLeft = checkSpinEligibility();
      if (timeLeft > 0) {
        startCountdownTimer();
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOpen, checkSpinEligibility, startCountdownTimer]);
  
  // Start countdown when lastSpinTime changes
  useEffect(() => {
    if (lastSpinTime && !canSpin) {
      startCountdownTimer();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [lastSpinTime, canSpin, startCountdownTimer]);

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
        discountValue = parseInt(prize.value.replace(/%/g, ''), 10);
      } else if (prize.discountType === "fixed") {
        // Convert fixed amount (e.g., "50.000đ" to 50000)
        discountValue = parseInt(prize.value.replace(/\D/g, ''), 10);
      }
      
      // Prepare the voucher data
      const voucherData = {
        code: prize.code,
        discountType: prize.discountType,
        discountValue: discountValue,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        used: false,
        userId: userId
      };
      
      // Make the API call
      const response = await fetch('http://localhost:8080/api/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(voucherData)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      setSaveStatus('success');
      console.log('Voucher saved successfully', await response.json());
    } catch (error) {
      setSaveStatus('error');
      console.error('Error saving voucher:', error);
    }
  };

  const spinWheel = () => {
    if (spinning || !canSpin) return;
    
    setSpinning(true);
    setShowResult(false);
    setSelectedPrize(null);
    setSaveStatus(null);
    
    // Record spin time
    const now = new Date().getTime();
    localStorage.setItem('lastSpinTime', now.toString());
    setLastSpinTime(now);
    setCanSpin(false);
    
    // Determine winning prize with weighted probability
    // 80% chance for "Chúc bạn may mắn lần sau", 20% for other prizes
    let prizeIndex;
    if (Math.random() < 0.1) {
      // 80% chance to get "Chúc bạn may mắn lần sau"
      prizeIndex = BETTER_LUCK_INDEX;
    } else {
      // 20% chance to get any other prize
      // Get random index excluding BETTER_LUCK_INDEX
      const otherPrizes = [...Array(prizes.length).keys()].filter(i => i !== BETTER_LUCK_INDEX);
      prizeIndex = otherPrizes[Math.floor(Math.random() * otherPrizes.length)];
    }
    
    const prize = prizes[prizeIndex];
    
    // Calculate rotation angle
    // Each segment is 360 / prizes.length degrees
    // We add some extra rotations for effect (5 full rotations)
    const segmentAngle = 360 / prizes.length;
    const targetAngle = 360 * 5 + (360 - (prizeIndex * segmentAngle));
    
    // Set the rotation
    setWheelRotation(targetAngle);
    
    // Show result after animation ends
    setTimeout(() => {
      setSpinning(false);
      setSelectedPrize(prize);
      setShowResult(true);
      
      // If user won an actual prize (not "better luck next time"), save it to API
      if (prize.code) {
        saveVoucherToAPI(prize);
      }
    }, 5000); // Match this with the CSS animation duration
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
        
        {!showResult ? (
          <>
            <p className="text-gray-600 mb-6">
              {canSpin 
                ? "Quay để nhận mã giảm giá đặc biệt!" 
                : `Vui lòng đợi ${timeDisplay} trước khi quay tiếp.`}
            </p>

            {!canSpin && countdown > 0 && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${(countdown / COOLDOWN_SECONDS) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="relative w-64 h-64 mx-auto mb-6">
              {/* Spin pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 
                              border-l-[10px] border-l-transparent 
                              border-b-[25px] border-b-red-600 
                              border-r-[10px] border-r-transparent 
                              z-10">
              </div>
              
              {/* Wheel */}
              <div 
                ref={wheelRef}
                className="w-full h-full rounded-full border-4 border-gray-200 relative overflow-hidden"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: spinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
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
                        clipPath: `polygon(50% 0%, 50% 50%, 100% 0%)`
                      }}
                    >
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: prize.color, transform: 'rotate(45deg)' }}
                      >
                        <span className="transform -rotate-90 absolute text-center" style={{ width: '80px', top: '40px', left: 'calc(50% - 55px)' }}>
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
              disabled={spinning || !canSpin}
              className={`px-6 py-3 rounded-lg text-white font-bold shadow-lg transition-all
                ${spinning || !canSpin 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'}`}
            >
              {spinning ? 'Đang quay...' : canSpin ? 'Quay ngay!' : `Đợi ${countdown}s`}
            </button>
          </>
        ) : (
          <div className="text-center py-4">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4`} style={{ backgroundColor: selectedPrize.color }}>
              <span className="text-white text-lg font-bold">{selectedPrize.value || '!'}</span>
            </div>
            
            <h3 className="text-xl font-bold mb-2">
              {selectedPrize.code 
                ? 'Chúc mừng! Bạn đã nhận được:' 
                : 'Chúc bạn may mắn lần sau'}
            </h3>
            
            {selectedPrize.code && (
              <>
                <p className="text-gray-600 mb-4">{selectedPrize.label}</p>
                
                <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between mb-6">
                  <span className="font-mono font-bold text-purple-700">{selectedPrize.code}</span>
                  <button 
                    onClick={() => copyCode(selectedPrize.code)}
                    className="bg-purple-600 text-white text-sm px-2 py-1 rounded hover:bg-purple-700"
                  >
                    Sao chép
                  </button>
                </div>
                
                {saveStatus === 'success' && (
                  <p className="text-sm text-green-500 mb-2">
                    Mã giảm giá đã được lưu vào tài khoản của bạn
                  </p>
                )}
                
                {saveStatus === 'error' && (
                  <p className="text-sm text-red-500 mb-2">
                    Có lỗi khi lưu mã giảm giá. Vui lòng thử lại sau.
                  </p>
                )}
                
                <p className="text-sm text-gray-500 mb-4">
                  Mã giảm giá có hiệu lực trong 24 giờ
                </p>
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

        {!showResult && (
          <div className="mt-4 text-xs text-gray-500">
            Mỗi tài khoản được quay 1 lần mỗi 10 giây
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PromoWheel; 