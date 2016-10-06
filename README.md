# Thread Site
A single thread style forum. 

### We are **live** at [ThreadSite.link](http://threadsite.link)

## Anonymous
We don't store any user identifying information. 
* No sign up requirement
* No IP logging
* No named posts

## Not Anonymous Gotchas
In order to provide usage information and revenue, we use [Google Analytics](https://www.google.com/analytics/) and [Google AdSense](https://www.google.co.nz/adwords/). 
Feel free to block these services, however it will eat at my revenue, so consider [donating a beer](https://www.changetip.com/tipme/michaelstanden). 

## Self Hosting
1. Download and Install [NodeJS](https://nodejs.org/) and [CoffeeScript](http://coffeescript.org/)
2. Create a MySQL database using the [database schema](https://github.com/ScreamingHawk/thread-site/tree/master/database)
3. Update the [configuration file](https://github.com/ScreamingHawk/thread-site/blob/master/server/config.json) to point to your database
4. In [server](https://github.com/ScreamingHawk/thread-site/tree/master/server), compile the coffeescript using `coffee -c .` and install dependencies using `npm install`
5. Run the server side using `npm start`
6. Open the [client side HTML](https://github.com/ScreamingHawk/thread-site/blob/master/public/index.html) in your [browser of choice](https://www.google.com/chrome/)
  * Note: When using the `file:` protocol to access the client side, the server will point at localhost
7. Read the `Other Stuff to Note` below

## Web Hosting
1. Create a MySQL database using the [database schema](https://github.com/ScreamingHawk/thread-site/tree/master/database)
2. Update the [configuration file](https://github.com/ScreamingHawk/thread-site/blob/master/server/config.json) to point to your database
3. Build the server side microservices using the [build script](https://github.com/ScreamingHawk/thread-site/blob/master/server/build.bat)
4. Upload each microservice to an [AWS Lambda](https://aws.amazon.com/lambda/) instance
5. Configure an [AWS API Gateway](https://aws.amazon.com/api-gateway/) to point to each microserver as per the [swagger definition](https://github.com/ScreamingHawk/thread-site/blob/master/deploy/swagger.json)
6. Upload the [public folder](https://github.com/ScreamingHawk/thread-site/blob/master/public) to an [AWS S3](https://aws.amazon.com/s3/) bucket, and [configure it for static website hosting](http://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html)
7. (Optional) Point your [domain name](https://aws.amazon.com/route53/) to the bucket URL
8. Read the `Other Stuff to Note` below

## Other Stuff to Note
* As per the MIT license, you **must** retain my credits when using this software
* Remove/Change the Google Analytics for your purposes
* Remove/Change the Google AdSense for your purposes

## Credits
[Michael Standen](http://michael.standen.link)

This software is provided under the [MIT License](https://tldrlegal.com/license/mit-license) so it's free to use so long as you give me credit. 

That being said, if you like the service you can [donate a beer](https://www.changetip.com/tipme/michaelstanden). 
