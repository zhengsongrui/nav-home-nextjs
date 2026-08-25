"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.scss";
import { Github, Code, ExternalLink, ChevronRight } from "lucide-react";
import type { ProjectsApiResponse } from "@/types/projects";

// 根据项目地址与实时在线状态，返回在线/离线/未上线文案
const adjustOnlineStatus = (
  url: string | undefined,
  online: boolean | undefined,
) => {
  if (url) {
    return online ? "在线" : "离线";
  } else {
    return "未上线";
  }
};

// 根据项目地址与实时在线状态，返回状态样式 key（online / offline / not-launched）
const getOnlineStatusKey = (
  url: string | undefined,
  online: boolean | undefined,
) => {
  if (url) {
    return online ? "online" : "offline";
  } else {
    return "not-launched";
  }
};

// 将写作状态映射为对应的样式类名
const formatWriteStatus = (writeStatus: string) => {
  switch (writeStatus) {
    case "已完成":
      return "completed";
    case "未开发":
      return "noDevelop";
    case "开发中":
      return "inProgress";
    case "维护中":
      return "maintenance";
    default:
      return "";
  }
};

export default function Home() {
  // 项目列表数据，初始为空数组
  const [projects, setProjects] = useState<ProjectsApiResponse["projects"]>([]);

  // 组件挂载后请求 /api/projects，获取项目信息与实时服务状态
  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data: ProjectsApiResponse) => setProjects(data.projects))
      .catch((err) => console.error("获取项目列表失败:", err));
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.navHeader}>
        <h1 className={styles.title}>
          <span className={styles.titleGradient}>导航页</span>
          <div className={styles.titleUnderline}></div>
        </h1>
        <div className={styles.subtitle}>快速访问我的项目与GitHub仓库</div>
        <div className={styles.headerGithubLink}>
          <a
            href="https://github.com/zhengsongrui/navigation-home"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github />
            <span>GitHub</span>
          </a>
        </div>
      </header>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Code className={styles.sectionIcon} />
            个人项目导航
          </h2>
          <p className={styles.sectionDescription}>
            点击项目卡片访问在线演示，支持响应式设计和现代化交互
          </p>
        </div>
        <div className={styles.sectionList}>
          {projects.map((project) => (
            <div className={styles.listItem} key={project.id}>
                <h3 className={styles.projectTitle}>{project.name}</h3>
              <p className={styles.projectDescription}>{project.description}</p>
              <div className={styles.projectStatus}>
                <div className={styles.statusItem}>
                  <span
                    className={`${styles.statusIndicator} ${styles[getOnlineStatusKey(project.url, project.serviceStatus.online)]}`}
                  >
                    {/* statusIndicator是变色的css圆点  */}
                  </span>
                  <span className={styles.statusLabel}>
                    {adjustOnlineStatus(
                      project.url,
                      project.serviceStatus.online,
                    )}
                  </span>
                </div>
                <div className={styles.statusItem}>
                  <span className={styles.writeStatusLabel}>写作状态:</span>
                  <span
                    className={`${styles.writeStatus} ${
                      styles[formatWriteStatus(project.writeStatus)] ?? ""
                    }`}
                  >
                    {project.writeStatus}
                  </span>
                </div>
              </div>

              <div className={styles.projectCardFooter}>
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.projectLink}
                  >
                    <Github />
                    源码
                    <ChevronRight className={styles.linkArrow} />
                  </a>
                )}

                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.projectLink}
                  >
                    <ExternalLink />
                    访问
                    <ChevronRight className={styles.linkArrow} />
                  </a>
                )}
              </div>
              <div className={styles.projectCardBg}></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
