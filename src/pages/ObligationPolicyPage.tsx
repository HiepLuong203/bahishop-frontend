// src/pages/ObligationPolicyPage.tsx
import React from 'react';
import './PolicyPage.css'; // Sử dụng CSS chung cho các trang chính sách

const ObligationPolicyPage: React.FC = () => {
  return (
    <div className="policy-page-container">
      <div className="policy-page-content">
        <h1>Nghĩa vụ của người mua và người bán</h1>
        <p>
          Để đảm bảo một môi trường giao dịch công bằng và minh bạch, Bahishop quy định rõ ràng nghĩa vụ của cả người mua và người bán.
        </p>

        <h2>1. Nghĩa vụ của người mua</h2>
        <ul>
          <li><strong>Cung cấp thông tin chính xác:</strong> Đảm bảo thông tin cá nhân, địa chỉ nhận hàng và số điện thoại là đúng sự thật và đầy đủ.</li>
          <li><strong>Thanh toán đầy đủ:</strong> Thực hiện thanh toán đầy đủ và đúng hạn cho các sản phẩm đã đặt mua theo phương thức đã chọn.</li>
          <li><strong>Kiểm tra hàng hóa:</strong> Kiểm tra kỹ lưỡng sản phẩm ngay khi nhận hàng để đảm bảo đúng chủng loại, số lượng và không bị hư hỏng. Thông báo ngay cho người bán nếu có bất kỳ vấn đề nào.</li>
          <li><strong>Tuân thủ chính sách:</strong> Đọc và hiểu rõ các chính sách vận chuyển, thanh toán, đổi trả và bảo hành của Bahishop.</li>
          <li><strong>Phản hồi trung thực:</strong> Đưa ra đánh giá và phản hồi trung thực về sản phẩm và dịch vụ.</li>
        </ul>

        <h2>2. Nghĩa vụ của người bán (Bahishop)</h2>
        <ul>
          <li><strong>Cung cấp thông tin sản phẩm chính xác:</strong> Đảm bảo mô tả sản phẩm, hình ảnh và giá cả là đúng sự thật và không gây hiểu lầm.</li>
          <li><strong>Giao hàng đúng hẹn:</strong> Thực hiện giao hàng đúng chủng loại, số lượng và chất lượng sản phẩm như đã cam kết trong thời gian quy định.</li>
          <li><strong>Đảm bảo chất lượng sản phẩm:</strong> Sản phẩm được bán phải đảm bảo chất lượng, nguồn gốc rõ ràng và tuân thủ các tiêu chuẩn an toàn.</li>
          <li><strong>Hỗ trợ khách hàng:</strong> Cung cấp dịch vụ hỗ trợ khách hàng nhanh chóng, chuyên nghiệp và hiệu quả để giải quyết các thắc mắc, khiếu nại.</li>
          <li><strong>Bảo mật thông tin:</strong> Bảo vệ thông tin cá nhân của người mua theo quy định của pháp luật và chính sách bảo mật của Bahishop.</li>
          <li><strong>Giải quyết tranh chấp:</strong> Hỗ trợ giải quyết các tranh chấp phát sinh giữa người mua và người bán một cách công bằng, hợp lý.</li>
        </ul>

        <p>
          BahiShop hy vọng rằng sẽ được sự ủng hộ và hợp tác đến từ Qúy Khách Hàng để chúng tôi luôn cố gắng từng ngày mang đến cho Qúy Khách Hàng những sản phẩm chất lượng tốt nhất !        </p>
      </div>
    </div>
  );
};

export default ObligationPolicyPage;