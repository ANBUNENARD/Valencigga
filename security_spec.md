# Security Specification: Vallencigga Luxury

## Data Invariants
1. Products can only be created/updated by Admins.
2. Users can only read their own orders.
3. Reviews can be read by anyone, but only created by authenticated users.
4. User profiles can only be written by the owner (except `isAdmin`).

## The Dirty Dozen Payloads (Target: FAIL)

1. **Identity Spoofing (Order)**: User A tries to create an order with `userId: "userB"`.
2. **Price Manipulation (Review)**: User tried to add a "price" field to a Review document to see if it's rejected.
3. **Admin Escalation**: User tries to update their own profile with `isAdmin: true`.
4. **Shadow Product**: Non-admin tries to create a product.
5. **Orphaned Review**: Creating a review for a non-existent `productId`.
6. **Massive ID**: Trying to use a 2MB string as a document ID.
7. **Cross-User Order Leak**: User A tries to `get` User B's order.
8. **Invalid Status**: Updating an order status to "delivered" by the customer.
9. **Timestamp Spoofing**: Sending a `createdAt` from 2010.
10. **Ghost Field**: Adding `discount: 99` to a product during creation.
11. **PII Leak**: Authenticated user trying to list the `users` collection to see emails.
12. **Negative Stock**: Non-admin trying to update product stock to `-10`.

## Test Runner Logic
We would run `firestore.rules.test.ts` using the Firebase Emulators. In this environment, we will implement the rules in `firestore.rules` and verify manually or via build checks.
