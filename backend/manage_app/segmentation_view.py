import json
import requests
import base64
import os
from io import BytesIO
from PIL import Image
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.conf import settings
import uuid  # For generating random names

@csrf_exempt
def visualize_xray(request):
    if request.method == "POST":
        # Extract the image_url from the request body
        try:
            body = json.loads(request.body)
            image_url = body.get('image_url', None)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON in request body."}, status=400)

        if not image_url:
            return JsonResponse({"error": "Missing 'image_url' in request body."}, status=400)

        # Step 1: Define API details
        api_key = "Ldk033AFZJ2DZbDhsZoo"  # Replace with your Roboflow API key
        url = "https://detect.roboflow.com/infer/workflows/teste-fortp/detect-visualize"
        payload = {
            "api_key": api_key,
            "inputs": {
                "image": {"type": "url", "value": image_url}
            }
        }
        headers = {"Content-Type": "application/json"}

        # Step 2: Make an API request to Roboflow
        response = requests.post(url, json=payload, headers=headers)

        if response.status_code == 200:
            output_data = response.json()

            # Step 3: Extract and decode the base64 image from "output_image"
            output_image_base64 = output_data['outputs'][0]['output_image']['value']
            output_image_bytes = base64.b64decode(output_image_base64)

            # Step 4: Load the decoded image with PIL
            img = Image.open(BytesIO(output_image_bytes))

            # Step 5: Generate a random file name and save the image
            random_filename = f"{uuid.uuid4().hex}.png"
            file_path = os.path.join(settings.MEDIA_ROOT, "processed_images", random_filename)

            # Ensure the directory exists
            os.makedirs(os.path.dirname(file_path), exist_ok=True)

            # Save the processed image
            img.save(file_path, format="PNG")

            # Step 6: Return the URL of the saved image
            image_url = f"{settings.MEDIA_URL}processed_images/{random_filename}"
            return JsonResponse({"image_url": image_url})

        else:
            # Handle errors from the Roboflow API
            return JsonResponse({
                "error": f"Failed to fetch data from Roboflow. Status code: {response.status_code}",
                "details": response.text
            }, status=500)

    return JsonResponse({"error": "Invalid request method."}, status=400)
