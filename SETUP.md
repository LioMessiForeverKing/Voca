# Setup Guide

This guide covers everything you need to get this starter code running — on your phone, in a browser, or deployed live on the internet.

---

## Table of Contents

| # | Section | What It Covers |
|---|---|---|
| 1 | [Quick Start (Get Running in 3 Minutes)](#1-quick-start-get-running-in-3-minutes) | Clone, install, run — the fastest path to a working app |
| 2 | [Running as a Mobile App](#2-running-as-a-mobile-app) | Detailed guide for running on your iPhone or Android phone using Expo Go |
| 3 | [Running as a Web App](#3-running-as-a-web-app) | How to run the same code in your browser as a website |
| 4 | [Deploying Your Web App (Vercel)](#4-deploying-your-web-app-vercel) | Put your web app on the internet so anyone can visit it |
| 5 | [Deploying to the App Store (iOS & Android)](#5-deploying-to-the-app-store-ios--android) | Publish your app to the Apple App Store or Google Play Store |
| 6 | [Convex Backend (Detailed)](#6-convex-backend-detailed) | In-depth walkthrough of setting up and understanding the Convex backend |
| 7 | [Project Structure & Reference](#7-project-structure--reference) | Where everything lives and how it all fits together |

---
---

# 1. Quick Start (Get Running in 3 Minutes)

**Already cloned this repo and want to start building? This is all you need.**

### Step 1: Clone and Enter the Project

```bash
git clone <your-repo-url> my-new-project
cd my-new-project
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs everything you need — React Native, Expo, and Convex are all included.

### Step 3: Set Up Your Convex Backend

```bash
npx convex dev
```

This single command does everything:

1. Opens your browser to **log in** to Convex (create a free account at [dashboard.convex.dev](https://dashboard.convex.dev) if you don't have one)
2. **Creates a new Convex project** for you (or lets you pick an existing one)
3. **Generates your `.env.local` file** automatically with your deployment URL
4. **Pushes your schema and functions** to Convex
5. **Starts watching** for changes — leave this terminal running

> **That's it for the backend.** No manual `.env` file creation, no copying URLs around. `npx convex dev` handles it all on first run.

### Step 4: Start the App

Open a **second terminal** and run:

```bash
npx expo start
```

Scan the QR code with your phone:
- **iPhone** — use the Camera app
- **Android** — use the Expo Go app

> Make sure [Expo Go](https://expo.dev/go) is installed on your phone and that your phone and computer are on the **same Wi-Fi network**.

### Step 5: Start Building

You're up and running! Here's where to make changes:

| What | Where |
|---|---|
| App UI | `App.js` |
| Backend functions | `convex/messages.js` |
| Database schema | `convex/schema.js` |
| Convex Dashboard | [dashboard.convex.dev](https://dashboard.convex.dev) |

### Quick Summary

```
Terminal 1:  npx convex dev       ← keeps backend in sync
Terminal 2:  npx expo start       ← runs the app
Phone:       scan the QR code     ← open in Expo Go
```

**Three commands. Two terminals. That's all you need.**

[Back to top](#table-of-contents)

---
---

# 2. Running as a Mobile App

**This section walks you through running the app on your iPhone or Android phone in detail.** If the Quick Start above worked for you, you can skip this. Come back here if you ran into issues or want to understand what's happening under the hood.

---

### 2.1 Prerequisites

Before you start, you need two things on your phone:

1. **The Expo Go app** — this is a free app that lets you run Expo projects on your phone without going through the App Store review process. Think of it as a "test runner" for your app.
   - **iPhone**: Search "Expo Go" in the App Store and install it
   - **Android**: Search "Expo Go" in the Google Play Store and install it

2. **Same Wi-Fi network** — your phone and your computer must be on the same Wi-Fi network. Expo sends your app code from your computer to your phone over the local network.

---

### 2.2 Install Dependencies

If you haven't already, open a terminal in the project folder and run:

```bash
npm install
```

This downloads all the packages listed in `package.json` into the `node_modules/` folder. You only need to do this once (or again if you add new packages later).

---

### 2.3 Start the Convex Dev Server

In your terminal, run:

```bash
npx convex dev
```

**What this does:** It connects your local project to your Convex cloud backend. It watches for changes in the `convex/` folder and automatically syncs your backend functions and schema whenever you save a file.

**Keep this terminal running.** Don't close it. Open a new terminal for the next step.

---

### 2.4 Start Expo

In a **second terminal**, run:

```bash
npx expo start
```

You'll see a QR code in the terminal, and something like this:

```
Metro waiting on exp://192.168.x.x:8081
...
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

**What this does:** Expo starts a local development server (called Metro) that bundles your JavaScript code and serves it to your phone. When your phone connects, it downloads the code and runs it inside the Expo Go app.

---

### 2.5 Open on Your Phone

- **iPhone**: Open the **Camera** app and point it at the QR code in the terminal. You'll see a notification banner pop up — tap it. It will open Expo Go and load your app.
- **Android**: Open the **Expo Go** app directly and tap **Scan QR code**, then scan the QR code from the terminal.

The app should load on your phone. You'll see the chat screen with a text input at the bottom.

---

### 2.6 Troubleshooting

| Problem | Solution |
|---|---|
| QR code won't scan / app won't connect | Make sure your phone and computer are on the **same Wi-Fi network** |
| "Network error" or blank screen | Make sure `npx convex dev` is running in another terminal |
| App loads but messages don't appear | Check that `.env.local` has the correct `EXPO_PUBLIC_CONVEX_URL` and restart Expo (`npx expo start`) |
| Expo Go says version mismatch | Run `npx expo install expo@latest` to update, or update the Expo Go app on your phone |
| Can't connect over Wi-Fi at all | Try running `npx expo start --tunnel` instead (this uses a cloud tunnel, no shared Wi-Fi needed — it will prompt you to install `@expo/ngrok` if needed) |

[Back to top](#table-of-contents)

---
---

# 3. Running as a Web App

**This section shows you how to run the exact same code in your browser as a website.** No code changes needed — Expo can target web in addition to mobile.

---

### 3.1 How Is This Possible?

Here's the key insight: **Expo is not just a mobile framework.** It's a framework that can target multiple platforms — iOS, Android, *and* web — from the same codebase.

When you write React Native components like `<View>`, `<Text>`, `<TextInput>`, a library called `react-native-web` automatically translates them into normal HTML elements that browsers understand:

| What you write (React Native) | What the browser sees (HTML) |
|---|---|
| `<View>` | `<div>` |
| `<Text>` | `<span>` |
| `<TextInput>` | `<input>` |
| `<TouchableOpacity>` | `<div>` with click handlers |
| `<FlatList>` | scrollable `<div>` with items |
| `StyleSheet.create({...})` | CSS styles |

You don't need to change your code at all. The same `App.js` works on phone and in the browser.

---

### 3.2 Install Web Dependencies

Expo needs a few extra packages to run in a browser. Run this one command:

```bash
npx expo install react-dom react-native-web @expo/metro-runtime
```

**What these do:**
- **`react-dom`** — this is what React uses to render to a browser (instead of a phone screen). On mobile, React uses `react-native` to render. On web, it uses `react-dom`. Same React, different renderer.
- **`react-native-web`** — the magic layer that translates React Native components into HTML elements. Without this, the browser wouldn't know what `<View>` or `<Text>` means.
- **`@expo/metro-runtime`** — enables hot reloading in the browser during development, so when you save a file, the browser updates instantly without a full page refresh.

---

### 3.3 Run It

Make sure `npx convex dev` is still running in one terminal (it should already be from earlier), then in your second terminal:

```bash
npx expo start --web
```

That's it. Your browser will open and you'll see the same chat app running as a website at `http://localhost:8081`.

> **Shortcut:** You can also use the npm script that's already in `package.json`:
> ```bash
> npm run web
> ```

---

### 3.4 Quick Summary (Web Version)

```
Terminal 1:  npx convex dev           ← keeps backend in sync
Terminal 2:  npx expo start --web     ← opens app in browser
Browser:     http://localhost:8081    ← your web app
```

---

### 3.5 Running Mobile and Web at the Same Time

You can run both! Start Expo normally:

```bash
npx expo start
```

Then press **`w`** in the terminal to also open the web version. Now your app is running on your phone *and* in your browser simultaneously, both connected to the same Convex backend, with real-time sync between them.

---

### 3.6 Web-Specific Tips

- **Some React Native components don't work on web.** The ones used in this starter (`View`, `Text`, `TextInput`, `FlatList`, `TouchableOpacity`, `KeyboardAvoidingView`) all work fine. If you add new libraries later, check that they support web.
- **`KeyboardAvoidingView` does nothing on web** — but that's fine, it just becomes a regular container. Browsers handle keyboards differently than phones, so this component gracefully does nothing.
- **Styling is the same.** `StyleSheet.create()` works identically on web. The styles you write for mobile will apply on web too.

---

### 3.7 What If I Only Want a Web App?

If you never plan to run this on a phone and want a "normal" React web app instead, you have two options:

**Option A: Keep using Expo (recommended for this starter)**

Just always run `npx expo start --web`. Ignore the mobile stuff. This is the easiest path since everything already works. You still get hot reloading, the same component library, and zero extra setup.

**Option B: Rewrite as a plain React app (more work, but cleaner for web-only)**

If you want a traditional React web app with no Expo at all:

1. Create a new project: `npm create vite@latest my-web-app -- --template react`
2. Install Convex: `cd my-web-app && npm install convex`
3. Replace React Native components with plain HTML:
   - `<View>` becomes `<div>`
   - `<Text>` becomes `<span>` or `<p>`
   - `<TextInput>` becomes `<input>`
   - `<TouchableOpacity onPress={...}>` becomes `<button onClick={...}>`
   - `<FlatList data={items} renderItem={...}>` becomes `{items.map(item => ...)}`
   - `StyleSheet.create()` becomes a regular CSS file or inline styles
4. Copy your `convex/` folder over (the backend code works exactly the same)
5. Change the env variable name from `EXPO_PUBLIC_CONVEX_URL` to `VITE_CONVEX_URL` (Vite uses the `VITE_` prefix instead of `EXPO_PUBLIC_`)
6. Update the client setup in your app:
   ```js
   const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
   ```

> **Bottom line:** If you're just getting started, go with Option A. Run `npx expo start --web` and you have a web app. Done.

[Back to top](#table-of-contents)

---
---

# 4. Deploying Your Web App (Vercel)

**This section shows you how to put your web app on the internet so anyone can visit it.** We'll use Vercel — it's free for personal projects and takes about 5 minutes.

---

### 4.1 The Big Picture

There are two parts to your app, and they deploy separately:

| Part | What It Is | Where It's Hosted | Do You Need to Deploy It? |
|---|---|---|---|
| **Backend** | Your database, functions, real-time sync | Convex Cloud (`your-project.convex.cloud`) | Already hosted for you. Just run `npx convex deploy` for production. |
| **Frontend** | The web app your users see and interact with | You choose (we'll use Vercel) | Yes — this is what we're deploying in this section. |

So when we say "deploy to Vercel", we mean: take the web app that's been running on `localhost:8081` and put it on a public URL like `https://my-app.vercel.app`.

---

### 4.2 Deploy Your Convex Backend for Production

During development you've been using `npx convex dev`, which runs against a **development** deployment. For production, you need a separate **production** deployment so your live users don't share a database with your local testing.

```bash
npx convex deploy
```

This will:
1. Ask you to create a production deployment (first time only)
2. Push your schema and functions to the production deployment
3. Give you a **production deployment URL** — it looks like `https://your-project-123.convex.cloud` (different from your dev one)

**Copy that production URL.** You'll need it in Step 4.5.

---

### 4.3 Install the Vercel CLI and Log In

```bash
npm install -g vercel
vercel login
```

This installs the Vercel command-line tool on your computer and opens your browser to create a free Vercel account (or log in if you have one). You can sign up with GitHub, GitLab, or email.

---

### 4.4 Build and Deploy

First, make sure your `app.json` has the web output setting. Open `app.json` and make sure the `"web"` section looks like this:

```json
{
  "expo": {
    "web": {
      "output": "single",
      "favicon": "./assets/favicon.png"
    }
  }
}
```

Now build the web app into static files:

```bash
npx expo export --platform web
```

**What this does:** Expo takes all your JavaScript, bundles it, and outputs a `dist/` folder containing plain HTML, CSS, and JavaScript files. These are "static files" — they don't need a server to run. Any web host (Vercel, Netlify, GitHub Pages, etc.) can serve them.

Now deploy to Vercel:

```bash
vercel --prod
```

Vercel will ask you a few questions the first time:
- **Set up and deploy?** → `Y`
- **Which scope?** → pick your account
- **Link to existing project?** → `N`
- **Project name?** → hit Enter to accept the default (or type a name you want)
- **Which directory is your code in?** → `./` (hit Enter)
- **Override settings?** → `Y`
  - **Output directory?** → type `dist`

When it finishes, it gives you a URL like `https://my-app.vercel.app` — **that's your live site!**

---

### 4.5 Set the Environment Variable on Vercel

Your app needs to know where your Convex backend is. Locally, it reads from `.env.local`. On Vercel, you set environment variables in their dashboard:

1. Go to [vercel.com](https://vercel.com) and open your project
2. Go to **Settings** > **Environment Variables**
3. Add a new variable:
   - **Name:** `EXPO_PUBLIC_CONVEX_URL`
   - **Value:** your **production** Convex deployment URL (the one from Step 4.2 — NOT the dev one)
4. Click **Save**
5. **Redeploy** so it picks up the new variable:
   ```bash
   npx expo export --platform web && vercel --prod
   ```

---

### 4.6 You're Live!

Here's how the pieces connect:

```
Your users visit:        https://my-app.vercel.app
  |
Vercel serves:           your built web app (HTML/CSS/JS from dist/)
  |
App connects to:         your-project.convex.cloud (production backend)
  |
Convex handles:          database, real-time updates, backend functions
```

---

### 4.7 Redeploying After You Make Changes

Every time you change your code and want to update the live site:

```bash
npx expo export --platform web && vercel --prod
```

If you also changed backend code in the `convex/` folder, deploy that first:

```bash
npx convex deploy && npx expo export --platform web && vercel --prod
```

---

### 4.8 Vercel FAQ

| Question | Answer |
|---|---|
| **Is Vercel free?** | Yes, for personal projects. The free tier is generous — plenty for a side project or portfolio app. |
| **Can I use a custom domain?** | Yes. In the Vercel dashboard, go to your project > Settings > Domains. You can add any domain you own. |
| **What about Netlify instead of Vercel?** | Same idea. Run `npx expo export --platform web`, then point Netlify at the `dist/` folder. The steps are very similar. |
| **Do I need to set up CI/CD?** | Not to start. The manual `vercel --prod` command is fine. Later you can connect your GitHub repo to Vercel and it auto-deploys every time you push. |
| **My site loads but shows a blank screen?** | The environment variable is probably missing. Check Step 4.5 — make sure `EXPO_PUBLIC_CONVEX_URL` is set in Vercel's dashboard and you redeployed after adding it. |

[Back to top](#table-of-contents)

---
---

# 5. Deploying to the App Store (iOS & Android)

**This section covers how to publish your app to the Apple App Store and Google Play Store** so real users can download it from the store like any other app. This is a bigger process than web deployment — there are developer accounts, build steps, and review processes involved.

---

### 5.1 The Big Picture

When you've been testing with **Expo Go**, your app runs inside the Expo Go container. To put it on the App Store, you need to build a **standalone app** — a real `.ipa` file (iOS) or `.aab` file (Android) that installs like any other app, without Expo Go.

Expo provides a cloud build service called **EAS Build** (Expo Application Services) that handles all of this for you. You don't need a Mac to build for iOS, and you don't need to install Android Studio. EAS does it in the cloud.

```
Development:     Your code  →  Expo Go (test on your phone)
Production:      Your code  →  EAS Build (cloud)  →  App Store / Play Store
```

---

### 5.2 Prerequisites

Before you start, you'll need:

| What | Why | Cost |
|---|---|---|
| **Apple Developer Account** | Required to publish to the App Store | $99/year |
| **Google Play Developer Account** | Required to publish to the Google Play Store | $25 one-time |
| **EAS account** | Expo's build service (you already have this if you have an Expo account) | Free tier available (limited builds/month) |

> **You don't need both.** If you only want iOS, just get the Apple account. If you only want Android, just get the Google account.

- Apple Developer Program: [developer.apple.com/programs](https://developer.apple.com/programs/)
- Google Play Console: [play.google.com/console](https://play.google.com/console/)

---

### 5.3 Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

This installs the EAS command-line tool and logs you in with your Expo account (the same one you use for Expo Go).

---

### 5.4 Configure Your Project for EAS

Run the configuration command:

```bash
eas build:configure
```

This creates an `eas.json` file in your project root with build profiles. It will look something like this:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

**What these profiles mean:**
- **`development`** — a debug build for testing on real devices (replaces Expo Go with your own custom dev client)
- **`preview`** — a build you can share with testers before submitting to the store
- **`production`** — the final build you submit to the App Store / Play Store

---

### 5.5 Update `app.json` for Production

Your `app.json` needs a few more fields for a store submission. Make sure these are filled in:

```json
{
  "expo": {
    "name": "My App",
    "slug": "my-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourname.myapp"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/android-icon-foreground.png"
      },
      "package": "com.yourname.myapp"
    }
  }
}
```

**Important fields:**
- **`ios.bundleIdentifier`** — a unique ID for your iOS app (format: `com.yourname.appname`). Pick something unique, you can't change it later.
- **`android.package`** — same thing for Android. Usually matches the iOS bundle identifier.
- **`icon`** — your app icon. Must be a 1024x1024 PNG with no transparency for iOS.
- **`splash`** — the loading screen users see when the app opens.

---

### 5.6 Deploy Convex for Production

Same as the web deployment — make sure your production backend is deployed:

```bash
npx convex deploy
```

Then set the production Convex URL as a secret for your EAS builds:

```bash
eas secret:create --name EXPO_PUBLIC_CONVEX_URL --value "https://your-production-project.convex.cloud"
```

This stores the environment variable securely in EAS so your production builds connect to the right backend.

---

### 5.7 Build for iOS

```bash
eas build --platform ios --profile production
```

**What happens:**
1. EAS uploads your code to Expo's cloud build servers
2. It compiles a native iOS app (you don't need a Mac for this!)
3. It asks you to log in to your Apple Developer account
4. It handles code signing certificates automatically
5. When done, it gives you a download link for the `.ipa` file

The build usually takes 10-20 minutes. You'll get a URL where you can download the build or track its progress.

---

### 5.8 Build for Android

```bash
eas build --platform android --profile production
```

**What happens:**
1. EAS uploads your code to Expo's cloud build servers
2. It compiles a native Android app
3. When done, it gives you a download link for the `.aab` file (Android App Bundle)

---

### 5.9 Submit to the App Store (iOS)

Once your build is done:

```bash
eas submit --platform ios
```

This uploads your `.ipa` to App Store Connect (Apple's portal for managing App Store submissions). From there:

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Fill in your app listing (description, screenshots, category, etc.)
3. Select the build you just uploaded
4. Submit for review

**Apple reviews typically take 1-2 days.** They may reject your app if it doesn't meet their guidelines — they'll tell you why and you can fix and resubmit.

---

### 5.10 Submit to the Google Play Store (Android)

Once your build is done:

```bash
eas submit --platform android
```

This uploads your `.aab` to the Google Play Console. From there:

1. Go to [Google Play Console](https://play.google.com/console/)
2. Create a new app listing (or select existing)
3. Fill in the store listing (description, screenshots, category, content rating, etc.)
4. Upload the `.aab` or let EAS submit it directly
5. Submit for review

**Google reviews typically take a few hours to a few days.**

---

### 5.11 Updating Your App After It's Live

When you want to push an update to the App Store:

**For code-only changes (no new native dependencies):**
```bash
eas update --branch production
```
This uses **EAS Update** (over-the-air updates) — your users get the new code without downloading a new version from the store. It's instant, no review process.

**For changes that add new native packages or change `app.json`:**
```bash
eas build --platform ios --profile production
eas submit --platform ios
```
You need a new build and a new store review.

---

### 5.12 App Store Quick Reference

| Task | Command |
|---|---|
| Configure EAS | `eas build:configure` |
| Build for iOS | `eas build --platform ios --profile production` |
| Build for Android | `eas build --platform android --profile production` |
| Build for both at once | `eas build --platform all --profile production` |
| Submit to App Store | `eas submit --platform ios` |
| Submit to Play Store | `eas submit --platform android` |
| Push an OTA update | `eas update --branch production` |
| Check build status | `eas build:list` |
| Set env variables for builds | `eas secret:create --name KEY --value "value"` |

---

### 5.13 App Store FAQ

| Question | Answer |
|---|---|
| **Do I need a Mac to build for iOS?** | No! EAS Build runs in the cloud. You can build iOS apps from Windows or Linux. |
| **How much does EAS cost?** | The free tier gives you 30 builds/month on a slower queue. Paid plans get faster builds and more per month. |
| **Can I test before submitting?** | Yes. Use `eas build --profile preview` to create a test build. On iOS you can distribute via TestFlight, on Android you can sideload the APK. |
| **How long does App Store review take?** | Usually 1-2 days for Apple, a few hours to a few days for Google. First submissions sometimes take longer. |
| **Do I need new builds for every update?** | Not always. Code-only changes can use `eas update` for instant over-the-air updates. You only need new builds when you add native dependencies. |
| **What about app icons and screenshots?** | You need a 1024x1024 icon and screenshots for each device size. Apple requires specific sizes. Google is more flexible. |

[Back to top](#table-of-contents)

---
---

# 6. Convex Backend (Detailed)

**This section is a deep dive into the Convex backend setup.** If `npx convex dev` worked for you in the Quick Start, this is optional — come back here if you want to understand what's happening or need to set things up manually.

---

### 6.1 Create a Convex Account

1. Go to [dashboard.convex.dev](https://dashboard.convex.dev)
2. Click **Sign up** (you can sign up with GitHub or Google)
3. Once signed in, you'll land on the Convex Dashboard

---

### 6.2 Create a Convex Project

You don't need to create a project manually in the dashboard. Running `npx convex dev` will prompt you to create one. But if you want to do it from the dashboard first:

1. In the dashboard, click **Create a project**
2. Give it a name (e.g. `my-app`)
3. You'll see your **Deployment URL** on the project settings page — it looks like:
   ```
   https://your-project-name-123.convex.cloud
   ```
   Copy this URL. You'll need it in the next step.

---

### 6.3 Create the `.env.local` File (Manual Method)

> **Note:** If you ran `npx convex dev` and it created `.env.local` for you automatically, skip this step.

In the root of this project, create a file called `.env.local`:

```bash
touch .env.local
```

Open it and add this single line:

```
EXPO_PUBLIC_CONVEX_URL=https://your-project-name-123.convex.cloud
```

Replace `https://your-project-name-123.convex.cloud` with **your actual Deployment URL** from the Convex dashboard.

> **Why `EXPO_PUBLIC_`?** Expo only exposes environment variables to your app if they start with `EXPO_PUBLIC_`. The app reads this in `App.js` on this line:
> ```js
> const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL);
> ```

> **Important:** Never commit `.env.local` to git. It should already be in `.gitignore`, but double-check.

---

### 6.4 Deploy Your Convex Backend

Open a terminal in the project folder and run:

```bash
npx convex dev
```

The first time you run this:

1. It will open your browser and ask you to **log in** to Convex (if you aren't already)
2. It will ask you to **select or create a project** — pick the one you created, or create a new one here
3. It will **push your schema and functions** (`convex/schema.js` and `convex/messages.js`) to your Convex deployment
4. It will print your deployment URL — if you haven't created `.env.local` yet, copy this URL and create the file now (see Step 6.3)

**Keep this terminal running.** `npx convex dev` watches for changes to your `convex/` folder and automatically re-deploys when you edit your backend code.

---

### 6.5 Verify in the Dashboard

1. Go back to [dashboard.convex.dev](https://dashboard.convex.dev)
2. Open your project
3. Click on **Data** in the left sidebar — you should see a `messages` table (it will be empty at first)
4. Click on **Functions** — you should see `messages:list` and `messages:send`

[Back to top](#table-of-contents)

---
---

# 7. Project Structure & Reference

**This section explains where everything lives and how the pieces connect.**

---

### 7.1 File Map

| File / Folder | What It Does |
|---|---|
| `App.js` | The main app — all the UI lives here |
| `convex/schema.js` | Defines your database tables and their fields |
| `convex/messages.js` | Backend functions (queries and mutations) that read/write data |
| `convex/_generated/` | Auto-generated files — don't edit these, Convex manages them |
| `app.json` | Expo configuration (app name, icons, splash screen, etc.) |
| `package.json` | Lists your dependencies and npm scripts |
| `.env.local` | Your Convex deployment URL (not committed to git) |
| `assets/` | Icons, splash screen images, and other static assets |

---

### 7.2 Command Reference

| What | Command |
|---|---|
| Install dependencies | `npm install` |
| Start Convex dev server | `npx convex dev` |
| Start Expo (mobile) | `npx expo start` |
| Start Expo (web) | `npx expo start --web` |
| Deploy backend to production | `npx convex deploy` |
| Build web for deployment | `npx expo export --platform web` |
| Deploy web to Vercel | `vercel --prod` |
| Build iOS for App Store | `eas build --platform ios --profile production` |
| Build Android for Play Store | `eas build --platform android --profile production` |

---

### 7.3 How It All Fits Together

```
Your Phone (Expo Go) or Browser
    |
    |  loads App.js via Expo dev server
    v
App.js
    |
    |  connects to Convex using EXPO_PUBLIC_CONVEX_URL
    v
Convex Cloud (your-project.convex.cloud)
    |
    |  runs functions defined in convex/messages.js
    |  stores data using schema from convex/schema.js
    v
messages table
    - text (string)
    - createdAt (number)
```

When you type a message and hit Send, it calls `messages:send` which inserts a row. The `messages:list` query automatically updates in real-time on all connected clients — whether they're on a phone or in a browser.

[Back to top](#table-of-contents)
