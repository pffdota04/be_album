# BACKEND

### DOCKER:
-> cd to repo
```
docker build -t mybe .

docker run -it --name "name-container" -p 5000:5000 mybe
```

### Bao gồm 1 server API và 3 node xử lý ảnh 
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
