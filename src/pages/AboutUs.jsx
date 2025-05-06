import React from 'react';

const AboutUs = () => {
  const teamMembers = [
    {
      name: 'Nguyễn Văn A',
      position: 'CEO & Founder',
      image: 'https://placehold.co/300x300?text=CEO',
      description: 'Với hơn 10 năm kinh nghiệm trong ngành thời trang.'
    },
    {
      name: 'Trần Thị B',
      position: 'Creative Director',
      image: 'https://placehold.co/300x300?text=Director',
      description: 'Chuyên gia trong lĩnh vực thiết kế thời trang.'
    },
    {
      name: 'Lê Văn C',
      position: 'Marketing Manager',
      image: 'https://placehold.co/300x300?text=Manager',
      description: 'Đam mê với digital marketing và phát triển thương hiệu.'
    }
  ];

  const values = [
    {
      title: 'Chất Lượng',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Cam kết mang đến những sản phẩm chất lượng cao nhất cho khách hàng.'
    },
    {
      title: 'Sáng Tạo',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      description: 'Luôn đổi mới và sáng tạo trong từng thiết kế.'
    },
    {
      title: 'Khách Hàng',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      ),
      description: 'Đặt sự hài lòng của khách hàng lên hàng đầu.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-purple-600">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Về Chúng Tôi</h1>
            <p className="text-xl">Định hình phong cách thời trang của bạn</p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Câu Chuyện Của Chúng Tôi</h2>
          <p className="text-gray-600 leading-relaxed mb-8">
            Được thành lập vào năm 2020, chúng tôi bắt đầu với một ước mơ đơn giản: 
            mang đến những sản phẩm thời trang chất lượng cao với giá cả hợp lý. 
            Qua nhiều năm phát triển, chúng tôi đã trở thành một trong những thương hiệu 
            thời trang được yêu thích nhất tại Việt Nam.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-purple-600 mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Đội Ngũ Của Chúng Tôi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-4 mx-auto w-48 h-48 rounded-full overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-purple-600 mb-2">{member.position}</p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Liên Hệ Với Chúng Tôi</h2>
          <p className="text-gray-600 mb-8">
            Chúng tôi luôn sẵn sàng lắng nghe ý kiến của bạn. Hãy liên hệ với chúng tôi 
            nếu bạn có bất kỳ câu hỏi hoặc đề xuất nào.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition duration-300">
              Gửi Email
            </button>
            <button className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition duration-300">
              Gọi Cho Chúng Tôi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;