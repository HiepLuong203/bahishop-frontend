export interface UserInfo {
  user_id: number;
  username: string;
  email: string;
  full_name?: string | null;
  phone_number?: string | null;
  address?: string | null;
  role?: string;
  is_active?: boolean;
  // Bạn có thể thêm các trường khác nếu cần
}

export interface AuthResult {
  token: string;
  user: UserInfo;
}

export interface SignInModalProps {
  show: boolean;
  onClose: () => void;
  onSignInSuccess: (authResult: AuthResult) => void;
}

export interface SignUpModalProps {
  show: boolean;
  onClose: () => void;
  onSignUpSuccess: () => void;
}

export interface UpdateUserAttributes {
  full_name?: string|null;
  phone_number?: string|null;
  address?: string|null;
  send_verify_email?: boolean;
}

export interface RegisUserAttributes {
  username?: string;
  email?: string;
  password_hash?: string;
}
export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string; 
}