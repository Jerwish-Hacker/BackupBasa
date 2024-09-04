
# from celery import shared_task
# from django.conf import settings
# from covidtestlogin.models import CovidTesting,Employee,CovidWeeklyEmployeeList,CovidBoosterTesting,CovidBooster,CovidBoosterWeeklyEmployeeList
# import datetime
# import pytz
# from django.core.mail import EmailMultiAlternatives
# from django.db.models import Q
# from config.settings import TIME_ZONE as timzon

# # @shared_task
# # def email_notification_reminder():
# #     date = datetime.datetime.now(pytz.utc).date()
# #     employeeobj = CovidTesting.objects.filter(due_date=date)
# #     emaillist = []
# #     for i in employeeobj:
# #         email = str(Employee.objects.get(position_id=str(i.employee)).email)
# #         emaillist.append(email)
# #     subject, from_email = 'COVID-19 Testing Reminder',settings.EMAIL_HOST_USER, 
# #     text_content = 'This is an important message.'
# #     html_content = '<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0"><div style="border-bottom:1px solid #eee"><a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Clinica Sierra Vista</a></div><p style="font-size:1.1em">Good Morning,</p><p>Reminder - You are due for a mandatory COVID-19 swab today. Please coordinate with your supervisor on a convenient time during the Employee Testing hours of 8:00am-10:00am or 12:00pm-2:00pm. Please obtain the test while on the clock, not during one of your break periods. The testing is available at all clinic locations, please get your test completed at the site closest to your home site. You will need your employee ID and Employee number.Thank you</p><p style="font-size:0.9em;">Regards,<br />CSV Team</p><hr style="border:none;border-top:1px solid #eee" /><div style="float:left;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300"><p>Clinica Sierra Vista</p><p>1430 Truxtun Avenue</p><p>Suite 400</p><p>Bakersfield, CA 93301</p><p>661-635-3050</p></div></div></div>'
# #     msg = EmailMultiAlternatives(subject, text_content, from_email, ['applications@clinicasierravista.org'], bcc=emaillist)
# #     msg.attach_alternative(html_content, "text/html")
# #     msg.send()

# #     employeeobj = CovidTesting.objects.filter(due_date__lt=datetime.datetime.now(pytz.utc).date(),is_tested=None)
# #     emaillist = []
# #     for i in employeeobj:
# #         email = str(Employee.objects.get(position_id=str(i.employee)).email)
# #         emaillist.append(email)
# #     subject, from_email = 'COVID-19 Testing Missed Reminder',settings.EMAIL_HOST_USER, 
# #     text_content = 'This is an important message.'
# #     html_content = '<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0"><div style="border-bottom:1px solid #eee"><a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Clinica Sierra Vista</a></div><p style="font-size:1.1em">Good Morning,</p><p>Our records indicate you have not completed the COVID-19 mandatory testing. Please coordinate with your supervisor and complete the test as soon as possible. Employee Testing hours are 8:00am-10:00am or 12:00pm-2:00pm. Please obtain the test while on the clock, not during one of your break periods. The testing is available at all clinic locations, please get your test completed at the site closest to your home site. You will need your employee ID and Employee number.Thank you</p><p style="font-size:0.9em;">Regards,<br />CSV Team</p><hr style="border:none;border-top:1px solid #eee" /><div style="float:left;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300"><p>Clinica Sierra Vista</p><p>1430 Truxtun Avenue</p><p>Suite 400</p><p>Bakersfield, CA 93301</p><p>661-635-3050</p></div></div></div>'
# #     msg = EmailMultiAlternatives(subject, text_content, from_email, ['applications@clinicasierravista.org'], bcc=emaillist)
# #     msg.attach_alternative(html_content, "text/html")
# #     msg.send()

# @shared_task
# def loa_check():
#     #Thi will check the employee whose loa date is over, if yes then he is moved to covid testing table
#     date = datetime.datetime.now(pytz.utc).date()
#     employeeobj = Employee.objects.filter(Q(allow_csv_to_pull_record=True) | Q(is_proof_or_vaccination_copy_provided=True),epic_medical_loa_until__lt=date)
#     for i in employeeobj.values():
#         Employeeinstance = Employee.objects.get(id=i['id'])
#         Employeeinstance.epic_medical_loa_until = None
#         Employeeinstance.save()
#     employeeobj = Employee.objects.filter(epic_medical_loa_until__lt=date,allow_csv_to_pull_record=None)
#     for i in employeeobj.values():
#         Employeeinstance = Employee.objects.get(id=i['id'])
#         Employeeinstance.epic_medical_loa_until = None
#         Employeeinstance.user_submission_datetime = None
#         Employeeinstance.save()

# @shared_task
# def monday_employee_add():
#     data = Employee.objects.filter(Q(file_1_status=False) | Q(file_2_status=False) | Q(file_3_status=False) | Q(file_4_status=False) | Q(file_5_status=False) | Q(file_6_status=False) | Q(file_7_status=False) | Q(allow_csv_to_pull_record_verified=False,epic_medical_loa_until__isnull=True) | Q(is_vaccine_declined=True) | Q(user_submission_datetime__isnull=True) | Q(epic_medical_second_dose_date__gte=datetime.datetime.now(pytz.utc).date()) | Q(epic_medical_fully_vaccinated_test_until_date__gte=datetime.datetime.now(pytz.utc).date()),is_deleted=None)
#     data  = data.filter(Q(payroll_name__startswith='A') | Q(payroll_name__startswith='B') | Q(payroll_name__startswith='C') | Q(payroll_name__startswith='D') | Q(payroll_name__startswith='E') | Q(payroll_name__startswith='F'))
#     for i in data:
#         employee_to_table= CovidWeeklyEmployeeList()
#         employee_to_table.employee = Employee.objects.get(position_id=i.position_id)
#         employee_to_table.due_date = datetime.datetime.now(pytz.utc).date()
#         employee_to_table.save()
#         covidtestingtable = Employee.objects.get(position_id=i.position_id).covidtesting_set.filter(is_tested=None)
#         if covidtestingtable:
#             covidtestingadd = CovidTesting.objects.get(id=covidtestingtable.values()[0]['id'])
#             covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
#             covidtestingadd.save()
#         else:
#             covidtestingadd = CovidTesting()
#             covidtestingadd.employee = Employee.objects.get(position_id=i.position_id)
#             covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
#             covidtestingadd.save()

# @shared_task
# def tuesday_employee_add():
#     data = Employee.objects.filter(Q(file_1_status=False) | Q(file_2_status=False) | Q(file_3_status=False) | Q(file_4_status=False) | Q(file_5_status=False) | Q(file_6_status=False) | Q(file_7_status=False) | Q(allow_csv_to_pull_record_verified=False,epic_medical_loa_until__isnull=True) | Q(is_vaccine_declined=True) | Q(user_submission_datetime__isnull=True) | Q(epic_medical_second_dose_date__gte=datetime.datetime.now(pytz.utc).date()) | Q(epic_medical_fully_vaccinated_test_until_date__gte=datetime.datetime.now(pytz.utc).date()),is_deleted=None)
#     data  = data.filter(Q(payroll_name__startswith='G') | Q(payroll_name__startswith='H') | Q(payroll_name__startswith='I') | Q(payroll_name__startswith='J') | Q(payroll_name__startswith='K'))
#     for i in data:
#         employee_to_table= CovidWeeklyEmployeeList()
#         employee_to_table.employee = Employee.objects.get(position_id=i.position_id)
#         employee_to_table.due_date = datetime.datetime.now(pytz.utc).date()
#         employee_to_table.save()
#         covidtestingtable = Employee.objects.get(position_id=i.position_id).covidtesting_set.filter(is_tested=None)
#         if covidtestingtable:
#             covidtestingadd = CovidTesting.objects.get(id=covidtestingtable.values()[0]['id'])
#             covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
#             covidtestingadd.save()
#         else:
#             covidtestingadd = CovidTesting()
#             covidtestingadd.employee = Employee.objects.get(position_id=i.position_id)
#             covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
#             covidtestingadd.save()

# @shared_task
# def wednesday_employee_add():
#     data = Employee.objects.filter(Q(file_1_status=False) | Q(file_2_status=False) | Q(file_3_status=False) | Q(file_4_status=False) | Q(file_5_status=False) | Q(file_6_status=False) | Q(file_7_status=False) | Q(allow_csv_to_pull_record_verified=False,epic_medical_loa_until__isnull=True) | Q(is_vaccine_declined=True) | Q(user_submission_datetime__isnull=True) | Q(epic_medical_second_dose_date__gte=datetime.datetime.now(pytz.utc).date()) | Q(epic_medical_fully_vaccinated_test_until_date__gte=datetime.datetime.now(pytz.utc).date()),is_deleted=None)
#     data  = data.filter(Q(payroll_name__startswith='L') | Q(payroll_name__startswith='M') | Q(payroll_name__startswith='N') | Q(payroll_name__startswith='O') | Q(payroll_name__startswith='P'))
#     for i in data:
#         employee_to_table= CovidWeeklyEmployeeList()
#         employee_to_table.employee = Employee.objects.get(position_id=i.position_id)
#         employee_to_table.due_date = datetime.datetime.now(pytz.utc).date()
#         employee_to_table.save()
#         covidtestingtable = Employee.objects.get(position_id=i.position_id).covidtesting_set.filter(is_tested=None)
#         if covidtestingtable:
#             covidtestingadd = CovidTesting.objects.get(id=covidtestingtable.values()[0]['id'])
#             covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
#             covidtestingadd.save()
#         else:
#             covidtestingadd = CovidTesting()
#             covidtestingadd.employee = Employee.objects.get(position_id=i.position_id)
#             covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
#             covidtestingadd.save()

# @shared_task
# def thursday_employee_add():
#     data = Employee.objects.filter(Q(file_1_status=False) | Q(file_2_status=False) | Q(file_3_status=False) | Q(file_4_status=False) | Q(file_5_status=False) | Q(file_6_status=False) | Q(file_7_status=False) | Q(allow_csv_to_pull_record_verified=False,epic_medical_loa_until__isnull=True) | Q(is_vaccine_declined=True) | Q(user_submission_datetime__isnull=True) | Q(epic_medical_second_dose_date__gte=datetime.datetime.now(pytz.utc).date()) | Q(epic_medical_fully_vaccinated_test_until_date__gte=datetime.datetime.now(pytz.utc).date()),is_deleted=None)
#     data  = data.filter(Q(payroll_name__startswith='Q') | Q(payroll_name__startswith='R') | Q(payroll_name__startswith='S') | Q(payroll_name__startswith='T') | Q(payroll_name__startswith='U') | Q(payroll_name__startswith='V') | Q(payroll_name__startswith='W') | Q(payroll_name__startswith='X') | Q(payroll_name__startswith='Y') | Q(payroll_name__startswith='Z'))
#     for i in data:
#         employee_to_table= CovidWeeklyEmployeeList()
#         employee_to_table.employee = Employee.objects.get(position_id=i.position_id)
#         employee_to_table.due_date = datetime.datetime.now(pytz.utc).date()
#         employee_to_table.save()
#         covidtestingtable = Employee.objects.get(position_id=i.position_id).covidtesting_set.filter(is_tested=None)
#         if covidtestingtable:
#             covidtestingadd = CovidTesting.objects.get(id=covidtestingtable.values()[0]['id'])
#             covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
#             covidtestingadd.save()
#         else:
#             covidtestingadd = CovidTesting()
#             covidtestingadd.employee = Employee.objects.get(position_id=i.position_id)
#             covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
#             covidtestingadd.save()

# @shared_task
# def wednesday_booster_employee_add():
#     data = CovidBooster.objects.filter(~Q(status='Review'),~Q(status='Refused'),~Q(status='Complete'),~Q(status='Exemption'),~Q(status='Exemption Approved'),~Q(status='Exemption Declined'),~Q(status='Unknown'),~Q(status__icontains='LOA'),Q(forced_move_status='Due') | Q(shot_two__isnull=False,shot_two__lte = datetime.datetime.now(tz=pytz.timezone(timzon)).date() - datetime.timedelta(days=155),forced_move_status__isnull=True))
#     data |= CovidBooster.objects.filter(~Q(status='Review'),~Q(status='Refused'),~Q(status='Complete'),~Q(status='Exemption'),~Q(status='Exemption Approved'),~Q(status='Exemption Declined'),~Q(status='Unknown'),~Q(status__icontains='LOA'),Q(forced_move_status='Due') | Q(shot_one__isnull=True,shot_two__isnull=True,status='Due') | Q(shot_two__isnull=True,shot_one__lte = datetime.datetime.now(tz=pytz.timezone(timzon)).date() - datetime.timedelta(days=62),forced_move_status__isnull=True))
#     data |= CovidBooster.objects.filter(status="Exemption Approved")
#     for i in data:
#         employee_to_table= CovidBoosterWeeklyEmployeeList()
#         employee_to_table.employee = CovidBooster.objects.get(position_id=i.position_id)
#         employee_to_table.due_date = datetime.datetime.now(pytz.utc).date()
#         employee_to_table.save()
#         covidtestingtable = CovidBooster.objects.get(position_id=i.position_id).covidboostertesting_set.filter(is_tested=None)
#         if covidtestingtable:
#             covidtestingadd = CovidBoosterTesting.objects.get(id=covidtestingtable.values()[0]['id'])
#             covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
#             covidtestingadd.save()
#         else:
#             covidtestingadd = CovidBoosterTesting()
#             covidtestingadd.employee = CovidBooster.objects.get(position_id=i.position_id)
#             covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
#             covidtestingadd.save()
