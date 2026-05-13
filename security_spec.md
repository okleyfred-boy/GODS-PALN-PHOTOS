# Security Specification - Aeterna Digital Archives

## 1. Data Invariants
- A photo MUST belong to an album owned by the same user.
- Photos and Albums MUST have an ownerId/userId matching the authenticated user.
- The `url` field must be reasonably sized (within Firestore document limits and rule limits).
- Timestamps must be numbers or server timestamps.

## 2. The "Dirty Dozen" Payloads

### Album Collection
1. **Identity Spoofing**: Create album with someone else's `ownerId`.
2. **Missing Fields**: Create album without `createdAt`.
3. **Large Payload**: Create album with 1MB `title`.
4. **Invalid ID**: Get album with ID `../sneaky`.

### Photo Collection
5. **Orphaned Photo**: Create photo with `albumId` that doesn't exist.
6. **Cross-User Album**: Create photo in an album ID belonging to another user.
7. **Identity Spoofing**: Create photo with someone else's `userId`.
8. **Malicious Size**: Create photo with `url` exceeding 6MB (even if Firestore limit is lower).
9. **State Shortcut**: Update `userId` to a different value.
10. **Type Mismatch**: Send `createdAt` as a string instead of number.
11. **Shadow Field**: Add `isAdmin: true` to a photo document.
12. **Unauthorized List**: Query `photos` without a `userId` filter matching the auth.

## 3. Conflict Report & Red Team Evaluation

| Collection | Identity Spoofing | State Shortcutting | Resource Poisoning |
| :--- | :--- | :--- | :--- |
| albums | Blocked by isValidAlbum | Blocked by immutable ownerId | Blocked by size limit |
| photos | Blocked by isValidPhoto | Blocked by immutable userId | Blocked by size limit |

*Note: PII is not stored (emails/phone numbers), only UIDs.*
