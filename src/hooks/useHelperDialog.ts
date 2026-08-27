import { useState } from "react";
import type { ChangeEvent } from "react";

// 自定义 Hook：智能助手对话框——管理显隐、输入内容与提交
export default function useHelperDialog(onSubmit: (text: string) => void) {
  // 对话框是否可见 / 输入内容
  const [dialogVisible, setDialogVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // 打开对话框
  const openDialog = () => setDialogVisible(true);
  // 关闭对话框
  const closeDialog = () => setDialogVisible(false);
  // 输入内容变化
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setInputValue(e.target.value);

  // 提交：非空校验、关闭对话框、清空输入并触发外部请求回调
  const handleSubmit = () => {
    const text = inputValue.trim();
    if (!text) return;
    setDialogVisible(false);
    setInputValue("");
    onSubmit(text);
  };

  return {
    dialogVisible,
    inputValue,
    openDialog,
    closeDialog,
    handleInputChange,
    handleSubmit,
  };
}
