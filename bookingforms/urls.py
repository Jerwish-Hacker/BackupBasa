from django.urls import path
from bookingforms import views

app_name = 'bookingforms'
urlpatterns = [
    # path('', views.index),
    path('h/', views.index1),
    path('success/', views.SuccessPage.as_view(),name='success_page'),
    path('', views.AppointmentView.as_view(),name='add_appointment'),
    path('appointment/', views.AppointmentListView.as_view(), name='appointment_list'),
    path('appointment/testing/', views.TestingAppointmentListView.as_view(), name='testing_appointment_list'),
    path('appointment/<int:pk>/', views.AppointmentDetailView.as_view(), name='appointment_detail'),
    # path('appointment/edit/<int:pk>/', views.AppointmentUpdateView.as_view(), name='update_appointment'),
    path('city-list/', views.get_cities_in_state,name='get_cities_in_state'),

    path('api/v1/appointmentlist/', views.AppointmentListAPIView.as_view(), name='appointment_list_api'),
    path('api/v1/appointmentlist/archive/<int:pk>/', views.AppointmentArchiveUpdateAPIView.as_view(), name='appointment_archive_update_api'),
    path('viewlock/<int:appointment_fk>/', views.AppointmentViewLock.as_view(), name='appointment_view_lock'),
    path('viewlockfetchid/', views.AppointmentViewLockFetchId.as_view(), name='appointment_view_lock_fetch_id'),
    path('slotcheck/<str:appointment>/<str:location>/<str:date>/', views.Slotcheck.as_view(), name='slot_check'),
    path('slotavailablecheck/<str:time>/<str:appointment>/<str:location>/<str:date>/', views.SlotAvailableCheck.as_view(), name='slot_available_check'),
    path('success/<str:appointmentid>/<str:url>', views.SuccessPageTimeSlotBooking.as_view(), name='success_page_time_slot_booking'),
    path('slotrender/<str:appointment>/<str:location>/<str:date>/', views.SlotRendering.as_view(), name='slot_rendering'),
    path('upload/', views.UploadUrlModelCreate.as_view(), name='upload_create'),
    path('upload/<language>', views.UploadUrlModelCreate.as_view(),name='upload_create'),
    path('success-upload/', views.UploadUrlModelSuccessPage.as_view(), name='upload_success_page'),
    path('api/v1/uploadappointmentlist/', views.UploadUrlModelAppointmentListAPIView.as_view(), name='upload_appointment_list_api'),
    path('api/v1/uploadappointmentlist/archive/<int:pk>/', views.UploadUrlModelAppointmentArchiveUpdateAPIView.as_view(), name='upload_appointment_archive_update_api'),
    path('uploadappointment/<int:pk>/', views.UploadUrlModelAppointmentDetailView.as_view(), name='upload_url_model_appointment_detail'),
    path('upload-admin/', views.UploadUrlModelAppointmentListView.as_view(), name='upload_appointment_list'),
    path('servicedenied/', views.ServiceDenied.as_view(), name="service_denied"),
    path('scheduler/', views.AppointmentScheduler.as_view(), name='appointment_scheduler'),
    path('api/v1/appointmentscheduler/', views.AppointmentSchedulerListAPI.as_view(), name='appointment_scheduler_list_api'),
    path('api/v1/appointmentscheduler-adminlist/', views.AppointmentSchedulerAdminListAPIView.as_view(), name='appointment_scheduler_admin_list_api'),
    path('api/v1/appointment-fetch-available-dates/<str:appointment>/<str:location>/', views.AppointmentFetchAvailableDates.as_view(), name='appointment_fetch_available_dates'),

]
