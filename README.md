# Full Stack Open Part 4 — Bloglist Backend

This repository contains backend exercises for **Full Stack Open Part 4** using **Node.js**, **Express**, and **MongoDB**.

## Project structure

The work is organized into four main sections:

- `Bloglist/` — initial blog API steps
- `Helperfuction/` — helper-function focused refactor steps
- `Bloglisttest/` — testing-focused steps
- `Bloglistexpansion/` — expanded backend with users/auth and additional features

Each section contains multiple `STEP` folders with its own backend implementation in `Backend/`.

## Install and run

From a specific step backend folder (for example `Helperfuction/STEP5/Backend`):

```bash
npm install
npm run dev
```

## Run tests

From the same step backend folder:

```bash
npm test
```

## Environment variables

Create a `.env` file in the backend folder you are running. Typical values include:

- `MONGODB_URI`
- `TEST_MONGODB_URI`
- `PORT`
- `SECRET`

Use values appropriate for your own MongoDB/database and environment.

## Security notes

- Do **not** commit `.env` files.
- Do **not** commit `node_modules/` directories.
- If these were already committed earlier, they must be removed by repository history cleanup by the owner.
