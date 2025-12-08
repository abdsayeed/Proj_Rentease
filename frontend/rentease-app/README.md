# RentEase - Angular Frontend

This is the frontend for the RentEase property rental app. Built with Angular 19.

## What it does

- Browse properties and see details
- Register and login
- Add properties to favorites
- Book/apply for rentals
- Agent dashboard to manage listings
- Admin dashboard to manage users and properties

## Tech used

- Angular 19
- TypeScript
- RxJS for async stuff
- Angular Signals for state
- CSS for styling

## Folder structure

```
src/app/
 core/                # services and guards
    models/          # typescript interfaces
    services/        # api calls
    guards/          # route protection
 shared/              # reusable components
    components/      # button, card, etc
 features/            # main pages
    auth/            # login, register
    properties/      # property list and detail
    bookings/        # booking form
    user/            # user dashboard
    agent/           # agent dashboard
    admin/           # admin dashboard
 layout/              # navbar and footer
```

## How to run

1. Make sure you have Node.js 18+ installed

2. Install packages:
```bash
npm install
```

3. Start the dev server:
```bash
npm start
```

App runs on http://localhost:4200

## Main features

### Authentication
- Login and register forms
- JWT token storage
- Auto token refresh
- Role based access (customer, agent, admin)

### Properties
- Property listing with search
- Filter by type
- Property detail page
- Image gallery

### Booking
- Multi-step booking wizard
- Tenant information form
- Date selection

### Dashboards
- User: see bookings and favorites
- Agent: manage own properties
- Admin: manage all users and properties

## Scripts

- npm start - run dev server
- npm run build - build for production
- npm test - run tests
