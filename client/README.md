# Vibora Social Media Frontend

A modern, responsive social media application built with React, Redux Toolkit, and Tailwind CSS.

## Features

### 🚀 Core Functionality
- **User Authentication**: Signup, Login, Logout with JWT tokens
- **Profile Management**: Edit profile, change password, delete account
- **Social Feed**: Create, edit, delete posts with likes and comments
- **Messaging**: Real-time messaging between connected users
- **Connections**: Send/receive friend requests, manage connections
- **User Search**: Find and connect with other users

### 🎨 User Interface
- **Modern Design**: Clean, responsive UI with Tailwind CSS
- **Real-time Updates**: Live notifications and updates
- **Mobile Responsive**: Optimized for all device sizes
- **Dark/Light Theme**: Consistent visual experience

### 🔧 Technical Features
- **State Management**: Redux Toolkit for global state
- **Routing**: React Router for navigation
- **API Integration**: Axios for backend communication
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Smooth loading experiences throughout the app

## Project Structure

```
src/
├── api/                 # API configuration and instances
├── components/          # Reusable UI components
│   ├── common/         # Common components (Button, Input, etc.)
│   ├── PostCard.jsx    # Post display component
│   ├── PostComposer.jsx # Post creation component
│   ├── Sidebar.jsx     # Navigation sidebar
│   ├── Rightbar.jsx    # Right sidebar with stats
│   └── UserCard.jsx    # User display component
├── features/           # Redux slices and state management
├── pages/             # Main application pages
│   ├── Login.jsx      # User login page
│   ├── Signup.jsx     # User registration page
│   ├── Feed.jsx       # Main social feed
│   ├── Profile.jsx    # User profile page
│   ├── Messages.jsx   # Messaging interface
│   ├── Connections.jsx # Connection management
│   └── UserSearch.jsx # User search and discovery
├── App.jsx            # Main application component
└── main.jsx          # Application entry point
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend documentation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vibora/viborefront/viborafrontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Ensure your backend API is running
   - Update API endpoints in `src/api/axiosInstance.js` if needed

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`
   - The application should now be running!

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Dependencies

### Core Dependencies
- **React 19** - UI library
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling framework

### UI Libraries
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications
- **React Icons** - Additional icons

## API Integration

The frontend communicates with the backend through RESTful APIs:

- **Authentication**: `/signup`, `/login`, `/logout`
- **Profile**: `/profile`, `/profile/edit`, `/profile/password`
- **Posts**: `/post/create`, `/post/edit`, `/post/delete`
- **Feed**: `/feed`, `/feed/users/search`
- **Connections**: `/connection/request`, `/connection/accept`
- **Messages**: `/message/send`, `/message/conversations`

## State Management

The application uses Redux Toolkit for state management:

- **Auth Slice**: User authentication state
- **Global State**: Application-wide state
- **Async Actions**: API calls and data fetching

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Component Library**: Consistent design system
- **Dark Mode Support**: Theme switching capability

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Roadmap

### Upcoming Features
- [ ] Real-time notifications
- [ ] File upload support
- [ ] Advanced search filters
- [ ] Group messaging
- [ ] Post scheduling
- [ ] Analytics dashboard

### Performance Improvements
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Image optimization
- [ ] Caching strategies
- [ ] Bundle optimization

---

Built with ❤️ by the Vibora Team
