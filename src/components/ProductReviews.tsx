// src/components/ProductReviews.tsx

import React, { useState, useEffect } from 'react';
import reviewApi from '../api/reviewApi'; 
import { Review } from '../types/review';
import './ProductReviews.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

interface ProductReviewsProps {
  product_id: number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ product_id }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const [reviewsRes, countRes] = await Promise.all([
                reviewApi.getReviewsByProduct(product_id),
                reviewApi.countReviewsByProduct(product_id)
        ]);
        setReviews(reviewsRes.data);
        setReviewCount(countRes.data.review_count);
      } catch (err: any) {
        console.error('Lỗi khi tải đánh giá sản phẩm:', err);
        setError('Không thể tải đánh giá sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (product_id) { // Đảm bảo product_id có giá trị
      fetchReviews();
    }
  }, [product_id]); // Re-fetch khi product_id thay đổi

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={i <= rating ? 'pr-star-filled' : 'pr-star-empty'}
        />
      );
    }
    return <div className="pr-rating-stars">{stars}</div>;
  };

  if (loading) {
    return <div className="pr-message pr-message--loading">Đang tải đánh giá...</div>;
  }

  if (error) {
    return <div className="pr-message pr-message--error">{error}</div>;
  }

  return (
    <div className="pr-container">
      <h3 className="pr-heading">Đánh giá sản phẩm </h3>
      <span>Số lượt đánh giá: ({reviewCount})</span>
      {reviews.length === 0 ? (
        <div className="pr-message pr-message--empty">Chưa có đánh giá nào cho sản phẩm này.</div>
      ) : (
        <ul className="pr-review-list">
          {reviews.map((review) => (
            <li key={review.review_id} className="pr-review-item">
              <div className="pr-review-header">
                {/* Đảm bảo review.user tồn tại trước khi truy cập full_name */}
                <span className="pr-reviewer-name">{review.user?.full_name || 'Người dùng ẩn danh'}</span>
                {renderStars(review.rating)}
              </div>
              <p className="pr-review-comment">{review.comment || 'Không có bình luận.'}</p>
              <span className="pr-review-date">
                {new Date(review.review_date).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductReviews;