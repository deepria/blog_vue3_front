import {
  HomeOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  CloudServerOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons-vue";

export const navigationItems = [
  { to: "/", label: "홈", icon: HomeOutlined },
  { to: "/memo", label: "메모", icon: FileTextOutlined },
  { to: "/todo", label: "할 일", icon: CheckSquareOutlined },
  { to: "/s3", label: "파일", icon: CloudServerOutlined },
  { to: "/chat", label: "대화", icon: MessageOutlined },
  { to: "/account", label: "설정", icon: UserOutlined },
];
