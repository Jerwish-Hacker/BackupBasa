from django.contrib import admin
from covidtestlogin.models import Employee,CovidTesting,VaccineExemption,CovidWeeklyEmployeeList,CovidBooster,CovidBoosterTesting,CovidBoosterWeeklyEmployeeList,EmployeeVaccination,VaccineManagementList
# Register your models here.
class CovidTestingSearch(admin.ModelAdmin):
    search_fields=('employee__position_id',)

    class Meta:
        verbose_name = ("CovidWeeklyEmployeeList")
        verbose_name_plural = ("CovidWeeklyEmployeeList")

class EmployeeSearch(admin.ModelAdmin):
    search_fields=('position_id',)

    class Meta:
        verbose_name = ("Employee")
        verbose_name_plural = ("Employees")

class CovidWeeklyEmployeeListSearch(admin.ModelAdmin):
    search_fields=('employee__position_id',)

    class Meta:
        verbose_name = ("CovidWeeklyEmployeeList")
        verbose_name_plural = ("CovidWeeklyEmployeeList")

class CovidBoosterSearch(admin.ModelAdmin):
    search_fields=('position_id',)

    class Meta:
        verbose_name = ("CovidBooster")
        verbose_name_plural = ("CovidBooster")

class CovidBoosterTestingSearch(admin.ModelAdmin):
    search_fields=('employee__position_id',)

    class Meta:
        verbose_name = ("CovidBoosterTesting")
        verbose_name_plural = ("CovidBoosterTesting")

class CovidBoosterWeeklyEmployeeListSearch(admin.ModelAdmin):
    search_fields=('employee__position_id',)

    class Meta:
        verbose_name = ("CovidBoosterWeeklyEmployeeList")
        verbose_name_plural = ("CovidBoosterWeeklyEmployeeList")

admin.site.register(Employee,EmployeeSearch)
admin.site.register(CovidTesting,CovidTestingSearch)
admin.site.register(VaccineExemption)
admin.site.register(CovidWeeklyEmployeeList,CovidWeeklyEmployeeListSearch)
admin.site.register(CovidBooster,CovidBoosterSearch)
admin.site.register(CovidBoosterTesting,CovidBoosterTestingSearch)
admin.site.register(CovidBoosterWeeklyEmployeeList,CovidBoosterWeeklyEmployeeListSearch)
admin.site.register(EmployeeVaccination)
admin.site.register(VaccineManagementList)

