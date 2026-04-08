# atomol (AIMR)

**atomol** is a modern registry and distribution platform for **Atomic Functions** (Atoms) designed for JavaScript and Edge Runtime environments.

Inspired by the concept of "Chemical Programming," atomol allows developers to share and consume small, self-contained, and highly optimized functions that reside in their own files. This approach ensures maximum modularity, explicit parameter passing, and zero dependencies on Node.js built-ins, making them perfect for V8 Isolate environments like Cloudflare Workers, Supabase Edge Functions, and Vercel Edge.

## 🚀 Key Features

- **Atomic Modularity**: Every function (atom) is an independent module. No more bloated libraries—import exactly what you need.
- **Edge Native**: Optimized for modern Edge Runtimes (WinterCG compliant), ensuring lightweight execution and fast cold starts.
- **Molecule Registry**: Browse a growing feed of molecules (libraries of atoms), ranked by popularity and community feedback.
- **Interactive File Viewer**: Inspect the source code of any atom directly in the browser with syntax highlighting.
- **API Management**: Easily generate API keys to publish your own molecules and contribute to the ecosystem.
- **Themeable UI**: Built with a sleek, flat monochrome design system that supports multiple high-contrast themes (Raspberry, Blueberry, Lime, and Violet).

## 🛠 Tech Stack

- **Frontend**: Svelte 5 (Runes) + SvelteKit
- **Language**: TypeScript
- **Styling**: Unified Monochrome Design System
- **API**: Custom REST API for package management and star tracking
- **Distribution**: Integrated Supabase-powered CDN

## 📖 Getting Started

### Developing Locally

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm run dev
   ```

3. Build for production:
   ```bash
   pnpm run build
   ```

## 🧪 Concepts

- **Atom**: A single, focused JavaScript function in its own file.
- **Molecule**: A collection of atoms grouped together as a package.
- **Chemical Programming**: A development philosophy emphasizing modularity, immutability, and explicit dependencies.

---

Built with ❤️ for the Edge computing community.
