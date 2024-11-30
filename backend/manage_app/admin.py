from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Patient, Study, Serie, DicomFile, Image, Annotation, SegmentationModel, Segmentation, ImageCaptioningModel, Report
from .forms import UserAccountCreationForm, UserAccountChangeForm
from .models import UserAccount


class UserAccountAdmin(UserAdmin):
    add_form = UserAccountCreationForm
    form = UserAccountChangeForm
    model = UserAccount
    list_display = ('first_name', 'last_name', 'email', 'date_of_birth', 'phone', 'grade', 'is_staff', 'is_active',)
    list_filter = ('first_name', 'last_name', 'email', 'date_of_birth', 'phone', 'grade', 'groups', 'is_staff', 'is_active',)
    fieldsets = (
        (None, {"fields": ("first_name", "last_name", "email", "date_of_birth", "phone", "grade", "password")}),
        ("Permissions", {"fields": ("is_staff", "is_active", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "first_name", "last_name", "email", "date_of_birth", "phone", "grade", "password", "is_staff",
                "is_active", "groups", "user_permissions"
            )}
        ),
    )
    search_fields = ("first_name", "last_name", "email", "phone", "grade")
    ordering = ("first_name", "last_name", "email")


admin.site.register(UserAccount, UserAccountAdmin)
admin.site.register(Patient)
admin.site.register(Study)
admin.site.register(Serie)
admin.site.register(DicomFile)
admin.site.register(Image)
admin.site.register(Annotation)
admin.site.register(SegmentationModel)
admin.site.register(Segmentation)
admin.site.register(ImageCaptioningModel)
admin.site.register(Report)