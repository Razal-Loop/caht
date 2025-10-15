# AnonChat Deployment Guide

This guide covers various deployment options for the AnonChat application.

## 🚀 Quick Deployment Options

### 1. Local Development
```bash
# Clone and setup
git clone https://github.com/yourusername/anonchat.git
cd anonchat
npm run install-all

# Start development
npm run dev
```

### 2. Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### 3. Cloud Deployment
- **Heroku**: One-click deploy button
- **Vercel**: Frontend + serverless functions
- **Railway**: Full-stack deployment
- **DigitalOcean**: App Platform

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
# Multi-stage build
FROM node:16-alpine AS builder

# Build client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Build server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./

# Production image
FROM node:16-alpine AS production
WORKDIR /app

# Copy server files
COPY --from=builder /app/server ./
COPY --from=builder /app/client/build ./public

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  anonchat:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - anonchat
    restart: unless-stopped
```

### Build and Deploy
```bash
# Build image
docker build -t anonchat .

# Run container
docker run -d -p 5000:5000 --name anonchat anonchat

# Or use docker-compose
docker-compose up -d
```

## ☁️ Cloud Platform Deployment

### Heroku Deployment

#### 1. Prepare for Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-anonchat-app
```

#### 2. Configure Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=5000
```

#### 3. Deploy
```bash
# Add Heroku remote
git remote add heroku https://git.heroku.com/your-anonchat-app.git

# Deploy
git push heroku main
```

#### 4. Heroku Configuration Files

**Procfile:**
```
web: cd server && npm start
```

**package.json (root):**
```json
{
  "scripts": {
    "heroku-postbuild": "cd client && npm install && npm run build && cd ../server && npm install"
  }
}
```

### Vercel Deployment

#### 1. Frontend (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd client
vercel --prod
```

#### 2. Backend (Vercel Functions)
```javascript
// api/index.js
const express = require('express');
const app = express();

// Your server code here

module.exports = app;
```

#### 3. Vercel Configuration
**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/build/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "client/build/$1"
    }
  ]
}
```

### Railway Deployment

#### 1. Connect Repository
- Go to [Railway.app](https://railway.app)
- Connect your GitHub repository
- Select the project

#### 2. Configure Environment
```bash
NODE_ENV=production
PORT=5000
```

#### 3. Deploy
Railway will automatically detect the Node.js project and deploy it.

### DigitalOcean App Platform

#### 1. Create App
- Go to DigitalOcean App Platform
- Connect your GitHub repository
- Select the project

#### 2. Configure Build Settings
```yaml
# .do/app.yaml
name: anonchat
services:
- name: web
  source_dir: /
  github:
    repo: yourusername/anonchat
    branch: main
  run_command: cd server && npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 5000
  envs:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: "5000"
```

## 🔧 Production Configuration

### Environment Variables
```bash
# Production environment
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com

# Optional: Database
MONGODB_URI=mongodb://localhost:27017/anonchat

# Optional: Redis
REDIS_URL=redis://localhost:6379

# Optional: File storage
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your_bucket_name
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Static files
    location / {
        root /app/client/build;
        try_files $uri $uri/ /index.html;
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # File uploads
    location /uploads/ {
        alias /app/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'anonchat',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

## 🔒 SSL/HTTPS Setup

### Let's Encrypt (Certbot)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Cloudflare SSL
1. Add your domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption
4. Configure SSL mode to "Full (strict)"

## 📊 Monitoring and Logging

### Application Monitoring
```javascript
// server/index.js
const express = require('express');
const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

### Logging Configuration
```javascript
// server/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'anonchat' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
```

### Performance Monitoring
```javascript
// server/middleware/monitoring.js
const monitoring = require('@sentry/node');

// Initialize Sentry
monitoring.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Performance monitoring
app.use(monitoring.requestHandler());
app.use(monitoring.tracingHandler());
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    - name: Install dependencies
      run: npm run install-all
    - name: Run tests
      run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-anonchat-app"
        heroku_email: "your-email@example.com"
```

## 🗄️ Database Setup

### MongoDB Atlas
1. Create MongoDB Atlas account
2. Create cluster
3. Get connection string
4. Set environment variable:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/anonchat
```

### Local MongoDB
```bash
# Install MongoDB
sudo apt install mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database
mongo
> use anonchat
> db.createUser({user: "anonchat", pwd: "password", roles: ["readWrite"]})
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use Redis for session storage
- Implement load balancing
- Use CDN for static assets
- Database clustering

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching
- Use connection pooling

### Performance Optimization
```javascript
// server/index.js
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // Worker process
  require('./server');
}
```

## 🚨 Backup and Recovery

### Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/anonchat" --out=./backup

# Restore
mongorestore --uri="mongodb://localhost:27017/anonchat" ./backup/anonchat
```

### File Backup
```bash
# Backup uploads
tar -czf uploads-backup.tar.gz uploads/

# Restore
tar -xzf uploads-backup.tar.gz
```

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port
   lsof -i :5000
   
   # Kill process
   kill -9 PID
   ```

2. **Permission denied**
   ```bash
   # Fix file permissions
   chmod +x start.sh
   chown -R $USER:$USER .
   ```

3. **Memory issues**
   ```bash
   # Increase Node.js memory
   node --max-old-space-size=4096 server/index.js
   ```

### Log Analysis
```bash
# View logs
tail -f logs/combined.log

# Filter errors
grep "ERROR" logs/combined.log

# Monitor real-time
journalctl -u anonchat -f
```

---

*For more information, see the main [README.md](../README.md) and [API.md](API.md) files.*
