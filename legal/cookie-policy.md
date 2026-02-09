# Cookie Policy

**RSD List** — [https://rsdlist.com](https://rsdlist.com)

**Effective Date:** February 9, 2026

> **Disclaimer:** This Cookie Policy has not been reviewed by legal counsel. It is written in good faith by an individual developer to be transparent about what cookies and local storage RSD List uses.

---

## 1. Overview

RSD List uses a minimal set of cookies and browser storage technologies — only what is necessary to make the app work. We do not use any cookies for advertising, marketing, or third-party analytics.

## 2. What Are Cookies?

Cookies are small text files stored on your device by your web browser. Similar technologies include Local Storage and IndexedDB, which allow websites to store data in your browser. We use these terms broadly to cover all of these technologies.

## 3. Cookies & Storage We Use

### 3.1 Essential — Firebase Authentication

| Technology                                          | Purpose                                           | Duration                                 | Type                   |
| --------------------------------------------------- | ------------------------------------------------- | ---------------------------------------- | ---------------------- |
| Firebase Auth session tokens                        | Keep you signed in and authenticate your requests | Session / up to 1 hour (auto-refreshed)  | First-party, essential |
| Firebase Auth persistence (IndexedDB/Local Storage) | Remember your sign-in across browser sessions     | Until you sign out or clear browser data | First-party, essential |

These are **required** for the app to function. Without them, you cannot sign in or access your personal wants list.

### 3.2 Essential — Firestore Offline Cache

| Technology                  | Purpose                                                                    | Duration                                      | Type                   |
| --------------------------- | -------------------------------------------------------------------------- | --------------------------------------------- | ---------------------- |
| IndexedDB (Firestore cache) | Cache release and wants data locally for offline access and faster loading | Until you clear browser data or cache expires | First-party, essential |

This enables the app to work in areas with poor connectivity (like a busy record store on RSD morning). It only caches data you've already accessed.

### 3.3 Essential — Google reCAPTCHA v3

| Technology                | Purpose                                    | Duration               | Type                 |
| ------------------------- | ------------------------------------------ | ---------------------- | -------------------- |
| `_GRECAPTCHA` cookie      | Bot/abuse detection via Firebase App Check | Session                | Third-party (Google) |
| reCAPTCHA-related cookies | Risk analysis and abuse prevention         | Varies (set by Google) | Third-party (Google) |

reCAPTCHA v3 runs in the background to protect the app from bots and abuse. Google may set cookies and collect certain device information as part of this process. See [Google's Privacy Policy](https://policies.google.com/privacy) for details on how reCAPTCHA processes data.

### 3.4 OAuth Provider Cookies (If Applicable)

If you sign in with Google or Facebook, those providers may set their own cookies during the authentication flow:

| Provider        | Purpose            | Set When                       | Type        |
| --------------- | ------------------ | ------------------------------ | ----------- |
| Google          | OAuth sign-in flow | When you sign in with Google   | Third-party |
| Facebook (Meta) | OAuth sign-in flow | When you sign in with Facebook | Third-party |

These cookies are set by the respective providers during sign-in and are governed by their own cookie and privacy policies:

- [Google Privacy Policy](https://policies.google.com/privacy)
- [Meta/Facebook Cookie Policy](https://www.facebook.com/policies/cookies/)

## 4. What We Don't Use

To be clear, RSD List does **not** use:

- ❌ Analytics cookies (no Google Analytics, no Mixpanel, etc.)
- ❌ Advertising or marketing cookies
- ❌ Third-party tracking pixels
- ❌ Social media tracking widgets
- ❌ Fingerprinting or cross-site tracking
- ❌ Any non-essential cookies

## 5. Cookie Consent

Because RSD List only uses **strictly essential** cookies and storage required for the app to function, a cookie consent banner is generally not required under most privacy regulations (including GDPR). Essential cookies are exempt from consent requirements because the app cannot function without them.

However, please be aware that Google reCAPTCHA (used for security) is operated by Google and may process data as described in their privacy policy.

> **Assumption:** We classify all cookies used by RSD List as essential/strictly necessary. If regulatory guidance changes or our cookie usage changes, we will update this policy and add consent mechanisms if required.

## 6. Managing Cookies

You can control cookies through your browser settings:

- **Clear cookies:** Most browsers let you clear all cookies and site data in Settings → Privacy.
- **Block cookies:** You can block third-party cookies, but this may prevent sign-in from working.
- **Browser-specific instructions:**
  - [Chrome](https://support.google.com/chrome/answer/95647)
  - [Firefox](https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox)
  - [Safari](https://support.apple.com/en-us/105082)
  - [Edge](https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09)

**Note:** Clearing cookies or site data will sign you out of RSD List and may clear your offline cache.

## 7. Changes to This Policy

We may update this Cookie Policy if our use of cookies changes. Updates will be reflected by changing the effective date at the top.

## 8. Contact

If you have questions about this Cookie Policy, contact:

Email: [parrfolio@gmail.com](mailto:parrfolio@gmail.com)

---

_Last updated: February 9, 2026_
