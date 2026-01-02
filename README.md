# Nockslock 🔐

**Secure your digital assets with Nockslock, the ultimate cold storage solution for cryptocurrencies.**

Nockslock is a modern, secure web application built to provide a seamless and organized experience for managing digital assets. It features a robust authentication system, comprehensive user profile management, and a high-fidelity responsive UI.

## 🚀 Tech Stack

**Frontend:**
* **Framework:** [Next.js 14/15](https://nextjs.org/) (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion
* **Icons:** React Icons (Fa6, IoMd)
* **Notifications:** Sonner (Toast)

**Backend & Services:**
* **BaaS:** [Supabase](https://supabase.com/) (Auth, Database, Storage)
* **Authentication:** Supabase Auth (Email/Password, OTP, OAuth placeholders)
* **Storage:** Supabase Storage (Profile Avatars)

---

## ✨ Features

### 🔐 Authentication & Security
* **Secure Login:** Email & Password authentication with input sanitization.
* **Multi-Step Registration:**
    * Email validation.
    * **OTP Verification:** Secure email ownership verification via 6-digit code.
    * **Bio-Data Capture:** Detailed user onboarding (Name, Phone).
* **Password Recovery:** Secure "Forgot Password" flow using OTP verification and real-time password strength validation.
* **Account Deletion:** "Danger Zone" allowing users to permanently self-delete their data via secure SQL functions.

### 👤 User Profile Management
* **Profile Customization:**
    * **Avatar Upload:** Drag-and-drop or click-to-upload profile pictures (stored in Supabase Buckets).
    * **Live Updates:** Immediate UI feedback upon changes.
* **Personal Details:**
    * Update First Name and Last Name independently.
    * Update Email Address (requires OTP verification for security).
* **Security Settings:** Change password while logged in.

### 🎨 UI/UX Design
* **Responsive Layouts:**
    * Split-screen designs for Login/Register pages.
    * **Sticky Visuals:** Hero images stay pinned while forms scroll on large screens.
    * **Mobile Optimized:** Fully functional on mobile and tablet devices.
* **Interactive Elements:**
    * Real-time password strength checklist (Pill design).
    * Toast notifications for success/error feedback (Sonner).
    * Smooth page transitions and staggered animations using Framer Motion.

---

## 🛠️ Getting Started

### Prerequisites
* Node.js (v18 or higher)
* npm or yarn
* A Supabase account

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/nockslock.git](https://github.com/yourusername/nockslock.git)
cd nockslock

```

### 2. Install Dependencies

```bash
npm install
# or
yarn install

```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

```

### 4. Run the Development Server

```bash
npm run dev

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.

---

## 🗄️ Supabase Configuration

To make the app function correctly, you must configure your Supabase project as follows:

### 1. Storage Setup (For Avatars)

1. Go to **Storage** in your Supabase Dashboard.
2. Create a new public bucket named `avatars`.
3. Add a **Policy** to allow authenticated users to upload and update their own files:
* *SELECT* (Public)
* *INSERT* (Authenticated users)
* *UPDATE* (Authenticated users where `auth.uid() = owner`)
* *DELETE* (Authenticated users where `auth.uid() = owner`)



### 2. Database Functions (For Account Deletion)

To enable the "Delete Account" feature in settings, run this SQL query in your Supabase SQL Editor:

```sql
-- Create a secure function to allow users to delete themselves
create or replace function delete_own_account()
returns void
language plpgsql
security definer
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

```

### 3. Auth Settings

1. Go to **Authentication -> Providers -> Email**.
2. Ensure **Email Confirmations** are enabled.
3. *(Optional)* Disable "Secure Email Change" if you want the simplified email update flow we implemented, or ensure users check both inboxes if kept enabled.

---

## 📂 Project Structure

```bash
├── app/
│   ├── dashboard/          # Protected User Dashboard
│   │   ├── settings/       # Profile, Next of Kin, Security settings
│   ├── login/              # Login Page & Layout
│   ├── register/           # Registration Steps (Email -> OTP -> Bio)
│   ├── forgot-password/    # Password Recovery Flow
│   ├── layout.tsx          # Root Layout (Sonner Toaster included here)
│   └── page.tsx            # Landing Page
├── components/
│   ├── AuthButton.tsx      # Reusable UI Button
│   ├── PasswordInput.tsx   # Input with Eye toggle
│   ├── HomeLogo.tsx        # App Logo Component
│   └── ...
├── lib/
│   └── supabase/           # Supabase Client initialization
└── public/                 # Static assets (Images, Icons)

```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

```

```