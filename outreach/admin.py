from django.contrib import admin
from outreach.models import OutreachList,OutreachPatient,OutreachPatientCallDetails, MemberPatient, OutreachAppointmentTiming
# Register your models here.

admin.site.register(OutreachList)
admin.site.register(OutreachPatient)
admin.site.register(OutreachPatientCallDetails)
admin.site.register(OutreachAppointmentTiming)