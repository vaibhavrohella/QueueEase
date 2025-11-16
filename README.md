# QueueEase - Barber Shop Queue Management System

**QueueEase** is a modern, real-time queue management platform designed for barber shops and saloons. It helps customers find nearby shops, check queue status, and join queues remotely, while enabling shop owners to efficiently manage their queues and track business analytics.

## 🚀 Features

### For Customers
- **Find Nearby Shops**: Discover barber shops in your area with real-time availability
- **Real-time Queue Tracking**: See exact wait times and queue positions instantly
- **Join Remotely**: Reserve your spot from anywhere and arrive on time
- **Interactive Map View**: Visualize shop locations on an interactive map
- **Queue Management**: Join queues, view your position, and get notified when it's your turn

### For Shop Owners
- **Queue Management**: Efficiently manage customer queues in real-time
- **Business Analytics**: Track performance metrics and optimize operations
- **Shop Setup**: Easy onboarding and shop profile configuration
- **Real-time Updates**: Monitor queue status and customer flow

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Backend & Database**: Supabase
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation
- **Maps Integration**: Google Maps API
- **Icons**: Lucide React

## Screenshots

### Login Page
<img width="1901" height="900" alt="Screenshot 2025-11-09 224734" src="https://github.com/user-attachments/assets/ec4bfd4a-7646-428c-bb28-aa08951311d3" />


### User Dashboard
<img width="1886" height="903" alt="Screenshot 2025-11-09 224440" src="https://github.com/user-attachments/assets/df5fc988-bf8b-476c-8041-bd1ac269ebf5" />

<img width="1816" height="566" alt="Screenshot 2025-11-09 224632" src="https://github.com/user-attachments/assets/eba41c13-50ce-454e-bdc4-bf8c8463c43a" />

### Maps
<img width="1770" height="500" alt="Screenshot 2025-11-09 192422" src="https://github.com/user-attachments/assets/2a6f810c-4d9f-4c29-9326-2eee196f6d99" />


### Barber Dashboard
<img width="1887" height="918" alt="Screenshot 2025-11-09 224850" src="https://github.com/user-attachments/assets/910d51a5-509b-4cb1-b52b-cc7462e58d7d" />


## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** or **bun** (comes with Node.js)
- **Git** - [Download Git](https://git-scm.com/)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd buzz-barber-queue
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```
   
   You can get these values from your [Supabase project settings](https://app.supabase.com/project/_/settings/api).

4. **Run the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```
   
   The application will be available at `http://localhost:8080`

## 📜 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint to check code quality

## 📁 Project Structure

```
buzz-barber-queue/
├── public/                 # Static assets
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── MapView.tsx  # Map visualization component
│   │   └── QueueEaseLogo.tsx
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # Third-party integrations
│   │   └── supabase/   # Supabase client and types
│   ├── lib/            # Utility functions and helpers
│   ├── pages/          # Page components
│   │   ├── Landing.tsx
│   │   ├── Auth.tsx
│   │   ├── CustomerDashboard.tsx
│   │   ├── BarberDashboard.tsx
│   │   └── ShopSetup.tsx
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Application entry point
├── supabase/           # Supabase configuration and migrations
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

## 🔐 Authentication

The application uses Supabase Authentication. Users can:
- Sign up as either a customer or barber shop owner
- Sign in with email/password
- Access role-based dashboards

## 🗺️ Maps Integration

The app integrates with Google Maps API to:
- Display shop locations on an interactive map
- Calculate distances and show nearby shops
- Provide location-based search functionality

Make sure to configure your Google Maps API key if you're using location services.

## 🚢 Deployment

### Deploy via Lovable

If you're using Lovable, you can deploy directly:
1. Open your [Lovable Project](https://lovable.dev/projects/97dfe0d2-84b2-4ed2-954a-afba7e0e8a39)
2. Click on **Share → Publish**

### Deploy Manually

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your preferred hosting service:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting service

3. **Configure environment variables** on your hosting platform

### Custom Domain

To connect a custom domain via Lovable:
1. Navigate to **Project > Settings > Domains**
2. Click **Connect Domain**
3. Follow the setup instructions

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 🧪 Development

### Code Editing Options

**Option 1: Use Lovable**
- Visit the [Lovable Project](https://lovable.dev/projects/97dfe0d2-84b2-4ed2-954a-afba7e0e8a39)
- Start prompting to make changes
- Changes are automatically committed to the repo

**Option 2: Use Your IDE**
- Clone the repo and work locally
- Push changes to sync with Lovable

**Option 3: GitHub Codespaces**
- Click the "Code" button in your repository
- Select "Codespaces" tab
- Create a new codespace
- Edit files directly in the browser

**Option 4: GitHub Web Editor**
- Navigate to any file
- Click the "Edit" button (pencil icon)
- Make changes and commit

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🆘 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact the project maintainers

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Backend powered by [Supabase](https://supabase.com)

---

**QueueEase** - Making queue management effortless. ✂️💈

