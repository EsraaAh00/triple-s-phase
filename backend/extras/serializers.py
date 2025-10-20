from rest_framework import serializers
from .models import Banner, CourseCollection, PrivacyPolicy, TermsAndConditions, RefundingFAQ, ContactInfo, Partnership, ContactMessage, CardImage
from courses.serializers import CourseBasicSerializer


class BannerSerializer(serializers.ModelSerializer):
    """Serializer for Banner model"""
    image_url = serializers.SerializerMethodField()
    is_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Banner
        fields = [
            'id', 'title', 'title_ar', 'description', 'description_ar',
            'image', 'image_url', 'url', 'is_active', 'banner_type', 'display_order',
            'start_date', 'end_date', 'button_text', 'button_text_ar', 'button_url',
            'background_color', 'text_color', 'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None


class BannerByTypeSerializer(serializers.ModelSerializer):
    """Simplified serializer for banners by type"""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Banner
        fields = [
            'id', 'title', 'title_ar', 'description', 'description_ar',
            'image_url', 'url', 'banner_type', 'display_order',
            'button_text', 'button_text_ar', 'button_url',
            'background_color', 'text_color'
        ]
    
    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None


class CourseCollectionListSerializer(serializers.ModelSerializer):
    """Serializer for listing course collections"""
    course_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = CourseCollection
        fields = [
            'id', 'name', 'name_ar', 'slug', 'description', 'description_ar',
            'is_featured', 'display_order', 'course_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')
        lookup_field = 'slug'
        extra_kwargs = {
            'url': {'lookup_field': 'slug'}
        }


class CourseCollectionDetailSerializer(CourseCollectionListSerializer):
    """Detailed serializer for course collections with nested courses"""
    courses = CourseBasicSerializer(many=True, read_only=True)
    
    class Meta(CourseCollectionListSerializer.Meta):
        fields = CourseCollectionListSerializer.Meta.fields + ['courses']


class PrivacyPolicySerializer(serializers.ModelSerializer):
    """Serializer for Privacy Policy"""
    
    class Meta:
        model = PrivacyPolicy
        fields = ['id', 'title', 'title_ar', 'content', 'content_ar', 'is_active', 'last_updated', 'created_at']
        read_only_fields = ('last_updated', 'created_at')


class TermsAndConditionsSerializer(serializers.ModelSerializer):
    """Serializer for Terms and Conditions"""
    
    class Meta:
        model = TermsAndConditions
        fields = ['id', 'title', 'title_ar', 'content', 'content_ar', 'is_active', 'last_updated', 'created_at']
        read_only_fields = ('last_updated', 'created_at')


class RefundingFAQSerializer(serializers.ModelSerializer):
    """Serializer for Refunding FAQ"""
    
    class Meta:
        model = RefundingFAQ
        fields = ['id', 'question', 'question_ar', 'answer', 'answer_ar', 'display_order', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')


class ContactInfoSerializer(serializers.ModelSerializer):
    """Serializer for Contact Info"""
    
    class Meta:
        model = ContactInfo
        fields = [
            'id', 'title', 'title_ar', 'description', 'description_ar',
            'email', 'phone', 'address', 'address_ar',
            'facebook', 'twitter', 'instagram', 'linkedin', 'youtube',
            'working_hours', 'working_hours_ar', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')


class PartnershipSerializer(serializers.ModelSerializer):
    """Serializer for Partnership"""
    logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Partnership
        fields = [
            'id', 'name', 'name_ar', 'logo', 'logo_url', 'website',
            'display_order', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None


class ContactMessageSerializer(serializers.ModelSerializer):
    """Serializer for Contact Messages"""
    
    class Meta:
        model = ContactMessage
        fields = [
            'id', 'name', 'email', 'phone', 'subject', 'message',
            'status', 'is_urgent', 'admin_response', 'admin_response_date',
            'ip_address', 'user_agent', 'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at', 'ip_address', 'user_agent', 'status', 'admin_response_date')
    
    def create(self, validated_data):
        """Create a new contact message with IP and user agent tracking"""
        request = self.context.get('request')
        if request:
            validated_data['ip_address'] = self.get_client_ip(request)
            validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        
        return super().create(validated_data)
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class ContactMessageCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating contact messages"""
    
    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'phone', 'subject', 'message']
    
    def create(self, validated_data):
        """Create a new contact message with IP and user agent tracking"""
        request = self.context.get('request')
        if request:
            validated_data['ip_address'] = self.get_client_ip(request)
            validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        
        return super().create(validated_data)
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class CardImageSerializer(serializers.ModelSerializer):
    """Serializer for CardImage model"""
    image_1_url = serializers.SerializerMethodField()
    image_2_url = serializers.SerializerMethodField()
    image_3_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CardImage
        fields = [
            'id', 'title', 'title_ar', 'description', 'description_ar',
            'image_1', 'image_1_url', 'image_2', 'image_2_url', 
            'image_3', 'image_3_url', 'display_order', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_image_1_url(self, obj):
        if obj.image_1:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_1.url)
            return obj.image_1.url
        return None
    
    def get_image_2_url(self, obj):
        if obj.image_2:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_2.url)
            return obj.image_2.url
        return None
    
    def get_image_3_url(self, obj):
        if obj.image_3:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_3.url)
            return obj.image_3.url
        return None