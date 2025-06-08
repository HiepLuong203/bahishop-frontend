// src/components/CreateReviewForm.tsx

import React, { useState } from 'react';
import reviewApi from '../api/reviewApi';
import { CreateReviewPayload,Review } from '../types/review';
import './CreateReviewForm.css'; // File CSS cho form này
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faTimes } from '@fortawesome/free-solid-svg-icons';

interface CreateReviewFormProps {
  product_id: number;
  order_id: number;
  onReviewCreated: (newReview: Review) => void; // Callback khi đánh giá thành công
  onClose: () => void; // Callback để đóng form
}

const CreateReviewForm: React.FC<CreateReviewFormProps> = ({
  product_id,
  order_id,
  onReviewCreated,
  onClose,
}) => {
  const [rating, setRating] = useState(0); // 0-5 stars
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá.');
      return;
    }

    setLoading(true);
    try {
      const payload: CreateReviewPayload = {
        product_id,
        order_id,
        rating,
        comment: comment.trim() === '' ? undefined : comment, // Gửi undefined nếu comment trống
      };
      const response = await reviewApi.createReview(payload);
      setSuccess('Đánh giá của bạn đã được gửi thành công!');
      onReviewCreated(response.data); // Gọi callback để thông báo review mới
      // Sau một thời gian ngắn, tự động đóng form
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Lỗi khi gửi đánh giá:', err);
      setError(
        err.response?.data?.error || 'Không thể gửi đánh giá. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crf-modal-overlay">
      <div className="crf-modal-content">
        <button className="crf-close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h3 className="crf-title">Đánh giá sản phẩm</h3>

        {success && <div className="crf-message crf-message--success">{success}</div>}
        {error && <div className="crf-message crf-message--error">{error}</div>}

        <form onSubmit={handleSubmit} className="crf-form">
          <div className="crf-form-group">
            <label className="crf-label">Số sao đánh giá:</label>
            <div className="crf-stars">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <FontAwesomeIcon
                  key={starValue}
                  icon={faStar}
                  className={`crf-star ${starValue <= rating ? 'crf-star--filled' : 'crf-star--empty'}`}
                  onClick={() => setRating(starValue)}
                />
              ))}
            </div>
          </div>

          <div className="crf-form-group">
            <label htmlFor="comment" className="crf-label">Bình luận:</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="crf-textarea"
              rows={4}
              placeholder="Viết bình luận của bạn về sản phẩm..."
            ></textarea>
          </div>

          <button type="submit" className="crf-submit-button" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi Đánh Giá'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateReviewForm;