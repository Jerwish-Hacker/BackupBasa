# import pyodbc
# from datetime import datetime

# from celery import shared_task
# from django.conf import settings
# from grievanceapp.models import Compliance, Grievance, IncidentReport
# from config.settings import TIME_ZONE as timzon
# import pytz

# timeset = pytz.timezone(timzon)

# @shared_task
# def write_to_ms_sql_server(grievance_id,submission_type):
#     grievance = Grievance.objects.get(id=grievance_id)
#     field_names = [
#         'id',
#         'site',
#         'county',
#         'event_type',
#         'health_plan',
#         'provider_mentioned',
#         'comments',
#         'is_resolved',
#         'resolved_by',
#         'created_datetime',
#         'modified_datetime',
#         'resolving_comments',
#         'grievance_report_type',
#         'service_type',
#         'created_by',
#         'patient_first_name',
#         'patient_last_name',
#         'date_of_event',
#         'date_of_birth',
#         'phone_number',
#         'who_was_involoved',
#         'steps_taken_to_resolve_this_issue',
#         'outcome_resolution',
#     ]
#     field_values = []
#     for fld in field_names:
#         if fld=='created_datetime' or fld=='modified_datetime':
#             field_values.append(getattr(grievance,fld).replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S'))
#         else:
#             field_values.append(getattr(grievance,fld))
#     conn = pyodbc.connect(settings.MSSQLCONNECTION)
#     cursor = conn.cursor()
#     if submission_type=='create':
#         cursor.execute("INSERT INTO tblgrievanceReportProduction (id,site,county,event_type,health_plan,provider_mentioned,comments,is_resolved,resolved_by,created_datetime,modified_datetime,resolving_comments,grievance_report_type,service_type,created_by,patient_first_name,patient_last_name,date_of_event,date_of_birth,phone_number,who_was_involoved,steps_taken_to_resolve_this_issue,outcome_resolution) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",*field_values)
#     elif submission_type=='update':
#         cursor.execute("UPDATE tblgrievanceReportProduction set site=?,county=?,event_type=?,health_plan=?,provider_mentioned=?,comments=?,is_resolved=?,resolved_by=?,created_datetime=?,modified_datetime=?,resolving_comments=?,grievance_report_type=?,service_type=?,created_by=?,patient_first_name=?,patient_last_name=?,date_of_event=?,date_of_birth=?,phone_number=?,who_was_involoved=?,steps_taken_to_resolve_this_issue=?,outcome_resolution=? WHERE id=?",field_values[1],field_values[2],field_values[3],field_values[4],field_values[5],field_values[6],field_values[7],field_values[8],field_values[9],field_values[10],field_values[11],field_values[12],field_values[13],field_values[14],field_values[15],field_values[16],field_values[17],field_values[18],field_values[19],field_values[20],field_values[21],field_values[22],field_values[0])
#     conn.commit()
#     return

# @shared_task
# def archive_update(pk,username,resolvingcomment):
#     grievance = Grievance.objects.get(id=pk)
#     modified_datetime = getattr(grievance,'modified_datetime').replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S')
#     conn = pyodbc.connect(settings.MSSQLCONNECTION)
#     cursor = conn.cursor()
#     cursor.execute("Update tblgrievanceReportProduction set is_resolved=1,resolved_by=?,resolving_comments=?,modified_datetime=? where id=?",username,resolvingcomment,modified_datetime,pk)
#     conn.commit()
#     return

# @shared_task
# def delete_update(id):
#     conn = pyodbc.connect(settings.MSSQLCONNECTION)
#     cursor = conn.cursor()
#     cursor.execute("Delete from tblgrievanceReportProduction where id=?",id)
#     conn.commit()
#     return

# @shared_task
# def incident_report_to_mssql(incident_id,submission_type):
#     incident_report = IncidentReport.objects.get(id=incident_id)
#     field_names = [
#         'id',
#         'letter_signed_date',
#         'letter_sent_date',
#         'service_line',
#         'first_name',
#         'last_name',
#         'scanned_date',
#         'location_site',
#         'ethnicity_race',
#         'severity',
#         'is_resolved',
#         'resolved_by',
#         'resolving_comments',
#         'created_by',
#         'created_datetime',
#         'modified_datetime',
#         'mrn',
#         'phone_number',
#         'county',
#         'level_of_intervention',
#     ]
#     field_values = []
#     for fld in field_names:
#         if fld=='created_datetime' or fld=='modified_datetime':
#             field_values.append(getattr(incident_report,fld).replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S'))
#         else:
#             field_values.append(getattr(incident_report,fld))
#     conn = pyodbc.connect(settings.MSSQLCONNECTION_INCIDENT_REPORT)
#     cursor = conn.cursor()
#     if submission_type=='create':
#         cursor.execute("INSERT INTO tblincidentReport (id,letter_signed_date,letter_sent_date,service_line,first_name,last_name,scanned_date,location_site,ethnicity_race,severity,is_resolved,resolved_by,resolving_comments,created_by,created_datetime,modified_datetime,mrn,phone_number,county,level_of_intervention) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",*field_values)
#     elif submission_type == 'update':
#         cursor.execute("UPDATE tblincidentReport set letter_signed_date=?,letter_sent_date=?,service_line=?,first_name=?,last_name=?,scanned_date=?,location_site=?,ethnicity_race=?,severity=?,is_resolved=?,resolved_by=?,resolving_comments=?,created_by=?,created_datetime=?,modified_datetime=?,mrn=?,phone_number=?,county=?,level_of_intervention=? where id=?",field_values[1],field_values[2],field_values[3],field_values[4],field_values[5],field_values[6],field_values[7],field_values[8],field_values[9],field_values[10],field_values[11],field_values[12],field_values[13],field_values[14],field_values[15],field_values[16],field_values[17],field_values[18],field_values[19],field_values[0])
#     conn.commit()
#     return

# @shared_task
# def archive_update_incident_report(pk,username,resolvingcomment):
#     grievance = IncidentReport.objects.get(id=pk)
#     modified_datetime = getattr(grievance,'modified_datetime').replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S')
#     conn = pyodbc.connect(settings.MSSQLCONNECTION_INCIDENT_REPORT)
#     cursor = conn.cursor()
#     cursor.execute("Update tblincidentReport set is_resolved=1,resolved_by=?,resolving_comments=?,modified_datetime=? where id=?",username,resolvingcomment,modified_datetime,pk)
#     conn.commit()
#     return

# @shared_task
# def delete_update_incident_report(id):
#     conn = pyodbc.connect(settings.MSSQLCONNECTION_INCIDENT_REPORT)
#     cursor = conn.cursor()
#     cursor.execute("Delete from tblincidentReport where id=?",id)
#     conn.commit()
#     return

# @shared_task
# def complaint_write_to_ms_sql_server(complaint_id):
#     complaint = Compliance.objects.get(id=complaint_id)
#     field_names = [
#         'id',
#         'patient_first_name',
#         'patient_last_name',
#         'date_of_event',
#         'date_of_birth',
#         'phone_number',
#         'who_was_involoved',
#         'report_type',
#         'service_type',
#         'site',
#         'county',
#         'event_type',
#         'provider_mentioned',
#         'comments',
#         'steps_taken_to_resolve_this_issue',
#         'outcome_resolution',
#         'is_resolved',
#         'resolved_by',
#         'resolving_comments',
#         'created_by',
#         'created_datetime',
#         'modified_datetime',
        
#     ]
#     field_values = []
#     for fld in field_names:
#         if fld=='created_datetime' or fld=='modified_datetime':
#             field_values.append(getattr(complaint,fld).replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S'))
#         else:
#             field_values.append(getattr(complaint,fld))
#     conn = pyodbc.connect(settings.MSSQLCONNECTION_COMPLIANCE_REPORT)
#     cursor = conn.cursor()
#     cursor.execute("INSERT INTO tblcomplianceReport (id,patient_first_name,patient_last_name,date_of_event,date_of_birth,phone_number,who_was_involoved,report_type,service_type,site,county,event_type,provider_mentioned,comments,steps_taken_to_resolve_this_issue,outcome_resolution,is_resolved,resolved_by,resolving_comments,created_by,created_datetime,modified_datetime) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",*field_values)
#     conn.commit()
#     return

# @shared_task
# def complaint_archive_update(pk,username,resolvingcomment):
#     complaint = Compliance.objects.get(id=pk)
#     modified_datetime = getattr(complaint,'modified_datetime').replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S')
#     conn = pyodbc.connect(settings.MSSQLCONNECTION_COMPLIANCE_REPORT)
#     cursor = conn.cursor()
#     cursor.execute("Update tblcomplianceReport set is_resolved=1,resolved_by=?,resolving_comments=?,modified_datetime=? where id=?",username,resolvingcomment,modified_datetime,pk)
#     conn.commit()
#     return

# @shared_task
# def complaint_delete_update(id):
#     conn = pyodbc.connect(settings.MSSQLCONNECTION_COMPLIANCE_REPORT)
#     cursor = conn.cursor()
#     cursor.execute("Delete from tblcomplianceReport where id=?",id)
#     conn.commit()
#     return

