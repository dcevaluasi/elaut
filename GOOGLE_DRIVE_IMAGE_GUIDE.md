# How to Use Google Drive Images in Maklumat Pelayanan

## ✅ Recommended Method: Get Direct Link

### Step 1: Upload Image to Google Drive
1. Go to [Google Drive](https://drive.google.com)
2. Upload your image

### Step 2: Share the Image
1. Right-click on the image
2. Click "Share" or "Get link"
3. Set permission to **"Anyone with the link"** → **Viewer**
4. Copy the link

### Step 3: Convert to Direct Link

Your link will look like:
```
https://drive.google.com/file/d/1xxRa6MdBv-cgE4qSVSEagw43yw2jCBat/view?usp=sharing
```

**Option A: Use as is** ✅
- Just paste the link directly into the "Link Gambar" field
- Our app will automatically convert it!

**Option B: Manual conversion**
1. Extract the file ID: `1xxRa6MdBv-cgE4qSVSEagw43yw2jCBat`
2. Create direct link: `https://drive.google.com/uc?export=view&id=FILE_ID`

Example:
```
https://drive.google.com/uc?export=view&id=1xxRa6MdBv-cgE4qSVSEagw43yw2jCBat
```

## 🎯 Alternative: Use Other Image Hosting Services

### Imgur (Free, Easy)
1. Go to [imgur.com](https://imgur.com)
2. Click "New post" → Upload image
3. Right-click on uploaded image → "Copy image address"
4. Paste the URL

### Cloudinary (Free tier available)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Upload image
3. Copy the URL from the dashboard

### Google Photos
1. Upload to Google Photos
2. Right-click image → "Get link to share"
3. Paste the link

## ⚠️ Important Notes

1. **Make sure the image is publicly accessible**
   - Permission must be "Anyone with the link"
   - Test by opening the link in incognito mode

2. **Supported formats**
   - JPG, PNG, GIF, WebP
   - Recommended size: Under 2MB for faster loading

3. **Image will show correctly because:**
   - Next.js config includes Google Drive domains
   - Images use `unoptimized` prop
   - Helper function converts URLs automatically

## 🔧 Troubleshooting

**Image not showing?**
- Check if link is public (try in incognito)
- Verify the URL is correct
- Try using the manual conversion method
- Consider using Imgur as alternative

**Image loads slowly?**
- Compress image before uploading
- Use services like [TinyPNG](https://tinypng.com) first
- Consider using a CDN service

## 📝 Example URLs That Work

```
✅ https://drive.google.com/file/d/1xxRa6MdBv-cgE4qSVSEagw43yw2jCBat/view
✅ https://drive.google.com/uc?export=view&id=1xxRa6MdBv-cgE4qSVSEagw43yw2jCBat
✅ https://drive.usercontent.google.com/download?id=1xxRa6MdBv...
✅ https://i.imgur.com/abc123.jpg
✅ https://res.cloudinary.com/your-account/image/upload/v1234/sample.jpg
```
