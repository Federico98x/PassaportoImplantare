import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Typography, Button, Paper, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

// Wrapper to use hooks with class component
const ErrorBoundaryWrapper: React.FC<Props> = (props) => {
    const navigate = useNavigate();
    return <ErrorBoundaryClass {...props} navigate={navigate} />;
};

class ErrorBoundaryClass extends Component<Props & { navigate: (path: string) => void }, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        this.props.navigate('/');
    };

    public render() {
        if (this.state.hasError) {
            return (
                <Container maxWidth="sm">
                    <Box sx={{ mt: 8 }}>
                        <Paper sx={{ p: 4 }}>
                            <Typography variant="h4" component="h1" gutterBottom color="error">
                                Something went wrong
                            </Typography>
                            <Typography variant="body1" paragraph>
                                We apologize for the inconvenience. Please try again or contact support if the problem persists.
                            </Typography>
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <Box sx={{ mt: 2, mb: 2 }}>
                                    <Typography variant="subtitle2" color="error">
                                        Error Details (Development Only):
                                    </Typography>
                                    <pre style={{ 
                                        overflow: 'auto',
                                        padding: '1rem',
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '4px'
                                    }}>
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </Box>
                            )}
                            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    onClick={this.handleReset}
                                >
                                    Return to Home
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => window.location.reload()}
                                >
                                    Reload Page
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundaryWrapper;
