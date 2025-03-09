# CompressSync

CompressSync is an asynchronous image processing system that extracts image data from CSV files, compresses images by 50%, and stores the processed results. It supports API-based status tracking and webhook integration for seamless automation.

## 📌 Features

- Upload CSV files containing product data and image URLs.
- Process and store product details in MongoDB.
- Compress images asynchronously and store them in Cloudflare R2.
- Track processing status via API.
- Webhook integration for event-based notifications.

## 🚀 Hosted Version

The project is deployed on Render: [CompressSync](https://compress-sync.onrender.com/)

## 📂 Repository

GitHub Repository: [CompressSync](https://github.com/rohitvpatil0810/compress-sync)

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **ORM**: Prisma
- **Queue Processing**: BullMQ (Redis - Render Key-Value)
- **Storage**: Cloudflare R2
- **CI/CD**: GitHub Actions, Docker
- **Hosting**: Render
- **Validation**: Zod
- **Logging**: Winston
- **CSV Parsing**: csv-parser

## ⚙️ Prerequisites

Make sure you have the following installed:

- **Node.js** (>= 18)
- **Docker** (for Redis)
- **MongoDB** (or use MongoDB Atlas)

## 🔧 Setup & Installation

Clone the repository:

```sh
git clone https://github.com/rohitvpatil0810/compress-sync.git
cd compress-sync
```

Install dependencies:

```sh
npm install
```

### 🏗️ Running Locally

Start Redis (using Docker):

```sh
docker run -d --name redis -p 6379:6379 redis
```

Set up the environment variables:

1. Create a `.env` file in the root directory.
2. Copy and configure the values from `.env.example`.

Run database migrations:

```sh
npm run migrate-db
```

Start the development server:

```sh
npm run dev
```

The server will start at `http://localhost:8080`.

## 🛠️ API Documentation

Use the [Postman Collection](https://www.postman.com/red-space-801814/compress-sync/collection/f57kcol/compress-sync?action=share&creator=19695382&active-environment=19695382-391d65e1-6599-4359-801a-9d10ba21552a) for testing the API endpoints.

## 📦 Docker Support

A prebuilt Docker image is available:

```sh
docker pull ghcr.io/rohitvpatil0810/compress-sync/compress-sync:latest
```

## 📝 Environment Variables

Copy `.env.example` to `.env` and configure:

```sh
cp .env.example .env
```

Key variables:

- `DATABASE_URL` - MongoDB connection string
- `REDIS_URL` - Redis connection URL
- `CLOUDFLARE_S3_ACCESS_KEY_ID` - Cloudflare R2 Access Key
- `CLOUDFLARE_S3_SECRET_ACCESS_KEY` - Cloudflare R2 Secret Key
- `CLOUDFLARE_S3_BUCKET` - Cloudflare R2 Bucket Name

## 🌟 Contributions

Feel free to fork the repo, create a branch, and open a pull request! 🚀
