# Mobile App Publishing Guide for VoltInbox

To publish **VoltInbox** (your temporary email generator) to the **Google Play Store**, **Apple App Store**, and other app marketplaces, you need to turn this React/Vite web application into a mobile-friendly hybrid application.

The absolute best, modern, and official way to do this with a React + Vite app is using **Capacitor** (by Ionic). Capacitor allows you to wrap your web app into a high-performance native container for Android and iOS without rewriting any code.

This guide outlines exactly how to set up, build, and submit VoltInbox to all major app stores.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step-by-Step wrapping with Capacitor](#2-step-by-step-wrapping-with-capacitor)
3. [Publishing to Google Play Store (Android)](#3-publishing-to-google-play-store-android)
4. [Publishing to Apple App Store (iOS)](#4-publishing-to-apple-app-store-ios)
5. [Publishing to Alternative App Stores](#5-publishing-to-alternative-app-stores)
6. [Best Practices for Mobile Store Acceptance](#6-best-practices-for-mobile-store-acceptance)

---

## 1. Prerequisites

Before starting, ensure you have the following installed on your local computer where you will build the mobile packages:
- **Node.js** (v18+) & **npm**
- **Android Studio** (for Android builds - works on Windows, macOS, and Linux)
- **Xcode** (for iOS builds - **requires a macOS computer**)

---

## 2. Step-by-Step wrapping with Capacitor

Follow these commands in your project's root folder on your local development machine:

### Step 2.1: Install Capacitor CLI and Core
```bash
npm install @capacitor/core @capacitor/cli
```

### Step 2.2: Initialize Capacitor
Initialize Capacitor with your App Name and unique Package ID (typically reverse domain notation, e.g., `site.tempmailgenerator.app`):
```bash
npx cap init VoltInbox site.tempmailgenerator.app --web-dir=dist
```

### Step 2.3: Install Android and iOS Platforms
```bash
npm install @capacitor/android @capacitor/ios
```

### Step 2.4: Build the Web App
Compile your optimized React/Vite assets to the `dist/` directory:
```bash
npm run build
```

### Step 2.5: Add Mobile Platforms
Create the native Android and iOS projects containing your wrapped web files:
```bash
npx cap add android
npx cap add ios
```

### Step 2.6: Sync Web Assets to Mobile
Every time you make a change to your React frontend, run `npm run build` and sync the changes to your mobile projects:
```bash
npm run build
npx cap sync
```

---

## 3. Publishing to Google Play Store (Android)

### Step 3.1: Open the Project in Android Studio
Run the following command to open the native Android project:
```bash
npx cap open android
```

### Step 3.2: Set Up Your Developer Account
1. Go to the [Google Play Console](https://play.google.com/console/signup).
2. Sign up using a Google Account.
3. Pay the **$25 one-time developer registration fee**.
4. Verify your identity (government-issued ID and phone number).

### Step 3.3: Configure App Icons and Splash Screens
Use `@capacitor/assets` to automatically generate all required icon and splash screen sizes from a single source image:
1. Install the tool: `npm install @capacitor/assets -D`
2. Create an `assets/` folder in your project root containing:
   - `icon-only.png` (at least 1024x1024 px)
   - `icon-foreground.png` and `icon-background.png` (for adaptive Android icons)
   - `splash.png` (at least 2732x2732 px)
3. Run the generator:
   ```bash
   npx capacitor-assets generate --android
   ```

### Step 3.4: Build and Sign your Production App Bundle (AAB)
1. Inside Android Studio, go to **Build > Generate Signed Bundle / APK...**
2. Choose **Android App Bundle** and click **Next**.
3. Create a new **Keystore file** (store this in a safe place! If you lose this key, you can never update your app).
4. Fill in the key details, select release build type, and click **Finish**.
5. Your `.aab` file will be generated in `android/app/release/app-release.aab`.

### Step 3.5: Submit to Google Play Console
1. Create a new App in your Google Play Console dashboard.
2. Complete the **Set up your app** tasks (content rating, privacy policy, target audience, dashboard questions).
3. Under **Production**, create a new release and upload your `.aab` file.
4. Upload required store listing details:
   - High-res icon (512x512 PNG, max 1MB)
   - Feature graphic (1024x500 PNG/JPG)
   - At least 2 phone screenshots (up to 8, 16:9 or 9:16 aspect ratio)
5. Submit the release for review. (Reviews typically take between 1 to 7 business days for new developer accounts).

---

## 4. Publishing to Apple App Store (iOS)

*Note: You must use a macOS computer to complete iOS builds.*

### Step 4.1: Join the Apple Developer Program
1. Go to the [Apple Developer Portal](https://developer.apple.com/programs/).
2. Sign up using an Apple ID.
3. Join the Apple Developer Program which costs **$99 per year**.

### Step 4.2: Open the Project in Xcode
Run the following command to launch Xcode:
```bash
npx cap open ios
```

### Step 4.3: Generate Icons
Using the assets generated earlier, run:
```bash
npx capacitor-assets generate --ios
```

### Step 4.4: Configure Signing and Capabilities
1. In Xcode, select your project in the left sidebar.
2. Go to the **Signing & Capabilities** tab.
3. Check **Automatically manage signing**.
4. Select your Developer Team from the dropdown.

### Step 4.5: Archive and Upload
1. Select **Any iOS Device (arm64)** as the build target in Xcode's top bar.
2. Go to **Product > Archive**.
3. Once archiving completes, the Organizer window will open. Click **Distribute App**.
4. Select **App Store Connect** and follow the prompts to sign and upload your app.

### Step 4.6: Complete Store Submission
1. Go to [App Store Connect](https://appstoreconnect.apple.com/).
2. Create a new App entry.
3. Select your uploaded build.
4. Enter app details, description, age rating, and upload required screenshots (Specifically for 6.5-inch and 5.5-inch displays).
5. Submit for App Review. (Review usually takes 24 to 48 hours).

---

## 5. Publishing to Alternative App Stores

By packaging your app as an Android App Bundle (`.aab`) or APK, you can easily list it on other massive developer portals for free!

### A. Amazon Appstore
- **Audience**: Reaches millions of Fire OS devices (Fire tablets, Fire TV) and standard Android devices.
- **Cost**: Free to sign up.
- **How**: Sign up at the [Amazon Developer Portal](https://developer.amazon.com/), upload your compiled `.apk` or `.aab`, fill in descriptions and screenshots, and submit.

### B. Samsung Galaxy Store
- **Audience**: Pre-installed on all Samsung Galaxy smartphones.
- **Cost**: Free.
- **How**: Register on the [Samsung Sellers Portal](https://seller.samsungapps.com/), register your Android app, and upload your signed release APK.

### C. Xiaomi GetApps & Huawei AppGallery
- **Audience**: Massive global market share, particularly in Asia and Europe.
- **Cost**: Free.
- **How**: Create developer accounts on Huawei Developer Console and Xiaomi Developer Console respectively to upload your Android build package.

---

## 6. Best Practices for Mobile Store Acceptance

Because VoltInbox is a **temporary email generator**, follow these rules to guarantee smooth approval during review:

1. **Provide a Privacy Policy**: Both Google and Apple require a hosted Privacy Policy URL. Make sure you list one on your website (`temp-mail-generator.site/privacy`).
2. **Account Deletion Link**: If users can register accounts inside your app, Apple strictly requires a built-in option for users to delete their account directly within the app settings.
3. **Optimized for Mobile Screens**: Ensure all UI elements are touch-friendly (buttons at least 44px wide/high) and fit perfectly within notch/safe area limits on iOS devices. Capacitor handles safe areas automatically, but verify layouts on simulators.
