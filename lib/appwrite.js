// Appwrite configuration for CloudTunes
// This file initializes the Appwrite SDK for browser use

// Note: Make sure to include the Appwrite SDK via CDN in your HTML:
// <script src="https://cdn.jsdelivr.net/npm/appwrite@21.2.1"></script>

// Initialize Appwrite client
function initializeAppwrite() {
    if (typeof Appwrite === 'undefined') {
        console.error('Appwrite SDK not loaded. Please include it via CDN.');
        return null;
    }

    const { Client, Account, Databases } = Appwrite;
    
    const client = new Client()
        .setEndpoint("https://nyc.cloud.appwrite.io/v1")
        .setProject("69417a590007d3d01bdf");
    
    const account = new Account(client);
    const databases = new Databases(client);
    
    return { client, account, databases };
}

// For ES module compatibility (when using with build tools like Vite)
if (typeof module !== 'undefined' && module.exports) {
    const { Client, Account, Databases } = require("appwrite");
    
    const client = new Client()
        .setEndpoint("https://nyc.cloud.appwrite.io/v1")
        .setProject("69417a590007d3d01bdf");
    
    const account = new Account(client);
    const databases = new Databases(client);
    
    module.exports = { client, account, databases };
}
