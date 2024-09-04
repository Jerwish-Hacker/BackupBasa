from django.contrib import admin
from grievanceapp.models import Grievance,MultipleComments,IncidentReport,MultipleCommentsIncidentReporting,Compliance,MultipleCommentsCompliance
# Register your models here.
admin.site.register(Grievance)
admin.site.register(MultipleComments)
admin.site.register(IncidentReport)
admin.site.register(MultipleCommentsIncidentReporting)
admin.site.register(Compliance)
admin.site.register(MultipleCommentsCompliance)

