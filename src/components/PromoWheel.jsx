import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';

const prizes = [
  { label: 'Giảm 10%', color: '#ff6b6b', code: 'SPIN10', value: '10%' },
  { label: 'Freeship', color: '#4ecdc4', code: 'FREESHIP', value: 'Miễn phí vận chuyển' },
  { label: 'Giảm 50K', color: '#ff9f43', code: 'SPIN50K', value: '50.000đ' },
  { label: 'Chúc bạn may mắn lần sau', color: '#bbb', code: null, value: null },
  { label: 'Giảm 20%', color: '#e056fd', code: 'SPIN20', value: '20%' },
  { label: 'Giảm 100K', color: '#f53b57', code: 'SPIN100K', value: '100.000đ' },
  { label: 'Mua 1 tặng 1', color: '#5f27cd', code: 'BUY1GET1', value: 'Mua 1 tặng 1' },
  { label: 'Giảm 15%', color: '#0abde3', code: 'SPIN15', value: '15%' },
];

const PromoWheel = ({ isOpen, onClose }) => {
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [spinCount, setSpinCount] = useState(() => {
    const saved = localStorage.getItem('spinCount');
    return saved ? parseInt(saved) : 0;
  });
  const [remainingSpins, setRemainingSpins] = useState(() => {
    const saved = localStorage.getItem('spinCount');
    return saved ? Math.max(0, 3 - parseInt(saved)) : 3;
  });
  const wheelRef = useRef(null);
  const buttonRef = useRef(null);

  // Save spin count to localStorage
  useEffect(() => {
    localStorage.setItem('spinCount', spinCount.toString());
  }, [spinCount]);

  // Reset everything when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSpinning(false);
      setWheelRotation(0);
      setSelectedPrize(null);
      setShowResult(false);
    }
  }, [isOpen]);

  const spinWheel = () => {
    if (spinning || remainingSpins <= 0) return;
    
    setSpinning(true);
    setShowResult(false);
    setSelectedPrize(null);
    
    // Increment spin count
    const newSpinCount = spinCount + 1;
    setSpinCount(newSpinCount);
    setRemainingSpins(Math.max(0, 3 - newSpinCount));
    
    // Determine winning prize (random selection)
    const prizeIndex = Math.floor(Math.random() * prizes.length);
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
              Quay để nhận mã giảm giá đặc biệt! Bạn còn {remainingSpins} lượt quay.
            </p>

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
              disabled={spinning || remainingSpins <= 0}
              className={`px-6 py-3 rounded-lg text-white font-bold shadow-lg transition-all
                ${spinning || remainingSpins <= 0 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'}`}
            >
              {spinning ? 'Đang quay...' : remainingSpins > 0 ? 'Quay ngay!' : 'Đã hết lượt quay'}
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
                
                <p className="text-sm text-gray-500 mb-4">
                  Mã giảm giá có hiệu lực trong 24 giờ
                </p>
              </>
            )}
            
            <div className="flex justify-center space-x-3">
              {remainingSpins > 0 && (
                <button
                  onClick={() => {
                    setShowResult(false);
                    setWheelRotation(0);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Quay tiếp
                </button>
              )}
              
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
            Mỗi tài khoản được quay tối đa 3 lần mỗi ngày
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PromoWheel; 