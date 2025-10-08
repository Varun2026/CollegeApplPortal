# End-to-End Data Encryption System for College Applications

## Demo Version using Azure Key Vault Architecture

A full-stack web application demonstrating secure college application submissions with **client-side AES-GCM 256-bit encryption**. This demo showcases end-to-end encryption capabilities and is designed for easy future integration with Azure Key Vault, Terraform, Docker, and CI/CD pipelines.

---

## 🚀 Features

### Security
- **Client-side AES-GCM 256-bit encryption** using Web Crypto API
- Random IV (Initialization Vector) generation for each submission
- Encrypted data transmission to backend
- Secure file upload with validation (PDF/JPG, max 10MB)
- No plaintext data stored on server

### User Experience
- **Multi-step form** with progress tracking:
  1. Personal Information
  2. Academic Information  
  3. Document Upload
  4. Review & Submit
- Real-time form validation
- File type and size validation
- Success/error feedback messages
- Professional, responsive design with Tailwind CSS

### Admin Features
- View all encrypted applications
- Decrypt and view application data (demo purposes)
- Expandable application details
- Encrypted data preview

---

## 📋 Requirements

- **Node.js** 18+ or 20+
- **npm** (comes with Node.js)
- Modern web browser with Web Crypto API support

---

## 🛠️ Installation & Setup

### 1. Clone or access the project
```bash
cd your-project-directory
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the application
```bash
npm run dev
```

The application will start on **http://localhost:5000** or **http://0.0.0.0:5000**

---

## 📖 How to Use

### For Students (Submit Application)

1. **Navigate to the main page** (automatically opens at `/`)

2. **Fill out the multi-step form:**
   - **Step 1 - Personal Info**: Name, email, phone number
   - **Step 2 - Academic Info**: Course, department, GPA (0.0-4.0)
   - **Step 3 - Documents**: Upload PDF or JPG files (max 10MB each)
   - **Step 4 - Review**: Review all information before submitting

3. **Submit the application**
   - Click "Encrypt & Submit"
   - Data is encrypted in the browser using AES-GCM
   - Encrypted data is sent to the backend
   - Confirmation message appears on success

4. **What happens behind the scenes:**
   - A random 12-byte IV is generated
   - All form data (including uploaded files as base64) is encrypted
   - Only encrypted data and IV are sent to the server
   - Server stores encrypted data in `applications.json`

### For Admins (View Applications)

1. **Navigate to Admin Dashboard**
   - Click "Admin" in the header
   - Or go to `/admin`

2. **View submitted applications**
   - See list of all applications with IDs and timestamps
   - Applications show as "Encrypted" by default

3. **Decrypt an application**
   - Click "Decrypt" button on any application
   - Data is decrypted client-side using the same key and IV
   - Click "View" to expand and see full details

---

## 🏗️ Project Structure

```
.
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ApplicationForm.tsx    # Multi-step form
│   │   │   ├── AdminDashboard.tsx     # Admin interface
│   │   │   └── Header.tsx             # Navigation header
│   │   ├── lib/
│   │   │   ├── encryptUtils.ts        # AES-GCM encryption logic
│   │   │   └── queryClient.ts         # TanStack Query setup
│   │   ├── hooks/                     # Custom React hooks
│   │   └── App.tsx                    # Main app component
│   └── index.html
├── server/                    # Backend Express API
│   ├── routes.ts             # API endpoints
│   ├── storage.ts            # File-based storage
│   └── index.ts              # Server entry point
├── shared/                    # Shared types and schemas
│   └── schema.ts             # Zod schemas and TypeScript types
├── applications.json         # Encrypted data storage (created on first submission)
└── README.md                 # This file
```

---

## 🔐 Encryption Details

### Algorithm: AES-GCM 256-bit

- **Key Size**: 256 bits (32 bytes)
- **IV Size**: 96 bits (12 bytes) - randomly generated per encryption
- **Mode**: GCM (Galois/Counter Mode) - provides both encryption and authentication

### Demo Key Warning
⚠️ **Important**: This demo uses a hardcoded key for demonstration purposes only. 

**For production deployment:**
- Integrate with **Azure Key Vault** for secure key management
- Implement key rotation policies
- Use managed identities for Azure resources
- Never commit keys to version control

### File Handling
- Files are converted to Base64 before encryption
- Maximum file size: 10MB per file
- Allowed types: PDF, JPG/JPEG
- Validation occurs before encryption

---

## 📡 API Endpoints

### POST `/api/applications`
Submit a new encrypted application

**Request Body:**
```json
{
  "encryptedData": "base64-encoded-encrypted-data",
  "iv": "base64-encoded-initialization-vector"
}
```

**Response:**
```json
{
  "success": true,
  "applicationId": "uuid",
  "message": "Application submitted successfully"
}
```

### GET `/api/applications`
Retrieve all encrypted applications (admin only)

**Response:**
```json
[
  {
    "id": "uuid",
    "encryptedData": "base64-encoded-encrypted-data",
    "iv": "base64-encoded-initialization-vector",
    "submittedAt": "2025-01-15T10:30:00.000Z"
  }
]
```

### GET `/api/applications/:id`
Retrieve a specific application by ID

### GET `/api/health`
Health check endpoint

---

## 🎯 Demo for Project Review

### What to Show

1. **Security in Action**
   - Open browser DevTools → Network tab
   - Submit an application
   - Show that only encrypted data is transmitted
   - Display the encrypted payload in Network request

2. **Encryption Process**
   - Open browser Console
   - Submit application and show encryption logs
   - Display randomly generated IV
   - Show encrypted data length

3. **File Storage**
   - Open `applications.json` in the project root
   - Show encrypted data stored on disk
   - Demonstrate that original data is not readable

4. **Admin Decryption**
   - Navigate to Admin Dashboard
   - Decrypt an application
   - Show original data successfully recovered

5. **Validation & Security**
   - Try uploading wrong file type (e.g., .txt) → Rejected
   - Try uploading file > 10MB → Rejected
   - Submit incomplete form → Validation errors

### Key Points to Mention
- ✅ End-to-end encryption (encrypted in browser, decrypted in browser)
- ✅ Server never sees plaintext data
- ✅ Each submission uses unique random IV
- ✅ Production-ready for Azure Key Vault integration
- ✅ Comprehensive validation and error handling
- ✅ Professional UI/UX with accessibility considerations

---

## 🚢 Next Steps for Production

### Azure Integration
1. **Azure Key Vault Setup**
   - Create Key Vault resource
   - Store encryption keys securely
   - Use managed identities for access

2. **Terraform Infrastructure**
   ```hcl
   resource "azurerm_key_vault" "college_app" {
     name                = "college-app-kv"
     location            = azurerm_resource_group.main.location
     resource_group_name = azurerm_resource_group.main.name
     tenant_id          = data.azurerm_client_config.current.tenant_id
     sku_name           = "standard"
   }
   ```

3. **Docker Deployment**
   - Create `Dockerfile` for containerization
   - Set up Azure Container Registry
   - Deploy to Azure App Service or AKS

4. **CI/CD Pipeline**
   - GitHub Actions or Azure DevOps
   - Automated testing
   - Staging and production environments
   - Automated deployments

### Security Enhancements
- Implement authentication (OAuth 2.0)
- Add rate limiting
- Enable HTTPS/TLS
- Implement audit logging
- Add data retention policies
- Set up backup and recovery

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Submit application with all fields filled
- [ ] Test file upload (PDF and JPG)
- [ ] Verify file size validation (10MB limit)
- [ ] Test file type validation (reject non-PDF/JPG)
- [ ] Check form validation for required fields
- [ ] Submit and verify in Admin dashboard
- [ ] Decrypt application and verify data integrity
- [ ] Test dark/light theme toggle
- [ ] Test responsive design on mobile

### Automated Testing (Future)
- Unit tests for encryption utilities
- Integration tests for API endpoints
- E2E tests with Playwright
- Security testing for encryption strength

---

## 🐛 Troubleshooting

### Application won't start
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Port 5000 already in use
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9
```

### Encryption fails in browser
- Ensure you're using a modern browser (Chrome 60+, Firefox 75+, Safari 14+)
- Check browser console for errors
- Verify Web Crypto API is available: `crypto.subtle !== undefined`

---

## 📝 Technical Specifications

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Encryption**: Web Crypto API (SubtleCrypto)
- **Validation**: Zod schemas
- **State Management**: TanStack Query v5
- **Routing**: Wouter (lightweight React router)
- **Form Handling**: React Hook Form
- **Storage**: File-based JSON (development), ready for database

---

## 📄 License

This is a demo project for educational purposes.

---

## 👨‍💻 Architecture Notes

This application is designed with **future Azure deployment** in mind:

- **Stateless backend** ready for horizontal scaling
- **Environment-based configuration** for different deployments
- **Modular architecture** for easy Azure service integration
- **File storage abstraction** ready to swap with Azure Blob Storage
- **Key management placeholder** ready for Azure Key Vault
- **API design** follows REST best practices
- **Security-first approach** with encryption by default

---

## 📞 Support

For questions or issues with this demo, check:
1. Browser console for client-side errors
2. Server logs for backend errors
3. `applications.json` for stored encrypted data
4. Network tab to inspect API calls

---

**Built with security and scalability in mind** 🔒
