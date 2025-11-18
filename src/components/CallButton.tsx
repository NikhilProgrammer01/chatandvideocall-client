import React, { useState } from 'react';

interface CallButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

const CallButton: React.FC<CallButtonProps> = ({ 
  onClick, 
  disabled = false,
  label = '📞 Start Call',
  variant = 'primary'
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isHovered && !disabled ? '#27ae60' : '#2ecc71',
        };
      case 'secondary':
        return {
          backgroundColor: isHovered && !disabled ? '#2980b9' : '#3498db',
        };
      case 'danger':
        return {
          backgroundColor: isHovered && !disabled ? '#c0392b' : '#e74c3c',
        };
      default:
        return {
          backgroundColor: '#2ecc71',
        };
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.button,
        ...getVariantStyles(),
        ...(disabled ? styles.buttonDisabled : {}),
        ...(isHovered && !disabled ? styles.buttonHover : {}),
      }}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label}
    </button>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  button: {
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    minWidth: '150px',
    outline: 'none',
    userSelect: 'none',
  },
  buttonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed',
    opacity: 0.6,
    transform: 'none',
    boxShadow: 'none',
  },
};

export default CallButton;