import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faSearch,faShoppingCart,faUser,} from "@fortawesome/free-solid-svg-icons";
import "./Header.css";
import { useNavigate, Link, useLocation } from "react-router-dom";
import categoryApi from "../api/categoryApi";
import { Category } from "../types/category";
import { UserInfo } from "../types/user";
import cartApi from "../api/cartApi";
import { CartItemWithProduct } from "../types/cartItem";
import CategoryDropdownNav from "./CategoryDropdownNav"; 

const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]); 
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [isDropdownHovering, setIsDropdownHovering] = useState(false);
  const navigate = useNavigate();
  const categoriesContainerRef = useRef<HTMLLIElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [miniCartItems, setMiniCartItems] = useState<CartItemWithProduct[]>([]);
  const miniCartRef = useRef<HTMLDivElement>(null);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const userIconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsLoggedIn(true);
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      }
      fetchMiniCart();
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        setCategories(response.data); // Lấy tất cả danh mục phẳng
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoriesContainerRef.current &&
        !categoriesContainerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoriesDropdown(false);
      }
      if (miniCartRef.current && !miniCartRef.current.contains(event.target as Node)) {
        setShowMiniCart(false);
        setShowLoginMessage(false);
      }
      if (userIconRef.current && !userIconRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === '/trangchu') {
      setSearchTerm("");
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowUserMenu(false);
    setMiniCartItems([]);
    navigate("/trangchu");
  };

  const handleMouseEnterUserIcon = () => {
    if (isLoggedIn) {
      setShowUserMenu(true);
    }
  };

  const handleMouseLeaveUserIcon = () => {
    setTimeout(() => {
      if (userIconRef.current && !userIconRef.current.matches(':hover')) {
        setShowUserMenu(false);
      }
    }, 100);
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchTerm && searchTerm.trim()) {
      navigate(`/search?query=${searchTerm}`);
    } else {
      navigate('/products');
    }
  };

  const handleMouseEnterCategory = () => {
    setShowCategoriesDropdown(true);
  };

  const handleMouseLeaveCategory = () => {
    setTimeout(() => {
      if (!isDropdownHovering) {
        setShowCategoriesDropdown(false);
      }
    }, 100);
  };

  const handleMouseEnterDropdown = () => {
    setIsDropdownHovering(true);
  };

  const handleMouseLeaveDropdown = () => {
    setIsDropdownHovering(false);
    setShowCategoriesDropdown(false);
  };

  const fetchMiniCart = async () => {
    try {
      const response = await cartApi.getCart();
      setMiniCartItems(response.data);
    } catch (error) {
      console.error("Lỗi khi tải mini cart:", error);
      setMiniCartItems([]);
    }
  };

  const handleMouseEnterCart = () => {
    setShowMiniCart(true);
    if (isLoggedIn) {
      fetchMiniCart();
      setShowLoginMessage(false);
    } else {
      setShowLoginMessage(true);
    }
  };

  const handleMouseLeaveCart = () => {
    setTimeout(() => {
      if (miniCartRef.current && !miniCartRef.current.matches(':hover')) {
        setShowMiniCart(false);
        setShowLoginMessage(false);
      }
    }, 100);
  };

  const handleCategorySelectFromDropdown = (categoryId: number) => {
    setShowCategoriesDropdown(false);
  };

  const reloadPage = (path: string) => {
    if (location.pathname === path) {
      window.location.reload();
    }
  };

  const calculateMiniCartItemTotal = (item: CartItemWithProduct) => {
    const price = item.product.discount_price !== null && item.product.discount_price !== undefined
      ? item.product.discount_price
      : item.product.price;
    return price * item.quantity;
  };
  const getTotalCartQuantity = () => {
    return miniCartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <header className="hd-header">
      <div className="hd-header-top">
        <div className="hd-logo">
          <Link to="/trangchu" onClick={() => reloadPage('/trangchu')}>
                <img src="/bahishop.png" alt="BaHiShop Logo" className="hd-logo-image" />
          </Link>
        </div>
        <div className="hd-search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={handleSearchInputChange}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearchSubmit(event);
              }
            }}
            className="hd-search-input"
          />
          <button type="button" onClick={handleSearchSubmit} className="hd-search-button">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
        <div className="hd-icons-container">
          <div
            className="hd-cart-icon-wrapper"
            onMouseEnter={handleMouseEnterCart}
            onMouseLeave={handleMouseLeaveCart}
           >
            <Link to="/cartitems/mycart" onClick={() => reloadPage('/cartitems/mycart')} className="hd-cart-link">
               <FontAwesomeIcon icon={faShoppingCart} />
               {miniCartItems.length > 0 && (
                <span className="hd-cart-badge">{getTotalCartQuantity()}</span>
              )}
            </Link>
            {showMiniCart &&  (
              <div
                ref={miniCartRef}
                className="hd-mini-cart-dropdown"
                onMouseEnter={() => setShowMiniCart(true)}
                onMouseLeave={handleMouseLeaveCart}
              >
                <h3 className="hd-mini-cart-header">Giỏ hàng</h3>
                {showLoginMessage ? (
                  <div className="hd-mini-cart-message hd-mini-cart-login-message">
                    Bạn cần phải <Link to="/dangnhap" className="hd-mini-cart-link">đăng nhập</Link> để sử dụng giỏ hàng.
                  </div>
                ) : (
                  <div className="hd-mini-cart-items-wrapper">
                    {miniCartItems.length > 0 ? (
                      <div className="hd-mini-cart-scroll-area">
                        <ul className="hd-mini-cart-list">
                          {miniCartItems.map((item) => (
                            <li key={item.cart_item_id} className="hd-mini-cart-item">
                              <Link to={`/product/${item.product.product_id}`} className="hd-mini-cart-item-link">
                                {item.product.image_url && (
                                  <img
                                    src={`http://localhost:5000${item.product.image_url}`}
                                    alt={item.product.name}
                                    className="hd-mini-cart-item-image"
                                  />
                                )}
                                <div className="hd-mini-cart-item-info">
                                  <span className="hd-mini-cart-item-name">{item.product.name.substring(0, 30)} &nbsp; </span>
                                  <span className="hd-mini-cart-item-price-qty">
                                    {item.quantity} x <br /> {' '}
                                    {item.product.discount_price !== null && item.product.discount_price !== undefined
                                      ? `${Number(item.product.discount_price).toLocaleString('vi-VN')} đ`
                                      : `${Number(item.product.price).toLocaleString('vi-VN')} đ`}
                                  </span>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="hd-mini-cart-message">Giỏ hàng trống</div>
                    )}
                  </div>
                )
                }
                {miniCartItems.length > 0 && !showLoginMessage && (
                  <div className="hd-mini-cart-footer">
                    <div className="hd-mini-cart-actions">
                      <button className="hd-view-cart-button">
                        <Link to="/cartitems/mycart" onClick={() => setShowMiniCart(false)}>
                          Xem giỏ hàng
                        </Link>
                      </button>
                      <button className="hd-checkout-cart-button">
                        <Link to="/orders/checkout" onClick={() => setShowMiniCart(false)}>
                          Thanh toán
                        </Link>
                      </button>
                    </div>
                    <div className="hd-mini-cart-total">
                      Tổng:{' '}
                      {Number(miniCartItems.reduce((total, item) => total + calculateMiniCartItemTotal(item), 0)).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {isLoggedIn && (
            <div
              className="hd-user-menu-wrapper"
              ref={userIconRef}
              onMouseEnter={handleMouseEnterUserIcon}
              onMouseLeave={handleMouseLeaveUserIcon}
            >
              <FontAwesomeIcon
                icon={faUser}
                className="hd-user-icon"
              />
              <span className="hd-username">{currentUser?.full_name || currentUser?.username}</span>
              {showUserMenu && (
                <div className="hd-user-dropdown">
                  <Link
                    to="/profile" onClick={() => reloadPage('/profile')}
                    className="hd-user-dropdown-item"
                  >
                    Thông tin cá nhân
                  </Link>
                  <Link
                    to="/cartitems/mycart" onClick={() => reloadPage('/cartitems/mycart')}
                    className="hd-user-dropdown-item"
                  >
                    Giỏ hàng của tôi
                  </Link>
                  <Link
                    to="/orders/myorders" onClick={() => reloadPage('/orders/myorders')}
                    className="hd-user-dropdown-item"
                  >
                    Đơn hàng của tôi
                  </Link>
                  <button
                    onClick={handleLogout}  className="hd-logout-button"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
           {!isLoggedIn && (
            <div className="hd-auth-buttons-mobile">
              <Link to="/dangnhap" onClick={() => reloadPage('/dangnhap')} className="hd-auth-button">ĐĂNG NHẬP</Link>
              <Link to="/dangky" onClick={() => reloadPage('/dangky')} className="hd-auth-button">ĐĂNG KÝ</Link>
            </div>
          )}
        </div>
      </div>
      <nav className="hd-navigation">
        <ul className="hd-navigation-list">
          <li className="hd-nav-item">
             <Link to="/trangchu" onClick={() => reloadPage('/trangchu')} className="hd-nav-link">TRANG CHỦ</Link>
           </li>
          <li
            className="hd-nav-item"
            ref={categoriesContainerRef}
            onMouseEnter={handleMouseEnterCategory}
            onMouseLeave={handleMouseLeaveCategory}
          >
             <Link to="/products" onClick={() => reloadPage('/products')} className="hd-nav-link">DANH MỤC SẢN PHẨM</Link>
             {showCategoriesDropdown && (
              <div
                ref={dropdownRef}
                className="hd-categories-dropdown"
                onMouseEnter={handleMouseEnterDropdown}
                onMouseLeave={handleMouseLeaveDropdown}
              >
                <CategoryDropdownNav
                  categories={categories} 
                  onCategorySelect={handleCategorySelectFromDropdown} 
                />
              </div>
            )}
          </li>
           <li className="hd-nav-item">
              <Link to="/products" onClick={() => reloadPage('/products')} className="hd-nav-link">TẤT CẢ SẢN PHẨM</Link>
          </li>
          <li className="hd-nav-item">
             <Link to="/suppliers" onClick={() => reloadPage('/suppliers')} className="hd-nav-link">NHÀ CUNG CẤP</Link>
           </li>
           <li className="hd-nav-item">
             <Link to="https://vnexpress.net/tag/thuc-pham-sach-130156" onClick={() => reloadPage('/news')} className="hd-nav-link">TIN TỨC</Link>
           </li>
          {!isLoggedIn && (
            <>
              <li className="hd-nav-item">
                <Link to="/dangnhap" onClick={() => reloadPage('/dangnhap')} className="hd-nav-link hd-auth-button">
                  ĐĂNG NHẬP
                </Link>
              </li>
              <li className="hd-nav-item ">
                <Link to="/dangky" onClick={() => reloadPage('/dangky')} className="hd-nav-link hd-auth-button">
                  ĐĂNG KÝ
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;