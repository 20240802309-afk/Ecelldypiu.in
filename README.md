# E-Cell DYPIUI Website

A modern, responsive website for the Entrepreneurship Cell of Dr. D. Y. Patil Institute of Engineering, Management & Research, Akurdi.

## 🚀 Features

- **Modern Design**: Clean, professional design inspired by leading E-Cell websites
- **Responsive**: Fully responsive design that works on all devices
- **Interactive**: Smooth animations and transitions using Framer Motion
- **Fast**: Built with React + Vite for optimal performance
- **SEO Friendly**: Optimized for search engines

## 📱 Pages

- **Home**: Hero section with stats, features, and sponsors
- **About**: Mission, vision, values, and achievements
- **Events**: Upcoming and past events with detailed information
- **Team**: Core team members and department structure
- **Gallery**: Photo gallery with category filtering
- **Contact**: Contact form, information, and FAQ

## 🛠️ Tech Stack

- **Frontend**: React 19
- **Build Tool**: Vite
- **Styling**: CSS3 with custom properties
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd dypiui-ecell
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Vite project
   - Click "Deploy"

3. **Custom Domain** (Optional):
   - In your Vercel dashboard, go to your project
   - Go to Settings > Domains
   - Add your custom domain

### Build for Production

```bash
npm run build
```

The build files will be in the `dist` directory.

## 📁 Project Structure

```
dypiui-ecell/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Events.jsx
│   │   ├── Team.jsx
│   │   ├── Gallery.jsx
│   │   └── Contact.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vercel.json
└── README.md
```

## 🎨 Customization

### Colors

The website uses CSS custom properties for easy theming. Update the colors in `src/index.css`:

```css
:root {
  --primary-color: #6366f1;
  --primary-dark: #4f46e5;
  --secondary-color: #f59e0b;
  /* ... other colors */
}
```

### Content

Update the content in each page component:
- **Home**: Update stats, features, and sponsor information
- **About**: Update mission, vision, and team information
- **Events**: Add your actual events
- **Team**: Add your team members
- **Gallery**: Add your photos
- **Contact**: Update contact information

### Images

Replace placeholder images with actual photos:
1. Add images to the `public` folder
2. Update image paths in the components
3. For optimal performance, use WebP format when possible

## 📧 Contact Information

Update the contact information in:
- `src/components/Footer.jsx`
- `src/pages/Contact.jsx`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Design inspiration from [ecell.in](https://ecell.in)
- Icons by [Lucide](https://lucide.dev)
- Animations by [Framer Motion](https://framer.com/motion)

---

**Built with ❤️ for E-Cell DYPIUI**