# TEJ Tool

A Next.js application for querying and downloading Tunisian tax information files.

## Description

TEJ Tool is a web interface that allows users to:

- Look up company information using tax identification numbers
- View tax details including VAT codes, categories, and office locations
- Download official tax documentation in PDF format

## Features

- Real-time tax ID validation and formatting
- Company information display including:
  - Company name and activity
  - Tax office details
  - VAT information
  - Business category
- Secure PDF document downloads
- CORS-protected API endpoints
- Responsive design with Tailwind CSS
- Dark/Light mode support

## Tech Stack

- Next.js 15.1.6
- React 19.0.0
- TypeScript
- Tailwind CSS
- Lucide React for icons
- Custom fonts including Geist and LucaFont

## Getting Started

### Prerequisites

- Node.js (version 14.x or later)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/tej-tool.git
   cd tej-tool
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## API Routes

The application provides two main API endpoints:

- `/api/tej/info` - Retrieves company information by tax ID
- `/api/tej/download` - Generates and downloads tax documentation

## Development

### Security

- CORS protection for API routes
- Allowed origins configured in middleware
- No data persistence - all queries are handled transiently

## Credits

Powered by:

- SILKNEXUS
- LUCAPACIOLI

## Official Reference

For official tax information, visit [tej.finances.gov.tn/tax-file](http://tej.finances.gov.tn/tax-file)

## License

Private - © 2024