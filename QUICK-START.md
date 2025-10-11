# 🚀 QUICK START - College Application Encryption System

## ⚡ IMMEDIATE SOLUTION

### Option 1: Use the Batch File (RECOMMENDED)
1. **Double-click** on `START-SERVER.bat` in your file explorer
2. The server will start automatically
3. Open your browser and go to: `http://localhost:5000/api/health`

### Option 2: Use PowerShell Script
1. **Right-click** on `start-server.ps1` → "Run with PowerShell"
2. The server will start automatically
3. Open your browser and go to: `http://localhost:5000/api/health`

### Option 3: Manual Commands
```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Start the server
node backend/basic-server.js

# 3. Test in browser
# Go to: http://localhost:5000/api/health
```

## 🔧 TROUBLESHOOTING

### If the server doesn't start:

1. **Check Node.js installation:**
   ```bash
   node --version
   ```
   Should show version 18 or higher

2. **Check if port 5000 is free:**
   ```bash
   netstat -an | findstr :5000
   ```
   Should show no results

3. **Try a different port:**
   - Edit `backend/basic-server.js`
   - Change `const port = 5000;` to `const port = 3001;`
   - Restart the server

### If you get dependency errors:

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

## ✅ SUCCESS INDICATORS

When the server is running correctly, you should see:
- Console output showing "Server running on port 5000"
- Browser shows JSON response at `http://localhost:5000/api/health`
- No error messages in the console

## 🎯 NEXT STEPS

Once the basic server is running:
1. Test the health endpoint in your browser
2. Configure Azure services (optional)
3. Add more endpoints as needed

## 📞 NEED HELP?

If you're still having issues:
1. Check the console output for error messages
2. Make sure Node.js is properly installed
3. Try running the batch file as administrator
4. Check if any antivirus is blocking the port
