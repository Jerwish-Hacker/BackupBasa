from django.conf import settings
import pandas as pd
from bookingforms.models import HealthPlanPatient, HealthnetCCSPatientDetails, HealthnetCDCPatientCallDetails, KHSPatientDetails, HealthnetCDCPatientDetails,HealthnetDiabetesNutritionCare
from django.contrib.auth.models import Permission,User
from covidtestlogin.models import CovidBoosterTesting, CovidTesting, Employee,CovidWeeklyEmployeeList,CovidBooster,CovidBoosterWeeklyEmployeeList
import datetime
from django.db.models import Q
import pytz
from staffplanning.models import NumberofAppointment, StaffPlanning
from config.settings import TIME_ZONE as timzon
from django.contrib.auth.models import Group


def RecordDateTimeUpdate():
    data = list(StaffPlanning.objects.all().values('id','created_datetime','record_date_time'))
    for dictonary in data:
        print(dictonary['created_datetime'],dictonary['record_date_time'])
        if not dictonary['record_date_time']:
            StaffPlanning.objects.filter(id=dictonary['id']).update(record_date_time=dictonary['created_datetime'])

def importtodb():
    df = pd.read_csv("patient.csv")
    print(df)
    index = 0
    for row in df.itertuples():
        birthdate = datetime.datetime.strptime(row.DOB, "%Y-%m-%d").strftime("%Y-%m-%d")
        patient = HealthPlanPatient()
        patient.appointment_type = 'Cervical Cancer Screening'
        mrn = str(row.MRN).split(".")
        mrn = mrn[0]
        patient.mrn = mrn
        patient.first_name = row.FirstName
        patient.last_name = row.LastName
        patient.date_of_birth = birthdate
        phonenumber = str(row.PhoneNumber).split(".")
        phonenumber = phonenumber[0]
        patient.phone_number = phonenumber
        patient.provider = row.Provider
        patient.save()
        print(index)
        print(row.FirstName,row.LastName)
        index = index + 1

def KHSPatientImport():
    df = pd.read_csv("KHSPatient.csv")
    index = 0
    df = df.astype(object).where(pd.notnull(df),None)
    for row in df.itertuples():
        dob = datetime.datetime.strptime(row.DOB, "%d-%m-%Y").strftime("%Y-%m-%d")
        sms = None
        if row.SEND_SMS_YN != None:
            if row.SEND_SMS_YN == "Y":
                sms = True
            elif row.SEND_SMS_YN == "N":
                sms = False
        Vaccination_Status = row.Vaccination_Status.strip()
        patient = KHSPatientDetails()
        patient.cin = row.CIN
        patient.member_name = row.Member_Name
        patient.dob = dob
        patient.age = row.Age
        patient.gender = row.Gender
        patient.primary_phone = row.Primary_Phone
        patient.secondary_phone = row.Secondary_Phone
        patient.address = row.Address
        patient.state = row.State
        patient.city = row.City
        patient.zip = row.Zip
        patient.pcp_id = row.PCP_ID
        patient.pcp_name = row.PCP_Name
        patient.manufacturer = row.Manufacturer
        patient.vaccination_status = Vaccination_Status
        patient.MRN = row.MRN
        patient.epic_phone = row.EPIC_PHONE
        patient.send_sms = sms
        patient.save()
        index = index + 1
        print(row.CIN,index)

def KHSPatientVaccinationStatusUpdate():
    df = pd.read_excel('Provider Profiling.xlsx',sheet_name='NOT VACCINATED',skiprows=1)
    df2 = pd.read_excel('Provider Profiling.xlsx',sheet_name='PARTIAL VACCINATED',skiprows=1)
    df = df.astype(object).where(pd.notnull(df),None)
    df2 = df2.astype(object).where(pd.notnull(df2),None)
    datafromtable = list(KHSPatientDetails.objects.all().values())
    index = 0
    fullyvaccinted = 0
    partiallyvaccinated = 0
    for i in datafromtable:
        if not i['cin'] in df['CIN'].values:
            if not i['cin'] in df2['CIN'].values:
                fullyvaccinted += 1
                Patientinstance = KHSPatientDetails.objects.get(cin=i['cin'])
                Patientinstance.vaccination_status = 'Fully Vaccinated'
                Patientinstance.save()
            else:
                if i['vaccination_status']!="Partially Vaccinated":
                    partiallyvaccinated += 1
                    Patientinstance = KHSPatientDetails.objects.get(cin=i['cin'])
                    Patientinstance.vaccination_status = 'Partially Vaccinated'
                    Patientinstance.save()
            index += 1
            print(index)
    print(fullyvaccinted, partiallyvaccinated)

def KHSNewPatientInsert():
    df = pd.read_excel('Provider Profiling.xlsx',sheet_name='NOT VACCINATED',skiprows=1)
    df2 = pd.read_excel('Provider Profiling.xlsx',sheet_name='PARTIAL VACCINATED',skiprows=1)
    df = df.astype(object).where(pd.notnull(df),None)
    df2 = df2.astype(object).where(pd.notnull(df2),None)
    df = df.rename({'CIN':'cin','Member Name':'Member_Name','Primary Phone':'Primary_Phone','Secondary Phone':'Secondary_Phone','PCP ID':'PCP_ID','PCP Name':'PCP_Name'},axis=1)
    df2 = df2.rename({'CIN':'cin','Member Name':'Member_Name','Primary Phone':'Primary_Phone','Secondary Phone':'Secondary_Phone','PCP ID':'PCP_ID','PCP Name':'PCP_Name'},axis=1)
    datafromtable = pd.DataFrame(KHSPatientDetails.objects.all().values())
    common = df.merge(datafromtable,on=['cin'])
    df = df[(~df.cin.isin(common.cin))]
    print(df)
    index = 0
    for row in df.itertuples():
        patient = KHSPatientDetails()
        patient.cin = row.cin
        patient.member_name = row.Member_Name
        patient.dob = row.DOB
        patient.age = int(row.Age)
        patient.gender = row.Gender
        patient.primary_phone = row.Primary_Phone
        patient.secondary_phone = row.Secondary_Phone
        patient.address = row.Address
        patient.state = row.State
        patient.city = row.City
        patient.zip = row.Zip
        patient.pcp_id = row.PCP_ID
        patient.pcp_name = row.PCP_Name
        patient.manufacturer = row.Manufacturer
        patient.vaccination_status = 'Not Vaccinated'
        patient.save()
        index = index + 1
        print(row.cin,index)
    common = df2.merge(datafromtable,on=['cin'])
    df2 = df2[(~df2.cin.isin(common.cin))]
    print(df2)
    index = 0
    for row in df2.itertuples():
        patient = KHSPatientDetails()
        patient.cin = row.cin
        patient.member_name = row.Member_Name
        patient.dob = row.DOB
        patient.age = int(row.Age)
        patient.gender = row.Gender
        patient.primary_phone = row.Primary_Phone
        patient.secondary_phone = row.Secondary_Phone
        patient.address = row.Address
        patient.state = row.State
        patient.city = row.City
        patient.zip = row.Zip
        patient.pcp_id = row.PCP_ID
        patient.pcp_name = row.PCP_Name
        patient.manufacturer = row.Manufacturer
        patient.vaccination_status = 'Partially Vaccinated'
        patient.save()
        index = index + 1
        print(row.cin,index)

    
def healthnetCCSPatientImport():
    df = pd.read_excel('CalVivaCCS.xlsx', sheet_name='CCS Screenings')
    df = df.astype(object).where(pd.notnull(df),None)
    index = 0
    for row in df.itertuples():
        PatientInstance = HealthnetCCSPatientDetails()
        PatientInstance.mbr_nbr = row.MBR_NBR
        PatientInstance.cin = row.CIN
        PatientInstance.mem_fname = row.MEM_FNAME
        PatientInstance.mem_lname = row.MEM_LNAME
        PatientInstance.dob = row.DOB
        PatientInstance.phone = row.PHONE
        PatientInstance.wrt_language = row.WRT_LANGUAGE
        PatientInstance.address = row.ADDRESS1
        PatientInstance.city = row.CITY
        PatientInstance.state = row.STATE
        PatientInstance.zip_code = row.ZIP
        PatientInstance.save()
        index += 1
        print(index,row.MBR_NBR)

def healthnetCDCPatientImport():
    df = pd.read_excel('CalVivaCDC.xlsx', sheet_name='Need Script Outreach')
    df = df.astype(object).where(pd.notnull(df),None)
    df = df.rename({'Member_ID':'member_id','Member Last Name': 'member_last_name','Member First Name':'member_first_name','Member DOB':'member_dob','Member Gender':'member_gender','Member Mailing Address':'member_mailing_address','Member City':'member_city','Member State':'member_state','Member Zip Code':'member_zip_code','Member Home Phone Number':'member_home_phone_number','Updated Member Phone Number':'member_updated_phone_number','Member Language Preference (spoken)':'member_language','Last Date of Service':'last_date_of_service','Last HbA1c Test Value':'last_hba1c_test_value'}, axis=1)
    index = 0
    for row in df.itertuples():
        PatientInstance = HealthnetCDCPatientDetails()
        PatientInstance.member_id = row.member_id
        PatientInstance.member_last_name = row.member_last_name
        PatientInstance.member_first_name = row.member_first_name
        PatientInstance.member_dob = row.member_dob
        PatientInstance.member_gender = row.member_gender
        PatientInstance.member_mailing_address = row.member_mailing_address
        PatientInstance.member_city = row.member_city
        PatientInstance.member_state = row.member_state
        PatientInstance.member_zip_code = row.member_zip_code
        PatientInstance.member_home_phone_number = row.member_home_phone_number
        PatientInstance.member_updated_phone_number = row.member_updated_phone_number
        PatientInstance.member_language = row.member_language
        PatientInstance.last_date_of_service = row.last_date_of_service
        PatientInstance.last_hba1c_test_value = row.last_hba1c_test_value
        PatientInstance.save()
        index += 1
        print(index,row.member_id)

def healthnetCDCphonenumberfix():
    data = list(HealthnetCDCPatientDetails.objects.all().values())
    for i in data:
        if i['member_home_phone_number']!=None and ['member_home_phone_number']!='':
            phone = i['member_home_phone_number'].split('.')
            phone = phone[0]
            Patientinstance = HealthnetCDCPatientDetails.objects.get(id=i['id'])
            Patientinstance.member_home_phone_number=phone
            Patientinstance.save()
            print(phone,i['id'])

def healthnetCCSphonenumberfix():
    data = list(HealthnetCCSPatientDetails.objects.all().values())
    for i in data:
        if i['phone']!=None and ['phone']!='':
            phone = i['phone'].split('.')
            phone = phone[0]
            Patientinstance = HealthnetCCSPatientDetails.objects.get(id=i['id'])
            Patientinstance.phone=phone
            Patientinstance.save()
            print(phone,i['id'])

def HealthnetCDCPatientExclude():
    df = pd.read_excel('CalViva Health CDC CSV-West Fresno Inclusions and Exclusions.xlsx', sheet_name='Exclude')
    df = df.astype(object).where(pd.notnull(df),None)
    df = df.rename({'Member_ID':'member_id','Member Last Name': 'member_last_name','Member First Name':'member_first_name','Member DOB':'member_dob','Member Gender':'member_gender','Member Mailing Address':'member_mailing_address','Member City':'member_city','Member State':'member_state','Member Zip Code':'member_zip_code','Member Home Phone Number':'member_home_phone_number','Updated Member Phone Number':'member_updated_phone_number','Member Language Preference (spoken)':'member_language','Last Date of Service':'last_date_of_service','Last HbA1c Test Value':'last_hba1c_test_value'}, axis=1)
    index = 0
    for row in df.itertuples():
        if row.member_id !=None:
            print(row.member_id)
            HealthnetCDCPatientCallDetails.objects.filter(patient__member_id=row.member_id).delete()
            HealthnetCDCPatientDetails.objects.filter(member_id=row.member_id).delete()

def HealthnetCDCPatientInclude():
    df = pd.read_excel('CalViva Health CDC CSV-West Fresno Inclusions and Exclusions.xlsx', sheet_name='Include')
    df = df.astype(object).where(pd.notnull(df),None)
    df = df.rename({'Member_ID':'member_id','Member Last Name': 'member_last_name','Member First Name':'member_first_name','Member DOB':'member_dob','Member Gender':'member_gender','Member Mailing Address':'member_mailing_address','Member City':'member_city','Member State':'member_state','Member Zip Code':'member_zip_code','Member Home Phone Number':'member_home_phone_number','Updated Member Phone Number':'member_updated_phone_number','Member Language Preference (spoken)':'member_language','Last Date of Service':'last_date_of_service','Last HbA1c Test Value':'last_hba1c_test_value'}, axis=1)
    index = 0
    for row in df.itertuples():
        if row.member_id!=None:
            if not HealthnetCDCPatientDetails.objects.filter(member_id=row.member_id):
                PatientInstance = HealthnetCDCPatientDetails()
                PatientInstance.member_id = row.member_id
                PatientInstance.member_last_name = row.member_last_name
                PatientInstance.member_first_name = row.member_first_name
                PatientInstance.member_dob = row.member_dob
                PatientInstance.member_gender = row.member_gender
                PatientInstance.member_mailing_address = row.member_mailing_address
                PatientInstance.member_city = row.member_city
                PatientInstance.member_state = row.member_state
                PatientInstance.member_zip_code = row.member_zip_code
                PatientInstance.member_home_phone_number = row.member_home_phone_number
                PatientInstance.member_updated_phone_number = row.member_updated_phone_number
                PatientInstance.member_language = row.member_language
                PatientInstance.last_date_of_service = row.last_date_of_service
                PatientInstance.last_hba1c_test_value = row.last_hba1c_test_value
                PatientInstance.save()
                index += 1
                print(index,row.member_id)

def HealthnetDiabetesNutritionCarePatientInclude():
    df = pd.read_excel('Healthnet_Diabetes_Nutrition_Care.xlsx', sheet_name='CVH_CDC_PDSA_CYCLE2')
    df = df.astype(object).where(pd.notnull(df),None)
    df = df.rename({'Member_ID':'member_id','Member Last Name': 'member_last_name','Member First Name':'member_first_name','Member DOB':'member_dob','Member Gender':'member_gender','Member Mailing Address':'member_mailing_address','Member City':'member_city','Member State':'member_state','Member Zip Code':'member_zip_code','Member Home Phone Number':'member_home_phone_number','Member Language Preference (spoken)':'member_language','Last Date of Service':'last_date_of_service','Last HbA1c Test Value':'last_hba1c_test_value','Health Net NOTE':'healthnet_note'}, axis=1)
    index = 0
    for row in df.itertuples():
        if row.member_id!=None:
            if not HealthnetDiabetesNutritionCare.objects.filter(member_id=row.member_id):
                PatientInstance = HealthnetDiabetesNutritionCare()
                PatientInstance.member_id = row.member_id
                PatientInstance.lastname = row.member_last_name
                PatientInstance.firstname = row.member_first_name
                PatientInstance.dob = row.member_dob
                PatientInstance.gender = row.member_gender
                PatientInstance.mailing_address = row.member_mailing_address
                PatientInstance.city = row.member_city
                PatientInstance.state = row.member_state
                PatientInstance.zipcode = row.member_zip_code
                PatientInstance.home_phone_number = row.member_home_phone_number
                PatientInstance.language_preference = row.member_language
                PatientInstance.last_date_of_service = row.last_date_of_service
                PatientInstance.last_hba1c_test_value = row.last_hba1c_test_value
                PatientInstance.healthnet_note = row.healthnet_note
                PatientInstance.save()
                index += 1
                print(index,row.member_id)

def HealthnetCCSPhoneUpdate():
    df = pd.read_excel('CalViva CSV-West Fresno CCS Provider Profile with data.xlsx', sheet_name='CCS Screenings')
    df = df.astype(object).where(pd.notnull(df),None)
    df = df.rename({'PHONE1':'Primary_phone','PHONE 2- ALTERNATE (Data Append)':'Secondary_phone','PHONE 3 - ALTERNATE (ADT)':'Tertiary_phone'}, axis=1)
    index = 0
    for row in df.itertuples():
        Secondary_phone = None
        Tertiary_phone = None
        Patientinstance = HealthnetCCSPatientDetails.objects.filter(cin=row.CIN)
        if Patientinstance:
            Patientinstance = HealthnetCCSPatientDetails.objects.get(cin=row.CIN)
            if row.Primary_phone!=None:
                Patientinstance.phone=str(row.Primary_phone).split('.')[0]
            if row.Secondary_phone!=None:
                Secondary_phone = str(row.Secondary_phone).split('.')[0]
            if row.Tertiary_phone!=None:
                Tertiary_phone = str(row.Tertiary_phone).split('.')[0]
            Patientinstance.phone_secondary = Secondary_phone
            Patientinstance.phone_tertiary = Tertiary_phone
            Patientinstance.save()
            print(row.MBR_NBR,row.CIN,Patientinstance.mem_fname,Patientinstance.mem_lname)

def HealthnetCCSAddNewPatient():
    df = pd.read_excel('CalViva CSV-West Fresno CCS Provider Profile with data.xlsx', sheet_name='CCS Screenings')
    df = df.astype(object).where(pd.notnull(df),None)
    df = df.rename({'PHONE1':'Primary_phone','PHONE 2- ALTERNATE (Data Append)':'Secondary_phone','PHONE 3 - ALTERNATE (ADT)':'Tertiary_phone'}, axis=1)
    index = 0
    for row in df.itertuples():
        Primary_phone = None
        Secondary_phone = None
        Tertiary_phone = None
        Patientinstance = HealthnetCCSPatientDetails.objects.filter(cin=row.CIN)
        if not Patientinstance:
            if row.Primary_phone!=None:
                Primary_phone=str(row.Primary_phone).split('.')[0]
            if row.Secondary_phone!=None:
                Secondary_phone = str(row.Secondary_phone).split('.')[0]
            if row.Tertiary_phone!=None:
                Tertiary_phone = str(row.Tertiary_phone).split('.')[0]
            PatientInstance = HealthnetCCSPatientDetails()
            PatientInstance.mbr_nbr = row.MBR_NBR
            PatientInstance.cin = row.CIN
            PatientInstance.mem_fname = row.MEM_FNAME
            PatientInstance.mem_lname = row.MEM_LNAME
            PatientInstance.dob = row.DOB
            PatientInstance.phone = Primary_phone
            Patientinstance.phone_secondary = Secondary_phone
            Patientinstance.phone_tertiary = Tertiary_phone
            PatientInstance.wrt_language = row.WRT_LANGUAGE
            PatientInstance.address = row.ADDRESS1
            PatientInstance.city = row.CITY
            PatientInstance.state = row.STATE
            PatientInstance.zip_code = row.ZIP
            PatientInstance.save()
            index += 1
            print(index,row.MBR_NBR)

def HealthnetCCSRemoveOldPatient():
    df = pd.read_excel('CalViva CSV-West Fresno CCS Provider Profile with data.xlsx', sheet_name='CCS Screenings')
    df = df.astype(object).where(pd.notnull(df),None)
    index = 0
    patients_list = list(HealthnetCCSPatientDetails.objects.all().values('cin','mem_fname','mem_lname'))
    for pat in patients_list:
        cin = pat['cin']
        if not pat['cin'] in df['CIN'].values:
            index += 1
            HealthnetCCSPatientDetails.objects.filter(cin=cin).update(is_deleted=True)
            print(cin,index)



def importtodb1():
    df = pd.read_csv("empcsv.csv")
    print(df)

    df = df.rename({'Position ID': 'position_id', 'Reports To Name':'reports_to_name','Payroll Name':'payroll_name','EE Birth Date':'birth_date','Position Status':'position_status','Worker Category Description':'worker_category_description','Job Title Description':'job_title_description','Hire Date':'hire_date','Region':'region','EEO Establishment':'eeo_establishment','Job Function Description':'job_function_description','Home Department Description':'home_department_description','Union Code Description':'union_code_description','Work Contact: Work Email':'email'},axis=1)
    print(df)
    for row in df.itertuples():
        # print(row.position_id)
        # print(row.reports_to_name)
        # print(row.payroll_name)
        # print(row.birth_date)
        # print(row.position_status)
        # print(row.worker_category_description)
        # print(row.job_title_description)
        # print(row.hire_date)
        # print(row.region)
        # print(row.eeo_establishment)
        # print(row.job_function_description)
        # print(row.home_department_description)
        # print(row.union_code_description)
        # print(row.email)
        birthdate = datetime.datetime.strptime(row.birth_date, "%d-%m-%Y").strftime("%Y-%m-%d")
        hiredate = datetime.datetime.strptime(row.hire_date, "%d-%m-%Y").strftime("%Y-%m-%d")
        print(row.birth_date,birthdate)
        print(row.hire_date,hiredate)
        user =User()
        user.username = row.email
        user.save() 
        employee = Employee()
        employee.user = user
        employee.position_id = row.position_id
        employee.reports_to_name = row.reports_to_name
        employee.payroll_name = row.payroll_name
        employee.birth_date = birthdate
        employee.position_status = row.position_status
        employee.worker_category_description = row.worker_category_description
        employee.job_title_description = row.job_title_description
        employee.hire_date = hiredate
        employee.region = row.region
        employee.eeo_establishment = row.eeo_establishment
        employee.job_function_description = row.job_function_description
        employee.home_department_description = row.home_department_description
        employee.union_code_description = row.union_code_description
        employee.email = row.email
        employee.save()
        print(row.position_id)

def adding_to_covid_testing_table():
    data = Employee.objects.filter(Q(file_1_status=False) | Q(file_2_status=False) | Q(file_3_status=False) | Q(file_4_status=False) | Q(file_5_status=False) | Q(file_6_status=False) | Q(file_7_status=False) | Q(allow_csv_to_pull_record_verified=False) | Q(is_vaccine_declined=True) | Q(user_submission_datetime__isnull=True))
    print(len(data))
    for i in data:
        employee_to_table= CovidWeeklyEmployeeList()
        employee_to_table.employee = Employee.objects.get(position_id=i.position_id)
        due_date = scheduler(i.payroll_name,datetime.datetime(2021,8,23))
        print(i.position_id)
        print(i.payroll_name)
        print(due_date)
        employee_to_table.due_date = due_date
        employee_to_table.save()
        # covidtable = CovidTesting()
        # covidtable.employee = Employee.objects.get(position_id=i.position_id)
        # covidtable.due_date = due_date
        # covidtable.save()
        print("********************")
        
def monday_employee_add():
    data = Employee.objects.filter(Q(file_1_status=False) | Q(file_2_status=False) | Q(file_3_status=False) | Q(file_4_status=False) | Q(file_5_status=False) | Q(file_6_status=False) | Q(file_7_status=False) | Q(allow_csv_to_pull_record_verified=False) | Q(is_vaccine_declined=True) | Q(user_submission_datetime__isnull=True,is_deleted=None) | Q(epic_medical_second_dose_date__gte=datetime.datetime.now(pytz.utc).date()) | Q(epic_medical_fully_vaccinated_test_until_date__gte=datetime.datetime.now(pytz.utc).date()) | Q(epic_medical_loa_until__lt=datetime.datetime.now(pytz.utc).date(),allow_csv_to_pull_record=None))
    data  = data.filter(Q(payroll_name__startswith='A') | Q(payroll_name__startswith='B') | Q(payroll_name__startswith='C') | Q(payroll_name__startswith='D') | Q(payroll_name__startswith='E') | Q(payroll_name__startswith='F'))
    for i in data:
        employee_to_table= CovidWeeklyEmployeeList()
        employee_to_table.employee = Employee.objects.get(position_id=i.position_id)
        employee_to_table.due_date = datetime.datetime.now(pytz.utc).date()
        employee_to_table.save()
        covidtestingtable = Employee.objects.get(position_id=i.position_id).covidtesting_set.filter(is_tested=None)
        if covidtestingtable:
            print("exist in testing")
            print(covidtestingtable.values())
            print(covidtestingtable.values()[0]['id'])
            covidtestingadd = CovidTesting.objects.get(id=covidtestingtable.values()[0]['id'])
            covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
            covidtestingadd.save()
        else:
            print("not exist in testing")
            covidtestingadd = CovidTesting()
            covidtestingadd.employee = Employee.objects.get(position_id=i.position_id)
            covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
            covidtestingadd.save()

def tuesday_employee_add():
    data = Employee.objects.filter(Q(file_1_status=False) | Q(file_2_status=False) | Q(file_3_status=False) | Q(file_4_status=False) | Q(file_5_status=False) | Q(file_6_status=False) | Q(file_7_status=False) | Q(allow_csv_to_pull_record_verified=False) | Q(is_vaccine_declined=True) | Q(user_submission_datetime__isnull=True,is_deleted=None) | Q(epic_medical_second_dose_date__gte=datetime.datetime.now(pytz.utc).date()) | Q(epic_medical_fully_vaccinated_test_until_date__gte=datetime.datetime.now(pytz.utc).date()) | Q(epic_medical_loa_until__lt=datetime.datetime.now(pytz.utc).date(),allow_csv_to_pull_record=None))
    data  = data.filter(Q(payroll_name__startswith='G') | Q(payroll_name__startswith='H') | Q(payroll_name__startswith='I') | Q(payroll_name__startswith='J') | Q(payroll_name__startswith='K'))
    for i in data:
        employee_to_table= CovidWeeklyEmployeeList()
        employee_to_table.employee = Employee.objects.get(position_id=i.position_id)
        employee_to_table.due_date = datetime.datetime.now(pytz.utc).date()
        employee_to_table.save()
        covidtestingtable = Employee.objects.get(position_id=i.position_id).covidtesting_set.filter(is_tested=None)
        if covidtestingtable:
            print("exist in testing")
            print(covidtestingtable.values())
            print(covidtestingtable.values()[0]['id'])
            covidtestingadd = CovidTesting.objects.get(id=covidtestingtable.values()[0]['id'])
            covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
            covidtestingadd.save()
        else:
            print("not exist in testing")
            covidtestingadd = CovidTesting()
            covidtestingadd.employee = Employee.objects.get(position_id=i.position_id)
            covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
            covidtestingadd.save()
        print(employee_to_table,i.position_id,i.payroll_name)
        print(covidtestingtable)

def wednesday_employee_add():
    data = Employee.objects.filter(Q(file_1_status=False) | Q(file_2_status=False) | Q(file_3_status=False) | Q(file_4_status=False) | Q(file_5_status=False) | Q(file_6_status=False) | Q(file_7_status=False) | Q(allow_csv_to_pull_record_verified=False) | Q(is_vaccine_declined=True) | Q(user_submission_datetime__isnull=True,is_deleted=None) | Q(epic_medical_second_dose_date__gte=datetime.datetime.now(pytz.utc).date()) | Q(epic_medical_fully_vaccinated_test_until_date__gte=datetime.datetime.now(pytz.utc).date()) | Q(epic_medical_loa_until__lt=datetime.datetime.now(pytz.utc).date(),allow_csv_to_pull_record=None))
    data  = data.filter(Q(payroll_name__startswith='L') | Q(payroll_name__startswith='M') | Q(payroll_name__startswith='N') | Q(payroll_name__startswith='O') | Q(payroll_name__startswith='P'))
    for i in data:
        employee_to_table= CovidWeeklyEmployeeList()
        employee_to_table.employee = Employee.objects.get(position_id=i.position_id)
        employee_to_table.due_date = datetime.datetime.now(pytz.utc).date()
        employee_to_table.save()
        covidtestingtable = Employee.objects.get(position_id=i.position_id).covidtesting_set.filter(is_tested=None)
        if covidtestingtable:
            print("exist in testing")
            print(covidtestingtable.values())
            print(covidtestingtable.values()[0]['id'])
            covidtestingadd = CovidTesting.objects.get(id=covidtestingtable.values()[0]['id'])
            covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
            covidtestingadd.save()
        else:
            print("not exist in testing")
            covidtestingadd = CovidTesting()
            covidtestingadd.employee = Employee.objects.get(position_id=i.position_id)
            covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
            covidtestingadd.save()

def thursday_employee_add():
    data = Employee.objects.filter(Q(file_1_status=False) | Q(file_2_status=False) | Q(file_3_status=False) | Q(file_4_status=False) | Q(file_5_status=False) | Q(file_6_status=False) | Q(file_7_status=False) | Q(allow_csv_to_pull_record_verified=False) | Q(is_vaccine_declined=True) | Q(user_submission_datetime__isnull=True,is_deleted=None) | Q(epic_medical_second_dose_date__gte=datetime.datetime.now(pytz.utc).date()) | Q(epic_medical_fully_vaccinated_test_until_date__gte=datetime.datetime.now(pytz.utc).date()) | Q(epic_medical_loa_until__lt=datetime.datetime.now(pytz.utc).date(),allow_csv_to_pull_record=None))
    data  = data.filter(Q(payroll_name__startswith='Q') | Q(payroll_name__startswith='R') | Q(payroll_name__startswith='S') | Q(payroll_name__startswith='T') | Q(payroll_name__startswith='U') | Q(payroll_name__startswith='V') | Q(payroll_name__startswith='W') | Q(payroll_name__startswith='X') | Q(payroll_name__startswith='Y') | Q(payroll_name__startswith='Z'))
    for i in data:
        employee_to_table= CovidWeeklyEmployeeList()
        employee_to_table.employee = Employee.objects.get(position_id=i.position_id)
        employee_to_table.due_date = datetime.datetime.now(pytz.utc).date()
        employee_to_table.save()
        covidtestingtable = Employee.objects.get(position_id=i.position_id).covidtesting_set.filter(is_tested=None)
        if covidtestingtable:
            print("exist in testing")
            print(covidtestingtable.values())
            print(covidtestingtable.values()[0]['id'])
            covidtestingadd = CovidTesting.objects.get(id=covidtestingtable.values()[0]['id'])
            covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
            covidtestingadd.save()
        else:
            print("not exist in testing")
            covidtestingadd = CovidTesting()
            covidtestingadd.employee = Employee.objects.get(position_id=i.position_id)
            covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
            covidtestingadd.save()

def next_weekday(date, weekday):
    days_ahead = weekday - date.weekday()
    if days_ahead < 0:
        days_ahead += 7
    return date + datetime.timedelta(days_ahead)

def scheduler(name,date):
    if str(name).startswith(('A','B','C','D','E','F')):
        due_date = next_weekday(date, 0)
    elif str(name).startswith(('G','H','I','J','K')):
        due_date = next_weekday(date, 1)
    elif str(name).startswith(('L','M','N','O','P')):
        due_date = next_weekday(date, 2)
    else:
        due_date = next_weekday(date, 3)
    return due_date

def covid_employee_list_add():
    df = pd.read_csv("weeklylist.csv")
    for row in df.itertuples():
        print(row.employee_id)
        print(Employee.objects.get(id=row.employee_id))
        name = Employee.objects.get(id=row.employee_id).payroll_name
        weeklyemployeelistadding = CovidWeeklyEmployeeList()
        weeklyemployeelistadding.employee = Employee.objects.get(id=row.employee_id)
        due_date =  scheduler(name,datetime.datetime(int(settings.OLD_DATA_EMPLOYEE_WEEKLY_DATE[0]),int(settings.OLD_DATA_EMPLOYEE_WEEKLY_DATE[1]),int(settings.OLD_DATA_EMPLOYEE_WEEKLY_DATE[2])))
        weeklyemployeelistadding.due_date = due_date
        print(due_date)
        weeklyemployeelistadding.save()
    #     # covidtable = CovidTesting()
    #     # covidtable.employee = Employee.objects.get(position_id=i.position_id)
    #     # covidtable.due_date = due_date
    #     # covidtable.save()
    #     print("********************")

def covidbooster_emp_add():
    df = pd.read_excel("Booster.xlsx", sheet_name="Vaccine Data")
    df = df.astype(object).where(pd.notnull(df),None)
    print(df)

    df = df.rename({'Position ID': 'position_id', 'First Name':'first_name','Last Name':'last_name','Birth Date':'birth_date','Shot 1':'shot_one','Shot 2':'shot_two','Booster 1':'booster_one','Date Elig for Booster':'date_eligible_for_booster','Deadline':'dead_line','Status':'status','Position Status':'position_status','Job Title Code':'job_title_code','Job Title Description':'job_title_description','Home Department Description':'home_department_description','Location Description':'location_description','Region':'region','Worker Category Description':'worker_category_description','Hire Date':'hire_date','Rehire Date':'rehire_date','FLSA Description':'flsa_description','Reports To':'reports_to','Job Function Description':'job_function_description','Work Contact: Work Email':'email','Pay Rule':'pay_rule','Position Start Date':'position_start_date','Personal Contact: Personal Mobile':'personal_mobile','Personal Contact: Home Phone':'home_phone'},axis=1)
    for row in df.itertuples():
        birth_date = None
        shot_one = None
        shot_two = None
        booster_one = None
        date_eligible_for_booster = None
        dead_line = None
        hire_date = None
        rehire_date = None
        position_start_date = None
        if row.birth_date!=None:
            try:
                birth_date = datetime.datetime.strptime(row.birth_date, "%m/%d/%Y").strftime("%Y-%m-%d")
            except:
                birth_date = datetime.datetime.strptime((row.birth_date).strftime("%m/%d/%Y"), "%m/%d/%Y").strftime("%Y-%m-%d")
        if row.shot_one!=None and row.shot_one!='Exemption' and row.shot_one!='N/A' and row.shot_one!='No Record':
            try:
                shot_one = datetime.datetime.strptime(row.shot_one, "%m-%d-%y").strftime("%Y-%m-%d")
            except:
                shot_one = datetime.datetime.strptime((row.shot_one).strftime("%m-%d-%y"), "%m-%d-%y").strftime("%Y-%m-%d")
        if row.shot_two!=None and row.shot_two!='Exemption' and row.shot_two!='N/A' and row.shot_two!='No Record':
            shot_two = datetime.datetime.strptime((row.shot_two).strftime("%m-%d-%y"), "%m-%d-%y").strftime("%Y-%m-%d")
        if row.booster_one!=None:
            booster_one = datetime.datetime.strptime((row.booster_one).strftime("%m-%d-%y"), "%m-%d-%y").strftime("%Y-%m-%d")
        if row.date_eligible_for_booster!=None:
            date_eligible_for_booster = datetime.datetime.strptime((row.date_eligible_for_booster).strftime("%m-%d-%y"), "%m-%d-%y").strftime("%Y-%m-%d")
        if row.dead_line!=None:
            dead_line = datetime.datetime.strptime((row.dead_line).strftime("%m-%d-%y"), "%m-%d-%y").strftime("%Y-%m-%d")
        if row.hire_date!=None:
            hire_date = datetime.datetime.strptime((row.hire_date).strftime("%m-%d-%Y"), "%m-%d-%Y").strftime("%Y-%m-%d")
        if row.rehire_date!=None:
            rehire_date = datetime.datetime.strptime((row.rehire_date).strftime("%m-%d-%Y"), "%m-%d-%Y").strftime("%Y-%m-%d")
        if row.position_start_date!=None:
            position_start_date = datetime.datetime.strptime((row.position_start_date).strftime("%m-%d-%Y"), "%m-%d-%Y").strftime("%Y-%m-%d")
        emp = CovidBooster()
        emp.position_id = row.position_id
        emp.first_name = row.first_name
        emp.last_name = row.last_name
        emp.birth_date = birth_date
        emp.shot_one = shot_one
        emp.shot_two = shot_two
        emp.booster_one = booster_one
        emp.date_eligible_for_booster = date_eligible_for_booster
        emp.dead_line = dead_line
        emp.status = row.status
        emp.position_status = row.position_status
        emp.job_title_code = row.job_title_code
        emp.job_title_description = row.job_title_description
        emp.home_department_description = row.home_department_description
        emp.location_description = row.location_description
        emp.region = row.region
        emp.worker_category_description = row.worker_category_description
        emp.hire_date = hire_date
        emp.rehire_date = rehire_date
        emp.flsa_description = row.flsa_description
        emp.reports_to = row.reports_to
        emp.job_function_description = row.job_function_description
        emp.email = row.email
        emp.pay_rule = row.pay_rule
        emp.position_start_date = position_start_date
        emp.personal_mobile = row.personal_mobile
        emp.home_phone = row.home_phone
        print(row.position_id)
        emp.save()

def add_to_covidbooster_testing():
    data = CovidBooster.objects.filter(~Q(status='Review'),~Q(status='Refused'),~Q(status='Complete'),~Q(status='Exemption'),~Q(status='Exemption Approved'),~Q(status='Exemption Declined'),~Q(status='Unknown'),~Q(status__icontains='LOA'),Q(forced_move_status='Due') | Q(shot_two__isnull=False,shot_two__lte = datetime.datetime.now(tz=pytz.timezone(timzon)).date() - datetime.timedelta(days=155),forced_move_status__isnull=True))
    data |= CovidBooster.objects.filter(~Q(status='Review'),~Q(status='Refused'),~Q(status='Complete'),~Q(status='Exemption'),~Q(status='Exemption Approved'),~Q(status='Exemption Declined'),~Q(status='Unknown'),~Q(status__icontains='LOA'),Q(forced_move_status='Due') | Q(shot_one__isnull=True,shot_two__isnull=True,status='Due') | Q(shot_two__isnull=True,shot_one__lte = datetime.datetime.now(tz=pytz.timezone(timzon)).date() - datetime.timedelta(days=62),forced_move_status__isnull=True))
    data |= CovidBooster.objects.filter(status="Exemption Approved")
    print(len(data))
    for i in data:
        employee_to_table= CovidBoosterWeeklyEmployeeList()
        employee_to_table.employee = CovidBooster.objects.get(position_id=i.position_id)
        employee_to_table.due_date = datetime.datetime.now(pytz.utc).date()
        employee_to_table.save()
        covidtestingtable = CovidBooster.objects.get(position_id=i.position_id).covidboostertesting_set.filter(is_tested=None)
        if covidtestingtable:
            print("exist in testing")
            print(covidtestingtable.values())
            print(covidtestingtable.values()[0]['id'])
            covidtestingadd = CovidBoosterTesting.objects.get(id=covidtestingtable.values()[0]['id'])
            covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
            covidtestingadd.save()
        else:
            print("not exist in testing")
            covidtestingadd = CovidBoosterTesting()
            covidtestingadd.employee = CovidBooster.objects.get(position_id=i.position_id)
            covidtestingadd.due_date = datetime.datetime.now(pytz.utc).date()
            covidtestingadd.save()

def add_user_to_group():
    user_list = User.objects.all().values('id')
    group = Group.objects.get(name="empvaccinetracker")
    for user in user_list:
        group.user_set.add(User.objects.get(id=user['id']))
        print(user['id'])

def user_email_to_lower_case():
    user_list = User.objects.all().values('id','username')
    for user in user_list:
        try:
            User.objects.filter(username=user['username']).update(username=user['username'].lower())
        except:
            print(user['username'].lower())

def employee_email_to_lower_case():
    employee_list = Employee.objects.all().values('email')
    for employee in employee_list:
        try:
            Employee.objects.filter(email=employee['email']).update(email=employee['email'].lower())
        except:
            print("EXEMPTION :",employee['email'].lower())

def booster_employee_email_to_lower_case():
    booster_employee_list = CovidBooster.objects.all().values('email','position_id')
    for booster_employee in booster_employee_list:
        try:
            print(booster_employee['email'],booster_employee['position_id'])
            CovidBooster.objects.filter(email=booster_employee['email']).update(email=booster_employee['email'].lower())
        except:
            print("EXEMPTION :",booster_employee['email'].lower())

def email_change():
    df = pd.read_excel("VaccineTracker_Users.xlsx", sheet_name="VaccineTracker Users")
    df = df.astype(object).where(pd.notnull(df),None)
    df = df.rename({'Email ': 'email','Azure Email ':'azure_email'},axis=1)
    for row in df.itertuples():
        if User.objects.filter(username=(row.email).strip()):
            user_obj = User.objects.get(username=(row.email).strip())
            if user_obj:
                user_obj.username = (row.azure_email).strip()
                user_obj.email = (row.azure_email).strip()
                user_obj.save()
                if Employee.objects.filter(email=(row.email).strip()):
                    Employee.objects.filter(email=(row.email).strip()).update(email=(row.azure_email).strip())
                    print("EMPLOYEE :",(row.email).strip(),(row.azure_email).strip())
                if CovidBooster.objects.filter(email=(row.email).strip()):
                    CovidBooster.objects.filter(email=(row.email).strip()).update(email=(row.azure_email).strip())
                    print("COVID BOOSTER :",(row.email).strip(),(row.azure_email).strip())
        else:
            print("NOT PRESENT :",(row.email).strip(),(row.azure_email).strip())
