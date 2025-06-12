import React from "react";
import AppRouter from "./routes/AppRoute";
import "./App.css"; 
import BackToTop from "./components/BackToTop"; 
import SocialIcons from "./components/SocialIcons";
function App() {
  return (
    <div className="App">
      <AppRouter />
      <SocialIcons  
        phoneNumber="0364797777" 
        messengerLink="https://web.facebook.com/luongbahiep.nk" 
        zaloLink="https://zalo.me/0364797669" 
      />
      <BackToTop />
    </div>
  );
}

export default App;
