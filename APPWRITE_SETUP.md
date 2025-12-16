# Appwrite Integration for CloudTunes

This document explains how the Appwrite SDK has been integrated into CloudTunes for music storage functionality.

## Configuration

The CloudTunes application is configured to connect to the following Appwrite instance:

- **Endpoint**: `https://nyc.cloud.appwrite.io/v1`
- **Project ID**: `69417a590007d3d01bdf`
- **Project Name**: `CloudTunes`
- **Bucket ID**: `music-files` (for storing audio/video files)

## How It Works

### Automatic Initialization

When the CloudTunes app loads, it automatically:

1. Loads the Appwrite SDK from CDN
2. Initializes the Appwrite client with the CloudTunes project credentials
3. Calls `client.ping()` to verify the connection
4. Logs the connection status to the browser console

### Available Appwrite Objects

The following Appwrite objects are available globally in the app:

- `appwriteClient` - The main Appwrite client for API calls
- `appwriteAccount` - Account management (user authentication)
- `appwriteDatabases` - Database operations (storing music metadata, playlists, etc.)
- `appwriteStorage` - Storage operations (upload/download music files)
- `appwriteBucketId` - The bucket ID for storing music files

### Console Messages

When the app loads successfully, you'll see in the browser console:

```
✅ Appwrite connected successfully: {response}
📦 CloudTunes is connected to Appwrite storage
```

If the connection fails, you'll see:

```
❌ Appwrite connection failed: {error}
```

## Files Modified

1. **index.html** - Added Appwrite SDK via CDN, initialization code, and cloud storage functions
2. **lib/appwrite.js** - Configuration file with Appwrite credentials and Storage service

## Using Appwrite Storage in CloudTunes

### Upload Music to Cloud

Users can upload music files to the Appwrite bucket using the "Upload to Cloud" button:

1. Click the "Upload to Cloud" button
2. Select one or more audio/video files
3. Files are uploaded to the Appwrite bucket with unique IDs
4. Upload progress and status are shown via toast notifications

### Load Music from Cloud

Users can load previously uploaded music from the Appwrite bucket using the "Load Cloud Library" button:

1. Click the "Load Cloud Library" button
2. The app fetches all files from the Appwrite bucket
3. Files are added to the queue with metadata
4. Metadata is fetched in the background for each file

### Code Examples

#### Upload a file to Appwrite Storage

```javascript
if (appwriteStorage) {
    const file = document.getElementById('fileInput').files[0];
    const fileId = 'unique()'; // Or generate your own unique ID
    
    appwriteStorage.createFile(appwriteBucketId, fileId, file)
        .then(response => {
            console.log('File uploaded:', response);
        })
        .catch(error => {
            console.error('Upload failed:', error);
        });
}
```

#### List files from Appwrite Storage

```javascript
if (appwriteStorage) {
    appwriteStorage.listFiles(appwriteBucketId)
        .then(response => {
            console.log('Files:', response.files);
            response.files.forEach(file => {
                const fileUrl = `${appwriteStorage.client.config.endpoint}/storage/buckets/${appwriteBucketId}/files/${file.$id}/view?project=${appwriteStorage.client.config.project}`;
                console.log('File URL:', fileUrl);
            });
        })
        .catch(error => {
            console.error('List failed:', error);
        });
}
```

#### Get file view/download URL

```javascript
// View URL (plays in browser)
const viewUrl = `${appwriteStorage.client.config.endpoint}/storage/buckets/${appwriteBucketId}/files/${fileId}/view?project=${projectId}`;

// Download URL (forces download)
const downloadUrl = `${appwriteStorage.client.config.endpoint}/storage/buckets/${appwriteBucketId}/files/${fileId}/download?project=${projectId}`;
```

## Setting Up the Appwrite Bucket

To use the cloud storage feature, you need to create a bucket in your Appwrite project:

1. Go to the [CloudTunes Project Console](https://cloud.appwrite.io/console/project-69417a590007d3d01bdf)
2. Navigate to the "Storage" section
3. Create a new bucket with ID: `music-files`
4. Configure permissions:
   - **Read**: Allow all users to read files (or restrict to authenticated users)
   - **Create**: Allow authenticated users to upload files
   - **Update**: Allow file owners to update their files
   - **Delete**: Allow file owners to delete their files
5. Configure file settings:
   - Maximum file size: 100MB (or higher for large audio files)
   - Allowed file extensions: mp3, flac, wav, ogg, m4a, mp4, mov, webm, avi
   - Enable image preview: No (for audio/video files)

## Development vs Production

The Appwrite credentials are currently hardcoded in the source files. This is suitable for:

- Development and testing
- Public/demo applications
- Client-side only applications

For production applications with sensitive data, consider:

- Using environment variables during build time
- Implementing proper authentication
- Setting up appropriate Appwrite permissions and security rules
- Restricting bucket access to authenticated users only

## Next Steps

To fully integrate music storage with Appwrite:

1. ✅ Set up storage bucket for audio files
2. ✅ Implement upload to cloud functionality
3. ✅ Implement load from cloud functionality
4. Create a database for music metadata (optional)
5. Create collections for:
   - Music metadata (title, artist, album, etc.)
   - Playlists
   - User preferences
6. Add authentication to associate data with users
7. Implement playlist sync with cloud
8. Add offline caching for cloud files

## Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite JavaScript SDK](https://github.com/appwrite/sdk-for-web)
- [Appwrite Storage API](https://appwrite.io/docs/client/storage)
- [CloudTunes Project Console](https://cloud.appwrite.io/console/project-69417a590007d3d01bdf)
