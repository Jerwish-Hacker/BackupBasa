from django.urls import path
from outreach import views

app_name = 'outreach'
urlpatterns = [
    path('servicedenied/', views.ServiceDenied.as_view(), name="service_denied"),
    path('<str:outreach>/', views.OutreachPortal.as_view(), name='outreach_portal'),
    path('login/auth/', views.OutreachLogin.as_view(), name='outreach_auth'),
    path('v1/login/', views.OutreachLoginPage.as_view(), name='outreach_login'),
    path('api/v1/outreach/', views.OutreachListAPI.as_view(), name='outreach_list_api'),
    path('<str:outreach>/dashboard/', views.OutreachPortalDashboard.as_view(), name='outreach_portal_dashboard'),
    path('api/v1/outreachadminlist/', views.OutreachAdminListAPIView.as_view(), name='outreach_admin_list_api'),
    path('api/v1/outreach/cancel-admin/', views.OutreachAppointmentCancelRequestAPIView.as_view(), name='outreach_appointment_cancel_request_admin'),
    path('api/v1/appointment/confirm/<int:pk>/', views.OutreachAppointmentConfirmUpdateAPIView.as_view(), name='outreach_appointment_confirm_update_api'),
    path('outreach/<str:outreach>/<int:pk>/', views.OutreachAppointmentDetailView.as_view(), name='outreach_appointment_detail_view'),
    path('api/v1/outreach/notification-check/', views.OutreachNotificationCheckAPIView.as_view(), name='outreach_notification_check'),
    path('<str:outreach>/notification/', views.OutreachNotification.as_view(), name='outreach_notification_list'),
    path('api/v1/outreach-cancel-appointment/', views.OutreachCancelAppointment.as_view(), name='outreach_cancel_appointment'),
    path('api/outreach/schedule/', views.OutreachScheduleAppointment.as_view(), name='outreach_schedule_appointment'),
    path('api/v1/<str:outreach>/outreach-history/<int:pk>/', views.OutReachHistory.as_view(), name='appointment_outreach_history_detail_view'),
    path('api/v1/outreach/patient/reminder/<int:pk>/', views.OutreachPatientAppointmentReminer.as_view(), name='outreach_patient_appointment_reminder'),
    path('api/v1/outreach-fetch-available-dates/', views.OutreachFetchAvailableDates.as_view(), name='outreach_fetch_available_dates'),
    path('api/v1/outreachscheduler-location/<str:outreach>/', views.OutreachLocation.as_view(), name='outreach_location'),
    path('<str:outreach>/admin/notification/', views.OutreachAdminNotification.as_view(), name='outreach_admin_notification_list'),
    path('api/v1/outreach/notification/', views.OutreachNotificationAPIListView.as_view(), name='outreach_notification_api_list_view'),
    path('scheduler/home/', views.Scheduler.as_view(), name='scheduler'),
    path('scheduler/<str:outreach>/', views.OutreachScheduler.as_view(), name='outreach_scheduler'),
    path('api/v1/healthplanscheduler/', views.HealthPlanSchedulerListAPI.as_view(), name='healthplan_scheduler_list_api'),
    path('api/v1/healthplanscheduler-adminlist/', views.HealthPlanSchedulerAdminListAPIView.as_view(), name='healthplan_scheduler_admin_list_api'),
    path('api/v1/healthplanscheduler-update/', views.HealthPlanSchedulerAdminListUpdate.as_view(), name='healthplan_scheduler_admin_list_update'),
    path('member/ingress', views.Ingress.as_view(), name='ingress'),
    path('api/v1/outreach/ingress/', views.IngressBlobs.as_view(), name='ingress-blob'),

]
