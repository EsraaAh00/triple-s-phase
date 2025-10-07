import React from 'react';
import { Box } from '@mui/material';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import AboutAcademySection from './AboutAcademySection';

const AboutAcademyDetail = () => {
    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <Header />

            {/* Main Content with proper spacing and banner shadow overlay */}
            <Box sx={{
                flex: 1,
                paddingTop: '100px', // Add space for fixed header
                backgroundColor: '#f9fafb', // Match AboutAcademySection background
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '200px', // Shadow height
                    background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%)',
                    zIndex: 2,
                    pointerEvents: 'none'
                }
            }}>
                <AboutAcademySection hideReadMoreButton={true} />
            </Box>

            {/* Footer */}
            <Footer />
        </Box>
    );
};

export default AboutAcademyDetail;
