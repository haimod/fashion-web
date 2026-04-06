# Fashion Store - React + Laravel

> D? án web bán th?i trang full-stack

## Công ngh?
- **Frontend**: React 18, Vite, Redux Toolkit, React Router v6
- **Backend**: Laravel 11, Sanctum, MySQL

## C?u trúc
- `/frontend` - React app (Vite)
- `/backend`  - Laravel REST API

## Kh?i ch?y

### Backend
`bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
`

### Frontend
`bash
cd frontend
npm install
npm run dev
`
