# Rentease Frontend - Professional Architecture

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                          # Core module - never lazy-loaded
│   │   ├── models/
│   │   │   └── index.ts              # All TypeScript interfaces
│   │   ├── services/
│   │   │   ├── auth.service.ts       # Authentication & user state
│   │   │   └── api.service.ts        # All API endpoints (typed)
│   │   ├── guards/
│   │   │   └── auth.guard.ts         # Route protection (authGuard, roleGuard, agentGuard, adminGuard)
│   │   ├── interceptors/
│   │   │   └── token.interceptor.ts  # JWT token injection
│   │   └── index.ts                  # Barrel export
│   │
│   ├── features/                      # Feature modules
│   │   ├── auth/                      # Login & Registration
│   │   ├── properties/                # Property listing & details
│   │   ├── dashboard/                 # User/Agent/Admin dashboards
│   │   └── favorites/                 # Saved properties
│   │
│   ├── shared/                        # Reusable across features
│   │   ├── models/
│   │   │   └── index.ts              # Re-exports from core
│   │   ├── components/
│   │   │   └── index.ts              # (PropertyCard, Loading, etc.)
│   │   ├── utils/
│   │   │   └── index.ts              # Helper functions
│   │   └── index.ts                  # Barrel export
│   │
│   ├── layouts/                       # Layout components
│   │   └── navbar/                    # Navigation bar
│   │
│   ├── environments/                  # Configuration
│   │   ├── environment.ts             # Development
│   │   └── environment.prod.ts        # Production
│   │
│   ├── app.routes.ts                  # Route definitions + guards
│   ├── app.config.ts                  # App configuration + interceptors
│   ├── app.ts                         # Root component
│   └── app.css                        # Global styles
│
├── index.html
├── main.ts
└── styles.css
```

## 🏗 Architecture Overview

### Core Module
**Never lazy-loaded.** Contains:
- **Models** (`core/models/index.ts`): All TypeScript interfaces & types
- **Services**: 
  - `AuthService`: User authentication + state management
  - `ApiService`: Typed HTTP client for all endpoints
- **Guards**: Route protection with role-based access control
- **Interceptors**: Automatic JWT token injection

### Features Module
Self-contained feature modules:
- `auth/`: Login & registration pages
- `properties/`: Home, details, add property
- `dashboard/`: Role-specific dashboards
- `favorites/`: Saved properties

### Shared Module
Reusable components, utilities, and models:
- Shared UI components
- Helper functions (formatting, validation)
- Common interfaces

### Layouts Module
Page structure components like navbar

## 📝 Models

### User Models
```typescript
User, LoginRequest, LoginResponse, RegisterRequest, AuthState
```

### Property Models
```typescript
Property, PropertyType, PropertyFilters, PropertyResponse
```

### User Action Models
```typescript
Favorite, Inquiry, InquiryRequest
```

### Admin Models
```typescript
Statistics, DashboardStats
```

### API Response Models
```typescript
ApiResponse<T>, PaginatedResponse<T>, ApiError
```

## 🔐 Authentication Flow

1. **User registers/logs in** → `AuthService.register()` / `AuthService.login()`
2. **Token stored** in localStorage
3. **TokenInterceptor** automatically adds `Authorization: Bearer <token>` to all requests
4. **Protected routes** use `authGuard` to check authentication
5. **Role-based guards**: `agentGuard`, `adminGuard` for specific roles
6. **Auto-logout** on 401 response

## 🌐 API Service

### Properties
```typescript
getProperties(filters?)          // List with filters
getProperty(id)                  // Get single property
createProperty(data)             // Create (agent)
updateProperty(id, data)         // Update (agent)
deleteProperty(id)               // Delete (agent)
getMyProperties()                // Agent's properties (8s timeout)
```

### Favorites
```typescript
getFavorites()                   // Get saved properties (8s timeout)
addFavorite(propertyId)          // Save property
removeFavorite(propertyId)       // Remove from favorites
isFavorited(propertyId)          // Check if favorited
```

### Inquiries
```typescript
sendInquiry(data)                // Send inquiry
getInquiries()                   // Received inquiries (agent)
getSentInquiries()               // Sent inquiries (user)
updateInquiry(id, status)        // Update status (agent)
```

### User Profile
```typescript
getProfile()                     // Get user profile
updateProfile(data)              // Update profile
changePassword(current, new)     // Change password
```

### Admin
```typescript
getStatistics()                  // Dashboard stats (8s timeout)
getAllUsers()                    // List all users
updateUserRole(userId, role)     // Change user role
deleteUser(userId)               // Delete user
```

## 🛡 Route Guards

### `authGuard`
Checks if user is authenticated. Redirects to `/login` if not.

### `roleGuard(roles: string[])`
Checks if user has one of allowed roles.

### `agentGuard`
Shortcut for `roleGuard(['agent'])`

### `adminGuard`
Shortcut for `roleGuard(['admin'])`

## ⏱ Timeout Strategy

- **Standard endpoints**: 8s timeout
- **Slow queries**: 8s timeout
  - `getMyProperties()`
  - `getFavorites()`
  - `getStatistics()`
- **Fast endpoints**: 8s timeout

Timeout is defined in `environment.ts` and can be adjusted per environment.

## 🔧 Configuration

### Development (`environment.ts`)
```typescript
{
  production: false,
  apiUrl: 'http://127.0.0.1:5000',
  apiTimeout: 8000,
  tokenKey: 'token',
  userKey: 'user'
}
```

### Production (`environment.prod.ts`)
```typescript
{
  production: true,
  apiUrl: 'https://api.rentease.app',
  apiTimeout: 8000,
  tokenKey: 'token',
  userKey: 'user'
}
```

## 🚀 Usage Examples

### Authentication
```typescript
// Login
this.authService.login({ email, password }).subscribe(
  response => {
    // Automatically saved to state & localStorage
  }
);

// Check if authenticated
if (this.authService.isAuthenticated()) { }

// Get current user
const user = this.authService.getCurrentUser();

// Get user role
const role = this.authService.getUserRole();

// Logout
this.authService.logout(); // Clears state & redirects
```

### API Calls
```typescript
// Get properties with filters
this.apiService.getProperties({
  district: 'Mayfair',
  type: 'apartment',
  price_max: 500000
}).subscribe(response => {
  this.properties = response.properties;
});

// Add to favorites
this.apiService.addFavorite(propertyId).subscribe();

// Send inquiry
this.apiService.sendInquiry({
  property_id: id,
  message: 'I am interested...'
}).subscribe();
```

### Using Guards in Routes
```typescript
const routes: Routes = [
  { path: 'properties', component: PropertiesComponent },
  { 
    path: 'favorites', 
    component: FavoritesComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'add-property', 
    component: AddPropertyComponent,
    canActivate: [agentGuard]
  }
];
```

## 📚 Shared Utilities

```typescript
// Formatting
formatPrice(1000)                    // "£1,000"
formatDate(new Date())               // "22 Nov 2025"
formatDateTime(new Date())           // "22 Nov 2025 14:30"
getRelativeTime(new Date())          // "2 hours ago"

// Validation
isValidEmail(email)
validatePassword(password)           // Returns { isValid, errors[] }

// String manipulation
truncateString(str, 50)
getInitials("John Doe")              // "JD"
slugify("Hello World")               // "hello-world"

// Utilities
debounce(fn, 300)
```

## 🎯 Best Practices

✅ **Strict TypeScript** - All API responses are typed
✅ **Centralized API** - Single service for all endpoints
✅ **Interceptors** - Automatic token injection
✅ **Route Guards** - Built-in authorization
✅ **SSR Safe** - Window object checks
✅ **Error Handling** - Comprehensive error catching
✅ **Timeouts** - Reliability for slow connections
✅ **Environment Config** - Easy dev/prod switching
✅ **Separation of Concerns** - Clear module boundaries
✅ **Scalable Structure** - Easy to add features

## 🔄 Migration Guide

### Migrating Old Components
1. Move component to appropriate feature folder
2. Update imports to use new paths:
   ```typescript
   // Before
   import { ApiService } from './services/api.service';
   
   // After
   import { ApiService } from '../core/services/api.service';
   ```
3. Use typed models from `core/models`
4. Update route paths if needed

### Example: Home Component
```typescript
// Before: src/app/home/home.ts
// After: src/app/features/properties/home/home.ts

import { ApiService } from '../../../core/services/api.service';
import { Property, PropertyFilters } from '../../../core/models';

@Component({...})
export class HomeComponent {
  properties: Property[] = [];
  
  constructor(private api: ApiService) {}
  
  loadProperties() {
    this.api.getProperties().subscribe(response => {
      this.properties = response.properties;
    });
  }
}
```

## 📦 Dependencies

- **Angular**: 19+
- **RxJS**: For reactive programming
- **TypeScript**: Strict mode enabled
- **Vite**: Build tool

## 🚦 Next Steps

1. **Migrate old components** to feature folders
2. **Create feature modules** as needed
3. **Add shared components** (PropertyCard, etc.)
4. **Implement page components** with new service/guard structure
5. **Add error handling** UI components
6. **Implement loading states** with shared loading component
