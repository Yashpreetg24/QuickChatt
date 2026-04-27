import React, { useContext, useState } from 'react'
import { motion as Motion } from 'framer-motion'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'

const LoginPage = () => {

  const [currState, setCurrState] = useState("Sign up")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState("")
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const {login} = useContext(AuthContext)

  const onSubmitHandler = (event)=>{
    event.preventDefault();

    if(currState === 'Sign up' && !isDataSubmitted){
      setIsDataSubmitted(true)
      return;
    }

    login(currState=== "Sign up" ? 'signup' : 'login', {fullName, email, password, bio})
  }

  const handleStateSwitch = (newState) => {
    setCurrState(newState);
    setIsDataSubmitted(false);
    setFullName("");
    setEmail("");
    setPassword("");
    setBio("");
  };

  return (
    <div className="dark min-h-screen relative flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col overflow-hidden bg-black selection:bg-purple-500/30 text-foreground">
      {/* Dynamic Mesh Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-mesh" />
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[140px] animate-mesh [animation-delay:2s]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[45%] h-[45%] rounded-full bg-accent/15 blur-[110px] animate-mesh [animation-delay:4s]" />
      </div>

      {/* Brand Side (Left) */}
      <div className="relative z-10 flex flex-col items-center">
        <Motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          {/* Glowing Aura behind logo */}
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <img src={assets.logo_big} alt="Logo" className="w-[min(30vw,250px)] relative z-10 drop-shadow-2xl" />
        </Motion.div>
      </div>

      {/* Form Side (Right) */}
      <Motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="relative z-10"
      >
        <form onSubmit={onSubmitHandler} className="glass-strong p-8 flex flex-col gap-6 rounded-[32px] shadow-2xl border-white/10 w-[420px] hover:border-primary/30 transition-all duration-700 group/form">
          <header className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-white">{currState}</h2>
            <p className="text-sm text-muted-foreground/80">Experience the next generation of chat.</p>
          </header>

          <div className="flex flex-col gap-5">
            {currState === "Sign up" && !isDataSubmitted && (
              <div className="relative">
                <input
                  onChange={(e) => setFullName(e.target.value)}
                  value={fullName}
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-white/20 text-white"
                  required
                />
              </div>
            )}
            
            {!isDataSubmitted && (
              <>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-white/20 text-white"
                  required
                />
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  type="password"
                  placeholder="Password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-white/20 text-white"
                  required
                />
              </>
            )}

            {currState === "Sign up" && isDataSubmitted && (
              <textarea
                onChange={(e) => setBio(e.target.value)}
                value={bio}
                rows={4}
                placeholder="Write something about yourself..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-white/20 text-white resize-none"
                required
              />
            )}
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-gradient-primary rounded-xl font-bold text-white text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            {currState === "Sign up" ? "Create Account" : "Login Now"}
          </button>

          <div className="space-y-6">
            <label className="flex items-center gap-4 cursor-pointer group/check">
              <div className="relative flex items-center">
                <input type="checkbox" className="peer appearance-none w-6 h-6 border-2 border-white/10 rounded-lg checked:bg-primary checked:border-primary transition-all" required />
                <svg className="absolute w-4 h-4 left-1 pointer-events-none hidden peer-checked:block text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="text-sm text-muted-foreground group-hover/check:text-white/70 transition-colors">I agree to the terms and privacy policy</span>
            </label>

            <div className="text-center pt-2">
              {currState === "Sign up" ? (
                <p className="text-muted-foreground text-base">Already have an account? <span onClick={() => handleStateSwitch("Login")} className="text-primary font-bold cursor-pointer hover:text-primary-glow transition-colors ml-1">Login here</span></p>
              ) : (
                <p className="text-muted-foreground text-base">New to QuickChat? <span onClick={() => handleStateSwitch("Sign up")} className="text-primary font-bold cursor-pointer hover:text-primary-glow transition-colors ml-1">Create Account</span></p>
              )}
            </div>
          </div>
        </form>
      </Motion.div>
    </div>
  )
}

export default LoginPage
