// src/components/common/ConfirmationModal.tsx
import React from 'react';
import './ConfirmationModal.css'; 

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  message,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
}) => {
  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal-content">
        <p className="confirmation-modal-message">{message}</p>
        <div className="confirmation-modal-actions">
          <button className="admin-button default" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="admin-button danger" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;