import {MessageSquareMore, Package, Radio, Send, Settings, ShoppingBag} from "lucide-react";
import React from "react";

export interface NavItem {
  id: string,
  label: string,
  icon: React.ComponentType<{className?: string}>
}


export const navConfig: NavItem[] = [
  {
    id: 'live',
    label: 'Live workspace',
    icon: Radio
  },
  {
    id: 'zlMatching',
    label: 'Zalo Matching',
    icon: MessageSquareMore
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ShoppingBag
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Send
  },
  {
    id: 'settings',
    label: 'Integrations',
    icon: Settings
  }];