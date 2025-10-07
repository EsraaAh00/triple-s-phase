import json
from datetime import datetime, timedelta

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import Meeting, MeetingParticipant, MeetingRecording
from .serializers import (
    MeetingSerializer, MeetingDetailSerializer, MeetingCreateSerializer,
    MeetingUpdateSerializer, MeetingParticipantSerializer,
    MeetingRecordingSerializer, MeetingInvitationSerializer
)
from courses.models import Course
from users.models import User

class MeetingBaseView:
    """Base view for meeting functionality"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'course', 'host']
    ordering_fields = ['start_time', 'duration', 'created_at']
    ordering = ['-start_time']


class MeetingListView(MeetingBaseView, generics.ListCreateAPIView):
    """List and create meetings"""
    serializer_class = MeetingSerializer
    
    def get_queryset(self):
        # Show meetings where user is host or participant
        return Meeting.objects.filter(
            Q(host=self.request.user) | 
            Q(participants__user=self.request.user)
        ).distinct().select_related('host', 'course')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MeetingCreateSerializer
        return MeetingSerializer
    
    def perform_create(self, serializer):
        serializer.save(host=self.request.user)


class MeetingDetailView(MeetingBaseView, generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a meeting"""
    serializer_class = MeetingDetailSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        # Only allow access to hosts and participants
        return Meeting.objects.filter(
            Q(host=self.request.user) | 
            Q(participants__user=self.request.user)
        ).distinct()
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return MeetingUpdateSerializer
        return MeetingDetailSerializer
    
    def perform_update(self, serializer):
        # Only host can update meeting
        if serializer.instance.host != self.request.user:
            raise permissions.PermissionDenied(
                "Only the meeting host can update this meeting."
            )
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only host can delete meeting
        if instance.host != self.request.user:
            raise permissions.PermissionDenied(
                "Only the meeting host can delete this meeting."
            )
        instance.delete()


class MeetingJoinView(APIView):
    """Join a meeting"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, meeting_id):
        meeting = get_object_or_404(Meeting, id=meeting_id)
        
        # Check if meeting has started or is about to start soon
        if meeting.start_time > timezone.now() + timedelta(minutes=15):
            return Response(
                {"detail": "Meeting has not started yet. Please wait until the scheduled time."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if meeting has ended
        if meeting.end_time and meeting.end_time < timezone.now():
            return Response(
                {"detail": "This meeting has already ended."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add user as participant if not already added
        participant, created = MeetingParticipant.objects.get_or_create(
            meeting=meeting,
            user=request.user,
            defaults={'joined_at': timezone.now()}
        )
        
        # Generate meeting join URL (integration with Zoom/Google Meet would go here)
        join_url = f"https://meet.example.com/{meeting.id}?token={participant.id}"
        
        return Response({
            'status': 'success',
            'join_url': join_url,
            'meeting': MeetingDetailSerializer(meeting).data
        })


class MeetingParticipantListView(generics.ListAPIView):
    """List participants of a meeting"""
    serializer_class = MeetingParticipantSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        meeting_id = self.kwargs['meeting_id']
        return MeetingParticipant.objects.filter(
            meeting_id=meeting_id,
            meeting__host=self.request.user  # Only host can view participants
        ).select_related('user__profile')


class MeetingRecordingListView(generics.ListCreateAPIView):
    """List and create meeting recordings"""
    serializer_class = MeetingRecordingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        meeting_id = self.kwargs['meeting_id']
        return MeetingRecording.objects.filter(
            meeting_id=meeting_id,
            meeting__host=self.request.user  # Only host can manage recordings
        )
    
    def perform_create(self, serializer):
        meeting = get_object_or_404(Meeting, id=self.kwargs['meeting_id'])
        if meeting.host != self.request.user:
            raise permissions.PermissionDenied(
                "Only the meeting host can add recordings."
            )
        serializer.save(meeting=meeting)


class MeetingInviteView(APIView):
    """Invite participants to a meeting"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, meeting_id):
        meeting = get_object_or_404(Meeting, id=meeting_id)
        
        # Only host can invite participants
        if meeting.host != request.user:
            raise permissions.PermissionDenied(
                "Only the meeting host can invite participants."
            )
        
        serializer = MeetingInvitationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Process invitations (in a real app, this would send emails)
        invited_users = serializer.validated_data['users']
        for user in invited_users:
            MeetingParticipant.objects.get_or_create(
                meeting=meeting,
                user=user,
                defaults={'status': 'invited'}
            )
        
        return Response({
            'status': 'success',
            'message': f'Invited {len(invited_users)} participants to the meeting.',
            'meeting_id': meeting_id
        })


class UserMeetingsView(generics.ListAPIView):
    """Get all upcoming and past meetings for the current user"""
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        now = timezone.now()
        past = self.request.query_params.get('past', 'false').lower() == 'true'
        
        qs = Meeting.objects.filter(
            Q(host=self.request.user) | 
            Q(participants__user=self.request.user)
        ).distinct().select_related('host', 'course')
        
        if past:
            return qs.filter(end_time__lt=now).order_by('-start_time')
        return qs.filter(Q(end_time__isnull=True) | Q(end_time__gte=now)).order_by('start_time')
