// src/components/ForgotPasswordModal.tsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import authApi from '../api/authApi';
import './ForgotPasswordModal.css';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

type ForgotPasswordStep = 'enter_email' | 'email_sent'; // Chỉ còn 2 bước này

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<ForgotPasswordStep>('enter_email');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await authApi.forgotPassword({ email });
      setSuccessMessage('Một liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến (bao gồm cả thư mục spam).');
      setStep('email_sent');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'enter_email':
        return (
          <form onSubmit={handleSendResetEmail} className="fpg-form">
            <h3 className="fpg-title">Quên mật khẩu?</h3>
            <p className="fpg-description">Vui lòng nhập địa chỉ email bạn đã đăng ký. Chúng tôi sẽ gửi một liên kết để đặt lại mật khẩu của bạn.</p>
            <div className="fpg-form-group">
              <label htmlFor="email" className="fpg-label">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                required
                className="fpg-input"
              />
            </div>
            {errorMessage && <p className="fpg-error-message">{errorMessage}</p>}
            {successMessage && <p className="fpg-success-message">{successMessage}</p>}
            <button type="submit" disabled={isSubmitting} className="fpg-button">
              {isSubmitting ? 'Đang gửi...' : 'Xác thực Email'}
            </button>
          </form>
        );
      case 'email_sent':
        return (
          <div className="fpg-message-container">
            <h3 className="fpg-title">Thành công!</h3>
            {successMessage ? (
                <p className="fpg-description">{successMessage}</p>
            ) : (
                <p className="fpg-description">Một liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến (bao gồm cả thư mục spam).</p>
            )}
            <button onClick={onClose} className="fpg-button">Đóng</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fpg-modal-overlay" onClick={onClose}>
      <div className="fpg-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="fpg-modal-close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        {renderContent()}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;