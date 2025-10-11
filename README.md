# End-to-End Data Encryption System for College Applications

## 🎓 Overview

This is a comprehensive college application system that implements end-to-end encryption using Azure Key Vault, Azure SQL Database, and GenAI integration. The system ensures student data privacy while providing powerful administrative tools and AI-powered insights.

## ✨ Features

### 🔐 Security & Encryption
- **End-to-End Encryption**: Student data is encrypted in the frontend using AES-GCM
- **Azure Key Vault Integration**: Secure key management and storage
- **Token-Based Authentication**: Admin access with secure token validation
- **Data Privacy**: Encrypted data storage with secure decryption capabilities

### 🗄️ Data Management
- **Azure SQL Database**: Persistent, scalable data storage
- **Application Tracking**: Complete student application lifecycle management
- **Data Analytics**: Comprehensive application statistics and insights

### 🤖 AI-Powered Features
- **GenAI Integration**: Azure OpenAI for application analysis
- **Document Summarization**: AI-powered PDF content analysis
- **Application Scoring**: Intelligent application quality assessment
- **Data Insights**: AI-generated trends and recommendations

### 👨‍💼 Administrative Tools
- **Admin Dashboard**: Secure access to all applications
- **Data Decryption**: Authorized access to student data
- **Export Functionality**: CSV export for data analysis
- **System Health Monitoring**: Real-time service status

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Azure Cloud   │
│   (React)       │    │   (Node.js)     │    │   Services      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Student Form  │◄──►│ • API Routes    │◄──►│ • Key Vault     │
│ • Encryption    │    │ • Controllers   │    │ • SQL Database  │
│ • UI Components │    │ • Services      │    │ • OpenAI        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Azure subscription
- Azure Key Vault
- Azure SQL Database
- Azure OpenAI (optional, for GenAI features)

### 1. Clone and Install

```bash
git clone <repository-url>
cd CollegeVault
npm install
```

### 2. Azure Setup

#### Azure Key Vault Setup
1. Create an Azure Key Vault in your Azure portal
2. Note down the Key Vault name
3. Create a service principal for authentication
4. Grant the service principal access to Key Vault

#### Azure SQL Database Setup
1. Create an Azure SQL Database
2. Note down server name, database name, and credentials
3. Configure firewall rules to allow your IP
4. Create the Applications table (see Database Schema section)

#### Azure OpenAI Setup (Optional)
1. Create an Azure OpenAI resource
2. Deploy a GPT model
3. Note down endpoint, API key, and deployment ID

### 3. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp backend/env.example .env
```

Edit `.env` with your Azure credentials:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Azure Key Vault
AZURE_KEY_VAULT_NAME=your-keyvault-name
AZURE_KEY_NAME=college-app-encryption-key
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret

# Azure SQL Database
AZURE_SQL_SERVER=your-server.database.windows.net
AZURE_SQL_DATABASE=your-database-name
AZURE_SQL_USER=your-username
AZURE_SQL_PASSWORD=your-password

# Azure OpenAI (Optional)
AZURE_OPENAI_ENDPOINT=https://your-openai-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-openai-api-key
AZURE_OPENAI_DEPLOYMENT_ID=your-deployment-id

# Security
ADMIN_TOKEN=admin-demo-token-2024
```

### 4. Database Initialization

Initialize the database schema:

```bash
npm run db:init
```

### 5. Start the Application

```bash
# Start backend server
npm run dev:backend

# In another terminal, start frontend
npm run dev
```

## 📊 Database Schema

The system uses Azure SQL Database with the following schema:

```sql
CREATE TABLE Applications (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255),
    email NVARCHAR(255),
    phone NVARCHAR(50),
    course NVARCHAR(255),
    department NVARCHAR(255),
    gpa DECIMAL(3,2),
    document_name NVARCHAR(255),
    encrypted_data VARBINARY(MAX),
    iv NVARCHAR(255),
    created_at DATETIME2 DEFAULT GETDATE()
);
```

## 🔌 API Endpoints

### Application Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Submit new application |
| GET | `/api/applications` | Get all applications |
| GET | `/api/applications/:id` | Get specific application |
| GET | `/api/applications/stats` | Get application statistics |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/decrypt/:id` | Decrypt application data |
| GET | `/api/admin/applications` | Get all applications with decryption |
| GET | `/api/admin/analytics` | Get application analytics |
| GET | `/api/admin/export` | Export applications (CSV) |
| GET | `/api/admin/health` | System health check |

### GenAI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/genai/analyze` | Analyze application quality |
| POST | `/api/genai/summarize` | Summarize document content |
| POST | `/api/genai/insights` | Generate data insights |
| POST | `/api/genai/score` | Score application quality |

## 🔐 Security Features

### Encryption Flow

1. **Frontend Encryption**: Student data is encrypted using AES-GCM in the browser
2. **Key Management**: Encryption keys are stored securely in Azure Key Vault
3. **Data Storage**: Encrypted data is stored in Azure SQL Database
4. **Admin Access**: Authorized admins can decrypt data using Azure Key Vault

### Authentication

- **Admin Token**: Simple token-based authentication for admin endpoints
- **Rate Limiting**: Protection against brute force attacks
- **Security Headers**: Comprehensive security headers for all responses

## 🤖 GenAI Integration

### Application Analysis

The system uses Azure OpenAI to:
- Analyze application quality and provide scores
- Generate insights from application data
- Summarize document content
- Provide recommendations for admissions

### AI Features

- **Smart Scoring**: AI-powered application quality assessment
- **Document Analysis**: Automatic PDF content summarization
- **Trend Analysis**: AI-generated insights from application data
- **Recommendations**: Intelligent suggestions for process improvement

## 🛠️ Development

### Project Structure

```
CollegeVault/
├── backend/                 # New backend structure
│   ├── app.js             # Main application entry point
│   ├── routes/            # API route definitions
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   └── scripts/           # Database scripts
├── client/                # Frontend React application
├── server/                # Legacy server (for reference)
└── shared/                # Shared schemas and types
```

### Backend Services

- **AzureKeyVaultService**: Key management and encryption
- **AzureSqlService**: Database operations
- **GenAIService**: AI-powered analysis
- **ApplicationController**: Application management
- **AdminController**: Administrative functions

### Running in Development

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev

# Both (recommended)
npm run dev & npm run dev:backend
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t college-vault .

# Run container
docker run -p 5000:5000 --env-file .env college-vault
```

### Azure Deployment

The system is designed for Azure deployment with:
- Azure App Service for hosting
- Azure Key Vault for key management
- Azure SQL Database for data storage
- Azure OpenAI for AI features

## 📈 Monitoring and Logging

### Health Checks

- **System Health**: `/api/health` - Basic system status
- **Admin Health**: `/api/admin/health` - Detailed service status
- **GenAI Health**: `/api/genai/health` - AI service status

### Logging

The system provides comprehensive logging:
- Request/response logging
- Performance metrics
- Security events
- Error tracking

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AZURE_KEY_VAULT_NAME` | Azure Key Vault name | Yes |
| `AZURE_SQL_SERVER` | Azure SQL server | Yes |
| `AZURE_SQL_DATABASE` | Database name | Yes |
| `AZURE_SQL_USER` | Database username | Yes |
| `AZURE_SQL_PASSWORD` | Database password | Yes |
| `ADMIN_TOKEN` | Admin authentication token | Yes |
| `AZURE_OPENAI_ENDPOINT` | OpenAI endpoint | No |
| `AZURE_OPENAI_API_KEY` | OpenAI API key | No |

### Security Configuration

- Change default admin tokens in production
- Configure proper CORS settings
- Set up rate limiting
- Enable security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting section below
- Review the API documentation
- Open an issue on GitHub

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check Azure SQL firewall rules
   - Verify connection credentials
   - Ensure database server is running

2. **Key Vault Access Denied**
   - Verify service principal permissions
   - Check Key Vault access policies
   - Ensure correct tenant/client IDs

3. **GenAI Features Not Working**
   - Verify Azure OpenAI configuration
   - Check API key and endpoint
   - Ensure model deployment is active

### Debug Mode

Enable debug logging by setting:
```env
DEBUG_MODE=true
LOG_LEVEL=debug
```

## 🎯 Future Enhancements

- [ ] Multi-tenant support
- [ ] Advanced analytics dashboard
- [ ] Real-time notifications
- [ ] Mobile application
- [ ] Advanced AI features
- [ ] Automated testing
- [ ] CI/CD pipeline
- [ ] Kubernetes deployment