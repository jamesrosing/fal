@echo off
echo Creating media directory structure...

REM Create main media directories
mkdir "public\images\global" 2>nul
mkdir "public\images\global\logos" 2>nul
mkdir "public\images\global\icons" 2>nul
mkdir "public\images\global\ui" 2>nul

mkdir "public\images\pages" 2>nul
mkdir "public\images\pages\home" 2>nul
mkdir "public\images\pages\about" 2>nul
mkdir "public\images\pages\services" 2>nul
mkdir "public\images\pages\team" 2>nul

mkdir "public\videos" 2>nul
mkdir "public\videos\backgrounds" 2>nul
mkdir "public\videos\content" 2>nul

REM Create service category directories
mkdir "public\images\pages\services\plastic-surgery" 2>nul
mkdir "public\images\pages\services\dermatology" 2>nul
mkdir "public\images\pages\services\medical-spa" 2>nul
mkdir "public\images\pages\services\functional-medicine" 2>nul

REM Create plastic surgery subdirectories
mkdir "public\images\pages\services\plastic-surgery\body" 2>nul
mkdir "public\images\pages\services\plastic-surgery\breast" 2>nul
mkdir "public\images\pages\services\plastic-surgery\head-and-neck" 2>nul

REM Create body procedure subdirectories
mkdir "public\images\pages\services\plastic-surgery\body\abdominoplasty" 2>nul
mkdir "public\images\pages\services\plastic-surgery\body\mini-abdominoplasty" 2>nul
mkdir "public\images\pages\services\plastic-surgery\body\liposuction" 2>nul
mkdir "public\images\pages\services\plastic-surgery\body\arm-lift" 2>nul
mkdir "public\images\pages\services\plastic-surgery\body\thigh-lift" 2>nul

REM Create breast procedure subdirectories
mkdir "public\images\pages\services\plastic-surgery\breast\breast-augmentation" 2>nul
mkdir "public\images\pages\services\plastic-surgery\breast\breast-reduction" 2>nul
mkdir "public\images\pages\services\plastic-surgery\breast\breast-revision" 2>nul
mkdir "public\images\pages\services\plastic-surgery\breast\breast-nipple-areolar-complex" 2>nul

REM Create head and neck procedure subdirectories
mkdir "public\images\pages\services\plastic-surgery\head-and-neck\face" 2>nul
mkdir "public\images\pages\services\plastic-surgery\head-and-neck\eyelids" 2>nul
mkdir "public\images\pages\services\plastic-surgery\head-and-neck\ears" 2>nul
mkdir "public\images\pages\services\plastic-surgery\head-and-neck\nose" 2>nul
mkdir "public\images\pages\services\plastic-surgery\head-and-neck\neck" 2>nul

echo Structure created successfully!
