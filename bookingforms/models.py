from django.db import models
from django.utils.translation import gettext as _
from django.urls import reverse_lazy
from django.conf import settings
from django.contrib.auth.models import User
from datetime import date
from django.contrib.postgres.fields import ArrayField
# Create your models here.

def is_captcha_required():
    # Not needed for developer
    return not settings.DEBUG

class Appointment(models.Model):
    appointment_type = models.CharField(
        _("Appointment Type"), max_length=50, null=True, blank=True)
    
    county = models.CharField(
        _("County"), max_length=100, null=True, blank=True)
    preferred_day_of_week = models.CharField(
        _("Preferred Day of the Week"),
        max_length=100, null=True, blank=True)

    preferred_date = models.DateField(_("Preffered Date"), default=date(1111, 11, 11), null=True, blank=True)
    
    preferred_time_frame = models.CharField(
        _("Preferred time frame"),
        max_length=100,
        null=True, blank=True
    )

    employer = models.CharField(
        _("Employer"), max_length=100, null=True, blank=True)
    job_role = models.CharField(
        _("Job Role"), max_length=100, null=True, blank=True)

    is_previously_vaccinated = models.BooleanField(
        _("Have you received the first dose of the Covid Vaccine?"), null=True, blank=True)
    covid_vaccine_manufacturer = models.CharField(
        _("If Yes, which manufacturer?"),
        max_length=50,
        null=True, blank=True
    )

    is_a_patient_of_clinic = models.BooleanField(
        _("Are you a current patient of Clinica Sierra Vista?"), null=True, blank=True)

    vaccine_eligibility_status = models.CharField(_("Vaccine Eligibility Status?"),max_length=100, null=True, blank=True)

    is_healthworker_or_above_age_65 = models.BooleanField(
        _("Are you a healthcare worker and or 65 years old and over?"), null=True, blank=True)
    is_healthworker = models.BooleanField(
        _("Are you a healthcare worker?"), null=True, blank=True)
    is_above_age_65 = models.BooleanField(
        _("Are you 65 years old and over?"), null=True, blank=True)
    
    is_archived = models.BooleanField(default=False)

    last_name = models.CharField(
        _("Last Name"), max_length=50, null=True, blank=True)
    first_name = models.CharField(
        _("First Name"), max_length=50, null=True, blank=True)
    social_security_number = models.CharField(
        _("Social Security Number"), max_length=50, null=True, blank=True)
    is_social_security_number_declined = models.BooleanField(
        _("Decline to answer about SSN"), default=False, null=True, blank=True)

    date_of_birth = models.CharField(
        _("Date of Birth"), max_length=50, null=True, blank=True)
    # Work around
    # date_of_birth = models.DateField(
    #     _("Date of Birth"), auto_now=False, auto_now_add=False, null=True, blank=True)
    gender = models.CharField(
        _("Gender"),
        max_length=50,
        null=True, blank=True
    )

    contact_number = models.CharField(
        _("Contact Number"), max_length=50, null=True, blank=True)
    contact_number_type = models.CharField(
        _("Contact Number Type"),
        max_length=50,
        null=True, blank=True
    )
    is_contact_number_reachable_by_text = models.BooleanField(
        _("Can you accept texts if you can’t be reached by phone?"), null=True, blank=True)

    email_address = models.EmailField(
        _("Email Address"), max_length=254, null=True, blank=True)
    street_address = models.TextField(
        _("Street Address"), null=True, blank=True)
    # Selectbox selected
    city = models.CharField(_("City"), max_length=50, null=True, blank=True)
    # User entered in case of other
    city_entered = models.CharField(_("Other City ? Enter Here"), max_length=50, null=True, blank=True)
    state = models.CharField(_("State"), max_length=50, null=True, blank=True)
    zip_code = models.CharField(_("Zip"), max_length=20, null=True, blank=True)

    # List of Languages
    primary_language = models.CharField(
        _("Primary Language"), max_length=50, null=True, blank=True)
    # Enter by user
    primary_langauge_entered = models.CharField(
        _("Enter Langauge"), max_length=50, null=True, blank=True)

    marital_status = models.CharField(
        _("Marital Status"),
        max_length=50,
        null=True, blank=True
    )
    ethnicity = models.CharField(
        _("Ethnicity"),
        max_length=50,
        null=True, blank=True
    )
    race = models.CharField(
        _("Race"),
        max_length=50,
        null=True, blank=True
    )
    is_veteran = models.BooleanField(
        _("Are you a Veteran?"), default=False, null=True, blank=True)

    emergency_contact_name = models.CharField(
        _("Emergency Contact Name"), max_length=50, null=True, blank=True)
    emergency_contact_number = models.CharField(
        _("Emergency Contact Number"), max_length=50, null=True, blank=True)
    # Select box chosen entry
    emergency_contact_relationship = models.CharField(
        _("Emergency Contact Relationship"), max_length=50, null=True, blank=True)
    # User entered entry
    emergency_contact_relationship_entered = models.CharField(
        _("Emergency Contact Relationship Entered"), max_length=50, null=True, blank=True)

    employment_status = models.CharField(
        _("Employment Status"),
        max_length=50,
        null=True, blank=True
    )
    homeless_status = models.CharField(
        _("Homeless Status"),
        max_length=50,
        null=True, blank=True
    )
    farmworker_status = models.CharField(
        _("Farmworker Status"),
        max_length=50,
        null=True, blank=True
    )

    guarantor_name = models.CharField(
        _("Guarantor Name"), max_length=50, null=True, blank=True)
    is_guarantor_details_declined = models.BooleanField(_("Is Guarantor Details Declined ?"),null=True, default=False)
    # Select box entry
    guarantor_relationship = models.CharField(
        _("Guarantor Relationship"), max_length=50, null=True, blank=True)
    # User entered entry
    guarantor_relationship_entered = models.CharField(
        _("Other Guarantor Relationship ? Enter it here"), max_length=50, null=True, blank=True)
    guarantor_date_of_birth = models.CharField(
        _("Guarantor Date of Birth"), max_length=50, null=True, blank=True)
    # guarantor_date_of_birth = models.DateField(
    #     _("Guarantor Date of Birth"), auto_now=False, auto_now_add=False, null=True, blank=True)

    family_size = models.CharField(
        _("Family Size"), max_length=50, null=True, blank=True)
    household_income = models.CharField(
        _("Household Income"), max_length=50, null=True, blank=True)
    is_household_income_declined = models.BooleanField(
        _("Is Household Income Decline to answer ?"), null=True, blank=True)
    income_frequency = models.CharField(
        _("Income Frequency"),
        max_length=50,
        null=True, blank=True
    )

    primary_insurance_carrier = models.CharField(
        _("Primary Insurance Carrier"), max_length=50, null=True, blank=True)
    is_not_insured = models.BooleanField(
        _("Not Insured"), default=False, null=True, blank=True)
    subscriber_id = models.CharField(
        _("Subscriber ID"), max_length=50, null=True, blank=True)
    group_number = models.CharField(
        _("Group Number (if applicable)"), max_length=50, null=True, blank=True)
    subscriber_name = models.CharField(
        _("Subscriber Name (First and Last)"), max_length=100, null=True, blank=True)
    # Select box selected
    subscriber_relationship = models.CharField(
        _("Subscriber Relationship"), max_length=100, null=True, blank=True)
    # User entered entry, other option.
    subscriber_relationship_entered = models.CharField(
        _("Other Subscriber Relationship ? Enter it here"), max_length=100, null=True, blank=True)

    identification_document = models.CharField(
        _("Identification Document"), max_length=50, null=True, blank=True)
    attachment_support = models.FileField(
        _("Attachment support"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    insurance_card = models.FileField(
        _("Insurance Card (Front)"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)
    insurance_card_back = models.FileField(
        _("Insurance Card (Back)"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    is_declaration_accepted = models.BooleanField(
        _("Is Declaration accepted ?"), null=True, blank=True)

    description = models.TextField(
        _("Description"), null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)
    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Appointment")
        verbose_name_plural = _("Appointments")

    def __str__(self):
        return self.last_name or '------'

    def get_absolute_url(self):
        return reverse_lazy("bookingforms:success_page")

class AppointmentLock(models.Model):
    user_fk = models.ForeignKey(User, on_delete=models.PROTECT)
    appointment_fk = models.ForeignKey(Appointment, on_delete=models.PROTECT)

class County(models.Model):
    name = models.CharField(_("County Name"), max_length=50)

    class Meta:
        verbose_name = _("County")
        verbose_name_plural = _("Countys")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse_lazy("bookingforms:update_county", kwargs={"pk": self.pk})

class HealthPlanPatient(models.Model):

    appointment_type =  models.CharField(_("Appointment Type"),max_length=100, null=True, blank=True)

    mrn = models.CharField(_("MRN"), max_length=50, null=True, blank=True)
    
    first_name = models.CharField(_("First Name"), max_length=100, null=True, blank=True)

    last_name = models.CharField(_("Last Name"),max_length=100, null=True, blank=True)

    date_of_birth = models.DateField(_("Date of Birth"),null=True, blank=True)

    phone_number = models.CharField(_("Phone Number"),max_length=100, null=True, blank=True)

    provider =  models.CharField(_("Provider"),max_length=250, null=True, blank=True)

    outreach = models.CharField(_("Outreach Name"),max_length=100, null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Health Plan Patient")
        verbose_name_plural = _("Health Plan Patients")

    def __str__(self):
        return self.last_name or '------'

class HealthPlanPatientCallDetails(models.Model):

    patient = models.ForeignKey(HealthPlanPatient,on_delete=models.PROTECT)

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
        verbose_name = _("Health Plan Patient Call Detail")
        verbose_name_plural = _("Health Plan Patient Call Details")

    def __str__(self):
        return self.patient.last_name or '------'

class HealthPlanAppointmentLocation(models.Model):

    location = models.CharField(
        ("Location"),
        max_length=100, null=True, blank=True)

    slot_created_by = models.CharField(_("Slot Created By"),max_length=100, null=True, blank=True)
    
    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = ("HealthPlan Appointment Location")
        verbose_name_plural = ("HealthPlan Appointment Location")

    def __str__(self):
        return self.location or '------'

class HealthPlanAppointmentTiming(models.Model):

    location = models.ForeignKey(HealthPlanAppointmentLocation, on_delete=models.CASCADE)

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
        verbose_name = ("HealthPlan Appointment Timing")
        verbose_name_plural = ("HealthPlan Appointment Timing")

    def __str__(self):
        return self.location.location or '------'

class KHSAppointment(models.Model):
    appointment_type = models.CharField(
        _("Appointment Type"), max_length=50, null=True, blank=True)
    
    county = models.CharField(
        _("County"), max_length=100, null=True, blank=True)
    preferred_day_of_week = models.CharField(
        _("Preferred Day of the Week"),
        max_length=100, null=True, blank=True)

    preferred_date = models.DateField(_("Preffered Date"), default=date(1111, 11, 11), null=True, blank=True)
    
    preferred_time_frame = models.CharField(
        _("Preferred time frame"),
        max_length=100,
        null=True, blank=True
    )

    employer = models.CharField(
        _("Employer"), max_length=100, null=True, blank=True)
    job_role = models.CharField(
        _("Job Role"), max_length=100, null=True, blank=True)

    is_previously_vaccinated = models.BooleanField(
        _("Have you received the first dose of the Covid Vaccine?"), null=True, blank=True)
    covid_vaccine_manufacturer = models.CharField(
        _("If Yes, which manufacturer?"),
        max_length=50,
        null=True, blank=True
    )

    is_a_patient_of_clinic = models.BooleanField(
        _("Are you a current patient of Clinica Sierra Vista?"), null=True, blank=True)

    vaccine_eligibility_status = models.CharField(_("Vaccine Eligibility Status?"),max_length=100, null=True, blank=True)

    is_healthworker_or_above_age_65 = models.BooleanField(
        _("Are you a healthcare worker and or 65 years old and over?"), null=True, blank=True)
    is_healthworker = models.BooleanField(
        _("Are you a healthcare worker?"), null=True, blank=True)
    is_above_age_65 = models.BooleanField(
        _("Are you 65 years old and over?"), null=True, blank=True)
    
    is_archived = models.BooleanField(default=False)

    last_name = models.CharField(
        _("Last Name"), max_length=50, null=True, blank=True)
    first_name = models.CharField(
        _("First Name"), max_length=50, null=True, blank=True)
    social_security_number = models.CharField(
        _("Social Security Number"), max_length=50, null=True, blank=True)
    is_social_security_number_declined = models.BooleanField(
        _("Decline to answer about SSN"), default=False, null=True, blank=True)

    date_of_birth = models.CharField(
        _("Date of Birth"), max_length=50, null=True, blank=True)
    # Work around
    # date_of_birth = models.DateField(
    #     _("Date of Birth"), auto_now=False, auto_now_add=False, null=True, blank=True)
    gender = models.CharField(
        _("Gender"),
        max_length=50,
        null=True, blank=True
    )

    contact_number = models.CharField(
        _("Contact Number"), max_length=50, null=True, blank=True)
    contact_number_type = models.CharField(
        _("Contact Number Type"),
        max_length=50,
        null=True, blank=True
    )
    is_contact_number_reachable_by_text = models.BooleanField(
        _("Can you accept texts if you can’t be reached by phone?"), null=True, blank=True)

    email_address = models.EmailField(
        _("Email Address"), max_length=254, null=True, blank=True)
    street_address = models.TextField(
        _("Street Address"), null=True, blank=True)
    # Selectbox selected
    city = models.CharField(_("City"), max_length=50, null=True, blank=True)
    # User entered in case of other
    city_entered = models.CharField(_("Other City ? Enter Here"), max_length=50, null=True, blank=True)
    state = models.CharField(_("State"), max_length=50, null=True, blank=True)
    zip_code = models.CharField(_("Zip"), max_length=20, null=True, blank=True)

    # List of Languages
    primary_language = models.CharField(
        _("Primary Language"), max_length=50, null=True, blank=True)
    # Enter by user
    primary_langauge_entered = models.CharField(
        _("Enter Langauge"), max_length=50, null=True, blank=True)

    marital_status = models.CharField(
        _("Marital Status"),
        max_length=50,
        null=True, blank=True
    )
    ethnicity = models.CharField(
        _("Ethnicity"),
        max_length=50,
        null=True, blank=True
    )
    race = models.CharField(
        _("Race"),
        max_length=50,
        null=True, blank=True
    )
    is_veteran = models.BooleanField(
        _("Are you a Veteran?"), default=False, null=True, blank=True)

    emergency_contact_name = models.CharField(
        _("Emergency Contact Name"), max_length=50, null=True, blank=True)
    emergency_contact_number = models.CharField(
        _("Emergency Contact Number"), max_length=50, null=True, blank=True)
    # Select box chosen entry
    emergency_contact_relationship = models.CharField(
        _("Emergency Contact Relationship"), max_length=50, null=True, blank=True)
    # User entered entry
    emergency_contact_relationship_entered = models.CharField(
        _("Emergency Contact Relationship Entered"), max_length=50, null=True, blank=True)

    employment_status = models.CharField(
        _("Employment Status"),
        max_length=50,
        null=True, blank=True
    )
    homeless_status = models.CharField(
        _("Homeless Status"),
        max_length=50,
        null=True, blank=True
    )
    farmworker_status = models.CharField(
        _("Farmworker Status"),
        max_length=50,
        null=True, blank=True
    )

    guarantor_name = models.CharField(
        _("Guarantor Name"), max_length=50, null=True, blank=True)
    is_guarantor_details_declined = models.BooleanField(_("Is Guarantor Details Declined ?"),null=True, default=False)
    # Select box entry
    guarantor_relationship = models.CharField(
        _("Guarantor Relationship"), max_length=50, null=True, blank=True)
    # User entered entry
    guarantor_relationship_entered = models.CharField(
        _("Other Guarantor Relationship ? Enter it here"), max_length=50, null=True, blank=True)
    guarantor_date_of_birth = models.CharField(
        _("Guarantor Date of Birth"), max_length=50, null=True, blank=True)
    # guarantor_date_of_birth = models.DateField(
    #     _("Guarantor Date of Birth"), auto_now=False, auto_now_add=False, null=True, blank=True)

    family_size = models.CharField(
        _("Family Size"), max_length=50, null=True, blank=True)
    household_income = models.CharField(
        _("Household Income"), max_length=50, null=True, blank=True)
    is_household_income_declined = models.BooleanField(
        _("Is Household Income Decline to answer ?"), null=True, blank=True)
    income_frequency = models.CharField(
        _("Income Frequency"),
        max_length=50,
        null=True, blank=True
    )

    primary_insurance_carrier = models.CharField(
        _("Primary Insurance Carrier"), max_length=50, null=True, blank=True)
    is_not_insured = models.BooleanField(
        _("Not Insured"), default=False, null=True, blank=True)
    subscriber_id = models.CharField(
        _("Subscriber ID"), max_length=50, null=True, blank=True)
    group_number = models.CharField(
        _("Group Number (if applicable)"), max_length=50, null=True, blank=True)
    subscriber_name = models.CharField(
        _("Subscriber Name (First and Last)"), max_length=100, null=True, blank=True)
    # Select box selected
    subscriber_relationship = models.CharField(
        _("Subscriber Relationship"), max_length=100, null=True, blank=True)
    # User entered entry, other option.
    subscriber_relationship_entered = models.CharField(
        _("Other Subscriber Relationship ? Enter it here"), max_length=100, null=True, blank=True)

    identification_document = models.CharField(
        _("Identification Document"), max_length=50, null=True, blank=True)
    attachment_support = models.FileField(
        _("Attachment support"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    insurance_card = models.FileField(
        _("Insurance Card (Front)"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)
    insurance_card_back = models.FileField(
        _("Insurance Card (Back)"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    is_declaration_accepted = models.BooleanField(
        _("Is Declaration accepted ?"), null=True, blank=True)

    description = models.TextField(
        _("Description"), null=True, blank=True)

    is_slot_created_by_staff = models.BooleanField(
        _("Is Slot Created By Staff"), default=False, null=True, blank=True)

    id_from_patient_call_details_table =  models.CharField(
        _("ID From KHS Patient Call Details Table"), max_length=50, null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)
    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("KHSAppointment")
        verbose_name_plural = _("KHSAppointments")

    def __str__(self):
        return self.last_name or '------'

    def get_absolute_url(self):
        return reverse_lazy("bookingforms:success_page")

class KHSAppointmentLock(models.Model):
    user_fk = models.ForeignKey(User, on_delete=models.PROTECT)
    appointment_fk = models.ForeignKey(KHSAppointment, on_delete=models.PROTECT)


class UploadUrlModel(models.Model):

    patient_first_name = models.CharField(
        ("Patient First Name"),
        max_length=100, null=True, blank=True)

    patient_last_name =  models.CharField(
        ("Patient Last Name"),
        max_length=100, null=True, blank=True)

    date_of_birth =  models.DateField(("Date Of Birth"),null=True, blank=True)

    phone_number =  models.CharField(("Phone Number"),max_length=100, null=True, blank=True)

    is_resolved = models.BooleanField(default=False)

    resolved_by = models.CharField(
        ("Resolved By"), max_length=100, null=True, blank=True)

    identification_document = models.CharField(("Identification Document"), max_length=50, null=True, blank=True)

    attachment_support = models.FileField(("Attachment support"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    insurance_card = models.FileField(("Insurance Card (Front)"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    insurance_card_back = models.FileField(("Insurance Card (Back)"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_1 = models.FileField(("File 1"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_2 = models.FileField(("File 2"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_3 = models.FileField(("File 3"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_4 = models.FileField(("File 4"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_5 = models.FileField(("File 5"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = ("UploadUrlModel")
        verbose_name_plural = ("UploadUrlModels")

    def __str__(self):
        return self.patient_first_name or '------'

    def get_absolute_url(self):
       return reverse_lazy("bookingforms:upload_success_page")

class KHSPatientDetails(models.Model):

    cin = models.CharField(_("CIN"),max_length=100, null=True, blank=True)

    member_name = models.CharField(_("Member Name"),max_length=100, null=True, blank=True)
    
    dob = models.DateField(_("DOB"),null=True, blank=True)

    age = models.CharField(_("Age"),max_length=50, null=True, blank=True)

    gender = models.CharField(_("Gender"),max_length=50,null=True, blank=True)

    primary_phone = models.CharField(_("Primary Phone"),max_length=50, null=True, blank=True)

    secondary_phone =  models.CharField(_("Secondary Phone"),max_length=50, null=True, blank=True)

    address = models.CharField(_("Address"),max_length=250, null=True, blank=True)

    city = models.CharField(_("City"),max_length=100, null=True, blank=True)

    state = models.CharField(_("State"),max_length=100, null=True, blank=True)

    zip = models.CharField(_("ZIP"),max_length=100, null=True, blank=True)

    pcp_id = models.CharField(_("PCP ID"),max_length=100, null=True, blank=True)

    pcp_name = models.CharField(_("PCP Name"),max_length=250,null=True, blank=True)

    manufacturer = models.CharField(_("Manufacturer"),max_length=100,null=True, blank=True)

    vaccination_status = models.CharField(_("Vaccination Status"),max_length=100,null=True, blank=True)

    MRN = models.CharField(_("MRN"),max_length=100,null=True, blank=True)

    epic_phone = models.CharField(_("Epic Phone"),max_length=50,null=True, blank=True)

    send_sms = models.BooleanField(_("Send SMS"),null=True, blank=True)

    test_messaging = models.CharField(_("Test Messaging"),max_length=50,null=True, blank=True)

    patient_category = models.CharField(_("Patient Category"),max_length=50,null=True, blank=True)

    preferred_language = models.CharField(_("Preferred Language"),max_length=50,null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("KHS Paitent Detail")
        verbose_name_plural = _("KHS Paitent Details")

    def __str__(self):
        return self.cin or '------'

class KHSPatientCallDetails(models.Model):

    patient = models.ForeignKey(KHSPatientDetails,on_delete=models.PROTECT)

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

    comments = models.TextField(_("Comments"),null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("KHS Patient Call Detail")
        verbose_name_plural = _("KHS Patient Call Details")

    def __str__(self):
        return self.patient.cin or '------'
 