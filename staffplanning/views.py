from datetime import datetime,timedelta
from django.views.generic import CreateView,TemplateView,View,UpdateView,DetailView
from django.contrib.auth.mixins import LoginRequiredMixin
from staffplanning.forms import StaffPlanningDentalForm, StaffPlanningDentalUpdateForm, StaffPlanningForm, StaffPlanningUpdateForm, StaffPlanningOptometryForm, StaffPlanningOptometryUpdateForm
from staffplanning.models import NumberofAppointment, StaffPlanning, StaffPlanningDental, StaffPlanningOptometry
from django.http import JsonResponse
import pytz
from config.settings import TIME_ZONE as timzon
import json
from operator import itemgetter
from django.db.models import Q
from django.shortcuts import render
from django.contrib.auth.views import redirect_to_login
from django.shortcuts import render,redirect
from django.urls import reverse_lazy
from tenant.models import Client
import config.constants as constants
from mainapp.models import Location, AppAccessData
from django.http import Http404

# Create your views here.

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


class StaffPlanningIndex(LoginRequiredMixin, CreateView):
    template_name = 'staffplanning/staffplanning_url/index.html'
    model = StaffPlanning
    form_class = StaffPlanningForm

    def get_context_data(self, **kwargs):
        context = super(StaffPlanningIndex, self).get_context_data(**kwargs)
        user_location = list(Location.objects.filter(userassignedlocations__user=self.request.user,userassignedlocations__app__app_name__iexact='Staff planning medical').values('id','name').order_by('name'))
        tenant_locations = [] 
        for location in user_location: 
            tenant_locations.append((location['name'],location['name']))
        context["available_locations"] = json.dumps(tenant_locations)
        context['edit_button_show'] = 'd-none'
        if self.request.user.groups.filter(Q(name='Staff planning medical') and Q(name='Staff planning admin')).exists():
            context['edit_button_show'] = ''
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

    def form_valid(self, form):
        timeset = getTimeZone(self.request)
        form.instance.record_created_by = self.request.user.username
        status = super().form_valid(form)
        StaffPlanningobj = StaffPlanning.objects.get(id=self.object.id)
        if form.instance.save_for_tomorrow:
            tomorrow_datetime = StaffPlanningobj.created_datetime.replace(tzinfo=pytz.utc).astimezone(timeset)+timedelta(days=1)
            while(tomorrow_datetime.isoweekday() == 6 or tomorrow_datetime.isoweekday() == 7):
                tomorrow_datetime = tomorrow_datetime+timedelta(days=1)
        else:
            tomorrow_datetime = StaffPlanningobj.created_datetime
        StaffPlanning.objects.filter(id=self.object.id).update(record_date_time=tomorrow_datetime)
        # write_to_ms_sql_server.delay(self.object.id)
        AppAccessData.objects.create(user=self.request.user,app_name="Staff planning medical",app_specific_page_name=self.request.path,action="Staff planning medical form submitted")
        return status

    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.staffReportingPortal:
            raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(name='Staff planning medical').exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())


class StaffPlanningAPIFetchPreviousSubmission(LoginRequiredMixin,View):
    def post(self,request):
        try:
            site = self.request.POST.get("site_name",False)
            day = self.request.POST.get("day",False)
            filtered_data = {}
            number_of_appointments = {}
            timeset = getTimeZone(self.request)
            data_date = datetime.now(timeset)
            end = data_date.strftime('%Y-%m-%d') + ' 23:59:59'
            start = data_date.strftime('%Y-%m-%d') + ' 00:00:00'
            filtered_data = StaffPlanning.objects.filter(record_date_time__lte=end,site=site).order_by('-created_datetime')[:1]
            all_submitted_users_per_day = list(StaffPlanning.objects.filter(record_date_time__range=(start,end),site=site).values('record_created_by','created_datetime').order_by('-created_datetime'))
            [items.update({
                    'created_datetime_time': items['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%I:%M:%S %p'),
                    'created_date': items['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y')})

            for items in all_submitted_users_per_day]
            filtered_data = list(filtered_data.values())
            [items.update({
                    'created_datetime_date': items['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y'),
                    'created_datetime_time': items['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%I:%M %p'),
                    'created_datetime_day_name': items['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%A'),
                    'created_datetime': items['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S')})
            for items in filtered_data]

            productivity_hyperlink = None
            data_date = datetime.now(timeset)-timedelta(days=1)
            if data_date.isoweekday() == 7:
                start = data_date.strftime('%Y-%m-%d') + ' 00:00:00'
                end = data_date.strftime('%Y-%m-%d') + ' 23:59:59'
                productivity_hyperlink = list(StaffPlanning.objects.filter(record_date_time__range=(start,end),site=site).values('id','record_date_time','productivity_status').order_by('-created_datetime'))[:1]
                if not productivity_hyperlink:
                        data_date = data_date-timedelta(days=1)
                        start = data_date.strftime('%Y-%m-%d') + ' 00:00:00'
                        end = data_date.strftime('%Y-%m-%d') + ' 23:59:59'
                        productivity_hyperlink = list(StaffPlanning.objects.filter(record_date_time__range=(start,end),site=site).values('id','record_date_time','productivity_status').order_by('-created_datetime'))[:1]
            elif data_date.isoweekday() == 6:
                start = data_date.strftime('%Y-%m-%d') + ' 00:00:00'
                end = data_date.strftime('%Y-%m-%d') + ' 23:59:59'
                productivity_hyperlink = list(StaffPlanning.objects.filter(record_date_time__range=(start,end),site=site).values('id','record_date_time','productivity_status').order_by('-created_datetime'))[:1]
            if not productivity_hyperlink:
                while(data_date.isoweekday() == 6 or data_date.isoweekday() == 7):
                    data_date = data_date-timedelta(days=1)
                start = data_date.strftime('%Y-%m-%d') + ' 00:00:00'
                end = data_date.strftime('%Y-%m-%d') + ' 23:59:59'
                productivity_hyperlink = list(StaffPlanning.objects.filter(record_date_time__range=(start,end),site=site).values('id','record_date_time','productivity_status').order_by('-created_datetime'))[:1]
            if productivity_hyperlink:
                if productivity_hyperlink[0]['productivity_status']==True:
                    productivity_hyperlink = []
                else:
                    [items.update({
                            'record_datetime_date': items['record_date_time'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y')})
                    for items in productivity_hyperlink]
            no_of_appmnt = NumberofAppointment.objects.filter(site=site)
            number_of_appointments={
                    'no_of_provider_appointments':0,
                    'no_of_app_appointments':0,
                    'no_of_specialty_appointments_obgyn':0,
                    'no_of_specialty_appointments_pediatric':0,
                    'no_of_specialty_appointments_ecmp':0,
                    'no_of_specialty_appointments_endo_cri':0,
                    'no_of_specialty_appointments_infectious':0,
                    'no_of_specialty_appointments_podiatry':0,
                    'no_of_bh_providers_appointments':0,
                    'no_of_telepsychiatry_providers_appointments':0,
                    'no_of_walk_in_providers_appointments':0,
                    'no_of_specialty_appointments_dsmes':0,
                    'no_of_specialty_appointments_optometry':0,
            }
            if no_of_appmnt:
                number_of_appointments={
                    'no_of_provider_appointments':int(list(no_of_appmnt.values('no_of_provider_appointments'))[0]['no_of_provider_appointments']),
                    'no_of_app_appointments':int(list(no_of_appmnt.values('no_of_app_appointments'))[0]['no_of_app_appointments']),
                    'no_of_specialty_appointments_obgyn':int(list(no_of_appmnt.values('no_of_specialty_appointments_obgyn'))[0]['no_of_specialty_appointments_obgyn']),
                    'no_of_specialty_appointments_pediatric':int(list(no_of_appmnt.values('no_of_specialty_appointments_pediatric'))[0]['no_of_specialty_appointments_pediatric']),
                    'no_of_specialty_appointments_ecmp':int(list(no_of_appmnt.values('no_of_specialty_appointments_ecmp'))[0]['no_of_specialty_appointments_ecmp']),
                    'no_of_specialty_appointments_endo_cri':int(list(no_of_appmnt.values('no_of_specialty_appointments_endo_cri'))[0]['no_of_specialty_appointments_endo_cri']),
                    'no_of_specialty_appointments_infectious':int(list(no_of_appmnt.values('no_of_specialty_appointments_infectious'))[0]['no_of_specialty_appointments_infectious']),
                    'no_of_specialty_appointments_podiatry':int(list(no_of_appmnt.values('no_of_specialty_appointments_podiatry'))[0]['no_of_specialty_appointments_podiatry']),
                    'no_of_bh_providers_appointments':int(list(no_of_appmnt.values('no_of_bh_providers_appointments'))[0]['no_of_bh_providers_appointments']),
                    'no_of_telepsychiatry_providers_appointments':int(list(no_of_appmnt.values('no_of_telepsychiatry_providers_appointments'))[0]['no_of_telepsychiatry_providers_appointments']),
                    'no_of_walk_in_providers_appointments':int(list(no_of_appmnt.values('no_of_walk_in_providers_appointments'))[0]['no_of_walk_in_providers_appointments']),
                    'no_of_specialty_appointments_dsmes':0,
                    'no_of_specialty_appointments_optometry':0,
                }
                if datetime.now(timeset).date().isoweekday() == 5 and (site=="N. Fine"):
                    number_of_appointments['no_of_provider_appointments'] = 11
            if day:
                day = datetime.strptime(day, '%m-%d-%Y').date().strftime('%Y-%m-%d')
                start = day + ' 00:00:00'
                end = day + ' 23:59:59'
            else:
                day = datetime.now(timeset).date().strftime('%Y-%m-%d')
                start = day + ' 00:00:00'
                end = day + ' 23:59:59'
            previous_data = list(StaffPlanning.objects.filter(record_date_time__range=(start,end),site=site).order_by('-created_datetime').values()[:1])

            previous_date_data= []
            min_date = list(StaffPlanning.objects.filter(site=site).values('record_date_time').order_by('record_date_time'))[:1]
            if min_date:
                min_date = min_date[0]['record_date_time']
                min_date = min_date.astimezone(timeset).date()
                date_iteration = datetime.now(timeset).date()-timedelta(days=1)
                previous_date_data = StaffPlanning.objects.none()
                while(len(previous_date_data)<2 and min_date<=date_iteration):
                    start = date_iteration.strftime('%Y-%m-%d') + ' 00:00:00'
                    end = date_iteration.strftime('%Y-%m-%d') + ' 23:59:59'
                    data = StaffPlanning.objects.filter(record_date_time__range=(start,end),site=site).order_by('-created_datetime')[:1]
                    previous_date_data |= data
                    date_iteration = datetime.strptime(start, '%Y-%m-%d %H:%M:%S').date()-timedelta(days=1)
                previous_date_data = list(previous_date_data.values('record_date_time'))
                previous_date_data.append({'record_date_time':datetime.now(pytz.utc)})
                [items.update({
                    'created_datetime_date': items['record_date_time'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y')})
                for items in previous_date_data]
                previous_date_data = sorted(previous_date_data, key=itemgetter('record_date_time'), reverse=True)
            return JsonResponse({'status':1,'data':filtered_data,'number_of_appointments':number_of_appointments,'previous_data':previous_data,'previous_date_data':previous_date_data,'productivity_hyperlink':productivity_hyperlink,'all_submitted_users_per_day':all_submitted_users_per_day})
        except Exception as e:
            return JsonResponse({'status':0})

class StaffPlanningProductivityUpdate(LoginRequiredMixin, UpdateView):
    template_name = 'staffplanning/staffplanning_url/index-update.html'
    model = StaffPlanning
    form_class = StaffPlanningUpdateForm

    def form_valid(self, form):
        form.instance.productivity_status = True
        status = super().form_valid(form)
        AppAccessData.objects.create(user=self.request.user,app_name="Staff planning medical",app_specific_page_name=self.request.path,action="Staff planning medical productivity updated")
        return status

    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.staffReportingPortal:
            raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(name='Staff planning medical').exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

    def get_context_data(self, **kwargs):
            context = super().get_context_data(**kwargs)
            logo, title, titlelogo = logoRendering(self.request)
            context['logo'] = logo
            context['title'] = title
            context['titlelogo'] = titlelogo
            return context

class Dashboard(LoginRequiredMixin,TemplateView):
    template_name = 'staffplanning/dashboard/index.html'
    model = StaffPlanning

    def get_context_data(self, **kwargs):
        context = super(Dashboard, self).get_context_data(**kwargs)
        medical_location = list(Location.objects.filter(applocation__app__app_name__iexact='Staff planning medical').values('id','name').order_by('name'))
        dental_location = list(Location.objects.filter(applocation__app__app_name__iexact='Staff planning dental').values('id','name').order_by('name'))
        optometry_location = list(Location.objects.filter(applocation__app__app_name__iexact='Staff planning optometry').values('id','name').order_by('name'))
        medical = [] 
        dental = []
        optometry = []
        for location in medical_location: 
            medical.append((location['name'],location['name']))
        for location in dental_location:
            dental.append((location['name'],location['name']))
        for location in optometry_location:
            optometry.append((location['name'],location['name']))
        context["medical"] = json.dumps(medical)
        context["dental"] = json.dumps(dental)
        context["optometry"] = json.dumps(optometry)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.staffReportingPortal:
            raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(name='Staff planning dashboard').exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

class DashboardAPIFetch(LoginRequiredMixin, View):

    def post(self, request):
        try:
            site = self.request.POST.get("site",False)

            operations_type = self.request.POST.get("operations_type",False)

            date_start = self.request.POST.get("date_today", False)
            
            previous_date_start = (datetime.strptime(date_start, '%Y-%m-%d').date()-timedelta(days=1))

            while(previous_date_start.isoweekday() == 6 or previous_date_start.isoweekday() == 7):
                previous_date_start = previous_date_start-timedelta(days=1)

            previous_date_start = previous_date_start.strftime('%Y-%m-%d')

            previous_date = previous_date_start
            start_date = date_start

            previous_date_end = previous_date_start + ' 23:59:59'
            previous_date_start = previous_date_start + ' 00:00:00'

            date_end = date_start + ' 23:59:59'
            date_start = date_start + ' 00:00:00'
            if(operations_type=="Dental"):
                if site=='All':
                    first_data = StaffPlanningDental.objects.filter(record_date_time__range=(date_start, date_end))
                    previous_data = StaffPlanningDental.objects.filter(record_date_time__range=(previous_date_start, previous_date_end))
                    locations = list(Location.objects.filter(applocation__app__app_name__iexact='Staff planning dental').values('name').order_by('name'))
                    sites = [] 
                    for location in locations: 
                        sites.append((location['name'],location['name']))
                else:
                    first_data = StaffPlanningDental.objects.filter(record_date_time__range=(date_start, date_end),site=site)
                    previous_data = StaffPlanningDental.objects.filter(record_date_time__range=(previous_date_start, previous_date_end),site=site)
                    sites = [(site,site)]
                
                book_data = []
                book_data_two = []

                for site in sites:
                    data = list(first_data.filter(site=site[0]).order_by('-created_datetime').values('site','providers_present','providers_present_comment','registered_dental_hygienist_present','registered_dental_hygienist_present_comment','total_providers_present','total_providers_present_comment','registered_dental_assistants_present','registered_dental_assistants_present_comment','receptionist_present','receptionist_present_comment','receptionist_provider_ratio','receptionist_provider_ratio_comment','dental_assistants_present','dental_assistants_present_comment','dental_hygienist_provider_ratio','dental_hygienist_provider_ratio_comment','dental_assistant_provider_ratio','dental_assistant_provider_ratio_comment','providers_call_outs','registered_dental_hygienist_call_outs','dental_assistant_call_outs','registered_dental_assistant_call_outs','receptionist_call_outs','total_appointment_scheduled_today','total_appointment_scheduled_today_comment','list_any_barriers','qualified_visits_conducted','qualified_visits_conducted_comment','visit_capacity_utilization_percentage','visit_capacity_utilization_percentage_comment','other_reasons'))
                    if data:
                        book_data.append(data[0])
                    else:
                        data = {'site': site[0], 'providers_present':'','providers_present_comment':'','registered_dental_hygienist_present':'','registered_dental_hygienist_present_comment':'','total_providers_present':'','total_providers_present_comment':'','registered_dental_assistants_present':'','registered_dental_assistants_present_comment':'','receptionist_present':'','receptionist_present_comment':'','receptionist_provider_ratio':'','receptionist_provider_ratio_comment':'','dental_assistants_present':'','dental_assistants_present_comment':'','dental_hygienist_provider_ratio':'','dental_hygienist_provider_ratio_comment':'','dental_assistant_provider_ratio':'','dental_assistant_provider_ratio_comment':'','providers_call_outs':'','registered_dental_hygienist_call_outs':'','dental_assistant_call_outs':'','registered_dental_assistant_call_outs':'','receptionist_call_outs':'','total_appointment_scheduled_today':'','total_appointment_scheduled_today_comment':'','list_any_barriers':'','qualified_visits_conducted':'','qualified_visits_conducted_comment':'','visit_capacity_utilization_percentage':'','visit_capacity_utilization_percentage_comment':'','other_reasons':''}
                        book_data.append(data)
                for site in sites:
                    data = list(previous_data.filter(site=site[0]).order_by('-created_datetime').values('site','qualified_visits_conducted','qualified_visits_conducted_comment','visit_capacity_utilization_percentage','visit_capacity_utilization_percentage_comment','providers_call_outs','registered_dental_hygienist_call_outs','dental_assistant_call_outs','registered_dental_assistant_call_outs','receptionist_call_outs','total_appointment_scheduled_today','total_appointment_scheduled_today_comment','list_any_barriers'))
                    if data:
                        book_data_two.append(data[0])
                    else:
                        data = {'site': site[0], 'qualified_visits_conducted': '', 'qualified_visits_conducted_comment': '', 'visit_capacity_utilization_percentage': '', 'visit_capacity_utilization_percentage_comment': '','providers_call_outs':'','registered_dental_hygienist_call_outs':'','dental_assistant_call_outs':'','registered_dental_assistant_call_outs':'','receptionist_call_outs':'', 'total_appointment_scheduled_today': '', 'total_appointment_scheduled_today_comment': '', 'list_any_barriers': ''}
                        book_data_two.append(data)
            elif operations_type=="Medical":
                if site=='All':
                    first_data = StaffPlanning.objects.filter(record_date_time__range=(date_start, date_end))
                    previous_data = StaffPlanning.objects.filter(record_date_time__range=(previous_date_start, previous_date_end))
                    locations = list(Location.objects.filter(applocation__app__app_name__iexact='Staff planning medical').values('name').order_by('name'))
                    sites = [] 
                    for location in locations: 
                        sites.append((location['name'],location['name']))
                else:
                    first_data = StaffPlanning.objects.filter(record_date_time__range=(date_start, date_end),site=site)
                    previous_data = StaffPlanning.objects.filter(record_date_time__range=(previous_date_start, previous_date_end),site=site)
                    sites = [(site,site)]

                book_data = []
                book_data_two = []
                
                for site in sites:
                    data = list(first_data.filter(site=site[0]).order_by('-created_datetime').values('site','providers_present','providers_present_comment','walk_in_providers_present','walk_in_providers_present_comment','total_providers_present','total_providers_present_comment','total_specialty_providers_present','total_specialty_providers_present_comment','receptionist_present','receptionist_present_comment','receptionist_provider_ratio','receptionist_provider_ratio_comment','provider_specialty_app_walk_in_ma_present','provider_specialty_app_walk_in_ma_present_comment','ma_provider_ratio','ma_provider_ratio_comment','nurses_present','nurses_present_comment','nurses_provider_ratio','nurses_provider_ratio_comment','providers_call_outs','app_call_outs','specialty_providers_call_outs','ma_call_outs','bh_ma_call_outs','retinopathy_ma_call_outs','nurses_call_outs','receptionist_call_outs','total_appointment_scheduled_today','total_appointment_scheduled_today_comment','list_any_barriers','qualified_visits_conducted','qualified_visits_conducted_comment','visit_capacity_utilization_percentage','visit_capacity_utilization_percentage_comment','other_reasons'))
                    if data:
                        book_data.append(data[0])
                    else:
                        data = {'site': site[0], 'providers_present': '', 'providers_present_comment': '', 'walk_in_providers_present': '', 'walk_in_providers_present_comment': '', 'total_providers_present': '', 'total_providers_present_comment': '', 'total_specialty_providers_present': '', 'total_specialty_providers_present_comment': '', 'receptionist_present': '', 'receptionist_present_comment': '', 'receptionist_provider_ratio': '', 'receptionist_provider_ratio_comment': '', 'provider_specialty_app_walk_in_ma_present': '', 'provider_specialty_app_walk_in_ma_present_comment': '', 'ma_provider_ratio': '', 'ma_provider_ratio_comment': '', 'nurses_present': '', 'nurses_present_comment': '', 'nurses_provider_ratio': '', 'nurses_provider_ratio_comment': '', 'providers_call_outs': '', 'app_call_outs':'', 'specialty_providers_call_outs': '', 'ma_call_outs': '','bh_ma_call_outs':'','retinopathy_ma_call_outs':'', 'nurses_call_outs': '', 'receptionist_call_outs': '', 'total_appointment_scheduled_today': '', 'total_appointment_scheduled_today_comment': '', 'list_any_barriers': '','qualified_visits_conducted':'','qualified_visits_conducted_comment':'','visit_capacity_utilization_percentage':'','visit_capacity_utilization_percentage_comment':'','other_reasons':''}
                        book_data.append(data)
                for site in sites:
                    data = list(previous_data.filter(site=site[0]).order_by('-created_datetime').values('site','qualified_visits_conducted','qualified_visits_conducted_comment','visit_capacity_utilization_percentage','visit_capacity_utilization_percentage_comment','providers_call_outs','app_call_outs','specialty_providers_call_outs','ma_call_outs','bh_ma_call_outs','retinopathy_ma_call_outs','nurses_call_outs','receptionist_call_outs','total_appointment_scheduled_today','total_appointment_scheduled_today_comment','list_any_barriers'))
                    if data:
                        book_data_two.append(data[0])
                    else:
                        data = {'site': site[0], 'qualified_visits_conducted': '', 'qualified_visits_conducted_comment': '', 'visit_capacity_utilization_percentage': '', 'visit_capacity_utilization_percentage_comment': '', 'providers_call_outs': '', 'app_call_outs': '', 'specialty_providers_call_outs': '', 'ma_call_outs': '', 'bh_ma_call_outs': '', 'retinopathy_ma_call_outs': '', 'nurses_call_outs': '', 'receptionist_call_outs': '', 'total_appointment_scheduled_today': '', 'total_appointment_scheduled_today_comment': '', 'list_any_barriers': ''}
                        book_data_two.append(data)

            if(operations_type=="Optometry"):
                if site=='All':
                    first_data = StaffPlanningOptometry.objects.filter(record_date_time__range=(date_start, date_end))
                    previous_data = StaffPlanningOptometry.objects.filter(record_date_time__range=(previous_date_start, previous_date_end))
                    locations = list(Location.objects.filter(applocation__app__app_name__iexact='Staff planning optometry').values('name').order_by('name'))
                    sites = [] 
                    for location in locations: 
                        sites.append((location['name'],location['name']))
                else:
                    first_data = StaffPlanningOptometry.objects.filter(record_date_time__range=(date_start, date_end),site=site)
                    previous_data = StaffPlanningOptometry.objects.filter(record_date_time__range=(previous_date_start, previous_date_end),site=site)
                    site = [(site,site)]
                
                book_data = []
                book_data_two = []

                for site in sites:
                    data = list(first_data.filter(site=site[0]).order_by('-created_datetime').values('site','optometrist_present','optometrist_present_comment','optometry_ma_present','optometry_ma_present_comment','receptionist_present','receptionist_present_comment','optician','optician_comment','ma_optometrist_ratio','ma_optometrist_ratio_comment','receptionist_optometrist','receptionist_optometrist_comment','optician_optometrist_ratio','optician_optometrist_ratio_comment','optometrist_call_outs','optometry_ma_call_outs','optician_call_outs','receptionist_call_outs','total_appointment_scheduled_today','total_appointment_scheduled_today_comment','list_any_barriers','qualified_visits_conducted','qualified_visits_conducted_comment','visit_capacity_utilization_percentage','visit_capacity_utilization_percentage_comment','other_reasons'))
                    if data:
                        book_data.append(data[0])
                    else:
                        data = {'site': site[0], 'optometrist_present':'','optometrist_present_comment':'','optometry_ma_present':'','optometry_ma_present_comment':'','receptionist_present':'','receptionist_present_comment':'','optician':'','optician_comment':'','ma_optometrist_ratio':'','ma_optometrist_ratio_comment':'','receptionist_optometrist':'','receptionist_optometrist_comment':'','optician_optometrist_ratio':'','optician_optometrist_ratio_comment':'','optometrist_call_outs':'','optometry_ma_call_outs':'','optician_call_outs':'','receptionist_call_outs':'','total_appointment_scheduled_today':'','total_appointment_scheduled_today_comment':'','list_any_barriers':'','qualified_visits_conducted':'','qualified_visits_conducted_comment':'','visit_capacity_utilization_percentage':'','visit_capacity_utilization_percentage_comment':'','other_reasons':''}
                        book_data.append(data)
                for site in sites:
                    data = list(previous_data.filter(site=site[0]).order_by('-created_datetime').values('site','qualified_visits_conducted','qualified_visits_conducted_comment','visit_capacity_utilization_percentage','visit_capacity_utilization_percentage_comment','optometrist_call_outs','optometry_ma_call_outs','optician_call_outs','receptionist_call_outs','total_appointment_scheduled_today','total_appointment_scheduled_today_comment','list_any_barriers'))
                    if data:
                        book_data_two.append(data[0])
                    else:
                        data = {'site': site[0], 'qualified_visits_conducted': '', 'qualified_visits_conducted_comment': '', 'visit_capacity_utilization_percentage': '', 'visit_capacity_utilization_percentage_comment': '','optometrist_call_outs':'','optometry_ma_call_outs':'','optician_call_outs':'','receptionist_call_outs':'', 'total_appointment_scheduled_today': '', 'total_appointment_scheduled_today_comment': '', 'list_any_barriers': ''}
                        book_data_two.append(data)
            previous_date = datetime.strftime((datetime.strptime(previous_date, '%Y-%m-%d').date()), '%m-%d-%Y')
            start_date = datetime.strftime((datetime.strptime(start_date, '%Y-%m-%d').date()), '%m-%d-%Y')
            return JsonResponse({'status':1, 'data':book_data, 'previous_data':book_data_two, 'previous_date':previous_date, 'start_date':start_date})
        except Exception as e:
            return JsonResponse({'status':0, 'data':[], 'previous_data':[]})

class DashboardSiteDetails(LoginRequiredMixin, TemplateView):
    template_name = 'staffplanning/detail-dashboard/index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        site = self.kwargs['site']
        context['site'] = site
        context['operations_type'] = self.kwargs['operation']
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.staffReportingPortal:
            raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(name='Staff planning dashboard').exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

class DashboardSiteDetailsAPIFetch(LoginRequiredMixin, View):

    def post(self, request):
        try:
            site_name = self.request.POST.get("site_name",False)
            date_start = self.request.POST.get("date_start",False)
            date_end = self.request.POST.get("date_end",False)
            limit = self.request.POST.get("limit", False)
            page = self.request.POST.get("page", False)
            operations_type = self.request.POST.get("operations_type", False)

            timeset = getTimeZone(self.request)

            start_date = date_start + ' 00:00:00'
            end_date = date_end + ' 23:59:59'
            
            if operations_type=="Medical":
                
                first_data = StaffPlanning.objects.filter(record_date_time__range=(start_date,end_date),site=site_name)

                date_start = datetime.strptime(date_start, '%Y-%m-%d').date()
                date_end =  datetime.strptime(date_end, '%Y-%m-%d').date()

                book_data = []
                while(date_end>=date_start):
                    start = date_end.strftime('%Y-%m-%d') + ' 00:00:00'
                    end = date_end.strftime('%Y-%m-%d') + ' 23:59:59'
                    data = list(first_data.filter(record_date_time__range=(start,end)).order_by('-created_datetime').values('site','providers_present','providers_present_comment','walk_in_providers_present','walk_in_providers_present_comment','total_providers_present','total_providers_present_comment','total_specialty_providers_present','total_specialty_providers_present_comment','receptionist_present','receptionist_present_comment','receptionist_provider_ratio','receptionist_provider_ratio_comment','provider_specialty_app_walk_in_ma_present','provider_specialty_app_walk_in_ma_present_comment','ma_provider_ratio','ma_provider_ratio_comment','nurses_present','nurses_present_comment','nurses_provider_ratio','nurses_provider_ratio_comment','providers_call_outs','app_call_outs','specialty_providers_call_outs','ma_call_outs','bh_ma_call_outs','retinopathy_ma_call_outs','nurses_call_outs','receptionist_call_outs','total_appointment_scheduled_today','total_appointment_scheduled_today_comment','list_any_barriers','qualified_visits_conducted','qualified_visits_conducted_comment','visit_capacity_utilization_percentage','visit_capacity_utilization_percentage_comment','other_reasons','created_datetime','record_date_time'))
                    if data:
                        book_data.append(data[0])
                    date_end = date_end-timedelta(days=1)
                [book.update({
                    'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S'),
                    'record_date_time': book['record_date_time'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y'),
                }) for book in book_data]

            elif operations_type=="Dental":
                first_data = StaffPlanningDental.objects.filter(record_date_time__range=(start_date,end_date),site=site_name)

                date_start = datetime.strptime(date_start, '%Y-%m-%d').date()
                date_end =  datetime.strptime(date_end, '%Y-%m-%d').date()

                book_data = []
                
                while(date_end>=date_start):
                    start = date_end.strftime('%Y-%m-%d') + ' 00:00:00'
                    end = date_end.strftime('%Y-%m-%d') + ' 23:59:59'
                    data = list(first_data.filter(record_date_time__range=(start,end)).order_by('-created_datetime').values('site','providers_present','providers_present_comment','registered_dental_hygienist_present','registered_dental_hygienist_present_comment','total_providers_present','total_providers_present_comment','registered_dental_assistants_present','registered_dental_assistants_present_comment','receptionist_present','receptionist_present_comment','receptionist_provider_ratio','receptionist_provider_ratio_comment','dental_assistants_present','dental_assistants_present_comment','dental_hygienist_provider_ratio','dental_hygienist_provider_ratio_comment','dental_assistant_provider_ratio','dental_assistant_provider_ratio_comment','providers_call_outs','registered_dental_hygienist_call_outs','dental_assistant_call_outs','registered_dental_assistant_call_outs','receptionist_call_outs','total_appointment_scheduled_today','total_appointment_scheduled_today_comment','list_any_barriers','qualified_visits_conducted','qualified_visits_conducted_comment','visit_capacity_utilization_percentage','visit_capacity_utilization_percentage_comment','other_reasons','created_datetime','record_date_time'))
                    if data:
                        book_data.append(data[0])
                    date_end = date_end-timedelta(days=1)
                [book.update({
                    'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S'),
                    'record_date_time': book['record_date_time'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y'),
                }) for book in book_data]

            elif operations_type=="Optometry":
                
                first_data = StaffPlanningOptometry.objects.filter(record_date_time__range=(start_date,end_date),site=site_name)

                date_start = datetime.strptime(date_start, '%Y-%m-%d').date()
                date_end =  datetime.strptime(date_end, '%Y-%m-%d').date()

                book_data = []
                while(date_end>=date_start):
                    start = date_end.strftime('%Y-%m-%d') + ' 00:00:00'
                    end = date_end.strftime('%Y-%m-%d') + ' 23:59:59'
                    data = list(first_data.filter(record_date_time__range=(start,end)).order_by('-created_datetime').values('site','optometrist_present','optometrist_present_comment','optometry_ma_present','optometry_ma_present_comment','receptionist_present','receptionist_present_comment','optician','optician_comment','ma_optometrist_ratio','ma_optometrist_ratio_comment','receptionist_optometrist','receptionist_optometrist_comment','optician_optometrist_ratio','optician_optometrist_ratio_comment','optometrist_call_outs','optometry_ma_call_outs','optician_call_outs','receptionist_call_outs','total_appointment_scheduled_today','total_appointment_scheduled_today_comment','list_any_barriers','qualified_visits_conducted','qualified_visits_conducted_comment','visit_capacity_utilization_percentage','visit_capacity_utilization_percentage_comment','other_reasons','created_datetime','record_date_time'))
                    if data:
                        book_data.append(data[0])
                    date_end = date_end-timedelta(days=1)
                [book.update({
                    'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S'),
                    'record_date_time': book['record_date_time'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y'),
                }) for book in book_data]
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
            return JsonResponse({'status':1, 'data':book_data, 'pagination':details})
        except Exception as e:
            return JsonResponse({'status':0, 'data':[]})

class StaffPlanningDentalIndex(LoginRequiredMixin, CreateView):
    template_name = 'staffplanning/dental/index.html'
    model = StaffPlanningDental
    form_class = StaffPlanningDentalForm

    def get_context_data(self, **kwargs):
        context = super(StaffPlanningDentalIndex, self).get_context_data(**kwargs)
        user_location = list(Location.objects.filter(userassignedlocations__user=self.request.user,userassignedlocations__app__app_name__iexact='Staff planning dental').values('id','name').order_by('name'))
        tenant_locations = [] 
        for location in user_location: 
            tenant_locations.append((location['name'],location['name']))
        context["available_locations"] = json.dumps(tenant_locations)
        context['edit_button_show'] = 'd-none'
        if self.request.user.groups.filter(Q(name='Staff planning dental') and Q(name='Staff planning admin')).exists():
            context['edit_button_show'] = ''
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

    def form_valid(self, form):
        timeset = getTimeZone(self.request)
        form.instance.record_created_by = self.request.user.username
        status = super().form_valid(form)
        StaffPlanningobj = StaffPlanningDental.objects.get(id=self.object.id)
        if form.instance.save_for_tomorrow:
            tomorrow_datetime = StaffPlanningobj.created_datetime.replace(tzinfo=pytz.utc).astimezone(timeset)+timedelta(days=1)
            while(tomorrow_datetime.isoweekday() == 6 or tomorrow_datetime.isoweekday() == 7):
                tomorrow_datetime = tomorrow_datetime+timedelta(days=1)
        else:
            tomorrow_datetime = StaffPlanningobj.created_datetime
        StaffPlanningDental.objects.filter(id=self.object.id).update(record_date_time=tomorrow_datetime)
        # write_to_ms_sql_server.delay(self.object.id)
        AppAccessData.objects.create(user=self.request.user,app_name="Staff planning dental",app_specific_page_name=self.request.path,action="Staff planning dental form submitted")
        return status

    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.staffReportingPortal:
            raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(name='Staff planning dental').exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())


class StaffPlanningDentalAPIFetchPreviousSubmission(LoginRequiredMixin,View):
    def post(self,request):
        try:
            site = self.request.POST.get("site_name",False)
            day = self.request.POST.get("day",False)
            filtered_data = {}
            timeset = getTimeZone(self.request)
            data_date = datetime.now(timeset)
            end = data_date.strftime('%Y-%m-%d') + ' 23:59:59'
            start = data_date.strftime('%Y-%m-%d') + ' 00:00:00'
            filtered_data = StaffPlanningDental.objects.filter(record_date_time__lte=end,site=site).order_by('-created_datetime')[:1]
            all_submitted_users_per_day = list(StaffPlanningDental.objects.filter(record_date_time__range=(start,end),site=site).values('record_created_by','created_datetime').order_by('-created_datetime'))
            [items.update({
                    'created_datetime_time': items['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%I:%M:%S %p'),
                    'created_date': items['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y')})

            for items in all_submitted_users_per_day]
            filtered_data = list(filtered_data.values())
            [items.update({
                    'created_datetime_date': items['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y'),
                    'created_datetime_time': items['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%I:%M %p'),
                    'created_datetime_day_name': items['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%A'),
                    'created_datetime': items['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S')})
            for items in filtered_data]

            productivity_hyperlink = None
            data_date = datetime.now(timeset)-timedelta(days=1)
            if data_date.isoweekday() == 7:
                start = data_date.strftime('%Y-%m-%d') + ' 00:00:00'
                end = data_date.strftime('%Y-%m-%d') + ' 23:59:59'
                productivity_hyperlink = list(StaffPlanningDental.objects.filter(record_date_time__range=(start,end),site=site).values('id','record_date_time','productivity_status').order_by('-created_datetime'))[:1]
                if not productivity_hyperlink:
                        data_date = data_date-timedelta(days=1)
                        start = data_date.strftime('%Y-%m-%d') + ' 00:00:00'
                        end = data_date.strftime('%Y-%m-%d') + ' 23:59:59'
                        productivity_hyperlink = list(StaffPlanningDental.objects.filter(record_date_time__range=(start,end),site=site).values('id','record_date_time','productivity_status').order_by('-created_datetime'))[:1]
            elif data_date.isoweekday() == 6:
                start = data_date.strftime('%Y-%m-%d') + ' 00:00:00'
                end = data_date.strftime('%Y-%m-%d') + ' 23:59:59'
                productivity_hyperlink = list(StaffPlanningDental.objects.filter(record_date_time__range=(start,end),site=site).values('id','record_date_time','productivity_status').order_by('-created_datetime'))[:1]
            if not productivity_hyperlink:
                while(data_date.isoweekday() == 6 or data_date.isoweekday() == 7):
                    data_date = data_date-timedelta(days=1)
                start = data_date.strftime('%Y-%m-%d') + ' 00:00:00'
                end = data_date.strftime('%Y-%m-%d') + ' 23:59:59'
                productivity_hyperlink = list(StaffPlanningDental.objects.filter(record_date_time__range=(start,end),site=site).values('id','record_date_time','productivity_status').order_by('-created_datetime'))[:1]
            if productivity_hyperlink:
                if productivity_hyperlink[0]['productivity_status']==True:
                    productivity_hyperlink = []
                else:
                    [items.update({
                            'record_datetime_date': items['record_date_time'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y')})
                    for items in productivity_hyperlink]
            if day:
                day = datetime.strptime(day, '%m-%d-%Y').date().strftime('%Y-%m-%d')
                start = day + ' 00:00:00'
                end = day + ' 23:59:59'
            else:
                day = datetime.now(timeset).date().strftime('%Y-%m-%d')
                start = day + ' 00:00:00'
                end = day + ' 23:59:59'
            previous_data = list(StaffPlanningDental.objects.filter(record_date_time__range=(start,end),site=site).order_by('-created_datetime').values()[:1])

            previous_date_data= []
            min_date = list(StaffPlanningDental.objects.filter(site=site).values('record_date_time').order_by('record_date_time'))[:1]
            if min_date:
                min_date = min_date[0]['record_date_time']
                min_date = min_date.astimezone(timeset).date()
                date_iteration = datetime.now(timeset).date()-timedelta(days=1)
                previous_date_data = StaffPlanningDental.objects.none()
                while(len(previous_date_data)<2 and min_date<=date_iteration):
                    start = date_iteration.strftime('%Y-%m-%d') + ' 00:00:00'
                    end = date_iteration.strftime('%Y-%m-%d') + ' 23:59:59'
                    data = StaffPlanningDental.objects.filter(record_date_time__range=(start,end),site=site).order_by('-created_datetime')[:1]
                    previous_date_data |= data
                    date_iteration = datetime.strptime(start, '%Y-%m-%d %H:%M:%S').date()-timedelta(days=1)
                previous_date_data = list(previous_date_data.values('record_date_time'))
                previous_date_data.append({'record_date_time':datetime.now(pytz.utc)})
                [items.update({
                    'created_datetime_date': items['record_date_time'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y')})
                for items in previous_date_data]
                previous_date_data = sorted(previous_date_data, key=itemgetter('record_date_time'), reverse=True)
            return JsonResponse({'status':1,'data':filtered_data,'previous_data':previous_data,'previous_date_data':previous_date_data,'productivity_hyperlink':productivity_hyperlink,'all_submitted_users_per_day':all_submitted_users_per_day})
        except Exception as e:
            return JsonResponse({'status':0})

class StaffPlanningDentalProductivityUpdate(LoginRequiredMixin, UpdateView):
    template_name = 'staffplanning/dental/index-update.html'
    model = StaffPlanningDental
    form_class = StaffPlanningDentalUpdateForm

    def form_valid(self, form):
        form.instance.productivity_status = True
        status = super().form_valid(form)
        # write_to_ms_sql_server_update.delay(self.object.id)
        AppAccessData.objects.create(user=self.request.user,app_name="Staff planning dental",app_specific_page_name=self.request.path,action="Staff planning dental productivity updated")
        return status

    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.staffReportingPortal:
            raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(name='Staff planning dental').exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

    def get_context_data(self, **kwargs):
            context = super().get_context_data(**kwargs)
            logo, title, titlelogo = logoRendering(self.request)
            context['logo'] = logo
            context['title'] = title
            context['titlelogo'] = titlelogo
            return context

class StaffPlanningIndexUpdateView(LoginRequiredMixin, UpdateView):
    template_name = 'staffplanning/staffplanning_url/index-edit.html'
    model = StaffPlanning
    form_class = StaffPlanningForm

    def get_context_data(self, **kwargs):
        context = super(StaffPlanningIndexUpdateView, self).get_context_data(**kwargs)
        user_location = list(Location.objects.filter(userassignedlocations__user=self.request.user,userassignedlocations__app__app_name__iexact='Staff planning medical').values('id','name').order_by('name'))
        tenant_locations = [] 
        for location in user_location: 
            tenant_locations.append((location['name'],location['name']))
        context['available_locations'] = json.dumps(tenant_locations)
        location = StaffPlanning.objects.get(id=self.kwargs['pk'])
        context['record_date_time_utc'] = location.record_date_time
        no_of_appmnt = NumberofAppointment.objects.filter(site=location.site)
        context['number_of_appointments']=json.dumps({
                'no_of_provider_appointments':0,
                'no_of_app_appointments':0,
                'no_of_specialty_appointments_obgyn':0,
                'no_of_specialty_appointments_pediatric':0,
                'no_of_specialty_appointments_ecmp':0,
                'no_of_specialty_appointments_endo_cri':0,
                'no_of_specialty_appointments_infectious':0,
                'no_of_specialty_appointments_podiatry':0,
                'no_of_bh_providers_appointments':0,
                'no_of_telepsychiatry_providers_appointments':0,
                'no_of_walk_in_providers_appointments':0,
                'no_of_specialty_appointments_dsmes':0,
                'no_of_specialty_appointments_optometry':0,
        })
        if no_of_appmnt:
            context['number_of_appointments']=json.dumps({
                'no_of_provider_appointments':int(list(no_of_appmnt.values('no_of_provider_appointments'))[0]['no_of_provider_appointments']),
                'no_of_app_appointments':int(list(no_of_appmnt.values('no_of_app_appointments'))[0]['no_of_app_appointments']),
                'no_of_specialty_appointments_obgyn':int(list(no_of_appmnt.values('no_of_specialty_appointments_obgyn'))[0]['no_of_specialty_appointments_obgyn']),
                'no_of_specialty_appointments_pediatric':int(list(no_of_appmnt.values('no_of_specialty_appointments_pediatric'))[0]['no_of_specialty_appointments_pediatric']),
                'no_of_specialty_appointments_ecmp':int(list(no_of_appmnt.values('no_of_specialty_appointments_ecmp'))[0]['no_of_specialty_appointments_ecmp']),
                'no_of_specialty_appointments_endo_cri':int(list(no_of_appmnt.values('no_of_specialty_appointments_endo_cri'))[0]['no_of_specialty_appointments_endo_cri']),
                'no_of_specialty_appointments_infectious':int(list(no_of_appmnt.values('no_of_specialty_appointments_infectious'))[0]['no_of_specialty_appointments_infectious']),
                'no_of_specialty_appointments_podiatry':int(list(no_of_appmnt.values('no_of_specialty_appointments_podiatry'))[0]['no_of_specialty_appointments_podiatry']),
                'no_of_bh_providers_appointments':int(list(no_of_appmnt.values('no_of_bh_providers_appointments'))[0]['no_of_bh_providers_appointments']),
                'no_of_telepsychiatry_providers_appointments':int(list(no_of_appmnt.values('no_of_telepsychiatry_providers_appointments'))[0]['no_of_telepsychiatry_providers_appointments']),
                'no_of_walk_in_providers_appointments':int(list(no_of_appmnt.values('no_of_walk_in_providers_appointments'))[0]['no_of_walk_in_providers_appointments']),
                'no_of_specialty_appointments_dsmes':0,
                'no_of_specialty_appointments_optometry':0,
            })
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context
    
    def get_success_url(self, **kwargs):
         return reverse_lazy('staffplanning:staff_planning_medical_update_view',kwargs={'pk': self.kwargs['pk'],'submission':'success'})

    def form_valid(self, form):
        form.instance.record_edited_by = self.request.user.username
        status = super().form_valid(form)
        AppAccessData.objects.create(user=self.request.user,app_name="Staff planning medical",app_specific_page_name=self.request.path,action="Staff planning medical form updated")
        return status

    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.staffReportingPortal:
            raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(Q(name='Staff planning medical') and Q(name='Staff planning admin')).exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

class StaffPlanningDentalIndexUpdateView(LoginRequiredMixin, UpdateView):
    template_name = 'staffplanning/dental/index-edit.html'
    model = StaffPlanningDental
    form_class = StaffPlanningDentalForm

    def get_context_data(self, **kwargs):
        context = super(StaffPlanningDentalIndexUpdateView, self).get_context_data(**kwargs)
        user_location = list(Location.objects.filter(userassignedlocations__user=self.request.user,userassignedlocations__app__app_name__iexact='Staff planning dental').values('id','name').order_by('name'))
        tenant_locations = [] 
        for location in user_location: 
            tenant_locations.append((location['name'],location['name']))
        context['available_locations'] = json.dumps(tenant_locations)
        location = StaffPlanningDental.objects.get(id=self.kwargs['pk'])
        context['record_date_time_utc'] = location.record_date_time
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context
    
    def get_success_url(self, **kwargs):
         return reverse_lazy('staffplanning:staff_planning_dental_update_view',kwargs={'pk': self.kwargs['pk'],'submission':'success'})

    def form_valid(self, form):
        form.instance.record_edited_by = self.request.user.username
        status = super().form_valid(form)
        AppAccessData.objects.create(user=self.request.user,app_name="Staff planning dental",app_specific_page_name=self.request.path,action="Staff planning dental form updated")
        return status

    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.staffReportingPortal:
            raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(Q(name='Staff planning dental') and Q(name='Staff planning admin')).exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

class StaffPlanningMedicalCheckLatestEntry(LoginRequiredMixin,View):
    def post(self,request):
        try:
            site = self.request.POST.get("site_name",False)
            latest_entry_id = list(StaffPlanning.objects.filter(site=site).order_by('-created_datetime').values('id'))[:1]
            if latest_entry_id:
                latest_entry_id = latest_entry_id[0]['id']
            else:
                latest_entry_id = 0
            return JsonResponse({'status':1,'id':latest_entry_id})
        except Exception as e:
            return JsonResponse({'status':0})

class StaffPlanningDentalCheckLatestEntry(LoginRequiredMixin,View):
    def post(self,request):
        try:
            site = self.request.POST.get("site_name",False)
            latest_entry_id = list(StaffPlanningDental.objects.filter(site=site).order_by('-created_datetime').values('id'))[:1]
            if latest_entry_id:
                latest_entry_id = latest_entry_id[0]['id']
            else:
                latest_entry_id = 0
            return JsonResponse({'status':1,'id':latest_entry_id})
        except Exception as e:
            return JsonResponse({'status':0})

class StaffPlanningOptometryIndex(LoginRequiredMixin, CreateView):
    template_name = 'staffplanning/optometry/index.html'
    model = StaffPlanningOptometry
    form_class = StaffPlanningOptometryForm

    def get_context_data(self, **kwargs):
        context = super(StaffPlanningOptometryIndex, self).get_context_data(**kwargs)
        user_location = list(Location.objects.filter(userassignedlocations__user=self.request.user,userassignedlocations__app__app_name__iexact='Staff planning optometry').values('id','name').order_by('name'))
        tenant_locations = [] 
        for location in user_location: 
            tenant_locations.append((location['name'],location['name']))
        context['available_locations'] = json.dumps(tenant_locations)
        context['edit_button_show'] = 'd-none'
        if self.request.user.groups.filter(Q(name='Staff planning optometry') and Q(name='Staff planning admin')).exists():
            context['edit_button_show'] = ''
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

    def form_valid(self, form):
        timeset = getTimeZone(self.request)
        form.instance.record_created_by = self.request.user.username
        status = super().form_valid(form)
        StaffPlanningobj = StaffPlanningOptometry.objects.get(id=self.object.id)
        if form.instance.save_for_tomorrow:
            tomorrow_datetime = StaffPlanningobj.created_datetime.replace(tzinfo=pytz.utc).astimezone(timeset)+timedelta(days=1)
            while(tomorrow_datetime.isoweekday() == 6 or tomorrow_datetime.isoweekday() == 7):
                tomorrow_datetime = tomorrow_datetime+timedelta(days=1)
        else:
            tomorrow_datetime = StaffPlanningobj.created_datetime
        StaffPlanningOptometry.objects.filter(id=self.object.id).update(record_date_time=tomorrow_datetime)
        # write_to_ms_sql_server.delay(self.object.id)
        AppAccessData.objects.create(user=self.request.user,app_name="Staff planning optometry",app_specific_page_name=self.request.path,action="Staff planning optometry form submitted")
        return status

    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.staffReportingPortal:
            raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(name='Staff planning optometry').exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())


class StaffPlanningOptometryAPIFetchPreviousSubmission(LoginRequiredMixin,View):
    def post(self,request):
        try:
            site = self.request.POST.get("site_name",False)
            day = self.request.POST.get("day",False)
            filtered_data = {}
            timeset = getTimeZone(self.request)
            data_date = datetime.now(timeset)
            end = data_date.strftime('%Y-%m-%d') + ' 23:59:59'
            start = data_date.strftime('%Y-%m-%d') + ' 00:00:00'
            filtered_data = StaffPlanningOptometry.objects.filter(record_date_time__lte=end,site=site).order_by('-created_datetime')[:1]
            all_submitted_users_per_day = list(StaffPlanningOptometry.objects.filter(record_date_time__range=(start,end),site=site).values('record_created_by','created_datetime').order_by('-created_datetime'))
            [items.update({
                    'created_datetime_time': items['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%I:%M:%S %p'),
                    'created_date': items['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y')})

            for items in all_submitted_users_per_day]
            filtered_data = list(filtered_data.values())
            [items.update({
                    'created_datetime_date': items['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y'),
                    'created_datetime_time': items['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%I:%M %p'),
                    'created_datetime_day_name': items['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%A'),
                    'created_datetime': items['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S')})
            for items in filtered_data]

            productivity_hyperlink = None
            data_date = datetime.now(timeset)-timedelta(days=1)
            if data_date.isoweekday() == 7:
                start = data_date.strftime('%Y-%m-%d') + ' 00:00:00'
                end = data_date.strftime('%Y-%m-%d') + ' 23:59:59'
                productivity_hyperlink = list(StaffPlanningOptometry.objects.filter(record_date_time__range=(start,end),site=site).values('id','record_date_time','productivity_status').order_by('-created_datetime'))[:1]
                if not productivity_hyperlink:
                        data_date = data_date-timedelta(days=1)
                        start = data_date.strftime('%Y-%m-%d') + ' 00:00:00'
                        end = data_date.strftime('%Y-%m-%d') + ' 23:59:59'
                        productivity_hyperlink = list(StaffPlanningOptometry.objects.filter(record_date_time__range=(start,end),site=site).values('id','record_date_time','productivity_status').order_by('-created_datetime'))[:1]
            elif data_date.isoweekday() == 6:
                start = data_date.strftime('%Y-%m-%d') + ' 00:00:00'
                end = data_date.strftime('%Y-%m-%d') + ' 23:59:59'
                productivity_hyperlink = list(StaffPlanningOptometry.objects.filter(record_date_time__range=(start,end),site=site).values('id','record_date_time','productivity_status').order_by('-created_datetime'))[:1]
            if not productivity_hyperlink:
                while(data_date.isoweekday() == 6 or data_date.isoweekday() == 7):
                    data_date = data_date-timedelta(days=1)
                start = data_date.strftime('%Y-%m-%d') + ' 00:00:00'
                end = data_date.strftime('%Y-%m-%d') + ' 23:59:59'
                productivity_hyperlink = list(StaffPlanningOptometry.objects.filter(record_date_time__range=(start,end),site=site).values('id','record_date_time','productivity_status').order_by('-created_datetime'))[:1]
            if productivity_hyperlink:
                if productivity_hyperlink[0]['productivity_status']==True:
                    productivity_hyperlink = []
                else:
                    [items.update({
                            'record_datetime_date': items['record_date_time'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y')})
                    for items in productivity_hyperlink]
            if day:
                day = datetime.strptime(day, '%m-%d-%Y').date().strftime('%Y-%m-%d')
                start = day + ' 00:00:00'
                end = day + ' 23:59:59'
            else:
                day = datetime.now(timeset).date().strftime('%Y-%m-%d')
                start = day + ' 00:00:00'
                end = day + ' 23:59:59'
            previous_data = list(StaffPlanningOptometry.objects.filter(record_date_time__range=(start,end),site=site).order_by('-created_datetime').values()[:1])

            previous_date_data= []
            min_date = list(StaffPlanningOptometry.objects.filter(site=site).values('record_date_time').order_by('record_date_time'))[:1]
            if min_date:
                min_date = min_date[0]['record_date_time']
                min_date = min_date.astimezone(timeset).date()
                date_iteration = datetime.now(timeset).date()-timedelta(days=1)
                previous_date_data = StaffPlanningOptometry.objects.none()
                while(len(previous_date_data)<2 and min_date<=date_iteration):
                    start = date_iteration.strftime('%Y-%m-%d') + ' 00:00:00'
                    end = date_iteration.strftime('%Y-%m-%d') + ' 23:59:59'
                    data = StaffPlanningOptometry.objects.filter(record_date_time__range=(start,end),site=site).order_by('-created_datetime')[:1]
                    previous_date_data |= data
                    date_iteration = datetime.strptime(start, '%Y-%m-%d %H:%M:%S').date()-timedelta(days=1)
                previous_date_data = list(previous_date_data.values('record_date_time'))
                previous_date_data.append({'record_date_time':datetime.now(pytz.utc)})
                [items.update({
                    'created_datetime_date': items['record_date_time'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y')})
                for items in previous_date_data]
                previous_date_data = sorted(previous_date_data, key=itemgetter('record_date_time'), reverse=True)
            return JsonResponse({'status':1,'data':filtered_data,'previous_data':previous_data,'previous_date_data':previous_date_data,'productivity_hyperlink':productivity_hyperlink,'all_submitted_users_per_day':all_submitted_users_per_day})
        except Exception as e:
            return JsonResponse({'status':0})

class StaffPlanningOptometryProductivityUpdate(LoginRequiredMixin, UpdateView):
    template_name = 'staffplanning/optometry/index-update.html'
    model = StaffPlanningOptometry
    form_class = StaffPlanningOptometryUpdateForm

    def form_valid(self, form):
        form.instance.productivity_status = True
        status = super().form_valid(form)
        # write_to_ms_sql_server_update.delay(self.object.id)
        AppAccessData.objects.create(user=self.request.user,app_name="Staff planning optometry",app_specific_page_name=self.request.path,action="Staff planning optometry productivity updated")
        return status

    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.staffReportingPortal:
            raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(name='Staff planning optometry').exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

    def get_context_data(self, **kwargs):
            context = super().get_context_data(**kwargs)
            logo, title, titlelogo = logoRendering(self.request)
            context['logo'] = logo
            context['title'] = title
            context['titlelogo'] = titlelogo
            return context

class StaffPlanningOptometryCheckLatestEntry(LoginRequiredMixin,View):
    def post(self,request):
        try:
            site = self.request.POST.get("site_name",False)
            latest_entry_id = list(StaffPlanningOptometry.objects.filter(site=site).order_by('-created_datetime').values('id'))[:1]
            if latest_entry_id:
                latest_entry_id = latest_entry_id[0]['id']
            else:
                latest_entry_id = 0
            return JsonResponse({'status':1,'id':latest_entry_id})
        except Exception as e:
            return JsonResponse({'status':0})

class StaffPlanningOptometryIndexUpdateView(LoginRequiredMixin, UpdateView):
    template_name = 'staffplanning/optometry/index-edit.html'
    model = StaffPlanningOptometry
    form_class = StaffPlanningOptometryForm

    def get_context_data(self, **kwargs):
        context = super(StaffPlanningOptometryIndexUpdateView, self).get_context_data(**kwargs)
        user_location = list(Location.objects.filter(userassignedlocations__user=self.request.user,userassignedlocations__app__app_name__iexact='Staff planning optometry').values('id','name').order_by('name'))
        tenant_locations = [] 
        for location in user_location: 
            tenant_locations.append((location['name'],location['name']))
        context['available_locations'] = json.dumps(tenant_locations)
        location = StaffPlanningOptometry.objects.get(id=self.kwargs['pk'])
        context['record_date_time_utc'] = location.record_date_time
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context
    
    def get_success_url(self, **kwargs):
         return reverse_lazy('staffplanning:staff_planning_optometry_update_view',kwargs={'pk': self.kwargs['pk'],'submission':'success'})

    def form_valid(self, form):
        form.instance.record_edited_by = self.request.user.username
        status = super().form_valid(form)
        AppAccessData.objects.create(user=self.request.user,app_name="Staff planning optometry",app_specific_page_name=self.request.path,action="Staff planning optometry form updated")
        return status

    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.staffReportingPortal:
            raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(Q(name='Staff planning optometry') and Q(name='Staff planning admin')).exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())


