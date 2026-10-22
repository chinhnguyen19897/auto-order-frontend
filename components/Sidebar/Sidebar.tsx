import {LogOut, Radio} from "lucide-react";
import {api} from "../../lib/api";
import {useSidebarStore} from "../../providers/sidebar-store-provider";
import {navConfig} from "../../lib/navigation";




export const Sidebar = () => {

  const {tabs, setTabs, logoutPage, data} = useSidebarStore((state) => state)

  return (
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><Radio size={20}/></span>Auto Order</div>
      <p className="nav-label">WORKSPACE</p>
      <nav>{navConfig.map((n: any) => <button key={n.id} className={tabs === n.id ? 'nav-item active' : 'nav-item'}
                                        onClick={() => setTabs(n.id)}>
        <n.icon size={18}/>
        {n.label}{n.id === 'orders' && <span className="nav-count">{data?.metrics.orders}</span>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="connection-card"><span
          className="dot"/><strong>{data?.config.demo ? 'Demo workspace' : 'Live workspace'}</strong>
          <p>{data?.config.demo ? 'Try the flow before connecting providers.' : 'Check stream health while selling.'}</p>
        </div>
        <button className="nav-item" onClick={() => logoutPage ? void logoutPage(() => api('auth/logout', {}), 'Signed out.') : null}>
          <LogOut size={18}/>
            Sign out
        </button>
      </div>
    </aside>
  )
}