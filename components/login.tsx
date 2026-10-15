import React, {Dispatch, SetStateAction, SyntheticEvent} from 'react';
import {ArrowUpRight, Radio} from "lucide-react";

type LoginProps = {
  error: string,
  busy: boolean,
  email: string,
  setEmail: Dispatch<SetStateAction<string>>,
  login: (e: SyntheticEvent) => Promise<void>,
  password: string,
  setPassword: Dispatch<SetStateAction<string>>
}

const Login = ({error, busy, email, login, setEmail, password, setPassword}: LoginProps) => {
  return (
    <main className="login">
      <div className="login-intro">
        <div className="brand">
          <span className="brand-mark">
            <Radio size={22}/>
          </span> Auto Order
        </div>
        <span className="eyebrow">LESS ADMIN. MORE SELLING.</span>
        <h1>Your live.<br/>Your orders.<br/><em>All
        together.</em>
        </h1>
        <p>A focused workspace that turns live comments into orders and keeps every payment in
        view.</p>
        <div className="login-pill">
          <span className="dot"/> Built for live commerce
        </div>
      </div>
      <form className="login-card" onSubmit={login}>
        <span className="eyebrow">SELLER WORKSPACE</span>
        <h2>Welcome back</h2>
        <p className="muted">Sign in to manage your next drop.</p>
        <label>Email<input type="email" autoComplete="username" required value={email}
                           onChange={e => setEmail(e.target.value)}/></label>
        <label>Password<input type="password" autoComplete="current-password" required value={password}
                              onChange={e => setPassword(e.target.value)}/></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button disabled={busy} className="primary">
          {busy ? 'Signing in…' : 'Sign in'} <ArrowUpRight size={17}/>
        </button>
        <p className="small muted">First run? Use the credentials generated in <code>backend/.env</code>.</p>
      </form>
    </main>
  )
};

export default Login;