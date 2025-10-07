import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, useTheme, useMediaQuery, styled, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ArrowForward, Phone } from '@mui/icons-material';
import massageImage from '../../assets/images/massageImage.png';
import { bannerAPI } from '../../services/api.service';

const BannerContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    padding: theme.spacing(0.5, 0),
    background: 'linear-gradient(135deg, rgba(102, 51, 153, 0.9) 0%, rgba(51, 54, 121, 0.9) 50%, rgba(27, 27, 72, 0.9) 100%)',
    overflow: 'hidden',
    '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 2px,
        rgba(255, 255, 255, 0.05) 2px,
        rgba(255, 255, 255, 0.05) 4px
      )
    `,
        zIndex: 0,
    },
    '& > *': {
        position: 'relative',
        zIndex: 1,
    },
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(0.25, 0),
    },
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr',
    gap: theme.spacing(4),
    alignItems: 'center',
    minHeight: '200px',
    position: 'relative',
    [theme.breakpoints.down('lg')]: {
        gridTemplateColumns: '1fr',
        gap: theme.spacing(2),
        textAlign: 'center',
    },
}));

const LeftSection = styled(Box)(({ theme }) => ({
    position: 'relative',
    height: '180px',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundImage: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
    },
    '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(102, 51, 153, 0.7) 0%, rgba(51, 54, 121, 0.7) 50%, rgba(27, 27, 72, 0.7) 100%)',
        zIndex: 1,
    },
    '&:after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
        zIndex: 2,
    },
    [theme.breakpoints.down('lg')]: {
        order: 3,
        height: '140px',
        maxWidth: '320px',
        margin: '0 auto',
    },
}));

const CenterSection = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    zIndex: 2,
    position: 'relative',
    gap: theme.spacing(2),
    [theme.breakpoints.down('lg')]: {
        order: 2,
    },
}));

const IconContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
}));

const EmailIcon = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '120px',
    height: '120px',
    backgroundImage: `url(${massageImage})`,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'scale(1.05)',
    },
    '&:before': {
        content: '""',
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        width: '18px',
        height: '18px',
        background: 'linear-gradient(145deg, #FF0000 0%, #CC0000 100%)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `
            0 4px 8px rgba(255, 0, 0, 0.4),
            inset 0 1px 2px rgba(255, 255, 255, 0.3),
            inset 0 -1px 2px rgba(0, 0, 0, 0.2)
        `,
        animation: 'pulse 2s infinite',
    },
    '@keyframes pulse': {
        '0%': {
            transform: 'scale(1)',
        },
        '50%': {
            transform: 'scale(1.1)',
        },
        '100%': {
            transform: 'scale(1)',
        },
    },
}));

const PhoneIcon = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '18px',
    height: '18px',
    background: 'linear-gradient(145deg, #FF0000 0%, #CC0000 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `
        0 2px 4px rgba(255, 0, 0, 0.4),
        inset 0 1px 2px rgba(255, 255, 255, 0.3),
        inset 0 -1px 2px rgba(0, 0, 0, 0.2)
    `,
    '& .MuiSvgIcon-root': {
        fontSize: '0.7rem',
        color: '#FFFFFF',
        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
    },
}));

const MainTitle = styled(Typography)(({ theme }) => ({
    fontSize: '2.2rem',
    fontWeight: 800,
    color: '#FFFFFF',
    lineHeight: 1.2,
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    marginBottom: 0,
    [theme.breakpoints.down('sm')]: {
        fontSize: '1.6rem',
    },
    [theme.breakpoints.down('md')]: {
        fontSize: '1.8rem',
    },
}));

const Subtitle = styled(Typography)(({ theme }) => ({
    fontSize: '1.1rem',
    color: '#FFFFFF',
    lineHeight: 1.6,
    marginBottom: 0,
    maxWidth: '600px',
    opacity: 0.95,
    textAlign: 'center',
    fontWeight: 400,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
    [theme.breakpoints.down('lg')]: {
        maxWidth: '100%',
    },
    [theme.breakpoints.down('sm')]: {
        fontSize: '1rem',
    },
}));

const RegisterButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#FFFFFF',
    color: '#5C2D91',
    padding: theme.spacing(1.2, 4),
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 700,
    fontSize: '1.1rem',
    boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease',
    marginTop: theme.spacing(1),
    minWidth: '180px',
    '&:hover': {
        backgroundColor: '#F5F5F5',
        transform: 'translateY(-3px)',
        boxShadow: '0 6px 20px rgba(255, 255, 255, 0.4)',
    },
    '& .MuiButton-endIcon': {
        marginLeft: theme.spacing(0.5),
        marginRight: 0,
    },
    [theme.breakpoints.down('sm')]: {
        fontSize: '1rem',
        padding: theme.spacing(1, 3),
        minWidth: '160px',
    },
}));

const RightSection = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    position: 'relative',
    [theme.breakpoints.down('lg')]: {
        order: 1,
    },
}));

const BannerFile = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [bannerData, setBannerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper function to get image URL
    const getImageUrl = (image) => {
        if (!image) {
            return null;
        }

        if (typeof image === 'string') {
            // If it's already a full URL, return it
            if (image.startsWith('http')) return image;

            // If it's a relative path, construct full URL
            return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${image}`;
        }

        return null;
    };

    // Fetch promotional banners from API
    useEffect(() => {
        const fetchPromoBanners = async () => {
            try {
                setLoading(true);
                console.log('🔄 Fetching promotional banners from API...');

                // Try to get promotional banners specifically
                let bannersData;
                try {
                    console.log('🔍 Trying to fetch promotional banners...');
                    bannersData = await bannerAPI.getBannersByType('promo');
                    console.log('✅ Promotional banners received:', bannersData);
                } catch (byTypeError) {
                    console.log('⚠️ By type failed, trying active banners...');
                    bannersData = await bannerAPI.getActiveBanners();
                    console.log('✅ Active banners received:', bannersData);
                }

                // Filter to only promo type banners
                let filteredBanners = [];
                if (Array.isArray(bannersData)) {
                    filteredBanners = bannersData.filter(banner => banner.banner_type === 'promo');
                } else if (bannersData?.results) {
                    filteredBanners = bannersData.results.filter(banner => banner.banner_type === 'promo');
                } else if (bannersData?.data) {
                    filteredBanners = bannersData.data.filter(banner => banner.banner_type === 'promo');
                }

                console.log('📊 Filtered promotional banners:', filteredBanners.length);

                // Get the first promotional banner
                if (filteredBanners.length > 0) {
                    const promoBanner = filteredBanners[0];
                    setBannerData({
                        title: promoBanner.title,
                        description: promoBanner.description,
                        image_url: getImageUrl(promoBanner.image || promoBanner.image_url),
                        button_text: promoBanner.button_text,
                        button_url: promoBanner.button_url,
                        url: promoBanner.url
                    });
                    console.log('✅ Promotional banner set successfully');
                } else {
                    console.log('⚠️ No promotional banners found');
                    setBannerData(null);
                }

            } catch (error) {
                console.error('❌ Error fetching promotional banners:', error);
                console.error('❌ Error details:', error.response?.data || error.message);
                setError(t('commonDataLoadingError'));
                setBannerData(null);
            } finally {
                setLoading(false);
                console.log('🏁 Promotional banners fetch completed');
            }
        };

        fetchPromoBanners();
    }, []);

    // Show loading state
    if (loading) {
        return (
            <BannerContainer>
                <Container maxWidth="lg">
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '200px',
                        gap: 2
                    }}>
                        <CircularProgress sx={{ color: '#fff' }} />
                        <Typography variant="h6" sx={{ color: '#fff' }}>
                            {t('commonLoading')}
                        </Typography>
                    </Box>
                </Container>
            </BannerContainer>
        );
    }

    return (
        <BannerContainer>
            <Container maxWidth="lg">
                <ContentWrapper>
                    <LeftSection
                        sx={{
                            backgroundImage: bannerData?.image_url
                                ? `url("${bannerData.image_url}")`
                                : 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80")'
                        }}
                    />

                    <CenterSection>
                        <MainTitle variant="h2" component="h2">
                            {bannerData?.title || t('homeGetOnlineCourses')}
                        </MainTitle>

                        <Subtitle variant="body1">
                            {bannerData?.description || t('homeJoinOurEducationalPlatform')}
                        </Subtitle>

                        <RegisterButton
                            endIcon={<ArrowForward />}
                            onClick={() => {
                                if (bannerData?.button_url) {
                                    window.location.href = bannerData.button_url;
                                } else if (bannerData?.url) {
                                    window.location.href = bannerData.url;
                                } else {
                                    window.location.href = '/register';
                                }
                            }}
                        >
                            {bannerData?.button_text || t('bannerRegisterWithUs')}
                        </RegisterButton>
                    </CenterSection>

                    <RightSection>
                        <IconContainer>
                            <EmailIcon>
                                <PhoneIcon>
                                    <Phone />
                                </PhoneIcon>
                            </EmailIcon>
                        </IconContainer>
                    </RightSection>
                </ContentWrapper>
            </Container>
        </BannerContainer>
    );
};

export default BannerFile;
