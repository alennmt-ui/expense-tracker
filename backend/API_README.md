# Receipt Processing API

FastAPI application that connects OCR and Extractor modules to process receipt images.

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Make sure Tesseract OCR is installed (see ocr/README.md)

## Running the API

```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload
```

The API will be available at: `http://localhost:8000`

## API Endpoints

### POST /upload

Upload a receipt image and get structured data.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: file (image file - jpg, jpeg, png)

**Response:**
```json
{
  "status": "success",
  "data": {
    "merchant_name": "Days Inn West Memphis",
    "total_amount": "6.02",
    "date": "2012-07-14"
  }
}
```

**Error Response:**
```json
{
  "detail": "Error message"
}
```

### GET /

Root endpoint - API information

### GET /health

Health check endpoint

## Testing with cURL

```bash
curl -X POST "http://localhost:8000/upload" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/receipt.jpg"
```

## Testing with Python

```python
import requests

url = "http://localhost:8000/upload"
files = {"file": open("receipt.jpg", "rb")}
response = requests.post(url, files=files)
print(response.json())
```

## Interactive API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
expense/
├── main.py                      # FastAPI application
├── requirements.txt             # API dependencies
├── temp_uploads/                # Temporary upload folder (auto-created)
├── ocr/                         # OCR module
│   └── ocr_module.py
├── extractor/                   # Extractor module
│   └── extractor.py
└── output/                      # Output folder
    ├── raw/                     # Raw OCR text
    └── processed/               # Processed JSON
```

## Error Handling

- **400**: Invalid file type (only jpg, jpeg, png allowed)
- **422**: No text could be extracted from image
- **500**: OCR or extraction processing error

## Notes

- Uploaded files are automatically deleted after processing
- Temp files are stored in `temp_uploads/` directory
- OCR output is not saved to files when using the API
