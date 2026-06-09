# Notification System Design

## Overview
A notification system used to send notifications to users.

## Components

### API Layer
Handles incoming requests.

### Service Layer
Processes notification logic.

### Database
Stores notification records.

### Queue (Optional)
Used for async notification delivery.

## Flow

User Request
↓
API
↓
Service
↓
Database
↓
Notification Sent

## Endpoints

POST /notifications
GET /notifications
GET /notifications/:id
DELETE /notifications/:id

## Database Schema

Notification
- id
- title
- message
- userId
- createdAt