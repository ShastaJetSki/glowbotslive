/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
```

### 4. Move HTML files to `public/` folder

Your HTML files should be in the `public/` folder for Next.js to serve them:
- Move `admin.html` → `public/admin.html`
- Move `index.html` → `public/index.html`
- Move `service.html` → `public/service.html`
- Move `glowbot.png` → keep in `public/glowbot.png` or move to `public/`

### Final Structure Should Be:
```
pages/
  └── api/
      └── appointments/
          ├── available.js
          ├── book.js
          ├── cancel.js
          └── lookup.js
public/
  ├── admin.html
  ├── index.html
  ├── service.html
  ├── glowbot.png
  └── robot.png
package.json
next.config.js
README.md
