from django.contrib import admin

# Register your models here.
from .models import Arendatori, Contracte

admin.site.register(Arendatori)
admin.site.register(Contracte)

