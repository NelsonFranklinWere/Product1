from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/communications/(?P<business_id>\w+)/$', consumers.CommunicationsConsumer.as_asgi()),
    re_path(r'ws/notifications/(?P<business_id>\w+)/$', consumers.NotificationConsumer.as_asgi()),
]
