from django.views.generic import View, TemplateView
from .models import Client,Domain,AppPermissionGroups
from mainapp.models import FavouriteApps,AppAccessData, Apps, AppsButtons, AppOrdering, OrganisationSSO
from django.http import JsonResponse
from django.shortcuts import redirect,render
from django.contrib.auth.models import User,Group
from django.db import connection,connections
from django.contrib.auth import authenticate, login
import json
from django.db.models import Q
from django.contrib.auth.hashers import make_password
from django_tenants.utils import get_tenant_model,get_tenant_database_alias, schema_exists
from django_tenants.postgresql_backend.base import is_valid_schema_name
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, redirect
from django.contrib.auth.views import redirect_to_login
import os, shutil
from django.conf import settings
from django.contrib import messages
from outreach.models import OutreachList
import pytz
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from mainapp.tokens import account_activation_token
from django.http.response import HttpResponseRedirect

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

def autoLoginCheck(request):
    try:
        email = request.headers['Email']
        print("tenant EMAIL:",email)
        if email != '':
            user = User.objects.get(email=email)
            login(request,user,backend='django.contrib.auth.backends.ModelBackend')
            return True
        else:
            return False
    except Exception as e:
         print("Tenant", e)
         return False

# Create your views here.

class TenantRegister(LoginRequiredMixin, TemplateView):
    template_name = 'tenant_reg.html'
    login_url = '/accounts/v1/login/'

class LoginTemplate(TemplateView):
    template_name = 'accounts/login.html'

    def get_context_data(self, **kwargs):
        context = super(LoginTemplate, self).get_context_data(**kwargs)
        context['redirect_field_name'] = 'next'
        context['redirect_field_value'] = self.request.get_full_path().split('=')[1]
        return context

    def post(self, request):
        username = self.request.POST.get("login",False)
        password = self.request.POST.get("password",False)
        next = self.request.POST.get("next",False)
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request,user,backend='django.contrib.auth.backends.ModelBackend')
            return redirect(next)
        else:
            messages.error(request,'The username and/or password you specified are not correct.')
            return redirect('/accounts/v1/login/?next='+next)

class SettingsPage(LoginRequiredMixin, TemplateView):
    template_name = 'settings.html'
    login_url = '/accounts/v1/login/'

class TenantEdit(LoginRequiredMixin ,View):
    def post(self,request):
        try:
            tenant_name = self.request.POST.get("tenant_name",'')
            tenant_admin = self.request.POST.get("tenant_admin",'')
            service_type  = self.request.POST.get("service_type",'')
            client_id = self.request.POST.get("client_id",False)
            secret_id = self.request.POST.get("secret_id",False)
            tenant_id = self.request.POST.get("tenant_id",False)
            logo = titlelogo = ""
            if 'logo' in self.request.FILES:
                logo = self.request.FILES['logo']
            if 'titlelogo' in self.request.FILES:
                titlelogo = self.request.FILES['titlelogo']
            id = self.request.POST.get("id",False)
            if(tenant_name=='' or tenant_admin=='' or service_type=='' or id==''):
                return JsonResponse({'status':0})
            _connection = connections[get_tenant_database_alias()]
            cursor = _connection.cursor()
            tenant_model = get_tenant_model()
            tenant = tenant_model.objects.get(id=id)
            old_tenant_name = tenant.schema_name
            if not tenant.schema_name == tenant_name:
                if schema_exists(tenant_name):
                    return JsonResponse({'status':3})
                if not is_valid_schema_name(tenant_name):
                    return JsonResponse({'status':4})("Invalid string used for the schema name.")
                sql = 'ALTER SCHEMA {0} RENAME TO {1}'.format(tenant.schema_name, tenant_name)
                cursor.execute(sql)
                cursor.close()
                tenant.schema_name = tenant_name
                tenant.save()
                Client.objects.filter(name=old_tenant_name).update(name=tenant_name)
                Domain.objects.filter(domain=old_tenant_name+'.mybasa.info').update(domain=tenant_name+'.mybasa.info')

            client = Client.objects.get(id=id)
            connection.schema_name = tenant.name
            if client_id and secret_id and tenant_id:
                if client_id!='' and secret_id!='' and tenant_id!='':
                    if OrganisationSSO.objects.all().exists():
                        id = list(OrganisationSSO.objects.all().values('id'))[0]['id']
                        OrganisationSSO.objects.filter(id=id).update(client_id=client_id,secret_id=secret_id,tenant_id=tenant_id)
                    else:
                        OrganisationSSO.objects.create(client_id=client_id,secret_id=secret_id,tenant_id=tenant_id)
            if client.admin_user != tenant_admin:
                if not User.objects.filter(username=tenant_admin).exists():
                    return JsonResponse({'status':2})
                else:
                    user = User.objects.get(username=tenant_admin)
                    user.is_staff=True
                    user.save()
                    client.admin_user = tenant_admin
                    client.save()
                connection.schema_name = 'public'
                if not User.objects.filter(username=tenant_admin).exists():
                    User.objects.create(username=user.username,password=user.password,email=user.email,first_name=user.first_name,last_name=user.last_name,is_staff=True,is_active=True,is_superuser=False)
            if client.subscription != int(service_type):
                if int(service_type)>client.subscription:
                    connection.schema_name = tenant.name
                    groups = list(AppPermissionGroups.objects.filter(subscription__lte=int(service_type)).values('group_name'))
                    admin_user_list = list(User.objects.filter(groups__name='Organization Admin').values('id'))
                    for user in admin_user_list:
                        user = User.objects.get(id=user['id'])
                        for group in groups:
                            if not Group.objects.filter(name=group['group_name']).exists():
                                Group.objects.create(name=group['group_name'])
                                group_instance = Group.objects.get(name=group['group_name'])
                                group_instance.user_set.add(user)
                elif int(service_type)<client.subscription:
                    connection.schema_name = tenant.name
                    groups = list(AppPermissionGroups.objects.filter(subscription__gt=int(service_type)).values('group_name'))
                    for group in groups:
                        Group.objects.filter(name=group['group_name']).delete()
                connection.schema_name = 'public'
                client.subscription = service_type
                client.save()
            if not logo =="":
                if not client.logo == "":
                    client.logo.delete()
                client.logo = logo
                client.save()
            if not titlelogo =="":
                if not client.title_logo == "":
                    client.title_logo.delete()
                client.title_logo = titlelogo
                client.save()
            return JsonResponse({'status':1})
        except Exception as e:
            return JsonResponse({'status':0})

class TenantStatusEdit(LoginRequiredMixin, View):
    def post(self,request):
        try:
            tenant_status = self.request.POST.get("tenant_status",False)
            id = self.request.POST.get("id",False)
            tenant_model = get_tenant_model()
            tenant = tenant_model.objects.get(id=id)
            if tenant_status=='start':
                Domain.objects.filter(id=id).update(domain=tenant.schema_name+'.mybasa.info')
                Client.objects.filter(id=id).update(status=True)
            elif tenant_status=='stop':
                Domain.objects.filter(id=id).update(domain='.mybasa.info')
                Client.objects.filter(id=id).update(status=False)
            elif tenant_status=='terminate':
                static_dir = settings.STATIC_ROOT
                new_dir_path = os.path.join(static_dir, tenant.name)
                try:
                    shutil.rmtree(new_dir_path)
                except Exception as e:
                    pass
                tenant.auto_drop_schema = True
                tenant.delete()

            return JsonResponse({'status':1})
        except Exception as e:
            return JsonResponse({'status':0})

class UserLogin(View):
    def post(self,request):
        try:
            submit_type = self.request.POST.get("type",False)
            email = self.request.POST.get("email",False)
            firstname = self.request.POST.get("firstname",False)
            lastname = self.request.POST.get("lastname",False)
            password = self.request.POST.get("password",False)
            if submit_type=='Login':
                user = authenticate(request, username=email, password=password)
                if user is not None:
                    login(request,user,backend='django.contrib.auth.backends.ModelBackend')
                    return JsonResponse({'status':1})
                else:
                    return JsonResponse({'status':2})
            elif submit_type=="Register":
                if User.objects.filter(Q(username=email) | Q(email=email)).exists():
                    return JsonResponse({'status':2})
                password = make_password(password)
                User.objects.create(username=email,password=password,email=email,first_name=firstname,last_name=lastname,is_active=True,is_staff=True,is_superuser=False)
                return JsonResponse({'status':3})
        except Exception as e:
            return JsonResponse({'status':0})

class GetTenantList(LoginRequiredMixin, View):
    def post(self,request):
        try:
            table_sort = self.request.POST.get("table_sort", {})
            table_sort = json.loads(table_sort)
            is_superuser = False
            timeset = getTimeZone(self.request)
            if User.objects.filter(username=self.request.user.username,is_superuser=True).exists():
                first_data = Client.objects.all()
                is_superuser = True
            else:
                first_data = Client.objects.filter(admin_user=self.request.user.username)
            book_data = list(
                first_data.values().order_by('-created_datetime'))
            for book in book_data:
                if not book['logo'] == "":
                    book['logo'] = Client.objects.get(id=book['id']).logo.url
                if not book['title_logo'] == "":
                    book['title_logo'] = Client.objects.get(id=book['id']).title_logo.url
                connection.schema_name=book['name']
                book.update({
                'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S'),
                })
                book['client_id'] = ''
                book['secret_id'] = ''
                book['tenant_id'] = ''
                if OrganisationSSO.objects.all().exists():
                    sso_id = list(OrganisationSSO.objects.all().values('client_id','secret_id','tenant_id'))[0]
                    book['client_id'] = sso_id['client_id']
                    book['secret_id'] = sso_id['secret_id']
                    book['tenant_id'] = sso_id['tenant_id']
            if 'create_date' in table_sort:
                if(table_sort['create_date'] == "asc"):
                    book_data = list(
                        first_data.values().order_by('created_datetime'))
                    [book.update({
                        'created_datetime': book['created_datetime'].strftime('%Y-%m-%d %H:%M:%S'),
                    }) for book in book_data]
            return JsonResponse({'status':1,'data':book_data,'is_superuser':is_superuser})
        except Exception as e:
            return JsonResponse({'status':0})

class CheckTenantName(LoginRequiredMixin, View):
    def post(self,request):
        tenantName = self.request.POST.get("organisation_name", False)
        domain = list(Client.objects.all().values())
        try:
            if Client.objects.filter(schema_name=tenantName).exists():
                return JsonResponse({'status': '1'})
            else:
                return JsonResponse({'status': '0'})
        except Exception as e:
            return JsonResponse({'status': e})
            
class AddTenant(View):
    def post(self,request):
        try: 
            service_plan = self.request.POST.get("service_plan", False)
            tenantName = self.request.POST.get("organisation_name", False)
            organisationAdmin = self.request.POST.get("organisation_admin", False)
            # user = User.objects.get(username=self.request.user)
            client = Client()
            client.admin_user = organisationAdmin
            client.schema_name = tenantName
            client.name = tenantName
            client.paid_until = '2022-10-10'
            client.on_trial = True
            client.subscription= service_plan
            client.save()
            domain = Domain()
            domain.domain = tenantName+'.mybasa.info'
            domain.tenant = client
            domain.is_primary =True
            domain.save()
            apps = Apps.objects.all()
            apps = list(apps.values())
            appButtons = list(AppsButtons.objects.all().values())
            connection.schema_name = tenantName
            user = User.objects.create(username=organisationAdmin,email=organisationAdmin,first_name=organisationAdmin,is_active=False,is_staff=True,is_superuser=False)
            user.save()
            groups = list(AppPermissionGroups.objects.filter(subscription__lte=service_plan).values('group_name'))
            for group in groups:
                Group.objects.create(name=group['group_name'])
                group_instance = Group.objects.get(name=group['group_name'])
                group_instance.user_set.add(user)
            for s in apps:
                s['domain_name'] = tenantName+"."+s['domain_name']
                Apps.objects.create(**s)
            for b in appButtons:
                if 'https' in b['button_href']:
                    b['button_href'] = b['button_href'].split("//")[0]+"//"+tenantName+"."+b['button_href'].split("//")[1]
                AppsButtons.objects.create(**b)
            #Getting static folder path from project settings
            static_dir = settings.STATIC_ROOT
            subject = 'Activate Your '+domain.domain.capitalize()+' Account'
            message = render_to_string('mainapp/account_activation_email.html', {
                'user': user,
                'domain': domain.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': account_activation_token.make_token(user),
            })
            user.email_user(subject, message)
            return JsonResponse({'status': '1'})
        except Exception as e:
            return JsonResponse({'status': e})     

class HomePage(LoginRequiredMixin,TemplateView):
    template_name = 'home.html'
    def dispatch(self, request,*args, **kwargs):
        print(self.request.get_host())
        if self.request.user.is_authenticated:
           print("tenant already authenticated")
           if not self.request.user.is_superuser:
               return render(request, 'mainapp/permissiondenied.html')
           return super().dispatch(request, *args, **kwargs)
        is_logged_in = autoLoginCheck(request)
        print("tenant is_logged_in:",is_logged_in)
        if is_logged_in:
            print("tenant inside logged in true")
            if self.request.user.is_authenticated:
               print("tenant authenticated successfully")
               if not self.request.user.is_superuser:
                   return render(request, 'mainapp/permissiondenied.html')
               return super().dispatch(request, *args, **kwargs)
        print("tenant authentication is failed")
        return redirect('/logout')


class AppsPage(LoginRequiredMixin,TemplateView):
    template_name = 'apps.html'
    login_url = '/accounts/v1/login/'

    # def dispatch(self, request,*args, **kwargs):
    #     print(self.request.get_host())
    #     if self.request.user.is_authenticated:
    #        print("tenant already authenticated")
    #        if not self.request.user.is_superuser:
    #            return render(request, 'mainapp/permissiondenied.html')
    #        return super().dispatch(request, *args, **kwargs)
    #     is_logged_in = autoLoginCheck(request)
    #     print("tenant is_logged_in:",is_logged_in)
    #     if is_logged_in:
    #         print("tenant inside logged in true")
    #         if self.request.user.is_authenticated:
    #            print("tenant authenticated successfully")
    #            if not self.request.user.is_superuser:
    #                return render(request, 'mainapp/permissiondenied.html')
    #            return super().dispatch(request, *args, **kwargs)
    #     print("tenant authentication is failed")
    #     return redirect('/logout')


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
        try:
            app_name = self.request.POST.get("app_name",None)
            search_key = self.request.POST.get("search_key",None)
            date_start = self.request.POST.get("date_start",None)
            date_end = self.request.POST.get("date_end",None)
            limit = self.request.POST.get("limit", False)
            page = self.request.POST.get("page", False)

            timeset = getTimeZone(self.request)

            date_start = date_start + ' 00:00:00'
            date_end = date_end + ' 23:59:59'

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
            is_user_has_access = True

            appobj = Apps.objects.all().values('app_name')
            apps_list = []
            for apps in appobj:
                apps_list.append([apps['app_name'],apps['app_name']])
            return JsonResponse({'status':1,'tracker_list':tracker_list, 'pagination':pagination, 'is_user_has_access':is_user_has_access, 'total_visits':total_visits, 'apps_list':apps_list})
        except Exception as e:
            return JsonResponse({'status':0,'tracker_list':[],'pagination':[], 'is_user_has_access':None, 'total_visits':0, 'apps_list':[]})

class GetAppList(LoginRequiredMixin, View):
    def post(self, request):
        try:
            apps_type = self.request.POST.get("apps_type",None)
            search_key = self.request.POST.get("search_key",None)

            apps_list = Apps.objects.all()
            
            if apps_type!='all':
                if apps_type=='myfavorites':
                    apps_list = Apps.objects.filter(favouriteapps__user=self.request.user)
                else:
                    apps_list = apps_list.filter(app_type=apps_type)

            type_of_user = 'user'
            if self.request.user.is_superuser:
                type_of_user = 'superadmin'
            elif self.request.user.groups.filter(name='edituserpermission').exists():
                type_of_user = 'admin'
                apps_list = apps_list.filter(is_hidden=False)
            else:
                apps_list = apps_list.filter(is_hidden=False)

            if search_key!='':
                apps_list = apps_list.filter(Q(app_name__icontains=search_key) | Q(point_of_contact__icontains=search_key))

            apps_list_before = apps_list
            apps_list = apps_list.filter(appordering__user=self.request.user).order_by('appordering__order')
            apps_list_before = apps_list_before.exclude(pk__in=apps_list.values_list('pk', flat=True))
            apps_list = apps_list | apps_list_before
            apps_list = list(apps_list.values())
            for apps in apps_list:
                apps['buttons'] = list(AppsButtons.objects.filter(app=apps['id']).values('id','button_text','button_href').order_by('button_text'))
                groups = list(AppPermissionGroups.objects.filter(app_name=apps['id']).values('group_name'))
                apps['groups'] = []
                for group in groups:
                    apps['groups'].append(group['group_name'])
                apps['groups'] = ",".join(apps['groups'])
                try:
                    apps['app_logo'] = Apps.objects.get(id=apps['id']).app_logo.url
                except:
                    pass
            return JsonResponse({'status':1,'apps_list':apps_list, 'type_of_user':type_of_user})
        except Exception as e:
            return JsonResponse({'status':0,'apps_list':[]})

class AppEditUpdate(LoginRequiredMixin, View):
    def post(self, request):
        try:
            if self.request.user.is_superuser:
                app_id = self.request.POST.get("app_id",False)
                app_name = self.request.POST.get("app_name",False)
                point_of_contact = self.request.POST.get("point_of_contact",False)
                info_text = self.request.POST.get("info_text",False)
                app_domain_main = self.request.POST.get("app_domain",False)
                app_type = self.request.POST.get("app_type",False)
                service_type = self.request.POST.get("service_type",False)
                button_url_1_main = self.request.POST.get("button_url_1",False)
                button_name_1 = self.request.POST.get("button_name_1",False)
                button_id_1 = self.request.POST.get("button_id_1",False)
                button_url_2_main = self.request.POST.get("button_url_2",False)
                button_name_2 = self.request.POST.get("button_name_2",False)
                button_id_2 = self.request.POST.get("button_id_2",False)
                button_url_3_main = self.request.POST.get("button_url_3",False)
                button_name_3 = self.request.POST.get("button_name_3",False)
                button_id_3 = self.request.POST.get("button_id_3",False)
                app_hide = self.request.POST.get("app_hide",False)
                type_of_submit = self.request.POST.get("type_of_submit",False)
                required_groups = self.request.POST.get("required_groups",False)
                if(app_hide=="true"):
                    app_hide = True
                else:
                    app_hide = False
                app_name = app_name.capitalize()
                required_groups = required_groups.split(",")
                required_groups =list(map(lambda x:str(x).strip(' \t\n\r').capitalize(), required_groups))
                app_groups_to_add = []
                app_groups_to_delete = []
                if type_of_submit == 'update' and Apps.objects.filter(tenant_app_id=app_id).exists():
                    oldApp = Apps.objects.get(tenant_app_id=app_id)
                    groups = list(AppPermissionGroups.objects.filter(app_name_id=oldApp.id).values('group_name'))
                    app_groups = []
                    app_groups_to_add = []
                    app_groups_to_delete = []
                    for group in groups:
                        app_groups.append(group['group_name'])
                    app_groups_to_add = list(set(required_groups) - set(app_groups))
                    app_groups_to_delete = list(set(app_groups) -set(required_groups))
                for schema in Client.objects.all().values('name'):
                    connection.schema_name = schema['name']
                    if Apps.objects.filter(app_name=app_name).exists():
                        if type_of_submit=='add' or Apps.objects.get(app_name=app_name).tenant_app_id == app_id:
                            # obj =list(Apps.objects.filter(app_name=app_name).all().values())[0]
                            return JsonResponse({'status':2})
                    for group in required_groups:
                        if type_of_submit=='add' and  (AppPermissionGroups.objects.filter(group_name=group.capitalize()).exists() or Group.objects.filter(name=group.capitalize()).exists()):
                            return JsonResponse({'status':3,'group':group})
                        if type_of_submit=='update':
                            if AppPermissionGroups.objects.exclude(app_name_id=oldApp.id).filter(group_name=group.capitalize()).exists() or ((not AppPermissionGroups.objects.filter(group_name=group.capitalize()).exists()) and Group.objects.filter(name=group.capitalize()).exists()):
                                return JsonResponse({'status':3,'group':group})
                for schema in Client.objects.all().order_by('created_on').values('name'):
                    connection.schema_name = schema['name']
                    button_url_1 = button_url_1_main
                    button_url_2 = button_url_2_main
                    button_url_3 = button_url_3_main
                    app_domain = app_domain_main
                    if not connection.schema_name == 'public' and app_type!="administration":
                        app_domain = schema['name']+"."+app_domain
                        if not button_url_1 == "":
                            button_url_1 = button_url_1.split("//")[0] +"//"+schema['name']+"."+button_url_1.split("//")[1]
                        if not button_url_2 == "":
                            button_url_2 = button_url_2.split("//")[0] +"//"+schema['name']+"."+button_url_2.split("//")[1]
                        if not button_url_3 == "":
                            button_url_3 = button_url_3.split("//")[0] +"//"+schema['name']+"."+button_url_3.split("//")[1]
                    if Apps.objects.filter(app_name=app_name).exists():
                        if type_of_submit=='update':
                            if Apps.objects.filter(tenant_app_id=app_id,app_name=app_name).exists():
                                if self.request.user.is_superuser:
                                    Apps.objects.filter(tenant_app_id=app_id).update(app_name=app_name,point_of_contact=point_of_contact,info_text=info_text,domain_name=app_domain,app_type=app_type,is_hidden=app_hide,subscription=service_type)
                                else:
                                     Apps.objects.filter(tenant_app_id=app_id).update(app_name=app_name,point_of_contact=point_of_contact,info_text=info_text,domain_name=app_domain,app_type=app_type,is_hidden=app_hide)
                                AppsObj = Apps.objects.get(tenant_app_id=app_id)
                                if self.request.FILES:
                                    app_logo = self.request.FILES['app_logo']
                                    AppsObj.app_logo = app_logo
                                    AppsObj.save()
                                AppButtonsUpdate(app_id,button_id_1,button_url_1,button_name_1,button_id_2,button_url_2,button_name_2,button_id_3,button_url_3,button_name_3,self.request.user.username)
                                for group in app_groups_to_add:
                                    group = group.capitalize()
                                    if connection.schema_name == 'public':
                                        AppPermissionGroups.objects.create(group_name=group.capitalize(), app_name_id=app_id, subscription=service_type)
                                    else:
                                        if Client.objects.get(name=connection.schema_name).subscription >= int(service_type):
                                            group_instance = Group.objects.create(name=group)
                                            admin_users = list(User.objects.filter(groups__name='Organization admin').values('id'))
                                            for users in admin_users:
                                                group_instance.user_set.add(users['id'])
                                for group in app_groups_to_delete:
                                    if connection.schema_name == 'public':
                                        AppPermissionGroups.objects.filter(group_name=group).delete()
                                    else:
                                        Group.objects.get(name=group).delete()
                            else:
                                return JsonResponse({'status':2})
                        elif type_of_submit=='add':
                            return JsonResponse({'status':2})
                    else:
                        if type_of_submit=='update':
                            if self.request.user.is_superuser:
                                Apps.objects.filter(tenant_app_id=app_id).update(app_name=app_name,point_of_contact=point_of_contact,info_text=info_text,domain_name=app_domain,app_type=app_type,is_hidden=app_hide,subscription=service_type)
                            else:
                                 Apps.objects.filter(tenant_app_id=app_id).update(app_name=app_name,point_of_contact=point_of_contact,info_text=info_text,domain_name=app_domain,app_type=app_type,is_hidden=app_hide)
                            AppsObj = Apps.objects.get(tenant_app_id=app_id)
                            if self.request.FILES:
                                app_logo = self.request.FILES['app_logo']
                                AppsObj.app_logo = app_logo
                                AppsObj.save()
                            for group in app_groups_to_add:
                                    group = group.capitalize()
                                    if connection.schema_name == 'public':
                                        AppPermissionGroups.objects.create(group_name=group.capitalize(), app_name_id=app_id, subscription=service_type)
                                    else:
                                        if Client.objects.get(name=connection.schema_name).subscription >= int(service_type):
                                            group_instance = Group.objects.create(name=group)
                                            admin_users = list(User.objects.filter(groups__name='Organization admin').values('id'))
                                            for users in admin_users:
                                                group_instance.user_set.add(users['id'])
                            for group in app_groups_to_delete:
                                if connection.schema_name == 'public':
                                    AppPermissionGroups.objects.filter(group_name=group).delete()
                                else:
                                    Group.objects.get(name=group).delete()
                            AppButtonsUpdate(app_id,button_id_1,button_url_1,button_name_1,button_id_2,button_url_2,button_name_2,button_id_3,button_url_3,button_name_3,self.request.user.username)
                        elif type_of_submit=='add':
                            id = 1
                            if Apps.objects.all().exists():
                                max_id = Apps.objects.all().order_by("-id").values('id')[0]
                                id = max_id['id']+1
                            AppsObj = Apps.objects.create(id=id,app_name=app_name,point_of_contact=point_of_contact,info_text=info_text,domain_name=app_domain,app_type=app_type,is_hidden=app_hide,subscription=service_type,modified_by='basa admin')
                            if connection.schema_name == 'public':
                                newId = AppsObj.id
                            AppsObj.tenant_app_id = newId
                            AppsObj.save()
                            if self.request.FILES:
                                app_logo = self.request.FILES['app_logo']
                                AppsObj.app_logo = app_logo
                                AppsObj.save()
                            if button_url_1!='' and button_name_1!='':
                                if AppsButtons.objects.all().exists():
                                    max_id = AppsButtons.objects.all().order_by("-id").values('id')[0]
                                    id = max_id['id']+1
                                ButtonObj = AppsButtons.objects.create(id=id,app=AppsObj,button_href=button_url_1,button_text=button_name_1)
                                if connection.schema_name == 'public':
                                    public_buttton_id1 =ButtonObj.id
                                ButtonObj.tenant_button_id = public_buttton_id1
                                ButtonObj.save()
                            if button_url_2!='' and button_name_2!='':
                                if AppsButtons.objects.all().exists():
                                    max_id = AppsButtons.objects.all().order_by("-id").values('id')[0]
                                    id = max_id['id']+1
                                ButtonObj = AppsButtons.objects.create(id=id,app=AppsObj,button_href=button_url_2,button_text=button_name_2)
                                if connection.schema_name == 'public':
                                    public_buttton_id2 =ButtonObj.id
                                ButtonObj.tenant_button_id = public_buttton_id2
                                ButtonObj.save()
                            if button_url_3!='' and button_name_3!='':
                                if AppsButtons.objects.all().exists():
                                    max_id = AppsButtons.objects.all().order_by("-id").values('id')[0]
                                    id = max_id['id']+1
                                ButtonObj = AppsButtons.objects.create(id=id,app=AppsObj,button_href=button_url_3,button_text=button_name_3)
                                if connection.schema_name == 'public':
                                    public_buttton_id3 =ButtonObj.id
                                ButtonObj.tenant_button_id = public_buttton_id3
                                ButtonObj.save()
                            for group in required_groups:
                                group = group.capitalize()
                                if connection.schema_name == 'public':
                                    AppPermissionGroups.objects.create(group_name=group, app_name=AppsObj, subscription=service_type)
                                else:
                                    if Client.objects.get(name=connection.schema_name).subscription >= int(service_type):
                                        Group.objects.create(name=group)
                                        group_instance = Group.objects.get(name=group)
                                        admin_users = list(User.objects.filter(groups__name='Organization admin').values('id'))
                                        for users in admin_users:
                                            group_instance.user_set.add(users['id'])
            return JsonResponse({'status':1})
        except Exception as e:
            return JsonResponse({'status':0})

def AppButtonsUpdate(app_id,button_id_1,button_url_1,button_name_1,button_id_2,button_url_2,button_name_2,button_id_3,button_url_3,button_name_3,username):
    AppObj = Apps.objects.get(tenant_app_id=app_id)
    global public_id
    if button_id_1=='' and button_name_1!='' and button_url_1!='':
        if AppsButtons.objects.all().exists():
            max_id = AppsButtons.objects.all().order_by("-id").values('id')[0]
            id = max_id['id']+1
        button = AppsButtons.objects.create(id=id,app=AppObj,button_href=button_url_1,button_text=button_name_1)
        # button = AppsButtons.objects.filter(app=AppObj).order_by('-id')[0]
        if connection.schema_name == 'public':
            public_id =button.id
        button.tenant_button_id = public_id
        button.save()
    elif button_id_1!='' and (button_name_1=='' or button_url_1==''):
        AppsButtons.objects.get(tenant_button_id=button_id_1).delete()
    elif button_id_1!='' and button_name_1!='' and button_url_1!='':
        AppsButtons.objects.filter(tenant_button_id=button_id_1).update(button_href=button_url_1,button_text=button_name_1,modified_by=username)
    if button_id_2=='' and button_name_2!='' and button_url_2!='':
        if AppsButtons.objects.all().exists():
            max_id = AppsButtons.objects.all().order_by("-id").values('id')[0]
            id = max_id['id']+1
        button =AppsButtons.objects.create(id=id,app=AppObj,button_href=button_url_2,button_text=button_name_2)
        # button = AppsButtons.objects.filter(app=AppObj).order_by('-id')[0]
        if connection.schema_name == 'public':
            public_id =button.id
        button.tenant_button_id = public_id
        button.save()
    elif button_id_2!='' and (button_name_2=='' or button_url_2==''):
        AppsButtons.objects.get(tenant_button_id=button_id_2).delete()
    elif button_id_2!='' and button_name_2!='' and button_url_2!='':
        AppsButtons.objects.filter(tenant_button_id=button_id_2).update(button_href=button_url_2,button_text=button_name_2,modified_by=username)
    if button_id_3=='' and button_name_3!='' and button_url_3!='':
        if AppsButtons.objects.all().exists():
            max_id = AppsButtons.objects.all().order_by("-id").values('id')[0]
            id = max_id['id']+1
        button = AppsButtons.objects.create(id=id,app=AppObj,button_href=button_url_3,button_text=button_name_3)
        # button = AppsButtons.objects.filter(app=AppObj).order_by('-id')[0]
        if connection.schema_name == 'public':
            public_id =button.id
        button.tenant_button_id = public_id
        button.save()
    elif button_id_3!='' and (button_name_3=='' or button_url_3==''):
        AppsButtons.objects.get(tenant_button_id=button_id_3).delete()
    elif button_id_3!='' and button_name_3!='' and button_url_3!='':
        AppsButtons.objects.filter(tenant_button_id=button_id_3).update(button_href=button_url_3,button_text=button_name_3,modified_by=username)
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

class DeleteApp(LoginRequiredMixin, View):

    def post(self,request):
        try:
            id = self.request.POST.get("id",False)
            groups = list(AppPermissionGroups.objects.filter(app_name_id=id).values('group_name'))
            for schema in Client.objects.all().order_by('created_on').values('name'):
                connection.schema_name = schema['name']
                app = Apps.objects.get(tenant_app_id=id)
                if schema['name'] == 'public':
                    AppPermissionGroups.objects.filter(app_name_id=id).delete()
                else:
                    for group in groups:
                        Group.objects.filter(name=group['group_name']).delete()
                app.delete()
            return JsonResponse({'status': 1})
        except Exception as e:
            return JsonResponse({'status': 0})