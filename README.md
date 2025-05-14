# Frontend App

Design: https://www.figma.com/design/XTcZsQREdo9574lTzqkMDL/Chaotic

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

### Generate Polkadot API Descriptors

This project uses local `@polkadot-api/descriptors` which require generation before the app will work properly. If you encounter an error like `Failed to resolve entry for package "@polkadot-api/descriptors"`, run:

```bash
pnpm dlx polkadot-api
```

This command will:
1. Read the metadata from `.papi/polkadot-api.json`
2. Generate the necessary descriptor files in `.papi/descriptors/dist/`
3. Make the local package ready for import

## Development Server

Start the development server on `http://localhost:9090`:

```bash
pnpm run dev
```

## Production

Build the application for production:

```bash
pnpm run build
```

Locally preview production build:

```bash
pnpm run preview
```
