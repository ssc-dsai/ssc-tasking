# AI-Powered Briefing & Document Analysis Platform

A modern web application that transforms document analysis and briefing generation using AI. Upload documents, chat with an AI assistant, and automatically generate executive briefings from your content.

## 🚀 Features

### Core Functionality
- **Document Upload & Processing**: Support for PDF and TXT files with automatic text extraction
- **AI Chat Interface**: Conversational AI assistant for document Q&A and analysis
- **Automated Briefing Generation**: Create structured executive briefings from uploaded documents
- **Vector Search**: Semantic search through document content for relevant context
- **Real-time Collaboration**: Multi-user support with role-based access (Owner, Editor, Viewer)

### User Experience
- **Clean, Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Markdown Support**: Rich text formatting for briefings and chat responses
- **Download Options**: Export briefings as markdown or formatted documents
- **Multiple View Modes**: Switch between card view and raw markdown view

### Technical Capabilities
- **PDF Text Extraction**: Advanced PDF processing with PDF.js for accurate text extraction
- **AI Integration**: OpenAI GPT-4 integration for intelligent document analysis
- **Database Storage**: Supabase backend for data persistence and user management
- **Edge Functions**: Serverless functions for file processing and AI operations
- **Authentication**: Secure user authentication and session management

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **TanStack Query** for data fetching and caching
- **React Router** for navigation

### Backend Services
- **Supabase** for database, authentication, and storage
- **Supabase Edge Functions** for serverless processing
- **OpenAI API** for AI chat and briefing generation
- **Vector Embeddings** for semantic document search

### Key Components
- **TaskingView**: Main interface for managing projects and generating briefings
- **CompactBriefingChat**: AI chat interface for document Q&A
- **BriefingGenerationModal**: Structured briefing creation with AI
- **MarkdownBriefingDisplay**: Rich rendering of generated briefings
- **FileUpload**: Advanced file processing with progress tracking

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- OpenAI API key

### Environment Variables
Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/ssc-dsai/ssc-tasking.git
cd ssc-tasking

# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup
1. Set up Supabase project
2. Run the SQL migrations in `supabase/migrations/`
3. Deploy edge functions: `npm run deploy:functions`

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── briefings/      # Briefing generation and display
│   ├── dashboard/      # Main dashboard interface
│   ├── layout/         # Navigation and layout components
│   ├── project/        # Project/tasking management
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and API clients
├── pages/              # Route components
└── types/              # TypeScript type definitions

supabase/
├── functions/          # Edge functions for serverless processing
├── migrations/         # Database schema migrations
└── config.toml         # Supabase configuration
```

## 🔧 Key Features Deep Dive

### AI Chat System
- **Conversational Interface**: Natural language interaction with documents
- **Context-Aware Responses**: AI uses document content to provide accurate answers
- **Friendly Tone**: Casual, colleague-like responses rather than formal reports
- **Real-time Processing**: Instant responses with typing indicators

### Briefing Generation
- **Structured Templates**: Pre-defined briefing formats for consistency
- **Executive Summaries**: AI-generated summaries tailored for leadership
- **Multiple Sections**: Key findings, risks, recommendations, and next steps
- **Customizable Prompts**: Flexible input for different briefing types

### Document Processing
- **Advanced PDF Extraction**: Handles complex PDFs with accurate text extraction
- **Progress Tracking**: Real-time upload and processing status
- **Error Handling**: Robust error recovery and user feedback
- **File Validation**: Type checking and size limits for security

### User Management
- **Role-Based Access**: Owner, Editor, and Viewer permissions
- **Professional Avatars**: Integrated user profiles with images
- **Team Collaboration**: Multi-user project support
- **Activity Tracking**: User actions and document history

## 🎨 UI/UX Highlights

### Design System
- **Consistent Spacing**: Standardized 1rem padding throughout
- **Color-Coded Sections**: Visual hierarchy with gradient icons
- **Responsive Layout**: Grid-based design that adapts to screen size
- **Accessibility**: WCAG compliant with proper contrast and navigation

### User Experience
- **Intuitive Navigation**: Clear section headers (Briefings, Chat, Files, Users)
- **Progressive Disclosure**: Information revealed as needed
- **Instant Feedback**: Loading states and success/error messages
- **Keyboard Shortcuts**: Efficient navigation for power users

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Supabase Edge Functions
```bash
cd supabase
supabase functions deploy
```

### Environment Setup
- Configure production environment variables
- Set up proper CORS policies
- Enable RLS (Row Level Security) policies

## 🔐 Security Features

- **Row Level Security**: Database-level access controls
- **API Key Management**: Secure storage of sensitive credentials
- **File Upload Validation**: Type and size restrictions
- **User Authentication**: Secure login and session management

## 📊 Performance Optimizations

- **Vector Search**: Efficient semantic search through large documents
- **Lazy Loading**: Components loaded on demand
- **Caching**: TanStack Query for intelligent data caching
- **Optimized Builds**: Tree shaking and code splitting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues, please open a GitHub issue or contact the development team.

---

*Built with ❤️ for modern document analysis and AI-powered briefing generation.*
