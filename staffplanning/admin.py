from django.contrib import admin
from staffplanning.models import StaffPlanning,NumberofAppointment, StaffPlanningDental, StaffPlanningOptometry

# Register your models here.
admin.site.register(StaffPlanning)
admin.site.register(NumberofAppointment)
admin.site.register(StaffPlanningDental)
admin.site.register(StaffPlanningOptometry)