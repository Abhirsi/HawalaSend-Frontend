import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import theme from './styles/theme';

// Mock child components if needed
jest.mock('./components/Dashboard', () => () => <div>Dashboard Mock</div>);
jest.mock('./components/Auth/Login', () => () => <div>Login Mock</div>);
jest.mock('./components/Auth/Register', () => () => <div>Register Mock</div>);

const renderWithProviders = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  test('renders default route (redirect to dashboard)', async () => {
    renderWithProviders(<App />, { route: '/' });
    
    await waitFor(() => {
      expect(screen.getByText(/dashboard mock/i)).toBeInTheDocument();
    });
  });

  test('renders login page when navigating to /login', async () => {
    renderWithProviders(<App />, { route: '/login' });
    expect(screen.getByText(/login mock/i)).toBeInTheDocument();
  });

  test('renders register page when navigating to /register', async () => {
    renderWithProviders(<App />, { route: '/register' });
    expect(screen.getByText(/register mock/i)).toBeInTheDocument();
  });

  test('redirects to login when accessing protected route without auth', async () => {
    renderWithProviders(<App />, { route: '/dashboard' });
    
    await waitFor(() => {
      expect(screen.getByText(/login mock/i)).toBeInTheDocument();
    });
  });

  test('accesses dashboard when authenticated', async () => {
    // Mock authentication
    window.localStorage.setItem('token', 'test-token');
    
    renderWithProviders(<App />, { route: '/dashboard' });
    
    await waitFor(() => {
      expect(screen.getByText(/dashboard mock/i)).toBeInTheDocument();
    });
  });

  test('has proper navigation links', async () => {
    renderWithProviders(<App />);
    
    const nav = screen.getByRole('navigation');
    expect(within(nav).getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /register/i })).toBeInTheDocument();
  });

  test('handles 404 routes', async () => {
    renderWithProviders(<App />, { route: '/non-existent-route' });
    
    await waitFor(() => {
      expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    });
  });
});

// Snapshot test
describe('App Component Snapshot', () => {
  test('matches snapshot when logged out', () => {
    const { asFragment } = renderWithProviders(<App />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('matches snapshot when logged in', () => {
    window.localStorage.setItem('token', 'test-token');
    const { asFragment } = renderWithProviders(<App />);
    expect(asFragment()).toMatchSnapshot();
  });
});