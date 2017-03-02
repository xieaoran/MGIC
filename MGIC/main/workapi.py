import os
from zipfile import ZipFile, zlib
from django.conf import settings
from datetime import datetime
from django.http import JsonResponse, HttpResponseRedirect
from main.models import Work, Location, User, WorkSize


def new_work(request):
    result = {}
    if request.method == "POST":
        user_id = request.session.get("user")
        if user_id is None:
            result["success"] = False
            result["error"] = -2001
            return JsonResponse(result)
        work = Work(
            Name=request.POST["name"],
            User=User.objects.get(pk=user_id),
            Location=Location.objects.get(pk=request.POST["location"]),
            WorkSize=WorkSize.objects.get(pk=request.POST["worksize"]),
            WorkState=0,
            StartTime=datetime.now(),
            EndTime=None
        )
        work.save()
        result["success"] = True
        result["work"] = work.pk
    else:
        result["success"] = False
        result["error"] = -1
    return JsonResponse(result)


def upload_work_file(request):
    result = {}
    if request.method == "POST":
        work_id = request.POST["work"]
        user_id = request.session.get("user")
        try:
            work = Work.objects.get(pk=work_id)
            if work.User.id != user_id:
                result["success"] = False
                result["error"] = -2003
                return JsonResponse(result)
            handle_uploaded_file(work_id, request.FILES["Filedata"])
            work.WorkState = 1
            work.save()
            result["success"] = True
            result["info"] = 3002
        except:
            result["success"] = False
            result["error"] = -2002
    else:
        result["success"] = False
        result["error"] = -1
    return JsonResponse(result)


def handle_uploaded_file(work_id, work_file):
    input_dir = os.path.join(settings.STORAGE_DIR, work_id, "input")
    output_dir = os.path.join(settings.STORAGE_DIR, work_id, "output")
    file_path = os.path.join(input_dir, "input.zip")
    os.makedirs(input_dir)
    os.makedirs(output_dir)
    with open(file_path, 'wb') as destination:
        for chunk in work_file.chunks():
            destination.write(chunk)


def get_works(request):
    works = []
    user_id = request.session.get("user")
    if user_id is not None:
        user = User.objects.get(pk=user_id)
        for work in Work.objects.filter(User=user):
            works.append({
                "Id": work.pk,
                "Name": work.Name,
                "Location": work.Location.Name,
                "WorkSize": work.WorkSize.Name,
                "WorkState": work.WorkState,
            })
    return JsonResponse(works, safe=False)


def get_result(request):
    if request.METHOD == "GET" and "id" in request.GET:
        work_id = request.GET["id"]
        user_id = request.session.get("user")
        if user_id is not None:
            try:
                work = Work.objects.get(pk=work_id)
                if work.User.pk == user_id:
                    return HttpResponseRedirect("/storage/" + work_id + "/output/output.zip")
            except:
                return HttpResponseRedirect("/home/")
    return HttpResponseRedirect("/home/")
