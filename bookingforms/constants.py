from cities_light.models import Country, Region, City

def get_regions_in_country(country_code):
    # Country is usa only now
    country=Country.objects.filter(code2=country_code).first()
    regions = country.region_set.all().values_list('geoname_code','name')
    regions_list = regions.values_list('geoname_code','name')
    return list(regions_list)

def get_cities_in_region(geoname_code=None, all_cities=False):
    qs = City.objects.all()
    if geoname_code:
        region = Region.objects.filter(geoname_code=geoname_code).first()
        qs = region.city_set.all()
    cities = qs.values_list('geoname_id','name')
    return list(cities)