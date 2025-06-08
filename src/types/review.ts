export interface CreateReviewPayload {
  product_id: number;
  order_id: number; // Đảm bảo đơn hàng đã giao và thuộc về người dùng
  rating: number; // Điểm đánh giá từ 1 đến 5
  comment?: string; // Nội dung bình luận, có thể tùy chọn
}

export interface UpdateReviewPayload {
  rating?: number; // Điểm đánh giá mới (tùy chọn)
  comment?: string; // Nội dung bình luận mới (tùy chọn)
}

export interface Review {
  review_id: number;
  user_id: number;
  product_id: number;
  order_id: number;
  rating: number;
  comment?: string;
  review_date: string; // Ngày đánh giá (thường là định dạng ISO string từ backend)
  // Thông tin người dùng được include khi lấy đánh giá theo sản phẩm
  user?: {
    user_id: number;
    full_name: string;
  };
}