# Data Migration Guide

> **Version:** v1.0  
> **Created on:** 2026-02-24  
> **Author:** Kwon Younghae / Planning and Development  
> **Audience:** New VIVE CRM subscribers and customers needing data migration

---

## Table of Contents

1. [Overview](#1-overview)
2. [Supported Data Sources](#2-supported-data-sources)
3. [Excel/CSV Migration](#3-excelcsv-migration)
4. [Migration from Other CRMs](#4-migration-from-other-crms)
5. [API-Based Migration](#5-api-based-migration)
6. [Data Mapping Guide](#6-data-mapping-guide)
7. [Post-Migration Validation](#7-post-migration-validation)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Overview

### 1.1 What Is Migration?

Migration is the process of moving customer data, sales opportunities, activity records, and other information stored in existing spreadsheets (Excel) or other CRM systems into VIVE CRM.

### 1.2 Pre-Migration Checklist

- [ ] Existing data backed up
- [ ] Data cleaned up (duplicates removed, errors corrected)
- [ ] VIVE CRM sign-up and initial setup completed
- [ ] Migration schedule defined
- [ ] Owner permissions verified

### 1.3 Choosing a Migration Method

| Method | Recommended For | Estimated Time | Difficulty |
|--------|------------------|----------------|:----------:|
| **CSV Import** | Excel or spreadsheet users | 30 minutes to 2 hours | Easy |
| **CRM Integration Wizard** | Salesforce, HubSpot, Dooray users | 1 hour to 4 hours | Moderate |
| **API Integration** | Large datasets (10,000+ records) | 2 hours to 1 day | Hard |

---

## 2. Supported Data Sources

### 2.1 Direct Import Support

| Source | File Format | Supported Data |
|--------|-------------|----------------|
| **Microsoft Excel** | `.xlsx`, `.xls` | Contacts, deals, activities |
| **CSV** | `.csv` | Contacts, deals, activities |
| **Google Sheets** | CSV after export | Contacts, deals, activities |

### 2.2 CRM Integration Wizard Support

| CRM | Integration Method | Supported Functionality |
|-----|--------------------|-------------------------|
| **Salesforce** | API integration | Full data migration |
| **HubSpot** | API integration | Full data migration |
| **Dooray** | API integration | Full data migration |
| **Zoho CRM** | CSV export | Contact and deal data |
| **Pipedrive** | CSV export | Contact and deal data |

---

## 3. Excel/CSV Migration

### 3.1 Prepare the CSV File

#### Contact Data Template

| Field | Required | Description | Example |
|-------|:--------:|-------------|---------|
| `name` | ✅ | Contact name | Hong Gil-dong |
| `email` | ❌ | Email | `hong@example.com` |
| `phone` | ❌ | Phone number | `010-1234-5678` |
| `company` | ❌ | Company name | ABC Corporation |
| `job_title` | ❌ | Job title | Sales Team Lead |
| `source` | ❌ | Acquisition source | `website`, `referral`, `exhibition` |
| `tags` | ❌ | Tags (comma-separated) | `VIP,New` |
| `memo` | ❌ | Memo | Collected at the February exhibition |

**CSV example:**

```csv
name,email,phone,company,job_title,source,tags,memo
Hong Gil-dong,hong@example.com,010-1234-5678,ABC Corporation,Sales Team Lead,website,"VIP,New",Website inquiry
Kim Cheol-su,kim@sample.com,010-9876-5432,XYZ Corporation,Manager,referral,New,Introduced by Assistant Manager Kim
```

#### Deal Data Template

| Field | Required | Description | Example |
|-------|:--------:|-------------|---------|
| `title` | ✅ | Deal title | ERP implementation for ABC |
| `contact_email` | ✅ | Contact email (for linking) | `hong@example.com` |
| `amount` | ❌ | Amount | `50000000` |
| `stage` | ❌ | Stage | `lead`, `opportunity`, `proposal`, `negotiation`, `closed_won`, `closed_lost` |
| `expected_close_date` | ❌ | Expected close date | `2026-03-31` |
| `probability` | ❌ | Win probability (%) | `60` |
| `memo` | ❌ | Memo | Targeting contract execution in March |

### 3.2 CSV Import Procedure

1. **Prepare the data**
   ```text
   [Excel Data] → [Select Only Required Columns] → [Save as CSV (UTF-8)]
   ```

2. **Access VIVE CRM**
   - Go to `Contact Management > Import`

3. **Upload the file**
   - Select the CSV file
   - Confirm the encoding (`UTF-8` recommended)

4. **Map the columns**
   ```text
   CSV Column         VIVE CRM Field
   ────────────────────────────────
   Name         →      name
   Email        →      email
   Phone Number →      phone
   Company      →      company
   ```

5. **Preview the data**
   - Check 5 sample rows
   - Review highlighted rows with errors

6. **Run the import**
   - Click "Start Import"
   - Monitor the progress

### 3.3 Check Import Results

| Result | Description | Action |
|--------|-------------|--------|
| **Success** | Registered successfully | - |
| **Duplicate** | Duplicate email or phone number | Choose whether to update existing data or skip |
| **Error** | Required value missing or invalid format | Download the error list, fix it, and retry |

---

## 4. Migration from Other CRMs

### 4.1 Migration from Salesforce

#### Export the Data

1. Salesforce `Setup > Data Export`
2. Click "Export Now"
3. Select the following objects:
   - Accounts
   - Contacts
   - Opportunities
   - Tasks
   - Events
4. Download the CSV files

#### Mapping Table

| Salesforce | VIVE CRM | Notes |
|------------|----------|-------|
| `Account.Name` | `company` | Company name |
| `Contact.FirstName + LastName` | `name` | Contact name |
| `Contact.Email` | `email` | Email |
| `Contact.Phone` | `phone` | Phone number |
| `Opportunity.Name` | `title` | Deal title |
| `Opportunity.Amount` | `amount` | Amount |
| `Opportunity.StageName` | `stage` | Stage mapping required |
| `Opportunity.CloseDate` | `expected_close_date` | Close date |

#### Stage Mapping Example

| Salesforce Stage | VIVE CRM Stage |
|------------------|----------------|
| `Prospecting` | `lead` |
| `Qualification` | `opportunity` |
| `Proposal/Price Quote` | `proposal` |
| `Negotiation/Review` | `negotiation` |
| `Closed Won` | `closed_won` |
| `Closed Lost` | `closed_lost` |

### 4.2 Migration from Dooray

#### Export the Data

1. Access the Dooray admin page
2. Go to `Data Management > Data Backup`
3. Download the backup file (Excel)

#### Mapping Table

| Dooray | VIVE CRM |
|--------|----------|
| Company name | `company` |
| Contact person | `name` |
| Email | `email` |
| Phone number | `phone` |
| Sales opportunity name | `title` |
| Expected amount | `amount` |
| Stage | `stage` |
| Due date | `expected_close_date` |

### 4.3 Migration from HubSpot

#### Export HubSpot Data

1. `Settings > Properties > Export all properties`
2. Export Contacts and Deals separately
3. Choose CSV format

#### HubSpot → VIVE CRM Mapping

```text
HubSpot Contact Properties:
- firstname + lastname → name
- email → email
- phone → phone
- company → company
- jobtitle → job_title
- hs_lead_status → tags (conversion required)

HubSpot Deal Properties:
- dealname → title
- amount → amount
- dealstage → stage (pipeline-specific mapping required)
- closedate → expected_close_date
- hubspot_owner_id → VIVE CRM user mapping
```

---

## 5. API-Based Migration

### 5.1 Large-Scale Data Migration (10,000+ Records)

For large volumes of data, a programmatic migration using the API is recommended.

#### Example Python Script

```python
import requests
import pandas as pd
import time

# Configuration
API_KEY = 'your_api_key'
BASE_URL = 'https://api.vive-crm.com/v1'
HEADERS = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# Read CSV
df = pd.read_csv('contacts.csv', encoding='utf-8')

# Contact creation function
def create_contact(row):
    data = {
        'name': row['name'],
        'email': row['email'],
        'phone': row.get('phone'),
        'company': row.get('company'),
        'job_title': row.get('job_title'),
        'source': 'migration'
    }
    
    response = requests.post(
        f'{BASE_URL}/contacts',
        headers=HEADERS,
        json=data
    )
    
    if response.status_code == 201:
        return response.json()['id']
    else:
        print(f"Error: {response.json()}")
        return None

# Batch processing
success_count = 0
error_count = 0

for index, row in df.iterrows():
    contact_id = create_contact(row)
    
    if contact_id:
        success_count += 1
    else:
        error_count += 1
    
    # Prevent rate limiting (2 requests per second)
    time.sleep(0.5)
    
    # Print progress
    if (index + 1) % 100 == 0:
        print(f"Progress: {index + 1}/{len(df)} (Success: {success_count}, Error: {error_count})")

print(f"Migration Complete! Total: {len(df)}, Success: {success_count}, Error: {error_count}")
```

### 5.2 Record a Migration Log

| Item | What to Record |
|------|----------------|
| Execution time | Migration start and end time |
| Source record count | Total number of records to migrate |
| Success count | Number of records successfully created |
| Failure count | Number of failed records |
| Failure details | Error list and reason |
| Duration | Total processing time |

---

## 6. Data Mapping Guide

### 6.1 Field Type Mapping

| VIVE CRM Type | Supported Format | Example | Note |
|---------------|------------------|---------|------|
| **Text** | String | Hong Gil-dong | Max 255 characters |
| **Long Text** | String (line breaks allowed) | Memo content | Max 5000 characters |
| **Number** | Number | 1000000 | No commas |
| **Date** | `YYYY-MM-DD` | `2026-03-31` | ISO 8601 format |
| **DateTime** | `YYYY-MM-DD HH:MM:SS` | `2026-03-31 14:30:00` | Based on UTC |
| **Email** | Email format | `test@example.com` | Validation applied |
| **Phone** | Phone number | `010-1234-5678` | Various formats supported |
| **Select** | Predefined value | `lead`, `opportunity` | Exact value match required |
| **Multi Select** | Comma-separated | `VIP,New` | Separate with commas |

### 6.2 Reference for Stage Mapping

#### VIVE CRM Pipeline Stages

```text
lead → opportunity → proposal → negotiation → closed_won
                                      ↓
                                  closed_lost
```

| Stage Code | Display Name | Description |
|------------|--------------|-------------|
| `lead` | Lead | Potential customer |
| `opportunity` | Opportunity | Sales opportunity confirmed |
| `proposal` | Proposal | Quote/proposal stage |
| `negotiation` | Negotiation | Negotiation/contract coordination |
| `closed_won` | Closed Won | Sale completed |
| `closed_lost` | Closed Lost | Sale lost |

### 6.3 Source Mapping

| Source Code | Description |
|-------------|-------------|
| `website` | Website |
| `referral` | Referral / introduction |
| `exhibition` | Exhibition |
| `advertisement` | Advertisement |
| `cold_call` | Cold call |
| `email` | Email marketing |
| `social_media` | Social media |
| `etc` | Other |

---

## 7. Post-Migration Validation

### 7.1 Validation Checklist

- [ ] **Count check:** Source record count matches the VIVE CRM registration count
- [ ] **Required field check:** No required values such as name or email are missing
- [ ] **Relationship check:** Contact-deal connections are valid
- [ ] **Special character check:** Korean text, emoji, and other special characters display correctly
- [ ] **Date check:** Date formats were converted correctly

### 7.2 Example Validation Queries

```sql
-- Verify the number of migrated contacts
SELECT COUNT(*) FROM contacts WHERE source = 'migration';

-- Check duplicate emails
SELECT email, COUNT(*) 
FROM contacts 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Check missing deal-contact links
SELECT d.* 
FROM deals d 
LEFT JOIN contacts c ON d.contact_id = c.id 
WHERE c.id IS NULL;
```

### 7.3 Test Scenarios

| Scenario | Test Details | Expected Result |
|----------|--------------|-----------------|
| Contact search | Search for a migrated contact by name | Found successfully |
| Deal view | View details of a migrated deal | Customer information displayed together |
| Filtering | Filter by tag or stage | Filter works correctly |
| Reports | Reports including migrated data | Aggregation works correctly |

---

## 8. Troubleshooting

### 8.1 Common Errors

#### Error: `Invalid CSV format`

**Cause:**
- CSV encoding is not UTF-8
- A comma (`,`) is included in a field value
- Quotation marks (`"`) are not properly closed

**Solution:**
```python
# Choose UTF-8 when saving CSV from Excel
# Or use "Save As" in a text editor and select UTF-8
```

#### Error: `Email already exists`

**Cause:**
- The same email is already registered
- It was registered as a duplicate during an earlier migration

**Solution:**
- Select a duplicate handling option: "Skip" or "Update"
- Clean up existing data and retry

#### Error: `Required field missing`

**Cause:**
- The `name` field is empty
- Required mapping is missing

**Solution:**
- Fill in the `name` field in the source data
- Update the CSV file and upload it again

### 8.2 Performance Problems

| Symptom | Cause | Solution |
|---------|-------|----------|
| Import is slow | Large dataset (10,000+ records) | Process in batches through the API |
| Timeout occurs | Unstable network | Split the file into multiple imports |
| Browser freezes | File too large (10MB+) | Split the CSV file or use the API |

### 8.3 Data Cleanup Script

Python script to check data quality before migration:

```python
import pandas as pd
import re

def validate_data(csv_path):
    df = pd.read_csv(csv_path, encoding='utf-8')
    
    issues = []
    
    # 1. Check required fields
    if df['name'].isna().any():
        issues.append(f"Missing names: {df['name'].isna().sum()} rows")
    
    # 2. Validate email format
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    invalid_emails = df[~df['email'].str.match(email_pattern, na=False)]
    if len(invalid_emails) > 0:
        issues.append(f"Invalid emails: {len(invalid_emails)} rows")
    
    # 3. Check duplicate emails
    duplicates = df[df['email'].duplicated(keep=False)]
    if len(duplicates) > 0:
        issues.append(f"Duplicate emails: {len(duplicates)} rows")
    
    # 4. Normalize phone number format
    df['phone'] = df['phone'].astype(str).str.replace(r'[^0-9]', '', regex=True)
    
    # Print results
    print(f"Total rows: {len(df)}")
    print(f"Valid rows: {len(df) - len(issues)}")
    print("\nIssues found:")
    for issue in issues:
        print(f"  - {issue}")
    
    return df

# Run
clean_df = validate_data('contacts.csv')
clean_df.to_csv('contacts_cleaned.csv', index=False, encoding='utf-8')
```

---

## Contact and Support

If a problem occurs during migration, please contact us through one of the following channels:

- **Email:** `migration@vive-crm.com`
- **Chat support:** `Help > Contact Us` inside VIVE CRM
- **Migration consulting:** Free consulting available for large-volume data migration

---

**Note:** If the migration is complex, getting help from an expert is recommended.
