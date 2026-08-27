"use client";

import Image from "next/image";
import styles from "./Helper.module.scss";
import dogIcon from "@/assets/img/dog.png";
import useAiChat from "@/hooks/useAiChat";
import useHelperDialog from "@/hooks/useHelperDialog";

// 智能助手组件：悬浮小狗图标 + AI 回复气泡 + 提问对话框
export default function Helper() {
  // AI 聊天 Hook：回复文案 + 接口请求逻辑
  const { aiReply, fetchAiReply } = useAiChat();
  // 对话框 Hook：显隐、输入、提交（提交时回调 fetchAiReply 发请求）
  const {
    dialogVisible,
    inputValue,
    openDialog,
    closeDialog,
    handleInputChange,
    handleSubmit,
  } = useHelperDialog(fetchAiReply);

  return (
    <div className={styles.helperView}>
      <div className={styles.helperIconView} onClick={openDialog}>
        {/* 直接传入静态图片对象：其自带 width/height，可避免“missing width property”报错 */}
        <Image src={dogIcon} alt="" />
      </div>
      <div className={styles.helperSayView}>{aiReply}</div>
      {dialogVisible && (
        <div className={styles.helperDialogMask} onClick={closeDialog}>
          <div className={styles.helperDialog} onClick={(e) => e.stopPropagation()}>
            <textarea
              className={styles.helperDialogTextarea}
              placeholder="输入你想问的问题…"
              value={inputValue}
              autoFocus
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <div className={styles.helperDialogButtons}>
              <button
                className={`${styles.helperDialogBtn} ${styles.cancel}`}
                onClick={closeDialog}
              >
                取消
              </button>
              <button
                className={`${styles.helperDialogBtn} ${styles.send}`}
                onClick={handleSubmit}
              >
                发送
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
