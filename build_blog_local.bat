@echo off
echo Building blog-api docker image...
echo IMPORTANT: Building for Public URL: http://89.42.199.69/cms
docker build --platform linux/amd64 --build-arg PUBLIC_URL=http://89.42.199.69/cms -t blog-api-image ./blog-api

echo Saving image to blog-api.tar...
docker save -o blog-api.tar blog-api-image

echo Done! You can now transfer blog-api.tar and server_setup.sh to your server.
echo Use SCP or any other method. Example: scp blog-api.tar server_setup.sh user@89.42.199.69:/root/
pause
