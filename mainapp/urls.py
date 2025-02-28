
from django.urls import path
from mainapp import views

app_name = 'mainapp'

urlpatterns = [
    path('',views.Index.as_view(),name='index'),
    path('api/v1/favourites/',views.FetchFavouriteApps.as_view(),name='fetch_favourite_apps'),
    path('api/v1/tracker/',views.UserTracker.as_view(),name='user_tracker'),
    path('api/v1/tracker/getlist/',views.UserTrackerGetList.as_view(),name='user_tracker_get_list'),
    path('userAccessApis/',views.UserDetails.as_view(), name='userDatails'),
    path('add/group/',views.AddGroups.as_view(), name="add_groups"),
    path('remove/group/',views.RemoveGroups.as_view(), name="remove_groups"),
    path('api/v1/addedit/user/',views.AddEditUser.as_view(), name="addedit_user"),
    path('api/v1/apps/list/',views.GetAppList.as_view(), name="get_app_list"),
    path('api/v1/app/edit/post/',views.AppEditUpdate.as_view(), name="app_edit_update"),
    path('api/v1/delete/app/',views.DeleteApp.as_view(), name="delete_app"),
    path('api/v1/update/apps/ordering/',views.AppsOrderingUpdates.as_view(), name="app_ordering_update"),
    path('api/v1/add/location/',views.AddLocations.as_view(), name="add_location"),
    path('api/v1/fetch/app/location/<str:app_name>/',views.FetchAppLocationsandAdmin.as_view(), name="fetch_app_available_location_and_admin"),
    path('api/v1/edit/app/location/',views.EditAppLocations.as_view(), name="edit_app_location"),
    path('api/v1/fetch/user/location/',views.FetchUserLocations.as_view(), name="fetch_user_location"),
    path('api/v1/edit/user/location/',views.EditUserLocations.as_view(), name="edit_user_location"),
    path('permissiondenied/', views.PermissionDenied.as_view(), name="permission_denied"),
    path('api/v1/edit/app/admin/',views.EditAppAdmin.as_view(), name="edit_app_admin"),
    path('api/v1/fetch/user/groups/',views.FetchUserGroup.as_view(), name="fetch_user_group"),
    path('api/add/outreach/',views.AddOutreach.as_view(), name="add_outreach"),
    path('api/edit/outreach/',views.EditOutreach.as_view(), name="edit_outreach"),
    path('api/delete/outreach/',views.DeleteOutreach.as_view(), name="delete_outreach"),
    path('activate/<str:uidb64>/<str:token>/',views.activate, name='activate'),
    path('api/set/password/',views.SetPassword.as_view(), name="set_password"),
    path('api/edit/outreach/publish/',views.EditOutreachPublish.as_view(), name="edit_outreach_publish"),
    path('member/patients/',views.MembersList.as_view(), name="member_patient_list"),
    path('api/v1/patient/edit/post/',views.PatientEditUpdate.as_view(), name="patient_edit_update"),
    path('api/v1/patient/createuser/post/',views.PatientUserCreate.as_view(), name="patient_user_create"),
    path('api/v1/patient/delete/post/',views.DeletePatient.as_view(), name="patient_edit_update"),
    path('invalidlink/', views.InvalidLink.as_view(), name="invalid_link"),
    path('api/v1/outreach/list/',views.GetOutreachList.as_view(), name="get_outreach_list"),
    path('state-list/', views.get_states_in_country,name='get_regions_in_country'),
    path('api/v1/add/quality-service/',views.AddQualityReports.as_view(), name="add_quality_reports"),
    path('create/form/', views.create_form,name='create_form'),
    path('dynamic/form/', views.dynamic_form,name='dynamic_form'),
    path('form-submissions/', views.form_submissions, name='form_submissions'),
    path('api/user/demographic/<int:pk>/', views.UserDemographicDetails.as_view(), name='user_demographics_details'),
    path('api/v1/users/bulk-upload/',views.BulkUserCreation.as_view(), name="bulk_user_creation"),
    path('consent/management/',views.MembersConsentList.as_view(), name="consent_management_list"),
    path('api/v1/consent/individual/',views.MembersConsentListAPI.as_view(), name="consent_management_list_get_individual_consent"),
    path('api/v1/consent/saveupdate/',views.MembersConsentSaveUpdate.as_view(), name="consent_management_list_save_update_consent"),
    path('api/v1/consent/history/<int:pk>/',views.ConsentHistoryDetailView.as_view(), name="consent_management_list_history_detail_view"),
    path('api/v1/consent-type/list/',views.GetConsentTypeList.as_view(), name="get_consent_type_list"),
    path('consent/management/fhir/',views.MembersConsentFHIR.as_view(), name="consent_management_fhir"),

]