"""
OCR Module for Receipt Image Processing
Extracts text from receipt images using Tesseract OCR
"""

import cv2
import pytesseract
from PIL import Image
import os

# Configure Tesseract path - auto-detect or use system PATH
import shutil

# Try to find tesseract in system PATH first
tesseract_path = shutil.which('tesseract')
if tesseract_path:
    pytesseract.pytesseract.tesseract_cmd = tesseract_path
else:
    # Fallback to Windows path for local development
    windows_path = r'C:\\Users\\alenn\\AppData\\Local\\Programs\\Tesseract-OCR\\tesseract.exe'
    if os.path.exists(windows_path):
        pytesseract.pytesseract.tesseract_cmd = windows_path



def preprocess_image(image_path):
    """
    Preprocess the image to improve OCR accuracy
    
    Args:
        image_path (str): Path to the receipt image
        
    Returns:
        numpy.ndarray: Preprocessed image
    """
    img = cv2.imread(image_path)
    
    if img is None:
        raise ValueError(f"Unable to read image from path: {image_path}")
    
    # Resize if image is too small
    height, width = img.shape[:2]
    if height < 1000:
        scale = 1000 / height
        img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Denoise
    denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
    
    # Increase contrast using CLAHE
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    contrast = clahe.apply(denoised)
    
    # Sharpen
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    sharpened = cv2.morphologyEx(contrast, cv2.MORPH_GRADIENT, kernel)
    sharpened = cv2.addWeighted(contrast, 1.5, sharpened, -0.5, 0)
    
    # Adaptive thresholding
    thresh = cv2.adaptiveThreshold(sharpened, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                    cv2.THRESH_BINARY, 11, 2)
    
    return thresh


def extract_text(preprocessed_image):
    """
    Extract text from preprocessed image using Tesseract OCR
    
    Args:
        preprocessed_image (numpy.ndarray): Preprocessed image
        
    Returns:
        str: Extracted text from the image
    """
    pil_image = Image.fromarray(preprocessed_image)
    
    # Try different PSM modes for better accuracy
    configs = [
        '--psm 6',  # Uniform block of text
        '--psm 4',  # Single column of text
        '--psm 3',  # Fully automatic
    ]
    
    best_text = ""
    for config in configs:
        text = pytesseract.image_to_string(pil_image, config=config)
        if len(text.strip()) > len(best_text):
            best_text = text.strip()
    
    return best_text


def save_text_to_file(text, output_path):
    """
    Save extracted text to a file
    
    Args:
        text (str): Extracted text
        output_path (str): Path to save the text file
    """
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f"Text saved to: {output_path}")


def process_receipt(image_path, output_txt_path=None):
    """
    Main function to process receipt image and extract text
    
    Args:
        image_path (str): Path to the receipt image
        output_txt_path (str, optional): Path to save extracted text
        
    Returns:
        str: Extracted text from the receipt
    """
    # Validate file path
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
    # Validate file type
    valid_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
    file_ext = os.path.splitext(image_path)[1].lower()
    if file_ext not in valid_extensions:
        raise ValueError(f"Unsupported file type: {file_ext}. Supported types: {valid_extensions}")
    
    # Preprocess the image
    print("Preprocessing image...")
    preprocessed_img = preprocess_image(image_path)
    
    # Extract text using OCR
    print("Extracting text...")
    extracted_text = extract_text(preprocessed_img)
    
    # Save to file if output path is provided
    if output_txt_path:
        save_text_to_file(extracted_text, output_txt_path)
    else:
        # Auto-generate output filename in output folder
        base_name = os.path.basename(os.path.splitext(image_path)[0])
        output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'output')
        os.makedirs(output_dir, exist_ok=True)
        output_txt_path = os.path.join(output_dir, f"{base_name}_extracted.txt")
        save_text_to_file(extracted_text, output_txt_path)
    
    return extracted_text


if __name__ == "__main__":
    # Example usage
    try:
        # Replace with your receipt image path
        receipt_image = "C:\\Users\\alenn\\Downloads\\bill2.jpg"
        
        # Process the receipt
        text = process_receipt(receipt_image)
        
        # Print extracted text
        print("\n" + "="*50)
        print("EXTRACTED TEXT:")
        print("="*50)
        print(text)
        print("="*50)
        
    except FileNotFoundError as e:
        print(f"Error: {e}")
    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")
