from django.contrib.auth.models import User
from django.shortcuts import redirect, render
from covidtestlogin.models import CovidBooster, Employee,CovidTesting,VaccineExemption,CovidWeeklyEmployeeList,CovidBoosterTesting,CovidBoosterWeeklyEmployeeList,VaccineManagementList,EmployeeVaccination
from django.views.generic import (
    CreateView, DetailView, ListView,
    UpdateView, TemplateView, View
)

from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect, JsonResponse, HttpResponse, HttpResponseForbidden, HttpResponseServerError,Http404
from django.db.models import Q
from config.settings import TIME_ZONE as timzon
import pytz
import datetime
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth import login
import json
from covidtestlogin.locations import fetchlocation
from django.contrib.auth.views import redirect_to_login
from django.contrib.auth.models import User, Group

from tenant.models import Client
import config.constants as constants
from mainapp.models import AppAccessData
from mainapp.models import Apps,AppsButtons,AppAdmins
from django.db import connection
# Create your views here.
# timeset = pytz.timezone(timzon)

def getTimeZone(request):
    try:
        timezone = request.headers['Timezone']
        if timezone:
            timeset = pytz.timezone(timezone)
        else:
            timeset = pytz.timezone("UTC")
    except Exception as e:
        timeset = pytz.timezone("UTC")
    return timeset

def subscriptionCheck(request):
    domain = str(request.get_host()).split('.')[0]
    domainValue = Client.objects.get(name=domain).subscription
    return domainValue

def logoRendering(request):
    domain = str(request.get_host()).split('.')[0]
    titlelogo = ''
    logo=''
    if not Client.objects.get(name=domain).logo == "":
        logo = Client.objects.get(name=domain).logo.url
    elif not Client.objects.get(name='public').logo == "":
        logo = Client.objects.get(name='public').logo.url
    title = Client.objects.get(name=domain).name
    if not Client.objects.get(name=domain).title_logo == "":
        titlelogo = Client.objects.get(name=domain).title_logo.url
    elif not Client.objects.get(name='public').title_logo == "":
        titlelogo = Client.objects.get(name='public').title_logo.url
    return logo,title,titlelogo

class VaccineManagement(LoginRequiredMixin,TemplateView):
    template_name = "covidtest/vaccine-management/index.html"

    def get_context_data(self, **kwargs):
        context = super(VaccineManagement, self).get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.employeeVaccineTracker:
            raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(name='Vaccine management').exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

class VaccineManagementListAPI(LoginRequiredMixin, View):
    def post(self, request):
        try:
            searchKey = self.request.POST.get("searchKey", False)

            fields = ['${{position_id}}$','${{reports_to_name}}$','${{payroll_name}}$','${{birth_date}}$','${{position_status}}$','${{worker_category_description}}$','${{job_title_description}}$','${{hire_date}}$','${{region}}$','${{eeo_establishment}}$','${{job_function_description}}$','${{home_department_description}}$','${{union_code_description}}$','${{email}}$']
            
            timeset = getTimeZone(self.request)
            
            first_data = VaccineManagementList.objects.all().order_by('-created_datetime')
            if searchKey != '':
                first_data = first_data.filter(name__icontains=searchKey)

            book_data = list(first_data.values())
            [book.update({
                'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S'),
            }) for book in book_data]
            return JsonResponse({'status': 1, 'data': book_data, 'fields':fields})
        except Exception as e:
            print(e)
            return JsonResponse({'status': 0})

class VaccineManagementCRUD(LoginRequiredMixin, View):
    def post(self, request):
        try:
            id = self.request.POST.get("id", False)
            vaccine_name = self.request.POST.get("vaccine_name", False)
            vaccine_title = self.request.POST.get("vaccine_title", False)
            vaccine_text = self.request.POST.get("vaccine_text", False)
            acknowledgement_text = self.request.POST.get("acknowledgement_text", False)
            acknowledgement_title = self.request.POST.get("acknowledgement_title", False)
            type_of_submit = self.request.POST.get("type_of_submit", False)
            published = self.request.POST.get("published", False)
            checkbox_one_text = self.request.POST.get("checkbox_one_text", False)
            checkbox_two_text = self.request.POST.get("checkbox_two_text", False)
            checkbox_three_text = self.request.POST.get("checkbox_three_text", False)
            file_upload_enable_checkbox_one = self.request.POST.get("file_upload_enable_checkbox_one", False)
            file_upload_enable_checkbox_two = self.request.POST.get("file_upload_enable_checkbox_two", False)
            file_upload_enable_checkbox_three = self.request.POST.get("file_upload_enable_checkbox_three", False)
            file_type = self.request.POST.getlist("file_type[]", False)
            file_max_size = self.request.POST.get("file_max_size", False)
            max_file_upload = self.request.POST.get("max_file_upload", False)
            is_file_upload_one_required = self.request.POST.get("is_file_upload_one_required", False)
            is_file_upload_two_required = self.request.POST.get("is_file_upload_two_required", False)
            is_file_upload_three_required = self.request.POST.get("is_file_upload_three_required", False)
            if file_type:
                file_type = ','.join(file_type)
            else:
                file_type = ''
            
            is_file_upload_one_required = True if is_file_upload_one_required=='true' else False

            is_file_upload_two_required = True if is_file_upload_two_required=='true' else False

            is_file_upload_three_required = True if is_file_upload_three_required=='true' else False

            file_upload_enable_checkbox_one = True if file_upload_enable_checkbox_one=='true' else False

            file_upload_enable_checkbox_two = True if file_upload_enable_checkbox_two=='true' else False

            file_upload_enable_checkbox_three = True if file_upload_enable_checkbox_three=='true' else False

            published = True if published=='true' else False

            vaccine_object = VaccineManagementList.objects.all()
            vaccine_name = str(vaccine_name).capitalize()
            if type_of_submit=='add':
                if vaccine_name=='' or vaccine_name==None:
                    return JsonResponse({'status': 0})
                if vaccine_object.filter(name=vaccine_name).exists() or Apps.objects.filter(app_name=vaccine_name).exists():
                    return JsonResponse({'status': 2})
                vaccine_object.create(name=vaccine_name,title=vaccine_title,text=vaccine_text,acknowledgement_text=acknowledgement_text,acknowledgement_title=acknowledgement_title, is_published=published,checkbox_one_text=checkbox_one_text,checkbox_two_text=checkbox_two_text,checkbox_three_text=checkbox_three_text,checkbox_one_file_upload=file_upload_enable_checkbox_one,checkbox_two_file_upload=file_upload_enable_checkbox_two,checkbox_three_file_upload=file_upload_enable_checkbox_three,max_file_size=file_max_size,max_file_upload=max_file_upload,file_type=file_type,created_by=self.request.user.username,is_file_upload_one_required=is_file_upload_one_required,is_file_upload_two_required=is_file_upload_two_required,is_file_upload_three_required=is_file_upload_three_required)
                groupName = vaccine_name+' dashboard'
                Group.objects.create(name=groupName)
                group_instance = Group.objects.get(name=groupName)
                group_instance.user_set.add(self.request.user)
                admin_users = list(User.objects.filter(groups__name='Organization admin').values('id'))
                url = 'https://'+request.META['HTTP_HOST']+'/vaccine/'+vaccine_name
                id = 1
                if Apps.objects.all().exists():
                    max_id = Apps.objects.all().order_by("-id").values('id')[0]
                    id = max_id['id']+1
                AppsObj = Apps.objects.create(id=id,app_name=vaccine_name,app_type='vaccine',point_of_contact=str(connection.schema_name).capitalize(),is_hidden=False,modified_by=self.request.user.username)
                for users in admin_users:
                    if not AppAdmins.objects.filter(user=users['id'],app=AppsObj).exists():
                        AppAdmins.objects.create(user=User.objects.get(id=users['id']),app=AppsObj)
                    group_instance.user_set.add(users['id'])
                id = 1
                if AppsButtons.objects.all().exists():
                    max_id = AppsButtons.objects.all().order_by("-id").values('id')[0]
                    id = max_id['id']+1
                AppsButtons.objects.create(id=id,app=AppsObj,button_href=url+'/form/',button_text='Vaccine form')
                if AppsButtons.objects.all().exists():
                    max_id = AppsButtons.objects.all().order_by("-id").values('id')[0]
                    id = max_id['id']+1
                AppsButtons.objects.create(id=id,app=AppsObj,button_href=url+'/dashboard/',button_text='Dashboard') 
                AppAccessData.objects.create(user=self.request.user,app_name="Vaccine management",app_specific_page_name=request.path,action="New Vaccine created")
            elif type_of_submit=='update':
                if id=='' or id==None or vaccine_name=='' or vaccine_name==None:
                    return JsonResponse({'status': 0})

                if vaccine_object.filter(id=id,name=vaccine_name).exists():
                    vaccine_object.filter(id=id).update(title=vaccine_title,text=vaccine_text,acknowledgement_text=acknowledgement_text,acknowledgement_title=acknowledgement_title, is_published=published,checkbox_one_text=checkbox_one_text,checkbox_two_text=checkbox_two_text,checkbox_three_text=checkbox_three_text,checkbox_one_file_upload=file_upload_enable_checkbox_one,checkbox_two_file_upload=file_upload_enable_checkbox_two,checkbox_three_file_upload=file_upload_enable_checkbox_three,max_file_size=file_max_size,max_file_upload=max_file_upload,file_type=file_type,is_file_upload_one_required=is_file_upload_one_required,is_file_upload_two_required=is_file_upload_two_required,is_file_upload_three_required=is_file_upload_three_required)
                elif vaccine_object.filter(name=vaccine_name).exists() or Apps.objects.filter(app_name=vaccine_name).exists():
                    return JsonResponse({'status': 2})
                else:
                    groupName = vaccine_name
                    oldName = VaccineManagementList.objects.get(id=id).name
                    url = 'https://'+request.META['HTTP_HOST']+'/vaccine/'
                    AppsButtons.objects.filter(button_href=url+oldName+'/form/').update(button_href=url+vaccine_name+'/form/')
                    AppsButtons.objects.filter(button_href=url+oldName+'/dashboard/').update(button_href=url+vaccine_name+'/dashboard/')
                    AppAccessData.objects.filter(app_name=oldName).update(app_name=vaccine_name)
                    groupName = vaccine_name+' dashboard'
                    oldGroupName = oldName+' dashboard'
                    Group.objects.filter(name=oldGroupName).update(name=groupName)
                    Apps.objects.filter(app_name=oldName).update(app_name=vaccine_name)
                    vaccine_object.filter(id=id).update(name=vaccine_name,title=vaccine_title,text=vaccine_text,acknowledgement_text=acknowledgement_text,acknowledgement_title=acknowledgement_title, is_published=published,checkbox_one_text=checkbox_one_text,checkbox_two_text=checkbox_two_text,checkbox_three_text=checkbox_three_text,checkbox_one_file_upload=file_upload_enable_checkbox_one,checkbox_two_file_upload=file_upload_enable_checkbox_two,checkbox_three_file_upload=file_upload_enable_checkbox_three,max_file_size=file_max_size,max_file_upload=max_file_upload,file_type=file_type,is_file_upload_one_required=is_file_upload_one_required,is_file_upload_two_required=is_file_upload_two_required,is_file_upload_three_required=is_file_upload_three_required)
                AppAccessData.objects.create(user=self.request.user,app_name="Vaccine management",app_specific_page_name=request.path,action="Vaccine updated")
            elif type_of_submit=='delete':
                if id=='' or id==None:
                    return JsonResponse({'status': 0})  
                oldName = VaccineManagementList.objects.get(id=id).name
                oldGroupName = oldName+' dashboard'
                Group.objects.filter(name=oldGroupName).delete()
                Apps.objects.filter(app_name=oldName)
                vaccine_object.filter(id=id).delete()
                AppAccessData.objects.create(user=self.request.user,app_name="Vaccine management",app_specific_page_name=request.path,action="Vaccine deleted")
            return JsonResponse({'status': 1})
        except Exception as e:
            return JsonResponse({'status': 0})
    
class Vaccine(LoginRequiredMixin,TemplateView):
    template_name = "covidtest/vaccine-form-2.html"

    def get_context_data(self, **kwargs):
        context = super(Vaccine, self).get_context_data(**kwargs)
        context['Employeedata'] = None
        context['Vaccine'] = None
        if Employee.objects.filter(user=self.request.user):
            context['Employeedata'] = Employee.objects.get(user=self.request.user)
        if VaccineManagementList.objects.filter(name__iexact=kwargs['vaccine']):
            vaccine_object = VaccineManagementList.objects.get(name__iexact=kwargs['vaccine'])
            context['Vaccine'] = vaccine_object
            employee_data = list(Employee.objects.filter(user=self.request.user).values())[0]
            vaccine_object = vaccine_object.text.split('$')
            for index,text in enumerate(vaccine_object):
                if text:
                    if text[0]=='{':
                        if text[2:len(text)-2]=='hire_date' or text[2:len(text)-2]=='birth_date':
                            vaccine_object[index] = employee_data[text[2:len(text)-2]].strftime('%m-%d-%Y')
                        else:
                            vaccine_object[index] = employee_data[text[2:len(text)-2]]
            vaccine_object = ''.join(vaccine_object)
            context['vaccine_dynamic_text'] = vaccine_object

            vaccineFormText = context['Vaccine'].acknowledgement_text.split('$')
            for index,text in enumerate(vaccineFormText):
                if text:
                    if text[0]=='{':
                        if text[2:len(text)-2]=='hire_date' or text[2:len(text)-2]=='birth_date':
                            vaccineFormText[index] = employee_data[text[2:len(text)-2]].strftime('%m-%d-%Y')
                        else:
                            vaccineFormText[index] = employee_data[text[2:len(text)-2]]
            vaccineFormText = ''.join(vaccineFormText)
            context['acknowledgement_text'] = vaccineFormText
        if EmployeeVaccination.objects.filter(user__user=self.request.user).exists():
            context['previous_submission'] = EmployeeVaccination.objects.get(user__user=self.request.user)
        context['date'] = datetime.datetime.now(tz=pytz.timezone(timzon)).strftime('%m-%d-%Y')
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context
    
    def dispatch(self, request,*args, **kwargs):
       if not subscriptionCheck(request) >= constants.employeeVaccineTracker:
            raise Http404
       if self.request.user.is_authenticated:
            if not VaccineManagementList.objects.filter(name__iexact=kwargs['vaccine']).exists() or not VaccineManagementList.objects.filter(name__iexact=kwargs['vaccine'],is_published=True).exists():
                raise Http404
            if not Employee.objects.filter(email=self.request.user.username).exists():
                return redirect('/covidtest/userdenied/')
            return super().dispatch(request, *args, **kwargs)
       return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

class VaccineUserSubmission(LoginRequiredMixin, View):
    def post(self,request):
        try:
            vaccine_type = VaccineManagementList.objects.get(id=self.request.POST.get('vaccine_type'))
            employee_obj = Employee.objects.get(email=request.user.username)
            if EmployeeVaccination.objects.filter(user__user__username=request.user.username).exists():
                employee_vacc_object = EmployeeVaccination.objects.get(user__user__username=request.user.username)
            else:
                employee_vacc_object = EmployeeVaccination()
            employee_vacc_object.user = employee_obj
            employee_vacc_object.vaccine = vaccine_type
            employee_vacc_object.file_1 = None
            employee_vacc_object.file_1_status = None
            employee_vacc_object.file_2 = None
            employee_vacc_object.file_2_status = None
            employee_vacc_object.file_3 = None
            employee_vacc_object.file_3_status = None
            employee_vacc_object.is_approved_by_staff = None
            for key, value in request.FILES.items():
                if key=='file_1':
                    employee_vacc_object.file_1 = request.FILES[key]
                    employee_vacc_object.file_1_status = None
                elif key=='file_2':
                    employee_vacc_object.file_2 = request.FILES[key]
                    employee_vacc_object.file_2_status = None
                elif key=='file_3':
                    employee_vacc_object.file_3 = request.FILES[key]
                    employee_vacc_object.file_3_status = None
            firstcheckbox = request.POST.get('firstcheckbox',False)
            secondcheckbox = request.POST.get('secondcheckbox',False)
            thirdcheckbox = request.POST.get('thirdcheckbox',False)
            employee_vacc_object.is_proof_or_vaccination_copy_provided = None
            employee_vacc_object.allow_csv_to_pull_record = None
            employee_vacc_object.signature_data = None
            employee_vacc_object.is_vaccine_declined = None
            if firstcheckbox:
                employee_vacc_object.is_proof_or_vaccination_copy_provided = True
            elif secondcheckbox:
                employee_vacc_object.allow_csv_to_pull_record = True
            elif thirdcheckbox:
                signatureurl = request.POST.get('signatureurl','')
                employee_vacc_object.signature_data = signatureurl
                employee_vacc_object.is_vaccine_declined = True
            employee_vacc_object.user_submission_datetime = datetime.datetime.now(datetime.timezone.utc)
            employee_vacc_object.save()
            AppAccessData.objects.create(user=request.user,app_name=vaccine_type.name,app_specific_page_name=request.path,action="User file uploaded")
            return JsonResponse({'status': 1})
        except Exception as e:
            return JsonResponse({'status': 0})

class VaccinationDashboard(LoginRequiredMixin,ListView):
    paginate_by = 30
    ordering = ['-pk', ]
    model = EmployeeVaccination
    template_name = "covidtest/dashboard.html"

    def get_context_data(self, **kwargs):
        context = super(VaccinationDashboard, self).get_context_data(**kwargs)
        context["location"] = json.dumps(fetchlocation())
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        context['vaccine'] = VaccineManagementList.objects.get(name__iexact=self.kwargs['vaccine']).name
        return context
    
    def dispatch(self, request,*args, **kwargs):
       if not subscriptionCheck(request) >= constants.employeeVaccineTracker:
            raise Http404
       if self.request.user.is_authenticated:
            if not VaccineManagementList.objects.filter(name__iexact=kwargs['vaccine']).exists() or not VaccineManagementList.objects.filter(name__iexact=kwargs['vaccine'],is_published=True).exists():
                raise Http404
            if not self.request.user.groups.filter(name__iexact=kwargs['vaccine']+' dashboard').exists():
               return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
       return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

class VaccinationDashboardListAPI(View):

    def post(self, request):
        try:
            county_name = self.request.POST.get("county_name", False)
            is_vaccinated = self.request.POST.get("is_vaccinated", '')
            date_start = self.request.POST.get("date_start", False)
            date_end = self.request.POST.get("date_end", False)
            limit = self.request.POST.get("limit", False)
            page = self.request.POST.get("page", False)
            searchKey = self.request.POST.get("searchKey", False)
            vaccine_type = self.request.POST.get("vaccine_type", False)

            timeset = getTimeZone(self.request)

            date_start = date_start + ' 00:00:00'
            date_end = date_end + ' 23:59:59'
            pendingrecord = Employee.objects.filter(employeevaccination__isnull=True)
            first_data = EmployeeVaccination.objects.filter(
                vaccine__name__iexact=vaccine_type,user_submission_datetime__range=(date_start, date_end),user__is_active=True)
            if searchKey != '':
                first_data = first_data.filter(user__position_id__icontains=searchKey)
                pendingrecord = pendingrecord.filter(position_id__icontains=searchKey)
            if county_name != 'all':
                first_data = first_data.filter(user__eeo_establishment=county_name)
                pendingrecord = pendingrecord.filter(eeo_establishment=county_name)
            first_data_reference = first_data
            if is_vaccinated != '':
                if(is_vaccinated=='True'):
                    first_data = first_data.filter(Q(is_proof_or_vaccination_copy_provided=True) | Q(allow_csv_to_pull_record=True))
                elif(is_vaccinated=='False'):
                    first_data = first_data.filter(is_vaccine_declined=True)
                elif(is_vaccinated=='pending'):
                    first_data = pendingrecord
            if is_vaccinated=='pending':
                book_data = list(
                    first_data.values('id','position_id','payroll_name','job_title_description','home_department_description','employeevaccination__file_1_status','employeevaccination__file_1','employeevaccination__file_2_status','employeevaccination__file_2','employeevaccination__file_3_status','employeevaccination__file_3','employeevaccination__is_proof_or_vaccination_copy_provided','employeevaccination__is_vaccine_declined','employeevaccination__allow_csv_to_pull_record','employeevaccination__user_submission_datetime','employeevaccination__is_approved_by_staff').order_by('-employeevaccination__user_submission_datetime'))
                [book.update({
                    'user_submission_datetime': book['employeevaccination__user_submission_datetime'],
                    'user__position_id': book['position_id'],
                    'user__payroll_name': book['payroll_name'],
                    'user__job_title_description': book['job_title_description'],
                    'user__home_department_description': book['home_department_description'],
                    'is_proof_or_vaccination_copy_provided': book['employeevaccination__is_proof_or_vaccination_copy_provided'],
                    'is_vaccine_declined': book['employeevaccination__is_vaccine_declined'],
                    'allow_csv_to_pull_record': book['employeevaccination__allow_csv_to_pull_record'],
                    'is_approved_by_staff': book['employeevaccination__is_approved_by_staff'],
                    'file_1': book['employeevaccination__file_1'],
                    'file_1_status': book['employeevaccination__file_1_status'],
                    'file_2': book['employeevaccination__file_2'],
                    'file_2_status': book['employeevaccination__file_2_status'],
                    'file_3': book['employeevaccination__file_3'],
                    'file_3_status': book['employeevaccination__file_3_status'],
                    'user__id': book['id']
                }) for book in book_data]
            else:
                book_data = list(
                    first_data.values('id','user__id','user__position_id','user__payroll_name','user__job_title_description','user__home_department_description','is_proof_or_vaccination_copy_provided','is_vaccine_declined','allow_csv_to_pull_record','user_submission_datetime','is_approved_by_staff','file_1','file_1_status','file_2','file_2_status','file_3','file_3_status').order_by('-user_submission_datetime'))
                [book.update({
                    'user_submission_datetime': book['user_submission_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S'),
                }) for book in book_data]
            country_count = {
                'all': len(first_data_reference.filter(Q(is_proof_or_vaccination_copy_provided=True) | Q(allow_csv_to_pull_record=True)))+len(first_data_reference.filter(is_vaccine_declined=True))+len(first_data_reference.filter(is_proof_or_vaccination_copy_provided=None,allow_csv_to_pull_record=None,is_vaccine_declined=None)),
                'pending': len(pendingrecord),
                'vaccinated': len(first_data_reference.filter(Q(is_proof_or_vaccination_copy_provided=True) | Q(allow_csv_to_pull_record=True))),
                'unvaccinated': len(first_data_reference.filter(is_vaccine_declined=True))
            }
            if limit and page:
                offset = (int(page) - 1) * int(limit)
                end_offset = offset + int(limit)
                no_item = len(book_data)
                total_page = no_item / int(limit)
                if no_item % int(limit) != 0:
                    total_page += 1
                book_data = book_data[offset:end_offset]
                if len(book_data) == 0:
                    details = {'status': '0', 'error': 'No Data Found'}
                else:
                    details = {
                        'status': '1',
                        'totalPages': int(total_page),
                        'currentPage': page,
                    }
            else:
                details = {"status": "0",
                           "error": "limit or page input missing"}
            return JsonResponse({'status': '1', 'data': book_data, 'pagination': details, 'country_count': country_count})
        except Exception as e:
            print(e)
            return JsonResponse({'status': '0', 'data': [], 'country_count': []})

class CovidNonTestingDetailView(LoginRequiredMixin, DetailView):
    model = EmployeeVaccination
    template_name = "covidtest/detail-appointment.html"

    def dispatch(self, request,*args, **kwargs):
       if not subscriptionCheck(request) >= constants.employeeVaccineTracker:
            raise Http404
       return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
            context = super().get_context_data(**kwargs)
            logo, title, titlelogo = logoRendering(self.request)
            context['logo'] = logo
            context['title'] = title
            context['titlelogo'] = titlelogo
            return context

class CovidFileUpdateAPIView(View):
    def post(self, request):
        try:
            file_approve = self.request.POST.get("file_approve")
            file_name = self.request.POST.get("file_name", '')
            rejectcomment = self.request.POST.get("rejectcomment", '')
            user_id = self.request.POST.get("user_id", '')
            vaccine_type = self.request.POST.get("vaccine_type", False)
            Employeeobj = Employee.objects.get(id=user_id)
            employee_vacc_object = EmployeeVaccination.objects.get(user=Employeeobj,vaccine__name=vaccine_type)
            if file_approve=='true':
                if file_name=='file_1':
                    employee_vacc_object.file_1_status = True
                elif file_name=='file_2':
                    employee_vacc_object.file_2_status = True
                elif file_name=='file_3':
                    employee_vacc_object.file_3_status = True
                employee_vacc_object.save()
            else:
                if file_name=='file_1':
                    employee_vacc_object.file_1_status = False
                elif file_name=='file_2':
                    employee_vacc_object.file_2_status = False
                elif file_name=='file_3':
                    employee_vacc_object.file_3_status = False
                emailuser = Employeeobj.email
                name = Employeeobj.payroll_name
                logo, title, titlelogo = logoRendering(self.request)
                subject, from_email, to = 'Employee Vaccine Tracker – Vaccination Card Corrections',settings.EMAIL_HOST_USER, str(emailuser)
                text_content = 'This is an important message.'
                html_content = '<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0"><div style="border-bottom:1px solid #eee"><a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">'+str(title)+'</a></div><p style="font-size:1.1em">Hi,' +str(name)+'</p><p>Thank you for uploading the vaccine card. Please rectify the below issue and upload the document once again for review.</p><p>'+rejectcomment+'</p><p style="font-size:0.9em;">Regards,<br />'+str(title)+'Team</p><hr style="border:none;border-top:1px solid #eee" /><div style="float:left;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300"><p></p><p></p><p></p><p></p><p></p></div></div></div>'
                msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
                msg.attach_alternative(html_content, "text/html")
                msg.send()
                employee_vacc_object.save()
                AppAccessData.objects.create(user=self.request.user,app_name=vaccine_type,app_specific_page_name=self.request.path,action="User file updated")
            return JsonResponse({'status': '1'})
        except Exception as e:
            print(e)
            return JsonResponse({'status': e})

class CovidEpicrecordUpdateAPIView(View):
     def post(self, request):
        try:
            epicmedical_status = self.request.POST.get("epicmedical_status")
            user_id = self.request.POST.get("user_id", '')
            epicrejectcomment = self.request.POST.get("epicrejectcomment",'')
            vaccine_type = self.request.POST.get("vaccine_type", False)
            Employeeobj = Employee.objects.get(id=user_id)
            employee_vacc_object = EmployeeVaccination.objects.get(user=Employeeobj,vaccine__name=vaccine_type)
            if epicmedical_status=='approve':
                employee_vacc_object.is_approved_by_staff=True
                emailuser = Employeeobj.email
                name = Employeeobj.payroll_name
                logo, title, titlelogo = logoRendering(self.request)
                subject, from_email, to = 'Medical Record - Approved',settings.EMAIL_HOST_USER, str(emailuser)
                text_content = 'This is an important message.'
                html_content = '<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0"><div style="border-bottom:1px solid #eee"><a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">'+str(title)+'</a></div><p style="font-size:1.1em">Hi,' +str(name)+'</p><p>Your Medical Record is Approved</p><p style="font-size:0.9em;">Regards,<br />'+str(title)+' Team</p><hr style="border:none;border-top:1px solid #eee" /><div style="float:left;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300"><p></p><p></p><p></p><p></p><p></p></div></div></div>'
                msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
                msg.attach_alternative(html_content, "text/html")
                msg.send()
            elif epicmedical_status=='reject':
                employee_vacc_object.is_approved_by_staff=False
                emailuser = Employeeobj.email
                name = Employeeobj.payroll_name
                subject, from_email, to = 'Medical Record - Rejected',settings.EMAIL_HOST_USER, str(emailuser)
                text_content = 'This is an important message.'
                html_content = '<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0"><div style="border-bottom:1px solid #eee"><a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Clinica Sierra Vista</a></div><p style="font-size:1.1em">Hi,' +str(name)+'</p><p>Your Medical Record is Rejected</p><p>Reason:</p><p>'+epicrejectcomment+'</p><p style="font-size:0.9em;">Regards,<br />CSV Team</p><hr style="border:none;border-top:1px solid #eee" /><div style="float:left;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300"><p></p><p></p><p></p><p></p><p></p></div></div></div>'
                msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
                msg.attach_alternative(html_content, "text/html")
                msg.send()
            employee_vacc_object.save()
            AppAccessData.objects.create(user=self.request.user,app_name=vaccine_type,app_specific_page_name=self.request.path,action="User recorded uploaded")
            return JsonResponse({'status': '1'})
        except Exception as e:
            return JsonResponse({'status': e})

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[-1].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def UserPageVaccineExemption(request):
    if request.user.is_authenticated:
        if request.user.groups.filter(name='Vaccine tracker').exists():
            filedownload = settings.PDF_FILE_DOWNLOAD_LOCATION
            if Employee.objects.filter(email=request.user.username):
                Employeedata = Employee.objects.get(email=request.user.username)
                if Employeedata.is_vaccine_declined:
                    date = datetime.datetime.now(tz=pytz.timezone(timzon)).strftime('%m-%d-%Y')
                    logo, title, titlelogo = logoRendering(request)
                    return render(request,'covidtest/user-exemption.html', {'Employeedata': Employeedata, 'date': date, 'filedownload':filedownload, 'title':title,'logo':logo, 'titlelogo':titlelogo})
                else:
                    return redirect('/covidtest/user/loggedin/')
            else:
                return redirect('/covidtest/userdenied/')
        else:
                return redirect('/permissiondenied/')
    else:
        return redirect('/covidtest/')

def UserPageVaccineExemptionForm(request,chosen):
    if request.user.is_authenticated:
        if request.user.groups.filter(name='Vaccine tracker').exists():
            if Employee.objects.filter(email=request.user.username):
                Employeedata = Employee.objects.get(email=request.user.username)
                if Employeedata.is_vaccine_declined and chosen=='medical' or chosen=='religion':
                    date = datetime.datetime.now(tz=pytz.timezone(timzon)).strftime('%m-%d-%Y')
                    logo, title, titlelogo = logoRendering(request)
                    return render(request,'user-exemption-form.html', {'Employeedata': Employeedata, 'date': date,'chosen':chosen, 'title':title, 'logo':logo, 'titlelogo':titlelogo})
                else:
                    return redirect('/covidtest/user/loggedin/')
            else:
                return redirect('/covidtest/userdenied/')
        else:
               return redirect('/permissiondenied/')
    else:
        return redirect('/covidtest/')

def UserUploadVaccineExemption(request):
    try:
        if request.method=="POST":
            Employeeobj = Employee.objects.get(email=request.user.username)
            Employeefilter = Employee.objects.filter(email=request.user.username)
            if not VaccineExemption.objects.filter(user=Employeefilter.values()[0]['user_id']):
                Vaccineexemtiontable = VaccineExemption()
                Vaccineexemtiontable.user = Employeeobj
            else:
                Vaccineexemtiontable = VaccineExemption.objects.get(user=Employeefilter.values()[0]['user_id'])
            medicalcheckbox = request.POST.get('medicalcheckbox',False)
            religioncheckbox = request.POST.get('religioncheckbox',False)
            signatureurl = request.POST.get('signatureurl')
            religioustextarea = request.POST.get('religioustextarea','')
            if medicalcheckbox:
                Vaccineexemtiontable.type_of_exemption = 'medical'
                Vaccineexemtiontable.religious_exemption_text = None
            elif religioncheckbox:
                Vaccineexemtiontable.type_of_exemption = 'religion'
                Vaccineexemtiontable.religious_exemption_text = religioustextarea
            for key, value in request.FILES.items():
                if key=='file_1':
                    Vaccineexemtiontable.file_1 = request.FILES[key]
                    Vaccineexemtiontable.file_1_status = None
                elif key=='file_2':
                    Vaccineexemtiontable.file_2 = request.FILES[key]
                    Vaccineexemtiontable.file_2_status = None
                elif key=='file_3':
                    Vaccineexemtiontable.file_3 = request.FILES[key]
                    Vaccineexemtiontable.file_3_status = None
                elif key=='file_4':
                    Vaccineexemtiontable.file_4 = request.FILES[key]
                    Vaccineexemtiontable.file_4_status = None
                elif key=='file_5':
                    Vaccineexemtiontable.file_5 = request.FILES[key]
                    Vaccineexemtiontable.file_5_status = None
                elif key=='file_6':
                    Vaccineexemtiontable.file_6 = request.FILES[key]
                    Vaccineexemtiontable.file_6_status = None
                elif key=='file_7':
                    Vaccineexemtiontable.file_7 = request.FILES[key]
                    Vaccineexemtiontable.file_7_status = None
            Vaccineexemtiontable.signature = signatureurl
            Vaccineexemtiontable.save()
        AppAccessData.objects.create(user=request.user,app_name="Vaccine tracker",app_specific_page_name=request.path,action="User vaccine exemption uploaded")
        return redirect('/covidtest/success/')
    except Exception as e:
        return HttpResponseServerError('Oops! Some Error has occured. Please try again')

class VaccineExemptionDashboard(LoginRequiredMixin,ListView):
    paginate_by = 30
    ordering = ['-pk', ]
    model = VaccineExemption
    template_name = "covidtest/vaccine-exemption-dashboard.html"

    def get_context_data(self, **kwargs):
        context = super(VaccineExemptionDashboard, self).get_context_data(**kwargs)
        context["location"] = json.dumps(fetchlocation())
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        context['vaccine'] = VaccineManagementList.objects.get(name__iexact=self.kwargs['vaccine']).name
        return context
    
    def dispatch(self, request,*args, **kwargs):
       if not subscriptionCheck(request) >= constants.employeeVaccineTracker:
            raise Http404
       if self.request.user.is_authenticated:
            if not VaccineManagementList.objects.filter(name__iexact=kwargs['vaccine']).exists():
                raise Http404
            if not self.request.user.groups.filter(name='Vaccine tracker dashboard').exists():
               return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
       return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

       

class VaccineExemptionDashboardListAPIView(View):
    def post(self, request):
        try:
            county_name = self.request.POST.get("county_name", False)
            date_start = self.request.POST.get("date_start", False)
            date_end = self.request.POST.get("date_end", False)
            limit = self.request.POST.get("limit", False)
            page = self.request.POST.get("page", False)
            vaccine_type = self.request.POST.get("vaccine_type", False)
            searchKey = self.request.POST.get("searchKey", False)
            
            timeset = getTimeZone(self.request)

            date_start = date_start + ' 00:00:00'
            date_end = date_end + ' 23:59:59'

            first_data = VaccineExemption.objects.filter(vaccine__name__iexact=vaccine_type,created_datetime__range=(date_start, date_end))
            if searchKey != '':
                first_data = first_data.filter(user__position_id__icontains=searchKey)

            if county_name != 'all':
                first_data = first_data.filter(user__eeo_establishment=county_name)

            book_data = list(
                first_data.values().order_by('-created_datetime'))
            [book.update({
                'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S'),
            }) for book in book_data]

            for i in book_data:
               user = i['user_id']
               user_id = VaccineExemption.objects.filter(user=user)
               employee_list = list(Employee.objects.filter(position_id=user_id[0]).values())
               for items in employee_list:
                    i['position_id']=items['position_id']
                    i['job_title_description'] = items['job_title_description']
                    i['payroll_name'] = items['payroll_name']
                    i['home_department_description'] = items['home_department_description']
                    i['email'] = items['email']
                    i['eeo_establishment'] = items['eeo_establishment']
                    i['reports_to_name'] = items['reports_to_name']

            country_count = {
                'all': len(first_data)
            }
            if limit and page:
                offset = (int(page) - 1) * int(limit)
                end_offset = offset + int(limit)
                no_item = len(book_data)
                total_page = no_item / int(limit)
                if no_item % int(limit) != 0:
                    total_page += 1
                book_data = book_data[offset:end_offset]
                if len(book_data) == 0:
                    details = {'status': '0', 'error': 'No Data Found'}
                else:
                    details = {
                        'status': '1',
                        'totalPages': int(total_page),
                        'currentPage': page,
                    }
            else:
                details = {"status": "0",
                           "error": "limit or page input missing"}
            return JsonResponse({'status': '1', 'data': book_data, 'pagination': details, 'country_count': country_count})
        except Exception as e:
            return JsonResponse({'status': '0', 'data': str(e), 'country_count': 0})

class VaccineExemptionDeatils(LoginRequiredMixin, DetailView):
    model = VaccineExemption
    template_name = "covidtest/detail-vaccine-exemption.html"

    def dispatch(self, request,*args, **kwargs):
       if not subscriptionCheck(request) >= constants.employeeVaccineTracker:
            raise Http404
       return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
            context = super().get_context_data(**kwargs)
            logo, title, titlelogo = logoRendering(self.request)
            context['logo'] = logo
            context['title'] = title
            context['titlelogo'] = titlelogo
            return context

class VaccineExemptionFileUpdateAPIView(View):
    def post(self, request):
        try:
            file_approve = self.request.POST.get("file_approve")
            file_name = self.request.POST.get("file_name", '')
            rejectcomment = self.request.POST.get("rejectcomment", '')
            user_id = self.request.POST.get("user_id", '')
            Employeeobj = VaccineExemption.objects.get(id=user_id)
            emailuser = self.request.POST.get("email")
            name = self.request.POST.get("name")
            if file_approve=='true':
                if file_name=='file_1':
                    Employeeobj.file_1_status = True
                elif file_name=='file_2':
                    Employeeobj.file_2_status = True
                elif file_name=='file_3':
                    Employeeobj.file_3_status = True
                Employeeobj.staff = self.request.user.username+','+get_client_ip(request)
                Employeeobj.reviewed_date = datetime.datetime.now(tz=pytz.timezone(timzon)).date()
                Employeeobj.save()
                subject, from_email, to = 'Vaccine Exemption – Approved',settings.EMAIL_HOST_USER, str(emailuser)
                text_content = 'This is an important message.'
                html_content = '<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0"><div style="border-bottom:1px solid #eee"><a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Clinica Sierra Vista</a></div><p style="font-size:1.1em">Hi,' +str(name)+'</p><p>Your Vaccine Exemption submission is Approved</p><p style="font-size:0.9em;">Regards,<br />CSV Team</p><hr style="border:none;border-top:1px solid #eee" /><div style="float:left;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300"><p>Clinica Sierra Vista</p><p>1430 Truxtun Avenue</p><p>Suite 400</p><p>Bakersfield, CA 93301</p><p>661-635-3050</p></div></div></div>'
                msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
                msg.attach_alternative(html_content, "text/html")
                msg.send()
            else:
                if file_name=='file_1':
                    Employeeobj.file_1_status = False
                elif file_name=='file_2':
                    Employeeobj.file_2_status = False
                elif file_name=='file_3':
                    Employeeobj.file_3_status = False
                elif file_name=='file_4':
                    Employeeobj.file_4_status = False
                elif file_name=='file_5':
                    Employeeobj.file_5_status = False
                elif file_name=='file_6':
                    Employeeobj.file_6_status = False
                elif file_name=='file_7':
                    Employeeobj.file_7_status = False
                subject, from_email, to = 'Vaccine Exemption - Rejected',settings.EMAIL_HOST_USER, str(emailuser)
                text_content = 'This is an important message.'
                html_content = '<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0"><div style="border-bottom:1px solid #eee"><a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Clinica Sierra Vista</a></div><p style="font-size:1.1em">Hi,' +str(name)+'</p><p>Your Vaccine Exemption submission is Rejected. Reason for rejection</p><p>'+rejectcomment+'</p><p style="font-size:0.9em;">Regards,<br />CSV Team</p><hr style="border:none;border-top:1px solid #eee" /><div style="float:left;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300"><p>Clinica Sierra Vista</p><p>1430 Truxtun Avenue</p><p>Suite 400</p><p>Bakersfield, CA 93301</p><p>661-635-3050</p></div></div></div>'
                msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
                msg.attach_alternative(html_content, "text/html")
                msg.send()
                Employeeobj.staff = self.request.user.username+','+get_client_ip(request)
                Employeeobj.reviewed_date = datetime.datetime.now(tz=pytz.timezone(timzon)).date()
                Employeeobj.save()
            AppAccessData.objects.create(user=self.request.user,app_name="Vaccine tracker",app_specific_page_name=self.request.path,action="Vaccine exemption status updated")
            return JsonResponse({'status': '1'})
        except Exception as e:
            return JsonResponse({'status': e})

class VaccineAdminFileSubmission(LoginRequiredMixin, View):
    def post(self,request):
        try:
            user_id=request.POST.get("userid")
            employee_obj = Employee.objects.get(id=user_id)
            employee_vacc_object = EmployeeVaccination()
            employee_vacc_object.user = employee_obj
            employee_vacc_object.vaccine = VaccineManagementList.objects.get(name__iexact=self.request.POST.get('vaccine_type'))
            for key, value in request.FILES.items():
                if key=='file_1':
                    employee_vacc_object.file_1 = request.FILES[key]
                    employee_vacc_object.file_1_status = None
                elif key=='file_2':
                    employee_vacc_object.file_2 = request.FILES[key]
                    employee_vacc_object.file_2_status = None
                elif key=='file_3':
                    employee_vacc_object.file_2 = request.FILES[key]
                    employee_vacc_object.file_2_status = None
            employee_vacc_object.is_proof_or_vaccination_copy_provided = True
            employee_vacc_object.user_submission_datetime = datetime.datetime.now(datetime.timezone.utc)
            employee_vacc_object.save()
            AppAccessData.objects.create(user=request.user,app_name=self.request.POST.get('vaccine_type'),app_specific_page_name=request.path,action="Admin file uploaded")
            return JsonResponse({'status': 1})
        except Exception as e:
            return JsonResponse({'status': 0})

def media_access(request, path=None):
    """
    When trying to access :
    myproject.com/media/uploads/passport.png

    If access is authorized, the request will be redirected to
    myproject.com/protected/media/uploads/passport.png

    This special URL will be handle by nginx we the help of X-Accel
    """
    # https://b0uh.github.io/protect-django-media-files-per-user-basis-with-nginx.html

    access_granted = False

    user = request.user
    if user.is_authenticated:
        access_granted = True
    else:
        pass

    if access_granted:
        response = HttpResponse()
        # Content-type will be detected by nginx
        del response['Content-Type']
        response['X-Accel-Redirect'] = '/protected/' + path
        return response
    else:
        return HttpResponseForbidden('Not authorized to access this media.')

class UserDenied(TemplateView):
    template_name = 'covidtest/userdenied.html'

    def get_context_data(self, **kwargs):
            context = super().get_context_data(**kwargs)
            logo, title, titlelogo = logoRendering(self.request)
            context['logo'] = logo
            context['title'] = title
            context['titlelogo'] = titlelogo
            return context