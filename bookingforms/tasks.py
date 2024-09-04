import string
from datetime import datetime
from outreach.models import MemberPatient
from celery import shared_task
from config.settings import TIME_ZONE as timzon
import pytz
import string, random
import pandas as pd
from django.db import connection
from django.contrib.auth.models import User
from covidtestlogin.models import Employee
from django.utils.encoding import force_bytes,force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.template.loader import render_to_string
from mainapp.tokens import account_activation_token

timeset = pytz.timezone(timzon)
@shared_task
def say_hello(string):
    try:
        print('Hello world')
    except Exception as e:
        print(e)
    return

@shared_task
def write_to_celery(df1,auto_id,domain):
        df = pd.read_json(df1)
        df = df.astype(object).where(pd.notnull(df),"")
        connection.schema_name = domain
        df_records = df.to_dict('records')
        model_instances = []
        for record in df_records:
            d=datetime.now().strftime("%Y%m%d%H%M%S%f")
            random_key = ''.join([
                ''.join(random.sample(string.ascii_letters, 2)),
                ''.join(random.sample(string.digits, 2)),
                ''.join(random.sample(string.ascii_letters, 2)),
            ])
            auto_identifier = str(d)+str(random_key)
            if not auto_id and not record['Identifier']=="":
                auto_identifier = str(record['Identifier'])
            if MemberPatient.objects.filter(identifier=auto_identifier).exists():
                MemberPatient.objects.filter(identifier=auto_identifier).update(identifier=auto_identifier,identifier_system=record['Identifier System'],active=record['Active'],name_given=record['Given name'],name_family=record['Family name'],name_prefix=record['Prefix name'],name_suffix=record['Suffix name'],contact_value=record['Contact'],contact_use=record['Contact Use'],gender=record['Gender'],birthDate=datetime.strptime(record['Birth date'], "%d-%m-%Y"),address_use=record['Address use'],address_line=record['Address line'],address_city=record['Address city'],address_district=record['Address line'],address_state=record['Address state'],address_postalCode=record['Address postal'],address_country=record['Address country'],photo=record['Photo'])
            else:
                model_instances.append(MemberPatient(
                name_given=record['Given name'],
                name_family=record['Family name'],
                name_prefix=record['Prefix name'],
                name_suffix=record['Suffix name'],
                contact_value=record['Contact'],
                contact_use=record['Contact Use'],
                identifier=auto_identifier,
                identifier_system=record['Identifier System'],
                birthDate=datetime.strptime(record['Birth date'], "%d-%m-%Y"),
                active=record['Active'],
                gender=record['Gender'],
                address_use=record['Address use'],
                address_line=record['Address line'],
                address_city=record['Address city'],
                address_district=record['Address district'],
                address_state=record['Address state'],
                address_postalCode=str(record['Address postal']).split('.')[0],
                address_country=record['Address country'],
                photo=record['Photo']
        ))
        MemberPatient.objects.bulk_create(model_instances)
        return

@shared_task
def users_bulk_creation(df1,domain,current_site):
        try:
            df = pd.read_json(df1)
            df = df.astype(object).where(pd.notnull(df),"")
            connection.schema_name = domain
            df_records = df.to_dict('records')
            model_instances = []
            for record in df_records:
                record['Is Active'] = True if record['Is Active'].lower() == 'yes' else False
                record['Is Staff'] = True if record['Is Staff'].lower() == 'yes' else False
                if User.objects.filter(email=record['Email']).exists():
                    User.objects.filter(email=record['Email']).update(first_name=record['First Name'],last_name=record['Last Name'],is_staff=record['Is Staff'],is_active=record['Is Active'])
                    usr= User.objects.get(email=record['Email'])
                    Employee.objects.filter(user=usr).update(position_id=record['Position ID'],reports_to_name=record['Report To Name'],payroll_name=record['Payroll Name'],birth_date=datetime.strptime(record['Birth Date'], "%d-%m-%Y"),position_status=record['Position Status'],worker_category_description=record['Worker Category Description'],job_title_description=record['Job Title Description'],hire_date=datetime.strptime(record['Hire Date'], "%d-%m-%Y"),region=record['Region'],eeo_establishment=record['EEO Establishment'],job_function_description=record['Job Function Description'],home_department_description=record['Home Department Description'],union_code_description=record['Union Code Description'],email=record['Email'],is_active=record['Is Active'])
                else:
                    user = User.objects.create(username=record['Email'],email=record['Email'],first_name=record['First Name'],last_name=record['Last Name'],is_staff=record['Is Staff'],is_active=record['Is Active'])
                    user.is_active = False
                    user.save()
                    subject = 'Activate Your '+domain.capitalize()+' Account'
                    message = render_to_string('mainapp/account_activation_email.html', {
                        'user': user,
                        'domain': current_site,
                        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                        'token': account_activation_token.make_token(user),
                    })
                    user.email_user(subject, message)

                    model_instances.append(Employee(
                    user=user,
                    position_id=record['Position ID'],
                    reports_to_name=record['Report To Name'],
                    payroll_name=record['Payroll Name'],
                    birth_date=datetime.strptime(record['Birth Date'], "%d-%m-%Y"),
                    position_status=record['Position Status'],
                    worker_category_description=record['Worker Category Description'],
                    job_title_description=record['Job Title Description'],
                    hire_date=datetime.strptime(record['Hire Date'], "%d-%m-%Y"),
                    region=record['Region'],
                    eeo_establishment=record['EEO Establishment'],
                    job_function_description=record['Job Function Description'],
                    home_department_description=record['Home Department Description'],
                    union_code_description=record['Union Code Description'],
                    email=record['Email'],
                    is_active=record['Is Active']
            ))
            Employee.objects.bulk_create(model_instances)
            return
        except Exception as e:
            print(e)