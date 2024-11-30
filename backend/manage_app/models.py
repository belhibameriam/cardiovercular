import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from phone_field import PhoneField


class UserAccountManager(BaseUserManager):

    def create_user(self, first_name, last_name, email, date_of_birth, phone, grade, password=None):
        if not email:
            raise ValueError('Users must have an email address')

        email = self.normalize_email(email)
        email.lower()

        user = self.model(
            first_name=first_name, 
            last_name=last_name, 
            email=email, 
            date_of_birth=date_of_birth, 
            phone=phone, 
            grade=grade
        )

        user.set_password(password)
        user.save(using=self._db)

        return user


    def create_superuser(self, first_name, last_name, email, date_of_birth, phone, grade, password=None):

        user = self.create_user(
            first_name=first_name, 
            last_name=last_name, 
            email=email, 
            date_of_birth=date_of_birth, 
            phone=phone, 
            grade=grade,
            password=password
        )

        user.is_staff =  True
        user.is_superuser = True
        user.is_active = True

        user.save(using=self._db)

        return user



class UserAccount(AbstractBaseUser, PermissionsMixin):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, unique=True)
    date_of_birth = models.DateField()
    phone = PhoneField()
    grade = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'date_of_birth', 'phone', 'grade']

    def __str__(self):
        return f"{self.last_name} {self.first_name}"

    def get_groups(self):
        return self.groups



GENDER_CHOICES = (
    ("Male", "Male"),
    ("Female", "Female"),
)

class Patient(models.Model):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=31) #PhoneField()
    address = models.TextField()
    date_of_birth = models.DateField()
    gender = models.CharField(max_length = 6, choices= GENDER_CHOICES, default="MALE")

    def __str__(self) -> str:

        return f"{self.last_name} {self.first_name}"



def upload_to(instance, filename):
    pid = instance.dicom_file.series.study.patient.id
    pfname = instance.dicom_file.series.study.patient.first_name
    plname = instance.dicom_file.series.study.patient.last_name
    dicom_name = str(instance.dicom_file.image_url).split("/")[-1]
    dicom_name = dicom_name[:-4]
    return f'images/{pid}_{pfname}_{plname}/{dicom_name}/{instance.dicom_file.id}__{filename}'.format(filename=filename)

class ImageP(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    image_url = models.ImageField(upload_to=upload_to)
    patient = models.ForeignKey(Patient, on_delete=models.PROTECT) ######DicomFile
    
    def __str__(self) -> str:
        return self.title



class Study(models.Model):
    study_date = models.DateTimeField(default=timezone.now)
    study_description = models.TextField()
    patient = models.ForeignKey(Patient, on_delete=models.PROTECT)


    def __str__(self) -> str:
        return str(self.study_date) + " " + self.patient.first_name + " " + self.patient.last_name



class Serie(models.Model):
    modality = models.CharField(max_length=50)
    date = models.DateTimeField(default=timezone.now)
    description = models.TextField()
    study = models.ForeignKey(Study, on_delete=models.PROTECT)

    def __str__(self) -> str:
        return str(self.date) + " " + f"{self.study.patient.first_name} {self.study.patient.last_name}"



def upload_to_dicom(instance, filename):
    pid = instance.series.study.patient.id
    stid = instance.series.study.id
    sid = instance.series.id
    return f'dicom_images/{pid}_{stid}_{sid}__{filename}'.format(filename=filename)

class DicomFile(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    image_url = models.FileField(upload_to=upload_to_dicom)
    series = models.ForeignKey(Serie, on_delete=models.PROTECT)
    annotations = models.JSONField(default=[])
    
    def __str__(self) -> str:
        return self.title
    
def gen_unique_filename(filename):
    return str(uuid.uuid4()) + filename
    
def upload_to_dicom_file_to_annotate(instance, filename):
    ##generate a unique name for the file
    return f'dicom_files_to_annotate/{gen_unique_filename(filename)}'.format(filename=filename)

    
class DicomFileToAnnotate(models.Model):
    # title = models.CharField(max_length=255)
    # description = models.TextField()
    image_url = models.FileField(upload_to=upload_to_dicom_file_to_annotate)
    annotations = models.JSONField(default=[])
    
    def __str__(self) -> str:
        return self.title



class Image(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    image_url = models.ImageField(upload_to=upload_to)
    url_name = models.CharField(null=True)
    # dicom_file = models.ForeignKey(DicomFile, on_delete=models.PROTECT)
    
    def __str__(self) -> str:
        return self.title

    def save(self, force_insert=False, force_update=False, using=None,  update_fields=None):  
        if self._state.adding: 
            self.url_name = str(self.image_url).split('/')[-1]
        super().save(force_insert, force_update, using, update_fields)



def upload_to_segmentation_model(instance, filename):
    return 'segmentation_files/{filename}'.format(filename=filename)

class SegmentationModel(models.Model):
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    version = models.CharField(max_length=50)
    model_description = models.TextField()
    model_file = models.FileField(upload_to=upload_to_segmentation_model)

    def __str__(self) -> str:
        return self.name



def upload_to_segmentations(instance, filename):
    return 'segmented_images/{filename}'.format(filename=filename)

class Segmentation(models.Model):
    image_url = models.ImageField(upload_to=upload_to_segmentations)
    image = models.ForeignKey(Image, on_delete=models.PROTECT)
    segmentation_model = models.ForeignKey(SegmentationModel, on_delete=models.PROTECT)

    def __str__(self) -> str:
        return f"{self.image.title} {self.segmentation_model.name}"



def upload_to_caption_model(instance, filename):
    return 'caption_files/{filename}'.format(filename=filename)

class ImageCaptioningModel(models.Model):
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    version = models.CharField(max_length=50)
    model_description = models.TextField()
    model_file = models.FileField(upload_to=upload_to_caption_model)

    def __str__(self) -> str:
        return self.name



class Report(models.Model):
    report = models.TextField()
    image = models.ForeignKey(Image, on_delete=models.PROTECT)
    image_captioning_model = models.ForeignKey(ImageCaptioningModel, on_delete=models.PROTECT)

    def __str__(self) -> str:
        return f"{self.image.title} {self.image_captioning_model.name}"



class Annotation(models.Model):
    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField()
    region_count = models.IntegerField()
    region_id = models.CharField(max_length=255)
    region_shape_attributes_tool_name = models.CharField(max_length=255) #FragmentSelector #SvgSelector
    region_shape_attributes_value = models.TextField()
    region_attributes_tag = models.CharField(max_length=255, blank=True) #tagging
    region_attributes_tag_value = models.CharField(max_length=255, blank=True)
    region_attributes_comment = models.CharField(max_length=255, blank=True) #commenting
    region_attributes_comment_value = models.CharField(max_length=255, blank=True)
    file = models.ForeignKey(DicomFile, on_delete=models.PROTECT)

# class Annotation(models.Model):
#     data = models.JSONField(default=dict)
#     file = models.ForeignKey(DicomFile, on_delete=models.PROTECT)