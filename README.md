# 🌿 CannaLog

**Your Personal Cannabis Journey, Demystified.**

CannaLog is a privacy-first, high-performance web application designed for medical cannabis users who want to track, understand, and optimize their cannabis experiences. Built with modern web technologies, CannaLog provides a mindful companion for your cannabis journey.

## ✨ Features

- **🔒 Privacy-First**: Your data is encrypted and remains completely private
- **📱 Mobile-First Design**: Optimized for use on all devices
- **🌍 Internationalization**: Available in English and Polish
- **🌙 Dark/Light Mode**: Comfortable viewing in any lighting condition
- **📊 Personal Analytics**: Understand your patterns and preferences
- **🔐 Secure Authentication**: Powered by Nhost for reliable user management
- **⚡ High Performance**: Built with Astro.js for lightning-fast loading

### Core Functionality

- **Session Logging**: Track strain, dosage, mood, and activities
- **Strain Management**: Personal strain library with terpene profiles
- **Journal Entries**: Document your cannabis experiences
- **Data Insights**: Discover what works best for your wellness goals

## 🏗️ Tech Stack

- **Frontend**: [Astro.js](https://astro.build/) - Static site generation with React islands
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Authentication**: [Nhost](https://nhost.io/) - Backend-as-a-Service with GraphQL
- **Database**: PostgreSQL via Nhost
- **Internationalization**: Custom i18n implementation with English and Polish support
- **Package Manager**: pnpm

## � Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) package manager
- A [Nhost](https://nhost.io/) account for backend services

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cannalog
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Variables**

   Create a `.env` file in the root directory:

   ```env
   # Nhost Configuration
   NHOST_SUBDOMAIN=your-nhost-subdomain
   NHOST_REGION=your-nhost-region
   
   # Optional: Custom environment settings
   NODE_ENV=development
   ```

4. **Start development server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:4321](http://localhost:4321) in your browser.

## 🧞 Commands

| Command              | Action                                           |
| :------------------- | :----------------------------------------------- |
| `pnpm install`       | Install project dependencies                     |
| `pnpm dev`           | Start development server at `localhost:4321`    |
| `pnpm build`         | Build production site to `./dist/`              |
| `pnpm preview`       | Preview production build locally                 |
| `pnpm astro check`   | Run TypeScript and Astro diagnostics           |
| `pnpm astro sync`    | Generate TypeScript types for content          |

## 🌐 Internationalization

CannaLog supports multiple languages:

- **English** (en) - Default language
- **Polish** (pl) - Fully translated interface

### Adding New Languages

1. Create a new JSON file in `src/i18n/` (e.g., `de.json`)
2. Add the language to `src/i18n/ui.ts`
3. Translate all keys from the English file

## 🔐 Authentication & Privacy

- **Secure Authentication**: Email/password authentication via Nhost
- **Data Privacy**: All user data is encrypted and private
- **Row Level Security**: Database access is restricted to authenticated users
- **Session Management**: Secure session handling with automatic cleanup

## 🏃‍♂️ Development Workflow

### Code Style

- **ESLint**: Linting for JavaScript/TypeScript
- **Prettier**: Code formatting
- **TypeScript**: Type safety throughout the application

### Key Architecture Decisions

- **Privacy-First**: All features designed with user privacy in mind
- **Mobile-First**: Responsive design optimized for mobile cannabis users
- **Performance**: Static generation with minimal JavaScript for fast loading
- **Internationalization**: Built-in support for multiple languages from day one

## 📱 Deployment

The application is designed to be deployed on:

- **Vercel** (recommended for Astro.js)
- **Netlify**
- **Any static hosting provider**

### Build Process

```bash
pnpm build
```

The build outputs to `./dist/` and includes:

- Static HTML files
- Optimized CSS and JavaScript
- Compressed assets
- Service worker for offline functionality

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please contact us or open an issue in the repository.

---

## Built with ❤️ for the cannabis community
