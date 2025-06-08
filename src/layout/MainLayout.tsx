import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./MainLayout.css"; 
interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="main-layout"> {/* Thêm class "main-layout" */}
      <Header />
      <div className="content-wrapper">{children}</div> {/* Phần nội dung chính */}
      <Footer />
    </div>
  );  
};

export default MainLayout;