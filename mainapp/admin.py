from django.contrib import admin
from mainapp.models import FavouriteApps,AppAccessData,QualityServices,AppsButtons,Apps,AppOrdering,Location,AppLocation,UserAssignedLocations,OrganisationSSO,AppAdmins,Profile,Field,Form, FormSubmission

# Register your models here.
admin.site.register(FavouriteApps)
admin.site.register(AppAccessData)
admin.site.register(Apps)
admin.site.register(AppsButtons)
admin.site.register(AppOrdering)
admin.site.register(Location)
admin.site.register(AppLocation)
admin.site.register(UserAssignedLocations)
admin.site.register(OrganisationSSO)
admin.site.register(AppAdmins)
admin.site.register(Profile)
admin.site.register(QualityServices)
admin.site.register(Field)
admin.site.register(Form)
admin.site.register(FormSubmission)
