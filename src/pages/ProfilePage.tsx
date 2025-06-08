import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';
import { UserInfo, UpdateUserAttributes } from '../types/user';
import './ProfilePage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface EditableField {
  field: keyof Omit<UserInfo, 'user_id' | 'username' | 'email' | 'is_active' | 'role'>;
  label: string;
}

const editableFields: EditableField[] = [
  { field: 'full_name', label: 'Họ và tên' },
  { field: 'phone_number', label: 'Số điện thoại' },
  { field: 'address', label: 'Địa chỉ' },
];

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Omit<UserInfo, 'user_id' | 'username' | 'email' | 'is_active' | 'role'>>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/dangnhap');
          return;
        }
        const response = await authApi.getProfile();
        setUser(response.data);
        const initialEditedData: Partial<Omit<UserInfo, 'user_id' | 'username' | 'email' | 'is_active' | 'role'>> = {};
        editableFields.forEach(fieldInfo => {
          initialEditedData[fieldInfo.field] = response.data[fieldInfo.field];
        });
        setEditedData(initialEditedData);
      } catch (error: any) {
        setError('Không thể tải thông tin người dùng.');
        console.error('Lỗi tải profile:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          navigate('/dangnhap');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleResendVerificationEmail = async () => {
    try {
      const verificationData: UpdateUserAttributes = { send_verify_email: true };
      await authApi.updateProfile(verificationData);
      setShowVerificationAlert(true);
    } catch (error: any) {
      console.error('Lỗi gửi lại email xác thực:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Có lỗi khi gửi lại email xác thực.');
      }
    }
  };

  const handleCloseVerificationAlert = () => {
    setShowVerificationAlert(false);
  };

  const handleEditInfoClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    const resetEditedData: Partial<Omit<UserInfo, 'user_id' | 'username' | 'email' | 'is_active' | 'role'>> = {};
    if (user) {
      editableFields.forEach(fieldInfo => {
        resetEditedData[fieldInfo.field] = user[fieldInfo.field];
      });
      setEditedData(resetEditedData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveInfo = async () => {
    try {
      const updatePayload: UpdateUserAttributes = editedData;
      const response = await authApi.updateProfile(updatePayload);
      setUser(response.data.user);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
      window.location.reload()
      setIsEditing(false);
    } catch (error: any) {
      console.error('Lỗi cập nhật profile:', error);
      alert('Không thể cập nhật thông tin.');
    }
  };
  const handleChangePasswordClick = () => {
    navigate('/changepassword');
  };
  if (loading) {
    return (
      <div className="cp-container">
        <div className="profile-loading-message">Đang tải thông tin cá nhân...</div> 
      </div>
    );
  }

  if (error) {
    return (
      <div className="cp-container">
        <div className="profile-error-message">Lỗi: {error}</div> 
      </div>
    );
  }

  if (!user) {
    return (
      <div className="cp-container">
        <div className="profile-no-user-message">Không tìm thấy thông tin người dùng.</div>
      </div>
    );
  }

  return (
    <div className="cp-container">
      <div className="profile-page-content"> 
        <h2 className="profile-title">Thông tin cá nhân</h2> 
        {showVerificationAlert && (
          <div className="profile-verification-alert" role="alert">
            <span className="profile-verification-alert-text"> Bạn hãy vào email và xác thực tài khoản.</span> 
            <button className="profile-verification-alert-close-button" onClick={handleCloseVerificationAlert}> 
              <FontAwesomeIcon icon={faTimes} className="profile-verification-alert-close-icon" /> 
            </button>
          </div>
        )}

        {!isEditing ? (
          <>
            <table className="profile-table">
              <tbody>
                <tr>
                  <th>Username</th>
                  <td>{user.username}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{user.email}</td>
                </tr>
                {editableFields.map((fieldInfo) => (
                  <tr key={fieldInfo.field}>
                    <th>{fieldInfo.label}</th>
                    <td>{user[fieldInfo.field] ? user[fieldInfo.field] : 'Chưa có thông tin'}</td>
                  </tr>
                ))}
                <tr>
                  <th>Trạng thái</th>
                  <td>{user.is_active ? 'Đã kích hoạt' : 'Chưa kích hoạt'}</td>
                </tr>
                <tr>
                  <th>Vai trò</th>
                  <td>{user.role}</td>
                </tr>
              </tbody>
            </table>
            <button onClick={handleEditInfoClick} className="profile-button profile-edit-button"> 
              Chỉnh sửa thông tin cá nhân
            </button>
            <button onClick={handleChangePasswordClick} className="profile-button profile-change-password-button">
              Đổi mật khẩu
            </button>
          </>
        ) : (
          <div>
            <h3 className="profile-edit-heading">Chỉnh sửa thông tin</h3> 
            <table className="profile-table"> 
              <tbody>
                {editableFields.map((fieldInfo) => (
                  <tr key={fieldInfo.field}>
                    <th>{fieldInfo.label}</th>
                    <td>
                      <input
                        type="text"
                        name={fieldInfo.field}
                        value={editedData[fieldInfo.field] || ''}
                        onChange={handleInputChange}
                        className="profile-input" 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="profile-buttons-wrapper"> 
              <button onClick={handleSaveInfo} className="profile-button profile-save-button"> 
                Lưu thay đổi
              </button>
                <button onClick={handleCancelEdit} className="profile-button profile-cancel-button"> 
                  Hủy
              </button>
            </div>
          </div>
        )}

        {!user.is_active && !isEditing && (
          <div className="profile-buttons-wrapper"> 
            <button
              onClick={handleResendVerificationEmail}
              className="profile-button profile-activate-button" 
            >
              Kích hoạt tài khoản
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;