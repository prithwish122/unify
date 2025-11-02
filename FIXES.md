# Quick Fixes for Common Issues

## 1. Fix Tiptap SSR Error ✅

The Tiptap editor needs `immediatelyRender: false` to avoid SSR hydration errors. This has been fixed in `composer-panel-enhanced.tsx`.

## 2. Fix Database Table Error (P2021) ✅

The error `P2021` means the database table doesn't exist yet. You need to push the schema:

```bash
npm run db:push
```

This will create all the tables (Contact, Message, Note, etc.).

## 3. Set User as Admin ✅

Use the new script to set yourself as admin:

```bash
# Set a specific user as admin
npm run set-admin your@email.com

# Or set it directly in the script
```

The script will:
- Find your user by email
- Set role to ADMIN
- Show confirmation

## Quick Fix Steps

1. **Push database schema:**
   ```bash
   npm run db:push
   ```

2. **Set yourself as admin:**
   ```bash
   npm run set-admin your@email.com
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

## Alternative: Set Admin via Database

If you prefer to do it manually:

```bash
npm run db:studio
```

Then:
1. Open Prisma Studio
2. Navigate to User table
3. Find your user
4. Change `role` from `VIEWER` to `ADMIN`
5. Save

## All Fixed! ✅

After running these fixes:
- ✅ Tiptap composer will work without SSR errors
- ✅ Contacts API will work (once tables exist)
- ✅ You'll have ADMIN access to Twilio settings
