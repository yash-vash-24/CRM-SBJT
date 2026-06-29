#!/bin/bash
echo "Starting backend development server..."
cd /home/yash/Electrical-CRM/backend && npm run dev > backend.log 2>&1 &
echo "Starting frontend development server..."
cd /home/yash/Electrical-CRM/frontend && npm run dev > frontend.log 2>&1 &
echo "Servers initiated in the background. Logging to backend.log and frontend.log"
sleep 5
