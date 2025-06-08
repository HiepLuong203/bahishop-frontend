import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import './BackToTop.css'; // Import file CSS (nếu bạn muốn style riêng)

const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    // Lấy vị trí hiện tại của scroll
    const scrollY = window.scrollY;
    // Lấy chiều cao của header (giả sử header có id là 'header')
    const header = document.getElementById('header');
    const headerHeight = header ? header.offsetHeight : 0;
    // Điều kiện hiển thị button: scroll xuống quá 250px HOẶC quá chiều cao header
    if (scrollY > 250 || scrollY > headerHeight) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // Tạo hiệu ứng cuộn mượt
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    // Cleanup listener khi component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`back-to-top ${isVisible ? 'back-to-top--visible' : ''}`} onClick={scrollToTop}>
      <FontAwesomeIcon icon={faArrowUp} />
    </div>
  );
};

export default BackToTop;