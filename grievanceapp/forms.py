import json
import requests
from django import forms
from django.conf import settings
from django.core.exceptions import ValidationError
from grievanceapp.models import Compliance, Grievance, is_captcha_required,IncidentReport
from django.utils.translation import gettext as _
from mainapp.models import Location, QualityServices

class GrievanceForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # work around for commented code
        locations = list(Location.objects.filter(applocation__app__app_name__iexact='Grievance').values('name'))
        tenant_locations = [] 
        for location in locations: 
            tenant_locations.append((location['name'],location['name']))
        if not tenant_locations:
            tenant_locations = [('','')]
        
        report_types = list(QualityServices.objects.filter(quality__iexact='Grievance dashboard', field_name='Report Type').values('field_value'))
        tenant_report_type = [('', '---'),('Health Plan', 'Health Plan'),('Patient', 'Patient'),] 
        for report_type in report_types: 
            tenant_report_type.append((report_type['field_value'],report_type['field_value']))
        if not tenant_report_type:
            tenant_report_type = [('','')]

        service_types = list(QualityServices.objects.filter(quality__iexact='Grievance dashboard', field_name='Service Type').values('field_value'))
        tenant_service_type = [('', '---'),('BH', 'BH'),('Dental', 'Dental'),('Gynecology','Gynecology'),('Medical', 'Medical'),('Obstetrics','Obstetrics'),('Optometry','Optometry'),('Pharmacy','Pharmacy'),] 
        for service_type in service_types: 
            tenant_service_type.append((service_type['field_value'],service_type['field_value']))
        if not tenant_service_type:
            tenant_service_type = [('','')]

        event_types = list(QualityServices.objects.filter(quality__iexact='Grievance dashboard', field_name='Event Type').values('field_value'))
        tenant_event_type = [('', '---'),('Access to Care', 'Access to Care'),('Delay in Referral', 'Delay in Referral'),('Delay in Rx', 'Delay in Rx'),('Long Wait Time', 'Long Wait Time'),('Quality of Service', 'Quality of Service'),] 
        for event_type in event_types: 
            tenant_event_type.append((event_type['field_value'],event_type['field_value']))
        if not tenant_event_type:
            tenant_event_type = [('','')]

        health_plans = list(QualityServices.objects.filter(quality__iexact='Grievance dashboard', field_name='Health Plan').values('field_value'))
        tenant_health_plan = [('', '---'),('Anthem', 'Anthem'),('Brand New Day', 'Brand New Day'),('CalViva', 'CalViva'),('Dignity Health','Dignity Health'),('First Choice', 'First Choice'),('Health Net', 'Health Net'),('KHS', 'KHS')] 
        for health_plan in health_plans: 
            tenant_health_plan.append((health_plan['field_value'],health_plan['field_value']))
        if not tenant_health_plan:
            tenant_health_plan = [('','')]

        choices_and_fields = [
            (
                'site',
                tenant_locations
            ),
            (
                'grievance_report_type',
               tenant_report_type
            ),
            (
                'service_type',
               tenant_service_type
            ),
            (
                'county',
               tenant_locations
            ),
            (
                'event_type',
                tenant_event_type
            ),
            (
                'health_plan',
                tenant_health_plan
            ),
        ]
        for field_name, choices in choices_and_fields:
            # Since fields are re-assigned in this step, setting required, choices etc.
            # should come after this
            self.fields[field_name] = forms.ChoiceField(choices=choices)

        empty_labels = [
            ('grievance_report_type','Select Grievance Report Type'),
            ('service_type','Select Service Type'),
            ('county','Select Location'),
            ('event_type','Select Event Type'),
            ('health_plan', 'Select Health Plan'),
        ]
        for label_name, empty_message in empty_labels:
            existing_choices = self.fields[label_name].choices
            if existing_choices[0][0] == '':
                existing_choices = existing_choices[1:]
            self.fields[label_name].choices = [
                ('', empty_message)] + existing_choices
        
        if is_captcha_required():
            self.fields['g-recaptcha-response'] = forms.CharField(required=True)

        not_required_fields = [
            'health_plan',
            'county'
        ]
        for field in not_required_fields:
            self.fields[field].required = False

    def clean(self):
        cleaned_data = super().clean()

        # Disable cpatcha in dev
        if is_captcha_required():
            google_recaptcha_token = cleaned_data.get('g-recaptcha-response')
            if not google_recaptcha_token:
                raise ValidationError(
                    "Captcha Verficiation not submitted."
                )
            recaptha_status = json.loads(
                requests.post(
                    'https://www.google.com/recaptcha/api/siteverify',
                    data={
                        'secret': settings.GOOGLE_RECAPTCHA_SECRET_KEY,
                        'response': google_recaptcha_token}).text
            )
            if recaptha_status['success'] == False or recaptha_status['success'] < 0.5:
                # Only do something if both fields are valid so far.
                raise ValidationError(
                    "Captcha Verficiation failed."
                )

    class Meta:
        model = Grievance
        fields = '__all__'
        required = ['is_resolved']


class IncidentReportForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        locations = list(Location.objects.filter(applocation__app__app_name__iexact='Standards of behavior').values('name'))
        tenant_locations = [] 
        for location in locations: 
            tenant_locations.append((location['name'],location['name']))
        if not tenant_locations:
            tenant_locations = [('','')]
        
        races = list(QualityServices.objects.filter(quality__iexact='Standards of behavior dashboard', field_name='Ethnicity/Race').values('field_value'))
        tenant_races = [('', '---'),('Alaskan Native', 'Alaskan Native'),('American Native', 'American Native'),('Asian', 'Asian'),('Black/African American','Black/African American'),('Hispanic', 'Hispanic'),('Native Hawaiian', 'Native Hawaiian'),('Pacific Islander', 'Pacific Islander'),('Patient Refused', 'Patient Refused'),('Unknown', 'Unknown'),('White', 'White'),] 
        for race in races: 
            tenant_races.append((race['field_value'],race['field_value']))
        if not tenant_races:
            tenant_races = [('','')]

        choices_and_fields = [
           (
               'county',
               tenant_locations
           ),
           (
               'location_site',
                tenant_locations
           ),
           (
                'ethnicity_race',
                tenant_races
            ),
            (
               'level_of_intervention',
               [
                    ('Verbal warning', 'Verbal warning'),
                    ('Written warning depending on severity', 'Written warning depending on severity'),
                    ('Written warning (Standard Behavior Letter)', 'Written warning (Standard Behavior Letter)'),
                    ('Agreement of Good Behavior notice depending on severity', 'Agreement of Good Behavior notice depending on severity'),
                    ('Termination of patient/client', 'Termination of patient/client'),
                ]
           ),
           (
               'severity',
               [
                    ('Anxiety and Agitation', 'Anxiety and Agitation'),
                    ('Verbal Threats', 'Verbal Threats'),
                    ('Overt Aggression', 'Overt Aggression'),
                ]
           ),

        ]
        for field_name, choices in choices_and_fields:
            # Since fields are re-assigned in this step, setting required, choices etc.
            # should come after this
            self.fields[field_name] = forms.ChoiceField(choices=choices)

        empty_labels = [
            ('location_site','Select Location/Site'),
            ('ethnicity_race','Select Ethnicity/Race'),
            ('county','Select County'),
        ]
        for label_name, empty_message in empty_labels:
            existing_choices = self.fields[label_name].choices
            if existing_choices[0][0] == '':
                existing_choices = existing_choices[1:]
            self.fields[label_name].choices = [
                ('', empty_message)] + existing_choices

        if is_captcha_required():
            self.fields['g-recaptcha-response'] = forms.CharField(required=True)

        not_required_fields = [
            'ethnicity_race',
            'county',
            'location_site',
            'severity',
            'level_of_intervention',
        ]
        for field in not_required_fields:
            self.fields[field].required = False

    def clean(self):
        cleaned_data = super().clean()

        # Disable cpatcha in dev
        if is_captcha_required():
            google_recaptcha_token = cleaned_data.get('g-recaptcha-response')
            if not google_recaptcha_token:
                raise ValidationError(
                    "Captcha Verficiation not submitted."
                )
            recaptha_status = json.loads(
                requests.post(
                    'https://www.google.com/recaptcha/api/siteverify',
                    data={
                        'secret': settings.GOOGLE_RECAPTCHA_SECRET_KEY,
                        'response': google_recaptcha_token}).text
            )
            if recaptha_status['success'] == False or recaptha_status['success'] < 0.5:
                # Only do something if both fields are valid so far.
                raise ValidationError(
                    "Captcha Verficiation failed."
                )

    class Meta:
        model = IncidentReport
        fields = '__all__'
        required = ['is_resolved']

class ComplianceForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        locations = list(Location.objects.filter(applocation__app__app_name__iexact='Complaint').values('name'))
        tenant_locations = [] 
        for location in locations: 
            tenant_locations.append((location['name'],location['name']))
        if not tenant_locations:
            tenant_locations = [('','')]
        # work around for commented code
        report_types = list(QualityServices.objects.filter(quality__iexact='Complaint dashboard', field_name='Report Type').values('field_value'))
        tenant_report_type = [('', '---'),('Patient', 'Patient'),] 
        for report_type in report_types: 
            tenant_report_type.append((report_type['field_value'],report_type['field_value']))
        if not tenant_report_type:
            tenant_report_type = [('','')]

        service_types = list(QualityServices.objects.filter(quality__iexact='Complaint dashboard', field_name='Service Type').values('field_value'))
        tenant_service_type = [('', '---'),('BH', 'BH'),('Dental', 'Dental'),('Gynecology','Gynecology'),('Medical', 'Medical'),('Obstetrics','Obstetrics'),('Optometry','Optometry'),('Pharmacy','Pharmacy'),] 
        for service_type in service_types: 
            tenant_service_type.append((service_type['field_value'],service_type['field_value']))
        if not tenant_service_type:
            tenant_service_type = [('','')]

        event_types = list(QualityServices.objects.filter(quality__iexact='Complaint dashboard', field_name='Event Type').values('field_value'))
        tenant_event_type = [('', '---'),('Access to Care', 'Access to Care'),('Delay in Referral', 'Delay in Referral'),('Delay in Rx', 'Delay in Rx'),('Long Wait Time', 'Long Wait Time'),('Quality of Service', 'Quality of Service'),] 
        for event_type in event_types: 
            tenant_event_type.append((event_type['field_value'],event_type['field_value']))
        if not tenant_event_type:
            tenant_event_type = [('','')]

        choices_and_fields = [
            (
                'site',
                tenant_locations
            ),
            (
                'report_type',
               tenant_report_type
            ),
            (
                'service_type',
               tenant_service_type
            ),
            (
                'county',
               tenant_locations
            ),
            (
                'event_type',
                tenant_event_type
            ),
        ]
        for field_name, choices in choices_and_fields:
            # Since fields are re-assigned in this step, setting required, choices etc.
            # should come after this
            self.fields[field_name] = forms.ChoiceField(choices=choices)

        empty_labels = [
            ('report_type','Select Report Type'),
            ('service_type','Select Service Type'),
            ('county','Select Location'),
            ('event_type','Select Event Type'),
        ]
        for label_name, empty_message in empty_labels:
            existing_choices = self.fields[label_name].choices
            if existing_choices[0][0] == '':
                existing_choices = existing_choices[1:]
            self.fields[label_name].choices = [
                ('', empty_message)] + existing_choices
        
        if is_captcha_required():
            self.fields['g-recaptcha-response'] = forms.CharField(required=True)
        
        not_required_fields = [
            'county',
        ]
        for field in not_required_fields:
            self.fields[field].required = False

    def clean(self):
        cleaned_data = super().clean()

        # Disable cpatcha in dev
        if is_captcha_required():
            google_recaptcha_token = cleaned_data.get('g-recaptcha-response')
            if not google_recaptcha_token:
                raise ValidationError(
                    "Captcha Verficiation not submitted."
                )
            recaptha_status = json.loads(
                requests.post(
                    'https://www.google.com/recaptcha/api/siteverify',
                    data={
                        'secret': settings.GOOGLE_RECAPTCHA_SECRET_KEY,
                        'response': google_recaptcha_token}).text
            )
            if recaptha_status['success'] == False or recaptha_status['success'] < 0.5:
                # Only do something if both fields are valid so far.
                raise ValidationError(
                    "Captcha Verficiation failed."
                )

    class Meta:
        model = Compliance
        fields = '__all__'
        required = ['is_resolved']