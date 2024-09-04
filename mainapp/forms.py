from django import forms

class CustomMultipleChoiceField(forms.MultipleChoiceField):
    def to_python(self, value):
        if not value:
            return []
        elif isinstance(value, list):
            return value
        else:
            return [value]
