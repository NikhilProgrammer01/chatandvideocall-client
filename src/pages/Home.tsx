import React, { useState, type FormEvent, type ChangeEvent } from 'react';

interface HomeProps {
  onLogin: (userId: string, name?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const Home: React.FC<HomeProps> = ({ onLogin, isLoading, error }) => {
  const [userId, setUserId] = useState<string>('');
  const [name, setName] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!userId.trim()) {
      return;
    }

    await onLogin(userId.trim(), name.trim() || undefined);
  };

  const handleUserIdChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setUserId(e.target.value);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <span style={styles.icon}>🏥</span>
          </div>
          <h1 style={styles.title}>Stream Medical App</h1>
          <p style={styles.subtitle}>
            Secure healthcare communication platform
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="userId" style={styles.label}>
              User ID *
            </label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={handleUserIdChange}
              placeholder="Enter your user ID"
              style={styles.input}
              disabled={isLoading}
              required
            />
            <span style={styles.hint}>
              Use alphanumeric characters, @, _, or -
            </span>
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="name" style={styles.label}>
              Display Name (Optional)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your display name"
              style={styles.input}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div style={styles.errorContainer}>
              <span style={styles.errorIcon}>⚠️</span>
              <span style={styles.errorText}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !userId.trim()}
            style={{
              ...styles.button,
              ...(isLoading || !userId.trim() ? styles.buttonDisabled : {}),
            }}
          >
            {isLoading ? (
              <>
                <span style={styles.spinner}>⏳</span>
                Connecting...
              </>
            ) : (
              <>
                <span>🔐</span>
                Login
              </>
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Powered by <strong>Stream</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f4f8',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    maxWidth: '480px',
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    textAlign: 'center',
    padding: '48px 32px 32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  iconContainer: {
    marginBottom: '16px',
  },
  icon: {
    fontSize: '64px',
    display: 'inline-block',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    opacity: 0.9,
    margin: 0,
  },
  form: {
    padding: '32px',
  },
  inputGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e0e6ed',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  },
  hint: {
    display: 'block',
    fontSize: '12px',
    color: '#7f8c8d',
    marginTop: '6px',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  errorIcon: {
    fontSize: '18px',
  },
  errorText: {
    fontSize: '14px',
    color: '#c0392b',
    flex: 1,
  },
  button: {
    width: '100%',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#667eea',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
  footer: {
    padding: '20px 32px',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #e9ecef',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '14px',
    color: '#7f8c8d',
    margin: 0,
  },
};

export default Home;