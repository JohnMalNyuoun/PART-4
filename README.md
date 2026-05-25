# PART-4 Blog Backend Progress

This repository contains multiple learning steps for a Node.js + Express + MongoDB blog backend.

## Structure

- `Bloglist/` - baseline exercises
- `Bloglistexpansion/` - expanded features through later steps
- `Bloglisttest/` - test-focused iterations
- `Helperfuction/` - helper-function focused steps

Most complete implementation is in:

- `Bloglistexpansion/STEP11/Backend`

## STEP11 Backend

### Features

- User creation and login with JWT
- Blog CRUD endpoints
- Ownership check on blog deletion
- Request/error middleware
- Unit and API tests

### Run

```bash
cd Bloglistexpansion/STEP11/Backend
npm install
npm run dev
```

### Test

```bash
cd Bloglistexpansion/STEP11/Backend
npm test
```

If tests rely on external MongoDB, set values in `.env` locally.

## Security and Repo Hygiene

- Sensitive `.env` files are now ignored by git
- `node_modules` folders are ignored by git
- Root `.gitignore` is configured for Node projects

## Notes

This repo intentionally keeps multiple step folders to show progression, not just one final snapshot.
