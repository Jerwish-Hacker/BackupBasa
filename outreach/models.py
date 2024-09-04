from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.utils.translation import gettext as _
from django.contrib.auth.models import User
from mainapp.models import Location
from tenant.models import MemberPatient

# Create your models here.

class OutreachList(models.Model):
    name = models.CharField(_("Outreach name"),max_length=250,null=True, blank=True)

    columns = ArrayField(models.CharField(max_length=250, blank=True,null=True),size=20)

    outreach_status_values = ArrayField(models.CharField(max_length=250, blank=True,null=True),size=20)

    is_filter_added = models.BooleanField(_("Filters Added ?"),default=False)

    is_published = models.BooleanField(_("Outreach Published ?"),default=True)

    age_from = ArrayField(models.CharField(_("From Age List"), max_length=250, blank=True,null=True),default=[1],size=30)

    age_to = ArrayField(models.CharField(_("To Age List"),max_length=250, blank=True,null=True),default=[1],size=30)

    zipcode = ArrayField(models.CharField(_("Zipcode List"),max_length=250, blank=True,null=True),default=[1],size=30)

    gender_filters = ArrayField(models.CharField(_("Gender List"),max_length=250, blank=True,null=True),default=[1],size=30)

    notification_enabled = models.BooleanField(_("Outreach Notification enabled ?"),default=False)

    schedule_id = models.CharField(_("Schedule ID"),max_length=250,null=True, blank=True)
   
    schedule_type = models.CharField(_("Schedule Type"),max_length=250,null=True, blank=True)

    notification_text = models.CharField(_("Notification Text"),max_length=250,null=True, blank=True)

    start_date = models.DateField(_("Notification Start Date"),null=True, blank=True)

    end_date = models.DateField(_("Notification End Date"),null=True, blank=True)

    weekdays = ArrayField(models.CharField(_("Selected Days"), max_length=250, blank=True,null=True),default=[1],size=30)

    scheduled_hours = ArrayField(models.CharField(_("Scheduled Hours"), max_length=250, blank=True,null=True),default=[1],size=30)

    scheduled_minutes = ArrayField(models.CharField(_("Scheduled Minutes"), max_length=250, blank=True,null=True),default=[1],size=30)

    meridiem_type = models.CharField(_("Meridiem Type"),max_length=250,null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name or '------'
    
class OutreachPatient(models.Model):

    member = models.ForeignKey(MemberPatient,on_delete=models.CASCADE)

    appointment_type =  models.CharField(_("Appointment Type"),max_length=100, null=True, blank=True)

    mrn = models.CharField(_("MRN"), max_length=50, null=True, blank=True)
    
    first_name = models.CharField(_("First Name"), max_length=100, null=True, blank=True)

    last_name = models.CharField(_("Last Name"),max_length=100, null=True, blank=True)

    date_of_birth = models.DateField(_("Date of Birth"),null=True, blank=True)

    phone_number = models.CharField(_("Phone Number"),max_length=100, null=True, blank=True)

    provider =  models.CharField(_("Provider"),max_length=250, null=True, blank=True)

    outreach = models.ForeignKey(OutreachList,on_delete=models.CASCADE)

    is_active = models.BooleanField(_("Is Active ?"), default=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)


    class Meta:
        verbose_name = _("Outreach Patient")
        verbose_name_plural = _("Outreach Patients")

    def __str__(self):
        return self.last_name or '------'

class OutreachPatientCallDetails(models.Model):

    patient = models.ForeignKey(OutreachPatient,on_delete=models.CASCADE)

    outreach = models.CharField(_("Outreach Name"),max_length=100, null=True, blank=True)

    out_reach_status = models.CharField(_("Out Reach Status"),max_length=250, null=True, blank=True)
    
    call_back_date_time = models.DateTimeField(_("Call Back Date"),null=True, blank=True)

    appointment_location = models.CharField(_("Appointment Location"),max_length=250, null=True, blank=True)

    appointment_date = models.DateField(_("Appointment Date"),null=True, blank=True)

    appointment_time = models.CharField(_("Appointment Time"),max_length=100, null=True, blank=True)

    is_accept_text_messages =  models.BooleanField(_("Is Accept Text Messages?"), default=False, null=True, blank=True)

    text_message_new_phone_number = models.CharField(_("Text Message New Phone Number"),max_length=100, null=True, blank=True)

    patient_primary_language = models.CharField(_("Patient Primary Language"),max_length=100, null=True, blank=True)

    is_appointment_scheduled_patient_reminded = models.BooleanField(_("Is Appointment Scheduled Patient Reminded?"), default=False, null=True, blank=True)

    appointment_created_by = models.CharField(_("Appointment Created By"),max_length=100, null=True, blank=True)

    appointment_confirmed_by = models.CharField(_("Appointment Confirmed By"),max_length=100, null=True, blank=True)

    appointment_confirmed_datetime = models.DateTimeField(_("Appointment Confirmed Date Time"),null=True, blank=True)

    appointment_cancelation_requested_by = models.CharField(_("Appointment Cancelation Requested By"),max_length=100, null=True, blank=True)

    appointment_cancelation_requested_datetime = models.DateTimeField(_("Appointment Cancelation Requested Date Time"), null=True, blank=True)

    appointment_canceled_by = models.CharField(_("Appointment Canceled By"),max_length=100, null=True, blank=True)
    
    appointment_canceled_datetime = models.DateTimeField(_("Appointment Canceled Date Time"), null=True, blank=True)

    reason_for_cancelation = models.TextField(_("Reason for Cancelation"), null=True, blank=True)

    is_cancelation_requested_by_csv = models.BooleanField(_("Is Cancelation Requested By CSV?"), default=False, null=True, blank=True)

    comments = models.TextField(_("Comments"),null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Outreach Patient Call Detail")
        verbose_name_plural = _("Outreach Patient Call Details")

    def __str__(self):
        return self.patient.last_name or '------'

class OutreachAppointmentTiming(models.Model):

    outreach = models.CharField(
        ("Outreach"),
        max_length=100,null=True, blank=True)

    location = models.ForeignKey(Location, on_delete=models.CASCADE)

    date =  models.DateField(
        ("Date"),null=True, blank=True)

    time = models.CharField(
        ("Time"),
        max_length=100, null=True, blank=True)

    maximum_booking_per_slot = models.IntegerField(
        ("Maximum Booking Per Slot"),null=True, blank=True)

    slot_created_by = models.CharField(_("Slot Created By"),max_length=100, null=True, blank=True)
    
    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = ("Outreach Appointment Timing")
        verbose_name_plural = ("Outreach Appointment Timing")

    def __str__(self):
        return self.location.name or '------'

class OTPTable(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    otp =  models.CharField(
        ("OTP"),
        max_length=100, null=True, blank=True)

    session = models.CharField(
        ("Session"),
        max_length=100, null=True, blank=True)
    
    created_datetime = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = ("OTP")
        verbose_name_plural = ("OTP")

    def __str__(self):
        return self.user.username or '------'