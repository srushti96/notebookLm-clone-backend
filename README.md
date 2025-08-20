# NotebookLM Server

A modern, scalable Node.js backend API for the NotebookLM clone application. This server provides PDF processing, AI chat capabilities, and a robust API structure.

## 🚀 Features

- **PDF Processing**: Upload, parse, and extract text from PDF documents
- **AI Integration**: Chat with documents using OpenRouter AI models
- **RESTful API**: Clean, well-documented API endpoints
- **Error Handling**: Comprehensive error handling and logging
- **File Management**: Automatic file cleanup and storage management
- **Health Monitoring**: Built-in health checks and statistics
- **Scalable Architecture**: Modular design for easy scaling

## 📁 Project Structure

```
server/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # Database/storage configuration
│   │   └── ai.js         # AI service configuration
│   ├── controllers/      # Request handlers
│   │   ├── pdfController.js
│   │   └── chatController.js
│   ├── middleware/       # Express middleware
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── routes/           # API routes
│   │   ├── pdfRoutes.js
│   │   └── chatRoutes.js
│   ├── services/         # Business logic
│   │   └── pdfService.js
│   └── app.js           # Express app configuration
├── uploads/             # Uploaded files (auto-created)
├── logs/                # Application logs (auto-created)
├── server.js            # Server entry point
├── package.json
└── .env
```

## 🛠 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd notebooklm-clone/server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# AI Service Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
HTTP_REFERER=https://your-deployed-site.com
```

### Getting OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up and get your API key
3. Add it to your `.env` file

## 📡 API Endpoints

### PDF Management

| Method | Endpoint           | Description            |
| ------ | ------------------ | ---------------------- |
| POST   | `/api/upload`      | Upload and process PDF |
| GET    | `/api/pdf/:fileId` | Get PDF information    |
| DELETE | `/api/pdf/:fileId` | Delete PDF             |
| GET    | `/api/pdfs`        | Get all PDFs (admin)   |
| GET    | `/api/stats`       | Get storage statistics |

### Chat & AI

| Method | Endpoint         | Description             |
| ------ | ---------------- | ----------------------- |
| POST   | `/api/chat`      | Process chat message    |
| GET    | `/api/models`    | Get available AI models |
| GET    | `/api/ai/status` | Check AI service status |
| GET    | `/api/health`    | Health check            |

### System

| Method | Endpoint | Description     |
| ------ | -------- | --------------- |
| GET    | `/`      | API information |

## 🔧 Usage Examples

### Upload PDF

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "pdf=@document.pdf"
```

### Chat with Document

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the main topic of this document?",
    "fileId": "pdf-1234567890.pdf"
  }'
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

## 🏗 Architecture

### Design Patterns

- **MVC Pattern**: Controllers handle requests, Services contain business logic
- **Repository Pattern**: Database abstraction for easy switching
- **Middleware Pattern**: Modular request processing
- **Error Handling**: Centralized error management

### Scalability Features

- **Modular Structure**: Easy to add new features
- **Service Layer**: Business logic separation
- **Configuration Management**: Environment-based config
- **Memory Management**: Automatic cleanup of old files


### Health Checks

- Built-in health check endpoint
- System statistics and uptime monitoring
- Memory usage tracking

## 🚀 Deployment

### Production Setup

1. **Set environment variables**

   ```bash
   NODE_ENV=production
   PORT=3000
   FRONTEND_URL=https://your-frontend-domain.com
   ```

2. **Install dependencies**

   ```bash
   npm ci --only=production
   ```

3. **Start server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run clean` - Clean logs and uploads
- `npm run logs` - View application logs

### Adding New Features

1. **Create Controller**: Add business logic in `src/controllers/`
2. **Create Service**: Add reusable logic in `src/services/`
3. **Create Routes**: Define endpoints in `src/routes/`
4. **Add Middleware**: Create custom middleware in `src/middleware/`

