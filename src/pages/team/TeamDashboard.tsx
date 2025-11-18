import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
  useChatContext,
} from "stream-chat-react";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import CallButton from "../../components/CallButton";
import CallsWrapper from "../../components/CallsWrapper";

const API_URL = "http://localhost:3001";

interface Team {
  id: string;
  name: string;
  members: string[];
  createdBy: string;
  createdAt: string;
}

interface TeamDashboardProps {
  currentUser: string;
}

const TeamDashboard: React.FC<TeamDashboardProps> = ({ currentUser }) => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { client } = useChatContext();
  const videoClient = useStreamVideoClient();

  const [team, setTeam] = useState<Team | null>(null);
  const [channel, setChannel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isStartingCall, setIsStartingCall] = useState<boolean>(false);

  useEffect(() => {
    if (teamId) fetchTeamAndInitializeChannel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, client]);

  const fetchTeamAndInitializeChannel = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get<{ team: Team }>(
        `${API_URL}/teams/detail/${teamId}`
      );

      const teamData = response.data.team;
      setTeam(teamData);

  const chatChannel = client.channel("messaging", teamId, {
  members: teamData.members,
  name: teamData.name, // ✅ Use the standard 'name' field
});

      await chatChannel.watch();
      setChannel(chatChannel);
    } catch (err: any) {
      console.error("Error loading team:", err);
      setError("Failed to load team details");
    } finally {
      setIsLoading(false);
    }
  };

const handleStartCall = async (): Promise<void> => {
  if (!videoClient || !team || isStartingCall) return;

  setIsStartingCall(true);
  setError(null);

  try {
    const callId = `team-call-${teamId}-${Date.now()}`;
    const call = videoClient.call("default", callId);

    console.log('Creating call with ID:', callId);

    await call.getOrCreate({
      ring: true,
      data: {
        members: team.members.map((memberId) => ({ user_id: memberId })),
        custom: {
          teamId: team.id,
          teamName: team.name,
        },
      },
    });

    console.log('Call created, now joining...');

    // ✅ Join the call
    await call.join({
      create: false,
    });

    console.log('✅ Initiator successfully joined call on client side.'); 
    console.log('✅ Successfully joined call');

    // ✅ Enable camera after joining
    try {
      await call.camera.enable();
      console.log('✅ Camera enabled');
    } catch (cameraError) {
      console.warn('⚠️ Could not enable camera:', cameraError);
    }

    // ✅ NEW: Manually trigger state update in CallsWrapper
    // This ensures the creator sees the active call UI
    window.dispatchEvent(new CustomEvent('call-started', { 
      detail: { call, callId, callerName: currentUser } 
    }));

  } catch (err: any) {
    console.error("Error starting call:", err);
    setError(err.message || "Failed to start call");
  } finally {
    setIsStartingCall(false);
  }
};

  const handleBackToTeams = (): void => {
    navigate("/teams");
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}>⏳</div>
        <p style={styles.loadingText}>Loading team dashboard...</p>
      </div>
    );
  }

  if (error && !team) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <span style={styles.errorIcon}>⚠️</span>
          <h2 style={styles.errorTitle}>Error Loading Team</h2>
          <p style={styles.errorMessage}>{error}</p>
          <button onClick={handleBackToTeams} style={styles.backButton}>
            ← Back to Teams
          </button>
        </div>
      </div>
    );
  }

  if (!channel || !team) return null;

  return (
    <CallsWrapper>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <button onClick={handleBackToTeams} style={styles.backButton}>
              ← Back
            </button>
            <div style={styles.teamInfo}>
              <h1 style={styles.teamName}>{team.name}</h1>
              <span style={styles.memberCount}>
                👥 {team.members.length} members
              </span>
            </div>
          </div>

          <div style={styles.headerRight}>
            <CallButton
              onClick={handleStartCall}
              disabled={isStartingCall}
              label={isStartingCall ? "⏳ Starting..." : "📞 Start Call"}
              variant="primary"
            />
          </div>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} style={styles.closeError}>
              ✕
            </button>
          </div>
        )}

        {/* Main Layout */}
        <div style={styles.content}>
          {/* Sidebar */}
          <div style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <h3 style={styles.sidebarTitle}>Team Members</h3>
            </div>

            <div style={styles.membersList}>
              {team.members.map((memberId) => (
                <div key={memberId} style={styles.memberItem}>
                  <div style={styles.memberAvatar}>
                    {memberId.charAt(0).toUpperCase()}
                  </div>

                  <div style={styles.memberInfo}>
                    <span style={styles.memberId}>{memberId}</span>
                    {memberId === team.createdBy && (
                      <span style={styles.ownerBadge}>Owner</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div style={styles.chatContainer}>
            <Channel channel={channel}>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          </div>
        </div>
      </div>
    </CallsWrapper>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#f5f7fa",
  },

  /* Header */
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    backgroundColor: "white",
    borderBottom: "1px solid #e0e6ed",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flex: 1,
  },
  headerRight: {
    display: "flex",
    gap: "12px",
  },

  /* Back Button */
  backButton: {
    padding: "8px 16px",
    backgroundColor: "#ecf0f1",
    color: "#2c3e50",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.3s ease",
  },

  /* Team Info */
  teamInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  teamName: {
    fontSize: "22px",
    fontWeight: 700,
    margin: 0,
    color: "#2c3e50",
  },
  memberCount: {
    fontSize: "14px",
    color: "#7f8c8d",
  },

  /* Error Banner */
  errorBanner: {
    padding: "12px 20px",
    backgroundColor: "#fdecea",
    border: "1px solid #f5c6cb",
    color: "#c0392b",
    margin: "8px 16px",
    borderRadius: "6px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeError: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#c0392b",
    fontSize: "18px",
    fontWeight: "bold",
  },

  /* Main Layout */
  content: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },

  /* Sidebar */
  sidebar: {
    width: "260px",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e0e6ed",
    display: "flex",
    flexDirection: "column",
  },
  sidebarHeader: {
    padding: "16px",
    borderBottom: "1px solid #e0e6ed",
  },
  sidebarTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: "#2c3e50",
  },

  /* Team members list */
  membersList: {
    flex: 1,
    overflowY: "auto",
  },
  memberItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #f1f1f1",
    gap: "12px",
  },
  memberAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#3498db",
    color: "white",
    fontWeight: "700",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  memberInfo: {
    display: "flex",
    flexDirection: "column",
  },
  memberId: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2c3e50",
  },
  ownerBadge: {
    marginTop: "4px",
    backgroundColor: "#27ae60",
    color: "white",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600",
    alignSelf: "flex-start",
  },

  /* Chat Area */
  chatContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f9fafb",
  },

  /* Loading Screen */
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#f5f7fa",
  },
  spinner: {
    fontSize: "32px",
  },
  loadingText: {
    fontSize: "16px",
    color: "#7f8c8d",
  },

  /* Error Screen */
  errorContainer: {
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
  },
  errorCard: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "8px",
    width: "360px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  errorIcon: {
    fontSize: "32px",
  },
  errorTitle: {
    margin: "12px 0 4px 0",
    color: "#c0392b",
  },
  errorMessage: {
    fontSize: "14px",
    color: "#7f8c8d",
  },
};

export default TeamDashboard;
