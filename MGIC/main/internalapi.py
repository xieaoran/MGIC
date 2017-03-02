import json
from httplib import HTTPConnection
from datetime import datetime
from main.models import Location, Work
from django.http import JsonResponse


def request_heartbeat():
    for location in Location.objects.all():
        try:
            http_client = HTTPConnection(Location.IPAddress, 80, timeout=60)
            http_client.request("POST", "/api/heartbeat/")
            response = http_client.getresponse()
            heartbeat = json.loads(response)
            if not process_heartbeat(heartbeat):
                raise Exception("Invalid HeartBeat Response")
        except:
            location.RunningState = False
            location.LastRefresh = datetime.now()
            location.save()


def get_heartbeat(request):
    result = {}
    if request.METHOD == "POST":
        result["success"] = process_heartbeat(request.POST)
    else:
        result["success"] = False
        result["error"] = -1
    return JsonResponse(result)


def process_heartbeat(data):
    if "ip" in data and \
                    "cpuLoad" in data and \
                    "totalMemory" in data and \
                    "memoryLoad" in data:
        ip = data["ip"]
        cpu_load = data["cpuLoad"]
        total_memory = data["totalMemory"]
        memory_load = data["memoryLoad"]
        try:
            location = Location.objects.get(IPAddress=ip)
            location.RunningState = True
            location.CPULoad = cpu_load
            location.TotalMemory = total_memory / 1024 / 1024
            location.MemoryLoad = memory_load / 1024 / 1024
            location.LastRefresh = datetime.now()
            location.save()
        except:
            location = Location(
                Name="",
                Latitude=0,
                Longitude=0,
                RunningState=True,
                IPAddress=ip,
                CPULoad=cpu_load,
                TotalMemory=total_memory,
                MemoryLoad=memory_load,
                LastRefresh=datetime.now()
            )
            location.save()
        finally:
            return True
    else:
        return False


def get_work_file(request):
    result = {}
    if request.METHOD == "POST" and "freeThread" in request.POST:
        free_thread = request.POST["freeThread"]
        try:
            pass
        except:
            result["success"] = False
            result["error"] = -2002
    else:
        result["success"] = False
        result["error"] = -1
