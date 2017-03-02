from django.http import JsonResponse
from main.models import Location


def get_all_locations(request):
    locations = []
    for location in Location.objects.all():
        locations.append({
            "Id": location.pk,
            "Name": location.Name,
            "Latitude": location.Latitude,
            "Longitude": location.Longitude,
            "RunningState": location.RunningState,
            "IPAddress": location.IPAddress,
            "CPULoad": location.CPULoad,
            "MemoryLoad": location.MemoryLoad,
            "TotalMemory": location.TotalMemory,
            "LastRefresh": location.LastRefresh.strftime("%Y-%m-%d %H:%M:%S")
        })
    return JsonResponse(locations, safe=False)
