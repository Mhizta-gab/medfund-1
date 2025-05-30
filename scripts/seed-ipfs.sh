#!/bin/bash

# Change to the project root directory
cd "$(dirname "$0")/.."

# Check if .env.local exists
if [ ! -f .env ]; then
  echo "Error: .env file not found."
  echo "Please create a .env file with your PINATA_JWT token."
  exit 1
fi

# Check if PINATA_JWT is set in .env.local
if ! grep -q "PINATA_JWT=" .env || grep -q "PINATA_JWT=YOUR_PINATA_JWT_TOKEN_HERE" .env; then
  echo "Error: PINATA_JWT is not properly configured in .env."
  echo "Please add your Pinata JWT token to .env."
  exit 1
fi

echo "Running IPFS data seeding script..."

# Run the script with environment variables from .env.local
npx tsx scripts/seed-ipfs-data.ts

# Check if the script executed successfully
if [ $? -eq 0 ]; then
  echo "IPFS data seeding completed successfully!"
else
  echo "Error: IPFS data seeding failed."
  exit 1
fi 