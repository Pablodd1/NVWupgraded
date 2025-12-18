# 🚀 VPS Quick Start Guide

## ⚡ Quick Commands Cheat Sheet

### 1️⃣ Connect to VPS
```bash
ssh root@YOUR_VPS_IP
```

### 2️⃣ Run Setup Script
```bash
chmod +x setup-vps.sh
./setup-vps.sh
```

### 3️⃣ Create App Directory
```bash
mkdir -p /var/www/napa-wineries
cd /var/www/napa-wineries
```

### 4️⃣ Upload Your Project
```bash
# Option A: Via Git
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .

# Option B: Upload via SFTP to /var/www/napa-wineries
```

### 5️⃣ Configure Environment
```bash
nano .env.local
# Paste and edit environment variables (see env.template)
```

### 6️⃣ Build and Start
```bash
npm install
npm run build
pm2 start npm --name "napa-wineries" -- start
pm2 save
pm2 startup
```

### 7️⃣ Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/napa-wineries
```

Paste this configuration:
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

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/napa-wineries /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8️⃣ Setup SSL (Optional)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🔄 Daily Management Commands

### Check Status
```bash
pm2 status
pm2 logs napa-wineries
```

### Restart App
```bash
pm2 restart napa-wineries
```

### Update Application
```bash
cd /var/www/napa-wineries
git pull  # or upload new files
npm install
npm run build
pm2 restart napa-wineries
```

### View Logs
```bash
pm2 logs napa-wineries          # App logs
sudo tail -f /var/log/nginx/error.log  # Nginx logs
```

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
sudo netstat -tlnp | grep 3000
pm2 delete napa-wineries
pm2 start npm --name "napa-wineries" -- start
```

### MongoDB Not Running
```bash
sudo systemctl start mongod
sudo systemctl status mongod
```

### Nginx Issues
```bash
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 📝 Important Notes

1. **Replace `yourdomain.com`** with your actual domain name in Nginx config
2. **Update `env.template`** with your actual API keys and credentials
3. **Never commit `.env.local`** to Git
4. **Keep your VPS updated**: `sudo apt update && sudo apt upgrade`

---

## 📚 Full Documentation

For detailed instructions, see `DEPLOY.md`

