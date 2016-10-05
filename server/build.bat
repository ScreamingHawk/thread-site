rem clean previous
rd /s /q build\

rem create folder
mkdir build

rem copy files
copy *.coffee build\
copy *.json build\

cd build

rem pre-process
call coffee -c .

rem fetch deps
call npm install

rem package
del /s /q *.coffee
7z a out.zip .

rem clean up
rd /s /q node_modules
del /s /q *.js*


