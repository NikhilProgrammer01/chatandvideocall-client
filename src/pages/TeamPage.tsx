import React, { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

interface Team {
  id: string;
  name: string;
  members: string[];
  createdBy: string;
  createdAt: string;
}

interface TeamPageProps {
  currentUser: string;
  onLogout: () => Promise<void>;
}

const TeamPage: React.FC<TeamPageProps> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [teamName, setTeamName] = useState<string>('');
  const [memberIds, setMemberIds] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  useEffect(() => {
    fetchTeams();
  }, [currentUser]);

  const fetchTeams = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<{ teams: Team[] }>(
        `${API_URL}/teams/${currentUser}`
      );
      setTeams(response.data.teams);
    } catch (err: any) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const members = memberIds
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

      if (!members.includes(currentUser)) {
        members.push(currentUser);
      }

      const teamId = `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await axios.post(`${API_URL}/teams/create`, {
        teamId,
        teamName: teamName.trim(),
        members,
        createdBy: currentUser,
      });

      setShowCreateModal(false);
      setTeamName('');
      setMemberIds('');
      await fetchTeams();
    } catch (err: any) {
      console.error('Error creating team:', err);
      setError(err.response?.data?.error || 'Failed to create team');
    } finally {
      setIsCreating(false);
    }
  };

  const handleTeamClick = (teamId: string): void => {
    navigate(`/teams/${teamId}`);
  };

  const handleLogout = async (): Promise<void> => {
    await onLogout();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>🏥 Medical Teams</h1>
          <p style={styles.userInfo}>Logged in as: <strong>{currentUser}</strong></p>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          🚪 Logout
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.toolbar}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={styles.createButton}
          >
            ➕ Create New Team
          </button>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} style={styles.closeError}>
              ✕
            </button>
          </div>
        )}

        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}>⏳</div>
            <p style={styles.loadingText}>Loading teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📋</span>
            <h3 style={styles.emptyTitle}>No teams yet</h3>
            <p style={styles.emptyText}>
              Create your first team to start collaborating
            </p>
          </div>
        ) : (
          <div style={styles.teamGrid}>
            {teams.map((team) => (
              <div
                key={team.id}
                style={styles.teamCard}
                onClick={() => handleTeamClick(team.id)}
              >
                <div style={styles.teamHeader}>
                  <h3 style={styles.teamName}>{team.name}</h3>
                  <span style={styles.memberCount}>
                    👥 {team.members.length}
                  </span>
                </div>
                <div style={styles.teamFooter}>
                  <span style={styles.createdBy}>
                    Created by: {team.createdBy}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create New Team</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={styles.modalClose}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeam} style={styles.form}>
              <div style={styles.inputGroup}>
                <label htmlFor="teamName" style={styles.label}>
                  Team Name *
                </label>
                <input
                  id="teamName"
                  type="text"
                  value={teamName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setTeamName(e.target.value)
                  }
                  placeholder="Enter team name"
                  style={styles.input}
                  disabled={isCreating}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label htmlFor="memberIds" style={styles.label}>
                  Member IDs (comma-separated)
                </label>
                <input
                  id="memberIds"
                  type="text"
                  value={memberIds}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setMemberIds(e.target.value)
                  }
                  placeholder="user1, user2, user3"
                  style={styles.input}
                  disabled={isCreating}
                />
                <span style={styles.hint}>
                  You will be automatically added to the team
                </span>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={styles.cancelButton}
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...styles.submitButton,
                    ...(isCreating ? styles.buttonDisabled : {}),
                  }}
                  disabled={isCreating || !teamName.trim()}
                >
                  {isCreating ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 32px",
    backgroundColor: "white",
    borderBottom: "1px solid #e0e6ed",
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#2c3e50",
    margin: "0 0 8px 0",
  },
  userInfo: {
    fontSize: "14px",
    color: "#7f8c8d",
    margin: 0,
  },
  logoutButton: {
    padding: "10px 20px",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px",
  },
  toolbar: {
    marginBottom: "24px",
  },
  createButton: {
    padding: "12px 24px",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  errorBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#fee",
    border: "1px solid #fcc",
    borderRadius: "8px",
    marginBottom: "24px",
    color: "#c0392b",
  },
  closeError: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#c0392b",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "64px 0",
  },
  spinner: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  loadingText: {
    fontSize: "16px",
    color: "#7f8c8d",
  },
  emptyState: {
    textAlign: "center",
    padding: "64px 32px",
  },
  emptyIcon: {
    fontSize: "64px",
    display: "block",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "8px",
  },
  emptyText: {
    fontSize: "16px",
    color: "#7f8c8d",
  },
  teamGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
  },
  teamCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  teamHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  teamName: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#2c3e50",
    margin: 0,
  },
  memberCount: {
    fontSize: "14px",
    color: "#7f8c8d",
  },
  teamFooter: {
    paddingTop: "16px",
    borderTop: "1px solid #e0e6ed",
  },
  createdBy: {
    fontSize: "13px",
    color: "#95a5a6",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "16px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
    borderBottom: "1px solid #e0e6ed",
  },
  modalTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#2c3e50",
    margin: 0,
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#7f8c8d",
  },
  form: {
    padding: "24px",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    border: "2px solid #e0e6ed",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  hint: {
    fontSize: "12px",
    color: "#7f8c8d",
    marginTop: "6px",
    display: "block",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "24px",
    gap: "12px",
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#bdc3c7",
    borderRadius: "8px",
    border: "none",
    color: "white",
    fontSize: "14px",
    cursor: "pointer",
  },
  submitButton: {
    padding: "10px 24px",
    backgroundColor: "#2ecc71",
    borderRadius: "8px",
    border: "none",
    color: "white",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};

export default TeamPage