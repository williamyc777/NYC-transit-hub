# 🚇 NYC Transit Hub

A full-stack web application that provides real-time NYC subway and bus service alerts using official MTA GTFS-RT data.

---

## 🌐 Overview

NYC Transit Hub is a real-time transit dashboard designed to help users quickly understand the current status of subway and bus services in New York City.

It integrates live MTA data and presents it in a clean, user-friendly interface with filtering, prioritization, and personalization features.

---

## ⚙️ Tech Stack

### Frontend
- Next.js (App Router)
- React
- CSS (custom styling)

### Backend
- Flask (Python)
- REST API design

### Data Source
- MTA GTFS-RT Alerts API

---

## ✨ Features

### 🚨 Real-Time Service Alerts
- Live data from MTA GTFS-RT
- Separate views for subway and bus
- Alerts prioritized over normal service

### 🔍 Search & Filtering
- Search by route (e.g., `A`, `1`, `B12`)
- Also matches alert messages and details

### ⭐ Favorites System
- Mark routes as favorites
- Favorites are pinned to the top
- Stored locally via `localStorage`

### 🔄 Auto Refresh
- Data refreshes every 60 seconds
- Always stays up-to-date without manual reload

### 📊 Summary Dashboard
- Total subway lines
- Subway alerts count
- Bus alerts count
- Last updated time

### 📱 UX Optimizations
- Bus list pagination (`Show more / Show less`)
- Expand/collapse for “Good Service”
- Clean card-based UI

---

## 🏗️ Project Structure

