/**
 * Environment Variable Setup Helper
 * Generates secure secrets and validates configuration
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// ========================================
// COLORS FOR CONSOLE OUTPUT
// ========================================

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// ========================================
// SECRET GENERATION
// ========================================

function generateSecret(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

function generateJwtSecret(): string {
    return generateSecret(32);
}

function generateCsrfSecret(): string {
    return generateSecret(32);
}

// ========================================
// VALIDATION
// ========================================

function validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validateUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function validateMongoUri(uri: string): boolean {
    return uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
}

// ========================================
// ENV FILE GENERATION
// ========================================

interface EnvConfig {
    MONGODB_URI?: string;
    JWT_SECRET?: string;
    NEXT_PUBLIC_APP_URL?: string;
    EMAIL_PROVIDER?: string;
    EMAIL_FROM?: string;
    SENDGRID_API_KEY?: string;
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    STRIPE_SECRET_KEY?: string;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?: string;
    TWILIO_ACCOUNT_SID?: string;
    TWILIO_AUTH_TOKEN?: string;
    TWILIO_PHONE_NUMBER?: string;
    NEXT_PUBLIC_ENABLE_SMS?: string;
}

function generateEnvFile(config: EnvConfig, filename: string = '.env.local'): void {
    const envContent = `# ========================================
# NAPA VALLEY WINERIES - ENVIRONMENT CONFIGURATION
# Generated: ${new Date().toISOString()}
# ========================================

# ========================================
# DATABASE
# ========================================
MONGODB_URI=${config.MONGODB_URI || ''}

# ========================================
# AUTHENTICATION & SECURITY
# ========================================
JWT_SECRET=${config.JWT_SECRET || generateJwtSecret()}

# ========================================
# APPLICATION
# ========================================
NEXT_PUBLIC_APP_URL=${config.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}

# ========================================
# EMAIL CONFIGURATION
# ========================================
EMAIL_PROVIDER=${config.EMAIL_PROVIDER || 'ethereal'}
EMAIL_FROM=${config.EMAIL_FROM || 'noreply@napawineries.com'}

${config.EMAIL_PROVIDER === 'sendgrid' ? `# SendGrid Configuration
SENDGRID_API_KEY=${config.SENDGRID_API_KEY || ''}
` : ''}
${config.EMAIL_PROVIDER === 'smtp' ? `# SMTP Configuration
SMTP_HOST=${config.SMTP_HOST || ''}
SMTP_PORT=${config.SMTP_PORT || '587'}
SMTP_USER=${config.SMTP_USER || ''}
SMTP_PASS=${config.SMTP_PASS || ''}
` : ''}

# ========================================
# PAYMENT PROCESSING (STRIPE)
# ========================================
STRIPE_SECRET_KEY=${config.STRIPE_SECRET_KEY || ''}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}

# ========================================
# GOOGLE SERVICES
# ========================================
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${config.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}

# ========================================
# SMS NOTIFICATIONS (OPTIONAL)
# ========================================
NEXT_PUBLIC_ENABLE_SMS=${config.NEXT_PUBLIC_ENABLE_SMS || 'false'}
TWILIO_ACCOUNT_SID=${config.TWILIO_ACCOUNT_SID || ''}
TWILIO_AUTH_TOKEN=${config.TWILIO_AUTH_TOKEN || ''}
TWILIO_PHONE_NUMBER=${config.TWILIO_PHONE_NUMBER || ''}

# ========================================
# SECURITY CONFIGURATION
# ========================================
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
ENABLE_SECURITY_HEADERS=true

# ========================================
# FEATURE FLAGS
# ========================================
NEXT_PUBLIC_ENABLE_VOICE_SEARCH=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
`;

    const filePath = path.join(process.cwd(), filename);
    fs.writeFileSync(filePath, envContent);
    log(`✅ Environment file created: ${filename}`, 'green');
}

// ========================================
// INTERACTIVE SETUP
// ========================================

async function interactiveSetup() {
    log('\n🔐 Napa Valley Wineries - Environment Setup', 'cyan');
    log('==========================================\n', 'cyan');

    const config: EnvConfig = {};

    // Generate JWT Secret
    log('🔑 Generating JWT Secret...', 'yellow');
    config.JWT_SECRET = generateJwtSecret();
    log(`   Generated: ${config.JWT_SECRET.substring(0, 10)}...`, 'green');

    // Quick setup or detailed
    log('\n📝 Configuration Options:', 'yellow');
    log('   1. Quick Setup (Development)', 'white');
    log('   2. Production Setup (Detailed)', 'white');
    log('   3. Generate Secrets Only\n', 'white');

    return config;
}

// ========================================
// MAIN FUNCTION
// ========================================

async function main() {
    try {
        log('\n🚀 Starting Environment Setup Helper\n', 'bright');

        // Check if .env.local already exists
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            log('⚠️  .env.local already exists!', 'yellow');
            log('   This script will create .env.local.new to avoid overwriting.\n', 'yellow');
        }

        // Generate secrets
        log('🔐 Generating Secure Secrets\n', 'cyan');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

        const jwtSecret = generateJwtSecret();
        const csrfSecret = generateCsrfSecret();

        log(`\n✅ JWT_SECRET (copy to .env.local):`, 'green');
        log(`   ${jwtSecret}\n`, 'bright');

        log(`✅ CSRF_SECRET (optional, for future use):`, 'green');
        log(`   ${csrfSecret}\n`, 'bright');

        // Validation checks
        log('🔍 Checking Current Configuration\n', 'cyan');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

        const checks = [
            {
                name: 'JWT_SECRET',
                value: process.env.JWT_SECRET,
                required: true,
                validator: (v: string) => v && v.length >= 32,
            },
            {
                name: 'MONGODB_URI',
                value: process.env.MONGODB_URI,
                required: true,
                validator: validateMongoUri,
            },
            {
                name: 'NEXT_PUBLIC_APP_URL',
                value: process.env.NEXT_PUBLIC_APP_URL,
                required: true,
                validator: validateUrl,
            },
            {
                name: 'EMAIL_FROM',
                value: process.env.EMAIL_FROM,
                required: true,
                validator: validateEmail,
            },
            {
                name: 'STRIPE_SECRET_KEY',
                value: process.env.STRIPE_SECRET_KEY,
                required: false,
                validator: (v: string) => !v || v.startsWith('sk_'),
            },
        ];

        let allValid = true;
        checks.forEach((check) => {
            const isSet = !!check.value;
            const isValid = check.value ? check.validator(check.value) : false;

            if (check.required) {
                if (!isSet) {
                    log(`❌ ${check.name}: NOT SET (REQUIRED)`, 'red');
                    allValid = false;
                } else if (!isValid) {
                    log(`⚠️  ${check.name}: SET but INVALID`, 'yellow');
                    allValid = false;
                } else {
                    log(`✅ ${check.name}: Valid`, 'green');
                }
            } else {
                if (isSet && isValid) {
                    log(`✅ ${check.name}: Valid (Optional)`, 'green');
                } else if (isSet && !isValid) {
                    log(`⚠️  ${check.name}: SET but INVALID (Optional)`, 'yellow');
                } else {
                    log(`ℹ️  ${check.name}: Not set (Optional)`, 'blue');
                }
            }
        });

        // Summary
        log('\n📊 Summary\n', 'cyan');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

        if (allValid) {
            log('✅ All required environment variables are configured!', 'green');
            log('   Your application is ready for deployment.\n', 'green');
        } else {
            log('⚠️  Some required environment variables are missing or invalid.', 'yellow');
            log('   Please update your .env.local file before deployment.\n', 'yellow');
        }

        // Next steps
        log('📝 Next Steps:\n', 'cyan');
        log('1. Copy the generated JWT_SECRET to your .env.local file', 'white');
        log('2. Configure missing required variables', 'white');
        log('3. Review the SECURITY-PERFORMANCE-GUIDE.md for details', 'white');
        log('4. Run: npm run dev to test your configuration\n', 'white');

        // Generate example .env file
        log('💡 Generating example configuration file...', 'yellow');
        generateEnvFile(
            {
                JWT_SECRET: jwtSecret,
                MONGODB_URI: 'mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>',
                NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
                EMAIL_PROVIDER: 'ethereal',
                EMAIL_FROM: 'noreply@napawineries.com',
            },
            '.env.example.generated'
        );

        log('\n✨ Setup complete!\n', 'green');
    } catch (error) {
        log(`\n❌ Error: ${error}`, 'red');
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

export { generateSecret, generateJwtSecret, validateEmail, validateUrl, validateMongoUri };
