from django import forms
from staffplanning.models import StaffPlanning, StaffPlanningDental, StaffPlanningOptometry
from django.core.exceptions import ValidationError
from mainapp.models import Location


class StaffPlanningForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        locations = list(Location.objects.filter(applocation__app__app_name__iexact='Staff Planning Medical').values('name'))
        tenant_locations = [] 
        for location in locations: 
            tenant_locations.append((location['name'],location['name']))
        if not tenant_locations:
            tenant_locations = [('','')]

        choices_and_fields = [
            (
                'county',
                tenant_locations
            ),
            (
                'site',
                    tenant_locations
            ),
            (
                'list_any_barriers',
                    [
                    ('', '---'),
                    ('Internet Issues', 'Internet Issues'),
                    ('No Power', 'No Power'),
                    ('Water Problems (water leaks, plumbing issues)','Water Problems (water leaks, plumbing issues)'),
                    ('Safety Concern (Law enforcement involved)', 'Safety Concern (Law enforcement involved)'),
                    ('Fire Threat (Smoke, Fire)', 'Fire Threat (Smoke, Fire)'),
                    ('MA Shortage', 'MA Shortage'),
                    ('Receptionist Shortage', 'Receptionist Shortage'),
                    ('Staff Shortage', 'Staff Shortage'),
                    ('Provider Call Out', 'Provider Call Out'),
                    ('Provider transferred to another site', 'Provider transferred to another site'),
                    ('Site Closure', 'Site Closure'),
                    ('Provider/Staff Meeting or Training', 'Provider/Staff Meeting or Training'),
                    ('Other Reasons', 'Other Reasons'),
                ]
            ),
        ]
        for field_name, choices in choices_and_fields:
            # Since fields are re-assigned in this step, setting required, choices etc.
            # should come after this
            self.fields[field_name] = forms.ChoiceField(choices=choices)

        empty_labels = [
            ('site','Select Site'),
            ('list_any_barriers','Select any Barriers'),
        ]
        for label_name, empty_message in empty_labels:
            existing_choices = self.fields[label_name].choices
            if existing_choices[0][0] == '':
                existing_choices = existing_choices[1:]
            self.fields[label_name].choices = [
                ('', empty_message)] + existing_choices

        not_required_fields = [
            'list_any_barriers',
            'county'
        ]
        for field in not_required_fields:
            self.fields[field].required = False

    # def clean(self):
    #         cleaned_data = super().clean()
    #         for key, value in cleaned_data.items():
    #             if(key!='record_created_by'):
    #                 if value==None:
    #                     raise ValidationError("Empty fields",code='invalid')
    
    class Meta:
        model = StaffPlanning
        exclude = ['record_created_by','record_date_time']

class StaffPlanningUpdateForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    class Meta:
        model = StaffPlanning
        fields = ['site','total_appointment_scheduled_today','total_appointment_scheduled_today_comment','no_of_providers_who_met_productivity_at_end_of_day','no_of_providers_who_met_productivity_at_end_of_day_comment','no_of_pds_who_did_not_meet_pdty_at_end_of_day','no_of_pds_who_did_not_meet_pdty_at_end_of_day_comment','no_of_medical_appointment_slots_available_at_end_of_day','no_of_medical_appointment_slots_available_at_end_of_day_comment','qualified_visits_conducted','qualified_visits_conducted_comment','visit_capacity_utilization_percentage','visit_capacity_utilization_percentage_comment','productivity_status']


class StaffPlanningDentalForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        locations = list(Location.objects.filter(applocation__app__app_name__iexact='Staff Planning Dental').values('name'))
        tenant_locations = [] 
        for location in locations: 
            tenant_locations.append((location['name'],location['name']))
        if not tenant_locations:
            tenant_locations = [('','')]

        choices_and_fields = [
            (
                'county',
                tenant_locations
            ),
            (
                'site',
                    tenant_locations
            ),
            (
                'list_any_barriers',
                    [
                    ('', '---'),
                    ('Internet Issues', 'Internet Issues'),
                    ('No Power', 'No Power'),
                    ('Water Problems (water leaks, plumbing issues)','Water Problems (water leaks, plumbing issues)'),
                    ('Safety Concern (Law enforcement involved)', 'Safety Concern (Law enforcement involved)'),
                    ('Fire Threat (Smoke, Fire)', 'Fire Threat (Smoke, Fire)'),
                    ('MA Shortage', 'MA Shortage'),
                    ('Receptionist Shortage', 'Receptionist Shortage'),
                    ('Staff Shortage', 'Staff Shortage'),
                    ('Provider Call Out', 'Provider Call Out'),
                    ('Provider transferred to another site', 'Provider transferred to another site'),
                    ('Site Closure', 'Site Closure'),
                    ('Provider/Staff Meeting or Training', 'Provider/Staff Meeting or Training'),
                    ('Other Reasons', 'Other Reasons'),
                ]
            ),
        ]
        for field_name, choices in choices_and_fields:
            # Since fields are re-assigned in this step, setting required, choices etc.
            # should come after this
            self.fields[field_name] = forms.ChoiceField(choices=choices)

        empty_labels = [
            ('site','Select Site'),
            ('list_any_barriers','Select any Barriers'),
        ]
        for label_name, empty_message in empty_labels:
            existing_choices = self.fields[label_name].choices
            if existing_choices[0][0] == '':
                existing_choices = existing_choices[1:]
            self.fields[label_name].choices = [
                ('', empty_message)] + existing_choices

        not_required_fields = [
            'list_any_barriers',
            'county'
        ]
        for field in not_required_fields:
            self.fields[field].required = False
    
    class Meta:
        model = StaffPlanningDental
        exclude = ['record_created_by','record_date_time']

class StaffPlanningDentalUpdateForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    class Meta:
        model = StaffPlanningDental
        fields = ['site','total_appointment_scheduled_today','total_appointment_scheduled_today_comment','no_of_providers_who_met_productivity_at_end_of_day','no_of_providers_who_met_productivity_at_end_of_day_comment','no_of_pds_who_did_not_meet_pdty_at_end_of_day','no_of_pds_who_did_not_meet_pdty_at_end_of_day_comment','qualified_visits_conducted','qualified_visits_conducted_comment','new_qualified_visits_conducted','new_qualified_visits_conducted_comment','visit_capacity_utilization_percentage','visit_capacity_utilization_percentage_comment','productivity_status','registered_dental_assistant_on_leave','registered_dental_assistant_on_leave_comment','dental_assistant_on_leave','dental_assistant_on_leave_comment','total_number_of_walkin_patients_today','total_number_of_walkin_patients_today_comment']


class StaffPlanningOptometryForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        locations = list(Location.objects.filter(applocation__app__app_name__iexact='Staff Planning Optometry').values('name'))
        tenant_locations = [] 
        for location in locations: 
            tenant_locations.append((location['name'],location['name']))
        if not tenant_locations:
            tenant_locations = [('','')]

        choices_and_fields = [
            (
                'county',
                tenant_locations
            ),
            (
                'site',
                    tenant_locations
            ),
            (
                'list_any_barriers',
                    [
                    ('', '---'),
                    ('Internet Issues', 'Internet Issues'),
                    ('No Power', 'No Power'),
                    ('Water Problems (water leaks, plumbing issues)','Water Problems (water leaks, plumbing issues)'),
                    ('Safety Concern (Law enforcement involved)', 'Safety Concern (Law enforcement involved)'),
                    ('Fire Threat (Smoke, Fire)', 'Fire Threat (Smoke, Fire)'),
                    ('MA Shortage', 'MA Shortage'),
                    ('Receptionist Shortage', 'Receptionist Shortage'),
                    ('Staff Shortage', 'Staff Shortage'),
                    ('Provider Call Out', 'Provider Call Out'),
                    ('Provider transferred to another site', 'Provider transferred to another site'),
                    ('Site Closure', 'Site Closure'),
                    ('Provider/Staff Meeting or Training', 'Provider/Staff Meeting or Training'),
                    ('Other Reasons', 'Other Reasons'),
                ]
            ),
        ]
        for field_name, choices in choices_and_fields:
            # Since fields are re-assigned in this step, setting required, choices etc.
            # should come after this
            self.fields[field_name] = forms.ChoiceField(choices=choices)

        empty_labels = [
            ('site','Select Site'),
            ('list_any_barriers','Select any Barriers'),
        ]
        for label_name, empty_message in empty_labels:
            existing_choices = self.fields[label_name].choices
            if existing_choices[0][0] == '':
                existing_choices = existing_choices[1:]
            self.fields[label_name].choices = [
                ('', empty_message)] + existing_choices

        not_required_fields = [
            'list_any_barriers',
            'county'
        ]
        for field in not_required_fields:
            self.fields[field].required = False
    
    class Meta:
        model = StaffPlanningOptometry
        exclude = ['record_created_by','record_date_time']

class StaffPlanningOptometryUpdateForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    class Meta:
        model = StaffPlanningOptometry
        fields = ['site','total_appointment_scheduled_today','total_appointment_scheduled_today_comment','no_of_optometrist_who_met_pdty_at_end_of_day_comment','number_of_optometrist_who_met_productivity_at_end_of_day','no_of_optometrist_who_did_not_meet_pdty_at_eod','no_of_optometrist_who_did_not_meet_pdty_at_eod_comment','qualified_visits_conducted','qualified_visits_conducted_comment','visit_capacity_utilization_percentage','visit_capacity_utilization_percentage_comment','productivity_status','optician_on_leave','optician_on_leave_comment','optometry_ma_on_leave','optometry_ma_on_leave_comment','number_of_walk_in_patients_today','number_of_walk_in_patients_today_comment']