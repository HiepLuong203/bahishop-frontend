// src/pages/SupplierListPage.tsx
import React, { useState, useEffect } from 'react';
import supplierApi from '../api/supplierApi';
import { Supplier } from '../types/supplier';
import './SupplierListPage.css';

interface SupplierWithImage extends Supplier {
  imageUrl?: string;
  link?: string; // Add optional link field
}

// Manual mapping of suppliers to images and links
const supplierConfig: Record<string, { imageUrl: string; link: string }> = {
  // Example: Map by supplier_id (convert to string for key)
  '1': {
    imageUrl: 'https://pinetree.vn/wp-content/uploads/2023/05/Masan.jpg', 
    link: 'https://www.masangroup.com/vi', 
  },
  '2': {
    imageUrl: 'https://sanketoan.vn/public/library_employer/zinfoodcom%40gmail.com-20606/images/i.jpg',
    link: 'https://zinfood.com/',
  },
  '3': {
    imageUrl: 'https://thucphamhnh.com/wp-content/uploads/2023/04/328991742_1232467097375783_5716211304953808102_n.jpg', 
    link: 'https://thucphamhnh.com/', 
  },
  '4': {
    imageUrl: 'https://cdn1.vieclam24h.vn/tvn/images/old_employer_avatar/images/3f033a22dcab89e553444f29eda5e292_5e05d32bd0b67_1577440043.png',
    link: 'http://www.haihaco.com.vn/',
  },
  '5': {
    imageUrl: 'https://mincofood.vn/wp-content/uploads/2022/06/logonew.png',
    link: 'https://mincofood.vn/',
  },
  '6': {
    imageUrl: 'https://static.vecteezy.com/system/resources/previews/021/813/054/non_2x/food-world-logo-design-template-with-burger-icon-and-globe-stand-perfect-for-business-company-mobile-app-restaurant-etc-free-vector.jpg',
    link: 'https://www.worldfoodshop.com/?srsltid=AfmBOorgMrdStYOErcgQwJ78JCSp2z5A7AVnGqc41uVdGLsGL-ygqfKG',
  },
};

const SupplierListPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await supplierApi.getAll();
        const suppliersWithImage = response.data.map((supplier: Supplier) => {
          // Check if supplier has a config by ID or name
          const configById = supplierConfig[supplier.supplier_id.toString()];
          const configByName = supplierConfig[supplier.name];
          const config = configById || configByName;

          return {
            ...supplier,
            imageUrl:
              config?.imageUrl ||
              `https://via.placeholder.com/150x150?text=${encodeURIComponent(supplier.name).slice(0, 15)}`,
            link: config?.link, // Add link from config or undefined
          };
        });
        setSuppliers(suppliersWithImage);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  if (loading) {
    return (
      <div className="supplier-list-container">
        <div className="supplier-list-message supplier-list-message--loading">
          Đang tải danh sách nhà cung cấp...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="supplier-list-container">
        <div className="supplier-list-message supplier-list-message--error">
          Lỗi tải danh sách nhà cung cấp: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-list-container">
      <h1 className="supplier-list-heading">Danh sách Nhà Cung Cấp</h1>
      {suppliers.length === 0 ? (
        <div className="supplier-list-message supplier-list-message--empty">
          Không tìm thấy nhà cung cấp nào.
        </div>
      ) : (
        <ul className="supplier-list-grid">
          {suppliers.map((supplier) => (
            <li key={supplier.supplier_id} className="supplier-list-item">
              <div className="supplier-list-item__content">
                <div className="supplier-list-item__link">
                  <div className="supplier-list-item__image-wrapper">
                    <img
                      src={supplier.imageUrl}
                      alt={supplier.name}
                      className="supplier-list-item__image"
                    />
                  </div>
                  <span className="supplier-list-item__name">{supplier.name}</span>
                </div>
                {supplier.link && (
                  <a
                    href={supplier.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="supplier-list-item__external-link"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SupplierListPage;