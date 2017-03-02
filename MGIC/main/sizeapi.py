from django.http import JsonResponse
from main.models import Work, WorkSize, ContractSize, User


def get_all_worksizes(request):
    worksizes = []
    user_id = request.session.get("user")
    if user_id is None:
        for worksize in WorkSize.objects.all():
            worksizes.append({
                "Id": worksize.pk,
                "Name": worksize.Name,
                "ThreadCount": worksize.ThreadCount
            })
    else:
        user = User.objects.get(pk=user_id)
        available_cores = user.Contract.ThreadCount
        works = Work.objects.filter(User=user)
        for work in works:
            if -1 < work.WorkState < 3:
                available_cores -= work.WorkSize.ThreadCount
        for worksize in WorkSize.objects.filter(ThreadCount__lte=available_cores):
            worksizes.append({
                "Id": worksize.pk,
                "Name": worksize.Name,
                "ThreadCount": worksize.ThreadCount
            })
    return JsonResponse(worksizes, safe=False)


def get_all_contractsizes(request):
    contractsizes = []
    for contractsize in ContractSize.objects.all():
        contractsizes.append({
            "Id": contractsize.pk,
            "Name": contractsize.Name,
            "ThreadCount": contractsize.ThreadCount
        })
    return JsonResponse(contractsizes, safe=False)
