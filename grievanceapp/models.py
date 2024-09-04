from django.db import models
from django.urls import reverse_lazy
from django.conf import settings
# Create your models here.


def is_captcha_required():
    # Not needed for developer
    return not settings.DEBUG

class Grievance(models.Model):

    patient_first_name = models.CharField(
        ("Patient First Name"),
        max_length=100, null=True, blank=True)

    patient_last_name =  models.CharField(
        ("Patient Last Name"),
        max_length=100, null=True, blank=True)

    date_of_event =  models.DateField(("Date Of Event"),null=True, blank=True)

    date_of_birth =  models.DateField(("Date Of Birth"),null=True, blank=True)

    phone_number =  models.CharField(("Phone Number"),max_length=100, null=True, blank=True)

    who_was_involoved =  models.CharField(
        ("Who Was Involved"),
        max_length=100, null=True, blank=True)

    grievance_report_type =  models.CharField(
        ("Grievance Report Type"),
        max_length=100, null=True, blank=True)

    service_type =  models.CharField(
        ("Service Type"),
        max_length=100, null=True, blank=True)

    site = models.CharField(
        ("Site"),
        max_length=100, null=True, blank=True)

    county = models.CharField(
        ("County"), max_length=100, null=True, blank=True)
    
    event_type = models.CharField(
        ("Event type"),
        max_length=100,
        null=True, blank=True
    )

    health_plan = models.CharField(
        ("Health plan"), max_length=100, null=True, blank=True)
        
    provider_mentioned = models.CharField(
        ("Provider mentioned"), max_length=100, null=True, blank=True)

    comments = models.TextField(
        ("Comments"),  null=True, blank=True)

    steps_taken_to_resolve_this_issue = models.TextField(
        ("Steps Taken to resolve this issue"),  null=True, blank=True)

    outcome_resolution = models.TextField(
        ("Outcome/Resolution"),  null=True, blank=True)

    is_resolved = models.BooleanField(default=False)

    resolved_by = models.CharField(
        ("Resolved By"), max_length=100, null=True, blank=True)

    resolving_comments = models.TextField(
        ("Resolving Comments"),  null=True, blank=True)
    
    created_by = models.CharField(
        ("Created By"), max_length=100, null=True, blank=True)

    file_1 = models.FileField(("File 1"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_2 = models.FileField(("File 2"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_3 = models.FileField(("File 3"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_4 = models.FileField(("File 4"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_5 = models.FileField(("File 5"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = ("Grievance")
        verbose_name_plural = ("Grievances")

    def __str__(self):
        return self.county or '------'

    def get_absolute_url(self):
        return reverse_lazy("grievanceapp:success_page")
# Create your models here.
class MultipleComments(models.Model):

    record = models.ForeignKey(Grievance,on_delete=models.CASCADE)

    multiple_comments = models.TextField(("Multiple Comment"), max_length=100, null=True, blank=True)

    staff =  models.CharField(("Staff"), max_length=100, null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = ("Comment")
        verbose_name_plural = ("Comments")
    
    def __str__(self):
        return self.record.county or '------'

class IncidentReport(models.Model):
    letter_signed_date = models.DateField(("Letter Signed Date"),null=True, blank=True)

    letter_sent_date =  models.DateField(("Letter Sent Date"),null=True, blank=True)

    service_line =  models.CharField(("Service Line"),max_length=100, null=True, blank=True)

    first_name =  models.CharField(("First Name"),max_length=100, null=True, blank=True)

    last_name =  models.CharField(("Last Name"),max_length=100, null=True, blank=True)

    mrn =  models.CharField(("MRN"),max_length=100, null=True, blank=True)

    phone_number =  models.CharField(("Phone Number"),max_length=100, null=True, blank=True)

    scanned_date = models.DateField(("Scanned Date"),max_length=100, null=True, blank=True)

    county =  models.CharField(("County"),max_length=100, null=True, blank=True)

    location_site = models.CharField(("Location/Site"),max_length=100, null=True, blank=True)

    ethnicity_race = models.CharField(("Ethnicity/Race"),max_length=100, null=True, blank=True)

    severity = models.CharField(("Severity"),max_length=100, null=True, blank=True)

    level_of_intervention =  models.CharField(("Level of Intervention"),max_length=100, null=True, blank=True)

    is_resolved = models.BooleanField(("Is Resolved?"),default=False)

    resolved_by = models.CharField(("Resolved By"), max_length=100, null=True, blank=True)

    resolving_comments = models.TextField(("Resolving Comments"),  null=True, blank=True)
    
    created_by = models.CharField(("Created By"), max_length=100, null=True, blank=True)

    file_1 = models.FileField(("File 1"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_2 = models.FileField(("File 2"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_3 = models.FileField(("File 3"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_4 = models.FileField(("File 4"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_5 = models.FileField(("File 5"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = ("Incident Report")
        verbose_name_plural = ("Incident Reports")

    def __str__(self):
        return self.first_name or '------'

    def get_absolute_url(self):
        return reverse_lazy("grievanceapp:success_page_standard_of_behaviour")

class MultipleCommentsIncidentReporting(models.Model):

    record = models.ForeignKey(IncidentReport,on_delete=models.CASCADE)

    multiple_comments = models.TextField(("Multiple Comment"), max_length=100, null=True, blank=True)

    staff =  models.CharField(("Staff"), max_length=100, null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = ("Indicent Report Comment")
        verbose_name_plural = ("Indicent Report Comments")
    
    def __str__(self):
        return self.record.first_name or '------'


class Compliance(models.Model):

    patient_first_name = models.CharField(
        ("Patient First Name"),
        max_length=100, null=True, blank=True)

    patient_last_name =  models.CharField(
        ("Patient Last Name"),
        max_length=100, null=True, blank=True)

    date_of_event =  models.DateField(("Date Of Event"),null=True, blank=True)

    date_of_birth =  models.DateField(("Date Of Birth"),null=True, blank=True)

    phone_number =  models.CharField(("Phone Number"),max_length=100, null=True, blank=True)

    who_was_involoved =  models.CharField(
        ("Who Was Involved"),
        max_length=100, null=True, blank=True)

    report_type =  models.CharField(
        ("Report Type"),
        max_length=100, null=True, blank=True)

    service_type =  models.CharField(
        ("Service Type"),
        max_length=100, null=True, blank=True)

    site = models.CharField(
        ("Site"),
        max_length=100, null=True, blank=True)

    county = models.CharField(
        ("County"), max_length=100, null=True, blank=True)
    
    event_type = models.CharField(
        ("Event type"),
        max_length=100,
        null=True, blank=True
    )
        
    provider_mentioned = models.CharField(
        ("Provider mentioned"), max_length=100, null=True, blank=True)

    comments = models.TextField(
        ("Comments"),  null=True, blank=True)

    steps_taken_to_resolve_this_issue = models.TextField(
        ("Steps Taken to resolve this issue"),  null=True, blank=True)

    outcome_resolution = models.TextField(
        ("Outcome/Resolution"),  null=True, blank=True)

    is_resolved = models.BooleanField(default=False)

    resolved_by = models.CharField(
        ("Resolved By"), max_length=100, null=True, blank=True)

    resolving_comments = models.TextField(
        ("Resolving Comments"),  null=True, blank=True)
    
    created_by = models.CharField(
        ("Created By"), max_length=100, null=True, blank=True)

    file_1 = models.FileField(("File 1"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_2 = models.FileField(("File 2"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_3 = models.FileField(("File 3"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_4 = models.FileField(("File 4"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_5 = models.FileField(("File 5"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = ("Compliance")
        verbose_name_plural = ("Compliances")

    def __str__(self):
        return self.county or '------'

    def get_absolute_url(self):
        return reverse_lazy("grievanceapp:success_page_complaint")

class MultipleCommentsCompliance(models.Model):

    record = models.ForeignKey(Compliance,on_delete=models.CASCADE)

    multiple_comments = models.TextField(("Multiple Comment"), max_length=100, null=True, blank=True)

    staff =  models.CharField(("Staff"), max_length=100, null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = ("Compliance Comment")
        verbose_name_plural = ("Compliance Comments")
    
    def __str__(self):
        return self.record.county or '------'

class County(models.Model):

        app_name = models.CharField(("App Name"),max_length=20)
        county= models.CharField(("County"), max_length=20)

        def __str__(self):
            return self.county

class Location(models.Model):

        location=models.CharField(("Location"), max_length=100)
        county = models.ForeignKey(County, on_delete=models.CASCADE)

        def __str__(self):
            return self.location