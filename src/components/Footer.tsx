import React from "react";
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-info">
          <h3>Liên hệ</h3>
          <p>37 Tô Hiệu - Thường Tín - Hà Nội</p>
          <p>Điện thoại: 0364 797 669</p>
          <p>Email: bahishop@gmail.com</p>
        </div>
        <div className="footer-social">
          <h3>Mạng xã hội</h3>
          <p>
            Facebook: <a href="https://web.facebook.com/luongbahiep.nk">BAHISHOP</a>
          </p>
          <p>
            Zalo: <a href="https://zalo.me/0364797669">0364797777</a>
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
