# Setup Instructions for Peer to Peer Tutorial

## Initial Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **About the Warnings**
   - You may see deprecation warnings for some packages (like `vue@2.7.14`, `eslint@8.56.0`, etc.)
   - These warnings are **normal** and **safe to ignore** for now
   - The packages still work correctly, they're just older versions
   - Vue 2 has reached end-of-life, but the project still functions properly

3. **Fix Security Vulnerabilities (Optional but Recommended)**
   ```bash
   # Try to fix vulnerabilities automatically (safe fixes only)
   npm audit fix
   
   # If that doesn't fix everything, you can see details:
   npm audit
   ```
   
   **Note:** Some vulnerabilities may require manual fixes or can't be fixed without breaking changes. The project should still run even with these warnings.

4. **Run the Development Server**
   ```bash
   npm run serve
   ```
   
   The application will open automatically in your browser at `http://localhost:8080`

## Default Admin Account

After running the app for the first time, a default admin account is automatically created:
- **Email:** admin@example.com
- **Password:** admin123

You can use this to log in and approve tutor applications.

## Troubleshooting

### If `npm install` fails:
- Make sure you have Node.js installed (version 14 or higher)
- Try deleting `node_modules` folder and `package-lock.json`, then run `npm install` again
- On Windows, you might need to run PowerShell or Command Prompt as Administrator

### If the app doesn't start:
- Check if port 8080 is already in use
- Try running `npm run serve` again
- Clear your browser cache

### If you see errors about missing modules:
- Run `npm install` again
- Make sure you're in the project root directory

## Important Notes

- The app uses `localStorage` to store data (users, requests, messages, etc.)
- Data is stored locally in your browser - it won't persist if you clear browser data
- This is a demo/mock backend - in production, you'd use a real database

## Project Structure

- `/src/pages` - All page components
- `/src/components` - Reusable components
- `/src/helpers/storage.js` - Mock backend using localStorage
- `/src/routes/routes.js` - Application routes

## Need Help?

If you encounter any issues:
1. Check the browser console for errors (F12)
2. Make sure all dependencies are installed correctly
3. Try restarting the development server

