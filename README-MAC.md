# 在 Mac 使用一般 Apple 帳號安裝到 iPhone

這是 2026-09-25 從目前專案複製的原始碼交接包，並非已簽署 IPA。包含 MP3 匯入、音樂庫、播放清單、名稱排序、觸控進度條及背景音訊設定。未在 Mac 編譯或完成 iPhone 實機驗證。

## 1. 準備 Mac

安裝支援目前 Expo / React Native 版本的 Xcode（含 iOS 平台）、Node.js 24 LTS 與 CocoaPods。第一次開啟 Xcode，完成授權及額外元件安裝。在 Xcode > Settings > Locations 選擇 Command Line Tools。若建置要求較新 Xcode，先更新 Xcode 及必要的 macOS。

## 2. 產生 iOS 專案

解壓縮後，在 Mac 終端機輸入 cd 加空格，把這個包裡的 app 資料夾拖進終端機，再按 Enter。執行：

```sh
npm ci
npm run typecheck
npm test
npx expo prebuild --platform ios
open ios/*.xcworkspace
```

若 CocoaPods 安裝失敗，先處理終端機顯示的 CocoaPods 錯誤，再重新執行 prebuild。

## 3. 設定免費簽署

1. Xcode > Settings > Accounts，加入自己的 Apple 帳號。不要把密碼傳給其他人。
2. 用 USB 連接並解鎖 iPhone，在手機上允許信任這台 Mac。
3. 在 Xcode 左側選專案，選 app 的 TARGETS > Signing & Capabilities。
4. 勾選 Automatically manage signing，Team 選擇你的 Personal Team。
5. 此交接包的 app.json 已設定 ios.bundleIdentifier 為 com.wangeds.baiyenmusicplayer。若顯示識別碼已被使用，改為你可用的唯一識別碼，並同步修改 app.json。
6. 按提示在 iPhone「設定 > 隱私權與安全性 > 開發者模式」啟用並重開機。

## 4. 安裝獨立執行版本

在 Xcode 選 Product > Scheme > Edit Scheme > Run > Info，將 Build Configuration 設為 Release。上方執行裝置選擇實體 iPhone，按 Run（播放三角形）。第一次建置需要一段時間。

若 iPhone 要求信任開發者，依提示到「設定 > 一般 > VPN 與裝置管理」信任自己的開發者身份。

完成後停止 Xcode 執行，再從 iPhone 桌面開啟 app，確認離開 Mac 及 Metro 也能播放匯入的音樂。

完成第一次 Xcode 簽署設定後，也可在 app 目錄使用：

```sh
npx expo run:ios --device --configuration Release
```

## 5. 驗證

重新匯入 MP3（獨立 app 不會共用 Expo Go 的音樂庫），測試播放、暫停、拖曳前後跳轉、播放清單、切到背景及鎖定螢幕播放。測試關閉並重開 app 後音樂庫仍保留。

## 免費帳號限制

Personal Team 的免費佈署效期為 7 天，到期需回 Mac 重新建置簽署。維持相同 Team 與 Bundle Identifier，盡量直接覆蓋安裝；不要先刪除 app，以免移除已匯入音樂。這個方式供個人裝置測試，不能用來透過 TestFlight 或 App Store 分發。

Apple 說明：https://developer.apple.com/support/compare-memberships/
Expo 本機建置：https://docs.expo.dev/guides/local-app-development/

本包不含 node_modules、私人 MP3、憑證、原生建置產物。原始 Windows 專案沒有被本次打包修改。
