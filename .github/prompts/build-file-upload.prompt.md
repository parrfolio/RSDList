---
description: "Implement file upload with storage rules, progress tracking, and image processing"
agent: "conductor.powder"
---

# Build File Upload

You are implementing file upload functionality with Firebase Storage.

## Context

Use @conductor.powder to orchestrate:

1. **@engineering.implementation** — Backend (Storage rules, Cloud Functions for processing)
2. **@frontend.implementation** — Frontend (upload UI, progress, preview)
3. **@security.application** — Security audit (storage rules, file validation)

## File Upload Standards

### Security (Non-negotiable)

- Validate file type on BOTH client and server (Cloud Functions)
- Validate file size limits on BOTH client and server
- Storage rules enforce tenant isolation: `tenants/{tenantId}/uploads/**`
- Authenticated uploads only (no public write access)
- Scan for malicious content if handling user uploads
- Generate unique filenames (prevent overwrite attacks)

### Frontend UI

- Drag-and-drop zone + click-to-browse
- File type validation with user-friendly error
- File size validation with limit display
- Upload progress bar (per file)
- Cancel upload functionality
- Preview for images
- Multiple file upload support
- Accessible: keyboard operable, status announced via `aria-live`

### Backend Processing

- Cloud Functions triggered on upload completion
- Image processing: resize, thumbnail generation, format conversion
- Metadata extraction and storage in Firestore
- Virus scanning (for user-generated content)

### Storage Structure

```
tenants/{tenantId}/
  uploads/{userId}/{timestamp}_{filename}
  thumbnails/{userId}/{timestamp}_{filename}
```

## Instructions

1. Design storage structure and security rules
2. Implement storage security rules with tenant isolation
3. Implement Cloud Functions for file processing
4. Build upload UI with drag-and-drop and progress
5. Implement file preview and management
6. Write tests for upload flow
7. Security audit (security.application — storage rules, validation)

## User Input

{{input}}
