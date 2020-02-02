@echo on
cd /d "D:\WEBS\wheredaweed\mapp"
call ionic cordova build android --release
del "D:\apks\wheredaweedr.apk"
copy "D:\WEBS\wheredaweed\mapp\platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk" "D:\apks\wheredaweedr.apk"
call jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore "D:\TOOLS\Android\usmani.keystore" "D:\apks\wheredaweedr.apk" tepia2
del "D:\apks\wheredaweed.apk"
cd /d "D:\TOOLS\android\android-sdk-windows\build-tools\27.0.3"
call zipalign -v 4 "D:\apks\wheredaweedr.apk" "D:\apks\wheredaweed.apk"
cd /d "D:\WEBS\wheredaweed\mapp"
IF "%1"=="--install" call install.bat