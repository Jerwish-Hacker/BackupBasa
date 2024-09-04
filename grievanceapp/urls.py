from django.urls import path
from grievanceapp import views

app_name = 'grievanceapp'

urlpatterns = [
    path('success/', views.SuccessPage.as_view(),name='success_page'),
    path('', views.Grievanceformview.as_view(),name='add_grievance'),
    path('grievance/',views.GrievanceListView.as_view(),name='grievance_list'),
    path('api/v1/grievancelist/', views.GrievanceListAPIView.as_view(), name='grievance_list_api'),
    path('grievance/<int:pk>/', views.GrievanceDetailView.as_view(), name='grievance_detail'),
    path('api/v1/grievancelist/archive/<int:pk>/', views.GrievanceResolveUpdateAPIView.as_view(), name='grievance_resolve_update_api'),
    path('api/v1/grievancelist/delete/', views.GrievanceDeleteUpdateAPIView.as_view(), name='grievance_delete_update_api'),
    path('api/v1/grievancelist/addextracomment/', views.GrievanceAddExtraCommentUpdateAPIView.as_view(), name='grievance_add_extra_comment_update_api'),
    path('standards-of-behavior/', views.IncidentReportFormView.as_view(),name='add_incident_report'),
    path('standards-of-behavior-report/',views.IncidentReportDashboard.as_view(),name='incidentreport_list'),
    path('api/v1/incidentlist/', views.IncidentReportListAPIView.as_view(), name='incident_list_api'),
    path('incident/<int:pk>/', views.IncidentReportDetailView.as_view(), name='incident_report_detail'),
    path('api/v1/incidentreport/archive/<int:pk>/', views.IncidentReportResolveUpdateAPIView.as_view(), name='incident_report_resolve_update_api'),
    path('api/v1/incidentreport/addextracomment/', views.IncidentReportAddExtraCommentUpdateAPIView.as_view(), name='incident_report_add_extra_comment_update_api'),
    path('api/v1/incidentreport/delete/', views.IncidentReportDeleteUpdateAPIView.as_view(), name='incident_report_delete_update_api'),
    path('standards-of-behavior/update-<int:pk>/', views.IncidentReportUpdate.as_view(), name='incident_report_update'),
    path('complaint/',views.Complaintformview.as_view(),name='add_complaint_report'),
    path('complaint-report/',views.ComplaintListView.as_view(),name='complaint_list'),
    path('api/v1/complaintlist/', views.ComplaintListAPIView.as_view(), name='complaint_list_api'),
    path('complaint/<int:pk>/', views.ComplaintDetailView.as_view(), name='complaint_detail'),
    path('api/v1/complaintlist/archive/<int:pk>/', views.ComplaintResolveUpdateAPIView.as_view(), name='complaint_resolve_update_api'),
    path('api/v1/complaintlist/delete/', views.ComplaintDeleteUpdateAPIView.as_view(), name='complaint_delete_update_api'),
    path('api/v1/complaintlist/addextracomment/', views.ComplaintAddExtraCommentUpdateAPIView.as_view(), name='complaint_add_extra_comment_update_api'),
    path('success-standard-of-behaviour/', views.SuccessPageStandardofBehaviour.as_view(),name='success_page_standard_of_behaviour'),
    path('success-complaint/', views.SuccessPageComplaint.as_view(),name='success_page_complaint'),
    path('grievance/update-<int:pk>/', views.GrievanceReportUpdate.as_view(), name='grievance_report_update'),

]
