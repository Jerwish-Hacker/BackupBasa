"""config URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from grievanceapp.views import SuccessPage, media_access
from mainapp.views import ResetPassword
from django.conf import settings
from django.conf.urls.static import static
from django_sso.views import OAuth2LoginView, OAuth2LogoutView
from allauth.account.views import LoginView, LogoutView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # path('accounts/', include('allauth.urls')),
    path('accounts/login/', LoginView.as_view(), name='account_login'),
    path('accounts/logout/', LogoutView.as_view(), name='account_logout'),
    path('accounts/signup/', SuccessPage.as_view(), name='account_signup'),
    path('accounts/password_reset/', ResetPassword.as_view(), name='account_reset_password'),
    path('accounts/sso/login/', OAuth2LoginView.as_view(), name='account_sso_login'),
    path('accounts/sso/logout/', OAuth2LogoutView.as_view(), name='account_sso_logout'),


    path('oauth2/', include('django_sso.urls')),
    
    path('grievance/', include('grievanceapp.urls', namespace='grievanceapp')),
    path('appointment/', include('bookingforms.urls', namespace='appointment')),
    path('', include('mainapp.urls', namespace='mainapps')),
    path('staffplanning/', include('staffplanning.urls', namespace='staffplanning')),
    path('vaccine/', include('covidtestlogin.urls', namespace='covidtestlogin')),
    path('outreach/', include('outreach.urls', namespace='outreach')),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += [path('media/<path:path>', media_access, name='media'),]

    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_URL)
else:
    # https://docs.djangoproject.com/en/3.1/topics/http/urls/#path-converters
    urlpatterns += [path('media/<path:path>', media_access, name='media'),]

handler404 = 'mainapp.views.handler404'
handler403 = 'mainapp.views.handler403'