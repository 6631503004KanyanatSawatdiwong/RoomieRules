# RoomieRules Deployment Guide

This guide covers different deployment options for RoomieRules.

## 📋 Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database initialized
- [ ] Upload directories created
- [ ] SSL certificates ready (for production)
- [ ] Domain/subdomain configured
- [ ] Build process tested locally

## 🚀 Deployment Options

### 1. Vercel (Recommended for Easy Deployment)

#### Prerequisites
- GitHub account with repository
- Vercel account

#### Steps
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables:
     - `JWT_SECRET`: Your secure JWT secret
     - `NODE_ENV`: `production`

3. **Configure Build Settings** (if needed):
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

#### Environment Variables on Vercel
```env
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
NODE_ENV=production
```

### 2. Docker Deployment

#### Prerequisites
- Docker installed
- Docker Compose (optional)

#### Quick Start with Docker
```bash
# Build the image
docker build -t roomie-rules .

# Run the container
docker run -d \
  --name roomie-rules \
  -p 3000:3000 \
  -e JWT_SECRET="your-super-secure-jwt-secret" \
  -e NODE_ENV=production \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/public/uploads:/app/public/uploads \
  roomie-rules
```

#### Using Docker Compose
```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### 3. Traditional VPS/Server Deployment

#### Prerequisites
- Ubuntu/CentOS server
- Node.js 18+ installed
- PM2 or similar process manager
- Nginx (recommended)

#### Steps

1. **Server Setup**:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Deploy Application**:
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/RoomieRules.git
   cd RoomieRules
   
   # Install dependencies
   npm install
   
   # Create environment file
   cp .env.example .env.local
   # Edit .env.local with your values
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start npm --name "roomie-rules" -- start
   pm2 save
   pm2 startup
   ```

3. **Configure Nginx** (optional but recommended):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### 4. Railway Deployment

#### Steps
1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and deploy:
   ```bash
   railway login
   railway init
   railway add --service postgresql  # Optional: if you want PostgreSQL
   railway deploy
   ```

3. Set environment variables in Railway dashboard.

### 5. Render Deployment

#### Steps
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add environment variables in Render dashboard

## 🔧 Environment Configuration

### Required Variables
```env
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
NODE_ENV=production
```

### Optional Variables
```env
DATABASE_PATH=./roomie-rules.db
MAX_FILE_SIZE_MB=5
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
BASE_URL=https://your-domain.com
SESSION_TIMEOUT_HOURS=24
REGISTRATION_ENABLED=true
```

## 📁 File System Setup

### Required Directories
```bash
# Create upload directories
mkdir -p public/uploads/receipts

# Set permissions (Linux/Mac)
chmod 755 public/uploads
chmod 755 public/uploads/receipts
```

### Database Location
- Default: `./roomie-rules.db` in the project root
- Ensure the directory is writable
- Consider backing up regularly in production

## 🔐 SSL/HTTPS Setup

### Using Certbot (Let's Encrypt)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring & Maintenance

### Health Checks
- Endpoint: `/api/health`
- Returns database status and uptime
- Use for load balancer health checks

### Log Management
```bash
# PM2 logs
pm2 logs roomie-rules

# Docker logs
docker logs roomie-rules

# System logs
journalctl -u your-service-name
```

### Database Backup
```bash
# Backup SQLite database
cp roomie-rules.db roomie-rules-backup-$(date +%Y%m%d).db

# Automated backup script
#!/bin/bash
cp roomie-rules.db "backups/roomie-rules-$(date +%Y%m%d-%H%M%S).db"
find backups/ -name "*.db" -mtime +7 -delete  # Keep 7 days
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Permission Errors**:
   ```bash
   chmod 644 roomie-rules.db
   chown www-data:www-data roomie-rules.db  # For nginx/apache
   ```

2. **File Upload Issues**:
   ```bash
   mkdir -p public/uploads/receipts
   chmod 755 public/uploads/receipts
   ```

3. **Memory Issues**:
   ```bash
   # Increase Node.js memory limit
   node --max-old-space-size=4096 server.js
   ```

4. **Port Already in Use**:
   ```bash
   # Find process using port 3000
   lsof -i :3000
   # Kill process
   kill -9 <PID>
   ```

### Performance Optimization

1. **Enable Gzip in Nginx**:
   ```nginx
   gzip on;
   gzip_types text/css application/javascript application/json;
   ```

2. **PM2 Cluster Mode**:
   ```bash
   pm2 start npm --name "roomie-rules" -i max -- start
   ```

3. **Database Optimization**:
   ```sql
   -- Add indexes for better query performance
   PRAGMA optimize;
   VACUUM;
   ```

## 📱 Mobile Optimization

The app is already mobile-optimized with:
- Responsive design
- Touch-friendly interfaces
- PWA capabilities
- Offline indicators

No additional configuration needed for mobile deployment.

---

For more help, check the main README.md or create an issue on GitHub.
