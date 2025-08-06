# Prisma Role Management Guide

## Overview

This document explains how user roles are managed in the application and provides guidelines to prevent common errors related to role handling.

## Role Structure

In our application, user roles are **not** stored directly on the `User` model. Instead, they are managed through a separate `UserRole` model with a many-to-many relationship:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  // ... other fields
  
  // Relation to UserRole - this is how roles are assigned
  userRoles     UserRole[]
}

model UserRole {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  tenantId  String
  userId    String
  role      RoleType
  
  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@unique([userId, tenantId, role])
}

enum RoleType {
  SUPER_ADMIN
  BUSINESS
  CLIENT
}
```

## Common Errors and How to Avoid Them

### 1. Direct Role Field Reference

❌ **Incorrect:**
```typescript
const user = await prisma.user.findUnique({
  where: { email: email },
  select: { id: true, role: true } // Error: 'role' does not exist on User
});

if (user.role === "CLIENT") { // Error: 'role' does not exist on User
  // ...
}
```

✅ **Correct:**
```typescript
const user = await prisma.user.findUnique({
  where: { email: email },
  include: { userRoles: true }
});

// Check if user has CLIENT role
const isClient = user.userRoles.some(ur => ur.role === "CLIENT");
```

### 2. Filtering Users by Role

❌ **Incorrect:**
```typescript
const clients = await prisma.user.findMany({
  where: { role: "CLIENT" } // Error: 'role' does not exist on User
});
```

✅ **Correct:**
```typescript
const clients = await prisma.user.findMany({
  where: {
    userRoles: {
      some: {
        role: "CLIENT"
      }
    }
  }
});
```

### 3. Determining Primary Role

When a user has multiple roles, use this priority order:
1. SUPER_ADMIN
2. BUSINESS
3. CLIENT

```typescript
// Determine primary role
let primaryRole = "CLIENT"; // Default to lowest privilege
if (user.userRoles.some(ur => ur.role === "SUPER_ADMIN")) {
  primaryRole = "SUPER_ADMIN";
} else if (user.userRoles.some(ur => ur.role === "BUSINESS")) {
  primaryRole = "BUSINESS";
}
```

## JWT Token and Authentication

When creating JWT tokens for authentication, include the primary role:

```typescript
const token = await signJwtToken({
  id: user.id,
  email: user.email,
  name: user.name,
  role: primaryRole, // Include the primary role in the token
  // other fields...
});
```

## Role-Based Redirection

After login, users should be redirected based on their role:
- CLIENT → /client-dashboard
- BUSINESS/SUPER_ADMIN → /dashboard

## Best Practices

1. Always use `include: { userRoles: true }` when you need to check a user's role
2. Never reference a direct `role` field on the User model
3. When checking permissions, use the role from UserRole, not from User
4. For complex role-based logic, consider creating helper functions

By following these guidelines, you'll avoid common Prisma errors related to the User model and role management.
