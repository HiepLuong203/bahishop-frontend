import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './ImageModal.css'; // Sẽ tạo file CSS này ở Bước 3

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

const ImageModal: React.FC<ImageModalProps> = ({
  imageUrl,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) => {
  useEffect(() => {
    // Ngăn cuộn trang khi modal mở
    document.body.style.overflow = 'hidden';

    // Xử lý đóng modal bằng phím Esc
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft' && hasPrev) {
        onPrev();
      } else if (event.key === 'ArrowRight' && hasNext) {
        onNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      // Khôi phục cuộn trang khi modal đóng
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onPrev, onNext, hasPrev, hasNext]); // Dependencies cho useEffect

  return (
    <div className="pdp-image-modal-overlay" onClick={onClose}>
      <div className="pdp-image-modal-content" onClick={(e) => e.stopPropagation()}>
        
        {hasPrev && (
          <button className="pdp-image-modal-nav pdp-image-modal-nav--prev" onClick={onPrev}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        )}
        <img src={imageUrl} alt="Product large view" className="pdp-image-modal-img" />
        {hasNext && (
          <button className="pdp-image-modal-nav pdp-image-modal-nav--next" onClick={onNext}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageModal;