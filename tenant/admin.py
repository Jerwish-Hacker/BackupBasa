from django.contrib import admin
from django_tenants.admin import TenantAdminMixin
from tenant.models import AppPermissionGroups,MemberPatient,MemberConsent,MemberConsentHistory,TenantMembers

from .models import Client

@admin.register(Client)
class ClientAdmin(TenantAdminMixin, admin.ModelAdmin):
        list_display = ('name', 'paid_until')
        
admin.site.register(AppPermissionGroups)
admin.site.register(MemberPatient)
admin.site.register(MemberConsent)
admin.site.register(MemberConsentHistory)
admin.site.register(TenantMembers)