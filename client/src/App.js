// Apollo:
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './lib/graphql/client';
// Authentication:
import { getUser, logout } from './lib/auth';
// React:
import { useState } from 'react';
// Components:
import Chat from './components/Chat';
import LoginForm from './components/LoginForm';
import NavBar from './components/NavBar';

function App() {
  const [user, setUser] = useState(getUser);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return (
    <ApolloProvider client={apolloClient}>
      <header>
        <NavBar user={user} onLogout={handleLogout} />
      </header>
      <main>
        {Boolean(user) ? <Chat user={user} /> : <LoginForm onLogin={setUser} />}
      </main>
    </ApolloProvider>
  );
}

export default App;
