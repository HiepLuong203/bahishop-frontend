// src/pages/ShippingPolicyPage.tsx
import React from 'react';
import './PolicyPage.css'; // Sử dụng CSS chung cho các trang chính sách

const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="policy-page-container">
      <div className="policy-page-content">
        <h1>Chính sách vận chuyển</h1>
        <p>
          Chào mừng quý khách đến với Bahishop! Chúng tôi cam kết mang đến trải nghiệm mua sắm tiện lợi và giao hàng nhanh chóng, an toàn.
        </p>

        <h2>1. Thời gian xử lý đơn hàng</h2>
        <ul>
          <li>Đơn hàng được xác nhận trước 15:00 hàng ngày sẽ được xử lý và bàn giao cho đơn vị vận chuyển trong vòng 24 giờ làm việc (trừ Chủ Nhật và ngày lễ).</li>
          <li>Đơn hàng sau 15:00 sẽ được xử lý vào ngày làm việc tiếp theo.</li>
        </ul>

        <h2>2. Thời gian giao hàng dự kiến</h2>
        <ul>
          <li><strong>Nội thành Hà Nội:</strong> 1-2 ngày làm việc.</li>
          <li><strong>Các tỉnh miền Bắc:</strong> 2-3 ngày làm việc.</li>
          <li><strong>Các tỉnh miền Trung & miền Nam:</strong> 3-5 ngày làm việc.</li>
          <li>Thời gian có thể thay đổi tùy thuộc vào địa điểm cụ thể và tình hình thời tiết, sự kiện bất khả kháng.</li>
        </ul>

        <h2>3. Chi phí vận chuyển</h2>
        <ul>
          <li>Khu vực nội thành : Phí vận chuyển từ 20.000VNĐ - 25.000VNĐ, miễn ship trong bán kính 10km.</li>
          <li>Khu vực ngoại thành, các tỉnh khác : Phí vận chuyển từ 30.000VNĐ - 35.000VNĐ.</li>
          <li>Chúng tôi thường xuyên có các chương trình khuyến mãi miễn phí vận chuyển cho đơn hàng từ 500.000VNĐ trở lên.</li>
        </ul>

        <h2>4. Lưu ý</h2>
        <ul>
          <li>Vui lòng đảm bảo thông tin địa chỉ và số điện thoại nhận hàng là chính xác để tránh sự chậm trễ.</li>
          <li>Nếu quý khách không nhận được hàng trong thời gian dự kiến, vui lòng liên hệ ngay với chúng tôi để được hỗ trợ kịp thời.</li>
        </ul>
        <p>
          Xin chân thành cảm ơn quý khách đã tin tưởng và ủng hộ Bahishop!
        </p>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;