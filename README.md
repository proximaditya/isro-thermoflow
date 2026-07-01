# Interpolator

Interpolator is a cinematic Next.js frontend for generating and previewing in-between states from two source frames. It presents the workflow as a polished mission-control style experience, while keeping the original evaluation flow for uploading two `.h5` inputs and calling the backend synthesis endpoint.

Live demo: [https://interpolator.pages.dev/](https://interpolator.pages.dev/)

## What it does

- Upload two source files for `T=00:00` and `T=00:30`
- Send them to the local evaluation endpoint at `http://127.0.0.1:8000/evaluate`
- Display the returned metrics: `PSNR`, `SSIM`, `FSIM`, and `MSE`
- Preview the interpolated output in the UI with a looping animation
- Present the app as a modern landing page with workflow, studio, and FAQ sections

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- CSS Modules

## Local Setup

```bash
npm install
npm run dev
```

Open the app at [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

## Notes

- The frontend expects a backend listening at `http://127.0.0.1:8000/evaluate`.
- The project was originally hosted on Vercel, but it has been moved to Cloudflare for deployment reasons. The public link is now [https://interpolator.pages.dev/](https://interpolator.pages.dev/).
- If you change the backend URL, update the fetch call in [`src/app/page.tsx`](./src/app/page.tsx).

## Project Structure

```text
src/app/page.tsx          Main page and upload flow
src/app/page.module.css   Page styling
src/app/globals.css       Global styles
public/                   Static assets and preview media
```

## Contributing

Feel free to open issues or PRs with improvements to the UI, deployment flow, or backend integration.
