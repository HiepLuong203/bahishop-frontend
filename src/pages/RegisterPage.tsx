import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authApi from "../api/authApi";
import "./RegisterPage.css"; // Đã đổi sang file CSS mới và riêng cho trang này

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await authApi.register({
        username,
        email,
        password_hash: password,
      });

      if (response.status === 201) {
        setSignUpSuccess(true);
        // Chuyển hướng sau khi đăng ký thành công (ví dụ: trang đăng nhập)
        setTimeout(() => {
          navigate("/dangnhap");
        }, 1000);
      } else {
        setErrorMessage("Đăng ký không thành công. Vui lòng thử lại.");
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Có lỗi xảy ra khi đăng ký.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reg-container"> {/* Class tổng */}
      <div className="reg-card"> {/* Thêm một div bọc để tạo hiệu ứng thẻ */}
        <h2 className="reg-title">Đăng ký</h2>
        {signUpSuccess ? (
          <div className="reg-success-message">Đăng ký thành công! Chuyển hướng đến trang đăng nhập...</div>
        ) : (
          <form onSubmit={handleSignUp} className="reg-form">
            <div className="reg-form-group">
              <label htmlFor="username">Tên đăng nhập:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                className="reg-input"
              />
            </div>
            <div className="reg-form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email"
                className="reg-input"
              />
            </div>
            <div className="reg-form-group">
              <label htmlFor="password">Mật khẩu:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="reg-input"
              />
            </div>

            {errorMessage && <p className="reg-error-message">{errorMessage}</p>}

            <button type="submit" disabled={isSubmitting} className="reg-button">
              {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
            </button>

            <p className="reg-login-link">
              Đã có tài khoản? <Link to="/dangnhap" className="reg-link">Đăng nhập</Link>
            </p>
          </form>
        )}
      </div> {/* Kết thúc reg-card */}
    </div>
  );
};

export default RegisterPage;