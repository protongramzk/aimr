# Project Routes Documentation

This document describes the routing structure and the purpose of each page in the **atomol** application.

## 🗺 Route Overview

| Path | Description | Access |
| :--- | :--- | :--- |
| `/` | **Home Page**: Displays a feed of molecules, rankings, and popular atoms. | Public |
| `/auth/login` | **Login Page**: Allows users to authenticate with their credentials. | Public |
| `/auth/register` | **Register Page**: Allows new users to create an account. | Public |
| `/me` | **Profile/Dashboard**: Manages user profile and API keys for publishing molecules. | Protected (Login Required) |
| `/settings` | **Settings Page**: Customize application appearance and theme. | Public |
| `/mol/[name]` | **Molecule Detail**: Detailed view of a specific molecule, including its README and file structure. | Public |

## 📄 Page Details

### 1. Home Page (`src/routes/+page.svelte`)
The main entry point of the application. It features a tabbed interface (`TabView`) to switch between:
- **Feed**: Latest updates and new molecules.
- **Rank**: Popular molecules based on downloads and stars.
- **Stars**: Molecules starred by the current user.
- **You**: Personal molecules managed by the logged-in user.

### 2. Authentication
- **Login (`src/routes/auth/login/+page.svelte`)**: A boxy-styled form for email and password authentication.
- **Register (`src/routes/auth/register/+page.svelte`)**: Form for new users to sign up with username, email, and password.

### 3. User Dashboard (`src/routes/me/+page.svelte`)
A central hub for logged-in users.
- **Profile Card**: Shows user identity and logout option.
- **API Key Management**: Create, rename, delete, and view API keys required for publishing molecules via CLI or external tools.

### 4. Molecule Detail (`src/routes/mol/[name]/+page.svelte`)
A dynamic route that fetches and displays information about a specific molecule based on its name.
- **Molecule Info**: Displays README documentation parsed from Markdown.
- **File Explorer**: Uses the `FileView` component to navigate the directory structure of the molecule's atoms.

### 5. Settings (`src/routes/settings/+page.svelte`)
A utility page for customizing the UI. Users can switch between predefined color themes:
- **Default**: Raspberry & Blueberry.
- **Tenper**: Blueberry & Lime Green.
- **Orangrape**: Orange & Violet.

### 6. Layout (`src/routes/+layout.svelte`)
The root layout that persists across all pages. It manages:
- **Global Navigation**: Sidebar and header components.
- **Session Handling**: Initial user authentication and token refresh.
- **Theme Application**: Ensures the selected theme is applied to the document root.
- **Sidebar State**: Manages the opening/closing of the global navigation drawer.
