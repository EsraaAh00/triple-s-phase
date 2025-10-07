import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Typography,
    Button,
    Container,
    Grid,
    Chip,
    Avatar,
    Rating,
    CircularProgress,
    Tabs,
    Tab,
    IconButton,
    Card,
    CardContent,
    Alert,
    Dialog,
    DialogContent
} from '@mui/material';
import {
    Star as StarIcon,
    StarBorder,
    PeopleAltOutlined,
    PlayCircleOutline,
    DescriptionOutlined,
    BookmarkBorder,
    ArrowBack,
    ArrowForward,
    CheckCircle,
    Assignment as AssignmentIcon,
    InsertDriveFile as InsertDriveFileIcon,
    OndemandVideo as VideoIcon,
    Quiz as QuizIconFilled,
    Info as InfoIcon,
    VideoLibrary as VideoLibraryIcon,
    AssignmentTurnedIn as AssignmentTurnedInIcon,
    Download as DownloadIcon,
    Code as CodeIcon,
    Quiz as QuizIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import CourseDetailBanner from '../../components/courses/CourseDetailBanner';
import CourseDetailCard from '../../components/courses/CourseDetailCard';
import CourseDescriptionTab from '../../components/courses/CourseDescriptionTab';
import CourseContentTab from '../../components/courses/CourseContentTab';
import CourseDemoTab from '../../components/courses/CourseDemoTab';
import CourseReviewsTab from '../../components/courses/CourseReviewsTab';
import CoursePromotionalVideo from '../../components/courses/CoursePromotionalVideo';
import { courseAPI, cartAPI } from '../../services/courseService';
import { contentAPI } from '../../services/content.service';
// import { assignmentsAPI } from '../../services/assignment.service';
// import { examAPI } from '../../services/exam.service';
import { reviewsAPI } from '../../services/reviews.service';
import api from '../../services/api.service';
import { API_CONFIG } from '../../config/api.config';


// Animation keyframes
const float = keyframes`
  0% { 
    transform: translateY(0px) rotate(0deg);
    filter: drop-shadow(0 5px 15px rgba(0,0,0,0.1));
  }
  25% {
    transform: translateY(-8px) rotate(0.5deg);
    filter: drop-shadow(0 8px 20px rgba(0,0,0,0.15));
  }
  50% {
    transform: translateY(-12px) rotate(-0.5deg);
    filter: drop-shadow(0 12px 25px rgba(0,0,0,0.2));
  }
  75% {
    transform: translateY(-8px) rotate(0.5deg);
    filter: drop-shadow(0 8px 20px rgba(0,0,0,0.15));
  }
  100% { 
    transform: translateY(0px) rotate(0deg);
    filter: drop-shadow(0 5px 15px rgba(0,0,0,0.1));
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  50% {
    transform: scale(1.03);
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

// Animated background components
const FloatingShape = styled('div')({
    position: 'absolute',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, #663399, #8B4B8C)',
    filter: 'blur(60px)',
    opacity: 0.2,
    zIndex: 1,
    animation: `${float} 15s ease-in-out infinite`,
    '&:nth-of-type(1)': {
        width: '300px',
        height: '300px',
        top: '-100px',
        right: '-100px',
        animationDelay: '0s',
    },
    '&:nth-of-type(2)': {
        width: '200px',
        height: '200px',
        bottom: '20%',
        right: '15%',
        animationDelay: '5s',
        background: 'linear-gradient(45deg, #663399, #9966CC)',
    },
    '&:nth-of-type(3)': {
        width: '250px',
        height: '250px',
        top: '30%',
        left: '15%',
        animationDelay: '7s',
        background: 'linear-gradient(45deg, #663399, #7B3F98)',
    },
});

const AnimatedBackground = styled('div')(() => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #2d1b4e 0%, #1a0d2e 100%)',
        zIndex: 1,
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23663399\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
        opacity: 0.4,
        zIndex: 2,
        animation: `${pulse} 15s ease-in-out infinite`,
    },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    position: 'relative',
    display: 'inline-block',
    marginBottom: theme.spacing(4),
    fontWeight: 700,
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: -8,
        left: 0,
        width: '80px',
        height: '4px',
        background: `linear-gradient(90deg, #333679 0%, #4DBFB3 100%)`,
        borderRadius: '2px',
    },
}));


// Skeleton animation keyframes
const pulseAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

const SkeletonPulse = styled(Box)(({ theme }) => ({
    display: 'inline-block',
    animation: `${pulseAnimation} 1.5s ease-in-out infinite`,
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
}));

const CourseSkeleton = () => (
    <Box sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                <Grid xs={12} lg={8}>
                    <SkeletonPulse variant="rectangular" width="100%" height={{ xs: 250, sm: 300, md: 400 }} sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2 }} />
                    <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                        <SkeletonPulse variant="text" width={{ xs: "80%", sm: "70%", md: "60%" }} height={{ xs: 30, sm: 35, md: 40 }} sx={{ mb: 2 }} />
                        <SkeletonPulse variant="text" width="90%" height={{ xs: 20, sm: 22, md: 24 }} sx={{ mb: 1 }} />
                        <SkeletonPulse variant="text" width="80%" height={{ xs: 20, sm: 22, md: 24 }} sx={{ mb: { xs: 2, sm: 3 } }} />
                        <SkeletonPulse variant="rectangular" width={{ xs: 100, sm: 110, md: 120 }} height={{ xs: 35, sm: 38, md: 40 }} sx={{ borderRadius: 2 }} />
                    </Box>
                    <Tabs value={0} sx={{ mb: { xs: 2, sm: 3 } }}>
                        {['Overview', 'Curriculum', 'Instructor', 'Reviews'].map((tab) => (
                            <Tab key={tab} label={tab} sx={{ 
                                minWidth: 'auto',
                                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }
                            }} />
                        ))}
                    </Tabs>
                    <SkeletonPulse variant="rectangular" width="100%" height={{ xs: 200, sm: 250, md: 300 }} sx={{ borderRadius: 2 }} />
                </Grid>
                <Grid xs={12} lg={4}>
                    <SkeletonPulse variant="rectangular" width="100%" height={{ xs: 300, sm: 350, md: 400 }} sx={{ borderRadius: 2 }} />
                </Grid>
            </Grid>
        </Container>
    </Box>
);

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { isAuthenticated } = useSelector((state) => state.auth);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [expandedModules, setExpandedModules] = useState({});
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [loadingModules, setLoadingModules] = useState({});
    
    // Simple cache for course data
    const courseCache = useRef(new Map());

    // Review states
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        title: '',
        content: '',
        comment: ''
    });


    // Initialize all modules as collapsed by default
    const initializeExpandedModules = (modules) => {
        const initialExpanded = {};
        if (Array.isArray(modules)) {
            modules.forEach(module => {
                if (module && module.id) {
                    initialExpanded[module.id] = false;
                }
            });
        }
        return initialExpanded;
    };

    // Check cache and fetch course details
    const fetchCourseDetails = async (courseId) => {
        const cacheKey = `course_${courseId}`;
        const cached = courseCache.current.get(cacheKey);
        
        // Return cached data if available and not expired (5 minutes)
        if (cached && Date.now() - cached.timestamp < 300000) {
            console.log('Using cached course data');
            return cached.data;
        }
        
        const data = await courseAPI.getCourseById(courseId);
        
        // Cache the data
        courseCache.current.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
        
        return data;
    };

    // Optimized function to fetch course reviews and rating stats in parallel
    const fetchCourseReviews = async (courseId) => {
        try {
            const [reviewsResponse, ratingResponse] = await Promise.allSettled([
                reviewsAPI.getCourseReviews(courseId),
                reviewsAPI.getCourseRating(courseId)
            ]);

            const reviewsData = reviewsResponse.status === 'fulfilled' 
                ? (reviewsResponse.value.results || reviewsResponse.value || [])
                : [];

            const ratingStats = ratingResponse.status === 'fulfilled' 
                ? ratingResponse.value 
                : null;

            return { reviewsData, ratingStats };
        } catch (error) {
            console.warn('Error fetching reviews:', error);
            return { reviewsData: [], ratingStats: null };
        }
    };

    // Optimized function to fetch modules with all content in parallel
    const fetchModulesWithContent = async (courseId) => {
        try {
            // First, get modules structure
            const modulesResponse = await contentAPI.getCourseModulesWithLessons(courseId);
            let modulesData = [];

                        // Handle different response formats
                        if (modulesResponse && typeof modulesResponse === 'object') {
                            if (Array.isArray(modulesResponse)) {
                                modulesData = modulesResponse;
                            } else if (modulesResponse.modules && Array.isArray(modulesResponse.modules)) {
                                modulesData = modulesResponse.modules;
                            } else if (modulesResponse.results && Array.isArray(modulesResponse.results)) {
                                modulesData = modulesResponse.results;
                            } else if (modulesResponse.data && Array.isArray(modulesResponse.data)) {
                                modulesData = modulesResponse.data;
                }
            }

            if (modulesData.length === 0) {
                return [];
            }

            // Fetch all content for all modules in parallel
            const moduleContentPromises = modulesData.map(async (module, index) => {
                const moduleId = module.id;
                
                // Create parallel promises for each module's content
                const [lessonsResponse, quizzesResponse] = await Promise.allSettled([
                    contentAPI.getLessons({ moduleId: moduleId, courseId: courseId }),
                    api.get(`/api/assignments/quizzes/`, {
                        params: { course: courseId, module: moduleId }
                    }).catch(() => ({ data: [] }))
                ]);

                // Process lessons
                let lessons = [];
                if (lessonsResponse.status === 'fulfilled') {
                    const lessonsData = lessonsResponse.value;
                    if (Array.isArray(lessonsData)) {
                        lessons = lessonsData;
                    } else if (lessonsData && Array.isArray(lessonsData.results)) {
                        lessons = lessonsData.results;
                    } else if (lessonsData && Array.isArray(lessonsData.data)) {
                        lessons = lessonsData.data;
                    }
                }

                // Process quizzes
                let quizzes = [];
                if (quizzesResponse.status === 'fulfilled') {
                    const quizzesData = quizzesResponse.value.data;
                    if (Array.isArray(quizzesData)) {
                        quizzes = quizzesData;
                    } else if (Array.isArray(quizzesData.results)) {
                        quizzes = quizzesData.results;
                    }
                }

                return {
                    ...module,
                    lessons,
                    assignments: [], // Disabled for now
                    quizzes,
                    exams: [] // Disabled for now
                };
            });

            // Wait for all modules to complete
            const modulesWithContent = await Promise.all(moduleContentPromises);
            console.log('All modules with content fetched:', modulesWithContent);
            
            return modulesWithContent;
                        } catch (error) {
            console.warn('Error fetching modules with content:', error);
            return [];
        }
    };

    // Load course data with optimized parallel fetching
    useEffect(() => {
        const fetchCourseData = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log('Fetching course data for ID:', id);

                // Start fetching course details and reviews in parallel
                const courseDataPromise = fetchCourseDetails(id);
                const reviewsPromise = isAuthenticated ? fetchCourseReviews(id) : Promise.resolve({ reviews: [], ratingStats: null });

                // Wait for course details first (needed for basic info)
                let courseData;
                try {
                    courseData = await courseDataPromise;
                    console.log('Course data from API:', courseData);
                } catch (error) {
                    // If course details require authentication, try to get basic info from public courses
                    if (error.response?.status === 401) {
                        console.log('Course details require authentication, fetching from public courses...');
                        try {
                            const publicCoursesResponse = await courseAPI.getCourses({ status: 'published' });
                            const publicCourses = publicCoursesResponse.results || publicCoursesResponse;
                            courseData = publicCourses.find(course => course.id === parseInt(id));

                            if (!courseData) {
                                throw new Error('Course not found in public courses');
                            }
                            console.log('Course data from public courses:', courseData);
                        } catch (publicError) {
                            console.error('Error fetching from public courses:', publicError);
                            throw error; // Re-throw original error
                        }
                    } else {
                        throw error;
                    }
                }

                // Set initial course data for immediate display
                const initialCourse = transformCourseData(courseData, [], [], false, null);
                setCourse(initialCourse);
                setLoading(false);

                // Fetch detailed content in background (parallel)
                const { reviewsData, ratingStats } = await reviewsPromise;
                
                // Fetch modules and content in parallel if user is authenticated
                let modulesData = [];
                let isUserEnrolled = false;
                
                if (isAuthenticated) {
                    try {
                        modulesData = await fetchModulesWithContent(id);
                        isUserEnrolled = modulesData.length > 0;
                    } catch (error) {
                        console.warn('Could not fetch modules:', error);
                        modulesData = [];
                    }
                } else {
                    // For non-authenticated users, try to get basic modules structure
                    try {
                        console.log('Fetching basic modules for non-authenticated user...');
                        const modulesResponse = await contentAPI.getCourseModulesWithLessons(id);
                        let basicModulesData = [];

                        if (modulesResponse && typeof modulesResponse === 'object') {
                            if (Array.isArray(modulesResponse)) {
                                basicModulesData = modulesResponse;
                            } else if (modulesResponse.modules && Array.isArray(modulesResponse.modules)) {
                                basicModulesData = modulesResponse.modules;
                            } else if (modulesResponse.results && Array.isArray(modulesResponse.results)) {
                                basicModulesData = modulesResponse.results;
                            } else if (modulesResponse.data && Array.isArray(modulesResponse.data)) {
                                basicModulesData = modulesResponse.data;
                            }
                        }

                        // Only show modules structure without detailed content
                        modulesData = basicModulesData.map(module => ({
                            ...module,
                            lessons: [], // No lessons for non-authenticated users
                            assignments: [],
                            quizzes: [],
                            exams: []
                        }));

                        console.log('Basic modules for non-authenticated user:', modulesData);
                    } catch (error) {
                        console.warn('Could not fetch basic modules for non-authenticated user:', error);
                        modulesData = [];
                    }
                }

                // Update course with complete data
                const completeCourse = transformCourseData(courseData, modulesData, reviewsData, isUserEnrolled, ratingStats);
                setCourse(completeCourse);
                setExpandedModules(initializeExpandedModules(completeCourse.modules));
            } catch (error) {
                console.error('Error fetching course data:', error);
                let errorMessage = 'فشل في تحميل بيانات الدورة';

                if (error.response) {
                    // Server responded with error status
                    if (error.response.status === 404) {
                        errorMessage = 'الدورة غير موجودة';
                    } else if (error.response.status === 403) {
                        errorMessage = 'ليس لديك صلاحية لعرض هذه الدورة';
                    } else if (error.response.status === 401) {
                        // Don't show login required message for public course details
                        if (!isAuthenticated) {
                            errorMessage = 'هذه الدورة غير متاحة للعرض العام. يرجى تسجيل الدخول لعرض التفاصيل الكاملة.';
                        } else {
                            errorMessage = 'يرجى تسجيل الدخول لعرض هذه الدورة';
                        }
                    } else if (error.response.data?.detail) {
                        errorMessage = error.response.data.detail;
                    } else if (error.response.data?.error) {
                        errorMessage = error.response.data.error;
                    } else if (error.response.data?.message) {
                        errorMessage = error.response.data.message;
                    }
                } else if (error.request) {
                    // Network error
                    errorMessage = 'خطأ في الشبكة. يرجى التحقق من اتصال الإنترنت.';
                } else {
                    // Other error
                    errorMessage = error.message || 'حدث خطأ غير متوقع';
                }

                setError(errorMessage);
                setLoading(false);
            }
        };

        if (id) {
            fetchCourseData();
        }
    }, [id, isAuthenticated]);

    // Transform API data to match expected format
    const transformCourseData = (apiCourse, modulesData = [], reviewsData = [], isUserEnrolled = false, ratingStats = null) => {
        console.log('Transforming course data:', apiCourse);

        // Handle image URLs
        const getImageUrl = (imageField) => {
            if (!imageField) return 'https://source.unsplash.com/random/1600x500?programming,react';
            if (typeof imageField === 'string') {
                // Check if it's already a full URL
                if (imageField.startsWith('http')) return imageField;
                // If it's a relative path, prepend the base URL
                return `${API_CONFIG.baseURL}${imageField}`;
            }
            if (imageField.url) return imageField.url;
            return 'https://source.unsplash.com/random/1600x500?programming,react';
        };

        // Handle file URLs (e.g., PDFs)
        const getFileUrl = (fileField) => {
            if (!fileField) return null;
            if (typeof fileField === 'string') {
                if (fileField.startsWith('http')) return fileField;
                return `${API_CONFIG.baseURL}${fileField}`;
            }
            if (fileField.url) return fileField.url;
            return null;
        };

        // Handle price calculations
        const price = parseFloat(apiCourse.price) || 0;
        const discountPrice = parseFloat(apiCourse.discount_price) || 0;
        const discount = discountPrice > 0 ? Math.round(((price - discountPrice) / price) * 100) : 0;

        // Calculate total lessons and hours from modules
        const totalLessons = Array.isArray(modulesData) ? modulesData.reduce((total, module) => {
            return total + (Array.isArray(module.lessons || module.content) ? (module.lessons || module.content).length : 0);
        }, 0) : 0;

        const totalHours = Math.round(totalLessons * 0.5); // Estimate 30 minutes per lesson

        // Transform reviews data with real API data
        const transformedReviews = Array.isArray(reviewsData) ? reviewsData.map(review => ({
            id: review.id,
            user: {
                name: review.user_name || review.user?.username || review.user?.first_name || review.user?.name || 'مستخدم',
                avatar: getImageUrl(review.user_image || review.user?.profile?.avatar || review.user?.profile_pic || review.avatar),
                id: review.user?.id || null,
            },
            rating: review.rating || 5,
            date: review.created_at ? new Date(review.created_at).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }) : '',
            title: review.title || '',
            content: review.review_text || review.content || review.comment || review.text || '',
            likes: review.like_count || review.helpful_count || review.likes_count || 0,
            isLiked: review.is_liked_by_user || review.is_liked || false,
            isOwner: review.is_owner || false,
            isApproved: review.is_approved !== false,
            ...review
        })) : [];

        // Use rating statistics if available
        const courseRating = ratingStats?.average_rating || apiCourse.average_rating || apiCourse.rating || 0;
        const totalReviews = ratingStats?.review_count || ratingStats?.total_reviews || transformedReviews.length;

        return {
            id: apiCourse.id,
            title: apiCourse.title || apiCourse.name || '',
            subtitle: apiCourse.subtitle || apiCourse.short_description || apiCourse.description?.substring(0, 100) || '',
            description: apiCourse.description || '',
            longDescription: apiCourse.description || apiCourse.long_description || apiCourse.content || '',
            instructor: apiCourse.instructors?.[0]?.name || apiCourse.instructor?.name || apiCourse.teacher?.name || '',
            instructorTitle: apiCourse.instructors?.[0]?.bio || apiCourse.instructor?.title || apiCourse.teacher?.title || '',
            instructorBio: apiCourse.instructors?.[0]?.bio || apiCourse.instructor?.bio || apiCourse.teacher?.bio || '',
            instructorAvatar: getImageUrl(apiCourse.instructors?.[0]?.profile_pic || apiCourse.instructor?.profile_pic || apiCourse.teacher?.profile_pic),
            instructorRating: apiCourse.instructor?.rating || apiCourse.teacher?.rating || 0,
            instructorStudents: apiCourse.instructor?.students_count || apiCourse.teacher?.students_count || apiCourse.total_enrollments || 0,
            instructorCourses: apiCourse.instructor?.courses_count || apiCourse.teacher?.courses_count || 0,
            bannerImage: getImageUrl(apiCourse.image || apiCourse.banner_image || apiCourse.cover_image),
            thumbnail: getImageUrl(apiCourse.image || apiCourse.thumbnail || apiCourse.cover_image),
            category: apiCourse.category?.name || apiCourse.category || '',
            level: apiCourse.level || '',
            duration: apiCourse.duration || `${totalHours} ساعة`,
            totalHours: totalHours,
            lectures: totalLessons,
            resources: apiCourse.resources_count || apiCourse.materials_count || 0,
            students: apiCourse.total_enrollments || apiCourse.students_count || apiCourse.enrollments_count || 0,
            rating: courseRating,
            courseReviews: transformedReviews,
            price: price,
            originalPrice: discountPrice > 0 ? price : price,
            discount: discount,
            isBestseller: apiCourse.is_featured || apiCourse.is_bestseller || false,
            lastUpdated: apiCourse.updated_at ? new Date(apiCourse.updated_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' }) : '',
            language: apiCourse.language || '',
            captions: apiCourse.captions || [],
            features: [],
            isEnrolled: apiCourse.is_enrolled || false,
            planPdfUrl: getFileUrl(apiCourse.timeline_pdf || apiCourse.plan_pdf || apiCourse.plan || apiCourse.syllabus_pdf),
            enrichmentPdfUrl: getFileUrl(apiCourse.enrichment_pdf || apiCourse.resources_pdf || apiCourse.materials_pdf),
            requirements: apiCourse.requirements || apiCourse.prerequisites || [],
            whoIsThisFor: apiCourse.who_is_this_for || apiCourse.target_audience || apiCourse.audience || [],
            modules: transformModulesData(modulesData, apiCourse, isUserEnrolled),
            curriculum: [],
            faqs: []
        };
    };

    // Transform modules data
    const transformModulesData = (modulesData, courseData, isUserEnrolled = false) => {
        console.log('transformModulesData called with:', { modulesData, courseData, isUserEnrolled });

        // Ensure modulesData is an array
        if (!modulesData || !Array.isArray(modulesData)) {
            console.log('modulesData is not an array, using empty array');
            modulesData = [];
        }

        // Organize modules: separate main modules and sub modules
        const mainModules = modulesData.filter(module => !module.submodule);
        const subModules = modulesData.filter(module => module.submodule);
        
        // Group sub modules under their parent modules
        const organizedModules = mainModules.map(mainModule => {
            const relatedSubModules = subModules.filter(subModule => subModule.submodule === mainModule.id);
            
            return {
                ...mainModule,
                submodules: relatedSubModules
            };
        });

        console.log('Organized modules with submodules:', organizedModules);

        // Check if organizedModules has valid content
        const hasValidModules = organizedModules.length > 0;
        
        // For enrolled users, check if modules have actual content
        const hasContent = isUserEnrolled && organizedModules.some(module => {
            const mainLessons = module.lessons || module.content || module.lectures || [];
            const subModulesLessons = module.submodules ? 
                module.submodules.reduce((total, sub) => total + (sub.lessons ? sub.lessons.length : 0), 0) : 0;
            return Array.isArray(mainLessons) && (mainLessons.length > 0 || subModulesLessons > 0);
        });

        // If no valid modules, return empty array
        if (!hasValidModules) {
            console.log('No valid modules found, returning empty modules');
            return [];
        }

        // Always show modules structure, but content availability depends on enrollment
        console.log('User enrolled status:', isUserEnrolled, 'Has valid modules:', hasValidModules);

        const result = organizedModules.map((module, index) => {
            // Transform assignments
            const transformAssignments = (assignments) => {
                if (!Array.isArray(assignments)) return [];

                return assignments.map((assignment, aIndex) => {
                    return {
                        id: `assignment_${assignment.id || aIndex + 1}`,
                        title: assignment.title || `واجب ${aIndex + 1}`,
                        duration: '45:00', // Default assignment duration
                        type: 'assignment',
                        isPreview: false,
                        completed: false,
                        description: assignment.description || '',
                        dueDate: assignment.due_date,
                        points: assignment.points || 100,
                        hasQuestions: assignment.has_questions || false,
                        hasFileUpload: assignment.has_file_upload || false,
                        order: assignment.order || aIndex + 1,
                        isActive: assignment.is_active !== false,
                        ...assignment
                    };
                });
            };

            // Transform quizzes
            const transformQuizzes = (quizzes) => {
                if (!Array.isArray(quizzes)) return [];

                return quizzes.map((quiz, qIndex) => {
                    return {
                        id: `quiz_${quiz.id || qIndex + 1}`,
                        title: quiz.title || `كويز ${qIndex + 1}`,
                        duration: quiz.time_limit ? `${quiz.time_limit}:00` : '20:00',
                        type: 'quiz',
                        isPreview: false,
                        completed: false,
                        description: quiz.description || '',
                        passMark: quiz.pass_mark || 60,
                        totalQuestions: quiz.get_total_questions ? quiz.get_total_questions() : 0,
                        order: quiz.order || qIndex + 1,
                        isActive: quiz.is_active !== false,
                        ...quiz
                    };
                });
            };

            // Transform exams
            const transformExams = (exams) => {
                if (!Array.isArray(exams)) return [];

                return exams.map((exam, eIndex) => {
                    return {
                        id: `exam_${exam.id || eIndex + 1}`,
                        title: exam.title || `امتحان ${eIndex + 1}`,
                        duration: exam.time_limit ? `${exam.time_limit}:00` : '60:00',
                        type: 'exam',
                        isPreview: false,
                        completed: false,
                        description: exam.description || '',
                        passMark: exam.pass_mark || 60,
                        isFinal: exam.is_final || false,
                        order: exam.order || eIndex + 1,
                        isActive: exam.is_active !== false,
                        ...exam
                    };
                });
            };

            // Transform lessons with better type detection for real API data
            const transformLessons = (lessons) => {
                if (!Array.isArray(lessons)) return [];

                return lessons.map((lesson, lIndex) => {
                    // Determine lesson type based on lesson_type field from API
                    let lessonType = lesson.lesson_type || lesson.type || 'video';

                    // Enhanced type detection for Arabic and English content
                    const title = lesson.title?.toLowerCase() || lesson.name?.toLowerCase() || '';

                    if (title.includes('واجب') || title.includes('assignment') || title.includes('homework')) {
                        lessonType = 'assignment';
                    } else if (title.includes('كويز') || title.includes('quiz') || title.includes('test')) {
                        lessonType = 'quiz';
                    } else if (title.includes('امتحان') || title.includes('exam') || title.includes('final')) {
                        lessonType = 'exam';
                    } else if (title.includes('مقال') || title.includes('article') || title.includes('text')) {
                        lessonType = 'article';
                    } else if (title.includes('ملف') || title.includes('file') || title.includes('document')) {
                        lessonType = 'file';
                    } else if (title.includes('مشروع') || title.includes('project')) {
                        lessonType = 'project';
                    } else if (title.includes('تمرين') || title.includes('exercise') || title.includes('practice')) {
                        lessonType = 'exercise';
                    } else if (title.includes('دراسة') || title.includes('case') || title.includes('study')) {
                        lessonType = 'case-study';
                    }

                    // Convert duration from minutes to MM:SS format
                    const formatDuration = (minutes) => {
                        if (!minutes) return '15:00';
                        const hours = Math.floor(minutes / 60);
                        const mins = minutes % 60;
                        return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}:00`;
                    };

                    return {
                        id: lesson.id || lIndex + 1,
                        title: lesson.title || lesson.name || `الدرس ${lIndex + 1}`,
                        duration: formatDuration(lesson.duration_minutes || lesson.duration),
                        type: lessonType,
                        isPreview: lesson.is_free || lesson.is_preview || lesson.isPreview || false,
                        completed: lesson.completed || lesson.is_completed || false,
                        description: lesson.description || '',
                        videoUrl: lesson.video_url || lesson.videoUrl || null,
                        fileUrl: lesson.file_url || lesson.fileUrl || null,
                        content: lesson.content || '',
                        difficulty: lesson.difficulty || 'beginner',
                        order: lesson.order || lIndex + 1,
                        ...lesson
                    };
                });
            };

            // Get lessons, assignments, quizzes, and exams from various possible field names
            const lessons = module.lessons || module.content || module.lectures || [];
            const assignments = module.assignments || [];
            const quizzes = module.quizzes || [];
            const exams = module.exams || [];

            // For non-enrolled users, show placeholder content structure
            if (!isUserEnrolled && lessons.length === 0) {
                // Create placeholder lessons to show module structure
                const placeholderLessons = [
                    {
                        id: `placeholder_${module.id}_1`,
                        title: 'محتوى محمي - يرجى التسجيل في الدورة',
                        duration: '--:--',
                        type: 'locked',
                        isPreview: false,
                        completed: false,
                        description: 'هذا المحتوى متاح فقط للطلاب المسجلين في الدورة',
                        locked: true
                    }
                ];
                
                return {
                    id: module.id || index + 1,
                    title: module.name || module.title || `الوحدة ${index + 1}`,
                    description: module.description || '',
                    duration: formatModuleDuration(module.video_duration || module.duration),
                    lessons: placeholderLessons,
                    submodules: [],
                    order: module.order || index + 1,
                    status: module.status || 'published',
                    isActive: module.is_active !== false,
                    isLocked: true
                };
            }

            console.log(`Module ${module.id || index + 1}:`, {
                lessons: lessons.length,
                assignments: assignments.length,
                quizzes: quizzes.length,
                exams: exams.length
            });

            // Transform all content types
            const transformedLessons = transformLessons(lessons);
            const transformedAssignments = transformAssignments(assignments);
            const transformedQuizzes = transformQuizzes(quizzes);
            const transformedExams = transformExams(exams);

            // Combine all content and sort by order
            let allContent = [
                ...transformedLessons,
                ...transformedAssignments,
                ...transformedQuizzes,
                ...transformedExams
            ].sort((a, b) => (a.order || 0) - (b.order || 0));

            // If no content found, create placeholder content for structure
            if (allContent.length === 0 && isUserEnrolled) {
                console.log(`No content found for module ${module.id || index + 1}, keeping empty`);
            } else if (allContent.length === 0 && !isUserEnrolled) {
                // For non-enrolled users, show placeholder content
                allContent = [
                    {
                        id: `placeholder_${module.id || index + 1}`,
                        title: 'محتوى محمي - يرجى التسجيل في الدورة',
                        duration: '--:--',
                        type: 'locked',
                        isPreview: false,
                        completed: false,
                        description: 'هذا المحتوى متاح فقط للطلاب المسجلين في الدورة',
                        locked: true
                    }
                ];
            }

            // Convert module duration from seconds to readable format
            const formatModuleDuration = (seconds) => {
                if (!seconds) return '1h 00m';
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
            };

            // Transform submodules if they exist
            const transformedSubModules = module.submodules ? module.submodules.map((subModule, subIndex) => {
                const subLessons = subModule.lessons || subModule.content || subModule.lectures || [];
                const subAssignments = subModule.assignments || [];
                const subQuizzes = subModule.quizzes || [];
                const subExams = subModule.exams || [];

                const transformedSubLessons = transformLessons(subLessons);
                const transformedSubAssignments = transformAssignments(subAssignments);
                const transformedSubQuizzes = transformQuizzes(subQuizzes);
                const transformedSubExams = transformExams(subExams);

                const allSubContent = [
                    ...transformedSubLessons,
                    ...transformedSubAssignments,
                    ...transformedSubQuizzes,
                    ...transformedSubExams
                ].sort((a, b) => (a.order || 0) - (b.order || 0));

                return {
                    id: subModule.id || `sub_${subIndex + 1}`,
                    title: subModule.name || subModule.title || `الوحدة الفرعية ${subIndex + 1}`,
                    description: subModule.description || '',
                    duration: formatModuleDuration(subModule.video_duration || subModule.duration),
                    lessons: allSubContent,
                    order: subModule.order || subIndex + 1,
                    status: subModule.status || 'published',
                    isActive: subModule.is_active !== false,
                    isSubModule: true
                };
            }) : [];

            return {
                id: module.id || index + 1,
                title: module.name || module.title || `الوحدة ${index + 1}`,
                description: module.description || '',
                duration: formatModuleDuration(module.video_duration || module.duration),
                lessons: allContent, // Now includes lessons, assignments, quizzes, and exams
                submodules: transformedSubModules, // Include transformed submodules
                order: module.order || index + 1,
                status: module.status || 'published',
                isActive: module.is_active !== false
            };
        });

        console.log('transformModulesData result:', result);
        return result;
    };


    // Toggle module expansion with lazy loading
    const toggleModule = async (moduleId) => {
        const isCurrentlyExpanded = expandedModules[moduleId];
        
        // If expanding and module doesn't have detailed content, load it
        if (!isCurrentlyExpanded && course?.modules) {
            const module = course.modules.find(m => m.id === moduleId);
            
            // Check if module needs detailed content loading
            if (module && (!module.lessons || module.lessons.length === 0)) {
                setLoadingModules(prev => ({ ...prev, [moduleId]: true }));
                
                try {
                    // Load detailed content for this specific module
                    const detailedModule = await loadModuleContent(moduleId);
                    
                    // Update course with detailed module content
                    setCourse(prevCourse => ({
                        ...prevCourse,
                        modules: prevCourse.modules.map(m => 
                            m.id === moduleId ? detailedModule : m
                        )
                    }));
                } catch (error) {
                    console.warn(`Failed to load content for module ${moduleId}:`, error);
                } finally {
                    setLoadingModules(prev => ({ ...prev, [moduleId]: false }));
                }
            }
        }
        
        // Toggle expansion state
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    // Load detailed content for a specific module
    const loadModuleContent = async (moduleId) => {
        try {
            const [lessonsResponse, quizzesResponse] = await Promise.allSettled([
                contentAPI.getLessons({ moduleId: moduleId, courseId: id }),
                api.get(`/api/assignments/quizzes/`, {
                    params: { course: id, module: moduleId }
                }).catch(() => ({ data: [] }))
            ]);

            // Process lessons
            let lessons = [];
            if (lessonsResponse.status === 'fulfilled') {
                const lessonsData = lessonsResponse.value;
                if (Array.isArray(lessonsData)) {
                    lessons = lessonsData;
                } else if (lessonsData && Array.isArray(lessonsData.results)) {
                    lessons = lessonsData.results;
                } else if (lessonsData && Array.isArray(lessonsData.data)) {
                    lessons = lessonsData.data;
                }
            }

            // Process quizzes
            let quizzes = [];
            if (quizzesResponse.status === 'fulfilled') {
                const quizzesData = quizzesResponse.value.data;
                if (Array.isArray(quizzesData)) {
                    quizzes = quizzesData;
                } else if (Array.isArray(quizzesData.results)) {
                    quizzes = quizzesData.results;
                }
            }

            // Find the current module and update it
            const currentModule = course.modules.find(m => m.id === moduleId);
            if (currentModule) {
                return {
                    ...currentModule,
                    lessons,
                    assignments: [],
                    quizzes,
                    exams: []
                };
            }
            
            return currentModule;
        } catch (error) {
            console.warn(`Error loading content for module ${moduleId}:`, error);
            return course.modules.find(m => m.id === moduleId);
        }
    };

    // Preview dialog handlers
    const handleClosePreview = () => setIsPreviewOpen(false);

    // Choose lesson icon by status/type
    const getLessonIcon = (lesson) => {
        if (lesson?.completed) {
            return <CheckCircle htmlColor="#333679" />;
        }
        if (lesson?.type === 'locked' || lesson?.locked) {
            return <LockIcon htmlColor="#ff9800" />;
        }
        if (lesson?.type === 'video') {
            return <VideoIcon htmlColor="#333679" />;
        }
        if (lesson?.type === 'article') {
            return <InsertDriveFileIcon htmlColor="#4DBFB3" />;
        }
        if (lesson?.type === 'quiz') {
            return <QuizIconFilled htmlColor="#333679" />;
        }
        if (lesson?.type === 'assignment') {
            return <AssignmentIcon htmlColor="#4DBFB3" />;
        }
        if (lesson?.type === 'exam') {
            return <QuizIcon htmlColor="#333679" />;
        }
        if (lesson?.type === 'file') {
            return <DownloadIcon htmlColor="#4DBFB3" />;
        }
        if (lesson?.type === 'project') {
            return <CodeIcon htmlColor="#333679" />;
        }
        if (lesson?.type === 'exercise') {
            return <AssignmentTurnedInIcon htmlColor="#4DBFB3" />;
        }
        if (lesson?.type === 'case-study') {
            return <InfoIcon htmlColor="#333679" />;
        }
        if (lesson?.isPreview) {
            return <PlayCircleOutline htmlColor="#333679" />;
        }
        return <DescriptionOutlined htmlColor="#333679" />;
    };


    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Review handlers
    const handleReviewFormChange = (field, value) => {
        setReviewForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmitReview = async () => {
        if (!reviewForm.comment.trim()) {
            alert('يرجى كتابة تعليق للتقييم');
            return;
        }

        try {
            setSubmittingReview(true);

            // Transform data to match API expectations
            const reviewData = {
                rating: reviewForm.rating,
                review_text: reviewForm.comment
            };

            console.log('=== REVIEW SUBMISSION DEBUG ===');
            console.log('Original reviewForm:', reviewForm);
            console.log('Transformed reviewData:', reviewData);
            console.log('Course ID:', id);
            console.log('================================');

            const response = await reviewsAPI.createReview(id, reviewData);
            console.log('Review submitted successfully:', response);

            // Show success message
            alert('تم إضافة تقييمك بنجاح!');

            // Reset form and close
            setReviewForm({ rating: 5, comment: '' });
            setShowReviewForm(false);

            // Refresh course data to show new review
            window.location.reload();
        } catch (error) {
            console.error('Error submitting review:', error);
            let errorMessage = 'فشل في إضافة التقييم';

            if (error.response) {
                if (error.response.status === 403) {
                    errorMessage = 'يجب أن تكون مسجلاً في الدورة لتتمكن من تقييمها';
                } else if (error.response.status === 400) {
                    errorMessage = error.response.data?.error || 'بيانات التقييم غير صحيحة';
                } else if (error.response.data?.error) {
                    errorMessage = error.response.data.error;
                }
            }

            alert(errorMessage);
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleLikeReview = async (reviewId) => {
        try {
            console.log('Liking review:', reviewId);
            const response = await reviewsAPI.likeReview(reviewId);
            console.log('Like response:', response);

            // Update the specific review's like status without reloading
            setCourse(prevData => ({
                ...prevData,
                reviews: prevData.reviews.map(review =>
                    review.id === reviewId
                        ? {
                            ...review,
                            likes: response.liked ? review.likes + 1 : review.likes - 1,
                            isLiked: response.liked
                        }
                        : review
                )
            }));
        } catch (error) {
            console.error('Error liking review:', error);
            alert('فشل في إعجاب التقييم');
        }
    };


    // Handle adding course to cart
    const handleAddToCart = async () => {
        try {
            setIsAddingToCart(true);
            // Add course to cart via API
            const response = await cartAPI.addToCart(course.id);
            console.log('Added to cart:', response);

            // Show success message
            alert('تم إضافة الدورة إلى السلة بنجاح!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            let errorMessage = 'حدث خطأ أثناء إضافة الدورة إلى السلة';

            if (error.response) {
                if (error.response.data?.detail) {
                    errorMessage = error.response.data.detail;
                } else if (error.response.data?.error) {
                    errorMessage = error.response.data.error;
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            }

            alert(errorMessage);
        } finally {
            setIsAddingToCart(false);
        }
    };

    // Show loading skeleton while loading
    if (loading) {
        return (
            <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header />
                <CourseSkeleton />
                <Box sx={{ mt: 'auto' }}>
                    <Footer />
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ 
                py: { xs: 4, sm: 6, md: 8 }, 
                px: { xs: 2, sm: 3, md: 4 },
                textAlign: 'center' 
            }}>
                <Alert severity="error" sx={{ 
                    mb: { xs: 3, sm: 4 },
                    p: { xs: 2, sm: 3 },
                    borderRadius: { xs: 2, sm: 3 }
                }}>
                    <Typography variant="h6" gutterBottom sx={{
                        fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                    }}>
                        خطأ في تحميل الدورة
                    </Typography>
                    <Typography variant="body1" sx={{
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        lineHeight: 1.6
                    }}>
                        {error}
                    </Typography>
                </Alert>
                <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 1, sm: 2 }, 
                    justifyContent: 'center', 
                    flexWrap: 'wrap',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' }
                }}>
                    {!isAuthenticated && error.includes('تسجيل الدخول') && (
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            component={Link}
                            to="/login"
                            fullWidth={window.innerWidth < 600}
                            sx={{
                                px: { xs: 2, sm: 4 },
                                py: { xs: 1.5, sm: 1.5 },
                                borderRadius: 3,
                                background: 'linear-gradient(45deg, #333679, #1a6ba8)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1a6ba8, #333679)',
                                },
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                fontWeight: 600
                            }}
                        >
                            تسجيل الدخول
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        color="primary"
                        size="large"
                        onClick={() => window.location.reload()}
                        startIcon={<ArrowBack />}
                        fullWidth={window.innerWidth < 600}
                        sx={{
                            px: { xs: 2, sm: 4 },
                            py: { xs: 1.5, sm: 1.5 },
                            borderRadius: 3,
                            textTransform: 'none',
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            fontWeight: 600
                        }}
                    >
                        حاول مرة أخرى
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        size="large"
                        onClick={() => navigate('/courses')}
                        fullWidth={window.innerWidth < 600}
                        sx={{
                            px: { xs: 2, sm: 4 },
                            py: { xs: 1.5, sm: 1.5 },
                            borderRadius: 3,
                            textTransform: 'none',
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            fontWeight: 600
                        }}
                    >
                        تصفح الدورات
                    </Button>
                </Box>
            </Container>
        );
    }

    if (!course) {
        return (
            <Container maxWidth="lg" sx={{ 
                py: { xs: 4, sm: 6, md: 8 }, 
                px: { xs: 2, sm: 3, md: 4 },
                textAlign: 'center' 
            }}>
                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                    }}>
                        الدورة غير موجودة
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph sx={{
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        lineHeight: 1.6
                    }}>
                        الدورة التي تبحث عنها غير موجودة أو تم حذفها.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => navigate('/courses')}
                    startIcon={<ArrowBack />}
                    fullWidth={window.innerWidth < 600}
                    sx={{
                        px: { xs: 2, sm: 4 },
                        py: { xs: 1.5, sm: 1.5 },
                        borderRadius: 3,
                        textTransform: 'none',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        fontWeight: 600
                    }}
                >
                    تصفح جميع الدورات
                </Button>
            </Container>
        );
    }

    const totalLessons = Array.isArray(course.modules) ? course.modules.reduce((total, module) => total + (Array.isArray(module.lessons) ? module.lessons.length : 0), 0) : 0;
    const completedLessons = Array.isArray(course.modules) ? course.modules.flatMap(m => Array.isArray(m.lessons) ? m.lessons : []).filter(l => l.completed).length : 0;
    const progress = Math.round((completedLessons / totalLessons) * 100) || 0;

    return (
        <Box sx={{ 
            bgcolor: 'background.default', 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            position: 'relative',
            width: '100%',
            maxWidth: '100vw',
            overflowX: 'hidden',
            // إضافة مسافة إضافية من الأعلى لضمان عدم التداخل مع الـ header
            paddingTop: { xs: '80px', sm: '90px', md: '100px' }
        }}>
            <AnimatedBackground>
                <FloatingShape />
                <FloatingShape style={{ 
                    width: '200px', 
                    height: '200px', 
                    bottom: '20%', 
                    right: '15%', 
                    animationDelay: '5s',
                    '@media (max-width: 768px)': {
                        width: '120px',
                        height: '120px',
                        bottom: '15%',
                        right: '10%',
                    }
                }} />
                <FloatingShape style={{ 
                    width: '250px', 
                    height: '250px', 
                    top: '30%', 
                    left: '15%', 
                    animationDelay: '7s',
                    '@media (max-width: 768px)': {
                        width: '150px',
                        height: '150px',
                        top: '25%',
                        left: '10%',
                    }
                }} />
            </AnimatedBackground>
            {/* Header */}
            <Header pageType="course-detail" />

            {/* Course Banner */}
            <CourseDetailBanner
                course={course}
            />

            {/* Course Promotional Video */}
            <Container maxWidth="lg" sx={{ 
                mt: { xs: 2, sm: 3, md: 4 }, 
                mb: { xs: 2, sm: 3, md: 4 },
                px: { xs: 1, sm: 2, md: 3 }
            }}>
                <CoursePromotionalVideo course={course} />
            </Container>

            {/* Course Detail Card with Image */}
            <CourseDetailCard
                course={course}
                isAddingToCart={isAddingToCart}
                handleAddToCart={handleAddToCart}
            />

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onClose={handleClosePreview} maxWidth="md" fullWidth>
                <DialogContent sx={{ p: 0 }}>
                    <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                        <Box
                            component="iframe"
                            src={course?.previewUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                            title="Course Preview"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            sx={{
                                border: 0,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%'
                            }}
                        />
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Main Content - Single Column Layout - Right Aligned */}
            <Box sx={{ 
                bgcolor: '#ffffff', 
                minHeight: { xs: 'auto', sm: '10vh', md: '15vh', lg: '20vh', xl: '30vh' },
                width: '100%',
                maxWidth: '100vw',
                overflowX: 'hidden'
            }}>
                <Container maxWidth="lg" sx={{ 
                    py: { xs: 1, sm: 2, md: 3 }, 
                    px: { xs: 1, sm: 2, md: 3, lg: 4 }
                }}>
                    {/* Single Column Layout - All components start from right */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: { xs: 1, sm: 1.5, md: 2 },
                        maxWidth: '1200px',
                        margin: '0 auto',
                        direction: 'rtl', // Right to left direction
                        width: '100%'
                    }}>
                        {/* Navigation Tabs */}
                        <Box sx={{ width: '100%' }}>
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                allowScrollButtonsMobile
                                sx={{
                                    '& .MuiTab-root': {
                                        minHeight: { xs: 45, sm: 50, md: 55 },
                                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                                        fontWeight: 500,
                                        textTransform: 'none',
                                        backgroundColor: '#f8f9fa',
                                        color: '#6c757d',
                                        borderTopLeftRadius: '8px',
                                        borderTopRightRadius: '8px',
                                        borderBottom: 'none',
                                        px: { xs: 1, sm: 1.5, md: 2 },
                                        py: { xs: 0.5, sm: 1, md: 1.5 },
                                        '&.Mui-selected': {
                                            color: '#ffffff',
                                            backgroundColor: '#495057',
                                            fontWeight: 600
                                        },
                                        '&:not(:last-child)': {
                                            marginRight: '2px'
                                        }
                                    },
                                    '& .MuiTabs-indicator': {
                                        display: 'none'
                                    },
                                    '& .MuiTabs-scrollButtons': {
                                        '&.Mui-disabled': {
                                            opacity: 0.3
                                        }
                                    }
                                }}
                            >
                                <Tab
                                    label="الوصف"
                                    icon={<DescriptionOutlined sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, mr: { xs: 0.5, sm: 1 } }} />}
                                    iconPosition="start"
                                />
                                <Tab
                                    label="محتوى الدورة"
                                    icon={<VideoLibraryIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, mr: { xs: 0.5, sm: 1 } }} />}
                                    iconPosition="start"
                                />
                                <Tab
                                    label="العرض التوضيحي"
                                    icon={<PlayCircleOutline sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, mr: { xs: 0.5, sm: 1 } }} />}
                                    iconPosition="start"
                                />
                                <Tab
                                    label="التقييمات"
                                    icon={<StarIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, mr: { xs: 0.5, sm: 1 } }} />}
                                    iconPosition="start"
                                />
                            </Tabs>
                        </Box>

                        {/* Tab Content */}
                        <Box sx={{ 
                            width: '100%',
                            mt: { xs: 1, sm: 1.5, md: 2 }
                        }}>
                            {tabValue === 0 && (
                                <CourseDescriptionTab
                                    course={course}
                                    totalLessons={totalLessons}
                                />
                            )}

                            {tabValue === 1 && (
                                <CourseContentTab
                                    course={course}
                                    totalLessons={totalLessons}
                                    expandedModules={expandedModules}
                                    toggleModule={toggleModule}
                                    getLessonIcon={getLessonIcon}
                                    loadingModules={loadingModules}
                                />
                            )}

                            {tabValue === 2 && (
                                <CourseDemoTab
                                    course={course}
                                />
                            )}

                            {tabValue === 3 && (
                                <CourseReviewsTab
                                    course={course}
                                    setShowReviewForm={setShowReviewForm}
                                    handleLikeReview={handleLikeReview}
                                    isAuthenticated={isAuthenticated}
                                />
                            )}
                        </Box>
                    </Box>
                </Container>
            </Box>




            {/* Review Form Dialog */}
            <Dialog
                open={showReviewForm}
                onClose={() => setShowReviewForm(false)}
                maxWidth="sm"
                fullWidth
                fullScreen={false}
                PaperProps={{
                    sx: {
                        borderRadius: { xs: 2, sm: 3 },
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(14, 81, 129, 0.1)',
                        direction: 'rtl',
                        m: { xs: 2, sm: 3, md: 4 },
                        maxHeight: { xs: '90vh', sm: '80vh', md: '70vh' },
                        width: { xs: '95%', sm: '90%', md: 'auto' }
                    }
                }}
            >
                <DialogContent sx={{ 
                    p: { xs: 2, sm: 3, md: 4 }, 
                    direction: 'rtl',
                    maxHeight: { xs: '80vh', sm: '70vh', md: '60vh' },
                    overflowY: 'auto'
                }}>
                    <Typography variant="h5" component="h2" sx={{ 
                        mb: { xs: 2, sm: 3 }, 
                        fontWeight: 700, 
                        textAlign: 'center',
                        fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.75rem' }
                    }}>
                        تقييم الدورة
                    </Typography>

                    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                        <Typography variant="subtitle1" sx={{ 
                            mb: { xs: 1, sm: 2 }, 
                            fontWeight: 600, 
                            textAlign: 'right',
                            fontSize: { xs: '0.9rem', sm: '1rem' }
                        }}>
                            تقييمك للدورة
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Rating
                                value={reviewForm.rating}
                                onChange={(event, newValue) => {
                                    handleReviewFormChange('rating', newValue);
                                }}
                                size="large"
                                sx={{
                                    direction: 'ltr',
                                    '& .MuiRating-iconFilled': {
                                        color: '#4DBFB3',
                                    },
                                    '& .MuiRating-iconHover': {
                                        color: '#4DBFB3',
                                    },
                                    '& .MuiRating-icon': {
                                        fontSize: { xs: '1.8rem', sm: '2rem', md: '2.2rem' }
                                    },
                                }}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                        <Typography variant="subtitle1" sx={{ 
                            mb: { xs: 1, sm: 2 }, 
                            fontWeight: 600, 
                            textAlign: 'right',
                            fontSize: { xs: '0.9rem', sm: '1rem' }
                        }}>
                            تعليقك (اختياري)
                        </Typography>
                        <textarea
                            value={reviewForm.comment}
                            onChange={(e) => handleReviewFormChange('comment', e.target.value)}
                            placeholder="اكتب تعليقك عن الدورة..."
                            style={{
                                width: '100%',
                                minHeight: window.innerWidth < 600 ? '100px' : '120px',
                                padding: window.innerWidth < 600 ? '8px' : '12px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: window.innerWidth < 600 ? '13px' : '14px',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                direction: 'rtl',
                                textAlign: 'right',
                                boxSizing: 'border-box'
                            }}
                        />
                    </Box>

                    <Box sx={{ 
                        display: 'flex', 
                        gap: { xs: 1, sm: 2 }, 
                        justifyContent: 'flex-start', 
                        flexDirection: { xs: 'column', sm: 'row-reverse' },
                        alignItems: { xs: 'stretch', sm: 'center' }
                    }}>
                        <Button
                            variant="outlined"
                            onClick={() => setShowReviewForm(false)}
                            disabled={submittingReview}
                            fullWidth={window.innerWidth < 600}
                            sx={{
                                borderColor: '#333679',
                                color: '#333679',
                                '&:hover': {
                                    borderColor: '#4DBFB3',
                                    color: '#4DBFB3',
                                },
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                py: { xs: 1.5, sm: 1 },
                                px: { xs: 2, sm: 3 },
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                order: { xs: 2, sm: 1 }
                            }}
                        >
                            إلغاء
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmitReview}
                            disabled={submittingReview || !reviewForm.comment.trim()}
                            fullWidth={window.innerWidth < 600}
                            endIcon={submittingReview ? <CircularProgress size={20} color="inherit" /> : null}
                            sx={{
                                background: 'linear-gradient(135deg, #333679 0%, #4DBFB3 100%)',
                                color: 'white',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #4DBFB3 0%, #333679 100%)',
                                    color: 'white',
                                },
                                '&:disabled': {
                                    color: 'white',
                                },
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                py: { xs: 1.5, sm: 1 },
                                px: { xs: 2, sm: 3 },
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                order: { xs: 1, sm: 2 }
                            }}
                        >
                            {submittingReview ? 'جاري الإرسال...' : 'إرسال التقييم'}
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>


            {/* Footer */}
            <Box sx={{ mt: 'auto' }}>
                <Footer />
            </Box>
        </Box>
    );
};

export default CourseDetail;