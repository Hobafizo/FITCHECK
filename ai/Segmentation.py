from typing import List
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uvicorn
import os

# Background Removal Packages
from rembg import remove
from PIL import Image

#region Color Extraction
import cv2
import numpy as np
from sklearn.cluster import KMeans
import pandas as pd
from colorthief import ColorThief

bdf= pd.read_csv("Color Extractor/Datasets/BigColorData.csv")
sdf= pd.read_csv("Color Extractor/Datasets/fashion-colors.csv")

def big_find_closest_color(r, g, b):
    distances = np.sqrt((bdf["redDecimal"] - r) ** 2 +
                        (bdf["greenDecimal"] - g) ** 2 +
                        (bdf["blueDecimal"] - b) ** 2)
    
    min_index = distances.idxmin()
    
    return bdf.loc[min_index, "name"]

def small_find_closest_color(r, g, b):
    distances = np.sqrt((sdf["R"] - r) ** 2 +
                        (sdf["G"] - g) ** 2 +
                        (sdf["B"] - b) ** 2)
    
    min_index = distances.idxmin()
    
    return sdf.loc[min_index, "Color Name"]

def ignore_alpha(image_path):
    """Loads a PNG image and extracts only the non-transparent pixels."""
    image = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)

    if image.shape[2] == 4:  # Check if it has an alpha channel
        rgb_image = image[:, :, :3]  # Extract RGB channels
        alpha_channel = image[:, :, 3]  # Extract alpha (transparency)
        clothing_pixels = rgb_image[alpha_channel > 0]  # Keep only opaque clothing pixels
        return clothing_pixels
    else:
        raise ValueError("Image does not have an alpha channel. Ensure it is a transparent PNG.")
    
def dominant_colors_kmeans(image_pixels, k=3):
    """Finds the number of dominant colors using K-Means clustering."""
    kmeans = KMeans(n_clusters=k, random_state=42)
    kmeans.fit(image_pixels)
    counts = np.bincount(kmeans.labels_)
    unique_colors = len(set(map(tuple, np.round(kmeans.cluster_centers_))))  # Count unique cluster centers
    dominant=kmeans.cluster_centers_[np.argmax(counts)]
    return unique_colors, tuple(int(c) for c in dominant)

def classify_clothing_type(image_path):
    """Classifies clothing as solid-colored, gradient, or patterned."""
    clothing_pixels = ignore_alpha(image_path)  # Load and extract clothing pixels

    unique ,num_dominant_colors = dominant_colors_kmeans(clothing_pixels, k=10)
    
    return num_dominant_colors

def byColorThief(image):
    ct = ColorThief(image)
    dominant = ct.get_color(quality=1)

    palette =ct.get_palette(color_count=5)

    return dominant
#endregion

app = FastAPI()

class ImagePaths(BaseModel):
    Images: List[str]

class ColorExtractionResult():
    Color: List
    ColorName: str

def segment_image(image_path):
    output_path = Path(image_path.replace("\\wardrobe\\", "\\wardrobe_clean\\")).with_suffix('.png')

    input_image = Image.open(image_path)
    output_image = remove(input_image)
    output_image.save(output_path)
    
    return output_path

def extract_image_color(image_path):
    result = ColorExtractionResult()

    result.Color = byColorThief(image_path)
    result.ColorName = small_find_closest_color(*result.Color)
    
    return result

@app.post("/segment")
async def segment_endpoint(image_data: ImagePaths):
    """API endpoint to process multiple images and return the results."""
    results = []

    for image_path in image_data.Images:
        if not os.path.exists(image_path):
            results.append({
                "ImagePath": image_path,
                "Result": False,
                "Errors": ["Image path does not exist"]
            })
            continue

        output_path = segment_image(image_path)
        if output_path:
            result = extract_image_color(output_path)

            results.append({
                "ImagePath": image_path,
                "Result": True,
                "OutputPath": output_path,
                "ColorRGB": result.Color,
                "ColorName": result.ColorName
            })
        else:
            results.append({
                "ImagePath": image_path,
                "Result": False,
                "Errors": ["Segmentation failed"]
            })

    return results


@app.post("/getcolor")
async def color_extraction_endpoint(image_data: ImagePaths):
    """API endpoint to  extract the colors of multiple segmented images and return the results."""
    results = []

    for image_path in image_data.Images:
        if not os.path.exists(image_path):
            results.append({
                "ImagePath": image_path,
                "Result": False,
                "Errors": ["Image path does not exist"]
            })
            continue

        result = extract_image_color(image_path)
        if result:
            results.append({
                "ImagePath": image_path,
                "Result": True,
                "ColorRGB": result.Color,
                "ColorName": result.ColorName
            })
        else:
            results.append({
                "ImagePath": image_path,
                "Result": False,
                "Errors": ["Failed to extract color from provided image"]
            })

    return results


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
