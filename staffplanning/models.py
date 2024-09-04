from django.db import models
from django.urls import reverse_lazy


# Create your models here.
class StaffPlanning(models.Model):

    providers_present = models.CharField(("Providers Present"),max_length=10, null=True, blank=True)

    providers_present_comment = models.TextField(("Providers Present Comment"),null=True, blank=True)

    walk_in_providers_present = models.CharField(("Walk-in Providers MA's Present"),max_length=10, null=True, blank=True)

    walk_in_providers_present_comment = models.TextField(("Walk-in Providers Present Comment"),null=True, blank=True)

    app_present = models.CharField(("App Present"),max_length=10, null=True, blank=True)

    app_present_comment = models.TextField(("App Present Comment"),null=True, blank=True)

    total_providers_present = models.CharField(("Total Providers Present"),max_length=10, null=True, blank=True)

    total_providers_present_comment = models.TextField(("Total Providers Present Comment"),null=True, blank=True)

    total_providers_appointment_scheduled_today = models.CharField(("Total Providers Appointment Scheduled Today"),max_length=10, null=True, blank=True)

    total_providers_appointment_scheduled_today_comment = models.TextField(("Total Providers Appointment Scheduled Today Comment"),null=True, blank=True)

    total_walk_in_providers_appointment_scheduled_today = models.CharField(("Total Walk-in Providers Appointment Scheduled Today"),max_length=10, null=True, blank=True)

    total_walk_in_providers_appointment_scheduled_today_comment = models.TextField(("Total Walk-in Providers Appointment Scheduled Today Comment"),null=True, blank=True)

    total_app_scheduled_today = models.CharField(("Total App Scheduled Today"),max_length=10, null=True, blank=True)

    total_app_scheduled_today_comment = models.TextField(("Total App Scheduled Today Comment"),null=True, blank=True)

    ob_gyn_providers_present = models.CharField(("OB/GYN Providers Present"),max_length=10, null=True, blank=True)

    ob_gyn_providers_present_comment = models.TextField(("OB/GYN Providers Present Comment"),null=True, blank=True)

    pediatrics_providers_present = models.CharField(("Pediatrics Providers Present"),max_length=10, null=True, blank=True)

    pediatrics_providers_present_comment= models.TextField(("Pediatrics Providers Present Comment"),null=True, blank=True)

    ecmp_providers = models.CharField(("ECMP Providers"),max_length=10, null=True, blank=True)

    ecmp_providers_comment= models.TextField(("ECMP Providers Comment"),null=True, blank=True)

    endocrinology_providers = models.CharField(("Endocrinology Providers"),max_length=10, null=True, blank=True)

    endocrinology_providers_comment= models.TextField(("Endocrinology Providers Comment"),null=True, blank=True)

    infectious_disease_providers_present = models.CharField(("Infectious Disease Providers Present"),max_length=10, null=True, blank=True)

    infectious_disease_providers_present_comment= models.TextField(("Infectious Disease Providers Present Comment"),null=True, blank=True)

    podiatry_providers_present = models.CharField(("Podiatry Providers Present"),max_length=10, null=True, blank=True)

    podiatry_providers_present_comment= models.TextField(("Podiatry Providers Present Comment"),null=True, blank=True)

    dsmes = models.CharField(("DSMES"),max_length=10, null=True, blank=True)

    dsmes_comment= models.TextField(("DSMES Comment"),null=True, blank=True)

    optometry = models.CharField(("Optometry"),max_length=10, null=True, blank=True)

    optometry_comment = models.TextField(("Optometry Comment"),null=True, blank=True)

    total_specialty_providers_present = models.CharField(("Total Specialty Providers Present"),max_length=10, null=True, blank=True)

    total_specialty_providers_present_comment = models.TextField(("Total Specialty Providers Present Comment"),null=True, blank=True)

    total_specialty_appointment_scheduled_today = models.CharField(("Total Specialty Appointment Scheduled Today"),max_length=10, null=True, blank=True)

    total_specialty_appointment_scheduled_today_comment= models.TextField(("Total Specialty Appointment Scheduled Today Comment"),null=True, blank=True)

    integrated_bh_providers_present = models.CharField(("Integrated BH Providers Present"),max_length=10, null=True, blank=True)

    integrated_bh_providers_present_comment= models.TextField(("Integrated BH Providers Present Comment"),null=True, blank=True)

    telepsychiatry_providers_present = models.CharField(("Telepsychiatry Providers Present"),max_length=10, null=True, blank=True)

    telepsychiatry_providers_present_comment= models.TextField(("Telepsychiatry Providers Present Comment"),null=True, blank=True)

    total_other_providers_present = models.CharField(("Total Other Providers Present"),max_length=10, null=True, blank=True)

    total_other_providers_present_comment = models.TextField(("Total Other Providers Present Comment"),null=True, blank=True)

    total_other_providers_appointment_scheduled_today = models.CharField(("Total Other Providers Appointment Scheduled Today"),max_length=10, null=True, blank=True)

    total_other_providers_appointment_scheduled_today_comment= models.TextField(("Total Other Providers Appointment Scheduled Today Comment"),null=True, blank=True)

    nurses_present = models.CharField(("Nurses Present"),max_length=10, null=True, blank=True)

    nurses_present_comment= models.TextField(("Nurses Present Comment"),null=True, blank=True)

    receptionist_present = models.CharField(("Receptionist Present"),max_length=10, null=True, blank=True)

    receptionist_present_comment= models.TextField(("Receptionist Present Comment"),null=True, blank=True)

    bh_ma_present = models.CharField(("BH MA's Present"),max_length=10, null=True, blank=True)

    bh_ma_present_comment = models.TextField(("BH MA's Present Comment"),null=True, blank=True)

    provider_specialty_app_walk_in_ma_present = models.CharField(("Provider/Specialty/App/Walk-in MA's Present"),max_length=10, null=True, blank=True)

    provider_specialty_app_walk_in_ma_present_comment = models.TextField(("Provider/Specialty/App/Walk-in MA's Present Comment"),null=True, blank=True)

    retinopathy_ma_present = models.CharField(("Retinopathy MA's Present"),max_length=10, null=True, blank=True)

    retinopathy_ma_present_comment = models.TextField(("Retinopathy MA's Present Comment"),null=True, blank=True)

    covid_ma_present = models.CharField(("COVID MA's Present"),max_length=10, null=True, blank=True)

    covid_ma_present_comment = models.TextField(("COVID MA's Present Comment"),null=True, blank=True)

    phlebotomist_ma = models.CharField(("Phlebotomist MA"),max_length=10, null=True, blank=True)

    phlebotomist_ma_comment = models.TextField(("Phlebotomist MA Comment"),null=True, blank=True)

    lab_ma_present = models.CharField(("Lab MA's Present"),max_length=10, null=True, blank=True)

    lab_ma_present_comment = models.TextField(("Lab MA's Present Comment"),null=True, blank=True)

    nurses_provider_ratio = models.CharField(("Nurses Provider Ratio"),max_length=10, null=True, blank=True)

    nurses_provider_ratio_comment = models.TextField(("Nurses Provider Ratio Comment"),null=True, blank=True)

    ma_provider_ratio = models.CharField(("MA's Provider Ratio"),max_length=10, null=True, blank=True)

    ma_provider_ratio_comment = models.TextField(("MA's Provider Ratio Comment"),null=True, blank=True)

    receptionist_provider_ratio = models.CharField(("Receptionist Provider Ratio"),max_length=10, null=True, blank=True)

    receptionist_provider_ratio_comment = models.TextField(("Receptionist Provider Ratio Comment"),null=True, blank=True)

    providers_call_outs = models.CharField(("Providers Call Outs"),max_length=10, null=True, blank=True)

    providers_call_outs_comment = models.TextField(("Providers Call Outs Comment"),null=True, blank=True)

    providers_no_of_patients_rescheduled = models.CharField(("Providers Number of Patients Rescheduled"),max_length=10, null=True, blank=True)

    providers_no_of_patients_rescheduled_comment = models.TextField(("Providers Number of Patients Rescheduled Comment"),null=True, blank=True)

    no_of_patients_placed_on_another_provider_schedule = models.CharField(("Number of Patients Placed on Another Provider Schedule"),max_length=10, null=True, blank=True)

    no_of_patients_placed_on_another_provider_schedule_comment = models.TextField(("Number of Patients Placed on Another Provider Schedule Comment"),null=True, blank=True)

    app_call_outs = models.CharField(("App Call Outs"),max_length=10, null=True, blank=True)

    app_call_outs_comment = models.TextField(("App Call Outs Comment"),null=True, blank=True)

    app_no_of_patients_rescheduled = models.CharField(("App Number of Patients Rescheduled"),max_length=10, null=True, blank=True)

    app_no_of_patients_rescheduled_comment = models.TextField(("App Number of Patients Rescheduled Comment"),null=True, blank=True)

    no_of_patients_placed_on_another_app_schedule = models.CharField(("Number of Patients Placed on Another App Schedule"),max_length=10, null=True, blank=True)

    no_of_patients_placed_on_another_app_schedule_comment = models.TextField(("Number of Patients Placed on Another App Schedule Comment"),null=True, blank=True)

    specialty_providers_call_outs = models.CharField(("Specialty Providers Call Outs"),max_length=10, null=True, blank=True)

    specialty_providers_call_outs_comment = models.TextField(("Specialty Providers Call Outs Comment"),null=True, blank=True)

    specialty_providers_no_of_patients_rescheduled = models.CharField(("Specialty Providers Number of Patients Rescheduled"),max_length=10, null=True, blank=True)

    specialty_providers_no_of_patients_rescheduled_comment = models.TextField(("Specialty Providers Number of Patients Rescheduled Comment"),null=True, blank=True)

    no_of_patients_plcd_on_another_splty_provider_schedule = models.CharField(("Number of Patients Placed on Another Specialty Provider Schedule"),max_length=10, null=True, blank=True)

    no_of_patients_plcd_on_another_splty_provider_schedule_comment = models.TextField(("Number of Patients Placed on Another Specialty Provider Schedule Comment"),null=True, blank=True)

    ma_call_outs = models.CharField(("MA's Call Outs"),max_length=10, null=True, blank=True)

    ma_call_outs_comment = models.TextField(("MA's Call Outs Comment"),null=True, blank=True)

    bh_ma_call_outs = models.CharField(("BH MA's Call Outs"),max_length=10, null=True, blank=True)

    bh_ma_call_outs_comment = models.TextField(("BH MA's Call Outs Comment"),null=True, blank=True)

    retinopathy_ma_call_outs = models.CharField(("Retinopathy MA's Call Outs"),max_length=10, null=True, blank=True)

    retinopathy_ma_call_outs_comment = models.TextField(("Retinopathy MA's Call Outs Comment"),null=True, blank=True)

    nurses_call_outs = models.CharField(("Nurses Call Outs"),max_length=10, null=True, blank=True)

    nurses_call_outs_comment = models.TextField(("Nurses Call Outs Comment"),null=True, blank=True)

    receptionist_call_outs = models.CharField(("Receptionist Call Outs"),max_length=10, null=True, blank=True)

    receptionist_call_outs_comment = models.TextField(("Receptionist Call Outs Comment"),null=True, blank=True)

    total_appointment_scheduled_today = models.CharField(("Total Appointment Scheduled Today"),max_length=10, null=True, blank=True)

    total_appointment_scheduled_today_comment = models.TextField(("Total Appointment Scheduled Today Comment"),null=True, blank=True)

    no_of_providers_who_met_productivity_at_end_of_day = models.CharField(("Number of Providers Who Met Productivity at End of Day"),max_length=10, null=True, blank=True)

    no_of_providers_who_met_productivity_at_end_of_day_comment = models.TextField(("Number of Providers Who Met Productivity at End of Day Comment"), null=True, blank=True)

    no_of_pds_who_did_not_meet_pdty_at_end_of_day = models.CharField(("Number of Providers Who Did Not Meet Productivity at End of Day"),max_length=10, null=True, blank=True)

    no_of_pds_who_did_not_meet_pdty_at_end_of_day_comment = models.TextField(("Number of Providers Who Did Not Meet Productivity at End of Day Comment"), null=True, blank=True)

    no_of_medical_appointment_slots_available_at_end_of_day = models.CharField(("Number of Medical Appointment Slots Available at End of Day"),max_length=10, null=True, blank=True)

    no_of_medical_appointment_slots_available_at_end_of_day_comment = models.TextField(("Number of Medical Appointment Slots Available at End of Day Comment"), null=True, blank=True)

    qualified_visits_conducted = models.CharField(("Qualified Visits Conducted"),max_length=10, null=True, blank=True)

    qualified_visits_conducted_comment = models.TextField(("Qualified Visits Conducted Comment"), null=True, blank=True)

    no_of_covid_test_scheduled = models.CharField(("Number of COVID-19 Test Scheduled"),max_length=10, null=True, blank=True)

    no_of_covid_test_scheduled_comment = models.TextField(("Number of COVID-19 Test Scheduled Comment"), null=True, blank=True)

    visit_capacity_utilization_percentage = models.CharField(("Visit Capacity Utilization Percentage"),max_length=10, null=True, blank=True)

    visit_capacity_utilization_percentage_comment = models.TextField(("Visit Capacity Utilization Percentage Comment"), null=True, blank=True)

    list_any_barriers = models.TextField(("List Any Barriers"), null=True, blank=True)

    other_reasons = models.TextField(("Other Reasons"), null=True, blank=True)

    record_created_by = models.CharField(("Record Created By"), max_length=100, null=True, blank=True)

    county = models.CharField(("County"), max_length=50, null=True, blank=True)

    site = models.CharField(("Site"), max_length=150, null=True, blank=True)

    save_for_tomorrow = models.BooleanField(("Save for tomorrow"),default=False, null=True, blank=True)

    productivity_status = models.BooleanField(("Productivity Status"),default=False, null=True, blank=True)

    record_edited_by = models.CharField(("Record Edited By"), max_length=100, null=True, blank=True)

    record_date_time = models.DateTimeField(("Record Date Time"),null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)


    class Meta:
        verbose_name = ("Staff Planning")
        verbose_name_plural = ("Staff Planning")

    def __str__(self):
        return self.record_created_by+'/'+ self.site +'/'+ str(self.record_date_time.date()) or '---'

    def get_absolute_url(self):
        return reverse_lazy("staffplanning:staff_planning_index")

class NumberofAppointment(models.Model):
    county = models.CharField(("County"), max_length=50, null=True, blank=True)

    site = models.CharField(("Site"), max_length=150, null=True, blank=True)

    staff_information =  models.CharField(("Staff Information"), max_length=150, null=True, blank=True)

    no_of_provider_appointments =  models.CharField(("Number of Provider Appointments"), max_length=5, null=True, blank=True)

    no_of_app_appointments =  models.CharField(("Number of App Appointments"), max_length=5, null=True, blank=True)

    no_of_specialty_appointments_obgyn =  models.CharField(("Number of Specialty Appointments(OB/GYN)"), max_length=5, null=True, blank=True)

    no_of_specialty_appointments_pediatric =  models.CharField(("Number of Specialty Appointments(Pediatric)"), max_length=5, null=True, blank=True)

    no_of_specialty_appointments_ecmp =  models.CharField(("Number of Specialty Appointments(ECMP)"), max_length=5, null=True, blank=True)

    no_of_specialty_appointments_endo_cri =  models.CharField(("Number of Specialty Appointments(Endocrinology)"), max_length=5, null=True, blank=True)

    no_of_specialty_appointments_infectious =  models.CharField(("Number of Specialty Appointments(Infectious Disease)"), max_length=5, null=True, blank=True)

    no_of_specialty_appointments_podiatry =  models.CharField(("Number of Specialty Appointments(Podiatry)"), max_length=5, null=True, blank=True)

    no_of_bh_providers_appointments =  models.CharField(("Number of BH Providers Appointments"), max_length=5, null=True, blank=True)

    no_of_telepsychiatry_providers_appointments =  models.CharField(("Number of Telepsychiatry Providers Appointments"), max_length=5, null=True, blank=True)

    no_of_walk_in_providers_appointments =  models.CharField(("Number of Walk-in Providers Appointments"), max_length=5, null=True, blank=True)
    

    class Meta:
        verbose_name = ("Number of Appointment")
        verbose_name_plural = ("Number of Appointments")

    def __str__(self):
        return self.site

class StaffPlanningDental(models.Model):

    providers_present = models.CharField(("Providers Present"),max_length=10, null=True, blank=True)

    providers_present_comment = models.TextField(("Providers Present Comment"),null=True, blank=True)

    registered_dental_hygienist_present = models.CharField(("Registered Dental Hygienist Present"),max_length=10, null=True, blank=True)

    registered_dental_hygienist_present_comment = models.TextField(("Registered Dental Hygienist Present Comment"),null=True, blank=True)

    total_providers_present = models.CharField(("Total Providers Present"),max_length=10, null=True, blank=True)

    total_providers_present_comment = models.TextField(("Total Providers Present Comment"),null=True, blank=True)

    total_providers_appointment_scheduled_today = models.CharField(("Total Providers Appointment Scheduled Today"),max_length=10, null=True, blank=True)

    total_providers_appointment_scheduled_today_comment = models.TextField(("Total Providers Appointment Scheduled Today Comment"),null=True, blank=True)

    registered_dental_assistants_present = models.CharField(("Registered Dental Assistants Present"),max_length=10, null=True, blank=True)

    registered_dental_assistants_present_comment = models.TextField(("Registered Dental Assistants Present Comment"),null=True, blank=True)

    receptionist_present = models.CharField(("Receptionist Present"),max_length=10, null=True, blank=True)

    receptionist_present_comment= models.TextField(("Receptionist Present Comment"),null=True, blank=True)

    dental_assistants_present = models.CharField(("Dental Assistants Present"),max_length=10, null=True, blank=True)

    dental_assistants_present_comment = models.TextField(("Dental Assistants Present Comment"),null=True, blank=True)

    dental_hygienist_provider_ratio = models.CharField(("Dental Hygienist Provider Ratio"),max_length=10, null=True, blank=True)

    dental_hygienist_provider_ratio_comment = models.TextField(("Dental Hygienist Provider Ratio Comment"),null=True, blank=True)

    dental_assistant_provider_ratio = models.CharField(("Dental Assistant Provider Ratio"),max_length=10, null=True, blank=True)

    dental_assistant_provider_ratio_comment = models.TextField(("Dental Assistant Provider Ratio Comment"),null=True, blank=True)

    receptionist_provider_ratio = models.CharField(("Receptionist Provider Ratio"),max_length=10, null=True, blank=True)

    receptionist_provider_ratio_comment = models.TextField(("Receptionist Provider Ratio Comment"),null=True, blank=True)

    providers_call_outs = models.CharField(("Providers Call Outs"),max_length=10, null=True, blank=True)

    providers_call_outs_comment = models.TextField(("Providers Call Outs Comment"),null=True, blank=True)

    registered_dental_hygienist_call_outs = models.CharField(("Registered Dental Hygienist Call Outs"),max_length=10, null=True, blank=True)

    registered_dental_hygienist_call_outs_comment = models.TextField(("Registered Dental Hygienist Call Outs Comment"),null=True, blank=True)

    registered_dental_assistant_dental_assistant_pto = models.CharField(("Registered Dental Assistant/Dental Assistant PTO"),max_length=10, null=True, blank=True)

    registered_dental_assistant_dental_assistant_pto_comment = models.TextField(("Registered Dental Assistant/Dental Assistant PTO Comment"),null=True, blank=True)

    provider_pto_cme = models.CharField(("Provider PTO/CME"),max_length=10, null=True, blank=True)

    provider_pto_cme_comment = models.TextField(("Provider PTO/CME Comment"),null=True, blank=True)

    dental_assistant_call_outs = models.CharField(("Dental Assistant Call Outs"),max_length=10, null=True, blank=True)

    dental_assistant_call_outs_comment = models.TextField(("Dental Assistant Call Outs Comment"),null=True, blank=True)

    registered_dental_assistant_call_outs = models.CharField(("Registered Dental Assistant Call Outs"),max_length=10, null=True, blank=True)

    registered_dental_assistant_call_outs_comment = models.TextField(("Registered Dental Assistant Call Outs Comment"),null=True, blank=True)

    receptionist_call_outs = models.CharField(("Receptionist Call Outs"),max_length=10, null=True, blank=True)

    receptionist_call_outs_comment = models.TextField(("Receptionist Call Outs Comment"),null=True, blank=True)

    registered_dental_assistant_on_leave = models.CharField(("Registered Dental Assistant On Leave"),max_length=10, null=True, blank=True)

    registered_dental_assistant_on_leave_comment = models.TextField(("Registered Dental Assistant On Leave Comment"),null=True, blank=True)

    dental_assistant_on_leave = models.CharField(("Dental Assistant On Leave"),max_length=10, null=True, blank=True)

    dental_assistant_on_leave_comment = models.TextField(("Dental Assistant On Leave Comment"),null=True, blank=True)

    total_appointment_scheduled_today = models.CharField(("Total Appointment Scheduled Today"),max_length=10, null=True, blank=True)

    total_appointment_scheduled_today_comment = models.TextField(("Total Appointment Scheduled Today Comment"),null=True, blank=True)

    total_number_of_walkin_patients_today = models.CharField(("Total Number of Walk-in Patients Today"),max_length=10, null=True, blank=True)

    total_number_of_walkin_patients_today_comment = models.TextField(("Total Number of Walk-in Patients Today Comment"),null=True, blank=True)

    no_of_providers_who_met_productivity_at_end_of_day = models.CharField(("Number of Providers Who Met Productivity at End of Day"),max_length=10, null=True, blank=True)

    no_of_providers_who_met_productivity_at_end_of_day_comment = models.TextField(("Number of Providers Who Met Productivity at End of Day Comment"), null=True, blank=True)

    no_of_pds_who_did_not_meet_pdty_at_end_of_day = models.CharField(("Number of Providers Who Did Not Meet Productivity at End of Day"),max_length=10, null=True, blank=True)

    no_of_pds_who_did_not_meet_pdty_at_end_of_day_comment = models.TextField(("Number of Providers Who Did Not Meet Productivity at End of Day Comment"), null=True, blank=True)

    qualified_visits_conducted = models.CharField(("Qualified Visits Conducted"),max_length=10, null=True, blank=True)

    qualified_visits_conducted_comment = models.TextField(("Qualified Visits Conducted Comment"), null=True, blank=True)

    new_qualified_visits_conducted = models.CharField(("New Qualified Visits Conducted"),max_length=10, null=True, blank=True)

    new_qualified_visits_conducted_comment = models.TextField(("New Qualified Visits Conducted Comment"), null=True, blank=True)

    visit_capacity_utilization_percentage = models.CharField(("Visit Capacity Utilization Percentage"),max_length=10, null=True, blank=True)

    visit_capacity_utilization_percentage_comment = models.TextField(("Visit Capacity Utilization Percentage Comment"), null=True, blank=True)

    list_any_barriers = models.TextField(("List Any Barriers"), null=True, blank=True)

    other_reasons = models.TextField(("Other Reasons"), null=True, blank=True)

    record_created_by = models.CharField(("Record Created By"), max_length=100, null=True, blank=True)

    county = models.CharField(("County"), max_length=50, null=True, blank=True)

    site = models.CharField(("Site"), max_length=150, null=True, blank=True)

    save_for_tomorrow = models.BooleanField(("Save for tomorrow"),default=False, null=True, blank=True)

    productivity_status = models.BooleanField(("Productivity Status"),default=False, null=True, blank=True)

    record_edited_by = models.CharField(("Record Edited By"), max_length=100, null=True, blank=True)

    record_date_time = models.DateTimeField(("Record Date Time"),null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)


    class Meta:
        verbose_name = ("Staff Planning Dental")
        verbose_name_plural = ("Staff Planning Dentals")

    def __str__(self):
        return self.record_created_by+'/'+ self.site +'/'+ str(self.record_date_time.date()) or '---'

    def get_absolute_url(self):
        return reverse_lazy("staffplanning:staff_planning_dental_index")
    
class StaffPlanningOptometry(models.Model):

    optometrist_present   = models.CharField(("Optometrist Present"),max_length=10, null=True, blank=True)

    optometrist_present_comment = models.TextField(("Optometrist Present Comment"),null=True, blank=True)

    total_optometrist_appointments_scheduled_today  = models.CharField(("Total Optometrist Appointments Scheduled Today"),max_length=10, null=True, blank=True)

    total_optometrist_appointments_scheduled_today_comment = models.TextField(("Total Optometrist Appointments Scheduled Today Comment"),null=True, blank=True)

    optometry_ma_present = models.CharField(("Optometry MA Present"),max_length=10, null=True, blank=True)

    optometry_ma_present_comment = models.TextField(("Optometry MA present Comment"),null=True, blank=True)

    receptionist_present  = models.CharField(("Receptionist Present"),max_length=10, null=True, blank=True)

    receptionist_present_comment = models.TextField(("Receptionist Present Comment"),null=True, blank=True)

    optician = models.CharField(("Optician"),max_length=10, null=True, blank=True)

    optician_comment = models.TextField(("Optician Comment"),null=True, blank=True)

    ma_optometrist_ratio = models.CharField(("MA / Optometrist Ratio"),max_length=10, null=True, blank=True)

    ma_optometrist_ratio_comment= models.TextField(("MA / Optometrist Ratio Comment"),null=True, blank=True)

    receptionist_optometrist = models.CharField(("Receptionist/Optometrist"),max_length=10, null=True, blank=True)

    receptionist_optometrist_comment = models.TextField(("Receptionist/Optometrist Comment"),null=True, blank=True)

    optician_optometrist_ratio = models.CharField(("Optician/Optometrist Ratio"),max_length=10, null=True, blank=True)

    optician_optometrist_ratio_comment = models.TextField(("Optician/Optometrist Ratio Comment"),null=True, blank=True)

    optometrist_call_outs = models.CharField(("Optometrist Call Outs "),max_length=10, null=True, blank=True)

    optometrist_call_outs_comment = models.TextField(("Optometrist Call Outs Comment"),null=True, blank=True)

    optometrist_number_of_patients_rescheduled = models.CharField(("Optometrist Number of Patients Rescheduled"),max_length=10, null=True, blank=True)

    optometrist_number_of_patients_rescheduled_comment = models.TextField(("Optometrist Number of Patients Rescheduled Comment"),null=True, blank=True)

    number_of_patients_placed_on_another_optometrist_schedule = models.CharField(("Number of Patients Placed on Another Optometrist Schedule"),max_length=10, null=True, blank=True)

    no_of_patients_placed_on_another_optmst_schedule_comment = models.TextField(("Number of Patients Placed on Another Optometrist Schedule Comment"),null=True, blank=True)

    optometry_ma_call_outs = models.CharField(("Optometry MA Call Outs"),max_length=10, null=True, blank=True)

    optometry_ma_call_outs_comment = models.TextField(("Optometry MA Call Outs Comment"),null=True, blank=True)

    optician_call_outs = models.CharField(("Optician Call Outs"),max_length=10, null=True, blank=True)

    optician_call_outs_comment = models.TextField(("Optician Call Outs Comment"),null=True, blank=True)

    receptionist_call_outs  = models.CharField(("Receptionist Call Outs "),max_length=10, null=True, blank=True)

    receptionist_call_outs_comment = models.TextField(("Receptionist Call Outs Comment"),null=True, blank=True)

    optometry_ma_on_leave = models.CharField(("Optometry MA on Leave"),max_length=10, null=True, blank=True)

    optometry_ma_on_leave_comment = models.TextField(("Optometry MA on Leave Comment"),null=True, blank=True)

    optician_on_leave = models.CharField(("Optician on Leave"),max_length=10, null=True, blank=True)

    optician_on_leave_comment = models.TextField(("Optician on Leave Comment"),null=True, blank=True)

    number_of_walk_in_patients_today = models.CharField(("Number of Walk in Patients Today"),max_length=10, null=True, blank=True)

    number_of_walk_in_patients_today_comment = models.TextField(("Number of Walk in Patients Today"),null=True, blank=True)

    total_appointment_scheduled_today = models.CharField(("Total Appointment Scheduled Today"),max_length=10, null=True, blank=True)

    total_appointment_scheduled_today_comment = models.TextField(("Total Appointment Scheduled Today"),null=True, blank=True)

    number_of_optometrist_who_met_productivity_at_end_of_day  = models.CharField(("Number of Optometrist who met Productivity at End of Day "),max_length=10, null=True, blank=True)

    no_of_optometrist_who_met_pdty_at_end_of_day_comment = models.TextField(("Number of Optometrist who met Productivity at End of Day Comment"),null=True, blank=True)

    no_of_optometrist_who_did_not_meet_pdty_at_eod  = models.CharField(("Number of Optometrist Who did not meet Productivity at End of Day "),max_length=10, null=True, blank=True)

    no_of_optometrist_who_did_not_meet_pdty_at_eod_comment = models.TextField(("Number of Optometrist who did not meet productivity at End of Day Comment"),null=True, blank=True)

    qualified_visits_conducted = models.CharField(("Qualified Visits Conducted "),max_length=10, null=True, blank=True)

    qualified_visits_conducted_comment = models.TextField(("Qualified Visits Conducted  Comment"),null=True, blank=True)

    visit_capacity_utilization_percentage = models.CharField(("Visit Capacity Utilization Percentage"),max_length=10, null=True, blank=True)

    visit_capacity_utilization_percentage_comment = models.TextField(("Visit Capacity Utilization Percentage Comment"), null=True, blank=True)

    list_any_barriers = models.TextField(("List Any Barriers"), null=True, blank=True)

    other_reasons = models.TextField(("Other Reasons"), null=True, blank=True)

    record_created_by = models.CharField(("Record Created By"), max_length=100, null=True, blank=True)

    county = models.CharField(("County"), max_length=50, null=True, blank=True)

    site = models.CharField(("Site"), max_length=150, null=True, blank=True)

    save_for_tomorrow = models.BooleanField(("Save for tomorrow"),default=False, null=True, blank=True)

    productivity_status = models.BooleanField(("Productivity Status"),default=False, null=True, blank=True)

    record_edited_by = models.CharField(("Record Edited By"), max_length=100, null=True, blank=True)

    record_date_time = models.DateTimeField(("Record Date Time"),null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)


    class Meta:
        verbose_name = ("Staff Planning Optometry")
        verbose_name_plural = ("Staff Planning Optometries")

    def __str__(self):
        return self.record_created_by+'/'+ self.site +'/'+ str(self.record_date_time.date()) or '---'

    def get_absolute_url(self):
        return reverse_lazy("staffplanning:staff_planning_optometry_index")