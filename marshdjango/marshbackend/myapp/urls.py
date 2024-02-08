from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet
from .views import add_numbers
from django.http import HttpResponse

router = DefaultRouter()
router.register(r'items', ItemViewSet)


urlpatterns = [
    path('add', add_numbers, name='add_numbers'),

    path('', include(router.urls)),
]
