import webcolors
from PIL import Image
from collections import Counter
import webcolors
import math

def get_dominant_color(image_path):
    # Open the image
    img = Image.open(image_path)
    
    # Convert the image to RGB (just in case it's in a different mode)
    img = img.convert("RGB")
    
    # Get all pixels in the image
    pixels = list(img.getdata())
    
    # Count the frequency of each color
    color_counter = Counter(pixels)
    
    # Get the most common color
    dominant_color, _ = color_counter.most_common(1)[0]
    
    return dominant_color


def get_color_name(color):
    try:
        rgb = color
        closest_name = webcolors.rgb_to_name(rgb)
        return closest_name
    except ValueError:
        return "No name found for this color"

image_path = "download-removebg-preview.png"  
dominant_color = get_dominant_color(image_path)

color_name = get_color_name(dominant_color)
print(f"The color name for {dominant_color} is {color_name}.")
