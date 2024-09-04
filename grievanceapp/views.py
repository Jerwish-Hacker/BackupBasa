from django.shortcuts import render
from grievanceapp.forms import GrievanceForm,IncidentReportForm,ComplianceForm
from grievanceapp.models import Compliance, Grievance, IncidentReport, MultipleCommentsIncidentReporting,is_captcha_required,MultipleComments,MultipleCommentsCompliance
from django.views.generic import (
    CreateView, DetailView, ListView,
    UpdateView, TemplateView, View
)
from django.urls import reverse
from django.shortcuts import render
from config.settings import TIME_ZONE as timzon
from datetime import datetime
import pytz
import json
from django.db.models import Q

from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect, JsonResponse, HttpResponse, HttpResponseForbidden,Http404
from django.shortcuts import redirect
from django.utils import timezone
import time
from django.contrib.auth.views import redirect_to_login
from tenant.models import Client
import config.constants as constants
from mainapp.models import Location, AppAccessData
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

class CaptchaData(object):

    def get_context_data(self, **kwargs):
        context = super(CaptchaData, self).get_context_data(**kwargs)
        user_location = list(Location.objects.filter(userassignedlocations__user=self.request.user,userassignedlocations__app__app_name__iexact='Grievance').values('id','name').order_by('name'))
        tenant_locations = [] 
        for location in user_location: 
            tenant_locations.append((location['name'],location['name']))
        context["available_locations"] = json.dumps(tenant_locations)
        if is_captcha_required():
            context["google_recaptcha_site_key"] = settings.GOOGLE_RECAPTCHA_SITE_KEY
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

class Grievanceformview(CaptchaData,LoginRequiredMixin, CreateView):
    template_name = 'grievanceapp/index.html'
    model = Grievance
    form_class = GrievanceForm

    def form_valid(self, form):
        form.instance.created_by = self.request.user.username
        AppAccessData.objects.create(user=self.request.user,app_name="Grievance",app_specific_page_name=self.request.path,action="Grievance form submitted")
        status = super().form_valid(form)
        return status
    
    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.grievance:
            raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(name='Grievance').exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

class GrievanceListView(LoginRequiredMixin, ListView):
    paginate_by = 30
    ordering = ['-pk', ]
    model = Grievance
    template_name = "grievanceapp/grievancelist.html"

    def get_context_data(self, **kwargs):
        context = super(GrievanceListView, self).get_context_data(**kwargs)
        locations = list(Location.objects.filter(applocation__app__app_name__iexact='Grievance').values('name').order_by('name'))
        tenant_locations = [] 
        for location in locations: 
            tenant_locations.append((location['name'],location['name']))
        if not tenant_locations:
            tenant_locations = [('','')]
        context["available_locations"] = json.dumps(tenant_locations)
        context["staff_access"] = 'grievance'
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context
    
    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.grievance:
             raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(name='Grievance dashboard').exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

class GrievanceDetailView(LoginRequiredMixin, DetailView):
    model = Grievance
    template_name = "grievanceapp/detail-grievance.html"

    def get_context_data(self, **kwargs):
        timeset = getTimeZone(self.request)
        context = super(GrievanceDetailView, self).get_context_data(**kwargs)
        book_data = list(MultipleComments.objects.filter(record_id=self.kwargs['pk']).values().order_by('-created_datetime'))
        [book.update({
                'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S'),
                'view_url': reverse('grievanceapp:grievance_detail', kwargs={'pk': book['id']}),
        }) for book in book_data]
        context["commentslist"] = book_data
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.grievance:
             raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(name='Grievance dashboard').exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

class GrievanceListAPIView(LoginRequiredMixin, View):
    ''' get all grievance details '''

    def post(self, request):
        try:
            site_name = self.request.POST.get("site_name", False)
            
            is_archive = self.request.POST.get("archived", '')
            date_start = self.request.POST.get("date_start", False)
            date_end = self.request.POST.get("date_end", False)
            searchKey = self.request.POST.get("searchKey", False)
            limit = self.request.POST.get("limit", False)
            page = self.request.POST.get("page", False)

            table_sort = self.request.POST.get("table_sort", {})
            table_sort = json.loads(table_sort)
            
            timeset = getTimeZone(self.request)

            date_start = date_start + ' 00:00:00'
            date_end = date_end + ' 23:59:59'
            first_data = Grievance.objects.filter(
                created_datetime__range=(date_start, date_end))
            if searchKey != '':
                first_data = first_data.filter(Q(id__icontains=searchKey) | Q(event_type__icontains=searchKey) | Q(health_plan__icontains=searchKey) | Q(created_by__icontains=searchKey) | Q(resolved_by__icontains=searchKey) | Q(site__icontains=searchKey) | Q(grievance_report_type__icontains=searchKey) | Q(service_type__icontains=searchKey) | Q(patient_first_name__icontains=searchKey) | Q(patient_last_name__icontains=searchKey) | Q(phone_number__icontains=searchKey) | Q(who_was_involoved__icontains=searchKey) | Q(provider_mentioned__icontains=searchKey))
            if site_name != 'all':
                first_data = first_data.filter(site=site_name)
            first_data_reference = first_data
            if is_archive != '':
                first_data = first_data.filter(is_resolved=is_archive)

            book_data = list(
                first_data.values().order_by('-created_datetime'))
            [book.update({
                'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S'),
                'view_url': reverse('grievanceapp:grievance_detail', kwargs={'pk': book['id']}),
            }) for book in book_data]
            if 'create_date' in table_sort:
                if(table_sort['create_date'] == "asc"):
                    book_data = list(
                        first_data.values().order_by('created_datetime'))
                    [book.update({
                        'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S'),
                        'view_url': reverse('grievanceapp:grievance_detail', kwargs={'pk': book['id']}),
                    }) for book in book_data]

            country_count = {
                'all': len(first_data_reference),
                'fresno': len(first_data_reference.filter(is_resolved=False)),
                'kern': len(first_data_reference.filter(is_resolved=True))
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

class GrievanceResolveUpdateAPIView(LoginRequiredMixin, View):
    def post(self, request, pk):
        try:
            resolvingcomment = self.request.POST.get("resolvingcomment", False)
            appointment = Grievance.objects.get(pk=pk)
            appointment.is_resolved = True
            appointment.resolved_by = request.user.username
            appointment.resolving_comments = resolvingcomment
            appointment.save()
            AppAccessData.objects.create(user=self.request.user,app_name="Grievance",app_specific_page_name=self.request.path,action="Grievance resolved")
            return JsonResponse({'status': '1'})
        except Exception as e:
            return JsonResponse({'status': e})

class GrievanceDeleteUpdateAPIView(LoginRequiredMixin,View):
     def post(self, request):
        try:
            id = self.request.POST.get("archive_id", False)
            comment_id = self.request.POST.get("comment_id")
            type = self.request.POST.get("type")
            if type=='grievancedelete':
                appointment = Grievance.objects.get(pk=id)
                appointment.delete()
                AppAccessData.objects.create(user=self.request.user,app_name="Grievance",app_specific_page_name=self.request.path,action="Grievance deleted")
            elif type=='commentdelete':
                comment = MultipleComments.objects.get(id=comment_id)
                comment.delete()
                AppAccessData.objects.create(user=self.request.user,app_name="Grievance",app_specific_page_name=self.request.path,action="Grievance comment deleted")
            return JsonResponse({'status': '1'})
        except Exception as e:
            return JsonResponse({'status': e})

class GrievanceAddExtraCommentUpdateAPIView(LoginRequiredMixin, View):
     def post(self, request):
        try:
            id = self.request.POST.get("archive_id", False)
            comment = self.request.POST.get("comment")
            if comment!='' or comment!=None:
                record = Grievance.objects.get(id=id)
                addingtocommenttable = MultipleComments()
                addingtocommenttable.record = record
                addingtocommenttable.multiple_comments = comment
                addingtocommenttable.staff=self.request.user.username
                addingtocommenttable.save()
                AppAccessData.objects.create(user=self.request.user,app_name="Grievance",app_specific_page_name=self.request.path,action="Grievance extra comment added")
                return JsonResponse({'status': '1'})
            else:
                return JsonResponse({'status': '0'})
        except Exception as e:
            return JsonResponse({'status': e})

class GrievanceReportUpdate(CaptchaData,LoginRequiredMixin, UpdateView):
    template_name = 'grievanceapp/index.html'
    model = Grievance
    form_class = GrievanceForm

    def form_valid(self, form):
        form.instance.created_by = self.request.user.username
        status = super().form_valid(form)
        AppAccessData.objects.create(user=self.request.user,app_name="Grievance",app_specific_page_name=self.request.path,action="Grievance report updated")
        return status

    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.grievance:
             raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(name='Grievance').exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

class SuccessPage(TemplateView):
    template_name = 'grievanceapp/success.html'

    def get_context_data(self, **kwargs):
            context = super().get_context_data(**kwargs)
            logo, title, titlelogo = logoRendering(self.request)
            context['logo'] = logo
            context['title'] = title
            context['titlelogo'] = titlelogo
            return context

class SuccessPageStandardofBehaviour(TemplateView):
    template_name = 'grievanceapp/success-standard-of-behaviour.html'

    def get_context_data(self, **kwargs):
            context = super().get_context_data(**kwargs)
            logo, title, titlelogo = logoRendering(self.request)
            context['logo'] = logo
            context['title'] = title
            context['titlelogo'] = titlelogo
            return context

class SuccessPageComplaint(TemplateView):
    template_name = 'grievanceapp/success-complaint.html'

    def get_context_data(self, **kwargs):
            context = super().get_context_data(**kwargs)
            logo, title, titlelogo = logoRendering(self.request)
            context['logo'] = logo
            context['title'] = title
            context['titlelogo'] = titlelogo
            return context

class CaptchaDataIncidentReport(object):

    def get_context_data(self, **kwargs):
        context = super(CaptchaDataIncidentReport, self).get_context_data(**kwargs)
        user_location = list(Location.objects.filter(userassignedlocations__user=self.request.user,userassignedlocations__app__app_name__iexact='Standards of behavior').values('id','name').order_by('name'))
        tenant_locations = [] 
        for location in user_location: 
            tenant_locations.append((location['name'],location['name']))
        context["available_locations"] = json.dumps(tenant_locations)
        if is_captcha_required():
            context["google_recaptcha_site_key"] = settings.GOOGLE_RECAPTCHA_SITE_KEY
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

class IncidentReportFormView(CaptchaDataIncidentReport,LoginRequiredMixin, CreateView):
    template_name = 'grievanceapp/incident-report-index.html'
    model = IncidentReport
    form_class = IncidentReportForm

    def form_valid(self, form):
        form.instance.created_by = self.request.user.username
        status = super().form_valid(form)
        AppAccessData.objects.create(user=self.request.user,app_name="Standards of behavior",app_specific_page_name=self.request.path,action="Standards of behavior report added")
        # incident_report_to_mssql.delay(self.object.id,'create')
        return status

    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.sob:
            raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(name='Standards of behavior').exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

class IncidentReportDashboard(LoginRequiredMixin,ListView):
    paginate_by = 30
    ordering = ['-pk', ]
    model = IncidentReport
    template_name = "grievanceapp/incident-report-dashboard.html"

    def get_context_data(self, **kwargs):
        context = super(IncidentReportDashboard, self).get_context_data(**kwargs)
        locations = list(Location.objects.filter(applocation__app__app_name__iexact='Standards of behavior').values('name').order_by('name'))
        tenant_locations = [] 
        for location in locations: 
            tenant_locations.append((location['name'],location['name']))
        if not tenant_locations:
            tenant_locations = [('','')]
        context["available_locations"] = json.dumps(tenant_locations)
        context["staff_access"] = 'standardsofbehavior'
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.sob:
            raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(name='Standards of behavior dashboard').exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

class IncidentReportListAPIView(LoginRequiredMixin,View):
    ''' get all grievance details '''

    def post(self, request):
        try:
            site_name = self.request.POST.get("site_name", False)
            is_archive = self.request.POST.get("archived", '')
            date_start = self.request.POST.get("date_start", False)
            date_end = self.request.POST.get("date_end", False)
            searchKey = self.request.POST.get("searchKey", False)
            limit = self.request.POST.get("limit", False)
            page = self.request.POST.get("page", False)

            table_sort = self.request.POST.get("table_sort", {})
            table_sort = json.loads(table_sort)

            timeset = getTimeZone(self.request)

            date_start = date_start + ' 00:00:00'
            date_end = date_end + ' 23:59:59'
            first_data = IncidentReport.objects.filter(
                created_datetime__range=(date_start, date_end))
            if site_name != 'all':
                first_data = first_data.filter(location_site=site_name)
            if searchKey != '':
                first_data = first_data.filter(Q(first_name__icontains=searchKey) | Q(last_name__icontains=searchKey) | Q(resolved_by__icontains=searchKey) | Q(service_line__icontains=searchKey) | Q(severity__icontains=searchKey) | Q(location_site__icontains=searchKey) | Q(mrn__icontains=searchKey) | Q(phone_number__icontains=searchKey) | Q(level_of_intervention__icontains=searchKey))
            first_data_reference = first_data
            if is_archive != '':
                first_data = first_data.filter(is_resolved=is_archive)

            book_data = list(
                first_data.values().order_by('-created_datetime'))
            [book.update({
                'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S'),
                'view_url': reverse('grievanceapp:incident_report_detail', kwargs={'pk': book['id']}),
            }) for book in book_data]
            if 'create_date' in table_sort:
                if(table_sort['create_date'] == "asc"):
                    book_data = list(
                        first_data.values().order_by('created_datetime'))
                    [book.update({
                        'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S'),
                        'view_url': reverse('grievanceapp:incident_report_detail', kwargs={'pk': book['id']}),
                    }) for book in book_data]

            country_count = {
                'all': len(first_data_reference),
                'fresno': len(first_data_reference.filter(is_resolved=False)),
                'kern': len(first_data_reference.filter(is_resolved=True))
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

class IncidentReportDetailView(LoginRequiredMixin,DetailView):
    model = IncidentReport
    template_name = "grievanceapp/detail-incidentreport.html"

    def get_context_data(self, **kwargs):
        timeset = getTimeZone(self.request)
        context = super(IncidentReportDetailView, self).get_context_data(**kwargs)
        book_data = list(MultipleCommentsIncidentReporting.objects.filter(record_id=self.kwargs['pk']).values().order_by('-created_datetime'))
        [book.update({
                'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S')
        }) for book in book_data]
        context["commentslist"] = book_data
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

class IncidentReportResolveUpdateAPIView(LoginRequiredMixin,View):
    def post(self, request, pk):
        try:
            resolvingcomment = self.request.POST.get("resolvingcomment", False)
            appointment = IncidentReport.objects.get(pk=pk)
            appointment.is_resolved = True
            appointment.resolved_by = request.user.username
            appointment.resolving_comments = resolvingcomment
            appointment.save()
            AppAccessData.objects.create(user=self.request.user,app_name="Standards of behavior",app_specific_page_name=self.request.path,action="Standards of behavior report resolved")
            return JsonResponse({'status': '1'})
        except Exception as e:
            return JsonResponse({'status': e})

class IncidentReportDeleteUpdateAPIView(LoginRequiredMixin,View):
     def post(self, request):
        try:
            id = self.request.POST.get("archive_id", False)
            comment_id = self.request.POST.get("comment_id")
            type = self.request.POST.get("type")
            if type=='incidentreportdelete':
                appointment = IncidentReport.objects.get(pk=id)
                appointment.delete()
                AppAccessData.objects.create(user=self.request.user,app_name="Standards of behavior",app_specific_page_name=self.request.path,action="Standards of behavior report deleted")
            elif type=='commentdelete':
                comment = MultipleCommentsIncidentReporting.objects.get(id=comment_id)
                comment.delete()
                AppAccessData.objects.create(user=self.request.user,app_name="Standards of behavior",app_specific_page_name=self.request.path,action="Standards of behavior report comment deleted")
            return JsonResponse({'status': '1'})
        except Exception as e:
            return JsonResponse({'status': e})

class IncidentReportAddExtraCommentUpdateAPIView(LoginRequiredMixin,View):
     def post(self, request):
        try:
            id = self.request.POST.get("archive_id", False)
            comment = self.request.POST.get("comment")
            if comment!='' or comment!=None:
                record = IncidentReport.objects.get(id=id)
                addingtocommenttable = MultipleCommentsIncidentReporting()
                addingtocommenttable.record = record
                addingtocommenttable.multiple_comments = comment
                addingtocommenttable.staff=self.request.user.username
                addingtocommenttable.save()
                AppAccessData.objects.create(user=self.request.user,app_name="Standards of behavior",app_specific_page_name=self.request.path,action="Standards of behavior report add extra comment")
                return JsonResponse({'status': '1'})
            else:
                return JsonResponse({'status': '0'})
        except Exception as e:
            return JsonResponse({'status': e})

class IncidentReportUpdate(CaptchaDataIncidentReport,LoginRequiredMixin, UpdateView):
    template_name = 'grievanceapp/incident-report-index.html'
    model = IncidentReport
    form_class = IncidentReportForm

    def form_valid(self, form):
        form.instance.created_by = self.request.user.username
        status = super().form_valid(form)
        AppAccessData.objects.create(user=self.request.user,app_name="Standards of behavior",app_specific_page_name=self.request.path,action="Standards of behavior report updated")
        # incident_report_to_mssql.delay(self.object.id,'update')
        return status
    
    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.sob:
            raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(name='Standards of behavior').exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

class ComplaintCaptchaData(object):

    def get_context_data(self, **kwargs):
        context = super(ComplaintCaptchaData, self).get_context_data(**kwargs)
        user_location = list(Location.objects.filter(userassignedlocations__user=self.request.user,userassignedlocations__app__app_name__iexact='Complaint').values('id','name').order_by('name'))
        tenant_locations = [] 
        for location in user_location: 
            tenant_locations.append((location['name'],location['name']))
        context["available_locations"] = json.dumps(tenant_locations)
        if is_captcha_required():
            context["google_recaptcha_site_key"] = settings.GOOGLE_RECAPTCHA_SITE_KEY
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

class Complaintformview(LoginRequiredMixin, ComplaintCaptchaData, CreateView):
    template_name = 'grievanceapp/complaint-index.html'
    model = Compliance
    form_class = ComplianceForm

    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.complaint:
            raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(name='Complaint').exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

    def form_valid(self, form):
        form.instance.created_by = self.request.user.username
        status = super().form_valid(form)
        AppAccessData.objects.create(user=self.request.user,app_name="Complaint",app_specific_page_name=self.request.path,action="Complaint added")
        return status

class ComplaintListView(LoginRequiredMixin,ListView):
    paginate_by = 30
    ordering = ['-pk', ]
    model = Compliance
    template_name = "grievanceapp/complaintlist.html"

    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.complaint:
            raise Http404
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(name='Complaint dashboard').exists():
                return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

    def get_context_data(self, **kwargs):
        context = super(ComplaintListView, self).get_context_data(**kwargs)
        locations = list(Location.objects.filter(applocation__app__app_name__iexact='Complaint').values('name').order_by('name'))
        tenant_locations = [] 
        for location in locations: 
            tenant_locations.append((location['name'],location['name']))
        if not tenant_locations:
            tenant_locations = [('','')]
        context["available_locations"] = json.dumps(tenant_locations)
        context["staff_access"] = 'complaint'
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

class ComplaintDetailView(LoginRequiredMixin,DetailView):
    model = Compliance
    template_name = "grievanceapp/detail-complaint.html"

    def get_context_data(self, **kwargs):
        timeset = getTimeZone(self.request)
        context = super(ComplaintDetailView, self).get_context_data(**kwargs)
        book_data = list(MultipleCommentsCompliance.objects.filter(record_id=self.kwargs['pk']).values().order_by('-created_datetime'))
        [book.update({
                'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S'),
                'view_url': reverse('grievanceapp:complaint_detail', kwargs={'pk': book['id']}),
        }) for book in book_data]
        context["commentslist"] = book_data
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context


class ComplaintListAPIView(LoginRequiredMixin,View):

    def post(self, request):
        try:
            site_name = self.request.POST.get("site_name", False)
            
            is_archive = self.request.POST.get("archived", '')
            date_start = self.request.POST.get("date_start", False)
            date_end = self.request.POST.get("date_end", False)
            searchKey = self.request.POST.get("searchKey", False)
            limit = self.request.POST.get("limit", False)
            page = self.request.POST.get("page", False)

            table_sort = self.request.POST.get("table_sort", {})
            table_sort = json.loads(table_sort)

            timeset = getTimeZone(self.request)

            date_start = date_start + ' 00:00:00'
            date_end = date_end + ' 23:59:59'
            first_data = Compliance.objects.filter(
                created_datetime__range=(date_start, date_end))
            if searchKey != '':
                first_data = first_data.filter(Q(id__icontains=searchKey) | Q(event_type__icontains=searchKey) | Q(resolved_by__icontains=searchKey) | Q(site__icontains=searchKey) | Q(report_type__icontains=searchKey) | Q(service_type__icontains=searchKey))
            if site_name != 'all':
                first_data = first_data.filter(site=site_name)
            first_data_reference = first_data
            if is_archive != '':
                first_data = first_data.filter(is_resolved=is_archive)

            book_data = list(
                first_data.values().order_by('-created_datetime'))
            [book.update({
                'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S'),
                'view_url': reverse('grievanceapp:complaint_detail', kwargs={'pk': book['id']}),
            }) for book in book_data]
            if 'create_date' in table_sort:
                if(table_sort['create_date'] == "asc"):
                    book_data = list(
                        first_data.values().order_by('created_datetime'))
                    [book.update({
                        'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S'),
                        'view_url': reverse('grievanceapp:complaint_detail', kwargs={'pk': book['id']}),
                    }) for book in book_data]

            country_count = {
                'all': len(first_data_reference),
                'fresno': len(first_data_reference.filter(is_resolved=False)),
                'kern': len(first_data_reference.filter(is_resolved=True))
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

class ComplaintResolveUpdateAPIView(LoginRequiredMixin,View):
    def post(self, request, pk):
        try:
            resolvingcomment = self.request.POST.get("resolvingcomment", False)
            appointment = Compliance.objects.get(pk=pk)
            appointment.is_resolved = True
            appointment.resolved_by = request.user.username
            appointment.resolving_comments = resolvingcomment
            appointment.save()
            AppAccessData.objects.create(user=self.request.user,app_name="Complaint",app_specific_page_name=self.request.path,action="Complaint resolved")
            return JsonResponse({'status': '1'})
        except Exception as e:
            return JsonResponse({'status': e})

class ComplaintDeleteUpdateAPIView(LoginRequiredMixin,View):
     def post(self, request):
        try:
            id = self.request.POST.get("archive_id", False)
            comment_id = self.request.POST.get("comment_id")
            type = self.request.POST.get("type")
            if type=='complaintdelete':
                appointment = Compliance.objects.get(pk=id)
                appointment.delete()
                AppAccessData.objects.create(user=self.request.user,app_name="Complaint",app_specific_page_name=self.request.path,action="Complaint deleted")
            elif type=='commentdelete':
                comment = MultipleCommentsCompliance.objects.get(id=comment_id)
                comment.delete()
                AppAccessData.objects.create(user=self.request.user,app_name="Complaint",app_specific_page_name=self.request.path,action="Complaint comment deleted")
            return JsonResponse({'status': '1'})
        except Exception as e:
            return JsonResponse({'status': e})

class ComplaintAddExtraCommentUpdateAPIView(LoginRequiredMixin,View):
     def post(self, request):
        try:
            id = self.request.POST.get("archive_id", False)
            comment = self.request.POST.get("comment")
            if comment!='' or comment!=None:
                record = Compliance.objects.get(id=id)
                addingtocommenttable = MultipleCommentsCompliance()
                addingtocommenttable.record = record
                addingtocommenttable.multiple_comments = comment
                addingtocommenttable.staff=self.request.user.username
                addingtocommenttable.save()
                AppAccessData.objects.create(user=self.request.user,app_name="Complaint",app_specific_page_name=self.request.path,action="Complaint extra comment added")
                return JsonResponse({'status': '1'})
            else:
                return JsonResponse({'status': '0'})
        except Exception as e:
            return JsonResponse({'status': e})

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


