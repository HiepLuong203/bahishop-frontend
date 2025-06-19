// src/pages/PaymentPolicyPage.tsx
import React from 'react';
import './PolicyPage.css'; // Sử dụng CSS chung cho các trang chính sách

const PaymentPolicyPage: React.FC = () => {
  return (
    <div className="policy-page-container">
      <div className="policy-page-content">
        <h1>Chính sách thanh toán</h1>
        <p>
          Bahishop cung cấp nhiều phương thức thanh toán linh hoạt và an toàn để quý khách có thể lựa chọn phù hợp nhất với mình.
        </p>

        <h2>1. Thanh toán khi nhận hàng (COD - Cash On Delivery)</h2>
        <ul>
          <li>Quý khách thanh toán trực tiếp bằng tiền mặt cho nhân viên giao hàng ngay khi nhận được sản phẩm.</li>
          <li>Đây là phương thức tiện lợi, đảm bảo an toàn cho quý khách.</li>
        </ul>

        <h2>2. Thanh toán chuyển khoản ngân hàng</h2>
        <ul>
          <li>Quý khách có thể chuyển khoản trực tiếp vào tài khoản ngân hàng của Bahishop.</li>
          <li>Thông tin tài khoản:
            <ul>
              <li><strong>Tên ngân hàng:</strong> Ngân hàng MB Bank </li>
              <li><strong>Số tài khoản:</strong> 333329082003</li>
              <li><strong>Chủ tài khoản:</strong> Cong Ty TNHH BAHISHOP</li>
            </ul>
          </li>
          <li>Sau khi chuyển khoản, vui lòng thông báo cho chúng tôi qua điện thoại hoặc email để đơn hàng được xác nhận nhanh chóng.</li>
        </ul>

        <h2>3. Lưu ý chung</h2>
        <ul>
          <li>Tất cả các giao dịch đều được bảo mật tuyệt đối.</li>
          <li>Nếu có bất kỳ vấn đề nào trong quá trình thanh toán, vui lòng liên hệ ngay với bộ phận chăm sóc khách hàng của chúng tôi để được hỗ trợ.</li>
        </ul>
        <p>
          Cảm ơn quý khách đã tin tưởng và mua sắm tại Bahishop!
        </p>
      </div>
    </div>
  );
};

export default PaymentPolicyPage;