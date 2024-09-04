from django.contrib import admin
from bookingforms.models import Appointment,AppointmentLock,HealthPlanPatient,HealthPlanPatientCallDetails, KHSAppointmentLock,HealthPlanAppointmentTiming,HealthPlanAppointmentLocation,KHSAppointment,KHSAppointmentLock,UploadUrlModel,KHSPatientDetails,KHSPatientCallDetails
# Register your models here.


admin.site.register(Appointment)
admin.site.register(AppointmentLock)
admin.site.register(HealthPlanPatient)
admin.site.register(HealthPlanPatientCallDetails)
admin.site.register(HealthPlanAppointmentTiming)
admin.site.register(HealthPlanAppointmentLocation)
admin.site.register(KHSAppointment)
admin.site.register(KHSAppointmentLock)
admin.site.register(UploadUrlModel)
admin.site.register(KHSPatientDetails)
admin.site.register(KHSPatientCallDetails)
