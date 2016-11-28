# clean previous
rm -rf build

# create folder
mkdir build

# copy files
cp *.coffee build
cp *.json build

cd build

# pre-process
coffee -c .

# fetch deps
npm install

# package
rm *.coffee
7z a out.zip .

# clean up
rm -rf node_modules
rm *.js*


