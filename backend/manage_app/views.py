from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from django.http import Http404
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from djoser.views import UserViewSet
from rest_framework.exceptions import PermissionDenied
from django.views.decorators.csrf import csrf_exempt
import numpy as np
import PIL.Image
from . import create_model as cm
from .serializers import *
from .models import UserAccount
from django.http import JsonResponse
from rest_framework.permissions import BasePermission
import json
from rest_framework.decorators import api_view
from rest_framework_simplejwt.views import TokenObtainPairView


class IsSuperuserOrStaff(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_superuser or request.user.is_staff


def get_access_token(request):
    if "access" in request.COOKIES and "refresh" in request.COOKIES:
        return JsonResponse({"access": request.COOKIES["access"], "refresh": request.COOKIES["refresh"]})
    else:
        return JsonResponse({"access": None, "refresh": None})



class RegisterView(APIView):

    permission_classes = [IsAuthenticated, IsAdminUser, IsSuperuserOrStaff]

    def post(self, request):
        data = request.data

        serializer = UserCreateSerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.create(serializer.validated_data)
        user = UserSerializer(user)

        return Response(user.data, status=status.HTTP_201_CREATED)



class RetrieveUserView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user = UserSerializer(user)

        return Response(user.data, status=status.HTTP_200_OK)


class UserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser, IsSuperuserOrStaff]
    def get(self, request):
        users = UserAccount.objects.all()
        serializer=UserSerializer(users, many=True)
        return Response(serializer.data)
    


class CustomUserView(UserViewSet):

    permission_classes = [IsAuthenticated, IsAdminUser, IsSuperuserOrStaff]

    def destroy(self, request, *args, **kwargs):
        if not (request.user.is_superuser or request.user.is_staff):
            raise PermissionDenied("You do not have permission to delete this account.")
        try:
            user_id = kwargs['id']
            if request.user.id != user_id and not request.user.is_superuser and not request.user.is_staff:
                raise PermissionDenied("You do not have permission to perform this action.")
            self.perform_destroy(self.get_object()) 
            return Response(status=status.HTTP_204_NO_CONTENT) 
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST) 

    def put(self, request, *args, **kwargs):
        user = self.get_object()
        if not request.user.is_superuser and not request.user.is_staff:
            raise PermissionDenied("You do not have permission to perform this action.")
        return super().put(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        if not request.user.is_superuser and not request.user.is_staff:
            raise PermissionDenied("You do not have permission to perform this action.")
        return super().patch(request, *args, **kwargs)



class PatientView(generics.ListCreateAPIView):

    permission_classes = [IsAuthenticated]

    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

    
class SinglePatientView(generics.RetrieveUpdateAPIView, generics.DestroyAPIView):

    permission_classes = [IsAuthenticated]

    queryset = Patient.objects.all()
    serializer_class = PatientSerializer



class ImagePView(APIView):

    permission_classes = [IsAuthenticated]

    parser_classes = (MultiPartParser, FormParser) 

    def get(self, request, *args, **kwargs):
        images = ImageP.objects.all()

        patient_id = request.query_params.get('patient')
        if patient_id:
            images = images.filter(patient__id=patient_id) 

        serializer = ImagePSerializer(images, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        posts_serializer = ImagePSerializer(data=request.data)
        if posts_serializer.is_valid():
            posts_serializer.save()
            return Response(posts_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print('error', posts_serializer.errors)
            return Response(posts_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ImagePViewDetail(APIView):
    
    permission_classes = [IsAuthenticated]
    
    parser_classes = (MultiPartParser, FormParser) 

    def get_object(self, pk):
        try:
            return ImageP.objects.get(pk=pk)
        except ImageP.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        image = self.get_object(pk)
        serializer = ImagePSerializer(image)
        return Response(serializer.data)

    def put(self, request, pk):
        image = self.get_object(pk)
        serializer = ImagePSerializer(image, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        image = self.get_object(pk)
        if image.image_url:
            image.image_url.delete()
        image.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, pk):
        image = self.get_object(pk)
        serializer = ImagePSerializer(image, data=request.data, partial=True) 
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class StudyView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        studies = Study.objects.all()

        patient_id = request.query_params.get('patient')
        if patient_id:
            studies = studies.filter(patient__id=patient_id) 

        serializer = StudySerializer(studies, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        posts_serializer = StudySerializer(data=request.data)
        if posts_serializer.is_valid():
            posts_serializer.save()
            return Response(posts_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print('error', posts_serializer.errors)
            return Response(posts_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class SingleStudyView(generics.RetrieveUpdateAPIView, generics.DestroyAPIView):

    permission_classes = [IsAuthenticated]

    queryset = Study.objects.all()
    serializer_class = StudySerializer


##get studies by patient id
class StudyByPatientView(APIView):
    
        permission_classes = [IsAuthenticated]
    
        def get(self, request, *args, **kwargs):
            patient_id = kwargs['pk']
            studies = Study.objects.filter(patient__id=patient_id)
            serializer = StudySerializer(studies, many=True)
            return Response(serializer.data)



class SerieView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        series = Serie.objects.all()

        study_id = request.query_params.get('study')
        if study_id:
            series = series.filter(study__id=study_id) 

        serializer = SerieSerializer(series, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        posts_serializer = SerieSerializer(data=request.data)
        if posts_serializer.is_valid():
            posts_serializer.save()
            return Response(posts_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print('error', posts_serializer.errors)
            return Response(posts_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class SingleSerieView(generics.RetrieveUpdateAPIView, generics.DestroyAPIView):

    permission_classes = [IsAuthenticated]

    queryset = Serie.objects.all()
    serializer_class = SerieSerializer



class DicomFileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        images = DicomFile.objects.all()

        series_id = request.query_params.get('series')
        if series_id:
            images = images.filter(series__id=series_id) 

        serializer = DicomFileSerializer(images, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        posts_serializer = DicomFileSerializer(data=request.data)
        if posts_serializer.is_valid():
            posts_serializer.save()
            return Response(posts_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print('error', posts_serializer.errors)
            return Response(posts_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DicomFileToAnnotateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        images = DicomFileToAnnotate.objects.all()

        # series_id = request.query_params.get('series')
        # if series_id:
        #     images = images.filter(series__id=series_id) 

        serializer = DicomFileToAnnotateSerializer(images, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        posts_serializer = DicomFileToAnnotateSerializer(data=request.data)
        if posts_serializer.is_valid():
            posts_serializer.save()
            return Response(posts_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print('error', posts_serializer.errors)
            return Response(posts_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class SingleDicomFileView(APIView):

    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        try:
            return DicomFile.objects.get(pk=pk)
        except DicomFile.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        dicom_image = self.get_object(pk)
        serializer = DicomFileSerializer(dicom_image)
        return Response(serializer.data)

    def put(self, request, pk):
        dicom_image = self.get_object(pk)
        serializer = DicomFileSerializer(dicom_image, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        dicom_image = self.get_object(pk)
        if dicom_image.image_url:
            dicom_image.image_url.delete()
        dicom_image.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, pk):
        dicom_image = self.get_object(pk)
        serializer = DicomFileSerializer(dicom_image, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SingleDicomFileToAnnotateView(APIView):

    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        try:
            return DicomFileToAnnotate.objects.get(pk=pk)
        except DicomFileToAnnotate.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        dicom_image = self.get_object(pk)
        serializer = DicomFileToAnnotateSerializer(dicom_image)
        return Response(serializer.data)

    def put(self, request, pk):
        dicom_image = self.get_object(pk)
        serializer = DicomFileToAnnotateSerializer(dicom_image, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        dicom_image = self.get_object(pk)
        if dicom_image.image_url:
            dicom_image.image_url.delete()
        dicom_image.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, pk):
        dicom_image = self.get_object(pk)
        serializer = DicomFileToAnnotateSerializer(dicom_image, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class ImageView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        images = Image.objects.all()

        dicom_file_id = request.query_params.get('dicom_file')
        name = request.query_params.get('name')

        if dicom_file_id:
            if dicom_file_id.isdigit():
                images = images.filter(dicom_file__id=dicom_file_id)  
            else:
                images = []
                return JsonResponse({'error': 'Invalid request'})
        
        if name:
            images = images.filter(url_name=name) 
            

        serializer = ImageSerializer(images, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        posts_serializer = ImageSerializer(data=request.data)
        if posts_serializer.is_valid():
            posts_serializer.save()
            return Response(posts_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print('error', posts_serializer.errors)
            return Response(posts_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SingleImageView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Image.objects.get(pk=pk)
        except Image.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        image = self.get_object(pk)
        serializer = ImageSerializer(image)
        return Response(serializer.data)

    def put(self, request, pk):
        image = self.get_object(pk)
        serializer = ImageSerializer(image, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        image = self.get_object(pk)
        if image.image_url:
            image.image_url.delete()
        image.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, pk):
        image = self.get_object(pk)
        serializer = ImageSerializer(image, data=request.data, partial=True) # set partial=True to update a data partially
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)        



class AnnotationView(generics.ListCreateAPIView):

    permission_classes = [IsAuthenticated]

    queryset = Annotation.objects.all()
    serializer_class = AnnotationSerializer

    
class SingleAnnotationView(generics.RetrieveUpdateAPIView, generics.DestroyAPIView):

    permission_classes = [IsAuthenticated]

    queryset = Annotation.objects.all()
    serializer_class = AnnotationSerializer


class DicomFileAnnotationsView(APIView):
        
            permission_classes = [IsAuthenticated]
        
            def get(self, request, *args, **kwargs):
                dicom_file_id = kwargs['pk']
                annotations = Annotation.objects.filter(file__id=dicom_file_id)
                serializer = AnnotationSerializer(annotations, many=True)
                return Response(serializer.data)

@api_view(['PATCH'])
def add_annotations_to_dicom_file(request, pk):
    if request.method == 'PATCH':
        try:
            dicom_file = DicomFile.objects.get(pk=pk)
        except DicomFile.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, data={'message': 'Dicom file not found'})
        
        data = request.data


        print(data['annotations'])

        annotations = json.loads(data['annotations'])

        dicom_file.annotations = annotations

        dicom_file.save()
        

        
        return Response(status=status.HTTP_201_CREATED, data={'message': 'Annotations added successfully'})

class DicomFileToAnnotateAnnotationsView(APIView):
        
            permission_classes = [IsAuthenticated]
        
            def get(self, request, *args, **kwargs):
                dicom_file_id = kwargs['pk']
                annotations = Annotation.objects.filter(file__id=dicom_file_id)
                serializer = AnnotationSerializer(annotations, many=True)
                return Response(serializer.data)

@api_view(['PATCH'])
def add_annotations_to_dicom_file_to_annotate(request, pk):
    if request.method == 'PATCH':
        try:
            dicom_file = DicomFileToAnnotate.objects.get(pk=pk)
        except DicomFileToAnnotate.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, data={'message': 'Dicom file not found'})
        
        data = request.data


        print(data['annotations'])

        annotations = json.loads(data['annotations'])

        dicom_file.annotations = annotations

        dicom_file.save()
        

        
        return Response(status=status.HTTP_201_CREATED, data={'message': 'Annotations added successfully'})

class AddAnnoationsToDicomFile(APIView):
    
        permission_classes = [IsAuthenticated]
    
        def post(self, request):
            data = request.data
            # print(data['annotations'])
            annotations = json.loads(data['annotations'])
            dicom_file_id = data.get('dicom_file_id')
            # annotations = data.get('annotations')

    
            dicom_file = DicomFile.objects.get(pk=dicom_file_id)
    
            for annotation in annotations:
                an_data = {
                    'data': annotation,
                    'file': dicom_file,
                    'file_id': dicom_file_id
                }
                print(an_data)
                serializer = AnnotationSerializer(data=an_data)
                if serializer.is_valid():
                    serializer.save()
    
            return Response(status=status.HTTP_201_CREATED, data={'message': 'Annotations added successfully'})

class SegmentationModelView(generics.ListCreateAPIView):

    permission_classes = [IsAuthenticated]

    queryset = SegmentationModel.objects.all()
    serializer_class = SegmentationModelSerializer

    
class SingleSegmentationModelView(APIView):

    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return SegmentationModel.objects.get(pk=pk)
        except SegmentationModel.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        model = self.get_object(pk)
        serializer = SegmentationModelSerializer(model)
        return Response(serializer.data)

    def put(self, request, pk):
        model = self.get_object(pk)
        serializer = SegmentationModelSerializer(model, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        model = self.get_object(pk)
        if model.model_file:
            model.model_file.delete()
        model.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, pk):
        model = self.get_object(pk)
        serializer = SegmentationModelSerializer(model, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 



class SegmentationView(generics.ListCreateAPIView):

    permission_classes = [IsAuthenticated]

    queryset = Segmentation.objects.all()
    serializer_class = SegmentationSerializer

    
class SingleSegmentationView(generics.RetrieveUpdateAPIView, generics.DestroyAPIView):

    permission_classes = [IsAuthenticated]

    queryset = Segmentation.objects.all()
    serializer_class = SegmentationSerializer



class ImageCaptioningModelView(generics.ListCreateAPIView):

    permission_classes = [IsAuthenticated]

    queryset = ImageCaptioningModel.objects.all()
    serializer_class = ImageCaptioningModelSerializer

    
class SingleImageCaptioningModelView(APIView):

    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return ImageCaptioningModel.objects.get(pk=pk)
        except ImageCaptioningModel.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        model = self.get_object(pk)
        serializer = ImageCaptioningModelSerializer(model)
        return Response(serializer.data)

    def put(self, request, pk):
        model = self.get_object(pk)
        serializer = ImageCaptioningModelSerializer(model, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        model = self.get_object(pk)
        if model.model_file:
            model.model_file.delete()
        model.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, pk):
        model = self.get_object(pk)
        serializer = ImageCaptioningModelSerializer(model, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 



class ReportView(generics.ListCreateAPIView):

    permission_classes = [IsAuthenticated]

    queryset = Report.objects.all()
    serializer_class = ReportSerializer

    
class SingleReportView(generics.RetrieveUpdateAPIView, generics.DestroyAPIView):

    permission_classes = [IsAuthenticated]

    queryset = Report.objects.all()
    serializer_class = ReportSerializer



@csrf_exempt
def image_upload(request):
    if request.method == 'POST' and request.FILES['image']:
        image_file = request.FILES['image']
        
        if (image_file is not None):
            image_file = PIL.Image.open(image_file).convert("RGB") 
            image_file = np.array(image_file)/255
            
            caption = cm.function1([image_file], [image_file])

        output = {'result': caption[0]}
        return JsonResponse(output)
    else:
        return JsonResponse({'error': 'Invalid request'})


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer