# HospitalGuard Favicon Setup

## Overview

The HospitalGuard application now uses a custom favicon featuring a hospital building with a medical cross, styled with the app's signature purple gradient (#667eea to #764ba2).

## Generated Files

All favicon files are located in the `public/` directory:

- **favicon.svg** (979 bytes) - Source SVG, vector format for modern browsers
- **favicon.ico** (787 bytes) - Classic ICO format for legacy browser support
- **favicon-16x16.png** (448 bytes) - 16x16 PNG for standard browser tabs
- **favicon-32x32.png** (765 bytes) - 32x32 PNG for HD displays
- **apple-touch-icon.png** (4.6 KB) - 180x180 PNG for iOS home screen

## HTML Implementation

The favicons are referenced in `index.html`:

```html
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="alternate icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
```

## Browser Support

- **Modern browsers** (Chrome, Firefox, Edge, Safari): Use `favicon.svg` (vector, scales perfectly)
- **Legacy browsers** (IE11, older versions): Fall back to `favicon.ico`
- **iOS devices**: Use `apple-touch-icon.png` when adding to home screen
- **Android/PWA**: Use PNG variants at appropriate sizes

## Regenerating Favicons

If you need to modify the favicon (change colors, design, etc.):

1. **Edit the source**: Modify `public/favicon.svg`
2. **Regenerate all sizes**: Run `npm run generate-favicons`
3. **Verify**: Check that all files in `public/` have been updated

### Manual Generation

Alternatively, run the scripts individually:

```bash
# Generate PNG files from SVG
node generate-favicons.js

# Create ICO file from 32x32 PNG
node create-ico.js
```

## Design Specifications

### Colors
- **Gradient**: Linear gradient from #667eea (royal blue) to #764ba2 (purple)
- **Icon**: White (#ffffff) hospital building
- **Windows**: Purple accent (#667eea) for detail

### Icon Structure
- **Background**: Rounded rectangle (12px border radius) with gradient
- **Building**: White rectangular building with roof
- **Cross**: Medical cross in center (vertical + horizontal bars)
- **Windows**: Three circular windows at bottom for detail
- **Size**: 64x64 viewBox, scales to any size

### Brand Consistency

The favicon matches the HospitalGuard brand:
- Uses the same purple gradient as the app's primary theme
- Hospital icon reinforces medical/healthcare context
- Medical cross symbolizes care and professionalism
- Modern, clean design aligns with luxury UI/UX approach

## File Sizes & Performance

| File | Size | Use Case |
|------|------|----------|
| favicon.svg | 979 bytes | Modern browsers, scalable |
| favicon.ico | 787 bytes | Legacy browser fallback |
| favicon-16x16.png | 448 bytes | Standard resolution tabs |
| favicon-32x32.png | 765 bytes | HD displays |
| apple-touch-icon.png | 4.6 KB | iOS home screen icon |

**Total**: ~7.5 KB for complete favicon set (minimal impact on load time)

## Testing

To test favicons in different browsers:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+F5 or Cmd+Shift+R)
3. **Check browser tab** - should show purple hospital icon
4. **Check bookmarks** - favicon should appear when bookmarking
5. **iOS test**: Add to home screen, check icon quality

## Troubleshooting

### Favicon Not Showing

1. **Clear browser cache**: Browsers aggressively cache favicons
2. **Check DevTools Network tab**: Verify favicon files are loading
3. **Check file paths**: Ensure all files exist in `public/` directory
4. **Try different browser**: Test in Chrome, Firefox, and Safari

### Regeneration Issues

If `npm run generate-favicons` fails:

1. **Check sharp installation**: `npm list sharp`
2. **Reinstall if needed**: `npm install --save-dev sharp`
3. **Verify SVG exists**: Confirm `public/favicon.svg` is present
4. **Check Node version**: Requires Node.js 18+ for ES modules

## Related Documentation

- [START_HERE.md](START_HERE.md) - Complete setup guide
- [SETUP.md](SETUP.md) - General setup instructions
- [DATABASE_SETUP_GUIDE.md](DATABASE_SETUP_GUIDE.md) - Database configuration

## Scripts

### generate-favicons.js

Converts the source SVG to multiple PNG sizes using the `sharp` library.

### create-ico.js

Creates a browser-compatible ICO file from the 32x32 PNG. The ICO format is a container that embeds PNG data with proper headers.

## Maintenance

- **Update frequency**: Only when rebranding or changing logo
- **Dependencies**: `sharp` (devDependency for image processing)
- **Version control**: All favicon files are committed to git
- **Build process**: No build step required, files served statically

---

**Note**: The favicon reflects HospitalGuard's premium, luxury brand identity with modern design and professional aesthetics.
