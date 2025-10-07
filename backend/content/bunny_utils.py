"""
Bunny CDN integration utilities for video management
"""
import requests
import logging
from django.conf import settings
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


class BunnyCDNClient:
    """
    Client for interacting with Bunny CDN API
    """
    
    def __init__(self):
        self.api_key = getattr(settings, 'BUNNY_CDN_API_KEY', None)
        self.library_id = getattr(settings, 'BUNNY_CDN_LIBRARY_ID', None)
        self.token_auth_key = getattr(settings, 'BUNNY_CDN_TOKEN_AUTH_KEY', None)
        self.base_url = f"https://video.bunnycdn.com/library/{self.library_id}"
        self.headers = {
            'AccessKey': self.api_key,
            'Content-Type': 'application/json'
        }
    
    def get_video_info(self, video_id: str) -> Optional[Dict[str, Any]]:
        """
        Get video information from Bunny CDN
        
        Args:
            video_id (str): The Bunny CDN video ID
            
        Returns:
            Dict containing video information or None if not found
        """
        if not self.api_key or not self.library_id:
            logger.warning("Bunny CDN API key or Library ID not configured")
            return None
            
        try:
            url = f"{self.base_url}/videos/{video_id}"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                logger.warning(f"Video {video_id} not found on Bunny CDN")
                return None
            else:
                logger.error(f"Error fetching video {video_id}: {response.status_code} - {response.text}")
                return None
                
        except requests.RequestException as e:
            logger.error(f"Request error fetching video {video_id}: {str(e)}")
            return None
    
    def get_video_url(self, video_id: str) -> Optional[str]:
        """
        Get the streaming URL for a video
        
        Args:
            video_id (str): The Bunny CDN video ID
            
        Returns:
            Streaming URL or None if not found
        """
        video_info = self.get_video_info(video_id)
        if video_info and 'playableUrl' in video_info:
            return video_info['playableUrl']
        return None
    
    def validate_video_id(self, video_id: str) -> bool:
        """
        Validate if a video ID exists on Bunny CDN
        
        Args:
            video_id (str): The Bunny CDN video ID
            
        Returns:
            True if video exists, False otherwise
        """
        return self.get_video_info(video_id) is not None
    
    def get_video_thumbnail(self, video_id: str) -> Optional[str]:
        """
        Get thumbnail URL for a video
        
        Args:
            video_id (str): The Bunny CDN video ID
            
        Returns:
            Thumbnail URL or None if not found
        """
        video_info = self.get_video_info(video_id)
        if video_info and 'thumbnailFileName' in video_info:
            # Construct thumbnail URL based on Bunny CDN structure
            return f"https://iframe.mediadelivery.net/embed/{self.library_id}/{video_id}?autoplay=false&loop=false&muted=false&responsive=true&startTime=0"
        return None


def get_bunny_video_url(video_id: str) -> Optional[str]:
    """
    Convenience function to get Bunny CDN video URL
    
    Args:
        video_id (str): The Bunny CDN video ID
        
    Returns:
        Video URL or None if not found
    """
    client = BunnyCDNClient()
    return client.get_video_url(video_id)


def validate_bunny_video_id(video_id: str) -> bool:
    """
    Convenience function to validate Bunny CDN video ID
    
    Args:
        video_id (str): The Bunny CDN video ID
        
    Returns:
        True if valid, False otherwise
    """
    client = BunnyCDNClient()
    return client.validate_video_id(video_id)


def get_bunny_embed_url(video_id: str, autoplay: bool = False, loop: bool = False, 
                       muted: bool = False, start_time: int = 0) -> str:
    """
    Generate Bunny CDN embed URL for iframe
    
    Args:
        video_id (str): The Bunny CDN video ID
        autoplay (bool): Whether to autoplay the video
        loop (bool): Whether to loop the video
        muted (bool): Whether to start muted
        start_time (int): Start time in seconds
        
    Returns:
        Embed URL for iframe
    """
    library_id = getattr(settings, 'BUNNY_CDN_LIBRARY_ID', '')
    if not library_id:
        return ""
    
    params = {
        'autoplay': str(autoplay).lower(),
        'loop': str(loop).lower(),
        'muted': str(muted).lower(),
        'responsive': 'true',
        'startTime': str(start_time)
    }
    
    param_string = '&'.join([f"{k}={v}" for k, v in params.items()])
    return f"https://iframe.mediadelivery.net/embed/{library_id}/{video_id}?{param_string}"


def get_bunny_direct_url(video_id: str) -> str:
    """
    Generate direct streaming URL for video
    
    Args:
        video_id (str): The Bunny CDN video ID
        
    Returns:
        Direct streaming URL
    """
    cdn_hostname = getattr(settings, 'BUNNY_CDN_CONFIG', {}).get('CDN_HOSTNAME', '')
    if not cdn_hostname:
        return ""
    
    return f"https://{cdn_hostname}/{video_id}/play_720p.mp4"


def get_bunny_private_url(video_id: str, user_id: int = None, expires_in: int = 3600) -> str:
    """
    Generate private streaming URL with token authentication
    
    Args:
        video_id (str): The Bunny CDN video ID
        user_id (int): User ID for additional security (optional)
        expires_in (int): Token expiration time in seconds (default: 1 hour)
        
    Returns:
        Private streaming URL with token authentication
    """
    import time
    import hashlib
    import hmac
    
    cdn_hostname = getattr(settings, 'BUNNY_CDN_CONFIG', {}).get('CDN_HOSTNAME', '')
    token_auth_key = getattr(settings, 'BUNNY_CDN_TOKEN_AUTH_KEY', None)
    
    if not cdn_hostname or not token_auth_key:
        return ""
    
    # Generate token
    expires = int(time.time()) + expires_in
    token_data = f"{video_id}:{expires}"
    if user_id:
        token_data += f":{user_id}"
    
    # Create HMAC signature
    signature = hmac.new(
        token_auth_key.encode('utf-8'),
        token_data.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    # Create token
    token = f"{expires}:{signature}"
    if user_id:
        token += f":{user_id}"
    
    return f"https://{cdn_hostname}/{video_id}/play_720p.mp4?token={token}"


def get_bunny_private_embed_url(video_id: str, user_id: int = None, expires_in: int = 3600, 
                               autoplay: bool = False, loop: bool = False, 
                               muted: bool = False, start_time: int = 0) -> str:
    """
    Generate private embed URL with token authentication
    
    Args:
        video_id (str): The Bunny CDN video ID
        user_id (int): User ID for additional security (optional)
        expires_in (int): Token expiration time in seconds (default: 1 hour)
        autoplay (bool): Whether to autoplay the video
        loop (bool): Whether to loop the video
        muted (bool): Whether to start muted
        start_time (int): Start time in seconds
        
    Returns:
        Private embed URL with token authentication
    """
    import time
    import hashlib
    import hmac
    
    library_id = getattr(settings, 'BUNNY_CDN_LIBRARY_ID', '')
    token_auth_key = getattr(settings, 'BUNNY_CDN_TOKEN_AUTH_KEY', None)
    
    if not library_id or not token_auth_key:
        return ""
    
    # Generate token
    expires = int(time.time()) + expires_in
    token_data = f"{video_id}:{expires}"
    if user_id:
        token_data += f":{user_id}"
    
    # Create HMAC signature
    signature = hmac.new(
        token_auth_key.encode('utf-8'),
        token_data.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    # Create token
    token = f"{expires}:{signature}"
    if user_id:
        token += f":{user_id}"
    
    params = {
        'autoplay': str(autoplay).lower(),
        'loop': str(loop).lower(),
        'muted': str(muted).lower(),
        'responsive': 'true',
        'startTime': str(start_time),
        'token': token
    }
    
    param_string = '&'.join([f"{k}={v}" for k, v in params.items()])
    return f"https://iframe.mediadelivery.net/embed/{library_id}/{video_id}?{param_string}"


# Model helper functions
def update_module_bunny_video(module, video_id: str) -> bool:
    """
    Update module with Bunny CDN video information
    
    Args:
        module: Module instance
        video_id (str): Bunny CDN video ID
        
    Returns:
        True if successful, False otherwise
    """
    try:
        client = BunnyCDNClient()
        video_info = client.get_video_info(video_id)
        
        if video_info:
            module.bunny_video_id = video_id
            # No need to store bunny_video_url anymore, we generate it from video_id
            
            # Update video duration if available
            if 'length' in video_info:
                module.video_duration = video_info['length']
            
            module.save()
            return True
        else:
            logger.error(f"Could not fetch video info for {video_id}")
            return False
            
    except Exception as e:
        logger.error(f"Error updating module with Bunny video {video_id}: {str(e)}")
        return False


def update_lesson_bunny_video(lesson, video_id: str) -> bool:
    """
    Update lesson with Bunny CDN video information
    
    Args:
        lesson: Lesson instance
        video_id (str): Bunny CDN video ID
        
    Returns:
        True if successful, False otherwise
    """
    try:
        client = BunnyCDNClient()
        video_info = client.get_video_info(video_id)
        
        if video_info:
            lesson.bunny_video_id = video_id
            # No need to store bunny_video_url anymore, we generate it from video_id
            
            # Update duration if available
            if 'length' in video_info:
                lesson.duration_minutes = video_info['length'] // 60  # Convert to minutes
            
            lesson.save()
            return True
        else:
            logger.error(f"Could not fetch video info for {video_id}")
            return False
            
    except Exception as e:
        logger.error(f"Error updating lesson with Bunny video {video_id}: {str(e)}")
        return False


def update_course_bunny_promotional_video(course, video_id: str) -> bool:
    """
    Update course with Bunny CDN promotional video information
    
    Args:
        course: Course instance
        video_id (str): Bunny CDN video ID
        
    Returns:
        True if successful, False otherwise
    """
    try:
        client = BunnyCDNClient()
        video_info = client.get_video_info(video_id)
        
        if video_info:
            course.bunny_promotional_video_id = video_id
            course.bunny_promotional_video_url = video_info.get('playableUrl', '')
            
            course.save()
            return True
        else:
            logger.error(f"Could not fetch video info for {video_id}")
            return False
            
    except Exception as e:
        logger.error(f"Error updating course with Bunny promotional video {video_id}: {str(e)}")
        return False
