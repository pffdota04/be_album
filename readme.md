# BACKEND
##### Bao gồm 1 server API và 3 node xử lý ảnh 

## USE DOCKER:
* create new image:   
```
// cd to repo
docker build -t mybe .
docker run -it --name "name-container" -p 5000:5000 mybe
```
* download exsit image (9fd161b):   
Link: https://drive.google.com/file/d/1h3ACKDbFTIZX5qbMq8jeytS3xWqsR7if/view?usp=sharing
```
docker load -i <path to docker image tar file>
```

## Manual way
Yêu cầu đã cài đặt **pm2** trước đó:
```
   npm i pm2 -g
```
Cd vào thư mục đã clone
```
   npm i
   npm start
```
Xem các node đã chạy:
```
   pm2 ls
   pm2 monit
```

Chúc bạn vui vẻ~
