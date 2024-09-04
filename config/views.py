from django.views.generic import View
from http.client import HTTPResponse

from django.http import HttpResponse, HttpResponseNotFound
class Home(View):
    def get(self,request):
       return HttpResponse('<h1>Welcome Home</h1>')