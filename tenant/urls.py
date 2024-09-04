from django.urls import path
from tenant import views

app_name = 'tenant'

urlpatterns = [
    path('', views.HomePage.as_view(),name='home'),    
    path('apps/', views.AppsPage.as_view(),name='apps'),    
    path('api/v1/authenticate/', views.UserLogin.as_view(),name='user_authenticate'),
    path('api/v1/tenant-name/', views.CheckTenantName.as_view(),name='check_tenant'),
    path('api/v1/add-tenant/', views.AddTenant.as_view(),name='add_tenant'),
    path('register/', views.TenantRegister.as_view(),name='tenant_register'),
    path('settings/', views.SettingsPage.as_view(),name='settings_page'),
    path('api/v1/get/tenant/', views.GetTenantList.as_view(),name='get_tenant'),
    path('api/v1/tenant/edit/', views.TenantEdit.as_view(),name='tenant_edit'),
    path('api/v1/tenant/status/edit/', views.TenantStatusEdit.as_view(),name='tenant_status_edit'),
    path('api/v1/favourites/',views.FetchFavouriteApps.as_view(),name='fetch_favourite_apps'),
    path('api/v1/tracker/',views.UserTracker.as_view(),name='user_tracker'),
    path('api/v1/tracker/getlist/',views.UserTrackerGetList.as_view(),name='user_tracker_get_list'),
    path('api/v1/apps/list/',views.GetAppList.as_view(), name="get_app_list"),
    path('api/v1/app/edit/post/',views.AppEditUpdate.as_view(), name="app_edit_update"),
    path('api/v1/update/apps/ordering/',views.AppsOrderingUpdates.as_view(), name="app_ordering_update"),
    path('api/v1/delete/app/',views.DeleteApp.as_view(), name="delete_app"),

]
