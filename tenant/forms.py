import json
import requests
from django import forms
from django.conf import settings
from django.core.exceptions import ValidationError
from .models import Client, Domain
from django.utils.translation import gettext as _


class ClientForm(forms.ModelForm):

    class Meta:
        model = Client
        fields = '__all__'
        

