import {
  HomeOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  CloudServerOutlined,
  MessageOutlined,
} from "@ant-design/icons-vue";

export const navigationItems = [
  { to: "/", label: "Home", icon: HomeOutlined },
  { to: "/memo", label: "Memos", icon: FileTextOutlined },
  { to: "/todo", label: "Tasks", icon: CheckSquareOutlined },
  { to: "/s3", label: "Storage", icon: CloudServerOutlined },
  { to: "/chat", label: "Chat", icon: MessageOutlined },
];
