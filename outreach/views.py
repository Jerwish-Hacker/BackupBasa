from django.shortcuts import render
from outreach.models import OutreachPatientCallDetails,OutreachList,OutreachPatient,OutreachAppointmentTiming,OTPTable
from tenant.models import MemberPatient
from django.views.generic import (
    CreateView, DetailView, ListView,
    UpdateView, TemplateView, View
)
from django.shortcuts import render
from django.db.models import Q
from config.settings import TIME_ZONE as timzon
from datetime import datetime, timedelta
import pytz
from django.contrib.auth.mixins import LoginRequiredMixin, AccessMixin
from django.http import JsonResponse, Http404
from django.utils.translation import gettext as _
from django.db.models import OuterRef, Subquery
from django.shortcuts import redirect
from django.contrib.auth.views import redirect_to_login
from django.utils import timezone
import time
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
import random
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
import string, random
from tenant.models import Client
import config.constants as constants
import pandas as pd
import copy
from bookingforms.tasks import write_to_celery
from mainapp.models import AppAccessData,AppLocation,Location
import io
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
            
class ServiceDenied(TemplateView):
    template_name = 'servicedenied.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

class  OutreachLogin(View):
    def post(self, request):
        username = request.POST.get("login",False)
        password = request.POST.get("password",False)
        otp = request.POST.get("otp",False)
        if otp:
            otp_expiry_check = OTPTable.objects.filter(user__username=username,otp=otp,created_datetime__range=(timezone.now() - timedelta(seconds=600), timezone.now())).exists()
            if otp_expiry_check:
                user = User.objects.get(username=username)
                login(request,user,backend='django.contrib.auth.backends.ModelBackend')
                Otptable = OTPTable.objects.get(user=User.objects.get(username=username),otp=otp)
                Otptable.session = request.session.session_key
                Otptable.save()
                AppAccessData.objects.create(user=self.request.user,app_name="Outreach",app_specific_page_name=self.request.path,action="Signed in successfully with OTP")
                return redirect('outreach:outreach_portal',self.request.GET['next'].split('/')[2])
            user = User.objects.get(username=username)
            emailsplit = user.email.split('@')
            emailfirst = emailsplit[0]
            email =''
            for i in range(len(emailfirst)-1):
                email = email + 'x'
            email = emailfirst[0]+email+'@'+emailsplit[1]
            domain = str(request.get_host()).split('.')[0]
            logo=''
            titlelogo=''
            title=''
            try:
                titlelogo = Client.objects.get(name='public').title_logo.url
                logo = Client.objects.get(name='public').logo.url
                if not Client.objects.get(name=domain).logo == "":
                    logo = Client.objects.get(name=domain).logo.url
                title = Client.objects.get(name=domain).name
                if not Client.objects.get(name=domain).title_logo == "":
                    titlelogo = Client.objects.get(name=domain).title_logo.url
            except:
                pass
            data={'email':email,'user':username,'logo':logo,'titlelogo':titlelogo,'title':title,'outreach':self.request.GET['next']}
            messages.error(request,'The OTP is expired or Incorrect.')
            return render(request,"outreach/outreach/account/loginotp.html",data)
        else:
            user = authenticate(request, username=username, password=password)
            if user is not None:
                try:
                    emailsplit = user.email.split('@')
                    emailfirst = emailsplit[0]
                    email =''
                    for i in range(len(emailfirst)-1):
                        email = email + 'x'
                    email = emailfirst[0]+email+'@'+emailsplit[1]
                    domain = str(request.get_host()).split('.')[0]
                    logo=''
                    titlelogo=''
                    title=''
                    try:
                        titlelogo = Client.objects.get(name='public').title_logo.url
                        logo = Client.objects.get(name='public').logo.url
                        if not Client.objects.get(name=domain).logo == "":
                            logo = Client.objects.get(name=domain).logo.url
                        title = Client.objects.get(name=domain).name
                        if not Client.objects.get(name=domain).title_logo == "":
                            titlelogo = Client.objects.get(name=domain).title_logo.url
                    except:
                        pass
                    data={'email':email,'user':username,'logo':logo,'titlelogo':titlelogo,'title':title,'outreach':self.request.GET['next']}
                    otpgenerated = random.randint(10000000,99999999)
                    print(otpgenerated)
                    # subject, from_email, to = 'OTP Verification',settings.EMAIL_HOST_USER,user.email
                    # text_content = 'This is an important message.'
                    # html_content = '<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0"><div style="border-bottom:1px solid #eee"><a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Basa Systems</a></div><p style="font-size:1.1em">Hi, '+user.username+'</p><p>To Authenticate, please use the following One Time Password (OTP)</p><h2 style="background:#00466a ;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">'+str(otpgenerated)+'</h2><p style="font-size:0.9em;">Dont share this OTP with anyone</p><p style="font-size:0.9em;">Regards,<br />Basa Systems</p><hr style="border:none;border-top:1px solid #eee" /><div style="float:left;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300"></div></div></div>'
                    # msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
                    # msg.attach_alternative(html_content, "text/html")
                    # msg.send()
                    OTPTable.objects.create(user=User.objects.get(username=username),otp=otpgenerated)
                    return render(request,"outreach/outreach/account/loginotp.html",data)
                except Exception as e:
                    messages.error(request,'No email ID is associated with this account')
                    return redirect_to_login(self.request.GET['next'],"/outreach/v1/login/", 'next')
            else:
                messages.error(request,'The username and/or password you specified are not correct.')
                return redirect_to_login(self.request.GET['next'],"/outreach/v1/login/", 'next')

    def get(self, request):
        return redirect('outreach:outreach_login')

class OutreachLoginPage(TemplateView):
    template_name = "outreach/outreach/account/login.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        try:
            context['outreach'] = self.request.GET['next']
        except:
            raise Http404
        return context

class OutreachPortal(LoginRequiredMixin, TemplateView):
    template_name = 'outreach/outreach/index.html'
    login_url = "/outreach/v1/login/"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        context['outreach'] = kwargs['outreach']
        return context

    def dispatch(self, request,*args, **kwargs):
        if not subscriptionCheck(request) >= constants.outreach or not OutreachList.objects.filter(name__iexact=kwargs['outreach']).exists():
            raise Http404
        if not OutreachList.objects.filter(name__iexact=kwargs['outreach']).filter(is_published=True).exists():
            return redirect('/permissiondenied/')
        if self.request.user.is_authenticated:
            if not self.request.user.groups.filter(name__iexact=kwargs['outreach']).exists():
               return redirect('/permissiondenied/')
            return super().dispatch(request, *args, **kwargs)
        return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())


class OutreachListAPI(LoginRequiredMixin, View):
    def post(self, request):
        try:
            date_start = self.request.POST.get("date_start", False)
            date_end = self.request.POST.get("date_end", False)
            searchKey = self.request.POST.get("searchKey", False)
            limit = self.request.POST.get("limit", False)
            page = self.request.POST.get("page", False)
            outreach = self.request.POST.get("outreach",False)
            patient_active_filter = self.request.POST.get("patientActive",False)
            date_start = date_start + ' 00:00:00'
            date_end = date_end + ' 23:59:59'
            count =[]
            if outreach:
                outreachData = list(OutreachList.objects.filter(name__iexact=outreach).values())
                columns = list(OutreachList.objects.filter(name__iexact=outreach).values_list('columns'))
                patient_data = OutreachPatient.objects.annotate(
                                latest_outreach_status=Subquery(OutreachPatientCallDetails.objects.filter(patient_id=OuterRef('pk')
                                ).order_by('-created_datetime').values('out_reach_status')[:1])).filter(outreach__name=outreach).values('id','latest_outreach_status','is_active', 'member' ).order_by('-is_active','first_name')
                count.append(len(patient_data))
                count.append(len(patient_data.filter(is_active=True).all()))
                count.append(len(patient_data.filter(is_active=False).all()))
                if searchKey != '':
                    patient_data = patient_data.filter(
                        member__identifier__icontains=searchKey)
                # patient_data = patient_data.filter(
                #         created_datetime__range=(date_start,date_end))
                if patient_active_filter != '':
                    patient_active_filter = True if patient_active_filter == 'True' else False
                    patient_data = patient_data.filter(
                        is_active=patient_active_filter)
                
                patient_data = list(patient_data)
                if limit and page:
                    offset = (int(page) - 1) * int(limit)
                    end_offset = offset + int(limit)
                    no_item = len(patient_data)
                    total_page = no_item / int(limit)
                    if no_item % int(limit) != 0:
                        total_page += 1
                    patient_data = patient_data[offset:end_offset]
                    if len(patient_data) == 0:
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
                
                for i in patient_data:
                    id = i['id']
                    memberData = MemberPatient.objects.filter(id=i['member']).values()
                    i["column"] = memberData[0]
                    if OutreachPatientCallDetails.objects.filter(patient_id=id):
                        Employeelist = OutreachPatientCallDetails.objects.filter(patient_id=id).values().order_by('-created_datetime')[0]
                        i['out_reach_status'] = Employeelist['out_reach_status']
                        i['created_datetime'] = Employeelist['created_datetime']
                        i['call_details_table_id'] = Employeelist['id']
                        i['is_appointment_scheduled_patient_reminded'] = Employeelist['is_appointment_scheduled_patient_reminded']
                        i['is_cancelation_requested_by_csv'] = Employeelist['is_cancelation_requested_by_csv']
                    else:
                        i['out_reach_status'] = None
            return JsonResponse({'status':1,'outreachData':outreachData,'data':patient_data, 'pagination': details,'count':count})
        except Exception as e:
            return JsonResponse({'status':0})

class OutreachPortalDashboard(LoginRequiredMixin, ListView):
    paginate_by = 30
    ordering = ['-pk', ]
    model = OutreachPatientCallDetails
    template_name = "outreach/outreach/outreach-admin-dashboard.html"

    def dispatch(self, request,*args, **kwargs):
       if not subscriptionCheck(request) >= constants.outreach or not OutreachList.objects.filter(name__iexact=kwargs['outreach']).exists():
            raise Http404
       if not OutreachList.objects.filter(name__iexact=kwargs['outreach']).filter(is_published=True).exists():
            return redirect('/permissiondenied/')
       if self.request.user.is_authenticated:
           if not self.request.user.groups.filter(name__iexact=kwargs['outreach']+' dashboard').exists():
               return redirect('/permissiondenied/')
           return super().dispatch(request, *args, **kwargs)
       return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        context['outreach'] = self.kwargs['outreach']
        return context

class OutreachAdminListAPIView(LoginRequiredMixin,View):
    ''' get all appointment details '''

    def post(self, request):
        try:
            date_start = self.request.POST.get("date_start", False)
            date_end = self.request.POST.get("date_end", False)
            searchKey = self.request.POST.get("searchKey", False)
            limit = self.request.POST.get("limit", False)
            page = self.request.POST.get("page", False)
            outreach = self.request.POST.get("outreach",False)
            date_start = date_start + ' 00:00:00'
            date_end = date_end + ' 23:59:59'
            book_data = OutreachPatientCallDetails.objects.filter(Q(out_reach_status='Appointment scheduled') | Q(out_reach_status='Appointment confirmed') | Q(out_reach_status='Appointment canceled') | Q(out_reach_status='Appointment cancelation requested'),outreach__iexact=outreach,created_datetime__range=(date_start,date_end))
            
            timeset = getTimeZone(self.request)
            outreachData = list(OutreachList.objects.filter(name__iexact=outreach).values())
            columns = list(OutreachList.objects.filter(name__iexact=outreach).values_list('columns'))
            if searchKey != '':
                book_data = book_data.filter(
                    patient__member__identifier__icontains=searchKey)
            book_data = book_data.filter(
                    created_datetime__range=(date_start,date_end))
            book_data = list(
                book_data.values().order_by('-created_datetime'))
            for i in book_data:
                id = i['patient_id']
                if OutreachPatient.objects.filter(id=id):
                    Employeelist = OutreachPatient.objects.filter(id=id).values()[0]
                    memberData = MemberPatient.objects.filter(id=Employeelist['member_id']).values()
                    i["column"] = memberData[0]
                    # for column in columns[0][0]:
                    #     i[column] = MemberPatient.objects.filter(id=Employeelist['member_id']).values(column)[0][column]
            [book.update({
                'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S')
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
            return JsonResponse({'status': '1', 'data': book_data, 'pagination': details,'outreachData':outreachData})
        except Exception as e:
            return JsonResponse({'status': '0', 'data': str(e)})

class OutreachAppointmentCancelRequestAPIView(LoginRequiredMixin,View):
    def post(self, request):
        try:
            id = self.request.POST.get("archive_id")
            reason_text = self.request.POST.get("reason_text",False)
            outreach = self.request.POST.get("outreach", False)
            if reason_text=='' or reason_text==None:
                reason_text = None
            out_reach_status = list(OutreachPatientCallDetails.objects.filter(id=id).values('out_reach_status'))[0]['out_reach_status']
            if out_reach_status == 'Appointment cancelation requested':
                OutreachPatientCallDetails.objects.filter(id=id).update(out_reach_status='Appointment canceled',appointment_canceled_by=self.request.user.username,appointment_canceled_datetime=datetime.utcnow().replace(tzinfo=pytz.utc))
                AppAccessData.objects.create(user=self.request.user,app_name=outreach,app_specific_page_name=self.request.path,action="Appointment canceled")
            else:
                 OutreachPatientCallDetails.objects.filter(id=id).update(out_reach_status='Appointment cancelation requested',appointment_cancelation_requested_by=self.request.user.username,appointment_cancelation_requested_datetime=datetime.utcnow().replace(tzinfo=pytz.utc),reason_for_cancelation=reason_text,is_cancelation_requested_by_csv=True)
                 AppAccessData.objects.create(user=self.request.user,app_name=outreach,app_specific_page_name=self.request.path,action="Appointment cancelation requested")
            # healthplanappointmentupdate.delay(id)
            return JsonResponse({'status': '1'})
        except Exception as e:
            return JsonResponse({'status': e})

class OutreachAppointmentConfirmUpdateAPIView(LoginRequiredMixin,View):
    def post(self, request, pk):
        try:
            outreach = self.request.POST.get("outreach", False)
            appointment = OutreachPatientCallDetails.objects.get(pk=pk)
            appointment.appointment_confirmed_by = self.request.user.username
            appointment.appointment_confirmed_datetime = datetime.utcnow().replace(tzinfo=pytz.utc)
            appointment.out_reach_status = 'Appointment confirmed'
            appointment.save()
            AppAccessData.objects.create(user=self.request.user,app_name=outreach,app_specific_page_name=self.request.path,action="Appointment outreach confirmed")
            # healthplanappointmentupdate.delay(pk)
            return JsonResponse({'status': '1'})
        except Exception as e:
            return JsonResponse({'status': e})

class OutreachAppointmentDetailView(LoginRequiredMixin, DetailView):
    model = OutreachPatientCallDetails
    template_name = "appointment/outreach/detail-outreach.html"

    def get_context_data(self, **kwargs):
        context = super(OutreachAppointmentDetailView, self).get_context_data(**kwargs)
        id = OutreachPatientCallDetails.objects.get(id=self.kwargs['pk']).patient_id
        timeset = getTimeZone(self.request)
        book_data = list(OutreachPatient.objects.filter(id=id).values())
        [book.update({
                'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S')
        }) for book in book_data]
        context["patientdetails"] = book_data
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

    def dispatch(self, request,*args, **kwargs):
       if not subscriptionCheck(request) >= constants.healthplanOutreachIntegration:
            raise Http404
       return super().dispatch(request, *args, **kwargs)

class OutreachNotificationCheckAPIView(LoginRequiredMixin, View):
    def post(self, request):
        try:
            accessing_from = self.request.POST.get("accessing_from")
            outreach = self.request.POST.get("outreach")
            Count_of_cancel_request = 0
            if accessing_from == outreach:
                Count_of_cancel_request = OutreachPatientCallDetails.objects.filter(outreach=outreach,out_reach_status='Appointment cancelation requested',is_cancelation_requested_by_csv=True).count()
            elif accessing_from == outreach+'-admin-dashboard':
                Count_of_cancel_request = OutreachPatientCallDetails.objects.filter(outreach=outreach,out_reach_status='Appointment cancelation requested',is_cancelation_requested_by_csv=False).count()
            return JsonResponse({'status': '1','count':Count_of_cancel_request})
        except Exception as e:
            return JsonResponse({'status': '0'})

class OutreachNotification(LoginRequiredMixin, ListView):
    paginate_by = 30
    ordering = ['-pk', ]
    model = OutreachPatientCallDetails
    template_name = "outreach/outreach/notification-index.html"

    def dispatch(self, request,*args, **kwargs):
       if not subscriptionCheck(request) >= constants.healthplanOutreachIntegration:
            raise Http404
       if self.request.user.is_authenticated:
           if not self.request.user.groups.filter(name__iexact=kwargs['outreach']).exists():
               return redirect('/permissiondenied/')
           return super().dispatch(request, *args, **kwargs)
       return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

    def get_context_data(self, **kwargs):
            context = super().get_context_data(**kwargs)
            logo, title, titlelogo = logoRendering(self.request)
            context['logo'] = logo
            context['title'] = title
            context['titlelogo'] = titlelogo
            context['outreach'] = self.kwargs['outreach']
            return context

class OutreachCancelAppointment(LoginRequiredMixin,View):
    def post(self, request):
        try:
            id = self.request.POST.get("archive_id")
            reason_text = self.request.POST.get("reason_text",False)
            outreach = self.request.POST.get("outreach", False)
            if reason_text=='' or reason_text==None:
                reason_text = None
            out_reach_status = list(OutreachPatientCallDetails.objects.filter(id=id).values('out_reach_status'))[0]['out_reach_status']
            if out_reach_status == 'Appointment scheduled':
                OutreachPatientCallDetails.objects.filter(id=id).update(out_reach_status='Appointment canceled',appointment_canceled_by=self.request.user.username,appointment_canceled_datetime=datetime.utcnow().replace(tzinfo=pytz.utc),reason_for_cancelation=reason_text,is_cancelation_requested_by_csv=False)
                AppAccessData.objects.create(user=self.request.user,app_name=outreach,app_specific_page_name=self.request.path,action="Outreach appointment canceled by org.")
            elif out_reach_status == 'Appointment cancelation requested':
                OutreachPatientCallDetails.objects.filter(id=id).update(out_reach_status='Appointment canceled',appointment_canceled_by=self.request.user.username,appointment_canceled_datetime=datetime.utcnow().replace(tzinfo=pytz.utc))
                AppAccessData.objects.create(user=self.request.user,app_name=outreach,app_specific_page_name=self.request.path,action="Outreach appointment canceled")
            elif out_reach_status == 'Appointment confirmed':
                OutreachPatientCallDetails.objects.filter(id=id).update(out_reach_status='Appointment cancelation requested',appointment_cancelation_requested_by=self.request.user.username,appointment_cancelation_requested_datetime=datetime.utcnow().replace(tzinfo=pytz.utc),reason_for_cancelation=reason_text,is_cancelation_requested_by_csv=False)
                AppAccessData.objects.create(user=self.request.user,app_name=outreach,app_specific_page_name=self.request.path,action="Outreach appointment cancelation requested")
            # healthplanappointmentupdate.delay(id)
            return JsonResponse({'status': '1'})
        except Exception as e:
            return JsonResponse({'status': e})

class OutreachScheduleAppointment(LoginRequiredMixin, View):

    def post(self, request):
        try:
            id = self.request.POST.get('id')
            outreachstatus = self.request.POST.get('outreachstatus')
            PatientObj = OutreachPatient.objects.get(id=id)
            outreach = self.request.POST.get('outreach',False)
            if outreach:
                if(outreachstatus =='Appointment scheduled'):
                    location = self.request.POST.get('location')
                    preferred_date = self.request.POST.get('preferred_date')
                    time = self.request.POST.get('time')
                    if location =='':
                        location == None
                    if preferred_date == '':
                        preferred_date = None
                    if time == '':
                        time = None
                    checking_slot_full = list(OutreachAppointmentTiming.objects.filter(outreach=outreach,location__name=location,date=preferred_date,time=time).values('maximum_booking_per_slot'))[0]['maximum_booking_per_slot']
                    if OutreachPatientCallDetails.objects.filter(~Q(out_reach_status='Appointment canceled'),outreach=outreach,appointment_location=location,appointment_date=preferred_date,appointment_time=time).count()>=checking_slot_full:
                        return JsonResponse({'status':'slotfull'})
                    phone_number = self.request.POST.get('phone_number',None)
                    preferred_language= self.request.POST.get('preferred_language',None)
                    comments = self.request.POST.get('comments',None)
                    accept_text = self.request.POST.get('accept_text',None)
                    Createhealthplandetails = OutreachPatientCallDetails()
                    Createhealthplandetails.patient = PatientObj
                    Createhealthplandetails.out_reach_status = outreachstatus
                    Createhealthplandetails.appointment_location = location
                    Createhealthplandetails.appointment_date = preferred_date
                    Createhealthplandetails.appointment_time = time
                    if accept_text=='true':
                        Createhealthplandetails.is_accept_text_messages = True
                    Createhealthplandetails.text_message_new_phone_number = phone_number
                    Createhealthplandetails.patient_primary_language = preferred_language
                    Createhealthplandetails.comments = comments
                else:
                    Createhealthplandetails = OutreachPatientCallDetails()
                    Createhealthplandetails.patient = PatientObj
                    Createhealthplandetails.out_reach_status = outreachstatus
                Createhealthplandetails.outreach = outreach
                Createhealthplandetails.appointment_created_by = self.request.user.username
                Createhealthplandetails.save()
                AppAccessData.objects.create(user=self.request.user,app_name=outreach,app_specific_page_name=self.request.path,action="Outreach appointment scheduled")
                return JsonResponse({'status':1})
            return JsonResponse({'status':0})
        except Exception as e:
            return JsonResponse({'status':0})

    def get(self , request):
        try:
            date = self.request.GET.get("date")
            location = self.request.GET.get("location")
            outreach = self.request.GET.get("outreach")
            date = date.split("/")
            date = date[2]+"-"+date[0]+"-"+date[1]
            timeset = getTimeZone(self.request)
            timelocal = timezone.now().replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%I:%M %p')
            datelocal = datetime.strptime(timezone.now().replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d'), '%Y-%m-%d').date()
            daterecieved = datetime.strptime(date,'%Y-%m-%d').date()
            preferred_time = [['','Select a Time']]
            timelist = list(OutreachAppointmentTiming.objects.filter(outreach=outreach,location__name=location,date=daterecieved).values('time','maximum_booking_per_slot'))
            preferred_time_frame = []
            for i in timelist:
                preferred_time_frame.append([i['time'],i['maximum_booking_per_slot']])
            if daterecieved<=datelocal:
                for slot in preferred_time_frame:
                    if time.strptime(timelocal, '%I:%M %p')<time.strptime(slot[0], '%I:%M %p'):
                        if OutreachPatientCallDetails.objects.filter(~Q(out_reach_status='Appointment canceled'),outreach=outreach,appointment_location=location,appointment_date=date,appointment_time=slot[0]).count()<slot[1]:
                            preferred_time.append([slot[0],slot[0]])
                        else:
                            preferred_time.append(['',slot[0]+_(' (Slot Full)')])
            else:
                for slot in preferred_time_frame:
                    if OutreachPatientCallDetails.objects.filter(~Q(out_reach_status='Appointment canceled'),outreach=outreach,appointment_location=location,appointment_date=date,appointment_time=slot[0]).count()<slot[1]:
                        preferred_time.append([slot[0],slot[0]])
                    else:
                        preferred_time.append(['',slot[0]+_(' (Slot Full)')])
            return JsonResponse({'status':1,'preferred_time':preferred_time})
        except Exception as e:
            return JsonResponse({'status':0})

class OutReachHistory(LoginRequiredMixin, DetailView):
    model = OutreachPatient
    template_name = "outreach/outreach/outreach-history.html"

    def get_context_data(self, **kwargs):
        timeset = getTimeZone(self.request)
        context = super(OutReachHistory, self).get_context_data(**kwargs)
        book_data = list(OutreachPatientCallDetails.objects.filter(patient_id=self.kwargs['pk']).values().order_by('-created_datetime'))
        for book in book_data:
            if book['appointment_confirmed_datetime']!=None:
                book.update({
                'appointment_confirmed_datetime': book['appointment_confirmed_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S')
                })
            if book['appointment_cancelation_requested_datetime']!=None:
                book.update({
                    'appointment_cancelation_requested_datetime': book['appointment_cancelation_requested_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S')
                    })
            if book['appointment_canceled_datetime']!=None:
                 book.update({
                    'appointment_canceled_datetime': book['appointment_canceled_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S')
                    })
            book.update({
            'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S'),
            'modified_datetime': book['modified_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%m-%d-%Y %H:%M:%S')
            })

        context["outreach_history"] = book_data
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        context['outreach'] = self.kwargs['outreach']
        return context

class OutreachPatientAppointmentReminer(LoginRequiredMixin,View):
    def post(self, request, pk):
        try:
            outreach = self.request.POST.get("outreach", False)
            appointment = OutreachPatientCallDetails.objects.get(pk=pk)
            appointment.is_appointment_scheduled_patient_reminded = True
            appointment.save()
            AppAccessData.objects.create(user=self.request.user,app_name=outreach,app_specific_page_name=self.request.path,action="Outreach appointment reminded")
            # healthplanappointmentupdate.delay(pk)
            return JsonResponse({'status': '1'})
        except Exception as e:
            return JsonResponse({'status': e})

class OutreachFetchAvailableDates(LoginRequiredMixin, View):
     def post(self, request):
        try:
            location = self.request.POST.get("location", False)
            outreach = self.request.POST.get("outreach", False)
            datelist = []
            timeset = getTimeZone(self.request)
            items = list(OutreachAppointmentTiming.objects.filter(outreach=outreach,location__name=location,date__gte=timezone.now().replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d')).values('date').distinct())
            for date in items:
                datelist.append(date['date'])
            return JsonResponse({'status':1,'date':datelist})
        except Exception as e:
            return JsonResponse({'status':0})

class OutreachLocation(LoginRequiredMixin, View):
    def get(self, request, outreach):
        try:
            items = list(AppLocation.objects.filter(app__app_name=outreach).values('location__name'))
            locationlist = []
            for location in items:
                locationlist.append((location['location__name'],location['location__name']))
            return JsonResponse({'status':1,'location':locationlist})
        except Exception as e:
            return JsonResponse({'status':0})

class OutreachAdminNotification(CheckingwhetherStaffUser,LoginRequiredMixin, ListView):
    paginate_by = 30
    ordering = ['-pk', ]
    model = OutreachPatientCallDetails
    template_name = "outreach/outreach/outreach-admin-notification.html"

    def dispatch(self, request,*args, **kwargs):
       if not subscriptionCheck(request) >= constants.outreach or not OutreachList.objects.filter(name__iexact=kwargs['outreach']).exists():
            raise Http404
       if self.request.user.is_authenticated:
           if not self.request.user.groups.filter(name__iexact=kwargs['outreach']+' outreach dashboard').exists():
               return redirect('/permissiondenied/')
           return super().dispatch(request, *args, **kwargs)
       return redirect_to_login(self.request.get_full_path(), self.get_login_url(), self.get_redirect_field_name())

    def get_context_data(self, **kwargs):
            context = super().get_context_data(**kwargs)
            logo, title, titlelogo = logoRendering(self.request)
            context['logo'] = logo
            context['title'] = title
            context['titlelogo'] = titlelogo
            context['outreach'] = self.kwargs['outreach']
            return context

class OutreachNotificationAPIListView(LoginRequiredMixin, View):
    def post(self, request):
        try:
            filter = self.request.POST.get("filter", False)
            limit = self.request.POST.get("limit", False)
            page = self.request.POST.get("page", False)
            outreachName = self.request.POST.get("outreach", False)
            timeset = getTimeZone(self.request)
            if filter=='Outreach':
                first_data = OutreachPatientCallDetails.objects.filter(outreach=outreachName,out_reach_status='Appointment cancelation requested',is_cancelation_requested_by_csv=True)
                book_data = list(
                first_data.values().order_by('-created_datetime'))
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
                for i in book_data:
                    id = i['patient_id']
                    if OutreachPatient.objects.filter(id=id):
                        Employeelist = OutreachPatient.objects.filter(id=id).values().order_by('-created_datetime')[0]
                        i['first_name'] = Employeelist['first_name']
                        i['last_name'] = Employeelist['last_name']
                        i['mrn'] = Employeelist['mrn']
                        i['phone_number'] = Employeelist['phone_number']
                        i['call_details_table_id'] = i['id']
                        i['id'] = Employeelist['id']
                [book.update({
                    'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S')
                }) for book in book_data]
            elif filter=='Outreach dashboard':
                first_data = OutreachPatientCallDetails.objects.filter(outreach=outreachName,out_reach_status='Appointment cancelation requested',is_cancelation_requested_by_csv=False)
                book_data = list(
                    first_data.values().order_by('-created_datetime'))

                for i in book_data:
                    id = i['patient_id']
                    if OutreachPatient.objects.filter(id=id):
                        Employeelist = OutreachPatient.objects.filter(id=id).values()[0]
                        i['first_name'] = Employeelist['first_name']
                        i['last_name'] = Employeelist['last_name']
                        i['phone_number'] = Employeelist['phone_number']
                        i['provider'] = Employeelist['provider']
                        i['mrn'] = Employeelist['mrn']
                
                [book.update({
                    'created_datetime': book['created_datetime'].replace(tzinfo=pytz.utc).astimezone(timeset).strftime('%Y-%m-%d %H:%M:%S')
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
            return JsonResponse({'status': '1', 'data': book_data, 'pagination': details})
        except Exception as e:
            return JsonResponse({'status': '0', 'data': str(e)})

class Scheduler(CheckingwhetherStaffUser,LoginRequiredMixin, TemplateView):
    template_name = "outreach/scheduler/index.html"

    def get_context_data(self, **kwargs):
        context = super(Scheduler, self).get_context_data(**kwargs)
        context["Healthplan_app"] = 'd-none'
        context["KHSoutreach_app"] = 'd-none'
        context["Healthnet_app"] = 'd-none'
        portals = self.request.user.groups.filter(name__contains='Outreach').exclude(name__contains='outreach dashboard').values('name')
        [portal.update({
                'name': portal['name'].split(' ')[0]
            }) for portal in portals]
        # if self.request.user.groups.filter(name='Healthplan').exists():
        #     context["Healthplan_app"] = None
        # if self.request.user.groups.filter(name='KHSOutreach').exists():
        #     context["KHSoutreach_app"] = None
        # if self.request.user.groups.filter(name='Healthnet').exists():
        #     context["Healthnet_app"] = None
        context['portals'] = portals
        logo, title, titlelogo = logoRendering(self.request)
        context['logo'] = logo
        context['title'] = title
        context['titlelogo'] = titlelogo
        return context

class OutreachScheduler(LoginRequiredMixin, TemplateView):
    template_name = "outreach/healthplan-scheduler/index.html"

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
        context['outreach'] = kwargs['outreach']
        return context

class HealthPlanSchedulerListAPI(LoginRequiredMixin, View):
     def post(self, request):
        try:
            submission_type = self.request.POST.getlist('type')[0]
            start_date =  datetime.strptime(self.request.POST.getlist('start_date')[0], "%m/%d/%Y").date()
            location = self.request.POST.getlist('location')[0]
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
                        if OutreachAppointmentTiming.objects.filter(outreach=outreach,date=start_date,location__name=location).exists():
                               messages.error(request,'All/Some of the selected date slot already exists.')
                               return redirect('outreach:outreach_scheduler',outreach)
                        for i in range(0,len(items),3):
                            createtimeslot = OutreachAppointmentTiming()
                            createtimeslot.outreach = outreach
                            createtimeslot.location = Location.objects.get(name=location)
                            createtimeslot.date = start_date
                            createtimeslot.time = items[i][1]+" "+items[i+1][1]
                            createtimeslot.maximum_booking_per_slot = items[i+2][1]
                            createtimeslot.slot_created_by = self.request.user.username
                            createtimeslot.save()
                    start_date = start_date + timedelta(days=1)
                createtimeslot.save()
            elif submission_type=='custom':
                if OutreachAppointmentTiming.objects.filter(outreach=outreach,date=start_date,location__name=location).exists():
                    messages.error(request,'Selected date slot already exists.')
                    return redirect('outreach:outreach_scheduler',outreach)
                elements = list(self.request.POST.items())
                position = 0
                for index,value in enumerate(elements):
                    if value[0]=='time1':
                        position =index
                        break
                items = list(self.request.POST.items())[position:]
                for i in range(0,len(items),3):
                    createtimeslot = OutreachAppointmentTiming()
                    createtimeslot.outreach = outreach
                    createtimeslot.location = Location.objects.get(name=location)
                    createtimeslot.date = start_date
                    createtimeslot.time = items[i][1]+" "+items[i+1][1]
                    createtimeslot.maximum_booking_per_slot = items[i+2][1]
                    createtimeslot.slot_created_by = self.request.user.username
                    createtimeslot.save()
            AppAccessData.objects.create(user=self.request.user,app_name=outreach,app_specific_page_name=self.request.path,action="Outreach appointment slot allotted")
            return redirect('outreach:outreach_scheduler', outreach)
        except Exception as e:
            messages.error(request,'Something Happened.Try again.')
            return redirect('outreach:outreach_scheduler',outreach)

class HealthPlanSchedulerAdminListAPIView(LoginRequiredMixin,View):
    def post(self, request):
        try:
            location = self.request.POST.get("location", False)
            date_start = self.request.POST.get("date_start", False)
            date_end = self.request.POST.get("date_end", False)
            outreach = self.request.POST.get("outreach", False)
            start = datetime.strptime(date_start, "%Y-%m-%d").date()
            end = datetime.strptime(date_end, "%Y-%m-%d").date()
            timeslot = {}
            while(start<=end):
                data = list(OutreachAppointmentTiming.objects.filter(outreach=outreach,date=start,location__name=location).values())
                if data:
                    timeslot[start.strftime('%Y-%m-%d')]=[]
                    for items in data:
                        timeslot[start.strftime('%Y-%m-%d')].append({'id':items['id'],'time':items['time'],'maximum_booking_per_slot':items['maximum_booking_per_slot']})
                start = start + timedelta(days=1)
            return JsonResponse({'status':1,'data':timeslot})
        except Exception as e:
            return JsonResponse({'status':0})

class HealthPlanSchedulerAdminListUpdate(LoginRequiredMixin,View):
     def post(self, request):
        try:
            updatetype = self.request.POST.get("type", False)
            id = self.request.POST.get("id", False)
            time = self.request.POST.get("time", False)
            meridian = self.request.POST.get("meridian", False)
            maximum = self.request.POST.get("maximum", False)
            outreach = self.request.POST.get("outreach", False)
            time = time+" "+meridian
            if updatetype=='edittime':
                datetime.strptime(time,'%I:%M %p')
                items = list(OutreachAppointmentTiming.objects.filter(id=id).values('location','date','maximum_booking_per_slot','time'))
                location = items[0]['location']
                date = items[0]['date']
                maximum_booking_per_slot = str(items[0]['maximum_booking_per_slot'])
                dbtime = items[0]['time']
                if maximum_booking_per_slot==maximum and time==dbtime:
                    return JsonResponse({'status':'exists'})
                elif maximum_booking_per_slot!=maximum and time==dbtime:
                    UpdateSlot = OutreachAppointmentTiming.objects.get(id=id)
                    UpdateSlot.maximum_booking_per_slot=maximum
                    UpdateSlot.save()
                elif maximum_booking_per_slot!=maximum and time!=dbtime:
                    if OutreachAppointmentTiming.objects.filter(outreach=outreach,date=date,location=location,time=time).exists():
                        return JsonResponse({'status':'exists'})
                    else:
                        UpdateSlot = OutreachAppointmentTiming.objects.get(id=id)
                        UpdateSlot.time=time
                        UpdateSlot.maximum_booking_per_slot=maximum
                        UpdateSlot.save()
                elif maximum_booking_per_slot==maximum and time!=dbtime:
                   if OutreachAppointmentTiming.objects.filter(outreach=outreach,date=date,location=location,time=time).exists():
                       return JsonResponse({'status':'exists'})
                   else:
                       UpdateSlot = OutreachAppointmentTiming.objects.get(id=id)
                       UpdateSlot.time=time
                       UpdateSlot.save()
            elif updatetype=='deletetime':
                OutreachAppointmentTiming.objects.filter(id=id).delete()
            elif updatetype=='deletedate':
                items = list(OutreachAppointmentTiming.objects.filter(id=id).values('location','date'))
                location = items[0]['location']
                date = items[0]['date']
                OutreachAppointmentTiming.objects.filter(location=location,date=date).delete()
            elif updatetype=='addnewslot':
                items = list(OutreachAppointmentTiming.objects.filter(id=id).values('location','date'))
                location = items[0]['location']
                date = items[0]['date']
                location = list(Location.objects.filter(id=location).values('name'))[0]['name']
                if OutreachAppointmentTiming.objects.filter(outreach=outreach,date=date,location__name=location,time=time).exists():
                        return JsonResponse({'status':'exists'})
                UpdateSlot = OutreachAppointmentTiming()
                UpdateSlot.outreach = outreach
                UpdateSlot.location = Location.objects.get(name=location)
                UpdateSlot.date = date
                UpdateSlot.time = time
                UpdateSlot.maximum_booking_per_slot = maximum
                UpdateSlot.slot_created_by = self.request.user.username
                UpdateSlot.save()
            AppAccessData.objects.create(user=self.request.user,app_name=outreach,app_specific_page_name=self.request.path,action="Outreach scheduler slots updated")
            return JsonResponse({'status':1})
        except Exception as e:
            return JsonResponse({'status':0})

class Ingress(LoginRequiredMixin, TemplateView):
    template_name = "outreach/fhir/ingress.html"
    def get_context_data(self, **kwargs):
            context = super().get_context_data(**kwargs)
            logo, title, titlelogo = logoRendering(self.request)
            context['logo'] = logo
            context['title'] = title
            context['titlelogo'] = titlelogo
            return context
def convert_datetime(dt):
    return datetime.strftime(dt, '%d-%m-%Y')

class IngressBlobs(LoginRequiredMixin ,View):
    def post(self,request):
        try:
            if 'ingress' in self.request.FILES:
                ingress = self.request.FILES['ingress']
                auto_id = self.request.POST.get("auto_id", False)
                extension = str(ingress).rsplit( ".", 1 )[1].lower()
                if extension == 'csv':
                    df=pd.read_csv(ingress)
                elif extension == 'xlsx':
                    df=pd.read_excel(ingress)
                else:
                    return JsonResponse({'status':0})
                df.drop(df.filter(regex="Unname"),axis=1, inplace=True)
                if not (len(df.columns)==19 and {'Identifier','Given name','Family name','Prefix name','Suffix name','Contact','Contact Use','Identifier System','Birth date','Active','Gender','Address use','Address line','Address city','Address district','Address state','Address postal','Address country','Photo'}.issubset(df.columns)):
                    return JsonResponse({'status':2})
                if extension == 'xlsx':
                    df['Birth date']= df['Birth date'].apply(convert_datetime)
                domain = str(request.get_host()).split('.')[0]
                write_to_celery.delay(df.to_json(),auto_id,domain)
                AppAccessData.objects.create(user=self.request.user,app_name="Ingress",app_specific_page_name=self.request.path,action="Member patients bulk file uploaded")
            #     connection_string = "DefaultEndpointsProtocol=https;AccountName={};AccountKey={};EndpointSuffix={}".format(
            # "basastorageblob", "v/f+/KA3pS01IbbJOHjugGi3J8Gg/Wcpzv4f48LZCgYl135ujkc0sYc39wEg5cmekLfRP98FDd+J+AStRLaHlw==","core.windows.net")
            #     table_name = "DjangoTestTable"
            #     entity_template = {
            #         "RowKey": "1",
            #     }
            #     with TableClient.from_connection_string(connection_string, table_name) as table_client:
            #         g = copy.deepcopy(entity_template)
            #         for row in df.itertuples():
            #             d=datetime.now().strftime("%Y%m%d%H%M%S%f")
            #             random_key = ''.join([
            #                 ''.join(random.sample(string.ascii_letters, 2)),
            #                 ''.join(random.sample(string.digits, 2)),
            #                 ''.join(random.sample(string.ascii_letters, 2)),
            #             ])
            #             auto_identifier = str(d)+str(random_key)
            #             g["PartitionKey"] = auto_identifier
            #             g["RowKey"] = 'Keleno'
            #             g["Name"] = row.name
            #             g["Telecom"] = row.telecom
            #             g["Birthdate"] = row.birthdate
            #             g["Status"] = row.status
            #             if auto_id :
            #                 g['identifier'] = auto_identifier
            #             else:
            #                 g['identifier'] = str(row.identifier)
            #             table_client.create_entity(entity=g)
            return JsonResponse({'status':1})
        except Exception as e:
            return JsonResponse({'status':0})