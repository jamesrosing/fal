@echo off
echo Performing clean build...

echo Removing .next directory...
if exist .next (
  rmdir /s /q .next
)

echo Creating fresh .next directory...
mkdir .next

echo Setting permissions...
icacls .next /grant:r "%USERNAME%:(OI)(CI)F"

echo Running build with special options...
call npx next build --no-lint --no-mangling

echo Build process completed.
pause 