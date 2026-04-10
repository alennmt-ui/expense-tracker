"""
Extractor Module for Receipt Data Processing
Converts raw OCR text into structured JSON format
"""

import re
import json
import os
from datetime import datetime


def clean_line(line):
    """
    Clean a single line of text
    
    Args:
        line (str): Single line of text
        
    Returns:
        str: Cleaned line
    """
    # Remove extra whitespace
    line = ' '.join(line.split())
    # Remove leading/trailing special characters
    line = re.sub(r'^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$', '', line)
    return line.strip()


def clean_text(text):
    """
    Clean and normalize OCR text
    
    Args:
        text (str): Raw OCR text
        
    Returns:
        str: Cleaned text
    """
    if not text or not text.strip():
        raise ValueError("Empty text provided")
    
    # Fix common OCR number format issues
    # Replace comma with period in decimal numbers (e.g., 6,02 -> 6.02)
    text = re.sub(r'(\d+),(\d{2})\b', r'\1.\2', text)
    
    # Remove special symbols but keep essential punctuation
    text = re.sub(r'[§~]', '', text)
    
    # Normalize line breaks
    text = re.sub(r'\r\n', '\n', text)
    text = re.sub(r'\n+', '\n', text)
    
    return text.strip()


def extract_merchant_name(text):
    """
    Extract merchant name from text - TOP 5-10 lines only
    
    Args:
        text (str): Cleaned text
        
    Returns:
        str: Merchant name or empty string
    """
    lines = text.split('\n')
    
    # Ignore keywords that indicate non-merchant lines
    ignore_keywords = [
        'tel', 'fax', 'phone', 'invoice', 'room', 'folio', 'number', 'page',
        'receipt', 'date', 'time', 'address', 'www', 'http', 'email'
    ]
    
    # Merchant keywords (optional boost)
    merchant_keywords = ['inn', 'hotel', 'restaurant', 'store', 'shop', 'mart', 'cafe', 'bar', 'grill']
    
    candidates = []
    
    # Check first 10 lines only
    for line in lines[:10]:
        cleaned = clean_line(line)
        
        if not cleaned or len(cleaned) < 3:
            continue
        
        # Skip if too long (likely full text dump)
        if len(cleaned) > 50:
            continue
        
        # Skip if line is mostly numbers
        digit_count = sum(c.isdigit() for c in cleaned)
        if digit_count > len(cleaned) * 0.5:
            continue
        
        # Skip if contains ignore keywords
        if any(keyword in cleaned.lower() for keyword in ignore_keywords):
            continue
        
        # Skip if line has no letters
        if not any(c.isalpha() for c in cleaned):
            continue
        
        # Calculate score
        score = 0
        
        # Prefer lines with merchant keywords
        if any(keyword in cleaned.lower() for keyword in merchant_keywords):
            score += 10
        
        # Prefer lines with multiple words
        word_count = len(cleaned.split())
        if word_count >= 2 and word_count <= 5:
            score += 5
        
        # Prefer lines with proper capitalization
        if cleaned[0].isupper():
            score += 2
        
        candidates.append((score, cleaned))
    
    # Return highest scoring candidate
    if candidates:
        candidates.sort(reverse=True, key=lambda x: x[0])
        return candidates[0][1]
    
    return ""


def extract_total_amount(text):
    """
    Extract total amount from text
    
    Args:
        text (str): Cleaned text
        
    Returns:
        str: Total amount or empty string
    """
    lines = text.split('\n')
    
    last_amount = None
    
    for line in lines:
        line_lower = line.lower()
        
        # Check for total/balance/amount keywords
        if any(keyword in line_lower for keyword in ['total', 'balance', 'amount']):
            # Extract all monetary values from this line
            amounts = re.findall(r'-?\$?\s*(\d+\.\d{2})', line)
            
            for amount in amounts:
                try:
                    amt_float = abs(float(amount))  # Remove negative sign
                    if amt_float > 0:
                        last_amount = f"{amt_float:.2f}"
                except ValueError:
                    continue
    
    return last_amount if last_amount else ""


def extract_date(text):
    """
    Extract date from text - prefer dates near transaction/total lines
    
    Args:
        text (str): Cleaned text
        
    Returns:
        str: Date in YYYY-MM-DD format or empty string
    """
    lines = text.split('\n')
    
    # Common date patterns
    date_patterns = [
        (r'(\d{2}[-/]\d{2}[-/]\d{4})', ['%m-%d-%Y', '%m/%d/%Y', '%d-%m-%Y', '%d/%m/%Y']),
        (r'(\d{2}[-/]\d{2}[-/]\d{2})', ['%m-%d-%y', '%m/%d/%y', '%d-%m-%y', '%d/%m/%y']),
    ]
    
    transaction_dates = []
    all_dates = []
    
    for i, line in enumerate(lines):
        line_lower = line.lower()
        
        # Check if line is near transaction/total keywords
        is_transaction_line = any(keyword in line_lower for keyword in 
                                  ['total', 'balance', 'charge', 'amount', 'date', 'description'])
        
        for pattern, formats in date_patterns:
            matches = re.findall(pattern, line)
            
            for date_str in matches:
                for fmt in formats:
                    try:
                        parsed_date = datetime.strptime(date_str, fmt)
                        
                        # Skip dates that are too old or in the future
                        current_year = datetime.now().year
                        if parsed_date.year < 2000 or parsed_date.year > current_year + 1:
                            continue
                        
                        formatted_date = parsed_date.strftime('%Y-%m-%d')
                        
                        if is_transaction_line:
                            transaction_dates.append(formatted_date)
                        else:
                            all_dates.append(formatted_date)
                        
                        break
                    except ValueError:
                        continue
    
    # Prefer transaction dates, otherwise use any date found
    if transaction_dates:
        return transaction_dates[-1]  # Return last transaction date
    elif all_dates:
        return all_dates[-1]
    
    return ""


def extract_fields(text):
    """
    Extract all fields from cleaned text
    
    Args:
        text (str): Cleaned text
        
    Returns:
        dict: Extracted fields
    """
    return {
        "merchant_name": extract_merchant_name(text),
        "total_amount": extract_total_amount(text),
        "date": extract_date(text)
    }


def save_json(data, output_path):
    """
    Save extracted data as JSON
    
    Args:
        data (dict): Extracted data
        output_path (str): Path to save JSON file
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"JSON saved to: {output_path}")


def process_file(input_path, output_path=None):
    """
    Process a single OCR text file and convert to JSON
    
    Args:
        input_path (str): Path to raw OCR text file
        output_path (str, optional): Path to save JSON file
        
    Returns:
        dict: Extracted data
    """
    # Validate input file
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found: {input_path}")
    
    # Read raw text
    print(f"Processing: {input_path}")
    with open(input_path, 'r', encoding='utf-8') as f:
        raw_text = f.read()
    
    if not raw_text.strip():
        raise ValueError(f"Empty file: {input_path}")
    
    # Clean text
    cleaned_text = clean_text(raw_text)
    
    # Extract fields
    extracted_data = extract_fields(cleaned_text)
    
    # Generate output path if not provided
    if output_path is None:
        base_name = os.path.splitext(os.path.basename(input_path))[0]
        # Remove '_extracted' suffix if present
        base_name = base_name.replace('_extracted', '')
        output_dir = os.path.join(os.path.dirname(os.path.dirname(input_path)), 'processed')
        output_path = os.path.join(output_dir, f"{base_name}.json")
    
    # Save JSON
    save_json(extracted_data, output_path)
    
    return extracted_data


if __name__ == "__main__":
    # Example usage
    try:
        # Process a single file
        input_file = r"C:\developer\expense\output\raw\bill2_extracted.txt"
        
        result = process_file(input_file)
        
        # Print results
        print("\n" + "="*50)
        print("EXTRACTED DATA:")
        print("="*50)
        print(json.dumps(result, indent=2))
        print("="*50)
        
    except FileNotFoundError as e:
        print(f"Error: {e}")
    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")
