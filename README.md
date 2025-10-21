# DevOps On-Call Management System

A comprehensive web application for managing DevOps on-call schedules with role-based access control, built with FastAPI and React.

## Features

- 🔐 **Authentication System** - Secure login with JWT tokens
- 👥 **Role-Based Access Control** - Admin and User roles
- 📅 **Schedule Management** - Admins can define who is on-call and when
- 🔔 **Current On-Call Display** - Real-time display of who is currently on-call
- 📊 **Dashboard** - Beautiful, modern UI for viewing schedules
- ⚙️ **Admin Panel** - Complete user and schedule management
- 🐳 **Docker Support** - Full containerization with Docker and docker-compose

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM for database operations
- **JWT** - Secure authentication
- **Pydantic** - Data validation

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **date-fns** - Date formatting

## Quick Start

### Prerequisites
- Docker and Docker Compose installed on your system

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd devops-oncall
```

2. Start the application using Docker Compose:
```bash
docker-compose up -d
```

3. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

⚠️ **Important:** Change the default admin password immediately after first login in production!

## Usage

### For Users
1. Log in with your credentials
2. View the current on-call engineer on the dashboard
3. Check the complete on-call schedule
4. See upcoming and past schedules

### For Admins
1. Log in with admin credentials
2. Navigate to the Admin Panel
3. **Manage Users:**
   - Create new users
   - Assign admin roles
   - View all users
4. **Manage Schedules:**
   - Create new on-call schedules
   - Assign users to specific time periods
   - Add notes to schedules
   - Delete schedules

## Development Setup

### Backend Development

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend:
```bash
uvicorn main:app --reload
```

### Frontend Development

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /token` - Login and get access token

### Users
- `GET /users/me` - Get current user info
- `POST /users` - Create new user (Admin only)
- `GET /users` - List all users

### On-Call Schedules
- `POST /oncall` - Create schedule (Admin only)
- `GET /oncall` - List all schedules
- `GET /oncall/current` - Get current on-call person
- `GET /oncall/today` - Get today's schedules
- `DELETE /oncall/{id}` - Delete schedule (Admin only)

## Docker Commands

### Build and start all services:
```bash
docker-compose up -d
```

### View logs:
```bash
docker-compose logs -f
```

### Stop all services:
```bash
docker-compose down
```

### Rebuild services:
```bash
docker-compose up -d --build
```

### Remove all data (including database):
```bash
docker-compose down -v
```

## Configuration

### Environment Variables

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key (generate a secure one for production)

**Frontend:**
- `REACT_APP_API_URL` - Backend API URL

## Production Deployment

1. Generate a secure secret key:
```bash
openssl rand -hex 32
```

2. Update the `SECRET_KEY` in docker-compose.yml

3. Change default admin password

4. Configure proper CORS settings in the backend

5. Use a reverse proxy (nginx) for SSL/TLS termination

6. Set up regular database backups

## Security Notes

- Change default credentials immediately
- Use strong passwords
- Generate a secure SECRET_KEY for production
- Enable HTTPS in production
- Regularly update dependencies
- Implement rate limiting for API endpoints

## Troubleshooting

### Database connection issues:
```bash
docker-compose down
docker-compose up -d db
# Wait for database to be healthy
docker-compose up -d
```

### Frontend not connecting to backend:
- Check that REACT_APP_API_URL is set correctly
- Verify backend is running on port 8000
- Check CORS settings in backend

### Permission issues:
- Ensure user has admin role for admin operations
- Check JWT token is valid and not expired

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on the GitHub repository.

