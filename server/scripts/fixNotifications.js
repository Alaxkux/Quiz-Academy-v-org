/**
 * One-time cleanup script.
 *
 * Why this exists: notifications/friends/friendRequests fields were added to
 * the User schema recently. If any existing user document has malformed data
 * in those fields (e.g. from earlier code, manual DB edits, or a bad
 * migration), Mongoose can throw a CastError the moment anything tries to
 * $push a new, correctly-shaped entry onto that array — which is exactly the
 * "Cast to [string] failed ... at path notifications.0" error.
 *
 * This script goes through every user, drops any array entries that don't
 * match the expected shape, and leaves everything else untouched.
 *
 * Run once from the server/ directory:
 *   node scripts/fixNotifications.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

function isValidNotification(n) {
  return n && typeof n === 'object' && !Array.isArray(n) && typeof n.message === 'string';
}
function isValidFriendRequest(r) {
  return r && typeof r === 'object' && !Array.isArray(r) && r.from;
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected. Scanning users...');

  // Use the raw collection (not the Mongoose model) for reading, so we can
  // inspect fields even if they're currently in a shape the schema itself
  // would refuse to hydrate.
  const raw = mongoose.connection.collection('users');
  const users = await raw.find({}).toArray();

  let fixedCount = 0;

  for (const u of users) {
    const cleanNotifications = Array.isArray(u.notifications)
      ? u.notifications.filter(isValidNotification)
      : [];
    const cleanFriendRequests = Array.isArray(u.friendRequests)
      ? u.friendRequests.filter(isValidFriendRequest)
      : [];
    const cleanFriends = Array.isArray(u.friends) ? u.friends : [];

    const notifChanged   = JSON.stringify(cleanNotifications)  !== JSON.stringify(u.notifications  || []);
    const reqChanged     = JSON.stringify(cleanFriendRequests) !== JSON.stringify(u.friendRequests  || []);
    const friendsMissing = !Array.isArray(u.friends);

    if (notifChanged || reqChanged || friendsMissing) {
      await raw.updateOne(
        { _id: u._id },
        { $set: { notifications: cleanNotifications, friendRequests: cleanFriendRequests, friends: cleanFriends } }
      );
      fixedCount++;
      console.log(`Cleaned user ${u.email || u._id} — removed ${
        (u.notifications?.length || 0) - cleanNotifications.length
      } bad notification(s), ${
        (u.friendRequests?.length || 0) - cleanFriendRequests.length
      } bad friend request(s)`);
    }
  }

  console.log(`Done. ${fixedCount} user(s) cleaned out of ${users.length} total.`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Cleanup script failed:', err);
  process.exit(1);
});