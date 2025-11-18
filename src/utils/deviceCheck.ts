export const checkMediaDevices = async (): Promise<{
  hasCamera: boolean;
  hasMicrophone: boolean;
  error?: string;
}> => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    const hasCamera = devices.some(device => device.kind === 'videoinput');
    const hasMicrophone = devices.some(device => device.kind === 'audioinput');
    
    console.log('📹 Camera available:', hasCamera);
    console.log('🎤 Microphone available:', hasMicrophone);
    
    return { hasCamera, hasMicrophone };
  } catch (error) {
    console.error('Device check failed:', error);
    return { 
      hasCamera: false, 
      hasMicrophone: false, 
      error: 'Failed to check devices' 
    };
  }
};