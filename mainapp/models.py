from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.postgres.fields import ArrayField
# Create your models here.

class Apps(models.Model):

    app_name =  models.CharField(("App Name"), max_length=200)

    app_type = models.CharField(("App Type"), max_length=200)

    point_of_contact = models.CharField(("Point of Contact"), max_length=200, null=True, blank=True)

    domain_name = models.CharField(("Domain Name"), max_length=200, null=True, blank=True)

    info_text = models.TextField(("Info Text"), null=True, blank=True)

    is_hidden = models.BooleanField(("Is Hidden"),default=False)

    app_logo =  models.FileField(("App Logo"),upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True, default='media/uploads/na3ohXaeOhleeng7/phone.png')

    modified_by = models.CharField(("Modified By"), max_length=200,null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    subscription = models.IntegerField(default=-1)

    tenant_app_id = models.IntegerField(blank=True, null=True)

    class Meta:
        verbose_name = ("App")
        verbose_name_plural = ("Apps")

    def __str__(self):
        return self.app_name

class AppsButtons(models.Model):

    app =  models.ForeignKey(Apps, on_delete=models.CASCADE)

    button_text = models.CharField(("Button Text"), max_length=200)

    button_href = models.CharField(("Button href"), max_length=200, null=True, blank=True)

    modified_by = models.CharField(("Modified By"), max_length=200,null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    tenant_button_id = models.IntegerField(blank=True, null=True)


    class Meta:
        verbose_name = ("App Button")
        verbose_name_plural = ("App Buttons")

    def __str__(self):
        return self.app.app_name



class FavouriteApps(models.Model):

    user = models.ForeignKey(User,on_delete=models.CASCADE)

    app =  models.ForeignKey(Apps, default=None,null=True,blank=True,on_delete=models.CASCADE)

    created_datetime = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = ("Favourite App")
        verbose_name_plural = ("Favourite Apps")

    def __str__(self):
        return self.user.username

class AppAccessData(models.Model):

    user = models.ForeignKey(User,on_delete=models.CASCADE)

    app_name =  models.CharField(("App Name"), max_length=200)
    
    app_specific_page_name = models.CharField(("App Specific Page Name"), max_length=200)

    action =  models.CharField(("action"),max_length=100, null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = ("App Access Data")
        verbose_name_plural = ("App Access Datas")

    def __str__(self):
        return self.user.username

class AppOrdering(models.Model):

    user = models.ForeignKey(User,on_delete=models.CASCADE)

    app =  models.ForeignKey(Apps,on_delete=models.CASCADE)
    
    order = models.CharField(("Order"), max_length=200, null=True,blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = ("App Ordering")
        verbose_name_plural = ("Apps Ordering")

    def __str__(self):
        return self.user.username

class Location(models.Model):

        name=models.CharField(("Location"), max_length=100)

        def __str__(self):
            return self.name

class AppLocation(models.Model):

        app = models.ForeignKey(Apps, on_delete=models.CASCADE)
        location=models.ForeignKey(Location, on_delete=models.CASCADE)

        def __str__(self):
            return self.location.name

class QualityServices(models.Model):

        quality=models.CharField(("Quality"), max_length=100)
        field_name=models.CharField(("Field Name"), max_length=100)
        field_value=models.CharField(("Field Value"), max_length=100)

        def __str__(self):
            return self.field_value

class RequiredFields(models.Model):
    
    app_name =  models.ForeignKey(Apps, on_delete=models.CASCADE)

    all_columns = ArrayField(models.CharField(("All columns"),max_length=250, blank=True,null=True),size=50,blank=True,null=True)

    required_columns = ArrayField(models.CharField(("Required columns"),max_length=250, blank=True,null=True),size=50,blank=True,null=True)

    def __str__(self):
            return self.app_name
    
class PasswordResetOTP(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    otp =  models.CharField(("OTP"),max_length=100, null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

class UserAssignedLocations(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    app = models.ForeignKey(Apps, on_delete=models.CASCADE)

    location = models.ForeignKey(Location, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username

class OrganisationSSO(models.Model):

    client_id = models.CharField(("Client ID"),max_length=200)

    secret_id = models.CharField(("Secret ID"),max_length=200)

    tenant_id = models.CharField(("Tenant ID"),max_length=200)
    
    def __str__(self):
        return "SSO"

class AppAdmins(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    app = models.ForeignKey(Apps, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    email_confirmed = models.BooleanField(default=False)
    # other fields...

@receiver(post_save, sender=User)
def update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    instance.profile.save()

class Form(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()

class Field(models.Model):
    TEXT = 'text'
    EMAIL = 'email'
    NUMBER = 'number'
    CHECKBOX = 'checkbox'
    RADIO = 'radio'
    SELECT = 'select'
    TEXTAREA = 'textarea'
    DATE = 'date'
    FIELD_TYPE_CHOICES = [
        (TEXT, 'Text Field'),
        (EMAIL, 'Email Field'),
        (NUMBER, 'Number Field'),
        (CHECKBOX, 'Checkbox Field'),
        (RADIO, 'Radio Field'),
        (SELECT, 'Select Field'),
        (TEXTAREA, 'Textarea Field'),
        (DATE, 'Date Field'),
    ]
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='fields')
    field_type = models.CharField(max_length=255)
    label = models.CharField(max_length=255)
    options = models.CharField(max_length=200, blank=True)
    class Meta:
        ordering = ['id']

class FormSubmission(models.Model):
    form_name = models.CharField(max_length=100)
    form_data = models.JSONField()
    submission_date = models.DateTimeField(auto_now_add=True)