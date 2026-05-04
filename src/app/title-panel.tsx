import { ActionIcon, Menu } from "@mantine/core";
import { Check, Menu as MenuIcon, Monitor, Moon, Sun } from "lucide-react";
import {
  type MantineColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import type { ReactNode } from "react";

const themeOptions: Array<{
  icon: ReactNode;
  label: string;
  value: MantineColorScheme;
}> = [
  {
    icon: <Monitor size={14} strokeWidth={2} />,
    label: "跟随系统",
    value: "auto",
  },
  {
    icon: <Sun size={14} strokeWidth={2} />,
    label: "浅色",
    value: "light",
  },
  {
    icon: <Moon size={14} strokeWidth={2} />,
    label: "深色",
    value: "dark",
  },
];

export const TitlePanel = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <header className="title-panel" aria-label="Document menu">
      <Menu position="bottom-start" shadow="md" width={154} withinPortal>
        <Menu.Target>
          <ActionIcon
            aria-label="Open document menu"
            className="floating-icon-button"
            size={30}
            variant="transparent"
          >
            <MenuIcon size={16} strokeWidth={2} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown className="floating-menu">
          {themeOptions.map((option) => (
            <Menu.Item
              key={option.value}
              leftSection={option.icon}
              rightSection={
                colorScheme === option.value ? (
                  <Check size={13} strokeWidth={2} />
                ) : null
              }
              onClick={() => setColorScheme(option.value)}
            >
              {option.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>

      <span className="title-panel__divider" aria-hidden="true" />
      <span className="title-panel__name" title="Test Doc A">
        Test Doc A
      </span>
    </header>
  );
};
