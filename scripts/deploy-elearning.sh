#!/bin/bash
# Deploy E-Learning Platform

set -e

echo "🚀 Deploying E-Learning Platform..."

# Navigate to project root
cd "$(dirname "$0")/.."

# 1. Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install react-markdown
cd ..

# 2. Run database migration
echo "🗄️  Running database migration..."
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  Warning: DATABASE_URL not set. Please run migration manually:"
    echo "   psql \$DATABASE_URL -f backend/migrations/add_elearning_tables.sql"
else
    psql "$DATABASE_URL" -f backend/migrations/add_elearning_tables.sql || {
        echo "⚠️  Migration may have failed or tables already exist. Check logs above."
    }
fi

# 3. Seed sample data
echo "🌱 Seeding sample course data..."
cd backend
python3 scripts/seed_elearning.py || {
    echo "⚠️  Seeding may have failed or data already exists."
}
cd ..

# 4. Rebuild frontend
echo "🏗️  Building frontend..."
cd frontend
npm run build
cd ..

# 5. Restart backend (if using systemd or docker)
echo "♻️  Restart backend manually if needed (systemctl restart sipper / docker-compose restart)"

echo "✅ E-Learning platform deployed!"
echo ""
echo "📚 Next steps:"
echo "1. Visit http://localhost:5173/elearning/courses (or your domain)"
echo "2. Login with admin account (danilo@telnyx.com)"
echo "3. Admin features: /api/elearning/admin/*"
echo ""
echo "📖 Documentation: docs/e-learning-implementation.md"
