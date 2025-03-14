@echo off
set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dyrzyfg3w
set CLOUDINARY_API_KEY=956447123689192
set CLOUDINARY_API_SECRET=zGsan0MXgwGKIGnQ0t1EVKYSqg0
node --loader ts-node/esm scripts/optimize-video.ts about-new about-hero
pause 