# Hotel Management System Frontend
A modern, responsive frontend interface for managing hotel operations. Built with Vanilla JavaScript, HTML, and CSS.

### Frontend URL= https://kenempempara.github.io/Frontend-hotel/
### Backend URL =  https://management-hotel.onrender.com

## 🚀 Features
+ 📊 Dashboard - Real-time hotel statistics
+ 🏨 Room Management - Full CRUD operations
+ 👤 Guest Management - Guest registration & tracking
+ 📅 Booking System - Interactive booking creation
+ 📱 Responsive Design - Mobile-friendly interface
+ ♿ Accessible - WCAG compliant with ARIA labels

## 🛠️ Quick Start
Prerequisites
+ Backend API running on http://localhost:3000
+ Modern web browser

## 📁 File Structure

hotel-frontend/
 + inex.html------ Main HTML file
 + style.css------ All CSS styles
 + script.js-------JavaScript logic


## 🎯 How to Use
### Adding a Room
1. Go to Rooms tab
2. Click Add New Room
3. Fill details (number, type, price, status)
4. Click Save Room

### Registering a Guest
1. Go to Guests tab
2. Click Add New Guest
3. Enter guest information
4. Click Save Guest
   
### Creating a Booking
1. Go to New Booking tab
2. Select guest and room
3. Choose dates
4. Review booking summary
5. Click Create Booking

## 🔧 API Endpoints Required
The frontend connects to these backend endpoints:
+ GET /api/rooms - Get all rooms
+ POST /api/rooms - Create room
+ PUT /api/rooms/:id - Update room
+ DELETE /api/rooms/:id - Delete room
+ GET /api/guests - Get all guests
+ POST /api/guests - Create guest
+ PUT /api/guests/:id - Update guest
+ DELETE /api/guests/:id - Delete guest
+ GET /api/bookings - Get all bookings
+ POST /api/bookings - Create booking
+ DELETE /api/bookings/:id - Delete booking

## 🎨 Technologies Used
+ HTML5 - Semantic markup
+ CSS3 - Flexbox, Grid, Animations
+ Vanilla JavaScript - No frameworks
+ Font Awesome - Icons
+ Google Fonts - Poppins font


## 🚨 Troubleshooting
### "API Connection Failed"
1 Check if backend is running: npm start
2 Verify API URL in script.js
3 Check browser console for errors


## "No Data Showing"
1. Click Refresh Data button
2. Check if backend has seed data
3. Verify network connection

## "Form Not Working"
1. Fill all required fields (* marked)
2. Check date validity
3. Refresh page and try again

# CODE SCREENSHOTS
<img width="1280" height="597" alt="Screenshot 2025-12-05 185007" src="https://github.com/user-attachments/assets/de6da624-556e-471c-b55a-5f573e4eb5cc" />
<img width="1290" height="581" alt="Screenshot 2025-12-05 184816" src="https://github.com/user-attachments/assets/0996e146-2291-4367-973a-95f9eb8db025" />
<img width="1300" height="619" alt="Screenshot 2025-12-05 184710" src="https://github.com/user-attachments/assets/f8eac2d0-be6c-4c0f-bec9-9ad07a285c6b" />
<img width="1285" height="592" alt="Screenshot 2025-12-05 185839" src="https://github.com/user-attachments/assets/0264cc5f-6794-4e6e-a1d6-664a45b3a777" />
<img width="1287" height="607" alt="Screenshot 2025-12-05 185142" src="https://github.com/user-attachments/assets/2e3d382d-a5b3-4f31-86fd-b25ee6e0f771" />


