import os
import sys

def batch_rename():
    # 1. 強制取得「這個程式檔案」所在的資料夾路徑，而不是執行指令的路徑
    # 這樣可以確保你把程式丟進哪個資料夾，它就只處理那個資料夾
    target_folder = os.path.dirname(os.path.abspath(__file__))
    
    print("-" * 50)
    print(f"正在處理資料夾: {target_folder}")
    print("-" * 50)

    # 2. 詢問使用者想要的前綴
    prefix = input("請輸入想要的檔名開頭 (例如 robot): ").strip()
    if not prefix:
        print("未輸入名稱，程式結束。")
        input("按 Enter 離開...")
        return

    # 3. 取得所有圖片檔案
    valid_extensions = ('.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG')
    
    # 取得檔案列表
    all_files = os.listdir(target_folder)
    files = [f for f in all_files if f.endswith(valid_extensions)]
    
    # 排除這個 script 本身
    script_name = os.path.basename(__file__)
    if script_name in files:
        files.remove(script_name)

    # 排序檔案
    files.sort()

    # --- 關鍵修改：顯示找到的檔案資訊，讓使用者除錯 ---
    count = len(files)
    print(f"\n偵測到 {count} 個圖片檔。")
    
    if count == 0:
        print("沒有找到圖片！請確定你把這個程式放進了裝有照片的資料夾 (例如 robot 資料夾) 裡面。")
        input("按 Enter 離開...")
        return

    print("預覽找到的前 5 個檔案:")
    for f in files[:5]:
        print(f" - {f}")
    if count > 5:
        print(f" ... 以及其他 {count - 5} 個檔案")
    
    print("-" * 50)
    
    # 4. 確認執行
    confirm = input(f"確定要將這 {count} 個檔案重新命名為 {prefix}-1.jpg 到 {prefix}-{count}.jpg 嗎? (y/n): ")

    if confirm.lower() != 'y':
        print("已取消操作。")
        input("按 Enter 離開...")
        return

    # 5. 開始重新命名
    renamed_count = 0
    for index, filename in enumerate(files):
        extension = os.path.splitext(filename)[1].lower()
        if extension == '.jpeg':
            extension = '.jpg'

        new_name = f"{prefix}-{index + 1}{extension}"
        
        # 組合完整路徑
        old_path = os.path.join(target_folder, filename)
        new_path = os.path.join(target_folder, new_name)
        
        if filename == new_name:
            continue

        try:
            os.rename(old_path, new_path)
            # 只顯示前幾個成功的訊息，避免洗版
            if index < 5:
                print(f"成功: {filename} -> {new_name}")
            renamed_count += 1
        except Exception as e:
            print(f"失敗: {filename} -> {e}")

    if renamed_count > 5:
        print(f"... (其餘 {renamed_count - 5} 個檔案已更名)")

    print("-" * 50)
    print(f"完成！共處理 {renamed_count} 張照片。")
    print(f"現在共有 {prefix}-1 到 {prefix}-{len(files)}")
    input("按 Enter 離開...")

if __name__ == "__main__":
    batch_rename()