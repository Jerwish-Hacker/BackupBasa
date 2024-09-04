# import pyodbc

# from celery import shared_task
# from django.conf import settings
# from staffplanning.models import StaffPlanning
# from config.settings import TIME_ZONE as timzon
# import pytz

# timeset = pytz.timezone(timzon)

# @shared_task
# def write_to_ms_sql_server(staffplanning_id):
#     staffplanning = StaffPlanning.objects.get(id=staffplanning_id)
#     conn = pyodbc.connect(settings.STAFF_MSSQLCONNECTION)
#     cursor = conn.cursor()
#     cursor.execute("Select * from tblStaffPlanning where county=? and site=? and record_date=?",staffplanning.county,staffplanning.site,getattr(staffplanning,'record_date_time').replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d'))
#     if cursor.fetchone():
#         cursor.execute("delete from tblStaffPlanning where county=? and site=? and record_date=?",staffplanning.county,staffplanning.site,getattr(staffplanning,'record_date_time').replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d'))
#         cursor.commit()
#     field_names = [
#         'id',
#         'providers_present',
#         'app_present',
#         'total_providers_present',
#         'receptionist_present',
#         'receptionist_provider_ratio',
#         'provider_specialty_app_walk_in_ma_present',
#         'ma_provider_ratio',
#         'nurses_present',
#         'nurses_provider_ratio',
#         'qualified_visits_conducted',
#         'visit_capacity_utilization_percentage',
#         'record_created_by',
#         'county',
#         'site',
#         'created_datetime',
#         'modified_datetime',
#         'created_date',
#         'providers_present_comment',
#         'walk_in_providers_present',
#         'walk_in_providers_present_comment',
#         'app_present_comment',
#         'total_providers_present_comment',
#         'total_providers_appointment_scheduled_today',
#         'total_providers_appointment_scheduled_today_comment',
#         'total_walk_in_providers_appointment_scheduled_today',
#         'total_walk_in_providers_appointment_scheduled_today_comment',
#         'total_app_scheduled_today',
#         'total_app_scheduled_today_comment',
#         'ob_gyn_providers_present',
#         'ob_gyn_providers_present_comment',
#         'pediatrics_providers_present',
#         'pediatrics_providers_present_comment',
#         'ecmp_providers',
#         'ecmp_providers_comment',
#         'endocrinology_providers',
#         'endocrinology_providers_comment',
#         'infectious_disease_providers_present',
#         'infectious_disease_providers_present_comment',
#         'podiatry_providers_present',
#         'podiatry_providers_present_comment',
#         'total_specialty_providers_present',
#         'total_specialty_providers_present_comment',
#         'total_specialty_appointment_scheduled_today',
#         'total_specialty_appointment_scheduled_today_comment',
#         'integrated_bh_providers_present',
#         'integrated_bh_providers_present_comment',
#         'telepsychiatry_providers_present',
#         'telepsychiatry_providers_present_comment',
#         'total_other_providers_present',
#         'total_other_providers_present_comment',
#         'total_other_providers_appointment_scheduled_today',
#         'total_other_providers_appointment_scheduled_today_comment',
#         'nurses_present_comment',
#         'receptionist_present_comment',
#         'bh_ma_present',
#         'bh_ma_present_comment',
#         'provider_specialty_app_walk_in_ma_present_comment',
#         'retinopathy_ma_present',
#         'retinopathy_ma_present_comment',
#         'covid_ma_present',
#         'covid_ma_present_comment',
#         'nurses_provider_ratio_comment',
#         'ma_provider_ratio_comment',
#         'receptionist_provider_ratio_comment',
#         'providers_call_outs',
#         'providers_call_outs_comment',
#         'providers_no_of_patients_rescheduled',
#         'providers_no_of_patients_rescheduled_comment',
#         'no_of_patients_placed_on_another_provider_schedule',
#         'no_of_patients_placed_on_another_provider_schedule_comment',
#         'app_call_outs',
#         'app_call_outs_comment',
#         'app_no_of_patients_rescheduled',
#         'app_no_of_patients_rescheduled_comment',
#         'no_of_patients_placed_on_another_app_schedule',
#         'no_of_patients_placed_on_another_app_schedule_comment',
#         'specialty_providers_call_outs',
#         'specialty_providers_call_outs_comment',
#         'specialty_providers_no_of_patients_rescheduled',
#         'specialty_providers_no_of_patients_rescheduled_comment',
#         'no_of_patients_plcd_on_another_splty_provider_schedule',
#         'no_of_patients_plcd_on_another_splty_provider_schedule_comment',
#         'ma_call_outs',
#         'ma_call_outs_comment',
#         'bh_ma_call_outs',
#         'bh_ma_call_outs_comment',
#         'retinopathy_ma_call_outs',
#         'retinopathy_ma_call_outs_comment',
#         'nurses_call_outs',
#         'nurses_call_outs_comment',
#         'receptionist_call_outs',
#         'receptionist_call_outs_comment',
#         'total_appointment_scheduled_today',
#         'total_appointment_scheduled_today_comment',
#         'no_of_providers_who_met_productivity_at_end_of_day',
#         'no_of_providers_who_met_productivity_at_end_of_day_comment',
#         'no_of_pds_who_did_not_meet_pdty_at_end_of_day',
#         'no_of_pds_who_did_not_meet_pdty_at_end_of_day_comment',
#         'no_of_medical_appointment_slots_available_at_end_of_day',
#         'no_of_medical_appointment_slots_available_at_end_of_day_comment',
#         'qualified_visits_conducted_comment',
#         'no_of_covid_test_scheduled',
#         'no_of_covid_test_scheduled_comment',
#         'visit_capacity_utilization_percentage_comment',
#         'list_any_barriers',
#         'phlebotomist_ma',
#         'phlebotomist_ma_comment',
#         'dsmes',
#         'dsmes_comment',
#         'optometry',
#         'optometry_comment',
#         'productivity_status',
#         'lab_ma_present',
#         'lab_ma_present_comment',
#     ]
#     field_values = []
#     for fld in field_names:
#         if fld=='created_datetime' or fld=='modified_datetime':
#             field_values.append(getattr(staffplanning,fld).replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S'))
#         elif fld=='created_date':
#             field_values.append(getattr(staffplanning,'created_datetime').replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d'))
#         else:
#             field_values.append(getattr(staffplanning,fld))
#     sum_of_total_and_specialty_providers = 0
#     if getattr(staffplanning,'total_providers_present')!='' and getattr(staffplanning,'total_providers_present')!=None:
#         sum_of_total_and_specialty_providers += float(getattr(staffplanning,'total_providers_present'))        
#     if getattr(staffplanning,'total_specialty_providers_present')!='' and getattr(staffplanning,'total_specialty_providers_present')!=None:
#         sum_of_total_and_specialty_providers += float(getattr(staffplanning,'total_specialty_providers_present'))
#     field_values.append(sum_of_total_and_specialty_providers)
#     field_values.append(getattr(staffplanning,'record_date_time').replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d'))
#     field_values.append(getattr(staffplanning,'other_reasons'))
#     cursor.execute("INSERT INTO tblStaffPlanning (id,physicians_present,app_present,total_providers_present,reception_present,reception_provider_ratio,ma_present,ma_provider_ratio,nurses_present,nurse_provider_ratio,qualified_visits_conducted,percent_visit_capacity_utilization,record_created_by,county,site,created_datetime,modified_datetime,created_date,providers_present_comment,walk_in_providers_present,walk_in_providers_present_comment,app_present_comment,total_providers_present_comment,total_providers_appointment_scheduled_today,total_providers_appointment_scheduled_today_comment,total_walk_in_providers_appointment_scheduled_today,total_walk_in_providers_appointment_scheduled_today_comment,total_app_scheduled_today,total_app_scheduled_today_comment,ob_gyn_providers_present,ob_gyn_providers_present_comment,pediatrics_providers_present,pediatrics_providers_present_comment,ecmp_providers,ecmp_providers_comment,endocrinology_providers,endocrinology_providers_comment,infectious_disease_providers_present,infectious_disease_providers_present_comment,podiatry_providers_present,podiatry_providers_present_comment,total_specialty_providers_present,total_specialty_providers_present_comment,total_specialty_appointment_scheduled_today,total_specialty_appointment_scheduled_today_comment,integrated_bh_providers_present,integrated_bh_providers_present_comment,telepsychiatry_providers_present,telepsychiatry_providers_present_comment,total_other_providers_present,total_other_providers_present_comment,total_other_providers_appointment_scheduled_today,total_other_providers_appointment_scheduled_today_comment,nurses_present_comment,receptionist_present_comment,bh_ma_present,bh_ma_present_comment,provider_specialty_app_walk_in_ma_present_comment,retinopathy_ma_present,retinopathy_ma_present_comment,covid_ma_present,covid_ma_present_comment,nurses_provider_ratio_comment,ma_provider_ratio_comment,receptionist_provider_ratio_comment,providers_call_outs,providers_call_outs_comment,providers_no_of_patients_rescheduled,providers_no_of_patients_rescheduled_comment,no_of_patients_placed_on_another_provider_schedule,no_of_patients_placed_on_another_provider_schedule_comment,app_call_outs,app_call_outs_comment,app_no_of_patients_rescheduled,app_no_of_patients_rescheduled_comment,no_of_patients_placed_on_another_app_schedule,no_of_patients_placed_on_another_app_schedule_comment,specialty_providers_call_outs,specialty_providers_call_outs_comment,specialty_providers_no_of_patients_rescheduled,specialty_providers_no_of_patients_rescheduled_comment,no_of_patients_plcd_on_another_splty_provider_schedule,no_of_patients_plcd_on_another_splty_provider_schedule_comment,ma_call_outs,ma_call_outs_comment,bh_ma_call_outs,bh_ma_call_outs_comment,retinopathy_ma_call_outs,retinopathy_ma_call_outs_comment,nurses_call_outs,nurses_call_outs_comment,receptionist_call_outs,receptionist_call_outs_comment,total_appointment_scheduled_today,total_appointment_scheduled_today_comment,no_of_providers_who_met_productivity_at_end_of_day,no_of_providers_who_met_productivity_at_end_of_day_comment,no_of_pds_who_did_not_meet_pdty_at_end_of_day,no_of_pds_who_did_not_meet_pdty_at_end_of_day_comment,no_of_medical_appointment_slots_available_at_end_of_day,no_of_medical_appointment_slots_available_at_end_of_day_comment,qualified_visits_conducted_comment,no_of_covid_test_scheduled,no_of_covid_test_scheduled_comment,visit_capacity_utilization_percentage_comment,list_any_barriers,phlebotomist_ma,phlebotomist_ma_comment,dsmes,dsmes_comment,optometry,optometry_comment,productivity_status,lab_ma_present,lab_ma_present_comment,sum_of_total_providers_and_specialty_providers,record_date,other_reasons) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",*field_values)
#     conn.commit()
#     return
    
# @shared_task
# def write_to_ms_sql_server_update(staffplanning_id):
#     staffplanning = StaffPlanning.objects.get(id=staffplanning_id)
#     conn = pyodbc.connect(settings.STAFF_MSSQLCONNECTION)
#     cursor = conn.cursor()
#     field_names = [
#         'modified_datetime',
#         'no_of_providers_who_met_productivity_at_end_of_day',
#         'no_of_providers_who_met_productivity_at_end_of_day_comment',
#         'no_of_pds_who_did_not_meet_pdty_at_end_of_day',
#         'no_of_pds_who_did_not_meet_pdty_at_end_of_day_comment',
#         'no_of_medical_appointment_slots_available_at_end_of_day',
#         'no_of_medical_appointment_slots_available_at_end_of_day_comment',
#         'qualified_visits_conducted',
#         'qualified_visits_conducted_comment',
#         'visit_capacity_utilization_percentage',
#         'visit_capacity_utilization_percentage_comment',
#         'productivity_status',
#         'id',
#     ]
#     field_values = []
#     for fld in field_names:
#         if fld=='modified_datetime':
#             field_values.append(getattr(staffplanning,fld).replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S'))
#         else:
#             field_values.append(getattr(staffplanning,fld))
#     cursor.execute("UPDATE tblStaffPlanning SET modified_datetime=?,no_of_providers_who_met_productivity_at_end_of_day=?,no_of_providers_who_met_productivity_at_end_of_day_comment=?,no_of_pds_who_did_not_meet_pdty_at_end_of_day=?,no_of_pds_who_did_not_meet_pdty_at_end_of_day_comment=?,no_of_medical_appointment_slots_available_at_end_of_day=?,no_of_medical_appointment_slots_available_at_end_of_day_comment=?,qualified_visits_conducted=?,qualified_visits_conducted_comment=?,percent_visit_capacity_utilization=?,visit_capacity_utilization_percentage_comment=?,productivity_status=? where id=?",*field_values)
#     conn.commit()
#     return
