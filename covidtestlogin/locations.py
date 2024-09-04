from mainapp.models import Location

def fetchlocation():
    locations = list(Location.objects.filter(applocation__app__app_name__iexact='Vaccine Tracker').values('name'))
    tenant_locations = [('all','Select Location')] 
    for location in locations: 
        tenant_locations.append((location['name'],location['name']))
    return tenant_locations
