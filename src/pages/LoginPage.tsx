import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authApi from "../api/authApi";
import "./LoginPage.css"; 
import ForgotPasswordModal from "../components/ForgotPasswordModal"; 
const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false); // New state for modal
  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await authApi.login({ username, password });

      if (response.data.token && response.data.user) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("currentUser", JSON.stringify(response.data.user));
        // Chuyển hướng dựa trên role
        if (response.data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          // Reload trang và chuyển đến trang chủ
          window.location.href = "/trangchu";
        }
      } else {
        setErrorMessage(
          "Đăng nhập không thành công. Vui lòng kiểm tra tên đăng nhập và mật khẩu."
        );
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Có lỗi xảy ra khi đăng nhập.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="log-container"> 
      <div className="log-card"> 
        <h2 className="log-title">Đăng nhập</h2>
        <form onSubmit={handleSignIn} className="log-form">
          <div className="log-form-group">
            <label htmlFor="username">Tên đăng nhập:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              className="log-input"
            />
          </div>
          <div className="log-form-group">
            <label htmlFor="password">Mật khẩu:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="log-input"
            />
          </div>

          {errorMessage && <p className="log-error-message">{errorMessage}</p>}

          <button type="submit" disabled={isSubmitting} className="log-button">
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <p className="log-register-link">
            Chưa có tài khoản? <Link to="/dangky" className="log-link">Đăng ký</Link>
          </p>
          <p className="log-forgot-password">
            <Link to="#" onClick={() => setShowForgotPasswordModal(true)} className="log-link">
              Quên mật khẩu?
            </Link>
          </p>
        </form>
      </div>
      {showForgotPasswordModal && (
        <ForgotPasswordModal onClose={() => setShowForgotPasswordModal(false)} />
      )}
    </div>
  );
};

export default LoginPage;