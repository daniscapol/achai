import express from 'express';
import cors from 'cors';
import tutorialRoutes from '../src/api/tutorialRoutes.js';
import newsRoutes from '../src/api/newsRoutes.js';
import productRoutes from '../src/api/productRoutes.js';

// Create Express app
const app = express();

// Enable CORS for all routes with specific configuration
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173', 
    'http://localhost:5174', 
    'http://127.0.0.1:5174',
    'https://achai-9epuqi7r9-daniscapols-projects.vercel.app',
    'https://achai.vercel.app',
    'https://www.achai.co',
    'https://achai.co',
    /\.vercel\.app$/  // Allow all vercel.app subdomains
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'content-type', 'Authorization', 'authorization', 'Cache-Control', 'cache-control']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api', tutorialRoutes);
app.use('/api', newsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API is running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('ERROR OCCURRED:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Export for Vercel serverless
export default app;