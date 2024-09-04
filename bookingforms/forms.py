import json
import requests
from django import forms
from django.conf import settings
from django.core.exceptions import ValidationError
from bookingforms.constants import get_regions_in_country, get_cities_in_region
from bookingforms.models import Appointment, is_captcha_required,KHSAppointment,UploadUrlModel
from django.utils.translation import gettext as _
from mainapp.models import Location, QualityServices
from outreach.models import OutreachAppointmentTiming


class AppointmentForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        state_list = get_regions_in_country('US')
        cities_list = get_cities_in_region(None,True)
        cities_list.append(['Other',_('Other')])

        locations = list(Location.objects.filter(applocation__app__app_name__iexact='Vaccine management').values('name'))
        tenant_locations = [] 
        for location in locations: 
            tenant_locations.append((location['name'],location['name']))
        if not tenant_locations:
            tenant_locations = [('','')]
        appointment_types = list(QualityServices.objects.filter(quality__iexact='Appointment', field_name='Appointment Type').values('field_value'))
        tenant_appointment_type = [('', '---'),] 
        for appointment_type in appointment_types: 
            tenant_appointment_type.append((appointment_type['field_value'],appointment_type['field_value']))
        if not tenant_appointment_type:
            tenant_appointment_type = [('','')]
        
        document_types = list(QualityServices.objects.filter(quality__iexact='Appointment', field_name='Identification Document Type').values('field_value'))
        tenant_document_type = [('', '---'),('Drivers licence', _('Drivers licence')),('State identification card', _('State identification card')),] 
        for document_type in document_types: 
            tenant_document_type.append((document_type['field_value'],document_type['field_value']))
        
        primary_language_types = list(QualityServices.objects.filter(quality__iexact='Appointment', field_name='Primary Language').values('field_value'))
        tenant_primary_language_type = [('', '---'),('English', _('English')),('Spanish', _('Spanish')),('Punjabi', _('Punjabi')),('Arabic', _('Arabic')),('American Sign Language', _('American Sign Language')),('Hmong', _('Hmong')),('Tagalog', _('Tagalog')),('Laotian', _('Laotian')),('Vietnamese ', _('Vietnamese ')),('Other', _('Other')),] 
        for primary_language_type in primary_language_types: 
            tenant_primary_language_type.append((primary_language_type['field_value'],primary_language_type['field_value']))
        
        ethnicity_types = list(QualityServices.objects.filter(quality__iexact='Appointment', field_name='Ethnicity').values('field_value'))
        tenant_ethnicity_type = [('', '---'),('Hispanic/Latino', _('Hispanic/Latino')),('Non-Hispanic Latino', _('Non-Hispanic Latino')),('Decline to Report', _('Decline to Report')),('Unknown', _('Unknown')),] 
        for ethnicity_type in ethnicity_types: 
            tenant_ethnicity_type.append((ethnicity_type['field_value'],ethnicity_type['field_value']))

        race_types = list(QualityServices.objects.filter(quality__iexact='Appointment', field_name='Race').values('field_value'))
        tenant_race_type = [('', '---'),('Alaskan Native', _('Alaskan Native')),('American Indian', _('American Indian')),('Asian', _('Asian')),('Black', _('Black')),('Native-Hawaiian', _('Native-Hawaiian')),('Pacific Islander', _('Pacific Islander')),('White', _('White')),('Decline to Report', _('Decline to Report')),('Unknown', _('Unknown')),] 
        for race_type in race_types: 
            tenant_race_type.append((race_type['field_value'],race_type['field_value']))

        preferred_time_frame = [('', '---')]
        for appointment in tenant_appointment_type:
            timelist = list(OutreachAppointmentTiming.objects.filter(outreach=appointment[0]).values('time','maximum_booking_per_slot'))
            for i in timelist:
                preferred_time_frame.append((i['time'],i['time']))

        relations_list = [
            ('', '-----'),
            ('Mother', _('Mother')),
            ('Father', _('Father')),
            ('Husband', _('Husband')),
            ('Wife', _('Wife')),
            ('Significant Other', _('Significant Other')),
            ('Sister', _('Sister')),
            ('Brother', _('Brother')),
            ('Caregiver', _('Caregiver')),
            ('Other', _('Other')),
        ];        
        # work around for commented code
        t = _('COVID-19 Testing')
        choices_and_fields = [
            (
                'appointment_type',
                tenant_appointment_type
            ),
            (
                'county',
                tenant_locations
            ),
            (
                'preferred_day_of_week',
                [
                    # ('Sunday', 'Sunday'),
                    ('', '---'),
                ]
            ),
            (
                'vaccine_eligibility_status',
                [
                    ('', '---'),
                    ('18+ with Underlying Medical Condition',_('18+ with Underlying Medical Condition')),
                    ('Healthcare Worker', _('Healthcare Worker')),
                    ('65+ Years', _('65+ Years')),
                    ('Education Worker', _('Education Worker')),
                    ('Food and Agriculture Worker', _('Food and Agriculture Worker')),
                    ('Emergency Services Worker', _('Emergency Services Worker')),
                    ('None of the Above', _('None of the Above')),
                ]
            ),
            (
                'preferred_time_frame',
                preferred_time_frame
            ),
            (
                'covid_vaccine_manufacturer',
                [
                    ('', '---'),
                    ('Moderna', 'Moderna'),
                    ('Pfizer', 'Pfizer'),
                ]
            ),
            (
                'gender',
                [
                    ('', '---'),
                    ('Male', _('Male')),
                    ('Female', _('Female')),
                    ('Non-Binary', _('Non-Binary')),
                    ('Unknown', _('Unknown')),
                ]
            ),
            (
                'contact_number_type',
                [
                    ('', '---'),
                    ('Cell', _('Cell')),
                    ('Work', _('Work')),
                    ('Home', _('Home')),
                ]
            ),
            (
                'marital_status',
                [
                    ('', '---'),
                    ('Single', _('Single')),
                    ('Married', _('Married')),
                    ('Divorced', _('Divorced')),
                    ('Separated', _('Separated')),
                    ('Widowed', _('Widowed')),
                    ('Domestic Partner', _('Domestic Partner')),
                    ('Significant Other', _('Significant Other')),
                ]
            ),
            (
                'ethnicity',
                tenant_ethnicity_type
            ),
            (
                'race',
                tenant_race_type
            ),
            (
                'employment_status',
                [
                    ('', '---'),
                    ('Full-Time', _('Full-Time')),
                    ('Not Employed', _('Not Employed')),
                    ('Active Military Duty', _('Active Military Duty')),
                    ('Part Time', _('Part Time')),
                    ('Retired', _('Retired')),
                    ('Seasonal', _('Seasonal')),
                    ('Self-Employed', _('Self-Employed')),
                    ('Student Full-Time', _('Student Full-Time')),
                    ('Student Part-Time', _('Student Part-Time')),
                    ('Child', _('Child')),
                ],
            ),
            (
                'homeless_status',
                [
                    ('', '---'),
                    ('Not Homeless', _('Not Homeless')),
                    ('At Risk for Homeless', _('At Risk for Homeless')),
                    ('Currently Not Homless, was in Last 12 Months',
                     _('Currently Not Homless, was in Last 12 Months')),
                    ('Homeless, Unknown Shelter',
                     _('Homeless, Unknown Shelter')),
                    ('Shelter', _('Shelter')),
                    ('Living with Others', _('Living with Others')),
                    ('Street/Camp/Bridge', _('Street/Camp/Bridge')),
                    ('Transitional Housing', _('Transitional Housing')),

                ],
            ),
            (
                'farmworker_status',
                [
                    ('', '---'),
                    ('Not a Farmworker', _('Not a Farmworker')),
                    ('Migrant', _('Migrant')),
                    ('Seasonal', _('Seasonal')),
                ],
            ),
            (
                'income_frequency',
                [
                    ('', '---'),
                    ('Weekly', _('Weekly')),
                    ('Monthly', _('Monthly')),
                    ('Annually', _('Annually')),
                ],
            ),
            (
                'primary_language',
                tenant_primary_language_type
            ),
            (
                'identification_document',
                tenant_document_type
            ),
            (
                'emergency_contact_relationship',
                relations_list
            ),
            (
                'subscriber_relationship',
                relations_list
            ),
            (
                'guarantor_relationship',
                relations_list
            ),
            (
                'state',
                state_list
            ),
            # (
            #     'city',
            #     cities_list
            # )
        ]
        for field_name, choices in choices_and_fields:
            # Since fields are re-assigned in this step, setting required, choices etc.
            # should come after this
            self.fields[field_name] = forms.ChoiceField(choices=choices)

        empty_labels = [
            ('county', _('Select Location')),
            ('preferred_day_of_week', _('Select a Preferred day of week')),
            ('vaccine_eligibility_status', _('Select Your Vaccine Eligibility Status?')),
            ('preferred_time_frame', _('Select a Preferred time frame')),
            ('gender', _('Select Gender')),
            ('marital_status', _('Select Marital status')),
            ('ethnicity', _('Select Ethnicity')),
            ('race', _('Select Race')),
            ('employment_status', _('Select Employment Status')),
            ('homeless_status', _('Select Homeless status')),
            ('farmworker_status', _('Select Farm worker status')),
            ('income_frequency', _('Select Income frequency')),
            ('primary_language', _('Select Primary Language')),
            ('identification_document', _('Select Identification Document')),
            ('emergency_contact_relationship',
             _('Select Emergency Contact Relationship')),
            ('subscriber_relationship', _('Select Subscriber Relationship')),
            ('guarantor_relationship', _('Select Guarantor\'s Relationship to Patient')),
            ('state', _('Select State')),
            # ('city', _('Select City')),
            ('appointment_type', _('Select Appointment Type')),
            ('covid_vaccine_manufacturer',_('Select the Vaccine')),
        ]
        for label_name, empty_message in empty_labels:
            existing_choices = self.fields[label_name].choices
            if existing_choices[0][0] == '':
                existing_choices = existing_choices[1:]
            self.fields[label_name].choices = [
                ('', empty_message)] + existing_choices
        
        if is_captcha_required():
            self.fields['g-recaptcha-response'] = forms.CharField(required=True)

        # These are not required since there is option for users to skip
        # input of these
        not_required_fields = [
            'covid_vaccine_manufacturer',
            'social_security_number',
            'family_size',
            'primary_insurance_carrier',
            'income_frequency',
            'identification_document',
            'subscriber_relationship',
            'guarantor_relationship',
            'city',
            'city_entered',
            'employer',
            'is_healthworker_or_above_age_65',
            'is_healthworker',
            'is_above_age_65',
        ]
        for field in not_required_fields:
            self.fields[field].required = False

        # Disable server side validatoin for easier testing
        # for field in self.fields:
        #     self.fields[field].required = False

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
        model = Appointment
        fields = '__all__'

class KHSAppointmentForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        state_list = get_regions_in_country('US')
        cities_list = get_cities_in_region(None,True)
        cities_list.append(['Other',_('Other')])

        relations_list = [
            ('', '-----'),
            ('Mother', _('Mother')),
            ('Father', _('Father')),
            ('Husband', _('Husband')),
            ('Wife', _('Wife')),
            ('Significant Other', _('Significant Other')),
            ('Sister', _('Sister')),
            ('Brother', _('Brother')),
            ('Caregiver', _('Caregiver')),
            ('Other', _('Other')),
        ];        
        # work around for commented code
        t = _('COVID-19 Testing')
        choices_and_fields = [
            (
                'appointment_type',
                [
                    ('COVID-19 Vaccine', _('COVID-19 Vaccine')),
                    # ('COVID-19 Testing', _('COVID-19 Testing')),
                ]
            ),
            (
                'county',
                self.Meta.vaccinate_location
            ),
            (
                'preferred_day_of_week',
                [
                    # ('Sunday', 'Sunday'),
                    ('', '---'),
                    ('Monday', _('Monday')),
                    ('Tuesday', _('Tuesday')),
                    ('Wednesday', _('Wednesday')),
                    ('Thursday', _('Thursday')),
                    ('Friday', _('Friday')),
                    ('Soonest Available', _('Soonest Available')),
                    # ('Saturday', 'Saturday'),
                ]
            ),
            (
                'vaccine_eligibility_status',
                [
                    ('', '---'),
                    ('18+ with Underlying Medical Condition',_('18+ with Underlying Medical Condition')),
                    ('Healthcare Worker', _('Healthcare Worker')),
                    ('65+ Years', _('65+ Years')),
                    ('Education Worker', _('Education Worker')),
                    ('Food and Agriculture Worker', _('Food and Agriculture Worker')),
                    ('Emergency Services Worker', _('Emergency Services Worker')),
                    ('None of the Above', _('None of the Above')),
                ]
            ),
            (
                'preferred_time_frame',
                [
                    ('', '---'),
                    ('Early Morning', _('Early Morning')),
                    ('Late Morning', _('Late Morning')),
                    ('Early Afternoon', _('Early Afternoon')),
                    ('Late Afternoon', _('Late Afternoon')),
                    ('Soonest Available', _('Soonest Available'))
                ]+self.Meta.time_slot
            ),
            (
                'covid_vaccine_manufacturer',
                [
                    ('', '---'),
                    ('Moderna', 'Moderna'),
                    ('Pfizer', 'Pfizer'),
                ]
            ),
            (
                'gender',
                [
                    ('', '---'),
                    ('Male', _('Male')),
                    ('Female', _('Female')),
                    ('Non-Binary', _('Non-Binary')),
                    ('Unknown', _('Unknown')),
                ]
            ),
            (
                'contact_number_type',
                [
                    ('', '---'),
                    ('Cell', _('Cell')),
                    ('Work', _('Work')),
                    ('Home', _('Home')),
                ]
            ),
            (
                'marital_status',
                [
                    ('', '---'),
                    ('Single', _('Single')),
                    ('Married', _('Married')),
                    ('Divorced', _('Divorced')),
                    ('Separated', _('Separated')),
                    ('Widowed', _('Widowed')),
                    ('Domestic Partner', _('Domestic Partner')),
                    ('Significant Other', _('Significant Other')),
                ]
            ),
            (
                'ethnicity',
                [
                    ('', '---'),
                    ('Hispanic/Latino', _('Hispanic/Latino')),
                    ('Non-Hispanic Latino', _('Non-Hispanic Latino')),
                    ('Decline to Report', _('Decline to Report')),
                    ('Unknown', _('Unknown')),
                ]
            ),
            (
                'race',
                [
                    ('', '---'),
                    ('Alaskan Native', _('Alaskan Native')),
                    ('American Indian', _('American Indian')),
                    ('Asian', _('Asian')),
                    ('Black', _('Black')),
                    ('Native-Hawaiian', _('Native-Hawaiian')),
                    ('Pacific Islander', _('Pacific Islander')),
                    ('White', _('White')),
                    ('Decline to Report', _('Decline to Report')),
                    ('Unknown', _('Unknown')),
                ]
            ),
            (
                'employment_status',
                [
                    ('', '---'),
                    ('Full-Time', _('Full-Time')),
                    ('Not Employed', _('Not Employed')),
                    ('Active Military Duty', _('Active Military Duty')),
                    ('Part Time', _('Part Time')),
                    ('Retired', _('Retired')),
                    ('Seasonal', _('Seasonal')),
                    ('Self-Employed', _('Self-Employed')),
                    ('Student Full-Time', _('Student Full-Time')),
                    ('Student Part-Time', _('Student Part-Time')),
                    ('Child', _('Child')),
                ],
            ),
            (
                'homeless_status',
                [
                    ('', '---'),
                    ('Not Homeless', _('Not Homeless')),
                    ('At Risk for Homeless', _('At Risk for Homeless')),
                    ('Currently Not Homless, was in Last 12 Months',
                     _('Currently Not Homless, was in Last 12 Months')),
                    ('Homeless, Unknown Shelter',
                     _('Homeless, Unknown Shelter')),
                    ('Shelter', _('Shelter')),
                    ('Living with Others', _('Living with Others')),
                    ('Street/Camp/Bridge', _('Street/Camp/Bridge')),
                    ('Transitional Housing', _('Transitional Housing')),

                ],
            ),
            (
                'farmworker_status',
                [
                    ('', '---'),
                    ('Not a Farmworker', _('Not a Farmworker')),
                    ('Migrant', _('Migrant')),
                    ('Seasonal', _('Seasonal')),
                ],
            ),
            (
                'income_frequency',
                [
                    ('', '---'),
                    ('Weekly', _('Weekly')),
                    ('Monthly', _('Monthly')),
                    ('Annually', _('Annually')),
                ],
            ),
            (
                'primary_language',
                [

                    ('', '------'),
                    ('English', _('English')),
                    ('Spanish', _('Spanish')),
                    ('Punjabi', _('Punjabi')),
                    ('Arabic', _('Arabic')),
                    ('American Sign Language', _('American Sign Language')),
                    ('Hmong', _('Hmong')),
                    ('Tagalog', _('Tagalog')),
                    ('Laotian', _('Laotian')),
                    ('Vietnamese ', _('Vietnamese ')),
                    ('Other', _('Other')),
                ]
            ),
            (
                'identification_document',
                [
                    ('', '----'),
                    ('Drivers licence', _('Drivers licence')),
                    ('State identification card', _('State identification card')),
                ]
            ),
            (
                'emergency_contact_relationship',
                relations_list
            ),
            (
                'subscriber_relationship',
                relations_list
            ),
            (
                'guarantor_relationship',
                relations_list
            ),
            (
                'state',
                state_list
            ),
            # (
            #     'city',
            #     cities_list
            # )
        ]
        for field_name, choices in choices_and_fields:
            # Since fields are re-assigned in this step, setting required, choices etc.
            # should come after this
            self.fields[field_name] = forms.ChoiceField(choices=choices)

        empty_labels = [
            ('county', _('Select Location')),
            ('preferred_day_of_week', _('Select a Preferred day of week')),
            ('vaccine_eligibility_status', _('Select Your Vaccine Eligibility Status?')),
            ('preferred_time_frame', _('Select a Preferred time frame')),
            ('gender', _('Select Gender')),
            ('marital_status', _('Select Marital status')),
            ('ethnicity', _('Select Ethnicity')),
            ('race', _('Select Race')),
            ('employment_status', _('Select Employment Status')),
            ('homeless_status', _('Select Homeless status')),
            ('farmworker_status', _('Select Farm worker status')),
            ('income_frequency', _('Select Income frequency')),
            ('primary_language', _('Select Primary Language')),
            ('identification_document', _('Select Identification Document')),
            ('emergency_contact_relationship',
             _('Select Emergency Contact Relationship')),
            ('subscriber_relationship', _('Select Subscriber Relationship')),
            ('guarantor_relationship', _('Select Guarantor\'s Relationship to Patient')),
            ('state', _('Select State')),
            # ('city', _('Select City')),
            ('appointment_type', _('Select Appointment Type')),
            ('covid_vaccine_manufacturer',_('Select the Vaccine')),
        ]
        for label_name, empty_message in empty_labels:
            existing_choices = self.fields[label_name].choices
            if existing_choices[0][0] == '':
                existing_choices = existing_choices[1:]
            self.fields[label_name].choices = [
                ('', empty_message)] + existing_choices
        
        if is_captcha_required():
            self.fields['g-recaptcha-response'] = forms.CharField(required=True)

        # These are not required since there is option for users to skip
        # input of these
        not_required_fields = [
            'covid_vaccine_manufacturer',
            'social_security_number',
            'family_size',
            'primary_insurance_carrier',
            'income_frequency',
            'identification_document',
            'subscriber_relationship',
            'guarantor_relationship',
            'city',
            'city_entered',
            'employer',
            'is_healthworker_or_above_age_65',
            'is_healthworker',
            'is_above_age_65',
        ]
        for field in not_required_fields:
            self.fields[field].required = False

        # Disable server side validatoin for easier testing
        # for field in self.fields:
        #     self.fields[field].required = False

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
        model = KHSAppointment
        fields = '__all__'
        required = ['is_archived']
        # widgets = {
        #     'is_previously_vaccinated': forms.RadioSelect(),
        # }
        time_slot = [
            ('8:00 AM', '8:00 AM'),
            ('8:15 AM', '8:15 AM'),
            ('8:30 AM','8:30 AM'),
            ('8:45 AM','8:45 AM'),
            ('9:00 AM','9:00 AM'),
            ('9:15 AM','9:15 AM'),
            ('9:30 AM','9:30 AM'),
            ('9:45 AM','9:45 AM'),
            ('10:00 AM','10:00 AM'),
            ('10:15 AM','10:15 AM'),
            ('10:30 AM','10:30 AM'),
            ('10:45 AM','10:45 AM'),
            ('11:00 AM','11:00 AM'),
            ('11:15 AM','11:15 AM'),
            ('11:30 AM','11:30 AM'),
            ('11:45 AM','11:45 AM'),
            ('1:00 PM', '1:00 PM'),
            ('1:15 PM', '1:15 PM'),
            ('1:30 PM','1:30 PM'),
            ('1:45 PM','1:45 PM'),
            ('2:00 PM','2:00 PM'),
            ('2:15 PM','2:15 PM'),
            ('2:30 PM','2:30 PM'),
            ('2:45 PM','2:45 PM'),
            ('3:00 PM','3:00 PM'),
            ('3:15 PM','3:15 PM'),
            ('3:30 PM','3:30 PM'),
            ('3:45 PM','3:45 PM'),
            ('4:00 PM','4:00 PM'),
            ('4:15 PM','4:15 PM'),
            ('4:30 PM','4:30 PM'),
            ('4:45 PM','4:45 PM'),
            ('5:00 PM','5:00 PM'),
        ]
        vaccinate_location = [
            ('Kern – Frazier Mountain Community Health Center',
             'Kern – Frazier Mountain Community Health Center'),
            ('Kern – Lamont Community Health Center',
             'Kern – Lamont Community Health Center'),
            ('Kern – East Bakersfield Community Health Center',
             'Kern – East Bakersfield Community Health Center'),
            ('Kern – Kern River Community Health Center',
             'Kern – Kern River Community Health Center'),
            ('Kern – Greenfield Community Health Center',
             'Kern – Greenfield Community Health Center'),
            ('Kern - Arvin Community Health Center',
             'Kern - Arvin Community Health Center'),
            ('Kern - South Bakersfield Community Health Center', 'Kern - South Bakersfield Community Health Center'),
            ('Kern - Bakers Street Village CHC', 'Kern - Bakers Street Village CHC'),
            ('Kern - 34th Street Community Health Center', 'Kern - 34th Street Community Health Center'),
            ('Kern - Deleno Community Health Center', 'Kern - Deleno Community Health Center'),
            ('Kern - East Niles Community Health Center', 'Kern - East Niles Community Health Center'),
            ('Kern - Central Bakersfield Community Health Center', 'Kern - Central Bakersfield Community Health Center'),
        ]
        vaccinate_location_all = [
            ('all', 'All'),
            ('Kern – Frazier Mountain Community Health Center',
             'Kern – Frazier Mountain Community Health Center'),
            ('Kern – Lamont Community Health Center',
             'Kern – Lamont Community Health Center'),
            ('Kern – East Bakersfield Community Health Center',
             'Kern – East Bakersfield Community Health Center'),
            ('Kern – Kern River Community Health Center',
             'Kern – Kern River Community Health Center'),
            ('Kern – Greenfield Community Health Center',
             'Kern – Greenfield Community Health Center'),
            ('Kern - Arvin Community Health Center',
             'Kern - Arvin Community Health Center'),
            ('Kern - South Bakersfield Community Health Center', 'Kern - South Bakersfield Community Health Center'),
            ('Kern - Bakers Street Village CHC', 'Kern - Bakers Street Village CHC'),
            ('Kern - 34th Street Community Health Center', 'Kern - 34th Street Community Health Center'),
            ('Kern - Deleno Community Health Center', 'Kern - Deleno Community Health Center'),
            ('Kern - East Niles Community Health Center', 'Kern - East Niles Community Health Center'),
            ('Kern - Central Bakersfield Community Health Center', 'Kern - Central Bakersfield Community Health Center'),
        ]

class UploadUrlModelForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        choices_and_fields = [
            (
                'identification_document',
                [
                    ('', '----'),
                    ('Drivers licence',_('Drivers licence')),
                    ('ID',_('ID')),
                ]
            ),
        ]

        for field_name, choices in choices_and_fields:
            # Since fields are re-assigned in this step, setting required, choices etc.
            # should come after this
            self.fields[field_name] = forms.ChoiceField(choices=choices)

        empty_labels = [
            ('identification_document', _('Select Identification Document'))
        ]
        for label_name, empty_message in empty_labels:
            existing_choices = self.fields[label_name].choices
            if existing_choices[0][0] == '':
                existing_choices = existing_choices[1:]
            self.fields[label_name].choices = [
                ('', empty_message)] + existing_choices

        not_required_fields = [
            'identification_document',
        ]
        for field in not_required_fields:
            self.fields[field].required = False

        if is_captcha_required():
            self.fields['g-recaptcha-response'] = forms.CharField(required=True)

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
        model = UploadUrlModel
        fields = '__all__'
        required = ['is_resolved']