// app/page.tsx

import { useRouter } from 'next/router';
import React from 'react';

const HomePage: React.FC = () => {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <div style={styles.container}>
      <button style={styles.button} onClick={handleLoginRedirect}>
        Go to Login
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default HomePage;