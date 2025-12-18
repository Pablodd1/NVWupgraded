#!/bin/bash

echo "🚀 Starting VPS Setup for Napa Valley Wineries"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Update system
echo ""
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y
if [ $? -eq 0 ]; then
    print_status "System updated successfully"
else
    print_error "Failed to update system"
    exit 1
fi

# Install Node.js
echo ""
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
if [ $? -eq 0 ]; then
    NODE_VERSION=$(node --version)
    print_status "Node.js installed: $NODE_VERSION"
else
    print_error "Failed to install Node.js"
    exit 1
fi

# Install MongoDB
echo ""
echo "📦 Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
if [ $? -eq 0 ]; then
    print_status "MongoDB installed successfully"
else
    print_error "Failed to install MongoDB"
    exit 1
fi

# Start and enable MongoDB
echo ""
echo "🔧 Starting MongoDB service..."
sudo systemctl start mongod
sudo systemctl enable mongod
if [ $? -eq 0 ]; then
    print_status "MongoDB service started and enabled"
else
    print_error "Failed to start MongoDB service"
    exit 1
fi

# Install PM2
echo ""
echo "📦 Installing PM2..."
sudo npm install -g pm2
if [ $? -eq 0 ]; then
    PM2_VERSION=$(pm2 --version)
    print_status "PM2 installed: v$PM2_VERSION"
else
    print_error "Failed to install PM2"
    exit 1
fi

# Install Nginx
echo ""
echo "📦 Installing Nginx..."
sudo apt install nginx -y
if [ $? -eq 0 ]; then
    print_status "Nginx installed successfully"
else
    print_error "Failed to install Nginx"
    exit 1
fi

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
if [ $? -eq 0 ]; then
    print_status "Nginx service started and enabled"
else
    print_error "Failed to start Nginx service"
    exit 1
fi

# Install Git
echo ""
echo "📦 Installing Git..."
sudo apt install git -y
if [ $? -eq 0 ]; then
    GIT_VERSION=$(git --version)
    print_status "$GIT_VERSION installed"
else
    print_error "Failed to install Git"
    exit 1
fi

# Setup firewall
echo ""
echo "🔥 Configuring UFW firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable
print_status "Firewall configured"

# Summary
echo ""
echo "=============================================="
echo "✅ VPS Setup Complete!"
echo "=============================================="
echo ""
echo "Installed components:"
echo "  ✓ Node.js $(node --version)"
echo "  ✓ npm $(npm --version)"
echo "  ✓ MongoDB $(mongod --version | head -n 1)"
echo "  ✓ PM2 $(pm2 --version)"
echo "  ✓ Nginx $(nginx -v 2>&1 | cut -d' ' -f3)"
echo "  ✓ Git $(git --version | cut -d' ' -f3)"
echo ""
echo "Next steps:"
echo "  1. Create project directory: mkdir -p /var/www/napa-wineries"
echo "  2. Upload your project files"
echo "  3. Create .env.local file with your configuration"
echo "  4. Run: npm install"
echo "  5. Run: npm run build"
echo "  6. Run: pm2 start npm --name 'napa-wineries' -- start"
echo "  7. Configure Nginx (see DEPLOY.md)"
echo ""
echo "For detailed instructions, see DEPLOY.md"
echo ""

