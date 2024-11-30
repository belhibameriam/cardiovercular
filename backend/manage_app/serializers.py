from rest_framework import serializers
from .models import *
from datetime import date
import bleach
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions
from django.contrib.auth.models import Group
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings


class GroupSerializer(serializers.PrimaryKeyRelatedField, serializers.ModelSerializer):
    class Meta:
        model= Group
        fields = ('id','name')


User = get_user_model()

class UserCreateSerializer(serializers.ModelSerializer): 


    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email', 'date_of_birth', 'phone', 'grade', 'is_staff', 'groups', 'password')

    def validate(self, data):
        user = User(**data)
        password = data.get('password')

        try:
            validate_password(password, user)
        except exceptions.ValidationError as e:
            serializer_errors = serializers.as_serializer_error(e)
            raise exceptions.ValidationError(
                {'password': serializer_errors['non_field_errors']}
            )
            
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            first_name = validated_data['first_name'],
            last_name = validated_data['last_name'],
            email = validated_data['email'],
            date_of_birth = validated_data['date_of_birth'],
            phone = validated_data['phone'],
            grade = validated_data['grade'],
            password = validated_data['password'],
        )

        return user



class UserSerializer(serializers.ModelSerializer): 

    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email', 'date_of_birth', 'phone', 'grade', 'is_staff', 'groups')



class PatientSerializer(serializers.ModelSerializer):

    age = serializers.SerializerMethodField(method_name='calculate_age')

    def validate(self, attrs):
        attrs['first_name'] = bleach.clean(attrs['first_name'])
        attrs['last_name'] = bleach.clean(attrs['last_name'])
        attrs['phone_number'] = bleach.clean(attrs['phone_number'])
        attrs['address'] = bleach.clean(attrs['address'])

        return super().validate(attrs)

    class Meta:
        model = Patient 
        fields = ['pk', 'first_name', 'last_name', 'phone_number', 'address', 'date_of_birth', 'age', 'gender']

    def calculate_age(self, born:Patient):
        today = date.today()
        return today.year - born.date_of_birth.year - ((today.month, today.day) < (born.date_of_birth.month, born.date_of_birth.day))
    


class ImagePSerializer(serializers.ModelSerializer):

    patient = serializers.ReadOnlyField(source='patient.first_name')
    patient_id = serializers.IntegerField(write_only=True)
    image_url = serializers.ImageField() 

    def validate(self, attrs):
        attrs['title'] = bleach.clean(attrs['title'])
        attrs['description'] = bleach.clean(attrs['description'])

        return super().validate(attrs)

    class Meta:
        model = ImageP
        fields = ['id', 'title', 'description', 'patient', 'patient_id', 'image_url']



class StudySerializer(serializers.ModelSerializer):

    patient = serializers.ReadOnlyField(source='patient.first_name' + 'patient.last_name')
    patient_id = serializers.IntegerField(write_only=True)

    def validate(self, attrs):
        attrs['study_description'] = bleach.clean(attrs['study_description'])

        return super().validate(attrs)

    class Meta:
        model = Study 
        fields = ['id', 'study_date', 'study_description', 'patient', 'patient_id']



class SerieSerializer(serializers.ModelSerializer):

    study_id = serializers.IntegerField(write_only=True)
    
    def validate(self, attrs):
        attrs['modality'] = bleach.clean(attrs['modality'])
        attrs['description'] = bleach.clean(attrs['description'])

        return super().validate(attrs)

    class Meta:
        model = Serie 
        fields = ['id', 'modality', 'date', 'description', 'study_id']

class AnnotationSerializer(serializers.ModelSerializer):

    file = serializers.ReadOnlyField(source='file.title')
    file_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Annotation
        fields = ['id', 'file_name', 'file_size', 'region_count', 'region_id', 'region_shape_attributes_tool_name', 
            'region_shape_attributes_value', 'region_attributes_tag', 'region_attributes_tag_value',
            'region_attributes_comment', 'region_attributes_comment_value','file_id', 'file'
        ]

class DicomFileSerializer(serializers.ModelSerializer):

    series = serializers.ReadOnlyField(source='series.modality')
    series_id = serializers.IntegerField(write_only=True)
    image_url = serializers.FileField()
    # annotations = AnnotationSerializer(many=True, read_only=True)
    


    def validate(self, attrs):
        attrs['title'] = bleach.clean(attrs['title'])
        attrs['description'] = bleach.clean(attrs['description'])

        return super().validate(attrs)

    class Meta:
        model = DicomFile
        fields = ['id', 'title', 'description', 'series', 'series_id', 'image_url', 'annotations']



class ImageSerializer(serializers.ModelSerializer):

    # dicom_file = serializers.ReadOnlyField(source='dicomfile.title')
    # dicom_file_id = serializers.IntegerField(write_only=True)
    image_url = serializers.ImageField() 


    def validate(self, attrs):
        attrs['title'] = bleach.clean(attrs['title'])
        attrs['description'] = bleach.clean(attrs['description'])

        return super().validate(attrs)

    class Meta:
        model = Image
        fields = ['id', 'title', 'description', 'image_url', 'url_name']

    '''def image_url_name(self, url:Image):
        return str(url.image_url).split('/')[-1]'''



class SegmentationModelSerializer(serializers.ModelSerializer):

    model_file = serializers.FileField()

    def validate(self, attrs):
        attrs['name'] = bleach.clean(attrs['name'])
        attrs['type'] = bleach.clean(attrs['type'])
        attrs['version'] = bleach.clean(attrs['version'])
        attrs['model_description'] = bleach.clean(attrs['model_description'])

        return super().validate(attrs)

    class Meta:
        model = SegmentationModel 
        fields = ['id', 'name', 'type', 'version', 'model_description', 'model_file']



class SegmentationSerializer(serializers.ModelSerializer):

    image = serializers.ReadOnlyField(source='image.title')
    image_id = serializers.IntegerField(write_only=True)
    segmentation_model = serializers.ReadOnlyField(source='segmentationmodel.name')
    segmentation_model_id = serializers.IntegerField(write_only=True)


    class Meta:
        model = Segmentation
        fields = ['id', 'image_url', 'image', 'image_id', 'segmentation_model', 'segmentation_model_id']


class ImageCaptioningModelSerializer(serializers.ModelSerializer):

    model_file = serializers.FileField()

    def validate(self, attrs):
        attrs['name'] = bleach.clean(attrs['name'])
        attrs['type'] = bleach.clean(attrs['type'])
        attrs['version'] = bleach.clean(attrs['version'])
        attrs['model_description'] = bleach.clean(attrs['model_description'])

        return super().validate(attrs)

    class Meta:
        model = ImageCaptioningModel 
        fields = ['id', 'name', 'type', 'version', 'model_description', 'model_file']



class ReportSerializer(serializers.ModelSerializer):

    image = serializers.ReadOnlyField(source='image.title')
    image_id = serializers.IntegerField(write_only=True)
    image_captioning_model = serializers.ReadOnlyField(source='imagecaptioningmodel.name')
    image_captioning_model_id = serializers.IntegerField(write_only=True)


    class Meta:
        model = Report
        fields = ['id', 'report', 'image', 'image_id', 'image_captioning_model', 'image_captioning_model_id']



##new serializer related to users login 
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
  
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        refresh = self.get_token(self.user)

        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)
        data['name'] = self.user.first_name + " " + self.user.last_name
        data['email'] = self.user.email
        data['id'] = self.user.id
        # if api_settings.UPDATE_LAST_LOGIN:
        #     update_last_login(None, self.user)

        return data
    
class DicomFileToAnnotateSerializer(serializers.ModelSerializer):

    # series = serializers.ReadOnlyField(source='series.modality')
    # series_id = serializers.IntegerField(write_only=True)
    image_url = serializers.FileField()
    # annotations = AnnotationSerializer(many=True, read_only=True)
    


    # def validate(self, attrs):
    #     attrs['title'] = bleach.clean(attrs['title'])
    #     attrs['description'] = bleach.clean(attrs['description'])

    #     return super().validate(attrs)

    class Meta:
        model = DicomFileToAnnotate
        fields = ['id', 'image_url', 'annotations']