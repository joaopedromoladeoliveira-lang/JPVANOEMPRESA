#!/bin/bash

echo "🚀 JPvano - Quick Start Script"
echo "=============================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js $(node --version)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Please install PostgreSQL"
    exit 1
fi

echo "✅ PostgreSQL installed"

# Backend setup
echo ""
echo "📦 Setting up Backend..."
cd jpvano-backend

if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please configure .env file with your settings"
fi

echo "Installing backend dependencies..."
npm install

echo ""
echo "🎨 Setting up Frontend..."
cd ../jpvano-frontend

if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cp .env.example .env.local
fi

echo "Installing frontend dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start development:"
echo "   Terminal 1: cd jpvano-backend && npm run dev"
echo "   Terminal 2: cd jpvano-frontend && npm run dev"
echo ""
echo "🌐 Access:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
