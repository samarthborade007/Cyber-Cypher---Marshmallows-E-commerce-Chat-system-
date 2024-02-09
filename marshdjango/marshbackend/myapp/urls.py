from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet
from .views import add_numbers
from django.http import HttpResponse


# urls.py
from django.urls import path
from .views import get_recommendations

router = DefaultRouter()
router.register(r'items', ItemViewSet)


urlpatterns = [
        path('add-numbers/', add_numbers, name='add-numbers'),

    path('api/get-recommendations/', get_recommendations, name='get_recommendations'),

    path('', include(router.urls)),
]
