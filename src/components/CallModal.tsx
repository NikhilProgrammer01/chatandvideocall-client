import React, { useState } from 'react';
import {
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';

interface CallModalProps {
  onClose: () => void;
}

const CallModal: React.FC<CallModalProps> = ({ onClose }) => {
  const call = useCall();
  const { useCallCreatedBy } = useCallStateHooks();
  const createdBy = useCallCreatedBy();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleAccept = async (): Promise<void> => {
    if (call && !isProcessing) {
      setIsProcessing(true);
      try {
        await call.join();
        onClose();
      } catch (error) {
        console.error('Error joining call:', error);
        setIsProcessing(false);
      }
    }
  };

  const handleReject = async (): Promise<void> => {
    if (call && !isProcessing) {
      setIsProcessing(true);
      try {
        await call.leave({ reject: true });
        onClose();
      } catch (error) {
        console.error('Error rejecting call:', error);
        setIsProcessing(false);
      }
    }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.stopPropagation()}>
      <div style={styles.modal}>
        <div style={styles.iconContainer}>
          <div style={styles.pulseRing} />
          <div style={styles.icon}>📞</div>
        </div>
        
        <h2 style={styles.title}>Incoming Call</h2>
        
        <p style={styles.caller}>
          <strong>{createdBy?.name || 'Unknown User'}</strong>
        </p>
        
        <p style={styles.subtitle}>is calling you...</p>

        <div style={styles.buttonGroup}>
          <button
            onClick={handleReject}
            disabled={isProcessing}
            style={{
              ...styles.button,
              ...styles.rejectButton,
              ...(isProcessing ? styles.buttonDisabled : {}),
            }}
          >
            {isProcessing ? 'Declining...' : '✕ Decline'}
          </button>
          
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            style={{
              ...styles.button,
              ...styles.acceptButton,
              ...(isProcessing ? styles.buttonDisabled : {}),
            }}
          >
            {isProcessing ? 'Joining...' : '✓ Accept'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    backdropFilter: 'blur(8px)',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '48px 40px',
    maxWidth: '420px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
    animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  iconContainer: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '28px',
  },
  pulseRing: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    backgroundColor: 'rgba(46, 204, 113, 0.25)',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  icon: {
    position: 'relative',
    fontSize: '52px',
    width: '90px',
    height: '90px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ecc71',
    borderRadius: '50%',
    margin: '0 auto',
    boxShadow: '0 8px 24px rgba(46, 204, 113, 0.3)',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '12px',
    marginTop: 0,
  },
  caller: {
    fontSize: '22px',
    color: '#34495e',
    marginBottom: '8px',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: '15px',
    color: '#7f8c8d',
    marginBottom: '36px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    padding: '16px 28px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    outline: 'none',
  },
  acceptButton: {
    backgroundColor: '#2ecc71',
    color: 'white',
    boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
  },
};

export default CallModal;