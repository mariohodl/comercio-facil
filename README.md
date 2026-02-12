# Comercio Fácil

Comercio Fácil is a comprehensive, modern Point of Sale (POS) and inventory management system built with Next.js 15. It is designed to help small and medium-sized businesses manage their operations efficiently, from sales and inventory to supplier orders and analytics.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![MongoDB](https://img.shields.io/badge/MongoDB-Leaf-green)

## 🚀 Key Features

### 🛒 Point of Sale (POS)
- **Fast Checkout**: Optimized interface for quick transactions.
- **Barcode Scanning**: Integrated support for hardware barcode scanners with intelligent input handling.
- **Mobile Friendly**: Responsive design that works seamlessly on tablets and mobile devices.
- **Cart Management**: Easy addition, modification, and removal of items.
- **Calculator**: Built-in calculator modal for quick computations.

### 📦 Inventory Management
- **Product Catalog**: Create and manage products with variants (size, color, etc.).
- **Hierarchy**: Organize products by Categories, Subcategories, Brands, and Units.
- **Stock Tracking**: Real-time stock updates, low stock alerts, and adjustment logs.
- **Barcode & QR**: Generate and print barcodes and QR codes for products.
- **Expiry Management**: Track manufacturing and expiration dates.

### 💼 Business Operations
- **Purchases & Suppliers**: Manage supplier information and create detailed purchase orders (Regular, With Exchanges, Replacements).
- **Sales & Invoices**: Track sales history, generate invoices, and manage returns.
- **Cash Register**: Manage cash drawers/sessions.
- **User Management**: Role-based access control for administrators and staff.

### 📊 Analytics & Dashboard
- **Overview**: Comprehensive dashboard with key performance indicators.
- **Reports**: detailed sales and inventory reports (visualized with Recharts).

### 🌍 Application Features
- **Internationalization**: Full support for multiple languages (English/Spanish via `next-intl`).
- **Dark Mode**: Built-in dark/light mode toggle.
- **Secure Auth**: Authentication powered by NextAuth.js.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **File Uploads**: [UploadThing](https://uploadthing.com/)
- **Payments**: [Stripe](https://stripe.com/) integration

## 🏁 Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- MongoDB instance (local or Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/comercio-facil.git
   cd comercio-facil
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # Auth
   AUTH_SECRET=your_auth_secret  # Generate with: npx auth secret
   AUTH_URL=http://localhost:3000

   # UploadThing
   UPLOADTHING_SECRET=your_uploadthing_secret
   UPLOADTHING_APP_ID=your_uploadthing_app_id
   
   # Payments (Optional)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_public_key
   ```
   > Note: See `next.config.ts` or `auth.ts` for other specific env vars required.

4. **Seed the database (Optional):**
   To populate the database with initial data (admin user, categories, etc.):
   ```bash
   npm run seed
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
comercio-facil/
├── app/                  # Next.js App Router pages & API routes
│   ├── (auth)/           # Authentication routes (login, register)
│   ├── admin/            # Admin dashboard & POS routes
│   └── api/              # Backend API endpoints
├── components/           # Reusable UI components
│   ├── admin/            # Admin-specific components
│   └── ui/               # Shadcn/Radix primitive components
├── hooks/                # Custom React hooks (e.g., useBarcodeScanner)
├── lib/                  # Utilities, DB models, & server actions
│   ├── actions/          # Server Actions (Mutations & Queries)
│   ├── db/               # Database connection & Mongoose models
│   └── validator.ts      # Zod schemas
├── messages/             # i18n translation files (en.json, es.json)
└── public/               # Static assets
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
