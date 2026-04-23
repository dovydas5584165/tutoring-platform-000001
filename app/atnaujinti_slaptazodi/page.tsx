"use client";                                                                                                                                                                                                 
  import { useState, useEffect } from "react";                                                                                                                                                                  
  import { supabase } from "@/lib/supabaseClient";                                                                                                                                                              
                                                                                                                                                                                                                
  export default function UpdatePasswordPage() {                                                                                                                                                                
    const [password, setPassword] = useState("");                                                                                                                                                               
    const [status, setStatus] = useState("");                                                                                                                                                                   
    const [ready, setReady] = useState(false);

    useEffect(() => {                                                                                                                                                                                           
      // Exchange the ?code= from the reset email for an active session
      const code = new URLSearchParams(window.location.search).get("code");                                                                                                                                     
      if (code) {                                                                                                                                                                                               
        supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
          if (error) {                                                                                                                                                                                          
            setStatus("Nuoroda nebegalioja arba jau panaudota. Prašome bandyti iš naujo.");
          } else {                                                                                                                                                                                              
            setReady(true);
          }                                                                                                                                                                                                     
        });       
      } else {
        setStatus("Trūksta kodo. Patikrinkite nuorodą el. laiške.");                                                                                                                                            
      }                                                                                                                                                                                                         
    }, []);                                                                                                                                                                                                     
                                                                                                                                                                                                                
    const handleUpdate = async (e: React.FormEvent) => {                                                                                                                                                        
      e.preventDefault();
      const { error } = await supabase.auth.updateUser({ password });                                                                                                                                           
      if (error) {
        setStatus("Klaida: " + error.message);
      } else {
        setStatus("Slaptažodis sėkmingai atnaujintas! Dabar galite prisijungti.");
      }                                                                                                                                                                                                         
    };
                                                                                                                                                                                                                
    return (      
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Sukurkite naują slaptažodį</h2>
        {ready ? (                                                                                                                                                                                              
          <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 300, margin: "0 auto" }}>
            <input                                                                                                                                                                                              
              type="password"
              placeholder="Naujas slaptažodis"                                                                                                                                                                  
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: 10 }}                                                                                                                                                                           
            />
            <button type="submit" style={{ padding: 10, backgroundColor: "#0070f3", color: "#fff", border: "none" }}>                                                                                           
              Atnaujinti
            </button>
          </form>
        ) : (                                                                                                                                                                                                   
          !status && <p>Tikrinama nuoroda...</p>
        )}                                                                                                                                                                                                      
        {status && <p>{status}</p>}
      </div>                                                                                                                                                                                                    
    );            
  }
