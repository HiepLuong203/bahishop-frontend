import React from "react";
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-info">
          <h3>Liên hệ</h3>
          <p>Địa chỉ: Khu tự trị BaHi - Hà Nội</p>
          <p>Điện thoại: 0367788999</p>
          <p>Email: bahishop@gmail.com</p>
        </div>
        <div className="footer-social">
          <h3>Mạng xã hội</h3>
          <p>
            Facebook: <a href="https://web.facebook.com/luongbahiep.nk">BAHISHOP</a>
          </p>
          <p>
            Zalo: <a href="https://web.facebook.com/luongbahiep.nk">0364797777</a>
          </p>
        </div>
      </div>
      <p className="footer-copyright">
        &copy; 2025 Bahishop. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
