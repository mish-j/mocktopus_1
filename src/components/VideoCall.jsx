import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const VideoCall = forwardRef(({ roomId, isMinimized, onToggleMinimize }, ref) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const agoraClientRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [remoteUsers, setRemoteUsers] = useState([]);

  // Agora configuration
  const APP_ID = process.env.REACT_APP_AGORA_APP_ID || '81415b55057649bcb7d6b0a29607c465';
  const TOKEN = null; // For testing without authentication

  // Initialize Agora
  useEffect(() => {
    const initializeAgora = async () => {
      try {
        console.log('Initializing Agora for room:', roomId);
        setConnectionStatus('connecting');
        
        // Create Agora client
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        agoraClientRef.current = client;

        // Set up event handlers
        client.on('user-published', async (user, mediaType) => {
          console.log('User published:', user.uid, mediaType);
          await client.subscribe(user, mediaType);
          
          if (mediaType === 'video') {
            const remoteVideoTrack = user.videoTrack;
            remoteStreamRef.current = remoteVideoTrack;
            if (remoteVideoRef.current) {
              remoteVideoTrack.play(remoteVideoRef.current);
            }
            // Update remote users list
            setRemoteUsers(prev => {
              const filtered = prev.filter(u => u.uid !== user.uid);
              return [...filtered, user];
            });
            // Automatically activate call when remote user joins
            setIsCallActive(true);
            setConnectionStatus('connected');
            console.log('Remote user video connected - call activated');
          }
          
          if (mediaType === 'audio') {
            user.audioTrack.play();
            console.log('Remote user audio connected');
          }
        });

        client.on('user-unpublished', (user, mediaType) => {
          console.log('User unpublished:', user.uid, mediaType);
          if (mediaType === 'video') {
            setRemoteUsers(prev => {
              const updatedUsers = prev.filter(u => u.uid !== user.uid);
              // If no more video users, deactivate call
              if (updatedUsers.length === 0) {
                setIsCallActive(false);
                setConnectionStatus('ready');
                console.log('No remote users - call deactivated');
              }
              return updatedUsers;
            });
          }
        });

        client.on('user-left', (user) => {
          console.log('User left:', user.uid);
          setRemoteUsers(prev => {
            const updatedUsers = prev.filter(u => u.uid !== user.uid);
            // If no more users, deactivate call
            if (updatedUsers.length === 0) {
              setIsCallActive(false);
              setConnectionStatus('ready');
              console.log('User left - call deactivated');
            }
            return updatedUsers;
          });
        });

        // Additional event listeners for better connection handling
        client.on('connection-state-change', (curState, revState) => {
          console.log('Connection state changed:', curState, 'from:', revState);
          if (curState === 'CONNECTED') {
            setConnectionStatus('ready');
          } else if (curState === 'CONNECTING') {
            setConnectionStatus('connecting');
          } else if (curState === 'DISCONNECTED') {
            setConnectionStatus('disconnected');
            setIsCallActive(false);
          }
        });

        client.on('user-joined', (user) => {
          console.log('User joined channel:', user.uid);
          // This fires when any user joins, even before they publish
        });

        // Join channel
        const uid = await client.join(APP_ID, roomId, TOKEN, null);
        console.log('Joined channel with UID:', uid);

        // Create local tracks
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks({
          audioConfig: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          videoConfig: {
            width: 320,
            height: 240,
            frameRate: 15,
            bitrateMin: 100,
            bitrateMax: 500
          }
        });

        localStreamRef.current = { audioTrack, videoTrack };

        // Play local video
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }

        // Publish local tracks
        await client.publish([audioTrack, videoTrack]);
        console.log('Published local tracks');

        setConnectionStatus('ready');

      } catch (error) {
        console.error('Error initializing Agora:', error);
        setConnectionStatus('error');
        
        setTimeout(() => {
          if (error.message?.includes('PERMISSION_DENIED')) {
            alert('Camera/microphone access denied. Please allow access and refresh the page.');
          } else if (error.message?.includes('NOT_FOUND')) {
            alert('No camera or microphone found. Please connect devices and refresh.');
          } else {
            console.log('Agora initialization failed:', error.message);
          }
        }, 1000);
      }
    };

    initializeAgora();

    return () => {
      // Cleanup on component unmount
      console.log('🎥 VideoCall component unmounting, cleaning up...');
      cleanup();
    };
  }, [roomId]);

  // Monitor remote users and update call status
  useEffect(() => {
    if (remoteUsers.length > 0) {
      setIsCallActive(true);
      setConnectionStatus('connected');
      console.log('Remote users detected, activating call:', remoteUsers.length);
    } else if (connectionStatus === 'connected') {
      setIsCallActive(false);
      setConnectionStatus('ready');
      console.log('No remote users, deactivating call');
    }
  }, [remoteUsers, connectionStatus]);

  // Cleanup function
  const cleanup = async () => {
    console.log('🎥 VideoCall cleanup called');
    try {
      if (localStreamRef.current) {
        if (localStreamRef.current.audioTrack) {
          localStreamRef.current.audioTrack.stop();
          localStreamRef.current.audioTrack.close();
        }
        if (localStreamRef.current.videoTrack) {
          localStreamRef.current.videoTrack.stop();
          localStreamRef.current.videoTrack.close();
        }
        localStreamRef.current = null;
      }
      
      if (agoraClientRef.current) {
        await agoraClientRef.current.leave();
        agoraClientRef.current = null;
      }
      
      setIsCallActive(false);
      setConnectionStatus('disconnected');
      setRemoteUsers([]);
      console.log('🎥 All video streams and connections stopped');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  // Expose cleanup functions to parent component
  useImperativeHandle(ref, () => ({
    cleanup: () => {
      cleanup();
    },
    endCall: () => {
      endCall();
    },
    stopAllStreams: () => {
      cleanup();
    }
  }), []);

  const toggleMute = () => {
    if (localStreamRef.current?.audioTrack) {
      const audioTrack = localStreamRef.current.audioTrack;
      if (isMuted) {
        audioTrack.setEnabled(true);
        setIsMuted(false);
      } else {
        audioTrack.setEnabled(false);
        setIsMuted(true);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current?.videoTrack) {
      const videoTrack = localStreamRef.current.videoTrack;
      if (isVideoOff) {
        videoTrack.setEnabled(true);
        setIsVideoOff(false);
      } else {
        videoTrack.setEnabled(false);
        setIsVideoOff(true);
      }
    }
  };

  const startCall = async () => {
    try {
      console.log('Starting call - already connected to Agora channel');
      setIsCallActive(true);
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const endCall = async () => {
    await cleanup();
  };

  const toggleScreenShare = async () => {
    if (!agoraClientRef.current || !localStreamRef.current) return;

    if (!isScreenSharing) {
      try {
        // Create screen video track
        const screenTrack = await AgoraRTC.createScreenVideoTrack();
        
        // Unpublish current video track
        await agoraClientRef.current.unpublish(localStreamRef.current.videoTrack);
        
        // Stop current video track
        localStreamRef.current.videoTrack.stop();
        localStreamRef.current.videoTrack.close();
        
        // Update local stream with screen track
        localStreamRef.current.videoTrack = screenTrack;
        
        // Publish screen track
        await agoraClientRef.current.publish(screenTrack);
        
        // Update local video display
        if (localVideoRef.current) {
          screenTrack.play(localVideoRef.current);
        }
        
        // Handle screen share ending
        screenTrack.on('track-ended', async () => {
          setIsScreenSharing(false);
          
          // Switch back to camera
          try {
            const cameraTrack = await AgoraRTC.createCameraVideoTrack();
            
            // Unpublish screen track
            await agoraClientRef.current.unpublish(screenTrack);
            screenTrack.stop();
            screenTrack.close();
            
            // Update local stream
            localStreamRef.current.videoTrack = cameraTrack;
            
            // Publish camera track
            await agoraClientRef.current.publish(cameraTrack);
            
            // Update local video display
            if (localVideoRef.current) {
              cameraTrack.play(localVideoRef.current);
            }
          } catch (error) {
            console.error('Error switching back to camera:', error);
          }
        });
        
        setIsScreenSharing(true);
      } catch (error) {
        console.error('Error starting screen share:', error);
      }
    } else {
      // Stop screen sharing and return to camera
      try {
        // Create camera track
        const cameraTrack = await AgoraRTC.createCameraVideoTrack();
        
        // Unpublish current screen track
        await agoraClientRef.current.unpublish(localStreamRef.current.videoTrack);
        
        // Stop screen track
        localStreamRef.current.videoTrack.stop();
        localStreamRef.current.videoTrack.close();
        
        // Update local stream
        localStreamRef.current.videoTrack = cameraTrack;
        
        // Publish camera track
        await agoraClientRef.current.publish(cameraTrack);
        
        // Update local video display
        if (localVideoRef.current) {
          cameraTrack.play(localVideoRef.current);
        }
        
        setIsScreenSharing(false);
      } catch (error) {
        console.error('Error stopping screen share:', error);
      }
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'ready': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggleMinimize}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors"
        >
          📹 Show Video
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl border border-gray-700">
      {/* Video Call Header */}
      <div className="drag-handle bg-gray-800 px-4 py-2 flex justify-between items-center cursor-move">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
          </div>
          <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500' : connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {connectionStatus === 'connected' ? 'Connected' : 
             connectionStatus === 'connecting' ? 'Connecting...' :
             connectionStatus === 'error' ? 'Connection Error' :
             connectionStatus === 'ready' ? 'Ready to Call' : 'Disconnected'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleMinimize}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="Minimize"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Video Streams */}
      <div className="relative">
        {/* Remote Video (Main) */}
        <div className="relative bg-black">
          <div
            ref={remoteVideoRef}
            className="w-full h-48 object-cover bg-black"
          />
          {!isCallActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm">
                  {connectionStatus === 'connected' ? 'Partner connected' : 'Waiting for partner to join...'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-2 right-2 w-20 h-16 bg-black rounded border-2 border-gray-600 overflow-hidden">
          <div
            ref={localVideoRef}
            className="w-full h-full object-cover"
          />
          {isScreenSharing && (
            <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-br">
              Screen
            </div>
          )}
          {isVideoOff && !isScreenSharing && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0017 14V6a2 2 0 00-2-2H5.414l-1.121-1.121zM4 6v8a2 2 0 002 2h8a2 2 0 002-2V6H4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-4 py-3 flex justify-center space-x-3">
        {!isCallActive ? (
          <button
            onClick={startCall}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            disabled={connectionStatus !== 'ready'}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <span className="text-sm">Call</span>
          </button>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className={`${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'} text-white p-2 rounded-lg transition-colors`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                {isMuted ? (
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.789L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.797-3.789a1 1 0 011.617.789zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.789L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.797-3.789a1 1 0 011.617.789zM12.293 7.293a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                )}
              </svg>
            </button>

            <button
              onClick={toggleVideo}
              className={`${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'} text-white p-2 rounded-lg transition-colors`}
              title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                {isVideoOff ? (
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0017 14V6a2 2 0 00-2-2H5.414l-1.121-1.121zM4 6v8a2 2 0 002 2h8a2 2 0 002-2V6H4z" clipRule="evenodd" />
                ) : (
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                )}
              </svg>
            </button>

            <button
              onClick={toggleScreenShare}
              className={`${isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'} text-white p-2 rounded-lg transition-colors`}
              title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>

            <button
              onClick={endCall}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
              title="End call"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
});

export default VideoCall;
