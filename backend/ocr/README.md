# Receipt OCR Module

A standalone Python module for extracting text from receipt images using Tesseract OCR.

## Prerequisites

1. **Install Tesseract OCR**
   - Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
   - Add Tesseract to your system PATH or set it in code:
     ```python
     pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
     ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Basic Usage

```python
import sys
sys.path.append('C:\\developer\\expense\\ocr')
from ocr_module import process_receipt

# Process a receipt image
text = process_receipt("path/to/receipt.jpg")
print(text)
```

### Custom Output Path

```python
from ocr_module import process_receipt

# Specify custom output file
text = process_receipt("receipt.jpg", "C:\\developer\\expense\\output\\custom.txt")
```

### Individual Functions

```python
from ocr_module import preprocess_image, extract_text

# Preprocess only
preprocessed = preprocess_image("receipt.jpg")

# Extract text from preprocessed image
text = extract_text(preprocessed)
```

## Output

Extracted text files are automatically saved to:
```
C:\developer\expense\output\{filename}_extracted.txt
```

## Features

- ✅ Image preprocessing (grayscale, thresholding, noise removal)
- ✅ OCR text extraction
- ✅ Automatic text file saving
- ✅ Error handling for invalid paths and file types
- ✅ Modular function structure

## Supported File Types

- JPG/JPEG
- PNG
- BMP
- TIFF

## Example

Run the module directly from the ocr folder:

```bash
cd C:\developer\expense\ocr
python ocr_module.py
```

Or from the project root:

```bash
cd C:\developer\expense
python ocr\ocr_module.py
```

Make sure to update the `receipt_image` variable with your actual image path.

## Project Structure

```
C:\developer\expense/
├── ocr/                          # OCR module folder
│   ├── ocr_module.py            # Main OCR script
│   ├── README.md                # Documentation
│   └── requirements.txt         # Dependencies
└── output/                       # Extracted text output folder
    └── {filename}_extracted.txt # Auto-generated outputs
```
