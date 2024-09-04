from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
# Create your models here.

class VaccineManagementList(models.Model):

    name =  models.CharField(("Name"), max_length=80)

    title = models.CharField(("Title"), max_length=250)

    text = models.TextField(("Text"),null=True, blank=True)

    checkbox_one_text = models.CharField(("Checkbox One Text"), max_length=250,null=True, blank=True)

    checkbox_one_file_upload = models.BooleanField(("Checkbox One File Upload"),null=True, blank=True, default=False)

    is_file_upload_one_required = models.BooleanField(("Is file upload one required"), default=True)

    checkbox_two_text = models.CharField(("Checkbox Two Text"), max_length=250,null=True, blank=True)

    checkbox_two_file_upload = models.BooleanField(("Checkbox two File Upload"),null=True, blank=True, default=False)

    is_file_upload_two_required = models.BooleanField(("Is file upload two required"), default=True)

    checkbox_three_text = models.CharField(("Checkbox Three Text"), max_length=250,null=True, blank=True)

    checkbox_three_file_upload = models.BooleanField(("Checkbox Three File Upload"),null=True, blank=True, default=False)

    is_file_upload_three_required = models.BooleanField(("Is file upload three required"), default=True)

    acknowledgement_title = models.CharField(("Acknowledgement Title"), max_length=250,null=True, blank=True)

    acknowledgement_text = models.TextField(("Acknowledgement Text"),null=True, blank=True)

    max_file_size = models.IntegerField(("Maximum File Size"), null=True, blank=True)

    max_file_upload = models.IntegerField(("Maximum File Upload"), null=True, blank=True)

    file_type = models.CharField(("File Format"),max_length=250, null=True, blank=True)

    is_published = models.BooleanField(("Is Published ?"),default=True)

    allow_exemption_submission = models.BooleanField(("Allow Execmption Submission ?"),default=False)

    created_by = models.CharField(("Created By"), max_length=80)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = ("Vaccine Management List")
        verbose_name_plural = ("Vaccine Management Lists")

    def __str__(self):
        return self.name or ''
    
class Employee(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE)

    position_id =  models.CharField(
        ("Position ID"),
        max_length=100, null=True, blank=True)

    reports_to_name =  models.CharField(
        ("Reports To Name"),
        max_length=100, null=True, blank=True)
    
    payroll_name =  models.CharField(
        ("Payroll Name"),
        max_length=100, null=True, blank=True)
    
    birth_date =  models.DateField(
        ("Birth Date"), null=True, blank=True)
    
    position_status =  models.CharField(
        ("Position Status"),
        max_length=100, null=True, blank=True)
    
    worker_category_description =  models.CharField(
        ("Worker Category Description"),
        max_length=100, null=True, blank=True)
    
    job_title_description =  models.CharField(
        ("Job Title Description"),
        max_length=250, null=True, blank=True)
    
    hire_date =  models.DateField(
        ("Hire Date"), null=True, blank=True)

    region =  models.CharField(
        ("Region"),max_length=100, null=True, blank=True)
    
    eeo_establishment =  models.CharField(
        ("EEO Establishment"),
        max_length=100, null=True, blank=True)
    
    job_function_description =  models.CharField(
        ("Job Function Description"),
        max_length=250, null=True, blank=True)
    
    home_department_description=  models.CharField(
        ("Home Department Description"),
        max_length=250, null=True, blank=True)
    
    union_code_description =  models.CharField(
        ("Union Code Description"),
        max_length=100, null=True, blank=True)
    
    email =  models.CharField(
        ("Email"),
        max_length=100, null=True, blank=True)
    
    is_active = models.BooleanField(("Is Active"), null=True, blank=True, default=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = ("Employee")
        verbose_name_plural = ("Employees")

    def __str__(self):
        return self.position_id or '------'
    
class EmployeeVaccination(models.Model):

    vaccine = models.ForeignKey(VaccineManagementList, on_delete=models.CASCADE)

    user = models.ForeignKey(Employee, on_delete=models.CASCADE)

    is_proof_or_vaccination_copy_provided = models.BooleanField(("Is Proof Or Vaccination Copy Provided?"), null=True, blank=True)

    allow_csv_to_pull_record = models.BooleanField(("Allow CSV To Pull EPIC Medical Record Or CAIR record"), null=True, blank=True)

    is_vaccine_declined = models.BooleanField(("Vaccination Declined?"), null=True, blank=True)

    file_1 = models.FileField(("File 1"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_1_status = models.BooleanField(("File 1 Status"), null=True, blank=True)

    file_2 = models.FileField(("File 2"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_2_status = models.BooleanField(("File 2 Status"), null=True, blank=True)

    file_3 = models.FileField(("File 3"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_3_status = models.BooleanField(("File 3 Status"), null=True, blank=True)

    signature_data =  models.TextField(("Signature"),null=True, blank=True)

    is_approved_by_staff = models.BooleanField(("Is Approved by staff"), null=True, blank=True)

    user_submission_datetime = models.DateTimeField(("User Submission Date Time"), null=True, blank=True)

    
class CovidTesting(models.Model):

    employee = models.ForeignKey(Employee,on_delete=models.CASCADE)

    test_date =  models.DateField(("Test Date"), null=True, blank=True)

    due_date = models.DateField(("Due Date"), null=True, blank=True)

    delayed = models.CharField(("Delayed"), max_length=10, null=True, blank=True)

    is_tested = models.BooleanField(("Is Tested"), null=True, blank=True)

    test_result = models.CharField(("Test Result"),  max_length=100,null=True, blank=True)

    comments = models.TextField(("Comments"),null=True, blank=True)

    staff = models.CharField(("Staff"), max_length=100, null=True, blank=True)

    pto_count = models.IntegerField(("PTO Count"), null=True, blank=True)

    skip = models.BooleanField(("is Skipped"), null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = ("CovidTest")
        verbose_name_plural = ("CovidTests")

    def __str__(self):
        return self.employee.position_id or ''

class VaccineExemption(models.Model):

    user = models.OneToOneField(Employee, on_delete=models.CASCADE)

    type_of_exemption = models.CharField(("Type of Exemption"), max_length=50, null=True, blank=True)

    file_1 = models.FileField(("File 1"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_1_status = models.BooleanField(("File 1 Status"), null=True, blank=True)

    file_2 = models.FileField(("File 2"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_2_status = models.BooleanField(("File 2 Status"), null=True, blank=True)
    
    file_3 = models.FileField(("File 3"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)
    
    file_3_status = models.BooleanField(("File 3 Status"), null=True, blank=True)

    signature =  models.TextField(("Signature"),null=True, blank=True)

    exemption_text =  models.TextField(("Exemption Text"),null=True, blank=True)

    staff = models.CharField(("Staff"), max_length=100, null=True, blank=True)

    reviewed_date = models.DateField(("Reviewed Date"), null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = ("VaccineExemption")
        verbose_name_plural = ("VaccineExemptions")

    def __str__(self):
        return self.user.position_id or '------'


class CovidWeeklyEmployeeList(models.Model):

    employee = models.ForeignKey(Employee,on_delete=models.CASCADE)

    due_date = models.DateField(("Due Date"), null=True, blank=True)

    pto_date = models.DateField(("PTO Date"), null=True, blank=True)

    skip = models.BooleanField(("Is Skipped this Week"), null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = ("CovidWeeklyEmployeeList")
        verbose_name_plural = ("CovidWeeklyEmployeeList")

    def __str__(self):
        return self.employee.position_id or '----'

class CovidBooster(models.Model):

    position_id = models.CharField(("Position ID"),max_length=50, null=True, blank=True)

    first_name = models.CharField(("First Name"), max_length=50, null=True, blank=True)

    last_name = models.CharField(("Last Name"),max_length=50, null=True, blank=True)

    birth_date = models.DateField(("Birth Date"), null=True, blank=True)

    shot_one = models.DateField(("Shot One"), null=True, blank=True)

    shot_two = models.DateField(("Shot Two"), null=True, blank=True)
    
    booster_one = models.DateField(("Booster One"), null=True, blank=True)
    
    date_eligible_for_booster = models.DateField(("Date Eligible for Booster"), null=True, blank=True)

    dead_line = models.DateField(("Dead Line"), null=True, blank=True)

    status = models.CharField(("Status"),max_length=100, null=True, blank=True)

    position_status = models.CharField(("Position Status"),max_length=50, null=True, blank=True)

    job_title_code =  models.CharField(("Job Title Code"),max_length=100, null=True, blank=True)

    job_title_description =  models.CharField(("Job Title Description"),max_length=250, null=True, blank=True)

    home_department_description=  models.CharField(("Home Department Description"),max_length=250, null=True, blank=True)

    location_description =  models.CharField(("Location Description"),max_length=250, null=True, blank=True)

    region =  models.CharField(("Region"),max_length=100, null=True, blank=True)

    worker_category_description =  models.CharField(("Worker Category Description"),max_length=250, null=True, blank=True)

    hire_date = models.DateField(("Hire Date"), null=True, blank=True)

    rehire_date = models.DateField(("Rehire Date"), null=True, blank=True)

    flsa_description = models.CharField(("FLSA Description"), max_length=100, null=True, blank=True)

    reports_to = models.CharField(("Reports To"), max_length=100, null=True, blank=True)

    job_function_description =  models.CharField(("Job Function Description"),max_length=250, null=True, blank=True)

    email = models.CharField(("Email"), max_length=150, null=True, blank=True)

    pay_rule = models.CharField(("Pay Rule"), max_length=50, null=True, blank=True)

    position_start_date = models.DateField(("Position Start Date"), null=True, blank=True)

    personal_mobile = models.CharField(("Personal Mobile"), max_length=50, null=True, blank=True)

    home_phone = models.CharField(("Home Phone"), max_length=50, null=True, blank=True)
    
    file_1 = models.FileField(("File 1"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    file_1_status = models.BooleanField(("File 1 Status"), null=True, blank=True)

    signature = models.TextField(("Signature"),null=True, blank=True)

    comments = models.TextField(("Comments"), null=True, blank=True)

    verified_by = models.CharField(("Verified By"), max_length=100, null=True, blank=True)

    shot_one_added_by_emp = models.DateField(("Shot One Added By Employee"), null=True, blank=True)

    shot_two_added_by_emp = models.DateField(("Shot Two Added By Employee"), null=True, blank=True)

    shot_three_added_by_emp = models.DateField(("Shot Three Added By Employee"), null=True, blank=True)

    exemption_type =  models.CharField(("Exemption Type"), max_length=50, null=True, blank=True)

    religious_exemption_text =  models.TextField(("Religious Exemption Text"),null=True, blank=True)

    employee_submission_datetime = models.DateTimeField(("Employee Submission Datetime"), null=True,blank=True)

    employee_submitted_option = models.CharField(("Employee Submitted Option"), max_length=50, null=True,blank=True)

    forced_move_status = models.CharField(("Forced Move Status"), max_length=50, null=True,blank=True)

    vaccine_type = models.CharField(("Vaccine Type"), max_length=50, null=True,blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = ("CovidBooster")
        verbose_name_plural = ("CovidBooster")

    def __str__(self):
        return self.position_id or '------'

class CovidBoosterTesting(models.Model):

    employee = models.ForeignKey(CovidBooster,on_delete=models.CASCADE)

    test_date =  models.DateField(("Test Date"), null=True, blank=True)

    due_date = models.DateField(("Due Date"), null=True, blank=True)

    delayed = models.CharField(("Delayed"), max_length=10, null=True, blank=True)

    is_tested = models.BooleanField(("Is Tested"), null=True, blank=True)

    test_result = models.CharField(("Test Result"),  max_length=100,null=True, blank=True)

    comments = models.TextField(("Comments"),null=True, blank=True)

    staff = models.CharField(("Staff"), max_length=100, null=True, blank=True)

    pto_count = models.IntegerField(("PTO Count"), null=True, blank=True)

    skip = models.BooleanField(("is Skipped"), null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = ("CovidBoosterTest")
        verbose_name_plural = ("CovidBoosterTests")

    def __str__(self):
        return self.employee.position_id or ''

class CovidBoosterWeeklyEmployeeList(models.Model):

    employee = models.ForeignKey(CovidBooster,on_delete=models.CASCADE)

    due_date = models.DateField(("Due Date"), null=True, blank=True)

    pto_date = models.DateField(("PTO Date"), null=True, blank=True)

    skip = models.BooleanField(("Is Skipped this Week"), null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = ("CovidBoosterWeeklyEmployeeList")
        verbose_name_plural = ("CovidBoosterWeeklyEmployeeList")

    def __str__(self):
        return self.employee.position_id or '----'