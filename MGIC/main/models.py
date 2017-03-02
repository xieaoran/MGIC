from django.db import models


# Create your models here.

class Location(models.Model):
    Name = models.TextField()
    Latitude = models.FloatField()
    Longitude = models.FloatField()
    RunningState = models.BooleanField()
    IPAddress = models.TextField()
    CPULoad = models.SmallIntegerField()
    MemoryLoad = models.IntegerField()
    TotalMemory = models.IntegerField()
    LastRefresh = models.DateTimeField()


class ContractSize(models.Model):
    Name = models.TextField()
    ThreadCount = models.SmallIntegerField()


class User(models.Model):
    UserName = models.TextField()
    Password = models.TextField()
    Contract = models.ForeignKey(ContractSize)


class WorkSize(models.Model):
    Name = models.TextField()
    ThreadCount = models.SmallIntegerField()


class Work(models.Model):
    Name = models.TextField()
    User = models.ForeignKey(User)
    Location = models.ForeignKey(Location)
    WorkSize = models.ForeignKey(WorkSize)
    WorkState = models.SmallIntegerField()  # 0 - File Upload, 1 - Waiting, 2 - In Progress, 3 - Finished, -1 - Error
    StartTime = models.DateTimeField()
    EndTime = models.DateTimeField(null=True)
