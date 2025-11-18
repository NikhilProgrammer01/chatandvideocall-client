import React, { useState,  } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StreamChat } from 'stream-chat';
import { Chat } from 'stream-chat-react';
import { StreamVideo, StreamVideoClient } from '@stream-io/video-react-sdk';
import axios from 'axios';

import Home from './pages/Home';
import TeamPage from './pages/TeamPage';
import TeamDashboard from './pages/team/TeamDashboard';
import ErrorBoundary from './components/ErrorBoundary';

import 'stream-chat-react/dist/css/v2/index.css';
import '@stream-io/video-react-sdk/dist/css/styles.css';


const API_URL = 'http://localhost:3001';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (userId: string, name?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/auth/token`, {
        userId,
        name,
      });

      const { chatToken, videoToken, apiKey } = response.data;

      // Initialize Chat Client
      const chat = StreamChat.getInstance(apiKey);
      await chat.connectUser(
        {
          id: userId,
          name: name || userId,
        },
        chatToken
      );
      setChatClient(chat);

      // Initialize Video Client
      const video = new StreamVideoClient({
        apiKey,
        user: {
          id: userId,
          name: name || userId,
        },
        token: videoToken,
      });
      setVideoClient(video);

      setCurrentUser(userId);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    if (chatClient) {
      await chatClient.disconnectUser();
      setChatClient(null);
    }
    if (videoClient) {
      await videoClient.disconnectUser();
      setVideoClient(null);
    }
    setCurrentUser(null);
  };

  if (!currentUser || !chatClient || !videoClient) {
    return (
      <ErrorBoundary>
        <Home onLogin={handleLogin} isLoading={isLoading} error={error} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Chat client={chatClient}>
          <StreamVideo client={videoClient}>
            <Routes>
              <Route path="/" element={<Navigate to="/teams" replace />} />
              <Route
                path="/teams"
                element={<TeamPage currentUser={currentUser} onLogout={handleLogout} />}
              />
              <Route
                path="/teams/:teamId"
                element={<TeamDashboard currentUser={currentUser} />}
              />
            </Routes>
          </StreamVideo>
        </Chat>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;