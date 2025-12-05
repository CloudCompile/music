const CACHE_NAME = 'cloudtunes-v1.2.0';
const MUSIC_CACHE_NAME = 'cloudtunes-music-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js'
];

// IndexedDB for offline music storage
const DB_NAME = 'cloudtunes-offline-db';
const DB_VERSION = 1;
const MUSIC_STORE = 'offline-music';
const QUEUE_STORE = 'saved-queue';

// Open IndexedDB database
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store for offline music files
      if (!db.objectStoreNames.contains(MUSIC_STORE)) {
        const musicStore = db.createObjectStore(MUSIC_STORE, { keyPath: 'id' });
        musicStore.createIndex('url', 'url', { unique: false });
        musicStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
      }
      
      // Store for saved queue
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
      }
    };
  });
}

// Save music to IndexedDB
async function saveMusicToOfflineDB(id, url, blob, metadata) {
  try {
    const db = await openDB();
    const tx = db.transaction(MUSIC_STORE, 'readwrite');
    const store = tx.objectStore(MUSIC_STORE);
    
    await new Promise((resolve, reject) => {
      const request = store.put({
        id,
        url,
        blob,
        metadata,
        downloadedAt: Date.now()
      });
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    return true;
  } catch (error) {
    console.error('Failed to save music to offline DB:', error);
    return false;
  }
}

// Get music from IndexedDB
async function getMusicFromOfflineDB(id) {
  try {
    const db = await openDB();
    const tx = db.transaction(MUSIC_STORE, 'readonly');
    const store = tx.objectStore(MUSIC_STORE);
    
    const result = await new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    return result;
  } catch (error) {
    console.error('Failed to get music from offline DB:', error);
    return null;
  }
}

// Get all offline music
async function getAllOfflineMusic() {
  try {
    const db = await openDB();
    const tx = db.transaction(MUSIC_STORE, 'readonly');
    const store = tx.objectStore(MUSIC_STORE);
    
    const result = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    return result;
  } catch (error) {
    console.error('Failed to get all offline music:', error);
    return [];
  }
}

// Delete music from IndexedDB
async function deleteMusicFromOfflineDB(id) {
  try {
    const db = await openDB();
    const tx = db.transaction(MUSIC_STORE, 'readwrite');
    const store = tx.objectStore(MUSIC_STORE);
    
    await new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    return true;
  } catch (error) {
    console.error('Failed to delete music from offline DB:', error);
    return false;
  }
}

// Save queue to IndexedDB
async function saveQueueToOfflineDB(queue) {
  try {
    const db = await openDB();
    const tx = db.transaction(QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(QUEUE_STORE);
    
    // Clear existing queue
    await new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error);
    });
    
    // Save new queue
    await new Promise((resolve, reject) => {
      const request = store.put({ id: 'current-queue', queue, savedAt: Date.now() });
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    return true;
  } catch (error) {
    console.error('Failed to save queue to offline DB:', error);
    return false;
  }
}

// Get queue from IndexedDB
async function getQueueFromOfflineDB() {
  try {
    const db = await openDB();
    const tx = db.transaction(QUEUE_STORE, 'readonly');
    const store = tx.objectStore(QUEUE_STORE);
    
    const result = await new Promise((resolve, reject) => {
      const request = store.get('current-queue');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    return result ? result.queue : null;
  } catch (error) {
    console.error('Failed to get queue from offline DB:', error);
    return null;
  }
}

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Keep music cache, only delete old app caches
            if (cacheName !== CACHE_NAME && cacheName !== MUSIC_CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip Firebase and Google API requests (more specific patterns)
  const skipPatterns = [
    'firebaseapp.com',
    'firebase.com',
    'firebasestorage.app',
    'googleapis.com',
    'gstatic.com',
    'google-analytics.com',
    'googletagmanager.com'
  ];
  
  if (skipPatterns.some(pattern => event.request.url.includes(pattern))) {
    return;
  }

  // Check if this is a music file request
  const isMusic = event.request.url.match(/\.(mp3|flac|wav|ogg|m4a|mp4)$/i) || 
                  event.request.url.includes('raw.githubusercontent.com');

  if (isMusic) {
    event.respondWith(handleMusicRequest(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached response and update cache in background
          event.waitUntil(
            fetch(event.request)
              .then((response) => {
                if (response && response.status === 200) {
                  const responseToCache = response.clone();
                  caches.open(CACHE_NAME)
                    .then((cache) => {
                      cache.put(event.request, responseToCache);
                    });
                }
              })
              .catch(() => {
                // Network failed, but we have cache
              })
          );
          return cachedResponse;
        }

        // No cache, try network
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200) {
              return response;
            }

            // Cache the new response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Network failed and no cache - return offline page for navigation
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Handle music file requests with special caching
async function handleMusicRequest(request) {
  // First try the music cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Try network
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      // Cache music files in a separate music cache
      const cache = await caches.open(MUSIC_CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    }
    return response;
  } catch (error) {
    // Network failed - return error or cached fallback
    console.log('Network failed for music request:', request.url);
    throw error;
  }
}

// Handle messages from the main thread
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Download music for offline playback
  if (event.data && event.data.type === 'DOWNLOAD_MUSIC') {
    const { id, url, metadata } = event.data;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        const saved = await saveMusicToOfflineDB(id, url, blob, metadata);
        
        // Also cache in service worker cache
        const cache = await caches.open(MUSIC_CACHE_NAME);
        await cache.put(url, new Response(blob.slice()));
        
        // Notify the client
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'DOWNLOAD_COMPLETE',
            id,
            success: saved
          });
        });
      }
    } catch (error) {
      console.error('Failed to download music:', error);
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'DOWNLOAD_COMPLETE',
          id,
          success: false,
          error: error.message
        });
      });
    }
  }
  
  // Delete offline music
  if (event.data && event.data.type === 'DELETE_OFFLINE_MUSIC') {
    const { id, url } = event.data;
    try {
      await deleteMusicFromOfflineDB(id);
      
      // Also remove from cache
      const cache = await caches.open(MUSIC_CACHE_NAME);
      await cache.delete(url);
      
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'DELETE_COMPLETE',
          id,
          success: true
        });
      });
    } catch (error) {
      console.error('Failed to delete offline music:', error);
    }
  }
  
  // Get all offline music
  if (event.data && event.data.type === 'GET_OFFLINE_MUSIC') {
    try {
      const offlineMusic = await getAllOfflineMusic();
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'OFFLINE_MUSIC_LIST',
          music: offlineMusic.map(m => ({ id: m.id, metadata: m.metadata, downloadedAt: m.downloadedAt }))
        });
      });
    } catch (error) {
      console.error('Failed to get offline music:', error);
    }
  }
  
  // Save queue
  if (event.data && event.data.type === 'SAVE_QUEUE') {
    const { queue } = event.data;
    await saveQueueToOfflineDB(queue);
  }
  
  // Get saved queue
  if (event.data && event.data.type === 'GET_SAVED_QUEUE') {
    try {
      const queue = await getQueueFromOfflineDB();
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'SAVED_QUEUE',
          queue
        });
      });
    } catch (error) {
      console.error('Failed to get saved queue:', error);
    }
  }
  
  // Get offline music blob for playback
  if (event.data && event.data.type === 'GET_OFFLINE_BLOB') {
    const { id } = event.data;
    try {
      const music = await getMusicFromOfflineDB(id);
      if (music && music.blob) {
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'OFFLINE_BLOB',
            id,
            blob: music.blob,
            metadata: music.metadata
          });
        });
      }
    } catch (error) {
      console.error('Failed to get offline blob:', error);
    }
  }
});

// Background sync for queue persistence
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-queue') {
    event.waitUntil(syncQueue());
  }
});

async function syncQueue() {
  // This can be extended to sync with cloud storage when online
  console.log('Background sync: queue synced');
}
