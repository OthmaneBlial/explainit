import os
import requests
from PIL import Image
from io import BytesIO

def create_icons(image_source, output_folder):
    sizes = [16, 32, 48, 128]
    
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    # Check if the image_source is a URL or a local file
    if image_source.startswith(('http://', 'https://')):
        response = requests.get(image_source)
        original = Image.open(BytesIO(response.content))
    else:
        original = Image.open(image_source)
    
    for size in sizes:
        icon = original.resize((size, size), Image.LANCZOS)
        icon.save(f"{output_folder}/icon-{size}.png")

    print(f"Icons generated in {output_folder}")

# Usage example
image_source = input("Enter image path or URL: ")
output_folder = input("Enter output folder name (default is 'icons'): ") or "icons"

create_icons(image_source, output_folder)