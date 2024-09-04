
from django.urls import path
from staffplanning import views

app_name = 'staffplanning'

urlpatterns = [
    path('',views.StaffPlanningIndex.as_view(),name='staff_planning_index'),
    path('api/v1/staffplanning/fetch-previous-submission/',views.StaffPlanningAPIFetchPreviousSubmission.as_view(),name='staff_planning_api_fetch_previous_submission'),
    path('staffplanning/update/<int:pk>/',views.StaffPlanningProductivityUpdate.as_view(),name='staff_planning_productivity_update'),
    path('dashboard/',views.Dashboard.as_view(),name='dashboard'),
    path('api/v1/staffplanning/fetch-dashboard-data/',views.DashboardAPIFetch.as_view(),name='dashboard_fetch_data'),
    path('details/<str:site>/<str:operation>/',views.DashboardSiteDetails.as_view(),name='dashboard_site_details'),
    path('api/v1/site/details/',views.DashboardSiteDetailsAPIFetch.as_view(),name='dashboard_site_fetch_details'),
    path('dental/',views.StaffPlanningDentalIndex.as_view(),name='staff_planning_dental_index'),
    path('api/v1/staffplanningdental/fetch-previous-submission/',views.StaffPlanningDentalAPIFetchPreviousSubmission.as_view(),name='staff_planning_dental_api_fetch_previous_submission'),
    path('staffplanningdental/update/<int:pk>/',views.StaffPlanningDentalProductivityUpdate.as_view(),name='staff_planning_dental_productivity_update'),
    path('staffplanning/medical-update/<int:pk>/<str:submission>/',views.StaffPlanningIndexUpdateView.as_view(),name='staff_planning_medical_update_view'),
    path('staffplanning/dental-update/<int:pk>/<str:submission>/',views.StaffPlanningDentalIndexUpdateView.as_view(),name='staff_planning_dental_update_view'),
    path('api/v1/check/lastest/medical-entry/',views.StaffPlanningMedicalCheckLatestEntry.as_view(),name='staff_planning_check_latest_medical_entry'),
    path('api/v1/check/lastest/dental-entry/',views.StaffPlanningDentalCheckLatestEntry.as_view(),name='staff_planning_check_latest_dental_entry'),
    path('api/v1/staffplanningoptometry/fetch-previous-submission/',views.StaffPlanningOptometryAPIFetchPreviousSubmission.as_view(),name='staff_planning_optometry_api_fetch_previous_submission'),
    path('staffplanningoptometry/update/<int:pk>/',views.StaffPlanningOptometryProductivityUpdate.as_view(),name='staff_planning_optometry_productivity_update'),
    path('api/v1/check/lastest/optometry-entry/',views.StaffPlanningOptometryCheckLatestEntry.as_view(),name='staff_planning_check_latest_optometry_entry'),
    path('staffplanning/optometry-update/<int:pk>/<str:submission>/',views.StaffPlanningOptometryIndexUpdateView.as_view(),name='staff_planning_optometry_update_view'),
    path('optometry/',views.StaffPlanningOptometryIndex.as_view(),name='staff_planning_optometry_index'),

]