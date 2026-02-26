# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

This will install:
- react & react-dom
- react-router-dom
- axios
- framer-motion
- lucide-react
- tailwindcss & autoprefixer & postcss
- vite & @vitejs/plugin-react

## Step 2: Verify Backend is Running

Make sure your FastAPI backend is running on:
```
http://127.0.0.1:8000
```

Test the backend:
```bash
curl http://127.0.0.1:8000/predict
```

## Step 3: Start Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Step 4: Test the Application

1. Open browser to `http://localhost:3000`
2. Navigate to Home page
3. Upload a test skin lesion image (JPEG or PNG)
4. Click "Analyze Image with AI"
5. View the results and recommendations

## Troubleshooting

### Issue: "Failed to analyze image"
**Solution:** Ensure backend is running and CORS is enabled

### Issue: Upload button doesn't work
**Solution:** Check that you're uploading JPEG or PNG format

### Issue: Styling looks broken
**Solution:** Run `npm install` again to ensure Tailwind is properly configured

### Issue: Axios error
**Solution:** Check that the API URL in Home.jsx matches your backend URL

## File Structure Check

After setup, you should have:

```
dermassist-frontend/
├── node_modules/
├── public/
├── src/
│   ├── components/
│   │   ├── ExplainableAI.jsx
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProcessingLoader.jsx
│   │   ├── RecommendationPanel.jsx
│   │   ├── ResultCard.jsx
│   │   └── UploadCard.jsx
│   ├── layout/
│   │   └── Layout.jsx
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── Home.jsx
│   │   ├── HowItWorks.jsx
│   │   └── Safety.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Production Build

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Next Steps

1. Customize the color scheme in `tailwind.config.js`
2. Update API endpoint if backend URL changes
3. Add your own branding/logo
4. Configure environment variables for different environments
5. Add analytics tracking if needed

## Important Notes

- Always keep medical disclaimers visible
- Test with various image sizes and formats
- Ensure error messages are user-friendly
- Monitor backend availability
- Keep dependencies updated for security

Enjoy using DermAssist AI! 🏥
