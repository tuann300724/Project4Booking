import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const destinations = [
  {
    name: 'Hồ Chí Minh',
    image: 'https://cdn6.agoda.net/images/WebCampaign/wc-destination-vn-hcmc.jpg',
  },
  {
    name: 'Vũng Tàu',
    image: 'https://cdn6.agoda.net/images/WebCampaign/wc-destination-vn-vungtau.jpg',
  },
  {
    name: 'Đà Nẵng',
    image: 'https://cdn6.agoda.net/images/WebCampaign/wc-destination-vn-danang.jpg',
  },
  {
    name: 'Hà Nội',
    image: 'https://cdn6.agoda.net/images/WebCampaign/wc-destination-vn-hanoi.jpg',
  },
  {
    name: 'Đà Lạt',
    image: 'https://cdn6.agoda.net/images/WebCampaign/wc-destination-vn-dalat.jpg',
  },
  {
    name: 'Nha Trang',
    image: 'https://cdn6.agoda.net/images/WebCampaign/wc-destination-vn-nhatrang.jpg',
  },
  {
    name: 'Phú Quốc',
    image: 'https://cdn6.agoda.net/images/WebCampaign/wc-destination-vn-phuquoc.jpg',
  },
];

const TABS = [
  { label: 'Khách sạn', value: 'hotel' },
  { label: 'Nhà & Căn hộ', value: 'home' },
  { label: 'Máy bay + K.sạn', value: 'flight_hotel' },
  { label: 'Vé máy bay', value: 'flight' },
];

const Home = () => {
  const [tab, setTab] = useState('hotel');
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);

  return (
    <div className="w-full bg-gray-100 min-h-screen">
      {/* Banner */}
      <div className="bg-[url('https://cdn6.agoda.net/images/MVC/default/backgrounds/bg-hero-vn.jpg')] bg-cover bg-center h-[350px] flex items-end justify-center relative">
        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-2xl px-8 py-8 min-w-[900px] absolute left-1/2 bottom-[-80px] -translate-x-1/2 z-10 max-w-full">
          <div className="flex gap-3 mb-4 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t.value}
                className={`px-4 py-2 rounded-full font-semibold transition-colors ${tab === t.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setTab(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <form className="flex gap-3 items-center flex-wrap">
            <input
              className="border border-gray-200 rounded-lg px-4 py-3 text-base min-w-[180px] bg-gray-50 focus:outline-none focus:border-blue-600 transition w-full sm:w-auto"
              type="text"
              placeholder="Nhập điểm du lịch hoặc tên khách sạn"
              value={destination}
              onChange={e => setDestination(e.target.value)}
            />
            <input
              className="border border-gray-200 rounded-lg px-4 py-3 text-base min-w-[180px] bg-gray-50 focus:outline-none focus:border-blue-600 transition w-full sm:w-auto"
              type="date"
              value={checkIn}
              onChange={e => setCheckIn(e.target.value)}
            />
            <input
              className="border border-gray-200 rounded-lg px-4 py-3 text-base min-w-[180px] bg-gray-50 focus:outline-none focus:border-blue-600 transition w-full sm:w-auto"
              type="date"
              value={checkOut}
              onChange={e => setCheckOut(e.target.value)}
            />
            <select
              className="border border-gray-200 rounded-lg px-4 py-3 text-base min-w-[120px] bg-gray-50 focus:outline-none focus:border-blue-600 transition w-full sm:w-auto"
              value={guests}
              onChange={e => setGuests(e.target.value)}
            >
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} người lớn</option>)}
            </select>
            <select
              className="border border-gray-200 rounded-lg px-4 py-3 text-base min-w-[120px] bg-gray-50 focus:outline-none focus:border-blue-600 transition w-full sm:w-auto"
              value={rooms}
              onChange={e => setRooms(e.target.value)}
            >
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} phòng</option>)}
            </select>
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-12 py-3 text-lg font-semibold shadow transition ml-3 w-full sm:w-auto" type="submit">TÌM</button>
          </form>
        </div>
      </div>

      {/* Slider điểm đến */}
      <div className="mt-32 pb-12 max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-8 text-gray-900">Các điểm đến thu hút nhất Việt Nam</h2>
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2 },
            900: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
          }}
          className="!pb-10"
        >
          {destinations.map((d) => (
            <SwiperSlide key={d.name}>
              <div className="rounded-2xl overflow-hidden shadow-lg bg-white cursor-pointer transition-transform hover:-translate-y-1 hover:scale-105 hover:shadow-2xl text-center">
                <img src={d.image} alt={d.name} className="w-full h-[180px] object-cover block" />
                <div className="text-base font-medium text-gray-900 py-4">{d.name}</div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Home; 