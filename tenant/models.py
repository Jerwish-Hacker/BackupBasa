from django.db import models
from django_tenants.models import TenantMixin, DomainMixin
from django.contrib.auth.models import User
from django.conf import settings
from mainapp.models import Apps
from django.utils.translation import gettext as _

class Client(TenantMixin):
    admin_user = models.CharField(("Admin User"), max_length=100)
    name = models.CharField(("Organisation Name"),max_length=100)
    paid_until = models.DateField(("Paid Until"))
    on_trial = models.BooleanField(("On Trail ?"))
    created_on = models.DateField(auto_now_add=True)
    created_datetime = models.DateTimeField(auto_now_add=True)
    subscription = models.IntegerField(("Subscription"),default=0)
    status = models.BooleanField(("Status"),default=True)
    logo = models.ImageField(upload_to=settings.UPLOAD_TO_FOLDER, null=True, blank=True)
    title_logo = models.ImageField(upload_to=settings.UPLOAD_TO_FOLDER, null=True, blank=True)

class Domain(DomainMixin):
    pass

class AppPermissionGroups(models.Model):

    app_name = models.ForeignKey(Apps, on_delete=models.CASCADE)

    group_name = models.CharField(("Group Name"), max_length=100)

    subscription = models.IntegerField(("Subscription"),default=0)

    def __str__(self):
        return self.app_name.app_name
    
class MemberPatient(models.Model):

    identifier = models.CharField(_("Identifier"), max_length=50, null=True, blank=True)

    identifier_system = models.CharField(_("Identifier System"), max_length=50, null=True, blank=True)

    active =  models.BooleanField(_("Active"), null=True, blank=True)
    
    name_given = models.CharField(_("Given Name"), max_length=100, null=True, blank=True)

    name_family = models.CharField(_("Family Name"), max_length=100, null=True, blank=True)

    name_prefix = models.CharField(_("Prefix Name"), max_length=100, null=True, blank=True)

    name_suffix = models.CharField(_("Suffix Name"), max_length=100, null=True, blank=True)

    contact_value = models.CharField(_("Contact Value"),max_length=100, null=True, blank=True)

    contact_use = models.CharField(_("Contact Use"),max_length=100, null=True, blank=True)

    gender = models.CharField(_("Gender"),max_length=100, null=True, blank=True)
    
    birthDate = models.DateField(_("Date of Birth"),null=True, blank=True)

    email = models.CharField(_("Email"), max_length=100, null=True, blank=True)

    preferred_language = models.CharField(_("Preferred Language"), max_length=100, null=True, blank=True)

    address_use = models.CharField(_("Address Use"),max_length=100, null=True, blank=True)

    address_line = models.CharField(_("Address Line"),max_length=100, null=True, blank=True)

    address_city = models.CharField(_("Address City"),max_length=100, null=True, blank=True)

    address_district = models.CharField(_("Address District"),max_length=100, null=True, blank=True)

    address_state = models.CharField(_("Address State"),max_length=100, null=True, blank=True)

    address_postalCode = models.CharField(_("Address Zip"),max_length=100, null=True, blank=True)

    address_country = models.CharField(_("Address Country"),max_length=100, null=True, blank=True)

    photo = models.FileField(("Photo"),upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True, default='media/uploads/na3ohXaeOhleeng7/phone.png')

    #photo = models.CharField(_("Photo"),max_length=100, null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Member Patient")
        verbose_name_plural = _("Member Patients")

    def __str__(self):
        return self.name_given or '------'
    
class TenantMembers(models.Model):

    member = models.ForeignKey(MemberPatient, on_delete=models.CASCADE)

    tenant = models.ForeignKey(Client, on_delete=models.CASCADE)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Tenant Member")
        verbose_name_plural = _("Tenant Members")

    def __str__(self):
        return self.member.name_given or '------'
    
class MemberConsent(models.Model):

    member = models.ForeignKey(MemberPatient, on_delete=models.CASCADE)

    tenant = models.ForeignKey(Client, on_delete=models.CASCADE)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Member Consent")
        verbose_name_plural = _("Member Consents")

    def __str__(self):
        return self.member.name_given or '------'


class MemberConsentHistory(models.Model):

    member_consent = models.ForeignKey(MemberConsent, on_delete=models.CASCADE)

    consent_status = models.BooleanField(_("Consent Status"), null=True, blank=True)

    consent_duration = models.DateField(_("Consent Duration"), blank=True, null=True)

    purpose_of_data_sharing = models.CharField(_("Purpose of Data Sharing"), max_length=100, null=True, blank=True)

    sharing_with_provider = models.CharField(_("Sharing with Provider"), max_length=100, null=True, blank=True)

    sharing_for_research = models.BooleanField(_("Sharing for Research"), null=True, blank=True)

    consent_notify = models.BooleanField(_("Consent Notify"), null=True, blank=True)

    created_by = models.CharField(_("Created By"), max_length=100, null=True, blank=True)

    revoked_by = models.CharField(_("Revoked By"), max_length=100, null=True, blank=True)

    active =  models.BooleanField(_("Active"), null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Member Consent Histroy")
        verbose_name_plural = _("Member Consent History")

    def __str__(self):
        return self.member_consent.member.name_given or '------'