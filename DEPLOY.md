# 🚀 VPS Deployment Guide for Hostinger

## Prerequisites
- Hostinger VPS account with SSH access
- Domain name (optional but recommended)

---

## Step 1: Initial VPS Setup

### Connect to Your VPS via SSH

```bash
# Windows (PowerShell)
ssh root@YOUR_VPS_IP

# Or on Windows with PuTTY
# Host: YOUR_VPS_IP
# Port: 22
# Username: root
```

### Run the Setup Script

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Install Git
sudo apt install git -y
```

---

## Step 2: Deploy Your Application

### Create App Directory

```bash
mkdir -p /var/www/napa-wineries
cd /var/www/napa-wineries
```

### Upload Your Project Files

**Option A: Using Git (Recommended)**
```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .

# Or if you have the files locally
# Upload all files via SFTP to /var/www/napa-wineries
```

**Option B: Using SFTP**
- Use FileZilla, WinSCP, or any FTP client
- Connect to: `sftp://YOUR_VPS_IP` (port 22)
- Upload all project files to `/var/www/napa-wineries`

### Configure Environment Variables

```bash
cd /var/www/napa-wineries
nano .env.local
```

Add your configuration (see `.env.example` for reference):

```env
# Database
MONGODB_URI=mongodb://localhost:27017/nvw
NEXT_PUBLIC_MONGO_URI=mongodb://localhost:27017/nvw

# JWT Secret (generate a random long string)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Stripe Keys
STRIPE_SECRET_KEY=sk_test_or_live_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_or_live_your_stripe_publishable_key

# Google Maps API (if using)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Firebase (if using)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="your-firebase-private-key"
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### Install Dependencies and Build

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "napa-wineries" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs (usually includes sudo)
```

### Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/napa-wineries
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

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

Enable the site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/napa-wineries /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Step 3: Setup SSL Certificate (Optional but Recommended)

### Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Get SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts to complete SSL setup.

---

## Step 4: Monitoring and Maintenance

### Check Application Status

```bash
# PM2 status
pm2 status
pm2 logs napa-wineries

# MongoDB status
sudo systemctl status mongod

# Nginx status
sudo systemctl status nginx
```

### Restart Application

```bash
pm2 restart napa-wineries
```

### Update Application

```bash
cd /var/www/napa-wineries

# Pull latest changes (if using Git)
git pull

# Rebuild
npm run build

# Restart
pm2 restart napa-wineries
```

---

## Troubleshooting

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs napa-wineries

# Check for port conflicts
sudo netstat -tlnp | grep 3000
```

### MongoDB Not Running

```bash
sudo systemctl start mongod
sudo systemctl status mongod
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Clear Logs

```bash
pm2 flush
```

---

## Security Recommendations

1. **Firewall Setup**: Configure UFW firewall
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

2. **Strong Passwords**: Use strong passwords for all services

3. **Regular Updates**: Keep system updated
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Environment Variables**: Never commit `.env.local` to Git

---

## Need Help?

- Check PM2 logs: `pm2 logs`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check MongoDB logs: `sudo tail -f /var/log/mongodb/mongod.log`

