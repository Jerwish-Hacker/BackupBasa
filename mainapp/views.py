from typing import Any
from django.http import HttpRequest, HttpResponseRedirect, JsonResponse, Http404
from django.http.response import HttpResponse as HttpResponse
from django.shortcuts import render, redirect,get_object_or_404
from django.views.generic import TemplateView,View, DetailView
from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from mainapp.keycloak import create_keycloak_record
from mainapp.models import AppAdmins, FavouriteApps,AppAccessData, Apps, AppsButtons, AppOrdering, Location, QualityServices, PasswordResetOTP,AppLocation,UserAssignedLocations,OrganisationSSO
from outreach.models import OutreachList,OutreachPatient,OutreachPatientCallDetails
from tenant.models import MemberPatient,MemberConsent,MemberConsentHistory,Client, TenantMembers
from django.contrib.auth.models import User
from config.settings import TIME_ZONE as timzon
from django.db.models import Q
import pytz
from django.contrib.auth.models import User, Group
from django.contrib.auth.views import redirect_to_login
from django.contrib import messages
from django.core.mail import EmailMultiAlternatives
import random
from django.contrib.auth.hashers import make_password
from django.db import connection
import tenant.models as preload
from django.utils.encoding import force_bytes,force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.template.loader import render_to_string
from .tokens import account_activation_token
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from django_celery_beat.models import PeriodicTask, PeriodicTasks, CrontabSchedule
import json
import string
from grievanceapp.models import Grievance,IncidentReport,Compliance
from staffplanning.models import StaffPlanning,StaffPlanningDental,StaffPlanningOptometry
from bookingforms.constants import get_regions_in_country
from bookingforms.models import UploadUrlModel
from .models import Form, Field, FormSubmission
from django.forms import Form as DjangoForm, RadioSelect, CheckboxSelectMultiple, CharField, ChoiceField, MultipleChoiceField, DateField, DateInput, Textarea
import ast
from .forms import CustomMultipleChoiceField
from django.core.paginator import Paginator
from covidtestlogin.models import Employee
import pandas as pd
from bookingforms.tasks import users_bulk_creation
from django.contrib.auth import login

# timeset = pytz.timezone(timzon)

def autoLoginCheck(request):
    try:
        email = request.headers['Email']
        if email != '':
            print("Email :", email)
            user = User.objects.get(email=email)
            login(request,user,backend='django.contrib.auth.backends.ModelBackend')
            return True
        else:
            return False
    except Exception as e:
         print(e)
         return False

def getTimeZone(request):
    try:
        timezone = request.headers['Timezone']
        if timezone:
            timeset = pytz.timezone(timezone)
        else:
            timeset = pytz.timezone(request.META.get('HTTP_TIMEZONE'))
    except Exception as e:
        timeset = pytz.timezone("UTC")
    return timeset

def GetClientName(host):
    domain = host.split('.')[0]
    if domain == 'www':
        domain = host.split('.')[1]
    return domain

def subscriptionCheck(request):
    domain = str(request.get_host()).split('.')[0]
    if domain == 'www':
        domain = str(request.get_host()).split('.')[1]
    domainValue = preload.Client.objects.get(name=domain).subscription
    return domainValue

def logoRendering(request):
    try:
        domain = str(request.get_host()).split('.')[0]
        if domain=="localhost:8000":
            domain = 'public'
        titlelogo = ''
        logo=''
        if not preload.Client.objects.filter(name=domain).exists():
            logo = preload.Client.objects.get(name='public').logo.url
            titlelogo = preload.Client.objects.get(name='public').title_logo.url
            title = 'Yetti | Healthcare'
        else:
            if not preload.Client.objects.get(name=domain).logo == "":
                logo = preload.Client.objects.get(name=domain).logo.url
            elif not preload.Client.objects.get(name='public').logo == "":
                logo = preload.Client.objects.get(name='public').logo.url
            title = preload.Client.objects.get(name=domain).name
            if not preload.Client.objects.get(name=domain).title_logo == "":
                titlelogo = preload.Client.objects.get(name=domain).title_logo.url
            elif not preload.Client.objects.get(name='public').title_logo == "":
                titlelogo = preload.Client.objects.get(name='public').title_logo.url
        return logo,title,titlelogo
    except Exception as e:
        return JsonResponse({'error': e})

class LoginRequiredAutoLogin(LoginRequiredMixin):

    def dispatch(self, request,*args, **kwargs):
        if self.request.user.is_authenticated:
            if not self.request.user.is_staff:
                return redirect('consent/management/')
            return super().dispatch(request, *args, **kwargs)
        is_logged_in = autoLoginCheck(request)
        if is_logged_in:
            if self.request.user.is_authenticated:
                if not self.request.user.is_staff:
                    return redirect('consent/management/')
                return super().dispatch(request, *args, **kwargs)
        return redirect('/logout')

class Index(LoginRequiredAutoLogin,TemplateView):
    template_name = 'mainapp/apps.html'

    def get_context_data(self, **kwargs):
        context = super(Index, self).get_context_data(**kwargs)
        client_name = GetClientName(self.request.META['HTTP_HOST'])
        context["organisation_name"] = client_name.capitalize()
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        context['page_name'] = 'Home Page'
        threshold = subscriptionCheck(self.request)
        user_groups = self.request.user.groups.values_list('name', flat=True)
        if not self.request.user.groups.filter(name="Organization admin").exists(): 
            apps_type_list = Apps.objects.filter(Q(subscription__lte=threshold) & (Q(app_name__in=user_groups) | Q(app_type='vaccine') | Q(app_name='Secure upload'))).order_by('app_type').values_list('app_type', flat=True).distinct()
        else:
            apps_type_list = Apps.objects.filter(subscription__lte=threshold).order_by('app_type').values_list('app_type', flat=True).distinct()
        apps_type_list = list(apps_type_list)
        if 'administration' in apps_type_list:
            context['is_administration'] = True
        if 'frontoffice' in apps_type_list:
            context['is_frontoffice'] = True
        if 'humanresources' in apps_type_list or 'vaccine' in apps_type_list:
            context['is_humanresources'] = True
        if 'operations' in apps_type_list:
            context['is_operations'] = True
        if 'outreach' in apps_type_list:
            context['is_outreach'] = True
        if 'quality' in apps_type_list:
            context['is_quality'] = True
        return context

class FetchFavouriteApps(LoginRequiredMixin,View):

    def post(self, request):
        try:
            favourite_app = self.request.POST.get("favourite_app",None)
            operation_type = self.request.POST.get("operation_type",None)
            if operation_type=="Add to favourites":
                if not FavouriteApps.objects.filter(user=self.request.user,app=favourite_app).exists():
                    FavouriteApps.objects.create(user=self.request.user,app=Apps.objects.get(id=favourite_app))
            elif  operation_type=="Remove from favourites":
                if FavouriteApps.objects.filter(user__username=self.request.user.username,app=favourite_app).exists():
                    FavouriteApps.objects.get(user__username=self.request.user.username,app=favourite_app).delete()
            favourite_list = list(FavouriteApps.objects.filter(user__username=self.request.user.username).values())
            return JsonResponse({'status':1,'favourite_list':favourite_list})
        except Exception as e:
            return JsonResponse({'status':0,'favourite_list':[]})

    def get(self, request):
        try:
            favourite_list = list(FavouriteApps.objects.filter(user__username=self.request.user.username).values())
            return JsonResponse({'status':1,'favourite_list':favourite_list})
        except Exception as e:
            return JsonResponse({'status':0,'favourite_list':[]})

class UserTracker(LoginRequiredMixin, View):
    def post(self, request):
        try:
            app_name = self.request.POST.get("app_name",None)
            app_specific_page = self.request.POST.get("app_specific_page",None)
            if app_name!=None and app_name!='' and app_specific_page!=None and app_specific_page!='':
                AppAccessData.objects.create(user=self.request.user,app_name=app_name,app_specific_page_name=app_specific_page)
            return JsonResponse({'status':1})
        except Exception as e:
            return JsonResponse({'status':0})
    
class UserTrackerGetList(LoginRequiredMixin, View):
    def post(self, request):
        threshold = subscriptionCheck(request)
        try:
            app_name = self.request.POST.get("app_name",None)
            search_key = self.request.POST.get("search_key",None)
            date_start = self.request.POST.get("date_start",None)
            date_end = self.request.POST.get("date_end",None)
            limit = self.request.POST.get("limit", False)
            page = self.request.POST.get("page", False)

            date_start = date_start + ' 00:00:00'
            date_end = date_end + ' 23:59:59'

            timeset = getTimeZone(self.request)
            
            tracker_list = AppAccessData.objects.filter(created_datetime__range=(date_start, date_end))

            if app_name!='all':
                tracker_list = tracker_list.filter(app_name=app_name)
            
            if search_key!='':
                tracker_list = tracker_list.filter(Q(app_name__icontains=search_key) | Q(app_specific_page_name__icontains=search_key) | Q(user__username__icontains=search_key))

            tracker_list = list(tracker_list.values().order_by('-created_datetime'))

            total_visits = len(tracker_list)
            
            if limit and page:
                offset = (int(page) - 1) * int(limit)
                end_offset = offset + int(limit)
                no_item = len(tracker_list)
                total_page = no_item / int(limit)
                if no_item % int(limit) != 0:
                    total_page += 1
                tracker_list = tracker_list[offset:end_offset]
                if len(tracker_list) == 0:
                    pagination = {'status': '0', 'error': 'No Data Found'}
                else:
                    pagination = {
                        'status': '1',
                        'totalPages': int(total_page),
                        'currentPage': page,
                    }
            else:
                pagination = {"status": "0",
                           "error": "limit or page input missing"}

            

            for elem in tracker_list:
                elem['username'] = User.objects.get(id=elem['user_id']).username
                elem['created_datetime'] = elem['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S')

            appobj = Apps.objects.filter(subscription__lte=threshold).all().values('app_name')
            apps_list = []
            for apps in appobj:
                apps_list.append([apps['app_name'],apps['app_name']])
            return JsonResponse({'status':1,'tracker_list':tracker_list, 'pagination':pagination, 'total_visits':total_visits, 'apps_list':apps_list})
        except Exception as e:
            return JsonResponse({'status':0,'tracker_list':[],'pagination':[], 'is_user_has_access':None, 'total_visits':0, 'apps_list':[]})

class UserDetails(LoginRequiredMixin, View):
    def post(self,request):
        try:
            searchKey = self.request.POST.get("searchKey", False)
            limit = self.request.POST.get("limit", False)
            page = self.request.POST.get("page", False)
            box_type_selected = self.request.POST.get("box_type_selected",False)
            if self.request.user.is_superuser:
                data =  User.objects.all()
            elif self.request.user.groups.filter(name="Organization admin").exists() and not self.request.user.is_superuser:
                data =  User.objects.filter(is_superuser=False)
            else:
                data =  User.objects.filter(~Q(groups__name="Organization admin"))
            if searchKey!='':
                data = data.filter(Q(username__icontains=searchKey) | Q(email__icontains=searchKey) | Q(first_name__icontains=searchKey) | Q(last_name__icontains=searchKey))
            data_before_filter = data
            if box_type_selected!='users_all':
                data = data.filter(groups__name=box_type_selected)

            user_count = {
                'all':len(data_before_filter),
                'org_admin':len(data_before_filter.filter(groups__name='Organization admin'))
            }

            data = list(data.values('id','username','first_name','last_name','email','is_staff').order_by('username'))

            if limit and page:
                offset = (int(page) - 1) * int(limit)
                end_offset = offset + int(limit)
                no_item = len(data)
                total_page = no_item / int(limit)
                if no_item % int(limit) != 0:
                    total_page += 1
                data = data[offset:end_offset]
                if len(data) == 0:
                    pagination = {'status': '0', 'error': 'No Data Found'}
                else:
                    pagination = {
                        'status': '1',
                        'totalPages': int(total_page),
                        'currentPage': page,
                    }
            else:
                pagination = {"status": "0",
                           "error": "limit or page input missing"}
            apps_list = list(Apps.objects.all().values('app_name').order_by('id','app_name'))
            outreach_list = list(OutreachList.objects.all().values())
            return JsonResponse({'status': 1, 'data': data, 'pagination':pagination,'apps_list':apps_list,'outreach_list':outreach_list,'user_count':user_count})
        except Exception as e:
            return JsonResponse({'status':0,'data':[]})

class FetchUserGroup(LoginRequiredMixin, View):
    def post(self,request):
        try:
            user_id = self.request.POST.get("userid",False)
            if self.request.user.groups.filter(name="Organization admin").exists():
                assigned_groups = Group.objects.filter(user__id=user_id)
                not_assigned_groups = Group.objects.filter(~Q(user__id=user_id))
            else:
                logged_user_assigned_group = Group.objects.filter(user=self.request.user)
                assigned_groups = Group.objects.filter(user__id=user_id)
                assigned_groups &= logged_user_assigned_group
                not_assigned_groups = Group.objects.filter(~Q(user__id=user_id))
                not_assigned_groups &=  logged_user_assigned_group
            assigned_groups = list(assigned_groups.values('id','name').order_by('name'))
            not_assigned_groups = list(not_assigned_groups.values('id','name').order_by('name'))
            return JsonResponse({'status':1,'assigned_groups':assigned_groups,'not_assigned_groups':not_assigned_groups})
        except Exception as e:
            return JsonResponse({'status':0})

class AddGroups(LoginRequiredMixin, View):

    def post(self,request):
        try:
            userid = self.request.POST.get("userid",False)
            group_id = self.request.POST.get("group_id",False)
            group = Group.objects.get(id=group_id)
            if not group.user_set.filter(pk=userid).values().exists():
                group.user_set.add(userid)
                AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="Permission assigned to user")
            return JsonResponse({'status': 1})
        except Exception as e:
            return JsonResponse({'status': 0})

class RemoveGroups(LoginRequiredMixin, View):

    def post(self,request):
        try:
            userid = self.request.POST.get("userid",False)
            group_id = self.request.POST.get("group_id",False)
            group = Group.objects.get(id=group_id)
            if group.user_set.filter(pk=userid).values().exists():
                if group.user_set.all().count()==1:
                    return JsonResponse({'status': 2})
                group.user_set.remove(userid)
            AppAdmins.objects.filter(app__app_name=group.name,user__id=userid).delete()
            AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="Permission taken from a user")
            return JsonResponse({'status': 1})
        except Exception as e:
            return JsonResponse({'status': 0})

class AddEditUser(LoginRequiredMixin, View):

    def post(self,request):
        try:
            type_of_submit = self.request.POST.get("type_of_submit")
            id = self.request.POST.get("user_id")
            positionid = self.request.POST.get("positionid")
            emailid = self.request.POST.get("emailid")
            reports_to_name = self.request.POST.get("reports_to_name")
            payroll_name = self.request.POST.get("payroll_name")
            date_of_birth = self.request.POST.get("date_of_birth")
            position_status = self.request.POST.get("position_status")
            worker_category_description = self.request.POST.get("worker_category_description")
            job_title_description = self.request.POST.get("job_title_description")
            hire_date = self.request.POST.get("hire_date")
            region = self.request.POST.get("region")
            eeo_establishment = self.request.POST.get("eeo_establishment")
            job_function_description = self.request.POST.get("job_function_description")
            home_department_description = self.request.POST.get("home_department_description")
            union_code = self.request.POST.get("union_code")
            emp_status = self.request.POST.get("emp_status")
            isstaff = self.request.POST.get("isstaff")

            if type_of_submit=='add' or type_of_submit=='update':
                if emailid=='' or emailid==None:
                    return JsonResponse({'status':2,'text':'Please provide email ID'})
                if positionid=='' or positionid==None:
                    return JsonResponse({'status':2,'text':'Please provide Position ID'})
                if isstaff=='true':
                    isstaff = True
                else:
                    isstaff = False

                emp_status = True if emp_status == 'active' else False

                date_of_birth = datetime.strptime(date_of_birth, '%m/%d/%Y').date().strftime('%Y-%m-%d')
                hire_date = datetime.strptime(hire_date, '%m/%d/%Y').date().strftime('%Y-%m-%d')
            if type_of_submit=='add':
                if User.objects.filter(username=emailid).exists():
                    return JsonResponse({'status':2,'text':'Email ID already exists'})
                if Employee.objects.filter(position_id=positionid).exists():
                    return JsonResponse({'status':2,'text':'Position ID already exists'})
                
                user = User.objects.create(username=emailid,email=emailid,first_name=payroll_name,is_staff=isstaff,is_active=emp_status)
                user.is_active = False
                user.save()
                Employee.objects.create(user=user,position_id=positionid,reports_to_name=reports_to_name,payroll_name=payroll_name,birth_date=date_of_birth,position_status=position_status,worker_category_description=worker_category_description,job_title_description=job_title_description,hire_date=hire_date,region=region,eeo_establishment=eeo_establishment,job_function_description=job_function_description,home_department_description=home_department_description,union_code_description=union_code,email=emailid,is_active=emp_status)
                current_site = str(request.get_host())
                client_name = GetClientName(str(request.get_host()))
                domain = client_name
                subject = 'Activate Your '+domain.capitalize()+' Account'
                message = render_to_string('mainapp/account_activation_email.html', {
                    'user': user,
                    'domain': current_site,
                    'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                    'token': account_activation_token.make_token(user),
                })
                user.email_user(subject, message)
                AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="User created")
            elif type_of_submit=='update':
                if Employee.objects.filter(user__id=id,email=emailid,position_id=positionid).exists():
                    User.objects.filter(id=id).update(first_name=payroll_name,is_staff=isstaff,is_active=emp_status)
                    Employee.objects.filter(user__id=id).update(reports_to_name=reports_to_name,payroll_name=payroll_name,birth_date=date_of_birth,position_status=position_status,worker_category_description=worker_category_description,job_title_description=job_title_description,hire_date=hire_date,region=region,eeo_establishment=eeo_establishment,job_function_description=job_function_description,home_department_description=home_department_description,union_code_description=union_code,is_active=emp_status)
                else:
                    employee_obj = Employee.objects.get(user__id=id)
                    if employee_obj.position_id != positionid:
                        if Employee.objects.filter(position_id=positionid).exists():
                            return JsonResponse({'status':2,'text':'Position ID already exists'})
                    if employee_obj.email != emailid:
                        if Employee.objects.filter(email=emailid).exists():
                            return JsonResponse({'status':2,'text':'Email ID already exists'})
                    User.objects.filter(id=id).update(username=emailid,email=emailid,first_name=payroll_name,is_staff=isstaff,is_active=emp_status)
                    Employee.objects.filter(user__id=id).update(position_id=positionid,reports_to_name=reports_to_name,payroll_name=payroll_name,birth_date=date_of_birth,position_status=position_status,worker_category_description=worker_category_description,job_title_description=job_title_description,hire_date=hire_date,region=region,eeo_establishment=eeo_establishment,job_function_description=job_function_description,home_department_description=home_department_description,union_code_description=union_code,email=emailid,is_active=emp_status)
                    AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="User updated")
            elif type_of_submit=='delete':
                User.objects.get(id=id).delete()
                AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="User deleted")
            return JsonResponse({'status': 1})
        except Exception as e:
            return JsonResponse({'status': 0})
                   
class GetAppList(LoginRequiredMixin, View):
    def post(self, request):
        threshold = subscriptionCheck(request)
        try:
            apps_type = self.request.POST.get("apps_type",None)
            search_key = self.request.POST.get("search_key",None)
            user_groups = self.request.user.groups.values_list('name', flat=True)
            if not self.request.user.groups.filter(name="Organization admin").exists(): 
                apps_list = Apps.objects.filter(Q(subscription__lte=threshold) & (Q(app_name__in=user_groups))).order_by('app_type', 'app_name').all()
                # apps_list = Apps.objects.filter(Q(subscription__lte=threshold) & (Q(app_name__in=user_groups) | Q(app_type='vaccine') | Q(app_name='Secure upload'))).order_by('app_type', 'app_name').all()
            else:
                apps_list = Apps.objects.filter(subscription__lte=threshold).all().order_by('app_type','app_name')
            all_app_list = list(apps_list.values())
            fav_apps_list = Apps.objects.filter(favouriteapps__user=self.request.user,subscription__lte=threshold).values('id')
            fav_list = [ele['id'] for ele in fav_apps_list]
            # if apps_type!='all':
            #     if apps_type=='myfavorites':
            #         pass
            #     else:
            #         apps_list = apps_list.filter(subscription__lte=threshold)
            if not self.request.user.groups.filter(name="Organization admin").exists():
                apps_list = apps_list.filter(is_hidden=False)
            else:
                apps_list = apps_list.filter(~Q(tenant_app_id=None) & Q(is_hidden=False))              
            # if search_key!='':
            #     apps_list = apps_list.filter(Q(app_name__icontains=search_key) | Q(point_of_contact__icontains=search_key))

            if AppOrdering.objects.filter(user=self.request.user).exists():
                apps_list_before = apps_list
                apps_list = apps_list.filter(appordering__user=self.request.user).order_by('appordering__order','created_datetime')
                apps_list_before = apps_list_before.exclude(pk__in=apps_list.values_list('pk', flat=True))
                apps_list |= apps_list_before
            apps_list = list(apps_list.values())
            timeset = getTimeZone(self.request)
            for index,apps in enumerate(apps_list):
                if apps['id'] in fav_list:
                    apps['favourite'] = 1
                else:
                    apps['favourite'] = 0
                apps['buttons'] = list(AppsButtons.objects.filter(app=apps['id']).values('id','button_text','button_href').order_by('button_text'))
                try:
                    apps['app_logo'] = Apps.objects.get(id=apps['id']).app_logo.url
                except:
                    pass
                apps['is_admin_apps_permission'] = True
                if apps['app_type']=='administration':
                    if User.objects.filter(Q(groups__name=apps['app_name'])| Q(groups__name='Organization admin'),username=self.request.user).exists():
                        apps['is_admin_apps_permission'] = True
                    else:
                        apps['is_admin_apps_permission'] = False
                apps['is_app_admin'] = False
                apps['pending'] = None
                apps['resolved'] = None
                apps['created_datetime'] = apps['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S')
                if AppAdmins.objects.filter(app__app_name=apps['app_name'],user__username=self.request.user.username).exists() or self.request.user.groups.filter(name="Organization admin").exists():
                    apps['is_app_admin'] = True
                if apps['app_name'] =='Grievance':
                    start = datetime.now().replace(tzinfo=pytz.utc).astimezone(timeset)-timedelta(days=2)
                    start = start.strftime('%Y-%m-%d')+' 00:00:00'
                    end = datetime.now().replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d')+ ' 23:59:59'
                    grievance = Grievance.objects.all()
                    apps['pending'] = grievance.filter(is_resolved=False).count()
                    apps['resolved'] = grievance.filter(is_resolved=True).count()
                    apps['newly_submitted'] = grievance.filter(created_datetime__range=(start,end),is_resolved=False).count()
                elif apps['app_name'] =='Complaint':
                    start = datetime.now().replace(tzinfo=pytz.utc).astimezone(timeset)-timedelta(days=2)
                    start = start.strftime('%Y-%m-%d')+' 00:00:00'
                    end = datetime.now().replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d')+ ' 23:59:59'
                    complaint = Compliance.objects.all()
                    apps['pending'] = complaint.filter(is_resolved=False).count()
                    apps['resolved'] = complaint.filter(is_resolved=True).count()
                    apps['newly_submitted'] = complaint.filter(created_datetime__range=(start,end),is_resolved=False).count()
                elif apps['app_name'] =='Standards of behavior':
                    start = datetime.now().replace(tzinfo=pytz.utc).astimezone(timeset)-timedelta(days=2)
                    start = start.strftime('%Y-%m-%d')+' 00:00:00'
                    end = datetime.now().replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d')+ ' 23:59:59'
                    sob = IncidentReport.objects.all()
                    apps['pending'] = sob.filter(is_resolved=False).count()
                    apps['resolved'] = sob.filter(is_resolved=True).count()
                    apps['newly_submitted'] = sob.filter(created_datetime__range=(start,end),is_resolved=False).count()
                elif apps['app_name'] =='Staff planning dental':
                    spd = list(StaffPlanningDental.objects.all().order_by('-created_datetime').values('created_datetime'))
                    apps['last_datetime'] = ''
                    if spd:
                        apps['last_datetime'] = spd[0]['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m/%d/%Y %I:%M %p')
                elif apps['app_name'] =='Staff planning medical':
                    spm = list(StaffPlanning.objects.all().order_by('-created_datetime').values('created_datetime'))
                    apps['last_datetime'] = ''
                    if spm:
                        apps['last_datetime'] = spm[0]['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m/%d/%Y %I:%M %p')
                elif apps['app_name'] =='Staff planning optometry':
                    spo = list(StaffPlanningOptometry.objects.all().order_by('-created_datetime').values('created_datetime'))
                    apps['last_datetime'] = ''
                    if spo:
                        apps['last_datetime'] = spo[0]['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m/%d/%Y %I:%M %p')
                elif 'outreach' in apps['app_name'] and 'management' not in apps['app_name']:
                    outreach = OutreachPatient.objects.all()
                    apps['active'] = outreach.filter(outreach__name=apps['app_name'],is_active=True).count()
                    apps['inactive'] = outreach.filter(outreach__name=apps['app_name'],is_active=False).count()
                elif apps['app_name'] == 'Outreach management':
                    outreachlist = OutreachList.objects.all()
                    apps['published'] = outreachlist.filter(is_published=True).count()
                    apps['not_published'] = outreachlist.filter(is_published=False).count()
                elif apps['app_name'] == 'App management':
                    threshold = subscriptionCheck(request)
                    app = Apps.objects.filter(subscription__lte=threshold)
                    apps['total'] = app.count()
                elif apps['app_name'] == 'Member management':
                    tenant_name = GetClientName(request.META['HTTP_HOST'])
                    member = MemberPatient.objects.filter(tenantmembers__tenant__name=tenant_name)
                    apps['active'] = member.filter(active=True).count()
                    apps['inactive'] = member.filter(active=False).count()
                elif apps['app_name'] == 'Location management':
                    location = Location.objects.all()
                    apps['total'] = location.count()
                elif apps['app_name'] == 'User management':
                    if self.request.user.is_superuser:
                        user = User.objects.all()
                    else:
                        user = User.objects.filter(is_superuser=False)
                    apps['active'] = user.filter(is_active=True).count()
                    apps['inactive'] = user.filter(is_active=False).count()
                elif apps['app_name'] == 'Log management':
                    start = datetime.now().replace(tzinfo=pytz.utc).astimezone(timeset)-timedelta(days=1)
                    end = start.strftime('%Y-%m-%d')+ ' 23:59:59'
                    start = start.strftime('%Y-%m-%d')+' 00:00:00'
                    apps['yesterday'] = AppAccessData.objects.filter(created_datetime__range=(start,end)).count()
                    start = datetime.now().replace(tzinfo=pytz.utc).astimezone(timeset)
                    end = start.strftime('%Y-%m-%d')+ ' 23:59:59'
                    start = start.strftime('%Y-%m-%d')+' 00:00:00'
                    apps['today'] = AppAccessData.objects.filter(created_datetime__range=(start,end)).count()
                elif apps['app_name'] =='Secure upload':
                    start = datetime.now().replace(tzinfo=pytz.utc).astimezone(timeset)-timedelta(days=2)
                    start = start.strftime('%Y-%m-%d')+' 00:00:00'
                    end = datetime.now().replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d')+ ' 23:59:59'
                    sob = UploadUrlModel.objects.all()
                    apps['pending'] = sob.filter(is_resolved=False).count()
                    apps['resolved'] = sob.filter(is_resolved=True).count()
                    apps['newly_submitted'] = sob.filter(created_datetime__range=(start,end),is_resolved=False).count()
            location_list = list(Location.objects.all().values().order_by('name'))
            quality_service_list = qualityReportList(self.request.user)
            return JsonResponse({'status':1,'apps_list':apps_list,'location_list':location_list, 'quality_services':quality_service_list,'all_app_list':all_app_list})
        except Exception as e:
            return JsonResponse({'status':0,'apps_list':[]})

class AppEditUpdate(LoginRequiredMixin, View):
    def post(self, request):
        try:
            threshold = subscriptionCheck(request)
            app_id = self.request.POST.get("app_id",False)
            type_of_submit = self.request.POST.get("type_of_submit",False)
            app_name = self.request.POST.get("app_name",False)
            point_of_contact = self.request.POST.get("point_of_contact",False)
            info_text = self.request.POST.get("info_text",False)
            app_domain = self.request.POST.get("app_domain",False)
            app_type = self.request.POST.get("app_type",False)
            button_url_1 = self.request.POST.get("button_url_1",False)
            button_name_1 = self.request.POST.get("button_name_1",False)
            button_id_1 = self.request.POST.get("button_id_1",False)
            button_url_2 = self.request.POST.get("button_url_2",False)
            button_name_2 = self.request.POST.get("button_name_2",False)
            button_id_2 = self.request.POST.get("button_id_2",False)
            button_url_3 = self.request.POST.get("button_url_3",False)
            button_name_3 = self.request.POST.get("button_name_3",False)
            button_id_3 = self.request.POST.get("button_id_3",False)
            app_hide = self.request.POST.get("app_hide",False)
            if(app_hide=="true"):
                app_hide = True
            else:
                app_hide = False
            if app_name:
                app_name = app_name.capitalize()
            if type_of_submit=='add':
                if Apps.objects.filter(app_name=app_name).exists() or Group.objects.filter(name=app_name).exists():
                    return JsonResponse({'status':2})
                else:
                    id = 1
                    if Apps.objects.all().exists():
                        max_id = Apps.objects.all().order_by("-id").values('id')[0]
                        id = max_id['id']+1
                    AppsObj = Apps.objects.create(id=id,app_name=app_name,point_of_contact=point_of_contact,info_text=info_text,domain_name=app_domain,app_type=app_type,is_hidden=app_hide,modified_by=self.request.user.username)
                    Group.objects.create(name=app_name)
                    group_instance = Group.objects.get(name=app_name)
                    group_instance.user_set.add(self.request.user)
                    admin_users = list(User.objects.filter(groups__name='Organization admin').values('id'))
                    for users in admin_users:
                        if not AppAdmins.objects.filter(user=users['id'],app=AppsObj).exists():
                            AppAdmins.objects.create(user=User.objects.get(id=users['id']),app=AppsObj)
                        group_instance.user_set.add(users['id'])
                    if self.request.FILES:
                        app_logo = self.request.FILES['app_logo']
                        AppsObj.app_logo = app_logo
                        AppsObj.save()
                    if button_url_1!='' and button_name_1!='':
                        if AppsButtons.objects.all().exists():
                            max_id = AppsButtons.objects.all().order_by("-id").values('id')[0]
                            id = max_id['id']+1
                        AppsButtons.objects.create(id=id,app=AppsObj,button_href=button_url_1,button_text=button_name_1)
                    if button_url_2!='' and button_name_2!='':
                        if AppsButtons.objects.all().exists():
                            max_id = AppsButtons.objects.all().order_by("-id").values('id')[0]
                            id = max_id['id']+1
                        AppsButtons.objects.create(id=id,app=AppsObj,button_href=button_url_2,button_text=button_name_2)
                    if button_url_3!='' and button_name_3!='':
                        if AppsButtons.objects.all().exists():
                            max_id = AppsButtons.objects.all().order_by("-id").values('id')[0]
                            id = max_id['id']+1
                        AppsButtons.objects.create(id=id,app=AppsObj,button_href=button_url_3,button_text=button_name_3)
                        AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="An app created")
            elif type_of_submit=='update' or type_of_submit=='outreach_update' or type_of_submit=='defualt_appedit':
                if Apps.objects.filter(app_name=app_name).exclude(id=app_id).exists():
                    return JsonResponse({'status':2})
                if AppAdmins.objects.filter(app__id=app_id,user__username=self.request.user.username).exists() or self.request.user.groups.filter(name="Organization admin").exists():
                    if type_of_submit=='defualt_appedit':
                        Apps.objects.filter(id=app_id, subscription__lte=threshold).update(point_of_contact=point_of_contact,is_hidden=app_hide)
                    elif type_of_submit=='outreach_update':
                        Apps.objects.filter(id=app_id, subscription__lte=threshold).update(point_of_contact=point_of_contact,is_hidden=app_hide,info_text=info_text,domain_name=app_domain)
                        if self.request.FILES:
                            app_logo = self.request.FILES['app_logo']
                            AppsObj = Apps.objects.get(id=app_id)
                            AppsObj.app_logo = app_logo
                            AppsObj.save()
                    else:
                        oldName = Apps.objects.get(id=app_id).app_name
                        AppAccessData.objects.filter(app_name=oldName).update(app_name=app_name)
                        Apps.objects.filter(id=app_id,subscription__lte=threshold).update(app_name=app_name,point_of_contact=point_of_contact,info_text=info_text,domain_name=app_domain,app_type=app_type,is_hidden=app_hide)
                        if self.request.FILES:
                            app_logo = self.request.FILES['app_logo']
                            AppsObj = Apps.objects.get(id=app_id)
                            AppsObj.app_logo = app_logo
                            AppsObj.save()
                        AppButtonsUpdate(app_id,button_id_1,button_url_1,button_name_1,button_id_2,button_url_2,button_name_2,button_id_3,button_url_3,button_name_3,self.request.user.username)
                        Group.objects.filter(name=oldName).update(name=app_name)
                    AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="An app updated")
            return JsonResponse({'status':1})
        except Exception as e:
            return JsonResponse({'status':0})

class DeleteApp(LoginRequiredMixin, View):

    def post(self,request):
        try:
            id = self.request.POST.get("id",False)
            app = Apps.objects.get(id=id)
            Group.objects.filter(name=app.app_name).delete()
            app.delete()
            AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="App deleted")
            return JsonResponse({'status': 1})
        except Exception as e:
            return JsonResponse({'status': 0})

def AppButtonsUpdate(app_id,button_id_1,button_url_1,button_name_1,button_id_2,button_url_2,button_name_2,button_id_3,button_url_3,button_name_3,username):
    AppObj = Apps.objects.get(id=app_id)
    if button_id_1=='' and button_name_1!='' and button_url_1!='':
        if AppsButtons.objects.all().exists():
            max_id = AppsButtons.objects.all().order_by("-id").values('id')[0]
            id = max_id['id']+1
        AppsButtons.objects.create(id=id,app=AppObj,button_href=button_url_1,button_text=button_name_1)
    elif button_id_1!='' and (button_name_1=='' or button_url_1==''):
        AppsButtons.objects.get(id=button_id_1).delete()
    elif button_id_1!='' and button_name_1!='' and button_url_1!='':
        AppsButtons.objects.filter(id=button_id_1).update(button_href=button_url_1,button_text=button_name_1,modified_by=username)
    if button_id_2=='' and button_name_2!='' and button_url_2!='':
        if AppsButtons.objects.all().exists():
            max_id = AppsButtons.objects.all().order_by("-id").values('id')[0]
            id = max_id['id']+1
        AppsButtons.objects.create(id=id,app=AppObj,button_href=button_url_2,button_text=button_name_2)
    elif button_id_2!='' and (button_name_2=='' or button_url_2==''):
        AppsButtons.objects.get(id=button_id_2).delete()
    elif button_id_2!='' and button_name_2!='' and button_url_2!='':
        AppsButtons.objects.filter(id=button_id_2).update(button_href=button_url_2,button_text=button_name_2,modified_by=username)
    if button_id_3=='' and button_name_3!='' and button_url_3!='':
        if AppsButtons.objects.all().exists():
            max_id = AppsButtons.objects.all().order_by("-id").values('id')[0]
            id = max_id['id']+1
        AppsButtons.objects.create(id=id,app=AppObj,button_href=button_url_3,button_text=button_name_3)
    elif button_id_3!='' and (button_name_3=='' or button_url_3==''):
        AppsButtons.objects.get(id=button_id_3).delete()
    elif button_id_3!='' and button_name_3!='' and button_url_3!='':
        AppsButtons.objects.filter(id=button_id_3).update(button_href=button_url_3,button_text=button_name_3,modified_by=username)
    return 

class AppsOrderingUpdates(LoginRequiredMixin, View):
    def post(self, request):
        try:
            apps_order = self.request.POST.getlist("apps_order[]",False)
            for index,appname in enumerate(apps_order):
                AppObj = Apps.objects.get(app_name=appname)
                if AppOrdering.objects.filter(app__app_name=appname,user=self.request.user).exists():
                    AppOrdering.objects.filter(app=AppObj,user=self.request.user).update(order=index)
                else:
                    AppOrdering.objects.create(app=AppObj,user=self.request.user,order=index)
            return JsonResponse({'status':1})
        except Exception as e:
            return JsonResponse({'status':0})

class AddLocations(LoginRequiredMixin, View):
    def post(self, request):
        try:
            type_of_submit = self.request.POST.get("type_of_submit",False)
            id = self.request.POST.get("id",False)
            location = self.request.POST.get("location",False)
            if type_of_submit=='add_location':
                if location:
                    if Location.objects.filter(name__iexact=location).exists():
                        return JsonResponse({'status':2})
                    Location.objects.create(name=location)
                    AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="Location added")
            elif type_of_submit=='edit_location':
                if location and id:
                    if Location.objects.filter(name__iexact=location).exists():
                        return JsonResponse({'status':2})
                    Location.objects.filter(id=id).update(name=location)
                    AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="Location updated")
            elif type_of_submit=='delete_location':
                Location.objects.filter(id=id).delete()
                AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="Location deleted")
            location = list(Location.objects.all().values().order_by('name'))
            return JsonResponse({'status':1,'location':location})
        except Exception as e:
            return JsonResponse({'status':0})

class FetchAppLocationsandAdmin(LoginRequiredMixin, View):
    def get(self, request,app_name):
        try:
            if app_name!='':
                location = list(AppLocation.objects.filter(app__app_name=app_name).values('id','location__name'))
                all_location = list(Location.objects.filter(~Q(applocation__app__app_name=app_name)).values('id','name'))
                admin_users = list(User.objects.filter(appadmins__app__app_name=app_name).values('id','username'))
                all_users  = list(User.objects.filter(~Q(appadmins__app__app_name=app_name) & Q(groups__name=app_name)).values('id','username'))
                return JsonResponse({'status':1,'app_specific_location_list':location,'location_not_assigned_for_app':all_location,'admin_users':admin_users,'all_users':all_users})
            return JsonResponse({'status':0})
        except Exception as e:
            return JsonResponse({'status':0})

class EditAppLocations(LoginRequiredMixin, View):
    def post(self, request):
        try:
            id = self.request.POST.get("id",False)
            app_name = self.request.POST.get("app_name",False)
            type_of_submit = self.request.POST.get("type_of_submit",False)
            if type_of_submit=='add_group':
                app = Apps.objects.get(app_name=app_name)
                location  = Location.objects.get(id=id)
                if not AppLocation.objects.filter(app=app,location=location):
                    AppLocation.objects.create(app=app,location=location)
                    AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="Location added to an app")
            elif type_of_submit=='remove_group':
                location = AppLocation.objects.get(id=id).location
                app = AppLocation.objects.get(id=id).app
                UserAssignedLocations.objects.filter(location__name=location.name,app__app_name=app.app_name).delete()
                AppLocation.objects.filter(id=id).delete()
                AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="Location removed from an app")
            return JsonResponse({'status':1})
        except Exception as e:
            return JsonResponse({'status':0})

class FetchUserLocations(LoginRequiredMixin, View):
    def post(self, request):
        try:
            id = self.request.POST.get("id",False)
            app_name = self.request.POST.get("app_name",False)
            app = Apps.objects.get(app_name=app_name)
            user_locations = list(UserAssignedLocations.objects.filter(user__id=id,app=app).values('id','location__name'))
            all_locations = list(Location.objects.filter(~Q(userassignedlocations__user__id=id,userassignedlocations__app__app_name=app_name) & Q(applocation__app__app_name=app_name)).values('id','name'))
            return JsonResponse({'status':1,'user_locations':user_locations,'all_locations':all_locations})
        except Exception as e:
            return JsonResponse({'status':0})

class EditUserLocations(LoginRequiredMixin, View):
    def post(self, request):
        try:
            id = self.request.POST.get("id",False)
            user_id = self.request.POST.get("user_id",False)
            type_of_submit = self.request.POST.get("type_of_submit",False)
            app_name = self.request.POST.get("app_name",False)
            user = User.objects.get(id=user_id)
            app = Apps.objects.get(app_name=app_name)
            if type_of_submit=='add_group':
                location = Location.objects.get(id=id)
                if not UserAssignedLocations.objects.filter(user=user,location=location,app=app):
                    UserAssignedLocations.objects.create(user=user,location=location,app=app)
                    AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="Location assigned to a user")
            elif type_of_submit=='remove_group':
                UserAssignedLocations.objects.filter(id=id).delete()
                AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="Locaation unassigned from a user")
            return JsonResponse({'status':1})
        except Exception as e:
            return JsonResponse({'status':0})

class EditAppAdmin(LoginRequiredMixin, View):
    def post(self, request):
        try:
            id = self.request.POST.get("id",False)
            app_name = self.request.POST.get("app_name",False)
            type_of_submit = self.request.POST.get("type_of_submit",False)
            app = Apps.objects.get(app_name=app_name)
            user = User.objects.get(id=id)
            if type_of_submit=='add_admin':
                if not AppAdmins.objects.filter(user=user,app=app).exists():
                    AppAdmins.objects.create(user=user,app=app)
                    AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="A user added as an app admin")
            elif type_of_submit=='remove_admin':
                AppAdmins.objects.filter(user=user,app=app).delete()
                AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="An app admin removed")
            admin_users = list(User.objects.filter(appadmins__app__app_name=app_name).values('id','username'))
            all_users  = list(User.objects.filter(~Q(appadmins__app__app_name=app_name) & Q(groups__name=app_name)).values('id','username'))
            return JsonResponse({'status':1,'admin_users':admin_users,'all_users':all_users})
        except Exception as e:
            return JsonResponse({'status':0})


class ResetPassword(TemplateView):
    template_name = 'account/sendotp.html'

    def post(self,request):
        try:
            otp = self.request.POST.get("otp",False)
            email = self.request.POST.get("email",False)
            password = self.request.POST.get("password",False)
            confirmpassword = self.request.POST.get("confirmpassword",False)
            logo, title, titlelogo = logoRendering(self.request)
            data = {'logo':logo,'title':title,'titlelogo':titlelogo}
            if otp==False or otp=='':
                if email=='':
                    messages.error(request,'Please enter an email address', extra_tags=True)
                    return render(request,"account/sendotp.html",data)
                if not User.objects.filter(username=email).exists():
                    messages.error(request,'Email is not registered yet. Please ask your admin to register your email', extra_tags=True)
                    return render(request,"account/sendotp.html",data)
                else:
                    otpgenerated = random.randint(10000000,99999999)
                    subject, from_email, to = 'Password Reset',settings.EMAIL_HOST_USER,email
                    text_content = 'This is an important message.'
                    html_content = '<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0"><div style="border-bottom:1px solid #eee"><a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Yetti | Healthcare</a></div><p style="font-size:1.1em">Hi,'+email+'</p><p>To Authenticate, please use the following One Time Password (OTP)</p><h2 style="background: ##24726;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">'+str(otpgenerated)+'</h2><p style="font-size:0.9em;">Do not share this OTP with anyone</p><p style="font-size:0.9em;">Regards,<br />Yetti | Healthcare</p><hr style="border:none;border-top:1px solid #eee" /><div style="float:left;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300"><p>Copyright © All Rights Reserved.</p></div></div></div>'
                    msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
                    msg.attach_alternative(html_content, "text/html")
                    msg.send()
                    user = User.objects.get(username=email)
                    PasswordResetOTP.objects.filter(user=user).delete()
                    PasswordResetOTP.objects.create(user=user,otp=otpgenerated)
                    email = {'email':email,'logo':logo,'title':title,'titlelogo':titlelogo}
                    return render(request,'account/resetpassword.html',email)
            elif otp!='':
                if not PasswordResetOTP.objects.filter(user__username=email,otp=otp).exists():
                    email = {'email':email,'logo':logo,'title':title,'titlelogo':titlelogo}
                    messages.error(request,'Invalid OTP', extra_tags=True)
                    return render(request,'account/resetpassword.html',email)
                else:
                    if password!=confirmpassword:
                        email = {'email':email,'logo':logo,'title':title,'titlelogo':titlelogo}
                        messages.error(request,'Password does not match', extra_tags=True)
                        return render(request,'account/resetpassword.html',email)
                    elif password==confirmpassword:
                        User.objects.filter(username=email).update(password=make_password(password), is_active=True)
                        user = User.objects.get(username=email)
                        connection.schema_name = 'public'
                        if User.objects.filter(username=user.email).exists():
                            User.objects.filter(username=email).update(password=user.password, is_active=True)
                        email = {'email':email,'logo':logo,'title':title,'titlelogo':titlelogo}
                        return render(request,'account/resetsuccess.html',email)
        except Exception as e:
            messages.error(request,"Something happened. Please try again later", extra_tags=True)
            return render(request,"account/sendotp.html",data)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

def handler404(request,exception):
    logo, title, titlelogo = logoRendering(request)
    return render(request, 'mainapp/exception_templates/404.html',{'logo':logo,'titlelogo':titlelogo,'title':title},status=404)

def handler403(request,exception):
    logo, title, titlelogo = logoRendering(request)
    return render(request, 'mainapp/exception_templates/403.html',{'logo':logo,'titlelogo':titlelogo,'title':title},status=403)

class PermissionDenied(TemplateView):
    template_name = 'mainapp/permissiondenied.html'

    def get_context_data(self, **kwargs):
            context = super().get_context_data(**kwargs)
            logo, title, titlelogo = logoRendering(self.request)
            context['logo'] = logo
            context['title'] = title
            context['titlelogo'] = titlelogo
            return context

def UnautherisedUserAccess(request, error_message, status):
    return redirect('/permissiondenied/')


class AddOutreach(LoginRequiredMixin, View):
    def post(self, request):
        try:
            outreachName = self.request.POST.get("outreachName",False)
            statusList = self.request.POST.getlist("statusList[]",False)
            fieldsList = self.request.POST.getlist("fieldsList[]",False)
            from_age_filter = self.request.POST.getlist("ageFromList[]",False)
            to_age_filter = self.request.POST.getlist("ageToList[]",False)
            zipcode_filter = self.request.POST.getlist("zipList[]",False)
            gender_filter = self.request.POST.getlist("genderList[]",False)
            is_filter_added = self.request.POST.get("is_filter_added",False)
            scheduleEnabled = self.request.POST.get("schedule_enabled",False)
            scheduleEnabled = True if scheduleEnabled == "true" else False
            logo, title, titlelogo = logoRendering(self.request)
            outreachName = str(outreachName).capitalize()
            if not 'outreach' in outreachName:
                outreachName += ' outreach' 
            if scheduleEnabled:
                startDate = self.request.POST.get("start_date",False)
                endDate = self.request.POST.get("end_date",False)
                scheduleType = self.request.POST.get("schedule_type",False)
                notificationText = self.request.POST.get("notification_text",False)
                scheduledHours = self.request.POST.getlist("schedule_hours[]",False)
                scheduleMinutes = self.request.POST.getlist("schedule_minutes[]",False)
                weekDays = self.request.POST.getlist("weekDays[]",False)
                startDate = datetime.strptime(startDate,'%m/%d/%Y').date().strftime("%Y-%m-%d")
                once = False if scheduleType == "recurring" else True
                endDate = datetime.strptime(endDate,'%m/%d/%Y').date().strftime("%Y-%m-%d") if not endDate == "" else None
                # weekDays =','.join(weekDays)
                # # weekDays = "{"+weekDays+"}"
            if is_filter_added=='true':
                is_filter_added=True
            else:
                is_filter_added=False
            if not statusList:
                statusList =[]
            if not fieldsList:
                fieldsList = []
            if not from_age_filter:
                from_age_filter = []
            if not to_age_filter:
                to_age_filter = []
            if not zipcode_filter:
                zipcode_filter = []
            if not gender_filter:
                gender_filter = []
            if OutreachList.objects.filter(name=outreachName).exists() or Apps.objects.filter(app_name=outreachName).exists():
                return JsonResponse({'status':2})
            if scheduleEnabled:
                newOut = OutreachList.objects.create(name=outreachName,columns=fieldsList,outreach_status_values=statusList,is_filter_added=is_filter_added,age_from=from_age_filter,age_to=to_age_filter,zipcode=zipcode_filter, gender_filters=gender_filter,notification_enabled=scheduleEnabled, start_date=startDate, end_date=endDate, weekdays=weekDays, schedule_type=scheduleType, scheduled_hours=scheduledHours, scheduled_minutes=scheduleMinutes, notification_text=notificationText)
            else:
                newOut = OutreachList.objects.create(name=outreachName,columns=fieldsList,outreach_status_values=statusList,is_filter_added=is_filter_added,age_from=from_age_filter,age_to=to_age_filter,zipcode=zipcode_filter, gender_filters=gender_filter, notification_enabled=scheduleEnabled)
            newOut.save()
            data = list(OutreachList.objects.filter(id=newOut.id).all().values())
            groupName = outreachName
            Group.objects.create(name=groupName)
            group_instance = Group.objects.get(name=groupName)
            group_instance.user_set.add(self.request.user)
            groupName = outreachName+' dashboard'
            Group.objects.create(name=groupName)
            group_instance = Group.objects.get(name=groupName)
            group_instance.user_set.add(self.request.user)
            admin_users = list(User.objects.filter(groups__name='Organization admin').values('id'))
            url = 'https://'+request.META['HTTP_HOST']+'/outreach/'+outreachName
            id = 1
            if Apps.objects.all().exists():
                max_id = Apps.objects.all().order_by("-id").values('id')[0]
                id = max_id['id']+1
            AppsObj = Apps.objects.create(id=id,app_name=outreachName,app_type='outreach',point_of_contact=str(connection.schema_name).capitalize(),is_hidden=False,modified_by=self.request.user.username)
            for users in admin_users:
                if not AppAdmins.objects.filter(user=users['id'],app=AppsObj).exists():
                    AppAdmins.objects.create(user=User.objects.get(id=users['id']),app=AppsObj)
                group_instance.user_set.add(users['id'])
            id = 1
            if AppsButtons.objects.all().exists():
                max_id = AppsButtons.objects.all().order_by("-id").values('id')[0]
                id = max_id['id']+1
            AppsButtons.objects.create(id=id,app=AppsObj,button_href=url,button_text='Outreach')
            if AppsButtons.objects.all().exists():
                max_id = AppsButtons.objects.all().order_by("-id").values('id')[0]
                id = max_id['id']+1
            AppsButtons.objects.create(id=id,app=AppsObj,button_href=url+'/dashboard/',button_text='Dashboard')
            if is_filter_added:
                age_query = Q()
                for index,age in enumerate(from_age_filter):
                    from_date = datetime.now().date()-relativedelta(years=int(age))
                    to_date = datetime.now().date()-relativedelta(years=int(to_age_filter[index]))
                    age_query |= Q(birthDate__range=(to_date,from_date))
                zip_query = Q()
                for zip in zipcode_filter:
                    zip_query |= Q(address_postalCode=zip)
                gender_query = Q()
                for gender in gender_filter:
                    gender_query |= Q(gender=gender)
                query = age_query & zip_query & gender_query
                results = list(MemberPatient.objects.filter(query).exclude(Q(outreachpatient__outreach=newOut) & Q(outreachpatient__member__isnull=False)).values())
            else:
                results = list(MemberPatient.objects.all().exclude(Q(outreachpatient__outreach=newOut) & Q(outreachpatient__member__isnull=False)).values())
            model_instances = []
            for res in results:
                model_instances.append(OutreachPatient(
                member_id = res['id'],
                first_name=res['name_given'],
                last_name=res['name_family'],
                date_of_birth=res['birthDate'],
                phone_number=res['contact_value'],
                mrn=res['identifier'],
                is_active = True,
                outreach = newOut
                ))
            OutreachPatient.objects.bulk_create(model_instances)
            if scheduleEnabled:
                for i in range(len(scheduledHours)):
                    random_key = ''.join([
                        ''.join(random.sample(string.ascii_letters, 2)),
                        ''.join(random.sample(string.digits, 2)),
                        ''.join(random.sample(string.ascii_letters, 2)),
                    ])
                    cron = CrontabSchedule.objects.create(minute=scheduleMinutes[i],hour=scheduledHours[i],day_of_month='*', month_of_year='*')
                    cron.day_of_week = ""
                    for i in range(len(weekDays)):
                        cron.day_of_week += "," if not i ==0 else ""
                        cron.day_of_week += (str(weekDays[i]))
                    cron.save()
                    task = PeriodicTask.objects.create(name=title+"-"+outreachName+'-'+random_key, task='bookingforms.tasks.say_hello', args=json.dumps([notificationText]),start_time=startDate,enabled=True,crontab_id=cron.id,one_off=once)
                    newOut.schedule_id = task.id
                    newOut.save()
            AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="An outreach created")
            return JsonResponse({'status':1,'data':data})
        except Exception as e:
            return JsonResponse({'status':0})

class EditOutreach(LoginRequiredMixin, View):
    def post(self, request):
        try:
            outreachName = self.request.POST.get("outreachName",False)
            outreachID = self.request.POST.get("id",False)
            statusList = self.request.POST.getlist("statusList[]",False)
            fieldsList = self.request.POST.getlist("fieldsList[]",False)
            from_age_filter = self.request.POST.getlist("ageFromList[]",False)
            to_age_filter = self.request.POST.getlist("ageToList[]",False)
            zipcode_filter = self.request.POST.getlist("zipList[]",False)
            gender_filter = self.request.POST.getlist("genderList[]",False)
            is_filter_added = self.request.POST.get("is_filter_added",False)
            oldName = OutreachList.objects.get(id=outreachID).name
            scheduleEnabled = self.request.POST.get("schedule_enabled",False)
            scheduleEnabled = True if scheduleEnabled == "true" else False
            logo, title, titlelogo = logoRendering(self.request)
            outreachName = str(outreachName).capitalize()
            if not 'outreach' in outreachName:
                outreachName += ' outreach' 
            if scheduleEnabled:
                startDate = self.request.POST.get("start_date",False)
                endDate = self.request.POST.get("end_date",False)
                scheduleType = self.request.POST.get("schedule_type",False)
                notificationText = self.request.POST.get("notification_text",False)
                scheduledHours = self.request.POST.getlist("schedule_hours[]",False)
                scheduleMinutes = self.request.POST.getlist("schedule_minutes[]",False)
                weekDays = self.request.POST.getlist("weekDays[]",False)
                startDate = datetime.strptime(startDate,'%m/%d/%Y').date().strftime("%Y-%m-%d")
                once = False if scheduleType == "recurring" else True
                endDate = datetime.strptime(endDate,'%m/%d/%Y').date().strftime("%Y-%m-%d") if not endDate == "" else None
            if is_filter_added=='true':
                is_filter_added=True
            else:
                is_filter_added=False
            if not statusList:
                statusList =[]
            if not fieldsList:
                fieldsList = []
            if not from_age_filter:
                from_age_filter = []
            if not to_age_filter:
                to_age_filter = []
            if not zipcode_filter:
                zipcode_filter = []
            if ((OutreachList.objects.filter(name=outreachName).exists() or Apps.objects.filter(app_name=outreachName).exists()) and not OutreachList.objects.get(name=outreachName).id == int(outreachID)):
                return JsonResponse({'status':2})
            if OutreachList.objects.get(id=outreachID).notification_enabled :
                scheduleId = OutreachList.objects.get(id=outreachID).schedule_id
                crontabId = PeriodicTask.objects.get(id=scheduleId).crontab_id
                PeriodicTask.objects.filter(id=scheduleId).delete() 
                CrontabSchedule.objects.filter(id=crontabId).delete()
            if scheduleEnabled:
                OutreachList.objects.filter(id=outreachID).update(name=outreachName,columns=fieldsList,outreach_status_values=statusList,is_filter_added=is_filter_added,age_from=from_age_filter,age_to=to_age_filter,zipcode=zipcode_filter,gender_filters=gender_filter, notification_enabled=scheduleEnabled, start_date=startDate, end_date=endDate, weekdays=weekDays, schedule_type=scheduleType, scheduled_hours=scheduledHours, scheduled_minutes=scheduleMinutes, notification_text=notificationText)
            else:
                OutreachList.objects.filter(id=outreachID).update(name=outreachName,columns=fieldsList,outreach_status_values=statusList,is_filter_added=is_filter_added,age_from=from_age_filter,age_to=to_age_filter,zipcode=zipcode_filter,gender_filters=gender_filter, notification_enabled=scheduleEnabled)
            data = list(OutreachList.objects.filter(id=outreachID).all().values())
            groupName = outreachName
            oldGroupName = oldName
            Group.objects.filter(name=oldGroupName).update(name=groupName)
            groupName = outreachName+' dashboard'
            oldGroupName = oldName+' dashboard'
            Group.objects.filter(name=oldGroupName).update(name=groupName)
            Apps.objects.filter(app_name=oldName).update(app_name=outreachName)
            url = 'https://'+request.META['HTTP_HOST']+'/outreach/'
            AppsButtons.objects.filter(button_href=url+oldName).update(button_href=url+outreachName)
            AppsButtons.objects.filter(button_href=url+oldName+'/dashboard/').update(button_href=url+outreachName+'/dashboard/')
            AppAccessData.objects.filter(app_name=oldName).update(app_name=outreachName)
            if is_filter_added:
                age_query = Q()
                for index,age in enumerate(from_age_filter):
                    from_date = datetime.now().date()-relativedelta(years=int(age))
                    to_date = datetime.now().date()-relativedelta(years=int(to_age_filter[index]))
                    age_query |= Q(birthDate__range=(to_date,from_date))
                zip_query = Q()
                for zip in zipcode_filter:
                    zip_query |= Q(address_postalCode=zip)
                gender_query = Q()
                for gender in gender_filter:
                    gender_query |= Q(gender=gender)
                query = age_query & zip_query & gender_query
                results = list(MemberPatient.objects.filter(query).exclude(~Q(outreachpatient__outreach_id=outreachID) & Q(outreachpatient__member__isnull=False)).values())
            else:
                results = list(MemberPatient.objects.all().exclude(Q(outreachpatient__outreach_id=outreachID) & Q(outreachpatient__member__isnull=False)).values())
            if results:
                OutreachPatient.objects.filter(outreach_id=outreachID).update(is_active=False)
            else:
                OutreachPatient.objects.filter(outreach_id=outreachID).update(is_active=True)
            model_instances = []
            for res in results:
                if OutreachPatient.objects.filter(member__id=res['id']).exists():
                    OutreachPatient.objects.filter(member__id=res['id']).update(is_active=True)
                else:
                    model_instances.append(OutreachPatient(
                    member_id = res['id'],
                    first_name=res['name_given'],
                    last_name=res['name_family'],
                    date_of_birth=res['birthDate'],
                    phone_number=res['contact_value'],
                    mrn=res['identifier'],
                    is_active = True,
                    outreach_id = outreachID
                    ))
            OutreachPatient.objects.bulk_create(model_instances)
            if scheduleEnabled:
                for i in range(len(scheduledHours)):
                    random_key = ''.join([
                        ''.join(random.sample(string.ascii_letters, 2)),
                        ''.join(random.sample(string.digits, 2)),
                        ''.join(random.sample(string.ascii_letters, 2)),
                    ])
                    cron = CrontabSchedule.objects.create(minute=scheduleMinutes[i],hour=scheduledHours[i],day_of_month='*', month_of_year='*')
                    cron.day_of_week = ""
                    for i in range(len(weekDays)):
                        cron.day_of_week += "," if not i ==0 else ""
                        cron.day_of_week += (str(weekDays[i]))
                    cron.save()
                    task = PeriodicTask.objects.create(name=title+"-"+outreachName+'-'+random_key, task='bookingforms.tasks.say_hello', args=json.dumps([notificationText]),start_time=startDate,enabled=True,crontab_id=cron.id,one_off=once)
                    OutreachList.objects.filter(id=outreachID).update(schedule_id=task.id)
            AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="An outreach settings edited")
            return JsonResponse({'status':1,'data':data})
        except Exception as e:
            return JsonResponse({'status':0})

class DeleteOutreach(LoginRequiredMixin, View):
    def post(self, request):
        try:
            outreachID = self.request.POST.get("index",False)
            oldName = OutreachList.objects.get(id=outreachID).name
            oldGroupName = oldName
            if OutreachList.objects.get(id=outreachID).notification_enabled :
                scheduleId = OutreachList.objects.get(id=outreachID).schedule_id
                crontabId = PeriodicTask.objects.get(id=scheduleId).crontab_id
                PeriodicTask.objects.filter(id=scheduleId).delete() 
                CrontabSchedule.objects.filter(id=crontabId).delete()
            OutreachList.objects.filter(id=outreachID).delete()
            Group.objects.filter(name=oldGroupName).delete()
            oldGroupName = oldName+' dashboard'
            Group.objects.filter(name=oldGroupName).delete()
            Apps.objects.filter(app_name=oldName).delete()
            AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="An outreach deleted")
            return JsonResponse({'status':1})
        except Exception as e:
            return JsonResponse({'status':0})

def activate(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
        user = None

    if user is not None and account_activation_token.check_token(user, token):
        return render(request,'mainapp/password_creation.html',{'user_id':user.pk,'user_mail':user.email})
    else:
        return redirect('/invalidlink/')

class SetPassword(View):
    def post(self, request):
        try:
            userId = self.request.POST.get('userid',False)
            pwd = self.request.POST.get('pwd')
            # domain = self.request.POST.get('orgname')
            user = User.objects.get(id=userId)
            user.set_password(pwd)
            user.is_active = True
            user.profile.email_confirmed = True
            user.save()
            if not create_keycloak_record(user.email, pwd, user.first_name, user.last_name):
                print("Failed to create User in Keycloak")
                return JsonResponse({'status':0})
            return JsonResponse({'status':1})
        except Exception as e:
            print(e)
            return JsonResponse({'status':0})

class EditOutreachPublish(LoginRequiredMixin, View):
    def post(self, request):
        try:
            published = self.request.POST.get("published",False)
            outreachID = self.request.POST.get("index",False)
            if published=='true':
                published=True
            else:
                published=False
            n = OutreachList.objects.filter(id=outreachID).update(is_published=published)
            AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="An outreach publish status changed")
            return JsonResponse({'status':1})
        except Exception as e:
            return JsonResponse({'status':0})
class MembersList(LoginRequiredMixin, TemplateView):
    template_name = 'mainapp/member-table/member_table.html'
    
    def dispatch(self, request,*args, **kwargs):
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(Q(name="Organization admin") | Q(name="Member management")).exists():
                    #  organisation_name = {'organisation_name':(self.request.META['HTTP_HOST'].split('.')[0]).capitalize()}
                    return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        is_logged_in = autoLoginCheck(request)
        if is_logged_in:
            if self.request.user.is_authenticated:
                if not self.request.user.groups.filter(Q(name="Organization admin") | Q(name="Member management")).exists():
                        #  organisation_name = {'organisation_name':(self.request.META['HTTP_HOST'].split('.')[0]).capitalize()}
                        return redirect('/permissiondenied/')
                return super().dispatch(request, *args, **kwargs)
        return HttpResponseRedirect('http://yettihealth.com')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        context['page_name'] = 'Member Page'
        return context
    
    def post(self, request):
        try:
            searchKey = self.request.POST.get("searchKey", False)
            limit = self.request.POST.get("limit", False)
            page = self.request.POST.get("page", False)
            member_status = self.request.POST.get("member_status", False)
            clientName = GetClientName(request.META['HTTP_HOST'])
            memberList = MemberPatient.objects.filter(tenantmembers__tenant__name=clientName).values()
            if searchKey != '':
                memberList = memberList.filter(identifier__icontains=searchKey)

            if member_status != 'all':
                member_status = True if member_status == 'active' else False
                memberList = memberList.filter(active=member_status)

            memberList = memberList.order_by('-active','name_given')
            if limit and page:
                offset = (int(page) - 1) * int(limit)
                end_offset = offset + int(limit)
                no_item = len(memberList)
                total_page = no_item / int(limit)
                if no_item % int(limit) != 0:
                    total_page += 1
                memberList = memberList[offset:end_offset]
                if len(memberList) == 0:
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
            return JsonResponse({'memberData':memberList, 'pagination': details})
        except Exception as e:
            return JsonResponse({'error':e})

class PatientUserCreate(LoginRequiredMixin, View):
    def post(self, request):
        try:
            patient_email = self.request.POST.get('patient_login_email', None)
            id = self.request.POST.get("id",False)
            if patient_email is None:
                return JsonResponse({'status':0})
            
            if not User.objects.filter(username=patient_email).exists():
                member = MemberPatient.objects.get(identifier=id, email=patient_email)
                user = User.objects.create(username=patient_email,email=patient_email,first_name=member.name_given,last_name=member.name_family,
                                           is_staff=False,is_active=member.active,is_superuser=False)
                current_site = str(request.get_host())
                domain = GetClientName(request.get_host()) #str(request.get_host()).split('.')[0]
                subject = 'Activate Your '+domain.capitalize()+' Account'
                message = render_to_string('mainapp/account_activation_email.html', {
                                'user': user,
                                'domain': current_site,
                                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                                'token': account_activation_token.make_token(user),
                            })
                user.email_user(subject, message)
                return JsonResponse({'status': 1})
            else:
                return JsonResponse({'status':2})

        except Exception as e:
            return JsonResponse({'status':0})

class PatientEditUpdate(LoginRequiredMixin, View):
     def post(self, request):
        try:
            id = self.request.POST.get("id",False)
            patient_id = self.request.POST.get("patient_id",False)
            patient_id_system = self.request.POST.get("patient_id_system",False)
            patient_given_name = self.request.POST.get("patient_given_name",False)
            patient_family_name = self.request.POST.get("patient_family_name",False)
            patient_name_prefix = self.request.POST.get("patient_name_prefix",False)
            patient_name_suffix = self.request.POST.get("patient_name_suffix",False)
            type_of_submit = self.request.POST.get("type_of_submit",False)
            patient_contact = self.request.POST.get("patient_contact",False)
            patient_contact_use = self.request.POST.get("patient_contact_use",False)
            patient_gender = self.request.POST.get("patient_gender",False)
            patient_address_use = self.request.POST.get("patient_address_use",False)
            patient_line = self.request.POST.get("patient_line",False)
            patient_city = self.request.POST.get("patient_city",False)
            patient_district = self.request.POST.get("patient_district",False)
            patient_postalcode = self.request.POST.get("patient_postalcode",False)
            patient_state = self.request.POST.get("patient_state",False)
            patient_country = self.request.POST.get("patient_country",False)
            patient_dob = self.request.POST.get("patient_dob",False)
            patient_photo = self.request.FILES.get('patient_photo', None)#self.request.POST.get("patient_photo",False)
            patient_active = self.request.POST.get("patient_active",False)
            patient_dob = patient_dob if not patient_dob == "" else None
            patient_email = self.request.POST.get("email",False)
            patient_preferred_language = self.request.POST.get("preferred_language",False)
            patient_create_user = self.request.POST.get('patient_create_user', False)
            if(patient_active=="active"):
                patient_active = True
            else:
                patient_active = False

            if type_of_submit=='add':
                # pass
                clientName = GetClientName(request.META['HTTP_HOST'])
                clientObj = Client.objects.get(name=clientName)            

                if MemberPatient.objects.filter(Q(identifier=patient_id) | Q(email=patient_email)).exists():
                    if TenantMembers.objects.filter(Q(Q(member__identifier=patient_id) | Q(member__email=patient_email)) & Q(tenant__name=clientName)).exists():
                        return JsonResponse({'status':2})
                    else:
                        TenantMembers.objects.create(member=MemberPatient.objects.get(identifier=patient_id,email=patient_email),tenant=clientObj)
                else:
                    if self.request.user.groups.filter(Q(name='Organization admin') | Q(name="Member management")).exists():
                        memberObj = MemberPatient.objects.create(identifier=patient_id,identifier_system=patient_id_system,active=patient_active,name_given=patient_given_name,name_family=patient_family_name,name_prefix=patient_name_prefix,name_suffix=patient_name_suffix,contact_value=patient_contact,contact_use=patient_contact_use,gender=patient_gender,birthDate=patient_dob,address_use=patient_address_use,address_line=patient_line,address_city=patient_city,address_district=patient_district,address_state=patient_state,address_postalCode=patient_postalcode,address_country=patient_country,photo=patient_photo,email=patient_email,preferred_language=patient_preferred_language)

                        TenantMembers.objects.create(member=memberObj,tenant=clientObj)
                        AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="A member patient details added")

                        if patient_create_user and not User.objects.filter(username=patient_email).exists():
                            user = User.objects.create(username=patient_email,email=patient_email,first_name=patient_given_name,last_name=patient_family_name,is_staff=False,is_active=patient_active,is_superuser=False)
                            current_site = str(request.get_host())
                            domain = clientName #str(request.get_host()).split('.')[0]
                            subject = 'Activate Your '+domain.capitalize()+' Account'
                            message = render_to_string('mainapp/account_activation_email.html', {
                                'user': user,
                                'domain': current_site,
                                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                                'token': account_activation_token.make_token(user),
                            })
                            user.email_user(subject, message)    
               
            elif type_of_submit=='update':
                if self.request.user.groups.filter(Q(name='Organization admin') | Q(name="Member management")).exists() and MemberPatient.objects.filter(identifier=id).exists():
                    if not id== patient_id and MemberPatient.objects.filter(Q(identifier=patient_id) | Q(email=patient_email)).exists():
                        return JsonResponse({'status':2})
                    else:
                        email = MemberPatient.objects.get(identifier=id).email
                        memberPatientObjToUpdate = MemberPatient.objects.get(identifier=id)
                        memberPatientObjToUpdate.identifier = patient_id
                        memberPatientObjToUpdate.identifier_system = patient_id_system
                        memberPatientObjToUpdate.active = patient_active
                        memberPatientObjToUpdate.name_given = patient_given_name
                        memberPatientObjToUpdate.name_family = patient_family_name
                        memberPatientObjToUpdate.name_prefix = patient_name_prefix
                        memberPatientObjToUpdate.name_suffix = patient_name_suffix
                        memberPatientObjToUpdate.contact_value = patient_contact
                        memberPatientObjToUpdate.contact_use = patient_contact_use
                        memberPatientObjToUpdate.gender = patient_gender
                        memberPatientObjToUpdate.birthDate = patient_dob
                        memberPatientObjToUpdate.address_use = patient_address_use
                        memberPatientObjToUpdate.address_line = patient_line
                        memberPatientObjToUpdate.address_city = patient_city
                        memberPatientObjToUpdate.address_district = patient_district
                        memberPatientObjToUpdate.address_state = patient_state
                        memberPatientObjToUpdate.address_postalCode = patient_postalcode
                        memberPatientObjToUpdate.address_country = patient_country
                        if patient_photo is not None:
                            memberPatientObjToUpdate.photo = patient_photo
                        memberPatientObjToUpdate.email = patient_email
                        memberPatientObjToUpdate.preferred_language = patient_preferred_language
                        memberPatientObjToUpdate.save(force_update=True)
                        
                        AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="A member patient details updated")
                        if email is not None and User.objects.filter(username=email).exists():
                            if User.objects.get(username=email).groups.filter(Q(name='Organization admin') | Q(name="Member management")).exists():
                                patient_active = True
                            User.objects.filter(username=email).update(username=patient_email,email=patient_email,first_name=patient_given_name,last_name=patient_family_name, is_active=patient_active)
            return JsonResponse({'status':1})
        except Exception as e:
            return JsonResponse({'status':0})

    # def post(self, request):
    #     try:
    #         id = self.request.POST.get("id",False)
    #         patient_id = self.request.POST.get("patient_id",False)
    #         patient_id_system = self.request.POST.get("patient_id_system",False)
    #         patient_given_name = self.request.POST.get("patient_given_name",False)
    #         patient_family_name = self.request.POST.get("patient_family_name",False)
    #         patient_name_prefix = self.request.POST.get("patient_name_prefix",False)
    #         patient_name_suffix = self.request.POST.get("patient_name_suffix",False)
    #         type_of_submit = self.request.POST.get("type_of_submit",False)
    #         patient_contact = self.request.POST.get("patient_contact",False)
    #         patient_contact_use = self.request.POST.get("patient_contact_use",False)
    #         patient_gender = self.request.POST.get("patient_gender",False)
    #         patient_address_use = self.request.POST.get("patient_address_use",False)
    #         patient_line = self.request.POST.get("patient_line",False)
    #         patient_city = self.request.POST.get("patient_city",False)
    #         patient_district = self.request.POST.get("patient_district",False)
    #         patient_postalcode = self.request.POST.get("patient_postalcode",False)
    #         patient_state = self.request.POST.get("patient_state",False)
    #         patient_country = self.request.POST.get("patient_country",False)
    #         patient_dob = self.request.POST.get("patient_dob",False)
    #         patient_photo = self.request.FILES.get('patient_photo', None)
    #         patient_active = self.request.POST.get("patient_active",False)
    #         patient_dob = patient_dob if not patient_dob == "" else None
    #         patient_email = self.request.POST.get("email",False)
    #         patient_preferred_language = self.request.POST.get("preferred_language",False)
    #         patient_create_user = self.request.POST.get('patient_create_user', False)
    #         if(patient_active=="active"):
    #             patient_active = True
    #         else:
    #             patient_active = False
    #         if type_of_submit=='add':

    #             # domain=request.META['HTTP_HOST'].split('.')[0]
    #             # if domain == 'www':
    #             #     domain = request.META['HTTP_HOST'].split('.')[1]

    #             clientName = GetClientName(request.META['HTTP_HOST'])
    #             print(clientName)
    #             clientObj = Client.objects.get(name=clientName)
    #             if MemberPatient.objects.filter(Q(identifier=patient_id) | Q(email=patient_email)).exists():
    #                 if TenantMembers.objects.filter(Q(Q(member__identifier=patient_id) | Q(member__email=patient_email)) & Q(tenant__name=clientName)).exists():
    #                     return JsonResponse({'status':2})
    #                 else:
    #                     TenantMembers.objects.create(member=MemberPatient.objects.get(identifier=patient_id,email=patient_email),tenant=clientObj)
    #             else:
    #                 if self.request.user.groups.filter(Q(name='Organization admin') | Q(name="Member management")).exists():
    #                     memberObj = MemberPatient.objects.create(identifier=patient_id,identifier_system=patient_id_system,active=patient_active,name_given=patient_given_name,name_family=patient_family_name,name_prefix=patient_name_prefix,name_suffix=patient_name_suffix,contact_value=patient_contact,contact_use=patient_contact_use,gender=patient_gender,birthDate=patient_dob,address_use=patient_address_use,address_line=patient_line,address_city=patient_city,address_district=patient_district,address_state=patient_state,address_postalCode=patient_postalcode,address_country=patient_country,photo=patient_photo,email=patient_email,preferred_language=patient_preferred_language)
    #                     TenantMembers.objects.create(member=memberObj,tenant=clientObj)
    #                     AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="A member patient details added")
    #                     if patient_create_user and not User.objects.filter(username=patient_email).exists():
    #                         user = User.objects.create(username=patient_email,email=patient_email,first_name=patient_given_name,last_name=patient_family_name,is_staff=False,is_active=patient_active,is_superuser=False)
    #                         current_site = str(request.get_host())
    #                         domain = clientName #str(request.get_host()).split('.')[0]
    #                         subject = 'Activate Your '+domain.capitalize()+' Account'
    #                         message = render_to_string('mainapp/account_activation_email.html', {
    #                             'user': user,
    #                             'domain': current_site,
    #                             'uid': urlsafe_base64_encode(force_bytes(user.pk)),
    #                             'token': account_activation_token.make_token(user),
    #                         })
    #                         user.email_user(subject, message)
    #         elif type_of_submit=='update':
    #             if self.request.user.groups.filter(Q(name='Organization admin') | Q(name="Member management")).exists() and MemberPatient.objects.filter(identifier=id).exists():
    #                 if not id== patient_id and MemberPatient.objects.filter(Q(identifier=patient_id) | Q(email=patient_email)).exists():
    #                     return JsonResponse({'status':2})
    #                 else:
    #                     email = MemberPatient.objects.get(identifier=id).email
    #                     memberPatientObjToUpdate = MemberPatient.objects.get(identifier=id)
    #                     memberPatientObjToUpdate.identifier = patient_id
    #                     memberPatientObjToUpdate.identifier_system = patient_id_system
    #                     memberPatientObjToUpdate.active = patient_active
    #                     memberPatientObjToUpdate.name_given = patient_given_name
    #                     memberPatientObjToUpdate.name_family = patient_family_name
    #                     memberPatientObjToUpdate.name_prefix = patient_name_prefix
    #                     memberPatientObjToUpdate.name_suffix = patient_name_suffix
    #                     memberPatientObjToUpdate.contact_value = patient_contact
    #                     memberPatientObjToUpdate.contact_use = patient_contact_use
    #                     memberPatientObjToUpdate.gender = patient_gender
    #                     memberPatientObjToUpdate.birthDate = patient_dob
    #                     memberPatientObjToUpdate.address_use = patient_address_use
    #                     memberPatientObjToUpdate.address_line = patient_line
    #                     memberPatientObjToUpdate.address_city = patient_city
    #                     memberPatientObjToUpdate.address_district = patient_district
    #                     memberPatientObjToUpdate.address_state = patient_state
    #                     memberPatientObjToUpdate.address_postalCode = patient_postalcode
    #                     memberPatientObjToUpdate.address_country = patient_country
    #                     if patient_photo is not None:
    #                         memberPatientObjToUpdate.photo = patient_photo
    #                     memberPatientObjToUpdate.email = patient_email
    #                     memberPatientObjToUpdate.preferred_language = patient_preferred_language
    #                     memberPatientObjToUpdate.save(force_update=True)
                        
    #                     AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="A member patient details updated")
    #                     if email is not None and User.objects.filter(username=email).exists():
    #                         if User.objects.get(username=email).groups.filter(Q(name='Organization admin') | Q(name="Member management")).exists():
    #                             patient_active = True
    #                         User.objects.filter(username=email).update(username=patient_email,email=patient_email,first_name=patient_given_name,last_name=patient_family_name, is_active=patient_active)
    #         return JsonResponse({'status':1})
    #     except Exception as e:
    #         print(e)
    #         return JsonResponse({'status':0})

class DeletePatient(LoginRequiredMixin, View):

    def post(self,request):
        try:
            id = self.request.POST.get("id",False)
            MemberPatient.objects.filter(identifier=id).update(active=False)
            AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="A member patient details deleted")
            return JsonResponse({'status': 1})
        except Exception as e:
            return JsonResponse({'status': 0})

class InvalidLink(TemplateView):
    template_name = 'mainapp/linkinvalid.html'

    def get_context_data(self, **kwargs):
            context = super().get_context_data(**kwargs)
            logo, title, titlelogo = logoRendering(self.request)
            context['logo'] = logo
            context['title'] = title
            context['titlelogo'] = titlelogo
            return context

class GetOutreachList(LoginRequiredMixin, View):
    def post(self, request):
        threshold = subscriptionCheck(request)
        try:
            outreach_list = list(OutreachList.objects.all().values())
            return JsonResponse({'status':1,'outreach_list':outreach_list})
        except Exception as e:
            return JsonResponse({'status':0,'outreach_list':[]})

def get_states_in_country(request):
    data = {}
    country_code = request.GET.get('country_code')
    states_list = get_regions_in_country(country_code)
    states_list.append(['Other', 'Other'])
    data['states'] = states_list
    return JsonResponse(data)

class AddQualityReports(LoginRequiredMixin, View):
    def post(self, request):
        try:
            id = self.request.POST.get("id",False)
            type_of_submit = self.request.POST.get("type_of_submit",False)
            qualityReport = self.request.POST.get("quality_service",False)
            fieldName = self.request.POST.get("field_name",False)
            qualityName = self.request.POST.get("quality",False)
            if not self.request.user.groups.filter(Q(name="Organization admin") | Q(name=qualityName)).exists() and (not qualityName == "Appointment") :
                return JsonResponse({'status':3})
            if type_of_submit=='add_report_type':
                if qualityReport:
                    if QualityServices.objects.filter(quality=qualityName, field_value__iexact=qualityReport, field_name=fieldName).exists():
                        return JsonResponse({'status':2})
                    QualityServices.objects.create(field_value=qualityReport, quality=qualityName, field_name=fieldName)
                    AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="Quality report type added")
            elif type_of_submit=='edit_quality_report':
                if qualityReport and qualityName:
                    if QualityServices.objects.filter(quality=qualityName, field_value__iexact=qualityReport, field_name=fieldName).exclude(id=id).exists():
                        return JsonResponse({'status':2})
                    QualityServices.objects.filter(id=id).update(field_value=qualityReport)
                    AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="Quality report type updated")
            elif type_of_submit=='delete_quality_report':
                QualityServices.objects.filter(id=id).delete()
                AppAccessData.objects.create(user=self.request.user,app_name="Apps home",app_specific_page_name=self.request.path,action="Quality report type deleted")
            reportTypes = qualityReportList(self.request.user)
            return JsonResponse({'status':1,'reports':reportTypes})
        except Exception as e:
            return JsonResponse({'status':0})
def qualityReportList(user):
    reportList = QualityServices.objects.all()
    try:
        if not user.groups.filter(name="Grievance dashboard").exists():
            reportList = reportList.exclude(quality='Grievance dashboard')
        if not user.groups.filter(name="Complaint dashboard").exists():
            reportList = reportList.exclude(quality='Complaint dashboard')
        if not user.groups.filter(name="Standards of behavior dashboard").exists():
            reportList = reportList.exclude(quality='Standards of behavior dashboard')
        if not user.groups.filter(name="Consent management admin").exists():
            reportList = reportList.exclude(quality='Consent management admin')
        reportList = list(reportList.all().values())
        return reportList
    except Exception as e:
        return []

def create_form(request):
    if request.method == 'POST':
        form_data = json.loads(request.POST['form_data'])
        form_title = "Appointment"
        form_description = "fdf"
        form = Form.objects.create(name=form_title, description=form_description)
        for card_data in form_data:
            card_title = card_data['title']
            card_description = card_data['description']
            card_type = card_data['type']
            field_options = []
            if card_type in ('radio', 'checkbox', 'dropdown'):
                field_options = card_data['options']
            field = Field.objects.create(form=form, label=card_title, field_type=card_type, options=field_options)
        return JsonResponse({'status':1})
    else:
        return render(request, 'mainapp/Dynamic form/form-creation.html')


def dynamic_form(request):
    if request.method == 'POST':
        form = Form.objects.filter(name='Appointment').last()
        fields = Field.objects.filter(form=form)
        
        # Define a dynamic Django form class based on the fields for the form
        fields_dict = {}
        checkboxes = []
        for field in fields:
            field_kwargs = {
                'label': field.label,
            }
            if field.field_type == 'input':
                fields_dict[field.label] = CharField(**field_kwargs)
            elif field.field_type =='dropdown':
                choices = [(c.strip(), c.strip()) for c in ast.literal_eval(field.options)]
                fields_dict[field.label] = ChoiceField(choices=choices, **field_kwargs)
            elif field.field_type =='radio':
                choices = [(c.strip(), c.strip()) for c in ast.literal_eval(field.options)]
                fields_dict[field.label] = ChoiceField(choices=choices, widget=RadioSelect, **field_kwargs)
            elif field.field_type == 'checkbox':
                checkboxes.append(field.label)
                choices = [(c.strip(), c.strip()) for c in ast.literal_eval(field.options)]
                fields_dict[field.label] = CustomMultipleChoiceField(choices=choices, widget=CheckboxSelectMultiple, **field_kwargs)
            elif field.field_type =='date':
                fields_dict[field.label] = DateField(widget=DateInput(attrs={'type': 'date'}), **field_kwargs)
            elif field.field_type =='text':
                fields_dict[field.label] = CharField(widget=Textarea(attrs={'rows': 3, 'cols': 40}),**field_kwargs)
        DynamicForm = type('DynamicForm', (DjangoForm,), fields_dict)
        
        submittedForm = DynamicForm(request.POST)
        if submittedForm.is_valid():
            selected_values = {}
            for i in checkboxes:
                selected_values[i] = ','.join(submittedForm.cleaned_data[i])
            form_name = "Appointment"
            form_data = json.loads(json.dumps(request.POST))
            form_data.update(selected_values)
            submission = FormSubmission.objects.create(
                form_name=form_name,
                form_data=form_data,
            )
            return JsonResponse({'status':1})
        else:
            return JsonResponse({'status':0})
    else:
        # Retrieve the form details from the Form model
        form = Form.objects.filter(name='Appointment').last()
        form_name = form.name
        form_description = form.description
        
        # Retrieve the fields for the form from the Field model
        fields = Field.objects.filter(form=form)
        
        # Define a dynamic Django form class based on the fields for the form
        fields_dict = {}
        for field in fields:
            field_kwargs = {
                'label': field.label,
            }
            if field.field_type == 'input':
                fields_dict[field.label] = CharField(**field_kwargs)
            elif field.field_type =='dropdown':
                choices = [(c.strip(), c.strip()) for c in ast.literal_eval(field.options)]
                fields_dict[field.label] = ChoiceField(choices=choices, **field_kwargs)
            elif field.field_type =='radio':
                choices = [(c.strip(), c.strip()) for c in ast.literal_eval(field.options)]
                fields_dict[field.label] = ChoiceField(choices=choices, widget=RadioSelect, **field_kwargs)
            elif field.field_type == 'checkbox':
                choices = [(c.strip(), c.strip()) for c in ast.literal_eval(field.options)]
                fields_dict[field.label] = CustomMultipleChoiceField(choices=choices, widget=CheckboxSelectMultiple, **field_kwargs)
            elif field.field_type =='date':
                fields_dict[field.label] = DateField(widget=DateInput(attrs={'type': 'date'}), **field_kwargs)
            elif field.field_type =='text':
                fields_dict[field.label] = CharField(widget=Textarea(attrs={'rows': 3, 'cols': 40}),**field_kwargs)
        DynamicForm = type('DynamicForm', (DjangoForm,), fields_dict)
        
        # Render the form using the dynamic form class and form details
        form = DynamicForm()
        context = {
            'form': form,
            'form_name': form_name,
            'form_description': form_description
        }
        return render(request, 'mainapp/Dynamic form/dynamic_form.html', context)

def form_submissions(request):
    form = Form.objects.filter(name='Appointment').last()
    fields = Field.objects.filter(form=form)
    submissions = FormSubmission.objects.filter(form_name='Appointment')    
    paginator = Paginator(submissions, 10) # Show 10 submissions per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    return render(request, 'mainapp/Dynamic form/form_submissions.html', {'form': form, 'fields': fields, 'page_obj': page_obj})


class UserDemographicDetails(LoginRequiredMixin,DetailView):
    model = User
    template_name = "mainapp/user_demograhics_detail_view.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        context['employee'] = Employee.objects.get(user__id=kwargs['object'].id)
        return context
    
def convert_datetime(dt):
    return datetime.strftime(dt, '%d-%m-%Y')

class BulkUserCreation(LoginRequiredMixin ,View):
    def post(self,request):
        try:
            if 'ingress' in self.request.FILES:
                ingress = self.request.FILES['ingress']
                extension = str(ingress).rsplit( ".", 1 )[1].lower()
                if extension == 'csv':
                    df=pd.read_csv(ingress)
                elif extension == 'xlsx':
                    df=pd.read_excel(ingress)
                else:
                    return JsonResponse({'status':0})
                df.drop(df.filter(regex="Unname"),axis=1, inplace=True)
                if not (len(df.columns)==18 and {'Email','First Name','Last Name','Is Staff','Position ID','Report To Name','Payroll Name','Birth Date','Position Status','Worker Category Description','Job Title Description','Hire Date','Region','EEO Establishment','Job Function Description','Home Department Description','Union Code Description','Is Active'}.issubset(df.columns)):
                    return JsonResponse({'status':2})
                if extension == 'xlsx':
                    df['Birth Date']= df['Birth Date'].apply(convert_datetime)
                    df['Hire Date']= df['Hire Date'].apply(convert_datetime)
                domain = str(request.get_host()).split('.')[0]
                current_site = str(request.get_host())
                users_bulk_creation.delay(df.to_json(),domain,current_site)
                AppAccessData.objects.create(user=self.request.user,app_name="User Management",app_specific_page_name=self.request.path,action="Users creation bulk file uploaded")
            return JsonResponse({'status':1})
        except Exception as e:
            return JsonResponse({'status':0})
        
class MembersConsentList(LoginRequiredMixin, TemplateView):
    template_name = 'mainapp/consent-management/consentTable.html'
    
    def dispatch(self, request,*args, **kwargs):
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(Q(name="Organization admin") | Q(name="Consent management") | Q(name="Consent management admin")).exists():
                    return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        is_logged_in = autoLoginCheck(request)
        if is_logged_in:
            if self.request.user.is_authenticated:
                if not self.request.user.groups.filter(Q(name="Organization admin") | Q(name="Consent management") | Q(name="Consent management admin")).exists():
                        return redirect('/permissiondenied/')
                return super().dispatch(request, *args, **kwargs)
        return HttpResponseRedirect('http://yettihealth.com')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        context['page_name'] = 'Member Consent Page'
        return context
    
    def post(self, request):
        try:
            tenant_name = GetClientName(request.META['HTTP_HOST'])
            searchKey = self.request.POST.get("searchKey", False)
            limit = self.request.POST.get("limit", False)
            page = self.request.POST.get("page", False)
            if self.request.user.groups.filter(Q(name="Organization admin") | Q(name="Consent management admin")).exists():
                memberList = MemberPatient.objects.filter(tenantmembers__tenant__name=tenant_name)
                if searchKey != '':
                    memberList = memberList.filter(Q(identifier__icontains=searchKey) | Q(name_given__icontains=searchKey) | Q(email__icontains=searchKey))
                tenantList = list(TenantMembers.objects.filter(tenant__name=tenant_name).values('tenant__name').distinct())
            else:
                memberList = MemberPatient.objects.filter(email=self.request.user.username)
                if searchKey != '':
                    memberList = memberList.filter(Q(member__identifier__icontains=searchKey) | Q(member__name_given__icontains=searchKey) | Q(member__email__icontains=searchKey))
                tenantList = list(TenantMembers.objects.filter(member__email=self.request.user.username).values('tenant__name').distinct())
            memberList = memberList.order_by('-created_datetime').values()
            consentTypes = list(QualityServices.objects.filter(quality__iexact='Consent management admin', field_name='Consent Type').values('field_value'))
            if limit and page:
                offset = (int(page) - 1) * int(limit)
                end_offset = offset + int(limit)
                no_item = len(memberList)
                total_page = no_item / int(limit)
                if no_item % int(limit) != 0:
                    total_page += 1
                memberList = memberList[offset:end_offset]
                if len(memberList) == 0:
                    details = {'status': '1', 'error': 'No Data Found'}
                else:
                    details = {
                        'status': '1',
                        'totalPages': int(total_page),
                        'currentPage': page,
                    }
            else:
                details = {"status": "0",
                            "error": "limit or page input missing"}
            return JsonResponse({'status':"0",'memberData':memberList, 'pagination': details, "consentTypes": consentTypes, "tenantList": tenantList})
        except Exception as e:
            return JsonResponse({'status':"1"})

class GetConsentTypeList(LoginRequiredMixin, View):
    def post(self, request):
        threshold = subscriptionCheck(request)
        domain = str(request.get_host()).split('.')[0]
        client_name = GetClientName(str(request.get_host()))
        tenant_name = self.request.POST.get("tenant_name", client_name)
        try:
            connection.schema_name = tenant_name
            consentTypes = list(QualityServices.objects.filter(quality__iexact='Consent management admin', field_name='Consent Type').values('field_value'))
            return JsonResponse({'status':1,'consentTypes':consentTypes})
        except Exception as e:
            return JsonResponse({'status':0,'consentTypes':[]})
           
class MembersConsentListAPI(LoginRequiredMixin, View):
    
    def post(self, request):
        try:
            tenant_name = GetClientName(request.META['HTTP_HOST'])
            timeset = getTimeZone(self.request)
            id = self.request.POST.get("id", False)
            if self.request.user.groups.filter(Q(name="Organization admin") | Q(name="Consent management admin")).exists():
                memberConsentList = MemberConsent.objects.filter(member__id=id,tenant__name=tenant_name).values()
            else:
                memberConsentList = MemberConsent.objects.filter(member__id=id).values()
            memberConsentList = list(memberConsentList)
            for item in memberConsentList:
                consentHistroy = list(MemberConsentHistory.objects.filter(member_consent_id=item['id']).order_by('-created_datetime').values())
                consentHistroy = consentHistroy[0]
                item['consent_history_id'] = consentHistroy['id']
                item['consent_status'] = consentHistroy['consent_status']
                item['consent_duration'] = consentHistroy['consent_duration']
                item['purpose_of_data_sharing'] = consentHistroy['purpose_of_data_sharing']
                item['sharing_with_provider'] = consentHistroy['sharing_with_provider']
                item['sharing_for_research'] = consentHistroy['sharing_for_research']
                item['consent_notify'] = consentHistroy['consent_notify']
                item['created_datetime'] = consentHistroy['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S')
            return JsonResponse({'status':"0",'memberConsentList':memberConsentList})
        except Exception as e:
            return JsonResponse({'status':"1",'memberConsentList':[]})


class MembersConsentSaveUpdate(LoginRequiredMixin, View):
    def post(self, request):
        try:
            id = self.request.POST.get("id", False)
            consent_history_id = self.request.POST.get("consentHistoryID", False)
            member_id = self.request.POST.get("memberID", False)
            type_of_submit = self.request.POST.get("typeofSubmit", False)
            consent_status = True if self.request.POST.get("consentStatus", False) == "true" else False
            consent_notify = True if self.request.POST.get("consentNotify", False) == "true" else False
            sharing_with_provider = self.request.POST.get("sharingWithProvider", False)
            sharing_for_research = True if self.request.POST.get("sharingForResearch", False) == "true" else False
            consent_type = self.request.POST.getlist("consentType[]", False)
            consent_duration = self.request.POST.get("consentDuration", False)
            if not consent_duration:
                consent_duration = None
            if consent_type:
                consent_type = ','.join(consent_type)
            else:
                consent_type = ''
            if(type_of_submit == "Update"):
                memberconsent = MemberConsent.objects.get(id=id)
                if consent_status:
                    MemberConsentHistory.objects.filter(id=consent_history_id).update(active=False)
                    MemberConsentHistory.objects.create(member_consent=memberconsent,consent_status=consent_status,consent_duration=consent_duration,purpose_of_data_sharing=consent_type,sharing_with_provider=sharing_with_provider,sharing_for_research=sharing_for_research,consent_notify=consent_notify,active=True,created_by=self.request.user)
                else:
                    MemberConsentHistory.objects.filter(id=consent_history_id).update(consent_status=False,active=False,revoked_by=self.request.user.username)
                AppAccessData.objects.create(user=self.request.user,app_name="Consent management",app_specific_page_name=self.request.path,action="Consent updated")
            elif(type_of_submit == "Add"):
                tenant = Client.objects.get(name=sharing_with_provider)
                memberconsentObj = MemberConsent.objects.create(member=MemberPatient.objects.get(id=member_id),tenant=tenant)
                MemberConsentHistory.objects.create(member_consent=memberconsentObj,consent_status=consent_status,consent_duration=consent_duration,purpose_of_data_sharing=consent_type,sharing_with_provider=tenant.name,sharing_for_research=sharing_for_research,consent_notify=consent_notify,active=True,created_by=self.request.user)
                AppAccessData.objects.create(user=self.request.user,app_name="Consent management",app_specific_page_name=self.request.path,action="New consent added")
            return JsonResponse({'status':"0",'message':"Updated successfully"})
        except Exception as e:
            return JsonResponse({'status':"1",'message':"Something happened, try again"})
        
class ConsentHistoryDetailView(LoginRequiredMixin,DetailView):
    model = MemberConsent
    template_name = "mainapp/consent-management/consentHistroy.html"

    def get_context_data(self, **kwargs):
        timeset = getTimeZone(self.request)
        context = super(ConsentHistoryDetailView, self).get_context_data(**kwargs)
        history = list(MemberConsentHistory.objects.filter(member_consent_id=self.kwargs['pk']).values().order_by('-created_datetime'))
        [book.update({
                'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S'),
                'modified_datetime': book['modified_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S'),
                'duration': (book['consent_duration'] - datetime.now().replace(tzinfo=pytz.utc).astimezone(timeset).date()).days,
        }) for book in history]
        context["consenthistory"] = history
        return context


class MembersConsentFHIR(View):
    
    def get(self, request):
        try:
            id = self.request.GET.get('id', None)
            fhir_reponse = {'status':"0",'message':'No Member Associated with this ID'}
            if id != None:
                member_data = list(MemberPatient.objects.filter(identifier=id).values())
                if member_data:
                    fhir_reponse = {
                            "resourceType": "Consent",
                            "id": "consent-example-basic",
                            "text": {
                                "status": "generated",
                                "div": "\"<div xmlns=\"http://www.w3.org/1999/xhtml\">\n      <p>\n\t      Authorize Normal access for Treatment\n\t\t\t</p>\n      <p>\n      Patient &quot;"+ member_data[0]['name_given']+" (&quot;Jim&quot;)&quot; wishes to have all of the PHI collected at the Burgers University Medical Center available for normal treatment use.\n\t\t\t</p>\n    </div>\""
                            },
                            "status": "active",
                            "category": [
                                {
                                    "coding": [
                                        {
                                            "system": "http://loinc.org",
                                            "code": "59284-0"
                                        }
                                    ]
                                }
                            ],
                            "subject": {
                                "reference": "Patient/example",
                                "display":  member_data[0]['name_given']
                            },
                            "date": "2018-12-28",
                            "controller": [
                                {
                                    "reference": "Organization/f001",
                                    "display": 'null'
                                }
                            ],
                            "sourceAttachment": [
                                {
                                    "title": "The terms of the consent in lawyer speak."
                                }
                            ],
                            "regulatoryBasis": [
                                {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                                            "code": "INFA"
                                        }
                                    ]
                                }
                            ],
                            "decision": "deny",
                            "provision": [
                                {
                                    "period": {
                                        "start": "1964-01-01",
                                        "end": "2019-01-01"
                                    }
                                }
                            ]
                    }
            return JsonResponse(fhir_reponse)
        except Exception as e:
            return JsonResponse({'status':"1",'message':'Something happened. Please try again later'})