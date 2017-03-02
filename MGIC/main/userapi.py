from django.http import JsonResponse, HttpResponseRedirect
from main.models import User
from main.models import ContractSize


def login(request):
    result = {}
    if request.method == "POST":
        try:
            user = User.objects.get(UserName=request.POST["username"])
            input_pass = request.POST["password"]
            if user.Password == input_pass:
                request.session["user"] = user.pk
                result["success"] = True
                result["info"] = 1001
            else:
                result["success"] = False
                result["error"] = -1002
        except:
            result["success"] = False
            result["error"] = -1001
    else:
        result["success"] = False
        result["error"] = -1
    return JsonResponse(result)


def register(request):
    result = {}
    if request.method == "POST":
        user = User.objects.filter(UserName=request.POST["username"])
        if len(user) != 0:
            result["success"] = False
            result["error"] = -1003
        else:
            new_user = User(
                UserName=request.POST["username"],
                Password=request.POST["password"],
                Contract=ContractSize.objects.get(pk=request.POST["contract"])
            )
            new_user.save()
            request.session["user"] = new_user.pk
            result["success"] = True
            result["info"] = 1002
    else:
        result["success"] = False
        result["error"] = -1
    return JsonResponse(result)


def logout(request):
    request.session.clear()
    return HttpResponseRedirect("/home/")
