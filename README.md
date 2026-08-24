# 孕產婦健康管理系統
- 輔仁大學 醫學資訊與創新應用學士學位學程
- 專題成員：蕭閔薰、簡婕恩、徐智萱
- 指導老師：賴來勳主任、黃建中組長
- 開發期間：2025/09~2026/06
## 專題動機
### 背景 
孕婦在懷孕期間約需經歷40週的生理變化，為了確保媽媽和嬰兒的健康，必須進行定期的醫院回診與健康紀錄，在標準的產檢作業流程中，通常由護理人員進行初步問診開始（如媽媽教室），協助收集並記錄孕婦的最後一次月經(LMP)、第幾胎等，並計算出預產期(EDC)，接著醫師會依照孕週產檢進行對應的身體檢查、超音波測量，並參考各項紀錄判斷胎兒的發育與孕婦的健康狀況。而這些產檢資料會記錄在台灣衛生福利部發行的「孕婦健康手冊」(媽媽手冊)中，它長期扮演記錄孕期資訊的重要角色，也是孕婦與醫護之間的溝通工具。 
### 動機 
目前臺中榮民總醫院的產檢流程中，孕產婦需在看診前，前往特定地點（如醫院哺乳室中的電腦）填寫自我評估表單，對於許多孕產婦來說不僅填寫流程耗時且容易耽誤看診。此外目前醫院提供的產檢資訊及衛教資訊皆以宣傳單(紙張)為主，且缺乏依照懷孕週數的個別化服務，容易造成紙本資料保存不易、查閱不便等問題。因此主要是希望改善上述需求，其次是提供孕產婦更便利的產檢流程及取得較完整的懷孕相關資訊。本專題致力於將繁瑣的行政與健康管理流程電子化。
***
## 專題簡介
- 使用對象：於臺中榮民總醫院之接受產檢的孕婦 
- 專題目標：希望改善孕期中繁瑣的行政與健康管理流程，透過電子化與RWD（Responsive Web Design，響應式網頁設計），提供一站式的數位服務。主要功能涵蓋產檢報告即時查閱、依週數推播的產檢日期與衛教資訊提醒、孕產婦心理健康的線上評估與追蹤以及行事曆功能。藉此，系統能有效地協助孕產婦全程掌握身心健康狀態，大幅提升孕期管理的效率與舒適度。
***
## 系統功能
本系統針對孕產婦需求，規劃了以下六大核心功能： 
1. 登入登出
     1. 登入資料為身分證字號與手機號碼
     2. 登入驗證成功會傳送一次性驗證碼（OTP）到Gmail，並跳轉至驗證碼頁面，驗證成功後即可進入首頁
     3. 若未完成輸入登入資料或是填寫錯誤資料，輸入框會變紅框，並顯示提示詞 
2. 首頁與通知 
    1. 畫面左側為寶寶成長示意圖，依據妊娠週數，以水果圖示視覺化呈現寶寶的大小，並顯示預產期倒數天數。
    2. 畫面右側為行事曆，與孕育時光表連動
    3. 登入後自動彈窗提醒即將到來的產檢日程及衛教資訊提醒。 
3. 產檢專區
     1. 提供孕產婦線上查閱歷史產檢紀錄及報告，包含就診日期、妊娠週數、體重、血壓及尿液檢查數據等，取代傳統紙本紀錄，方便隨時掌握身體數值。 
4. 衛教資訊專區 
    1. 系統會「依據懷孕週數」自動推播對應使用者懷孕週數的孕期衛教、產檢衛教，以及產後照護資訊。
    2. 提供關鍵字搜尋與篩選功能，讓孕婦能快速找到所需的健康資訊。 
5. 自我評估專區 
    1. 將「產前健康照護衛教指導紀錄表」與「愛丁堡產後憂鬱量表」電子化，孕婦可於候診時用手機填寫，避免佔用到看診、檢查時間。方便醫院端追蹤孕產婦的心理狀況。
    2. 將顯示歷史填寫紀錄及填寫內容，紀錄填寫內容變化。 
6. 孕育時光表（行事曆與日記）
    1. 結合行事曆功能，自動帶入產檢行程，協助孕媽媽紀錄與查看檢查時程。
    2. 提供撰寫日記功能，孕婦可上傳超音波照片或生活照，記錄懷孕期間的心情與身體變化
***
## 系統架構
我們系統採Client-Server架構，由前端客戶端(client)與後端伺服器端(server)兩部分組成。客戶端會負責使用者介面與輸入，伺服器則是負責資料的處理與回應。 

1. **前端(Frontend/Client Side)** 
- 提供使用者介面，讓使用者可以輸入資料、進行操作。 
- 可以使用網頁瀏覽器作為前端平台。 
- 負責將使用者輸入的資料傳送給後端伺服器，並且呈現伺服器回傳的結果。 
- 技術：HTML、CSS、JS、Vue.js 

2. **後端(Backend/Server Side)**
- 負責接收、處理來自客戶端的請求，包含身分驗證(JWT) 、邏輯處理、資料存取、提供RESTful API。 
- 技術：Node.js + Express 

3. **資料庫 (database)**
- 用來儲存使用者資訊、系統設定與其他相關資料。 
- 由伺服器端透過SQL進行操作。 
- 使用MySQL
***
## 專案結構
```text
MaternalHealthManagementSystem/
│
├── back-end/                    # 後端服務（一）
│   ├── middleware/              # 驗證與請求處理 Middleware
│   ├── db.js                    # 資料庫連線
│   ├── server.js                # 後端伺服器啟動程式
│   ├── package.json
│   └── package-lock.json
│
├── backend/                     # 後端服務（二）
│   ├── controllers/             # API / 業務邏輯
│   ├── db/                      # 資料庫相關模組
│   ├── middleware/              # Middleware
│   ├── index.js                 # 後端程式進入點
│   ├── package.json
│   └── package-lock.json
│
├── back_end/                    # 後端服務（三）
|   ├── middleware/              # Middleware
|   ├── db.js                    # 資料庫連線
|   ├── server.js                # 後端伺服器啟動程式
│   ├── package.json
│   └── package-lock.json
│
├── src/                         # 前端主要程式碼
│
├── public/                      # 靜態資源
│
├── temp/                        # 專案暫存資料
│
├── .vscode/                     # VS Code 開發環境設定
├── index.html                   # 前端頁面入口
├── index.js                     # JavaScript 入口
├── package.json                 # 前端套件與專案設定
├── package-lock.json            # npm 套件版本鎖定
├── vite.config.js               # Vite 開發環境設定
├── .gitignore                   # Git 忽略檔案設定
└── README.md                    # 專案說明文件
```
***
## 使用技術、工具與軟體 
| 類別 | 技術、工具 |
|---|---|
| 前端 | HTML、CSS、JS、Vue.js| 
| 後端 | Node.js、Express、JWT | 
| 資料庫 | MySQL | 
| 版本控制 | GitHub | 
| 設計工具 | Canva、Whimsical、Draw.io | 
| 開發環境 | Visual Studio Code | 
| 建模工具 | Astah UML | 
| 其他 | Cloudinary（雲端媒體管理平台）AI工具(Claude、Gemini、ChatGPT) | 
| AI 輔助工具 | Claude、Gemini、ChatGPT | 
***
## Demo

***
## 系統畫面
#### 登入資料輸入
<img width="798" height="374" alt="image" src="https://github.com/user-attachments/assets/442df7bc-adee-4a39-8730-d36c3b256fe5" />

#### 驗證信件
<img width="805" height="326" alt="image" src="https://github.com/user-attachments/assets/a2c8d9f9-0757-43b8-a3d7-1391dd41c293" />

#### 通知
<img width="865" height="412" alt="image" src="https://github.com/user-attachments/assets/504474a2-d76b-47c8-aa71-2a722002f461" />

#### 首頁
<img width="865" height="412" alt="image" src="https://github.com/user-attachments/assets/881d1cfe-2c01-4cc7-bce0-4e6daeb02ab3" />

#### 個人資料
<img width="865" height="411" alt="image" src="https://github.com/user-attachments/assets/cfa21575-6aa1-4dd1-b5fc-8f937ff6eed7" />

#### 產檢資料專區
<img width="865" height="411" alt="image" src="https://github.com/user-attachments/assets/9fed7fa7-3051-4ecd-bf9b-63858b7fde08" />

#### 衛教資訊專區
<img width="864" height="469" alt="image" src="https://github.com/user-attachments/assets/7cdd7fb4-fbd0-49d1-b706-051e69cdaa17" />
<img width="864" height="480" alt="image" src="https://github.com/user-attachments/assets/2d0f137f-e40d-4a25-9da8-296022146583" />
<img width="864" height="478" alt="image" src="https://github.com/user-attachments/assets/7c2f7a8e-adf9-46a4-a055-bbcdb15948e8" />



#### 自我評估專區
<img width="864" height="466" alt="image" src="https://github.com/user-attachments/assets/7aacb436-20e3-4cbc-b125-ee969096fcad" />
<img width="864" height="475" alt="image" src="https://github.com/user-attachments/assets/fe9fa54d-3962-4bf7-ae28-fbce615f1e3d" />
<img width="864" height="458" alt="image" src="https://github.com/user-attachments/assets/97b04c62-5166-415c-94a4-82995a3c4f2b" />



#### 孕育時光表
<img width="865" height="471" alt="image" src="https://github.com/user-attachments/assets/365b04b5-d264-4c8a-b32f-457c81e26043" />
<img width="865" height="464" alt="image" src="https://github.com/user-attachments/assets/39a677d6-18e2-4720-b780-0d31b60e6379" />
<img width="865" height="466" alt="image" src="https://github.com/user-attachments/assets/be38f9bb-03e9-4e97-8176-faa182e60e0c" />
<img width="855" height="435" alt="image" src="https://github.com/user-attachments/assets/58540ea3-31aa-4a78-99e5-f48b7225688f" />


***
## 團隊成員
本專題由3人共同開發，系統功能由團隊共同討論與設計，實作階段則依功能模組進行分工，各自負責不同功能的開發與整合。 
| 成員 | 負責部分 |
|---|---|
|蕭閔薰 | 孕育時光表、首頁行事曆 |
|簡婕恩 | 登入、首頁、產檢資料專區、個人資料 |
|徐智萱 | 衛教專區、自我評估專區 |
### 我的主要貢獻
主要負責「孕育時光表」模組，以及部分共用系統功能的開發與整合，具體工作包含：
- **孕育時光表功能開發**
  - 負責行事曆與日記系統的設計與功能開發，包含年月選擇器、切換年月、回到當天日期等基本操作
  - 實作行程、日記新增、修改、刪除等CRUD操作
  - 整合產檢行程與行事曆功能
  - 實作日記圖片上傳功能，並整合Cloudinary進行圖片儲存與管理

- **前端功能與介面整合**
  - 負責首頁行事曆與「孕育時光表」專區的連動
  - 統一兩個功能的操作方式與呈現內容
  - 負責通知畫面設計與部分通知功能實作，例如衛教閱讀提醒

- **後端與資料庫開發**
  - MySQL資料庫建置與相關資料表設計
  - 建立RESTful API，進行前後端資料串接與整合
  - 參與JWT驗證機制建置，並協助登入流程整合
***
## 專題成果
本專題歷經一學年的規劃與開發，從需求分析、系統設計、前端介面設計，到資料庫建置、後端開發、API串接與系統整合，逐步完成孕產婦健康照護管理系統。
### 第一學期｜需求分析與系統設計
第一學期主要完成系統的需求分析與系統設計，並依據功能需求完成前端介面設計與實作，包含：
- 產檢紀錄專區
- 衛教資訊專區
- 自我評估專區
- 孕育時光表
透過前端介面的實作，建立完整的操作流程與使用情境，並作為後續資料庫設計與後端系統開發的基礎。
在此階段，我們也透過需求分析、訪談與情境模擬，了解孕產婦於不同孕期階段的健康照護需求，進一步進行系統功能規劃，使我們理解系統開發除了程式實作外，也需要透過完整的需求分析與系統設計，確保功能符合實際使用需求。
### 第二學期｜全端開發與系統整合
第二學期承接第一學期完成的前端介面，進一步完成：
- MySQL 資料庫建置與資料表設計
- Node.js+Express後端系統開發
- RESTful API建置
- 前後端資料串接
- 系統功能整合
- 使用者操作流程整合
透過前後端資料流的串接，系統已能支援產檢資料查閱、衛教資訊、心理健康評估、孕期行程與日記等功能，提供完整的孕產婦健康管理服務。
### 專題整體成果
經過一整學年的專題製作，我們完成了從「需求分析 → 系統設計 → 前端開發 → 資料庫建置 → 後端開發 → API 串接 → 系統整合」的完整開發流程。透過此次全端系統開發經驗，我們除了提升前後端開發、資料庫設計與系統整合的實作能力，也更加理解需求分析、文件規劃與團隊分工在專案開發中的重要性，並累積完整的專案開發經驗，為後續進行資訊系統與軟體專案開發奠定基礎。
***
## 未來展望
- **行事曆整合**  
  整合手機原生行事曆服務，例如iOS行事曆與Google日曆，使孕產婦能將產檢行程與原有生活行程整合，減少不同平台間切換與查閱的需求。
- **孕期健康狀況紀錄**  
  新增孕期身體狀況紀錄功能，讓使用者能記錄害喜、頭暈、胎動、抽筋等孕期常見狀況，並累積個人健康紀錄，未來可於回診時提供醫師作為參考。
- **健康食譜專區**  
  新增健康食譜專區，以資訊分享與討論的形式提供孕期相關飲食資訊，並開放使用者分享健康食譜，建立孕產婦之間的資訊交流空間。
- **智慧聊天機器人**  
  導入聊天機器人，協助使用者即時查詢與理解衛教資訊，降低資訊搜尋成本，並提供更即時的資訊互動方式。
***
## 聲明
本專題為大學課程之學術專題作品，主要目的為學習資訊系統之需求分析、系統設計、前後端開發、資料庫建置與系統整合。
本系統所提供之健康資訊與相關功能僅作為專題展示與學術研究用途，**不作為正式醫療診斷、治療或醫療建議之依據**。

This project is developed for academic and educational purposes only.  
The information and functions provided by this system are for demonstration purposes and should not be considered a substitute for professional medical advice, diagnosis, or treatment.
