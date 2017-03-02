"""MGIC URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from main.views import *
from main.userapi import *
from main.locationapi import *
from main.sizeapi import *
from main.workapi import *
from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin

urlpatterns = [
                  url(r'^admin/', include(admin.site.urls)),
                  url(r'^home/$', home),
                  url(r'^control/$', control),

                  url(r'^api/locations/$', get_all_locations),

                  url(r'^api/users/login/$', login),
                  url(r'^api/users/register/$', register),
                  url(r'^api/users/logout/$', logout),

                  url(r'^api/worksizes/$', get_all_worksizes),
                  url(r'^api/contractsizes/$', get_all_contractsizes),

                  url(r'^api/works/$', get_works),
                  url(r'^api/works/new/$', new_work),
                  url(r'^api/works/uploadfile/$', upload_work_file),
                  url(r'^api/works/getresult', get_result),
              ] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) + \
              static(settings.STORAGE_URL, document_root=settings.STORAGE_DIR)
