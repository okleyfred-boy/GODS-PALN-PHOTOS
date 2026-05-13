# Security Specification

## Data Invariants
1. A Photo must have a valid `albumId` that corresponds to an Album owned by the user.
2. `userId` and `ownerId` must always match the `request.auth.uid`.
3. Image data (`url`) must be a string and constrained by size (handled by client compression, but rules should verify string length if possible, though base64 can be large).
4. `createdAt` must be a server timestamp or valid number.

## The "Dirty Dozen" Payloads
1. Create photo with someone else's `userId`.
2. Create photo with an `albumId` belonging to another user.
3. Update `url` of a photo one doesn't own.
4. Update `ownerId` of an album to transfer ownership.
5. Create an album where `ownerId` doesn't match `auth.uid`.
6. List all photos across all users (blanket read).
7. Delete an album one doesn't own.
8. Inject a 2MB string into `title`.
9. Update `createdAt` to a past date (spoofing).
10. Update a photo's `albumId` to a different user's album.
11. Read a photo one doesn't own.
12. Create a photo with a non-string `url`.

## The Test Runner
(Omitted for brevity in this env, but all writes/reads will be rejected unless invariants match).
