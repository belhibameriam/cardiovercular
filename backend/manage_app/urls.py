from django.urls import path
from . import views 
from . import image_caption_view
from . import segmentation_view

app_name='manage_app' 

urlpatterns = [ 

    path('api/patients/', views.PatientView.as_view()),
    path('api/patients/<int:pk>', views.SinglePatientView.as_view()),
    
    path('api/images/', views.ImagePView.as_view(), name= 'images_list'),
    path('api/images/<int:pk>/', views.ImagePViewDetail.as_view()),

    path('api/users/register', views.RegisterView.as_view()),
    path('api/users/me', views.RetrieveUserView.as_view()),

    path('api/get-access-token', views.get_access_token),

    path('auth/users/', views.CustomUserView.as_view({'get': 'list', 'post': 'create'}), name='user-list'),
    path('auth/users/<int:id>/', views.CustomUserView.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='user-detail'),

    path('api/studies/', views.StudyView.as_view()),
    path('api/studies/<int:pk>', views.SingleStudyView.as_view()),
    ##StudyByPatientView
    path('api/studies-by-patient/<int:pk>/', views.StudyByPatientView.as_view()),

    path('api/series/', views.SerieView.as_view()),
    path('api/series/<int:pk>', views.SingleSerieView.as_view()),

    path('api/dicom-files/', views.DicomFileView.as_view()),
    path('api/dicom-files/<int:pk>', views.SingleDicomFileView.as_view()),

    path('api/dicom-files-to-annotate/', views.DicomFileToAnnotateView.as_view()),
    path('api/dicom-files-to-annotate/<int:pk>', views.SingleDicomFileToAnnotateView.as_view()),

    path('api/dicom-images/', views.ImageView.as_view()),
    path('api/dicom-images/<int:pk>', views.SingleImageView.as_view()),

    path('api/annotations/', views.AnnotationView.as_view()),
    path('api/annotations/<int:pk>', views.SingleAnnotationView.as_view()),
    # path('api/annotations-by-image/<int:pk>/', views.AnnotationsByDicomFileIdView.as_view()),
    path('api/annotation-add-to-image/', views.AddAnnoationsToDicomFile.as_view()),
    path('api/annotation-dicom-file/<int:pk>/', views.DicomFileAnnotationsView.as_view()),
    path('api/annotation-dicom-file/<int:pk>/annotation', views.add_annotations_to_dicom_file, name='add_annotations_to_dicom_file'),

    path('api/annotation-dicom-file-to-annotate/<int:pk>/', views.DicomFileToAnnotateAnnotationsView.as_view()),
    path('api/annotation-dicom-file-to-annotate/<int:pk>/annotation', views.add_annotations_to_dicom_file_to_annotate, name='add_annotations_to_dicom_file_to_annotate'),


    path('api/segmentation-models/', views.SegmentationModelView.as_view()),
    path('api/segmentation-models/<int:pk>', views.SingleSegmentationModelView.as_view()),

    path('api/segmentations/', views.SegmentationView.as_view()),
    path('api/segmentations/<int:pk>', views.SingleSegmentationView.as_view()),

    path('api/image-captioning-models/', views.ImageCaptioningModelView.as_view()),
    path('api/image-captioning-models/<int:pk>', views.SingleImageCaptioningModelView.as_view()),

    path('api/reports/', views.ReportView.as_view()),
    path('api/reports/<int:pk>', views.SingleReportView.as_view()),

    path('api/upload/', views.image_upload),

    path('api/image-captioning/', image_caption_view.image_caption, name='image_caption'),
    path('api/segmentation/', segmentation_view.visualize_xray, name='visualize_xray'),
  
] 