from bookingforms.constants import get_cities_in_region
from bookingforms.forms import AppointmentForm,KHSAppointmentForm, UploadUrlModelForm
from bookingforms.models import Appointment, County, AppointmentLock,HealthPlanPatient, HealthPlanPatientCallDetails, KHSPatientDetails, is_captcha_required,User,HealthPlanAppointmentTiming,HealthPlanAppointmentLocation,KHSAppointment,KHSAppointmentLock,UploadUrlModel,KHSPatientCallDetails
from django.views.generic import (
    CreateView, DetailView, ListView,
    UpdateView, TemplateView, View
)
from django.urls import reverse
from django.shortcuts import render,get_object_or_404
from django.utils import translation
from django.db.models import Q
from config.settings import TIME_ZONE as timzon
from datetime import datetime, timedelta
import pytz
import json
from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin, AccessMixin
from django.http import HttpResponseRedirect, JsonResponse, HttpResponse, HttpResponseForbidden, Http404
from django.utils.translation import gettext as _
# from bookingforms.tasks import write_to_ms_sql_server,archive_update,healthplanOutreach,healthplanappointmentupdate,khsOutreach,khsappointment,khsoutreachupdate,khsappointmentupdate,healthnetCDC,healthnetCCS,khsoutreach_vaccination_status_upate
from django.shortcuts import redirect
from django.utils import timezone
import time
from django.contrib.auth import authenticate, login
from django.contrib import messages
import random
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth.views import redirect_to_login
from django.db.models import OuterRef, Subquery
import pyodbc
from django.contrib.auth.models import User, Group
from mainapp.models import AppAccessData,AppLocation,Location, QualityServices
from tenant.models import Client
import config.constants as constants
from outreach.models import OutreachAppointmentTiming
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

class CheckingwhetherStaffUser(AccessMixin):
        def dispatch(self, request, *args, **kwargs):
            if not subscriptionCheck(request) >= constants.onlinePatientAppointments:
                raise Http404
            if request.user.is_anonymous:
                return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())
            elif not request.user.is_staff:
                return redirect('/permissiondenied/')
            return super(CheckingwhetherStaffUser, self).dispatch(request, *args, **kwargs)
        
        def get_context_data(self, **kwargs):
            context = super().get_context_data(**kwargs)
            logo, title, titlelogo = logoRendering(self.request)
            context['logo'] = logo
            context['title'] = title
            context['titlelogo'] = titlelogo
            return context

def index1(request):
    return render(request, 'appointment/success.html')


class CaptchaData(object):

    def get_context_data(self, **kwargs):
        context = super(CaptchaData, self).get_context_data(**kwargs)
        # context["vaccinate_location"] = json.dumps(AppointmentForm.Meta.vaccinate_location)
        # context["testing_location"] = json.dumps(AppointmentForm.Meta.testing_location)
        context["preferred_day_of_week"] = json.dumps([
                    ('Monday', _('Monday')),
                    ('Tuesday', _('Tuesday')),
                    ('Wednesday', _('Wednesday')),
                    ('Thursday', _('Thursday')),
                    ('Friday', _('Friday')),
                    ('Soonest Available', _('Soonest Available'))])
        context["preferred_time_frame"] = json.dumps([
                    ('Early Morning', _('Early Morning')),
                    ('Late Morning', _('Late Morning')),
                    ('Early Afternoon', _('Early Afternoon')),
                    ('Late Afternoon', _('Late Afternoon')),
                    ('Soonest Available', _('Soonest Available'))])
        context['is_khs_url'] = False
        if is_captcha_required():
            context["google_recaptcha_site_key"] = settings.GOOGLE_RECAPTCHA_SITE_KEY
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context


class AppointmentView(CaptchaData, CreateView):
    # template_name = 'devtemplates/update-appointment.html'
    template_name = 'appointment/index.html'
    model = Appointment
    form_class = AppointmentForm

    def get_form(self, *args, **kwargs):
        form= super().get_form(*args, **kwargs)
        # form.fields['appointment_type'].choices = [('',_('Select Appointment Type')),('COVID-19 Vaccine', _('COVID-19 Vaccine')),('COVID-19 Vaccine Third Dose', _('COVID-19 Vaccine Third Dose')),('COVID-19 Vaccine Booster', _('COVID-19 Vaccine Booster'))]
        form.fields['vaccine_eligibility_status'].required = False
        form.fields['job_role'].required = False
        form.fields['preferred_date'].required = False
        form.fields['preferred_day_of_week'].required = False
        form.fields['is_previously_vaccinated'].required = False
        return form

    def form_valid(self, form):
        status = super().form_valid(form)
        appointment = Appointment.objects.get(id=self.object.id)
        try:
            user= self.request.user
        except:
            user = None
        AppAccessData.objects.create(user=user,app_name="Vaccine appointment",app_specific_page_name=self.request.path,action="Appointment Created")
        # write_to_ms_sql_server.delay(self.object.id)
        print(str(getattr(appointment,'preferred_date')))
        if str(getattr(appointment,'preferred_date')) != '1111-11-11':
            return HttpResponseRedirect(reverse('bookingforms:success_page_time_slot_booking',kwargs={'appointmentid':self.object.id,'url':None}))
        else:
            return status

    # For debugging, uncomment this
    # def form_invalid(self, form, *args, **kwargs):
    #     status = super(AppointmentView, self).form_invalid(form, *args, **kwargs)
    #     print(form.errors)
    #     return JsonResponse({'status': "e"})
    #     import pdb; pdb.set_trace()
    #     return response

    def get(self, request, language=None, *args, **kwargs):
        if not language:
            language = settings.LANGUAGE_CODE
        if(language):
            translation.activate(language)
        response = super(AppointmentView,self).post(request, *args, **kwargs)
        # response.delete_cookie(settings.LANGUAGE_COOKIE_NAME)
        return response

    def dispatch(self, request, *args, **kwargs):
       if not subscriptionCheck(request) >= constants.onlinePatientAppointments:
                raise Http404
       return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
            context = super().get_context_data(**kwargs)
            logo, title, titlelogo = logoRendering(self.request)
            context['logo'] = logo
            context['title'] = title
            context['titlelogo'] = titlelogo
            return context

class AppointmentViewLock(View):
    def post(self, request, appointment_fk):
        try:
            appointment = Appointment.objects.get(id=appointment_fk)
            status = self.request.POST.get('status')
            if status=='viewing':
                if not AppointmentLock.objects.filter(appointment_fk=appointment_fk).exists():
                    appointment_lock = AppointmentLock.objects.create(user_fk=self.request.user,appointment_fk=appointment)
                    viewing_by=''
                else:
                    appointment_lock = AppointmentLock.objects.filter(appointment_fk=appointment_fk).last()
                    viewing_by = appointment_lock.user_fk
            else:
                AppointmentLock.objects.filter(appointment_fk=appointment_fk).filter(user_fk=self.request.user).delete()
                viewing_by = ''
            return HttpResponse({viewing_by})
        except Exception as e:
            return JsonResponse({'status': e})

class AppointmentViewLockFetchId(View):
    def get(self, request):
        locked_appointment =[]
        for i in AppointmentLock.objects.all():
            locked_appointment.append({'id':i.appointment_fk.id})
        return JsonResponse({'locked_appointment':locked_appointment})

class Slotcheck(View):
    def get(self, request,appointment, location, date):
        try:
            date = date.split("-")
            date = date[0]+"-"+date[2]+"-"+date[1]
            timeset = getTimeZone(self.request)
            timepacific = timezone.now().replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%I:%M %p')
            datepacific = datetime.strptime(timezone.now().replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d'), '%Y-%m-%d').date()
            daterecieved = datetime.strptime(date,'%Y-%m-%d').date()
            preferred_time = [['','Select a Time']]
            timelist = list(OutreachAppointmentTiming.objects.filter(outreach=appointment,location__name=location,date=daterecieved).values('time','maximum_booking_per_slot'))
            preferred_time_frame = []
            for i in timelist:
                preferred_time_frame.append([i['time'],i['maximum_booking_per_slot']])
            if daterecieved<=datepacific:
                for slot in preferred_time_frame:
                    if time.strptime(timepacific, '%I:%M %p')<time.strptime(slot[0], '%I:%M %p'):
                        if Appointment.objects.filter(county=location).filter(preferred_date=date).filter(preferred_time_frame=slot[0]).count()<slot[1]:
                            preferred_time.append([slot[0],slot[0]])
                        else:
                            preferred_time.append(['',slot[0]+_(' (Slot Full)')])
            else:
                for slot in preferred_time_frame:
                    if Appointment.objects.filter(county=location).filter(preferred_date=date).filter(preferred_time_frame=slot[0]).count()<slot[1]:
                        preferred_time.append([slot[0],slot[0]])
                    else:
                        preferred_time.append(['',slot[0]+_(' (Slot Full)')])
            return JsonResponse({'status':1,'preferred_time':preferred_time})
        except Exception as e:
            return JsonResponse({'status':0})
class SlotRendering(View):
    def get(self, request,appointment, location, date):
        date = date.split("-")
        date = date[0]+"-"+date[2]+"-"+date[1]
        timeset = getTimeZone(self.request)
        datelist = []
        items = list(OutreachAppointmentTiming.objects.filter(outreach=appointment,location__name=location,date__gte=timezone.now().replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d')).values('date').distinct())
        for dates in items:
            datelist.append(dates['date'])
        timepacific = timezone.now().replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%I:%M %p')
        datepacific = datetime.strptime(timezone.now().replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d'), '%Y-%m-%d').date()
        daterecieved = datetime.strptime(date,'%Y-%m-%d').date()
        return JsonResponse({'preferred_time':datelist})

class AppointmentDetailView(LoginRequiredMixin, DetailView):
    model = Appointment
    template_name = "appointment/detail-appointment.html"

    def dispatch(self, request, *args, **kwargs):
       if not subscriptionCheck(request) >= constants.onlinePatientAppointments:
            raise Http404
       return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

class AppointmentListView(CheckingwhetherStaffUser,LoginRequiredMixin, ListView):
    paginate_by = 30
    ordering = ['-pk', ]
    model = Appointment
    template_name = "appointment/appointment-list.html"

    def get_context_data(self, **kwargs):
        context = super(AppointmentListView, self).get_context_data(**kwargs)
        appData = Appointment.objects.all()
        context["all"] = len(appData) if appData else 0
        context["time1"] = settings.AUTO_LOGOUT_IDLETIME
        context["time2"] = settings.AUTO_LOGOUT_POPUPTIMEOUT
        items = list(AppLocation.objects.filter(app__app_name='Vaccine management').values('location__name'))
        locationlist = [('all','All')]
        for location in items:
            locationlist.append((location['location__name'],location['location__name']))
        context['location'] = locationlist
        appointment_types = list(QualityServices.objects.filter(quality__iexact='Appointment', field_name='Appointment Type').values('field_value'))
        tenant_appointment_type = [('all','All')] 
        for appointment_type in appointment_types: 
            tenant_appointment_type.append((appointment_type['field_value'],appointment_type['field_value']))
        context['location_list'] = locationlist
        context['vaccine_type'] = tenant_appointment_type
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context
    
    def dispatch(self, request,*args, **kwargs):
       if not subscriptionCheck(request) >= constants.onlinePatientAppointments:
            raise Http404
       if self.request.user.is_authenticated:
           if not self.request.user.groups.filter(name='Vaccine appointment dashboard').exists():
               return redirect('/permissiondenied/')
           return super().dispatch(request, *args, **kwargs)
       return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())


class TestingAppointmentListView(AppointmentListView):
    template_name = "appointment/testing-appointment-list.html"

    def dispatch(self, request,*args, **kwargs):
       if not subscriptionCheck(request) >= constants.onlinePatientAppointments:
            raise Http404
       return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
                context = super().get_context_data(**kwargs)
                logo, title, titlelogo = logoRendering(self.request)
                context['logo'] = logo
                context['title'] = title
                context['titlelogo'] = titlelogo
                return context

class AppointmentUpdateView(CaptchaData, LoginRequiredMixin, UpdateView):
    model = Appointment
    # template_name = "devtemplates/edit-appointment.html"
    template_name = 'appointment/index.html'
    form_class = AppointmentForm

    def dispatch(self, request,*args, **kwargs):
       if not subscriptionCheck(request) >= constants.onlinePatientAppointments:
            raise Http404
       return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

class SuccessPage(TemplateView):
    template_name = 'appointment/success.html'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

class SuccessPageTimeSlotBooking(View):
    template_name = 'appointment/success_timeslotbooking.html'

    def get(self, request, appointmentid=None,url=None):
        if url=='khs':
            appointment = KHSAppointment.objects.get(id=appointmentid)
        else:
            appointment = Appointment.objects.get(id=appointmentid)
        context = {'appointmentid':appointmentid}
        if getattr(appointment,'county') =='Kern – Frazier Mountain Community Health Center':
            context['locationaddress'] = ' 704 Lebec Road Lebec, CA 93243'
            context['locationphonenumber'] = '(661)-248-5250'
        elif getattr(appointment,'county') == 'Kern – Lamont Community Health Center':
            context['locationaddress'] = ' 8787 Hall Road Lamont, CA 93241'
            context['locationphonenumber'] = '(661)-845-3731'
        elif getattr(appointment,'county') == 'Kern – East Bakersfield Community Health Center':
            context['locationaddress'] = ' 815 Dr. Martin Luther King Jr. Boulevard Bakersfield, CA 93307'
            context['locationphonenumber'] = '(661)-322-3905'
        elif getattr(appointment,'county') == 'Kern – Kern River Community Health Center':
            context['locationaddress'] = ' 67 Evans Road Wofford Heights, CA 93285'
            context['locationphonenumber'] = '(760)-376-2276'
        elif getattr(appointment,'county') == 'Kern – Greenfield Community Health Center':
            context['locationaddress'] = ' 9001 South H St. Bakersfield, CA 93307'
            context['locationphonenumber'] = '(661)-328-4260'
        elif getattr(appointment,'county') == 'Fresno – ELM CHC':
            context['locationaddress'] = ' 2740 S. Elm Avenue Fresno, CA 93706'
            context['locationphonenumber'] = '(559)-457-5200'
        elif getattr(appointment,'county') == 'Fresno - North Fine':
            context['locationaddress'] = ' 1945 N. Fine Avenue, Suite 100 Fresno, CA 93727'
            context['locationphonenumber'] = '(559)-457-5650'
        elif getattr(appointment,'county') == 'Fresno - Addams Elementary Health and Wellness Center':
            context['locationaddress'] = ' 1501 N. Lafayette Ave Fresno, CA 93728'
            context['locationphonenumber'] = '559-457-6860'
        elif getattr(appointment,'county') == 'Fresno - Gaston Middle School Health and Wellness Center':
            context['locationaddress'] = ' 1120 East Church Avenue Fresno, CA 93706'
            context['locationphonenumber'] = '559-457-6970'
        elif getattr(appointment,'county') == 'Fresno - Orange & Buttler CHC':
            context['locationaddress'] = ' 1350 S. Orange Avenue Fresno, CA 93702'
            context['locationphonenumber'] = '559-457-5400'
        elif getattr(appointment,'county') == 'Fresno - Regional Medical CHC':
            context['locationaddress'] = ' 2505 E. Divisadero Street Fresno, CA 93721'
            context['locationphonenumber'] = '559-457-5500'
        elif getattr(appointment,'county') == 'Fresno - West Fresno CHC':
            context['locationaddress'] = ' 302 Fresno Street, Suite 101 Fresno, CA 93706'
            context['locationphonenumber'] = '559-457-5700'
        elif getattr(appointment,'county') == 'Fresno - West Shaw CHC':
            context['locationaddress'] = ' 3645 West Shaw Avenue, #101 Fresno, CA 93711'
            context['locationphonenumber'] = '559-457-6800'
        context['appointment'] = appointment
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return render(request, self.template_name, context)


class CountyListView(LoginRequiredMixin, ListView):
    model = County
    paginate_by = 30
    ordering = ['-pk', ]
    template_name = "appointment/county/county_list.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

class CountyCreateView(CaptchaData, CreateView):
    template_name = 'appointment/county/county_add.html'
    model = County
    fields = '__all__'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

class CountyUpdateView(LoginRequiredMixin, UpdateView):
    template_name = 'appointment/county/county_add.html'
    model = County
    fields = '__all__'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

class AppointmentArchiveUpdateAPIView(View):
    def post(self, request, pk):
        try:
            appointment = Appointment.objects.get(pk=pk)
            appointment.is_archived = True
            appointment.save()
            # archive_update.delay(pk)
            return JsonResponse({'status': '1'})
        except Exception as e:
            return JsonResponse({'status': e})


class AppointmentListAPIView(View):
    ''' get all appointment details '''

    def post(self, request):
        try:
            appointment_type = self.request.POST.get('appointment_type',False)
            country_name = self.request.POST.get("country_name", False)
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
            first_data = Appointment.objects.filter(
                created_datetime__range=(date_start, date_end))
            if appointment_type == 'all':
                pass
            else:
                 first_data = first_data.filter(Q(appointment_type=appointment_type))

            if searchKey != '':
                first_data = first_data.filter(
                    contact_number__icontains=searchKey)
            if country_name != 'all':
                first_data = first_data.filter(county=country_name)

            first_data_reference = first_data
            if is_archive != '':
                first_data = first_data.filter(is_archived=is_archive)

            book_data = list(
                first_data.values().order_by('-created_datetime'))
            [book.update({
                'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S'),
                'view_url': reverse('bookingforms:appointment_detail', kwargs={'pk': book['id']}),
            }) for book in book_data]
            if 'create_date' in table_sort:
                if(table_sort['create_date'] == "asc"):
                    book_data = list(
                        first_data.values().order_by('created_datetime'))
                    [book.update({
                        'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S'),
                        'view_url': reverse('bookingforms:appointment_detail', kwargs={'pk': book['id']}),
                    }) for book in book_data]

            country_count = {
                'all': len(first_data_reference),
                'fresno': len(first_data_reference.filter(is_archived=False)),
                'kern': len(first_data_reference.filter(is_archived=True))
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


def get_cities_in_state(request):
    data = {}
    state_code = request.GET.get('state_code')
    cites_list = get_cities_in_region(state_code)
    data['states'] = cites_list.append(['Other', 'Other'])
    return JsonResponse(data)

class CaptchaUploadUrlModel(object):

    def get_context_data(self, **kwargs):
        context = super(CaptchaUploadUrlModel, self).get_context_data(**kwargs)
        if is_captcha_required():
            context["google_recaptcha_site_key"] = settings.GOOGLE_RECAPTCHA_SITE_KEY
        context["english_url"] = reverse('bookingforms:upload_create')
        context["spanish_url"] = reverse('bookingforms:upload_create',kwargs={'language':'es'})
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

class UploadUrlModelCreate(CaptchaUploadUrlModel, CreateView):
    template_name = 'appointment/uploads_url/index.html'
    model = UploadUrlModel
    form_class =UploadUrlModelForm

    def get(self, request, language=None, *args, **kwargs):
       if not language:
           language = settings.LANGUAGE_CODE
       if(language):
           translation.activate(language)
       response = super(UploadUrlModelCreate,self).post(request, *args, **kwargs)
       # response.delete_cookie(settings.LANGUAGE_COOKIE_NAME)
       return response

    def dispatch(self, request,*args, **kwargs):
       if not subscriptionCheck(request) >= constants.patientDocUpload:
            raise Http404
       return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

class UploadUrlModelSuccessPage(TemplateView):
    template_name = 'appointment/uploads_url/success.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

class UploadUrlModelAppointmentListView(CheckingwhetherStaffUser,LoginRequiredMixin, ListView):
    paginate_by = 30
    ordering = ['-pk', ]
    model = UploadUrlModel
    template_name = 'appointment/uploads_url/appointment-list.html'

    def get_context_data(self, **kwargs):
        context = super(UploadUrlModelAppointmentListView, self).get_context_data(**kwargs)
        context["time1"] = settings.AUTO_LOGOUT_IDLETIME
        context["time2"] = settings.AUTO_LOGOUT_POPUPTIMEOUT
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context
    
    def dispatch(self, request,*args, **kwargs):
       if not subscriptionCheck(request) >= constants.patientDocUpload:
            raise Http404
       if self.request.user.is_authenticated:
           if not self.request.user.groups.filter(name='Secure upload').exists():
               return redirect('/permissiondenied/')
           return super().dispatch(request, *args, **kwargs)
       return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())


class UploadUrlModelAppointmentListAPIView(View):
    ''' get all appointment details '''

    def post(self, request):
        try:
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
            first_data = UploadUrlModel.objects.filter(
                created_datetime__range=(date_start, date_end))
            if searchKey != '':
                first_data = first_data.filter(
                    phone_number__icontains=searchKey)
            first_data_reference = first_data
            if is_archive != '':
                first_data = first_data.filter(is_resolved=is_archive)

            book_data = list(
                first_data.values().order_by('-created_datetime'))
            [book.update({
                'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S'),
                'view_url': reverse('bookingforms:upload_url_model_appointment_detail', kwargs={'pk': book['id']}),
            }) for book in book_data]
            if 'create_date' in table_sort:
                if(table_sort['create_date'] == "asc"):
                    book_data = list(
                        first_data.values().order_by('created_datetime'))
                    [book.update({
                        'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S'),
                        'view_url': reverse('bookingforms:upload_url_model_appointment_detail', kwargs={'pk': book['id']}),
                    }) for book in book_data]

            country_count = {
                'all': len(first_data_reference),
                'active': len(first_data_reference.filter(is_resolved=False)),
                'archived': len(first_data_reference.filter(is_resolved=True))
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

class UploadUrlModelAppointmentArchiveUpdateAPIView(View):
    def post(self, request, pk):
        try:
            appointment = UploadUrlModel.objects.get(pk=pk)
            appointment.is_resolved = True
            appointment.resolved_by = self.request.user.username
            appointment.save()
            return JsonResponse({'status': '1'})
        except Exception as e:
            return JsonResponse({'status': e})

class UploadUrlModelAppointmentDetailView(LoginRequiredMixin, DetailView):
    model = UploadUrlModel
    template_name = "appointment/uploads_url/upload-detail-appointment.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context


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

def UnautherisedUserAccess(request, error_message, status):
    return redirect('/permissiondenied/')

class ServiceDenied(TemplateView):
    template_name = 'servicedenied.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

class AppointmentScheduler(LoginRequiredMixin, TemplateView):
    template_name = "appointment/scheduler/index.html"

    # def dispatch(self, request,*args, **kwargs):
    #    if not subscriptionCheck(request) >= constants.healthplanOutreachIntegration:
    #         raise Http404
    #    if self.request.user.is_authenticated:
    #        if not self.request.user.groups.filter(name='Healthplan Scheduler').exists():
    #            return redirect('/permissiondenied/')
    #        return super().dispatch(request, *args, **kwargs)
    #    return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        items = list(AppLocation.objects.filter(app__app_name='Vaccine management').values('location__name'))
        locationlist = []
        for location in items:
            locationlist.append(location['location__name'])
        context['location'] = locationlist
        appointment_types = list(QualityServices.objects.filter(quality__iexact='Appointment', field_name='Appointment Type').values('field_value'))
        tenant_appointment_type = [] 
        for appointment_type in appointment_types: 
            tenant_appointment_type.append(appointment_type['field_value'])
        context['appointment'] = tenant_appointment_type
        return context

class AppointmentSchedulerListAPI(LoginRequiredMixin, View):
     def post(self, request):
        try:
            submission_type = self.request.POST.getlist('type')[0]
            start_date =  datetime.strptime(self.request.POST.getlist('start_date')[0], "%m/%d/%Y").date()
            location = self.request.POST.getlist('location')[0]
            appointment = self.request.POST.getlist('appointment')[0]
            outreach = self.request.POST.get("outreach",False)
            if submission_type=='recurring':
                end_date = datetime.strptime(self.request.POST.getlist('end_date')[0], "%m/%d/%Y").date()
                elements = list(self.request.POST.items())
                position = 0
                for index,value in enumerate(elements):
                    if value[0]=='time1':
                        position =index
                        break
                is_monday_of = self.request.POST.getlist('monday',False)
                is_tuesday_of = self.request.POST.getlist('tuesday',False)
                is_wednesday_of = self.request.POST.getlist('wednesday',False)
                is_thursday_of = self.request.POST.getlist('thursday',False)
                is_friday_of = self.request.POST.getlist('friday',False)
                is_saturday_of = self.request.POST.getlist('saturday',False)
                is_sunday_of = self.request.POST.getlist('sunday',False)
                offdays = []
                if is_monday_of:
                    offdays.append('Monday')
                if is_tuesday_of:
                    offdays.append('Tuesday')
                if is_wednesday_of:
                    offdays.append('Wednesday')
                if is_thursday_of:
                    offdays.append('Thursday')
                if is_friday_of:
                    offdays.append('Friday')
                if is_saturday_of:
                    offdays.append('Saturday')
                if is_sunday_of:
                    offdays.append('Sunday')
                items = list(self.request.POST.items())[position:]
                while(start_date<=end_date):
                    if not start_date.strftime("%A") in offdays:
                        if OutreachAppointmentTiming.objects.filter(outreach=appointment,date=start_date,location__name=location).exists():
                               messages.error(request,'All/Some of the selected date slot already exists.')
                               return redirect('appointment:appointment_scheduler')
                        for i in range(0,len(items),3):
                            createtimeslot = OutreachAppointmentTiming()
                            createtimeslot.outreach = appointment
                            createtimeslot.location = Location.objects.get(name=location)
                            createtimeslot.date = start_date
                            createtimeslot.time = items[i][1]+" "+items[i+1][1]
                            createtimeslot.maximum_booking_per_slot = items[i+2][1]
                            createtimeslot.slot_created_by = self.request.user.username
                            createtimeslot.save()
                    start_date = start_date + timedelta(days=1)
                createtimeslot.save()
            elif submission_type=='custom':
                if OutreachAppointmentTiming.objects.filter(outreach=appointment,date=start_date,location__name=location).exists():
                    messages.error(request,'Selected date slot already exists.')
                    return redirect('appointment:appointment_scheduler')
                elements = list(self.request.POST.items())
                position = 0
                for index,value in enumerate(elements):
                    if value[0]=='time1':
                        position =index
                        break
                items = list(self.request.POST.items())[position:]
                for i in range(0,len(items),3):
                    createtimeslot = OutreachAppointmentTiming()
                    createtimeslot.outreach = appointment
                    createtimeslot.location = Location.objects.get(name=location)
                    createtimeslot.date = start_date
                    createtimeslot.time = items[i][1]+" "+items[i+1][1]
                    createtimeslot.maximum_booking_per_slot = items[i+2][1]
                    createtimeslot.slot_created_by = self.request.user.username
                    createtimeslot.save()
            AppAccessData.objects.create(user=self.request.user,app_name="Appointment",app_specific_page_name=self.request.path,action="Outreach appointment slot allotted")
            return redirect('appointment:appointment_scheduler')
        except Exception as e:
            messages.error(request,'Something Happened.Try again.')
            return redirect('appointment:appointment_scheduler')

class AppointmentSchedulerAdminListAPIView(LoginRequiredMixin,View):
    def post(self, request):
        try:
            location = self.request.POST.get("location", False)
            date_start = self.request.POST.get("date_start", False)
            date_end = self.request.POST.get("date_end", False)
            appointment = self.request.POST.get("appointment", False)
            start = datetime.strptime(date_start, "%Y-%m-%d").date()
            end = datetime.strptime(date_end, "%Y-%m-%d").date()
            timeslot = {}
            while(start<=end):
                data = list(OutreachAppointmentTiming.objects.filter(outreach=appointment,date=start,location__name=location).values())
                if data:
                    timeslot[start.strftime('%Y-%m-%d')]=[]
                    for items in data:
                        timeslot[start.strftime('%Y-%m-%d')].append({'id':items['id'],'time':items['time'],'maximum_booking_per_slot':items['maximum_booking_per_slot']})
                start = start + timedelta(days=1)
            return JsonResponse({'status':1,'data':timeslot})
        except Exception as e:
            return JsonResponse({'status':0})

class AppointmentFetchAvailableDates( View):
     def get(self, request, appointment, location):
        try:
            datelist = []
            timeset = getTimeZone(self.request)
            items = list(OutreachAppointmentTiming.objects.filter(outreach=appointment,location__name=location,date__gte=timezone.now().replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d')).values('date').distinct())
            for date in items:
                datelist.append(date['date'])
            return JsonResponse({'status':1,'date':datelist})
        except Exception as e:
            return JsonResponse({'status':0})

class SlotAvailableCheck(View):
    def get(self, request, time,appointment, location, date ):
        date = date.split("-")
        date = date[0]+"-"+date[2]+"-"+date[1]
        checking_slot_full = list(OutreachAppointmentTiming.objects.filter(outreach=appointment,location__name=location,date=date,time=time).values('maximum_booking_per_slot'))[0]['maximum_booking_per_slot']
        if Appointment.objects.filter(county=location).filter(preferred_date=date).filter(preferred_time_frame=time).count()< checking_slot_full:
            status = 'SlotNotFull'
        else:
            status = 'SlotIsFull'
        return HttpResponse({status})