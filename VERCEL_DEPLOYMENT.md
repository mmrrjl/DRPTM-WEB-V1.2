# Vercel Deployment Guide

## Environment Variables Configuration

Untuk mengatasi masalah koneksi ke Antares API di Vercel, Anda perlu mengatur environment variables berikut di Vercel Dashboard:

### 1. Buka Vercel Dashboard
1. Login ke [vercel.com](https://vercel.com)
2. Pilih project Anda
3. Pergi ke **Settings** > **Environment Variables**

### 2. Tambahkan Environment Variables

#### Required Variables:
```
NODE_ENV=production
```

#### Antares IoT Platform Variables:
```
ANTARES_API_KEY=your_antares_access_key_here
ANTARES_APPLICATION_ID=your_application_name
ANTARES_DEVICE_ID=your_device_name
```

#### Optional Variables:
```
PORT=5000
SESSION_SECRET=your_session_secret_key
```

### 3. Cara Mendapatkan Antares Credentials

1. **Login ke Antares Dashboard**: https://platform.antares.id
2. **API Key**: 
   - Pergi ke "Access Key" di dashboard
   - Copy Access Key Anda
3. **Application ID**: 
   - Nama aplikasi yang Anda buat di Antares
   - Contoh: "hidro_try"
4. **Device ID**: 
   - Nama device yang terdaftar di aplikasi
   - Contoh: "lynk32_hidro_try"

### 4. Update CORS Configuration

Setelah deploy, update file `server/index.ts` baris 12:
```typescript
origin: process.env.NODE_ENV === 'production' 
  ? ['https://your-actual-vercel-domain.vercel.app'] // Ganti dengan domain Vercel Anda
  : ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5000'],
```

### 5. Testing Koneksi

Setelah environment variables dikonfigurasi:

1. **Redeploy** aplikasi di Vercel
2. **Test API endpoint**: `https://your-app.vercel.app/api/sync-antares`
3. **Check logs** di Vercel Dashboard > Functions > View Function Logs

### 6. Troubleshooting

#### Jika masih tidak bisa connect:

1. **Check Environment Variables**:
   ```bash
   # Test di local dengan .env file
   ANTARES_API_KEY=your_key
   ANTARES_APPLICATION_ID=your_app
   ANTARES_DEVICE_ID=your_device
   ```

2. **Check Antares API URL**:
   - Pastikan URL benar: `https://platform.antares.id:8443/~/antares-cse/antares-id`
   - Test dengan Postman atau curl

3. **Check Network Issues**:
   - Vercel mungkin memblokir koneksi ke port 8443
   - Coba gunakan port 443 (HTTPS standard)

4. **Enable Debug Logging**:
   - Check Vercel function logs untuk error details
   - Aplikasi akan fallback ke demo data jika API tidak tersedia

### 7. Demo Mode

Jika Antares API tidak tersedia, aplikasi akan otomatis menggunakan demo data untuk testing UI dan functionality.

## Deploy Commands

```bash
# Deploy ke Vercel
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs your-deployment-url
```
