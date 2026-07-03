from django.urls import path, include
from rest_framework import routers
from rest_framework_simplejwt.views import TokenRefreshView

 
from .views import (ArendaViewSet,AditionaleViewSet, ArendatoriViewSet, ConfigAnViewSet, ContracteViewSet, PlatiArendaViewSet, 
                    TerenuriViewSet, ZoneViewSet, LoginView, LogoutView,CookieTokenRefreshView,MeView)

router = routers.DefaultRouter()

# DefaultRouter() = generează automat toate rutele (list, retrieve, create, update, delete)

router.register(r'arendatori',ArendatoriViewSet, basename='arendatori')
router.register(r'contracte',ContracteViewSet,basename='contracte')
router.register(r'zone', ZoneViewSet, basename='zone')
router.register(r'terenuri', TerenuriViewSet, basename='terenuri')
router.register(r'arenda', ArendaViewSet, basename='arenda')
router.register(r'plati-arenda', PlatiArendaViewSet, basename='plati-arenda')
router.register(r'aditionale', AditionaleViewSet, basename='aditionale') 
router.register(r'config-an', ConfigAnViewSet, basename='config-an')

# register('arendatori', ...) = creează /arendatori/, /arendatori/{id}/, etc


urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MeView.as_view(), name='me'),  
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('',include(router.urls))
]
