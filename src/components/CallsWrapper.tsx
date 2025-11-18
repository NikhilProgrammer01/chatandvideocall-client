import React, { useEffect, useState } from 'react';
import {
  StreamCall,
  useStreamVideoClient,
  SpeakerLayout,
  CallControls,
  CallParticipantsList,
  StreamTheme,
  useCallStateHooks
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';

interface CallsWrapperProps {
  children: React.ReactNode;
  
}
interface ActiveCallUIProps {
  onLeave: () => void;
  // ✅ Add call prop here
  call: any; // The StreamCall object
}

// Custom Incoming Call Modal
const IncomingCallModal: React.FC<{ 
  onAccept: () => void; 
  onReject: () => void; 
  callerName: string;
  isProcessing: boolean;
}> = ({ onAccept, onReject, callerName, isProcessing }) => {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.iconContainer}>
          <div style={styles.pulseRing} />
          <div style={styles.icon}>📞</div>
        </div>
        
        <h2 style={styles.title}>Incoming Call</h2>
        <p style={styles.caller}>
          <strong>{callerName}</strong> is calling...
        </p>

        <div style={styles.buttonGroup}>
          <button 
            onClick={onReject} 
            style={{ ...styles.button, ...styles.rejectButton }}
            disabled={isProcessing}
          >
            {isProcessing ? 'Declining...' : '✕ Decline'}
          </button>
          <button 
            onClick={onAccept} 
            style={{ ...styles.button, ...styles.acceptButton }}
            disabled={isProcessing}
          >
            {isProcessing ? 'Joining...' : '✓ Accept'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ActiveCallUI: React.FC<ActiveCallUIProps> = ({ onLeave, call }) => {
  const { useCallStartedAt } = useCallStateHooks();
  const callStartedAt = useCallStartedAt();
  const [duration, setDuration] = useState<string>('00:00:00');

  useEffect(() => {
    if (!callStartedAt) {
      setDuration('00:00:00');
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const started = new Date(callStartedAt);
      const diff = now.getTime() - started.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formatTime = (time: number) => String(time).padStart(2, '0');

      setDuration(
        `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [callStartedAt]);

  return (
    <StreamTheme>
      <div style={styles.callContainer}>
        <div style={styles.callHeader}>
          <div style={styles.headerLeft}>
            <span style={styles.liveIndicator}>● LIVE</span>
            <h3 style={styles.callTitle}>Active Call</h3>
            {/* ✅ Display call duration */}
            {callStartedAt && <span style={styles.callDuration}>{duration}</span>}
          </div>
          <button onClick={onLeave} style={styles.closeButton} title="Leave Call">
            ✕
          </button>
        </div>

        <div style={styles.videoContainer}>
          <SpeakerLayout participantsBarPosition="bottom" />
        </div>

        <div style={styles.controlsContainer}>
          <CallControls />
        </div>

        <div style={styles.participantsContainer}>
          <CallParticipantsList onClose={() => {}} />
        </div>
      </div>
    </StreamTheme>
  );
};

// Main Wrapper Component
const CallsWrapper: React.FC<CallsWrapperProps> = ({ children }) => {
  const videoClient = useStreamVideoClient();
  const [callState, setCallState] = useState<{
    call: any;
    status: 'idle' | 'ringing' | 'active';
    callerName: string;
  }>({ call: null, status: 'idle', callerName: '' });
  const [isProcessing, setIsProcessing] = useState(false);

useEffect(() => {
  if (!videoClient) return;

  const handleIncomingCall = (event: any) => {
    try {
      const callType = event.call?.type ?? 'default';
      const callId = event.call?.id;
      const callerName = event.user?.name || event.user?.id || 'Unknown User';
      
      if (!callId) return;

      const call = videoClient.call(callType, callId);
      
      setCallState({
        call,
        status: 'ringing',
        callerName,
      });
    } catch (err) {
      console.error('Error processing incoming call:', err);
    }
  };

  const handleCallAccepted = (event: any) => {
    const callId = event.call?.id;
    if (callState.call && callState.call.id === callId) {
      setCallState(prev => ({
        ...prev,
        status: 'active',
      }));
    }
      console.log(`[Stream Events] Call ${callId} accepted. New status: active`); // ✅ Add this
  };

  const handleCallEnded = (event: any) => {
     console.log('--- Stream Call ended event received ---', event); // ✅ More prominent log
  console.log('Call ID:', event.call?.id);
  console.log('Call Type:', event.call?.type);
  console.log('Ended Reason:', event.call?.ended_reason); // Check this field if available
  console.log('User who ended it:', event.user?.id || 'N/A');
  setCallState({ call: null, status: 'idle', callerName: '' });
  };

  const handleCallRejected = (event: any) => {
    console.log('--- Stream Call rejected event received ---', event); // ✅ More prominent log
  console.log('Call ID:', event.call?.id);
  console.log('Call Type:', event.call?.type);
  console.log('Rejected by User:', event.user?.id || 'N/A');
  setCallState({ call: null, status: 'idle', callerName: '' });
  };

  const handleCallLive = (event: any) => {
    const callId = event.call?.id;
    
    if (!callState.call || callState.status === 'idle') {
      const callType = event.call?.type ?? 'default';
      const call = videoClient.call(callType, callId);
      setCallState({
        call,
        status: 'active',
        callerName: 'Team Call',
      });
    } else if (callState.call.id === callId && callState.status === 'ringing') {
      setCallState(prev => ({
        ...prev,
        status: 'active',
      }));
    }
  };

  // ✅ NEW: Handle custom event from call creator
  const handleCustomCallStarted = (event: any) => {
    const { call, callId, callerName } = event.detail;
    setCallState({
      call,
      status: 'active',
      callerName: callerName || 'Team Call',
    });
  };

  videoClient.on('call.ring', handleIncomingCall);
  videoClient.on('call.accepted', handleCallAccepted);
  videoClient.on('call.session_started', handleCallLive);
  videoClient.on('call.ended', handleCallEnded);
  videoClient.on('call.rejected', handleCallRejected);
  
  // ✅ Listen for custom event
  window.addEventListener('call-started', handleCustomCallStarted);

  return () => {
    videoClient.off('call.ring', handleIncomingCall);
    videoClient.off('call.accepted', handleCallAccepted);
    videoClient.off('call.session_started', handleCallLive);
    videoClient.off('call.ended', handleCallEnded);
    videoClient.off('call.rejected', handleCallRejected);
    
    // ✅ Clean up custom event listener
    window.removeEventListener('call-started', handleCustomCallStarted);
  };
}, [videoClient, callState.call, callState.status]);

  const handleAccept = async () => {
    if (!callState.call || isProcessing) return;
    
    setIsProcessing(true);
    try {
      await callState.call.join();
      setCallState(prev => ({ ...prev, status: 'active' }));
    } catch (error) {
      console.error('Error accepting call:', error);
      setCallState({ call: null, status: 'idle', callerName: '' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!callState.call || isProcessing) return;
    
    setIsProcessing(true);
    try {
      await callState.call.leave({ reject: true });
      setCallState({ call: null, status: 'idle', callerName: '' });
    } catch (error) {
      console.error('Error rejecting call:', error);
      setCallState({ call: null, status: 'idle', callerName: '' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLeave = async () => {
    if (!callState.call) return;
    
    try {
      await callState.call.leave();
      setCallState({ call: null, status: 'idle', callerName: '' });
    } catch (error) {
      console.error('Error leaving call:', error);
    }
  };

  return (
    <>
      {children}

      {callState.status === 'ringing' && callState.call && (
        <IncomingCallModal
          onAccept={handleAccept}
          onReject={handleReject}
          callerName={callState.callerName}
          isProcessing={isProcessing}
        />
      )}

      {callState.status === 'active' && callState.call && (
        <StreamCall call={callState.call}>
            <ActiveCallUI onLeave={handleLeave} call={callState.call} />
        </StreamCall>
      )}
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  modalOverlay: {
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
  },
    callDuration: {
    color: '#a0a0a0',
    fontSize: '14px',
    marginLeft: '10px',
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
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '12px',
    marginTop: 0,
  },
  caller: {
    fontSize: '18px',
    color: '#34495e',
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
  },
  acceptButton: {
    backgroundColor: '#2ecc71',
    color: 'white',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
  },
  callContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a1a',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
  },
  callHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#2c2c2c',
    borderBottom: '1px solid #3a3a3a',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  liveIndicator: {
    color: '#e74c3c',
    fontSize: '14px',
    fontWeight: '700',
  },
  callTitle: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
  },
  closeButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  controlsContainer: {
    padding: '16px',
    backgroundColor: '#2c2c2c',
    display: 'flex',
    justifyContent: 'center',
  },
  participantsContainer: {
    maxHeight: '200px',
    overflowY: 'auto',
    backgroundColor: '#2c2c2c',
    borderTop: '1px solid #3a3a3a',
  },
};

export default CallsWrapper;