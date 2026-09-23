# Baiyen Music Player

本機 MP3 播放器，使用 React Native、Expo、TypeScript。

## 目錄
- resources/：你提供的原始參考資源。
- app/：手機 App 的原始碼與套件設定。
- app/App.tsx：第一個畫面及播放控制。
- app/app.json：App 名稱及原生設定。
- app/package.json：相依套件及可執行指令。
- app/assets/audio/sample.mp3：由 resources/-0308.mp3 複製的本機測試音檔。

## Windows 啟動
```powershell
cd C:\Users\WANGEDS\Documents\Codex\baiyen_music_player\app
npm.cmd install
npm.cmd start
```

iPhone 與電腦連接同一個區域網路，使用相容的 Expo Go 掃描終端機 QR code。
Expo Go 版本需與 package.json 中 Expo SDK 相容；若不相容，需要升級測試容器或建立 development build。
Windows 不能執行 iOS 模擬器，請使用實體 iPhone。

## 開發概念
App 是 React component：回傳 JSX 描述畫面。
useAudioPlayer 管理原生播放器的生命週期。
useAudioPlayerStatus 訂閱播放狀態，狀態改變時 React 更新畫面。
修改畫面文字並儲存後，開發中的 App 會透過 Fast Refresh 更新。
Node.js 在電腦執行開發工具，音檔播放則在手機上執行。

## 驗證
```powershell
npm.cmd run typecheck
npx.cmd expo export --platform ios
```
iOS 匯出只驗證 JavaScript 與資源打包，不代表已完成原生編譯或真機測試。

## 里程碑
1. 範例 MP3 播放、暫停、重播與時間顯示。
2. 從 iOS 檔案選擇器匯入 MP3，複製到持久儲存。
3. 音樂庫、播放清單與排序持久化。
4. 背景播放、鎖定畫面控制及獨立安裝版本。

目前已完成第二階段的匯入、音樂庫與播放清單，操作與驗收方式見下方。
MP3 透過 .gitignore 排除，避免把私人音檔加入版本控制。
新環境請手動放入 app/assets/audio/sample.mp3 才能執行這個範例。

## 音樂庫與播放清單（第二階段）
- 匯入 MP3：iOS 檔案選擇器支援多選，檔案複製至 App Documents/music。
- 歌曲名稱先取自檔名，尚未解析 ID3 封面與歌手。
- 音樂庫支援搜尋、選曲播放與刪除；刪除會同步移除所有清單中的歌曲參照。
- 播放清單支援建立、改名、刪除、加入／移除歌曲、上移／下移及依序播放。
- 依序播放使用開始播放時的歌曲順序；調整清單後再按「依序播放」套用新順序。
- 音樂庫及清單透過 AsyncStorage 保存，歌曲使用相對檔名，重新啟動時解析目前 Documents 路徑。
- 匯入失敗會顯示失敗檔案；保存失敗會回收本次匯入的副本，不覆蓋先前音樂庫。
- 同一檔案重複匯入會成為獨立歌曲，目前不做內容去重。
- 範例音檔保留在播放器，尚未匯入時仍可播放；它不屬於使用者音樂庫。
- 本機資料可跨 App 重啟保留，但刪除 Expo Go／App 或清除其資料不保留；不是雲端備份。

### 手機驗收
1. 匯入兩個 MP3，確認名稱、大小和聲音；取消匯入不改變音樂庫。
2. 搜尋歌曲，選曲播放並切換上一首／下一首。
3. 建立清單，勾選歌曲、改名、排序，按依序播放確認順序。
4. 從清單移除歌曲，確認音樂庫仍可播放。
5. 完全關閉 Expo Go，再開啟相同專案，確認歌曲及清單保留並可播放。
6. 從音樂庫刪除歌曲，確認所有清單同步移除；來源 MP3 仍存在。
7. 刪除清單，確認音樂庫歌曲不受影響。

### 本輪驗證
TypeScript 型別檢查、資料模型測試與 iOS JavaScript／音檔匯出。
沙箱無法啟動 Hermes 編譯器，匯出驗證使用 --no-bytecode；真機檔案選取與重啟保存需在 iPhone 驗收。


## 播放時喚醒與背景音訊
- 前景播放時保持螢幕喚醒；暫停、播放結束或切到背景時解除螢幕喚醒。
- 背景音訊已啟用 iOS audio background mode 與 Android media playback foreground service。
- 播放時註冊鎖定畫面媒體控制與歌曲名稱；使用 doNotMix 音訊模式。
- 不使用麥克風或背景錄音權限。
- 必須重新建置 APK／iOS 原生測試版；Expo Go 不能完整驗收這些原生設定。
- 真機驗收：前景超過自動鎖定時間仍亮屏；暫停後恢復鎖定；手動鎖屏及切換 App 超過 5 分鐘仍播放；鎖定畫面暫停／續播；背景跨曲播放及回到前景。
- 使用者強制結束 App 不屬於背景播放支援範圍；來電及其他 App 音訊可能造成系統中斷。

## 瀏覽器版
在 app 目錄執行 npm run web -- --port 8082，開啟 http://localhost:8082。
- 支援匯入 MP3、音樂庫名稱排序與搜尋、播放／暫停／重播、播放清單管理。
- src/storage.web.ts 使用 IndexedDB 保存音檔與資料；手機仍使用原本的檔案儲存方式。
- 資料屬於目前瀏覽器與網址，切換連接埠／瀏覽器不共用；清除網站資料或無痕模式可能失去資料。
- 音檔不會上傳伺服器。使用者首次選曲若受自動播放限制，請再按播放。
- 切換分頁後能否持續播放、鎖屏與螢幕喚醒取決於瀏覽器及作業系統；不保證與原生 App 相同。
- 發布：npx expo export --platform web，將 dist 作為靜態網站部署到 HTTPS 主機。
- dist/index.html 必須透過 HTTP(S) 伺服器開啟，不支援直接雙擊 file://。
