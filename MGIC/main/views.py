import socket
import psutil
from datetime import datetime
from django.http import HttpResponseRedirect
from django.shortcuts import render
from main.models import Location, User


# Create your views here.

def home(request):
    local_ip = socket.gethostbyname(socket.gethostname())
    cpu = psutil.cpu_percent()
    memory = psutil.virtual_memory()
    memory_total = memory.total
    memory_used = memory.used
    try:
        location = Location.objects.get(IPAddress=local_ip)
        location.RunningState = True
        location.CPULoad = cpu
        location.TotalMemory = memory_total / 1024 / 1024
        location.MemoryLoad = memory_used / 1024 / 1024
        location.LastRefresh = datetime.now()
        location.save()
    except:
        location = Location(
            Name="",
            Latitude=0,
            Longitude=0,
            RunningState=True,
            IPAddress=local_ip,
            CPULoad=cpu,
            TotalMemory=memory_total,
            MemoryLoad=memory_used,
            LastRefresh=datetime.now()
        )
        location.save()
    finally:
        user_id = request.session.get("user")
        user = None
        if user_id is not None:
            user = User.objects.get(pk=user_id)
        return render(request, "home.html", {'user': user})


def control(request):
    user_id = request.session.get("user")
    if user_id is None:
        return HttpResponseRedirect("/home/")
    else:
        user = User.objects.get(pk=user_id)
        return render(request, "control.html", {'user': user})
