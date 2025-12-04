# Core Module

This directory contains the core services, guards, interceptors, and models for the Rentease Angular application.

## Structure

```
core/
├── guards/
│   ├── auth.guard.ts       # Protects authenticated routes
│   ├── agent.guard.ts      # Protects agent-only routes
│   └── admin.guard.ts      # Protects admin-only routes
├── interceptors/
│   └── token.interceptor.ts # Adds JWT token to requests
├── models/
│   └── index.ts            # TypeScript interfaces
├── services/
│   ├── auth.service.ts     # Authentication & JWT management
│   └── api.service.ts      # All API endpoints
└── index.ts                # Barrel exports
```

## Services

### AuthService

Handles user authentication, JWT token management, and role-based access control.

**Key Methods:**
- `register(data)` - Register new user
- `login(data)` - Login and store JWT token
- `logout()` - Clear authentication data
- `isAuthenticated()` - Check if user is logged in
- `isAdmin()` - Check if user has admin role
- `isAgent()` - Check if user has agent or admin role
- `getUserRole()` - Get current user's role
- `getToken()` - Get stored JWT token

**Usage:**
```typescript
constructor(private authService: AuthService) {}

login() {
  this.authService.login({ email, password }).subscribe({
    next: (response) => {
      console.log('Logged in successfully');
      this.router.navigate(['/dashboard']);
    },
    error: (error) => {
      console.error('Login failed', error);
    }
  });
}
```

### ApiService

Provides typed methods for all backend API endpoints.

**Property Methods:**
- `getProperties(filters?)` - Get all properties with optional filters
- `getProperty(id)` - Get single property
- `createProperty(data)` - Create new property
- `updateProperty(id, data)` - Update property
- `deleteProperty(id)` - Delete property

**User Methods:**
- `getFavorites()` - Get user's favorites
- `addFavorite(propertyId)` - Add to favorites
- `removeFavorite(propertyId)` - Remove from favorites
- `sendInquiry(propertyId, message)` - Send inquiry
- `getInquiries()` - Get user's inquiries

**Agent Methods:**
- `getMyProperties()` - Get agent's properties
- `createAgentProperty(data)` - Create property as agent
- `updateAgentProperty(id, data)` - Update agent's property
- `deleteAgentProperty(id)` - Delete agent's property

**Admin Methods:**
- `getAllProperties()` - Get all properties (admin)
- `adminUpdateProperty(id, data)` - Update any property (admin)
- `adminDeleteProperty(id)` - Delete any property (admin)
- `getAllUsers()` - Get all users (admin)
- `updateUserRole(userId, role)` - Update user role (admin)
- `getStatistics()` - Get system statistics (admin)

**Usage:**
```typescript
constructor(private apiService: ApiService) {}

loadProperties() {
  this.apiService.getProperties({ district: 'Mayfair' }).subscribe({
    next: (properties) => {
      this.properties = properties;
    },
    error: (error) => {
      console.error('Failed to load properties', error);
    }
  });
}
```

## Guards

### authGuard

Protects routes that require authentication. Redirects to `/login` if not authenticated.

**Usage in routes:**
```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard]
}
```

### agentGuard

Protects routes that require agent or admin role. Redirects to `/` if not authorized.

**Usage in routes:**
```typescript
{
  path: 'add-property',
  component: AddPropertyComponent,
  canActivate: [agentGuard]
}
```

### adminGuard

Protects routes that require admin role. Redirects to `/` if not authorized.

**Usage in routes:**
```typescript
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [adminGuard]
}
```

## Interceptors

### tokenInterceptor

Automatically attaches the JWT token to all HTTP requests via the `Authorization: Bearer <token>` header.

Configured in `app.config.ts`:
```typescript
provideHttpClient(
  withFetch(),
  withInterceptors([tokenInterceptor])
)
```

## Models

TypeScript interfaces that match the backend JSON responses:

- `User` - User account
- `Property` - Property listing
- `Favorite` - User favorite
- `Inquiry` - Property inquiry
- `AuthResponse` - Login response
- `RegisterResponse` - Registration response
- `Statistics` - System statistics
- `PropertyFilters` - Property filter options
- `TokenPayload` - JWT token payload

## Environment Configuration

API URL is configured in environment files:

**Development** (`environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:5000/api/v1'
};
```

**Production** (`environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api/v1'
};
```

## Backend Integration

All services are configured to work with the Flask backend running on `http://127.0.0.1:5000`.

**Backend Endpoints:**
- Auth: `/auth/register`, `/auth/login`
- Properties: `/api/v1/properties/`
- User: `/api/v1/users/favorites`, `/api/v1/users/inquiries`
- Agent: `/api/v1/agent/properties`
- Admin: `/api/v1/admin/properties`, `/api/v1/admin/users`, `/api/v1/admin/statistics`

## Notes

- All HTTP requests automatically include the JWT token via the interceptor
- Token is stored in localStorage with key `'token'`
- User info is stored in localStorage with key `'user'`
- Guards use functional style (`CanActivateFn`) for Angular 20
- All services use standalone component architecture (no NgModules)
