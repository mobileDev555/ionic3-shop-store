@echo on
cd /d "D:\TOOLS\android\android-sdk-windows\platform-tools"
call adb uninstall "com.wheresdaweed"
call adb install "D:\apks\wheredaweed.apk"
cd /d "D:\WEBS\wheredaweed\mapp"