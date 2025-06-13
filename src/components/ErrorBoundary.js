import React, { Component } from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import { ReportProblem } from '@mui/icons-material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Log to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              p: 3,
            }}
          >
            <ReportProblem color="error" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" paragraph>
              We're sorry for the inconvenience. Our team has been notified.
            </Typography>
            
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 3, textAlign: 'left', p: 2, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle1" color="error">
                  {this.state.error?.toString()}
                </Typography>
                <Typography variant="caption" component="pre" sx={{ overflowX: 'auto' }}>
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReset}
              sx={{ mt: 3 }}
            >
              Try Again
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;