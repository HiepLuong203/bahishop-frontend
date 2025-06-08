// src/pages/ChangePasswordPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi'; // Đảm bảo đường dẫn này đúng
import './ChangePasswordPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const ChangePasswordPage: React.FC = () => {
  const [oldPassword, setOldPassword] = useState(''); // Đổi tên state để khớp với backend
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOldPassword, setShowOldPassword] = useState(false); // Cập nhật state hiển thị mật khẩu
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Vẫn nên kiểm tra độ dài mật khẩu ở frontend để có phản hồi nhanh
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    try {
      await authApi.changePassword({
        oldPassword: oldPassword, // Gửi oldPassword
        newPassword: newPassword,
        confirmPassword: confirmNewPassword,
      });
      setMessage('Mật khẩu của bạn đã được thay đổi thành công!');
      setError(null);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err: any) {
      console.error('Lỗi đổi mật khẩu:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Đã xảy ra lỗi khi đổi mật khẩu. Vui lòng thử lại.');
      }
      setMessage(null);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-content">
        <h2 className="change-password-content__title">Đổi Mật Khẩu</h2>

        {message && <div className="change-password-message change-password-message--success">{message}</div>}
        {error && <div className="change-password-message change-password-message--error">{error}</div>}

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="change-password-form__group">
            <label htmlFor="oldPassword">Mật khẩu hiện tại:</label> {/* Cập nhật label */}
            <div className="change-password-form__input-wrapper">
              <input
                type={showOldPassword ? 'text' : 'password'} // Cập nhật state hiển thị
                id="oldPassword" // Cập nhật ID
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="change-password-form__input"
                required
              />
              <span
                className="change-password-form__toggle-password"
                onClick={() => setShowOldPassword(!showOldPassword)} // Cập nhật state hiển thị
              >
                <FontAwesomeIcon icon={showOldPassword ? faEyeSlash : faEye} />
              </span>
            </div>
          </div>

          <div className="change-password-form__group">
            <label htmlFor="newPassword">Mật khẩu mới:</label>
            <div className="change-password-form__input-wrapper">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="change-password-form__input"
                required
              />
              <span
                className="change-password-form__toggle-password"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
              </span>
            </div>
          </div>

          <div className="change-password-form__group">
            <label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới:</label>
            <div className="change-password-form__input-wrapper">
              <input
                type={showConfirmNewPassword ? 'text' : 'password'}
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="change-password-form__input"
                required
              />
              <span
                className="change-password-form__toggle-password"
                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              >
                <FontAwesomeIcon icon={showConfirmNewPassword ? faEyeSlash : faEye} />
              </span>
            </div>
          </div>

          <div className="change-password-actions">
            <button type="submit" className="change-password-button change-password-button--submit">
              Đổi Mật Khẩu
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="change-password-button change-password-button--cancel"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;