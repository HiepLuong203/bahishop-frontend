// src/pages/ResetPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import authApi from '../api/authApi';
import './ResetPasswordPage.css'; 

const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState(''); 
  const [token, setToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const urlToken = params.get('token');
  const urlEmail = params.get('email');

  if (urlToken && urlEmail) {
    setToken(urlToken);
    setEmail(urlEmail);
    params.delete('token');
    params.delete('email');
    const newUrl = `/reset-password${params.toString() ? `?${params.toString()}` : ''}`; // Hardcode pathname
    window.history.replaceState({}, document.title, newUrl);
  } else {
    setErrorMessage('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã thiếu thông tin.');
  }
}, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!token || !email) {
      setErrorMessage('Không thể đặt lại mật khẩu. Vui lòng thử lại quy trình quên mật khẩu.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }
    if (newPassword.length < 6) {
        setErrorMessage('Mật khẩu mới phải có ít nhất 6 ký tự.');
        return;
    }

    setIsSubmitting(true);

    try {
      await authApi.resetPassword({ token, email, newPassword });
      setSuccessMessage('Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập ngay bây giờ.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/dangnhap'); 
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Không thể đặt lại mật khẩu. Liên kết có thể không hợp lệ hoặc đã hết hạn.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2 className="reset-password-title">Đặt lại mật khẩu</h2>
        {token && email ? (
          <form onSubmit={handleSubmit} className="reset-password-form">
            <p className="reset-password-info">Đặt lại mật khẩu cho tài khoản: <strong>{email}</strong></p>
            <div className="reset-password-form-group">
              <label htmlFor="new-password">Mật khẩu mới:</label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                required
                className="reset-password-input"
              />
            </div>
            <div className="reset-password-form-group">
              <label htmlFor="confirm-password">Xác nhận mật khẩu mới:</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
                className="reset-password-input"
              />
            </div>

            {errorMessage && <p className="reset-password-error">{errorMessage}</p>}
            {successMessage && <p className="reset-password-success">{successMessage}</p>}

            <button type="submit" disabled={isSubmitting} className="reset-password-button">
              {isSubmitting ? 'Đang đặt lại...' : 'Tạo lại mật khẩu'}
            </button>
          </form>
        ) : (
          <div className="reset-password-invalid">
            <p className="reset-password-error">
              {errorMessage || 'Liên kết đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu lại.'}
            </p>
            <Link to="/dangnhap" className="reset-password-link-back">Quay về trang Đăng nhập</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;