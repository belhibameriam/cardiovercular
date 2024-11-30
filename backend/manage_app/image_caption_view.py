import json
import openai
from roboflow import Roboflow
from PIL import Image
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
import os
from django.conf import settings
# Initialize Roboflow
rf = Roboflow(api_key="Ldk033AFZJ2DZbDhsZoo")  # Replace with your Roboflow API key
project = rf.workspace().project("yolo-zsauh")
roboflow_model = project.version(1).model

# Set up OpenAI
openai.api_key = "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"  # Replace with your OpenAI API key

# Function to extract features with Roboflow
def extract_features_with_roboflow(image_path):
    result = roboflow_model.predict(image_path, confidence=40).json()
    predictions = result['predictions']
    detected_features = [f"{pred['class']} with confidence {pred['confidence']:.2f}" for pred in predictions]
    return detected_features

# Function to generate a report with GPT-4
def generate_report_with_gpt4(features):
    messages = [
        {"role": "system", "content": "You are an expert radiologist."},
        {"role": "user", "content": f"Generate a detailed chest X-ray report based on the following detected features: {', '.join(features)}."}
    ]
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=messages,
        max_tokens=300,
        temperature=0.7
    )
    return response.choices[0].message['content'].strip()

# API Endpoint to handle X-ray analysis
@csrf_exempt
def image_caption(request):
    if request.method == "POST":
        uploaded_file = request.FILES['file']

        # Save the file to the MEDIA_ROOT
        file_path = default_storage.save(f"xray_images/{uploaded_file.name}", uploaded_file)

        # Construct the absolute path
        absolute_file_path = os.path.join(settings.MEDIA_ROOT, file_path)

        # Verify if the file exists
        if not os.path.exists(absolute_file_path):
            return JsonResponse({"error": f"File does not exist at {absolute_file_path}"}, status=500)

        try:
            # Extract features using Roboflow
            extracted_features = extract_features_with_roboflow(absolute_file_path)

            # Generate a dynamic report using GPT-4
            generated_report = generate_report_with_gpt4(extracted_features)

            # Return the result as JSON
            return JsonResponse({
                "features": extracted_features,
                "report": generated_report
            })
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method."}, status=400)
