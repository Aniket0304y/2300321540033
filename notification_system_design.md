# Notification System Design

# Stage 1

## REST APIs

### GET /notifications

Returns notifications for a logged-in user.

Response:

```json
{
  "notifications": [
    {
      "id": "1",
      "type": "Placement",
      "message": "Company hiring",
      "isRead": false,
      "createdAt": "2026-06-09T10:00:00Z"
    }
  ]
}
```

### POST /notifications

Creates a notification.

### PATCH /notifications/:id/read

Marks a notification as read.

### DELETE /notifications/:id

Deletes a notification.

## Real-Time Notifications

Use WebSockets so users receive notifications instantly without refreshing the page.

---

# Stage 2

## Database Choice

PostgreSQL is preferred because it provides reliability, indexing, transactions, and scalability.

## Schema

### Users

* id
* name
* email

### Notifications

* id
* userId
* notificationType
* message
* isRead
* createdAt

## Example Query

```sql
SELECT * FROM notifications
WHERE userId = 1042
ORDER BY createdAt DESC;
```

---

# Stage 3

## Why Query Is Slow

The query scans a very large notifications table.

Current query:

```sql
SELECT *
FROM notifications
WHERE userId = 1042
AND isRead = false
ORDER BY createdAt DESC;
```

## Solution

Create a composite index:

```sql
CREATE INDEX idx_notifications
ON notifications(userId,isRead,createdAt DESC);
```

This reduces lookup cost significantly.

## Placement Notifications In Last 7 Days

```sql
SELECT DISTINCT userId
FROM notifications
WHERE notificationType='Placement'
AND createdAt >= NOW() - INTERVAL '7 DAY';
```

## Should We Index Every Column?

No.

Too many indexes increase storage and slow down INSERT/UPDATE operations.

---

# Stage 4

## Problem

Every page refresh hits the database.

## Solution

Use caching.

Suggested:

* Redis Cache
* Pagination
* Lazy Loading
* API Response Caching

Benefits:

* Reduced DB load
* Faster response time
* Better user experience

---

# Stage 5

## Problems In Current Design

* Sequential processing
* Slow email API blocks execution
* Not scalable for 50,000 users

## Better Design

Use a message queue such as RabbitMQ or Kafka.

### Flow

1. Save notification in DB
2. Publish event to queue
3. Worker sends emails
4. Worker pushes real-time notifications

### Pseudocode

```text
save_notification()

publish_to_queue()

worker:
    send_email()
    push_notification()
```

This design is reliable and scalable.

---

# Stage 6

## Priority Inbox

Priority Formula:

Placement = 3

Result = 2

Event = 1

Score:

score = weight * 100 - ageInHours

Notifications are sorted by score in descending order.

Top 10 notifications are returned to the user.

## Efficient Maintenance

Use a Min Heap of size 10.

Whenever a new notification arrives:

1. Calculate score
2. Compare with heap top
3. Insert if score is higher
4. Keep heap size 10

Time Complexity:

O(n log 10)

≈ O(n)

This allows efficient maintenance of top notifications even when new notifications arrive continuously.
