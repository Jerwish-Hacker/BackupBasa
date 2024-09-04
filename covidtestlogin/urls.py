from django.urls import path
from covidtestlogin import views

app_name = 'covidtestlogin'

urlpatterns = [
    path('vaccine-management/', views.VaccineManagement.as_view(),name='vaccine_management'),
    path('<str:vaccine>/form/', views.Vaccine.as_view(),name='vaccine_form'),
    # path('api/v1/otpgenerate/', views.OTPGenerate, name='otp_generate'),
    # path('api/v1/otpvalidate/', views.OTPvalidate, name='otp_validate'),
    # path('user/loggedin/', views.UserPage, name='user_loggedin'),
    path('api/v1/usersubmission/', views.VaccineUserSubmission.as_view(), name='vaccine_user_submission'),
    path('<str:vaccine>/dashboard/',views.VaccinationDashboard.as_view(),name='vaccine_dashboard'),
    path('api/v1/vaccinationlist/', views.VaccinationDashboardListAPI.as_view(), name='vaccination_dashboard_list_api'),
    path('dashboard/<int:pk>/', views.CovidNonTestingDetailView.as_view(), name='covidnontesting_detail'),
    path('api/v1/covidtest/verify/', views.CovidFileUpdateAPIView.as_view(), name='covid_file_update_api'),
    path('api/v1/covidtest/verify-epicrecord/', views.CovidEpicrecordUpdateAPIView.as_view(), name='epic_record_update_api'),
    path('user/loggedin/exemption/', views.UserPageVaccineExemption, name='user_loggedin_vaccine_exemption'),
    path('user/loggedin/exemption-form/<str:chosen>/', views.UserPageVaccineExemptionForm, name='user_loggedin_vaccine_exemption_form'),
    path('api/v1/vaccineexemption/', views.UserUploadVaccineExemption, name='user_upload_vaccine_exemption'),
    path('<str:vaccine>/vaccine-exemption-dashboard/',views.VaccineExemptionDashboard.as_view(),name='vaccine_exemption_dashboard'),
    path('api/v1/vaccineexemption-dashboard/',views.VaccineExemptionDashboardListAPIView.as_view(),name='vaccine_exemption_list_api'),
    path('vaccine-exemption-dashboard/<int:pk>/', views.VaccineExemptionDeatils.as_view(), name='vaccine_exemption_details'),
    path('api/v1/vaccine-exemption/verify/', views.VaccineExemptionFileUpdateAPIView.as_view(), name='vaccine_exemption'),
    path('api/v1/adminupload/', views.VaccineAdminFileSubmission.as_view(), name='admin_file_upload'),
    path('userdenied/', views.UserDenied.as_view(), name="user_denied"),
    path('api/v1/vaccine-management/list/', views.VaccineManagementListAPI.as_view(), name="vaccine_management_list"),
    path('api/v1/vaccine-management/crud/', views.VaccineManagementCRUD.as_view(), name="vaccine_management_crud"),

]
