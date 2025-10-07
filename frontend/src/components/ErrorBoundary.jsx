import { Component } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { withTranslation } from 'react-i18next';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            textAlign: 'center',
            backgroundColor: '#f8f8f8',
          }}
        >
          <Typography variant="h4" color="error" gutterBottom>
            {t('errorBoundarySomethingWentWrong')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('errorBoundaryErrorMessage')}
          </Typography>
          {import.meta.env.DEV && (
            <Box 
              sx={{ 
                mt: 3, 
                p: 2, 
                backgroundColor: '#fff', 
                borderRadius: 1,
                textAlign: 'left',
                maxWidth: '800px',
                width: '100%',
                overflow: 'auto',
                maxHeight: '300px'
              }}
            >
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Error Details:
              </Typography>
              <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </Typography>
            </Box>
          )}
          <Button 
            variant="contained" 
            color="primary" 
            onClick={this.handleReload}
            sx={{ mt: 3 }}
          >
            {t('errorBoundaryReloadPage')}
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
