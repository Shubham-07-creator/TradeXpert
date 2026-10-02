import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./ConfirmModal.css";

const ConfirmModal = ({
  isOpen,
  title = "Are you sure?",
  message = "Please confirm this action.",
  icon = "⚠️",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div
        className="confirm-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className={`confirm-icon-box ${isDanger ? "danger" : "primary"}`}>
          {icon}
        </div>
        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-desc">{message}</p>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className={`btn-confirm-action ${isDanger ? "danger" : "primary"}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="btn-confirm-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ConfirmModal;
