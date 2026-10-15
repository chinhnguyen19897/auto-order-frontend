import {LogOut, Package, Radio, Send, Settings, ShoppingBag} from "lucide-react";
import {api} from "../../lib/api";
import {Tab} from "../../types/tabs";
import {Dispatch, SetStateAction} from "react";
import {DashboardData} from "../../types/common";

type SidebarProps = {
  tab: string
  setTab: Dispatch<SetStateAction<string | Tab>>
  data: DashboardData  | null
  logout: (action: () => Promise<unknown>, success: string) => Promise<boolean>
}


export const navigation = [
  {
    id: 'live',
    label: 'Live workspace',
    icon: Radio
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

export const Sidebar = ({tab, setTab, data, logout}: SidebarProps) => {

  return (
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><Radio size={20}/></span>Auto Order</div>
      <p className="nav-label">WORKSPACE</p>
      <nav>{navigation.map((n: any) => <button key={n.id} className={tab === n.id ? 'nav-item active' : 'nav-item'}
                                        onClick={() => setTab(n.id)}>
        <n.icon size={18}/>
        {n.label}{n.id === 'orders' && <span className="nav-count">{data?.metrics.orders}</span>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="connection-card"><span
          className="dot"/><strong>{data?.config.demo ? 'Demo workspace' : 'Live workspace'}</strong>
          <p>{data?.config.demo ? 'Try the flow before connecting providers.' : 'Check stream health while selling.'}</p>
        </div>
        <button className="nav-item" onClick={() => void logout(() => api('auth/logout', {}), 'Signed out.')}>
          <LogOut size={18}/>
            Sign out
        </button>
      </div>
    </aside>
  )
}