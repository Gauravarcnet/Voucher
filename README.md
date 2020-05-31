# Voucher
Generate Voucher Coupons and Redeems

## install
    npm packages


### code struture 
    server.js server file
    app is our application file
    .env where all secret key 
    logs folder where i am creating files on date basis and storing logs for Voucher and updating 
    utils folder where utility function are written like authentication, applogger(for log), response, erro handling, response handling
    config folder where database file are there config i am storing(persistent data)

### Database 
    Mongoose client which  is running locally on 27017 by defalut

### server 
    is running on port by default 3000,  bt i am reading from .env file you can also change in .env file

### Email
    i am using nodemailer
    host:smtp

### Two component 
    
#### user
    where user signup api
        /signUp for signup whose is going to add voucher its like admin
        /login 

#### Jwt for authentication

#### Voucher
    where voucher pai
    voucher/create : Voucher Generation API (Its only authenticated api)(closed api)
    voucher/fetch : Get Vouchers API (open api)
    voucher/redeem : Voucher Redeem API (open api)


### postman Collection 
    link: https://www.getpostman.com/collections/6e7cd137027e32ace9f1

##### dump 
    folder have database collections for users and vouchers 

    




