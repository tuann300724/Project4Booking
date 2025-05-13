import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Settings for the slider
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  // Category image mapping - you can replace these with actual category images
  const categoryImages = {
    'Áo': 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop',
    'Quần': 'https://images.unsplash.com/photo-1604176354204-9268737828e4?q=80&w=800&auto=format&fit=crop',
    'Giày': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop',
    'Phụ kiện': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    'default': 'https://placehold.co/800x600?text=Category'
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-r from-pink-100 to-purple-100">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold text-gray-800 mb-6">
              Thời Trang Mới <br />
              <span className="text-purple-600">Cho Mùa Hè 2024</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Khám phá bộ sưu tập mới nhất với những thiết kế độc đáo và phong cách hiện đại
            </p>
            <Link
              to="/products"
              className="inline-block bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700 transition duration-300"
            >
              Mua ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Slider Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Danh Mục Nổi Bật
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-80">
              <div className="w-12 h-12 border-4 border-t-purple-600 border-gray-200 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="category-slider px-4">
              <Slider {...sliderSettings}>
                {categories.map((category) => (
                  <div key={category.id} className="px-2">
                    <Link to={`/products?category=${category.id}`}>
                      <div className="relative h-80 rounded-lg overflow-hidden group cursor-pointer transition duration-300 transform hover:shadow-xl hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                        <img
                          src={categoryImages[category.name] || categoryImages.default}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        />
                        <div className="absolute bottom-0 left-0 p-6 text-white z-20">
                          <h3 className="text-2xl font-semibold mb-2">{category.name}</h3>
                          <div className="w-0 group-hover:w-full h-1 bg-purple-500 transition-all duration-300"></div>
                          <p className="text-sm opacity-0 group-hover:opacity-100 transition duration-300 mt-2">
                            Khám phá ngay
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </Slider>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Sản Phẩm Nổi Bật
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((product) => (
              <div
                key={product}
                className="bg-white rounded-lg shadow-md overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={`https://placehold.co/400x500?fashion=${product}`}
                    alt={`Product ${product}`}
                    className="w-full h-80 object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                    <button className="bg-white text-gray-800 px-6 py-2 rounded-full hover:bg-purple-600 hover:text-white transition duration-300">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Sản phẩm {product}
                  </h3>
                  <p className="text-gray-600 mb-2">Mô tả ngắn về sản phẩm</p>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-600 font-bold">500.000đ</span>
                    <button className="text-gray-600 hover:text-purple-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-12 text-white">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold mb-6">
                Ưu Đãi Đặc Biệt
              </h2>
              <p className="text-lg mb-8">
                Giảm giá lên đến 50% cho các sản phẩm mùa hè. Áp dụng cho tất cả khách hàng mới.
              </p>
              <button className="bg-white text-purple-600 px-8 py-3 rounded-full hover:bg-gray-100 transition duration-300">
                Xem ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Đăng Ký Nhận Tin
            </h2>
            <p className="text-gray-600 mb-8">
              Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt
            </p>
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-6 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-purple-500"
              />
              <button className="bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700 transition duration-300">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 