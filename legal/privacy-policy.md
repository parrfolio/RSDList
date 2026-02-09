# Privacy Policy

**RSD List** — [https://rsdlist.com](https://rsdlist.com)

**Effective Date:** February 9, 2026

> **Disclaimer:** This Privacy Policy has not been reviewed by legal counsel. It is written in good faith by an individual developer to be transparent about how your data is handled when using RSD List.

---

## 1. Who We Are

RSD List is a free web app for Record Store Day collectors, built and operated by Ryan Parr (an individual developer, not a company).

**Contact:** [parrfolio@gmail.com](mailto:parrfolio@gmail.com)

## 2. What Data We Collect

### 2.1 Account Information

When you sign in, we receive and store:

| Data Field        | Source                                 | Purpose                               |
| ----------------- | -------------------------------------- | ------------------------------------- |
| User ID (uid)     | Firebase Auth                          | Unique account identifier             |
| Display name      | Auth provider (Google/Facebook) or you | Shown on your profile and shared list |
| Email address     | Auth provider or you                   | Account identification                |
| Profile photo URL | Auth provider                          | Default avatar display                |
| Auth providers    | Firebase Auth                          | Tracks which sign-in methods you use  |
| Avatar ID         | Your selection                         | Your chosen preset avatar             |

### 2.2 User Content

- **Wants list:** Which Record Store Day releases you've saved, and their status (wanted or acquired). Each entry references a release and stores your status.
- **Avatar uploads:** If you upload a custom profile photo, it is stored in Firebase Storage. Uploads are limited to image files, maximum 2MB.

### 2.3 Sharing Data

- **Share ID:** A unique identifier generated if you enable list sharing.
- **Sharing enabled flag:** Whether your list is publicly accessible via a link.

When sharing is enabled, your display name and wants list are visible to anyone with your share URL.

### 2.4 What We Do NOT Collect

- **No analytics or tracking:** We do not use Google Analytics or any third-party analytics service.
- **No advertising data:** There are no ads and no ad-related tracking.
- **No payment information:** The app is free. We don't process payments.
- **No location data:** We don't track your location.
- **No usage telemetry:** We don't log page views, clicks, or behavioral data.

## 3. How We Use Your Data

Your data is used solely to provide the app's functionality:

- **Authentication:** To sign you in and maintain your session.
- **Wants list:** To save and display your personal list of releases.
- **Sharing:** To generate a public URL for your list, if you choose to enable it.
- **Profile display:** To show your name and avatar within the app.

We do not sell, rent, or share your personal data with third parties for marketing or advertising purposes. Ever.

## 4. Third-Party Services

RSD List relies on the following third-party services to function:

### 4.1 Firebase / Google Cloud Platform

- **Services used:** Authentication, Firestore (database), Cloud Storage, Cloud Functions, Hosting
- **Data processed:** All user data described above is stored and processed by Firebase/Google Cloud.
- **Privacy:** [Google Cloud Privacy Policy](https://cloud.google.com/terms/cloud-privacy-notice)

### 4.2 Google reCAPTCHA v3

- **Purpose:** Bot and abuse protection via Firebase App Check.
- **Data processed:** reCAPTCHA may collect hardware and software information (browser type, plugins, screen resolution) and interaction data to assess whether a user is human.
- **Privacy:** [Google Privacy Policy](https://policies.google.com/privacy)
- **Terms:** [reCAPTCHA Terms](https://policies.google.com/terms)

### 4.3 Facebook (Meta)

- **Purpose:** Optional OAuth login provider (only if you choose to sign in with Facebook).
- **Data received:** Basic profile information (name, email, profile photo) that you authorize.
- **Privacy:** [Meta Privacy Policy](https://www.facebook.com/privacy/policy/)

> **Assumption:** We assume these third-party services process data as described in their respective privacy policies. We have no control over their data practices beyond what their services provide.

## 5. Data Storage & Security

Your data is stored in Firebase/Google Cloud infrastructure. We implement the following security measures:

- **Firebase App Check** with reCAPTCHA v3 to prevent abuse
- **Firestore security rules** enforcing owner-only access to personal data, with field validation
- **Storage security rules** restricting file types and sizes for avatar uploads
- **HTTPS enforced** with HSTS preload on all connections
- **Security headers:** Content Security Policy (CSP), X-Frame-Options, X-Content-Type-Options
- **SSRF protection** on Cloud Functions
- **Admin-only write access** to release data (users cannot modify the release catalog)

While we take reasonable steps to protect your data, no system is 100% secure. We cannot guarantee absolute security.

## 6. Data Retention

- Your data is retained as long as you have an active account.
- If you delete your account, your user profile and wants list data will be deleted.
- Avatar uploads will be removed when your account is deleted.
- We do not retain backups of deleted user data indefinitely.

> **Assumption:** Firebase may retain some data in system logs or backups for a limited period as part of their standard infrastructure operations, which is outside our direct control.

## 7. Your Rights

Regardless of where you're located, we believe you should have control over your data:

- **Access:** You can view all your data within the app (your profile, your wants list).
- **Correction:** You can update your display name and avatar at any time.
- **Deletion:** You can request deletion of your account and all associated data by contacting us.
- **Portability:** You can view your wants list data directly in the app. Contact us if you need an export.
- **Sharing control:** You can enable or disable list sharing at any time.

### For EU/EEA Residents (GDPR)

While RSD List is primarily aimed at US users and is operated by a US-based individual, it is accessible globally. If you are in the EU/EEA:

- **Legal basis for processing:** Consent (by creating an account) and legitimate interest (providing the service you signed up for).
- **Data transfers:** Your data is processed by Firebase/Google Cloud, which may transfer data internationally. Google provides appropriate safeguards for such transfers.
- **Rights:** You have the right to access, rectify, erase, restrict processing, data portability, and object to processing. Contact us to exercise these rights.
- **Complaints:** You have the right to lodge a complaint with your local data protection authority.

### For California Residents (CCPA)

- We do not sell your personal information.
- We do not share your personal information for cross-context behavioral advertising.
- You have the right to know what data we collect, request deletion, and opt out of any sale (though we don't sell data).

## 8. Children's Privacy

RSD List is not directed at children under 13. We do not knowingly collect data from children under 13. If you believe a child under 13 has created an account, please contact us and we will delete it.

## 9. Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be reflected by updating the effective date at the top. Continued use of the app after changes constitutes acceptance.

For significant changes, we will make reasonable efforts to notify users (such as a notice in the app).

## 10. Contact

If you have questions about this Privacy Policy or want to exercise your data rights, contact:

Email: [parrfolio@gmail.com](mailto:parrfolio@gmail.com)

---

_Last updated: February 9, 2026_
