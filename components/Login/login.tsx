'use client'

import React, {useActionState, useEffect, useState} from 'react';
import {ArrowUpRight, Radio} from "lucide-react";
import {useRouter} from "next/navigation";
import {initialLoginState, loginActions} from "../../lib/auth";


const Login = () => {
  const router = useRouter();


  const [dataLogin, setDataLogin] = useState({
    email: "",
    password: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
      setDataLogin((prevState) => ({
        ...prevState,
        [field]: e.target.value,
      }))
  }


  const [state, formAction, isPending] = useActionState(loginActions, initialLoginState)


  useEffect(() => {
    if (state.success) {
      router.replace("/dashboard");
    }
  }, [state.success]);



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
      <form className="login-card" action={formAction}>
        <span className="eyebrow">SELLER WORKSPACE</span>
        <h2>Welcome back</h2>
        <p className="muted">Sign in to manage your next drop.</p>
        <label>Email<input type="email" name="email" autoComplete="username" required value={dataLogin.email}
                           onChange={e => handleInputChange(e, "email")}/></label>
        <label>Password<input type="password" name="password" autoComplete="current-password" required value={dataLogin.password}
                              onChange={e => handleInputChange(e, "password")}/></label>
        {state.error && <p className="error" role="alert">{state.error}</p>}
        <button disabled={isPending} className="primary" type="submit">
          {isPending ? 'Signing in…' : 'Sign in'} <ArrowUpRight size={17}/>
        </button>
        <p className="small muted">First run? Use the credentials generated in <code>backend/.env</code>.</p>
      </form>
    </main>
  )
};

export default Login;