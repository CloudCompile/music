# Appwrite Integration for CloudTunes

This document explains how the Appwrite SDK has been integrated into CloudTunes for comprehensive cloud features including storage, authentication, databases, and real-time sync.

## Configuration

The CloudTunes application is configured to connect to the following Appwrite instance:

- **Endpoint**: `https://nyc.cloud.appwrite.io/v1`
- **Project ID**: `69417a590007d3d01bdf`
- **Project Name**: `CloudTunes`
- **Database ID**: `cloudtunes-db`
- **Storage Bucket ID**: `music-files`

## Appwrite Features Implemented

### 1. **Authentication** ✅
CloudTunes now supports Appwrite authentication alongside Firebase:
- Email/Password authentication
- OAuth2 providers (Google, GitHub, etc.)
- Anonymous sessions support
- Automatic session management
- Dual authentication (Appwrite + Firebase for compatibility)

**How it works:**
- When users sign in, both Appwrite and Firebase authentication are attempted
- User sessions are automatically restored on page reload
- All user data is associated with Appwrite user ID

### 2. **Cloud Storage** ✅
Enhanced storage features for music files:
- Upload music files to cloud
- Download music files from cloud
- File metadata management
- Storage usage tracking
- Batch operations
- Auto-generated file IDs

**Available operations:**
- `Upload to Cloud` - Upload local files to Appwrite Storage
- `Load Cloud Library` - Load all files from cloud into queue
- Delete files from cloud (integrated with queue management)
- View storage usage statistics in Settings

### 3. **Database Collections** ✅
CloudTunes uses Appwrite Databases for persistent data storage:

#### Collections:
- **`user-settings`** - User preferences (theme, volume, EQ settings, etc.)
- **`playlists`** - User playlists with songs
- **`favorites`** - Liked/favorite songs
- **`history`** - Listening history
- **`metadata`** - Cached music metadata
- **`downloads`** - Downloaded songs tracking

#### Auto-Sync Features:
- Settings automatically sync across devices
- Playlists persist in the cloud
- Favorites sync in real-time
- History tracks across all devices

### 4. **Real-time Sync** ✅
Appwrite Realtime API enables live updates:
- Changes made on one device instantly reflect on others
- Playlist updates sync in real-time
- Favorites and settings sync automatically
- No manual refresh needed

**How it works:**
- Subscriptions are created when user logs in
- Changes to collections trigger real-time updates
- UI automatically updates when data changes

### 5. **Enhanced Features** ✅
Additional cloud features:
- **Storage Usage Display** - See how much cloud storage you're using
- **File Metadata** - Track file information (size, type, upload date)
- **Avatar Support** - Upload and manage user avatars (future feature)
- **Batch Operations** - Efficient handling of multiple files

## Database Schema

### Settings Collection
```json
{
  "userId": "string (user.$id)",
  "theme": "string",
  "advancedMode": "boolean",
  "volume": "number",
  "playbackSpeed": "number",
  "eqPreset": "string",
  "updatedAt": "datetime"
}
```

### Playlists Collection
```json
{
  "userId": "string (user.$id)",
  "name": "string",
  "description": "string",
  "songs": "string (JSON array)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Favorites Collection
```json
{
  "userId": "string (user.$id)",
  "songIds": "array<number>",
  "updatedAt": "datetime"
}
```

### History Collection
```json
{
  "userId": "string (user.$id)",
  "history": "string (JSON array)",
  "updatedAt": "datetime"
}
```

## How to Set Up Appwrite Backend

To use all features, you need to set up the following in your Appwrite project:

### 1. Create Database
1. Go to your [Appwrite Console](https://cloud.appwrite.io/console/project-69417a590007d3d01bdf)
2. Navigate to "Databases"
3. Create a new database with ID: `cloudtunes-db`

### 2. Create Collections
Create the following collections with these settings:

#### user-settings
- **Collection ID**: `user-settings`
- **Permissions**: 
  - Read: `user:$userId`
  - Create: `user:$userId`
  - Update: `user:$userId`
  - Delete: `user:$userId`
- **Attributes**:
  - `userId` (string, 255, required)
  - `theme` (string, 50)
  - `advancedMode` (boolean)
  - `volume` (integer)
  - `playbackSpeed` (float)
  - `eqPreset` (string, 50)
  - `updatedAt` (datetime)

#### playlists
- **Collection ID**: `playlists`
- **Permissions**: User-based (same as above)
- **Attributes**:
  - `userId` (string, 255, required)
  - `name` (string, 255, required)
  - `description` (string, 1000)
  - `songs` (string, 100000) // JSON array
  - `createdAt` (datetime)
  - `updatedAt` (datetime)

#### favorites
- **Collection ID**: `favorites`
- **Permissions**: User-based
- **Attributes**:
  - `userId` (string, 255, required)
  - `songIds` (string, 50000) // JSON array
  - `updatedAt` (datetime)

#### history
- **Collection ID**: `history`
- **Permissions**: User-based
- **Attributes**:
  - `userId` (string, 255, required)
  - `history` (string, 100000) // JSON array
  - `updatedAt` (datetime)

### 3. Configure Storage Bucket
1. Navigate to "Storage" section
2. Create/update bucket with ID: `music-files`
3. **Permissions**:
   - Read: Any authenticated user
   - Create: Any authenticated user
   - Update: File owner only
   - Delete: File owner only
4. **File Settings**:
   - Maximum file size: 100MB (or more for large files)
   - Allowed extensions: mp3, flac, wav, ogg, m4a, mp4, mov, webm, avi, jpg, jpeg, png, gif
   - Enable compression: No
   - Enable encryption: Yes (recommended)

### 4. Enable Authentication
1. Go to "Auth" section
2. Enable desired providers:
   - Email/Password (enabled by default)
   - Google OAuth2 (configure with client ID & secret)
   - GitHub OAuth2 (configure with client ID & secret)
3. Configure security settings:
   - Password minimum length: 8 characters
   - Enable password dictionary check
   - Session length: 1 year

## Using Appwrite Features

### Authentication
Users can sign in/up via the auth modal:
1. Click "Sign In" button
2. Enter email and password
3. App will authenticate with both Appwrite and Firebase
4. Data automatically syncs from cloud

### Cloud Storage
Upload files to cloud:
1. Click "Upload to Cloud" button
2. Select audio/video files
3. Files are uploaded with progress indication
4. Access files from any device via "Load Cloud Library"

### Data Sync
All user data automatically syncs:
- Playlists created on one device appear on all devices
- Favorites are synchronized in real-time
- Settings persist across devices
- History is tracked globally

### Storage Management
View storage usage:
1. Open Settings modal
2. View "Cloud Storage" section
3. See files count and space used
4. Click "Refresh storage info" to update

## Code Examples

### Authenticate with Appwrite
```javascript
// Login
await appwriteLogin(email, password);

// Register
await appwriteRegister(email, password, name);

// Logout
await appwriteLogout();
```

### Save Data to Appwrite
```javascript
// Save playlist
await savePlaylistToAppwrite(playlist);

// Save favorites
await saveFavoritesToAppwrite();

// Save history
await saveHistoryToAppwrite();

// Save settings (automatic on state change)
await syncStateToAppwrite();
```

### Load Data from Appwrite
```javascript
// Load all user data
await loadStateFromAppwrite();

// Load specific data
await loadPlaylistsFromAppwrite();
await loadFavoritesFromAppwrite();
await loadHistoryFromAppwrite();
```

### Storage Operations
```javascript
// Upload file
const file = document.getElementById('fileInput').files[0];
await appwriteStorage.createFile(bucketId, appwriteID.unique(), file);

// List files
const files = await appwriteStorage.listFiles(bucketId);

// Delete file
await deleteCloudFile(fileId);

// Get storage usage
const usage = await getStorageUsage();
```

### Real-time Subscriptions
```javascript
// Subscribe to real-time updates
subscribeToRealtime();

// Unsubscribe
unsubscribeFromRealtime();
```

## Security Considerations

### Permissions
- All data is user-scoped (users can only access their own data)
- File uploads are restricted to authenticated users
- Database collections use user-based permissions

### Best Practices
- Always validate user input before saving
- Use Appwrite's built-in security features
- Keep session tokens secure
- Implement rate limiting for API calls
- Regular security audits recommended

## Troubleshooting

### "Appwrite not available" error
- Check that Appwrite SDK is loaded via CDN
- Verify project ID and endpoint are correct
- Check browser console for initialization errors

### Data not syncing
- Ensure user is logged in
- Check network connectivity
- Verify collection permissions are correct
- Check browser console for API errors

### Storage upload fails
- Check file size limits
- Verify file extensions are allowed
- Ensure user has upload permissions
- Check network connectivity

## Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite JavaScript SDK](https://github.com/appwrite/sdk-for-web)
- [Appwrite Storage API](https://appwrite.io/docs/client/storage)
- [Appwrite Databases API](https://appwrite.io/docs/client/databases)
- [Appwrite Realtime API](https://appwrite.io/docs/realtime)
- [CloudTunes Project Console](https://cloud.appwrite.io/console/project-69417a590007d3d01bdf)
