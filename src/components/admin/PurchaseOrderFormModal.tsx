// src/components/admin/PurchaseOrderFormModal.tsx
import React, { useState, useEffect } from 'react';
import { PurchaseOrder, PurchaseOrderInputData, ProductInputForPurchaseOrder, PurchaseOrderInput } from '../../types/purchaseOrder';
import { Product } from '../../types/product';
import { Supplier } from '../../types/supplier';
import purchaseOrderApi from '../../api/purchaseOrderApi';
import './PurchaseOrderFormModal.css'; // Đường dẫn đến file CSS mới

interface PurchaseOrderFormModalProps {
  purchaseOrder: PurchaseOrder | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
  suppliers: Supplier[];
  products: Product[];
}

const PurchaseOrderFormModal: React.FC<PurchaseOrderFormModalProps> = ({ purchaseOrder, onClose, onSubmitSuccess, suppliers, products }) => {
  const [orderData, setOrderData] = useState<PurchaseOrderInputData>({
    supplier_id: 0,
    order_date: new Date().toISOString().split('T')[0],
    note: '',
  });
  const [orderItems, setOrderItems] = useState<ProductInputForPurchaseOrder[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Biến cờ để kiểm soát việc chỉnh sửa chi tiết sản phẩm
  const isEditingExistingOrder = !!purchaseOrder;

  useEffect(() => {
    const initializeFormData = async () => {
      setLoadingData(true);
      setFormError(null);

      if (isEditingExistingOrder) {
        // Đang sửa đơn hàng: điền dữ liệu từ purchaseOrder
        setOrderData({
          supplier_id: purchaseOrder!.supplier_id,
          order_date: new Date(purchaseOrder!.order_date).toISOString().split('T')[0],
          note: purchaseOrder!.note || '',
        });

        // Lấy chi tiết đơn hàng đầy đủ nếu chưa có (khi click Sửa từ danh sách)
        if (purchaseOrder!.PurchaseOrderDetail && purchaseOrder!.PurchaseOrderDetail.length > 0) {
          setOrderItems(purchaseOrder!.PurchaseOrderDetail.map(detail => ({
            product_id: detail.product_id,
            quantity: detail.quantity,
            unit_price: detail.unit_price,
            batch_code: detail.batch_code,
            manufacture_date: detail.manufacture_date ? new Date(detail.manufacture_date).toISOString().split('T')[0] : undefined,
            expiry_date: new Date(detail.expiry_date).toISOString().split('T')[0],
          })));
        } else {
          try {
            const fullOrderResponse = await purchaseOrderApi.getById(purchaseOrder!.id);
            const fullOrder = fullOrderResponse.data;
            if (fullOrder.PurchaseOrderDetail) {
              setOrderItems(fullOrder.PurchaseOrderDetail.map(detail => ({
                product_id: detail.product_id,
                quantity: detail.quantity,
                unit_price: detail.unit_price,
                batch_code: detail.batch_code,
                manufacture_date: detail.manufacture_date ? new Date(detail.manufacture_date).toISOString().split('T')[0] : undefined,
                expiry_date: new Date(detail.expiry_date).toISOString().split('T')[0],
              })));
            }
          } catch (error) {
            console.error('Lỗi khi tải chi tiết đơn hàng để chỉnh sửa:', error);
            setFormError('Không thể tải chi tiết đơn hàng để chỉnh sửa.');
          }
        }
      } else {
        // Đang thêm mới đơn hàng: set mặc định
        if (suppliers.length > 0) {
          setOrderData(prev => ({ ...prev, supplier_id: suppliers[0].supplier_id }));
        }
        setOrderItems([]); // Đảm bảo items rỗng khi tạo mới
      }
      setLoadingData(false);
    };

    if (suppliers.length > 0 && products.length > 0) {
      initializeFormData();
    } else if (isEditingExistingOrder) { // Nếu đang sửa, có thể cần load chi tiết dù chưa có đủ suppliers/products
      initializeFormData();
    }
  }, [purchaseOrder, suppliers, products, isEditingExistingOrder]);

  const handleOrderDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOrderData({ ...orderData, [name]: value });
  };

  const handleOrderItemChange = (index: number, e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    // Không cho phép chỉnh sửa item nếu đang sửa đơn hàng đã tồn tại
    if (isEditingExistingOrder) return; 

    const { name, value } = e.target;
    const newItems = [...orderItems];
    const currentItem = { ...newItems[index] }; 

    if (name === 'product_id' || name === 'quantity' || name === 'unit_price') {
      currentItem[name] = Number(value);
    } else {
      (currentItem as any)[name] = value;
    }

    newItems[index] = currentItem;
    setOrderItems(newItems);
  };

  const handleAddOrderItem = () => {
    // Không cho phép thêm item nếu đang sửa đơn hàng đã tồn tại
    if (isEditingExistingOrder) return;
    if (products.length === 0) {
      alert('Vui lòng thêm sản phẩm trước khi tạo đơn nhập hàng.');
      return;
    }
    const defaultExpiryDate = new Date();
    defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 1);
    
    setOrderItems([
      ...orderItems,
      {
        product_id: products[0]?.product_id || 0,
        quantity: 1,
        unit_price: 0,
        batch_code: '',
        manufacture_date: new Date().toISOString().split('T')[0],
        expiry_date: defaultExpiryDate.toISOString().split('T')[0],
      },
    ]);
  };

  const handleRemoveOrderItem = (index: number) => {
    // Không cho phép xóa item nếu đang sửa đơn hàng đã tồn tại
    if (isEditingExistingOrder) return;
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    if (!orderData.supplier_id || orderData.supplier_id === 0) {
      setFormError('Vui lòng chọn nhà cung cấp.');
      setIsSubmitting(false);
      return;
    }

    if (!isEditingExistingOrder) { // Chỉ validate items khi tạo mới
      if (orderItems.length === 0) {
        setFormError('Vui lòng thêm ít nhất một sản phẩm vào đơn hàng.');
        setIsSubmitting(false);
        return;
      }
      for (const item of orderItems) {
        if (
          !item.product_id || item.product_id === 0 ||
          item.quantity <= 0 ||
          item.unit_price < 0 || 
          !item.batch_code || item.batch_code.trim() === '' ||
          !item.expiry_date
        ) {
          setFormError('Vui lòng điền đầy đủ và chính xác thông tin sản phẩm và lô hàng (Sản phẩm, Số lượng, Đơn giá, Mã lô, Hạn sử dụng phải hợp lệ).');
          setIsSubmitting(false);
          return;
        }
        if (item.manufacture_date && new Date(item.manufacture_date) > new Date(item.expiry_date)) {
          setFormError('Ngày sản xuất không được lớn hơn ngày hết hạn.');
          setIsSubmitting(false);
          return;
        }
      }
    }

    try {
      if (isEditingExistingOrder) {
        // KHI CẬP NHẬT: CHỈ GỬI `data` CỦA PURCHASEORDER, KHÔNG GỬI `products`
        await purchaseOrderApi.updatePurchaseOrder(purchaseOrder!.id, { data: orderData, products: [] }); // Pass empty products array to satisfy type
        alert('Cập nhật thông tin đơn nhập hàng thành công!');
      } else {
        // KHI TẠO MỚI: GỬI CẢ `data` VÀ `products`
        const payload: PurchaseOrderInput = {
          data: orderData,
          products: orderItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            batch_code: item.batch_code,
            manufacture_date: item.manufacture_date,
            expiry_date: item.expiry_date,
          })),
        };
        await purchaseOrderApi.createPurchaseOrder(payload);
        alert('Tạo đơn nhập hàng thành công!');
      }
      onSubmitSuccess();
    } catch (err: any) {
      console.error('Lỗi khi submit form đơn nhập hàng:', err);
      setFormError(err.response?.data?.error || err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="po-form-overlay"> {/* Đã đổi tên class */}
        <div className="po-form-content">Đang tải dữ liệu form...</div> {/* Đã đổi tên class */}
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
        <div className="po-form-overlay"> {/* Đã đổi tên class */}
            <div className="po-form-content"> {/* Đã đổi tên class */}
                <p className="po-form-error">Không có nhà cung cấp nào để tạo đơn nhập hàng. Vui lòng thêm nhà cung cấp trước.</p> {/* Đã đổi tên class */}
                <button type="button" className="admin-button secondary" onClick={onClose}>Đóng</button>
            </div>
        </div>
    );
  }

  if (products.length === 0 && !isEditingExistingOrder) {
    return (
        <div className="po-form-overlay"> {/* Đã đổi tên class */}
            <div className="po-form-content"> {/* Đã đổi tên class */}
                <p className="po-form-error">Không có sản phẩm nào để thêm vào đơn nhập hàng. Vui lòng thêm sản phẩm trước.</p> {/* Đã đổi tên class */}
                <button type="button" className="admin-button secondary" onClick={onClose}>Đóng</button>
            </div>
        </div>
    );
  }
  
  return (
    <div className="po-form-overlay"> {/* Đã đổi tên class */}
      <div className="po-form-content"> {/* Đã đổi tên class */}
        <h2 className="po-form-title">{isEditingExistingOrder ? 'Chỉnh sửa Đơn nhập hàng' : 'Tạo Đơn nhập hàng mới'}</h2> {/* Thêm class cho tiêu đề */}
        {isEditingExistingOrder && (
            <p className="po-form-warning-message"> {/* Đã đổi tên class */}
                **Lưu ý: Chỉ có thể chỉnh sửa thông tin chung của đơn hàng. Không thể thay đổi chi tiết sản phẩm và lô hàng để tránh sai số với kho.**
            </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="po-form-section"> {/* Đã đổi tên class */}
            <h3 className="po-form-subtitle">Thông tin Đơn hàng</h3> {/* Thêm class cho tiêu đề con */}
            <div className="po-form-group"> {/* Đã đổi tên class */}
              <label htmlFor="supplier_id">Nhà cung cấp:</label>
              <select
                id="supplier_id"
                name="supplier_id"
                value={orderData.supplier_id}
                onChange={handleOrderDataChange}
                required
              >
                <option value={0} disabled>Chọn nhà cung cấp</option>
                {suppliers.map(supplier => (
                  <option key={supplier.supplier_id} value={supplier.supplier_id}>{supplier.name}</option>
                ))}
              </select>
            </div>
            <div className="po-form-group"> {/* Đã đổi tên class */}
              <label htmlFor="order_date">Ngày đặt hàng:</label>
              <input
                type="date"
                id="order_date"
                name="order_date"
                value={orderData.order_date}
                onChange={handleOrderDataChange}
                required
              />
            </div>
            <div className="po-form-group"> {/* Đã đổi tên class */}
              <label htmlFor="note">Ghi chú:</label>
              <textarea
                id="note"
                name="note"
                value={orderData.note || ''}
                onChange={handleOrderDataChange}
                rows={3}
              ></textarea>
            </div>
          </div>

          <div className="po-form-section"> {/* Đã đổi tên class */}
            <h3 className="po-form-subtitle">Sản phẩm trong Đơn hàng</h3> {/* Thêm class cho tiêu đề con */}
            {isEditingExistingOrder && orderItems.length === 0 && (
              <p>Đơn hàng này không có chi tiết sản phẩm.</p>
            )}
            {orderItems.map((item, index) => (
              <div key={index} className="po-form-item-group"> {/* Đã đổi tên class */}
                <div className="po-form-group"> {/* Đã đổi tên class */}
                  <label htmlFor={`product_id_${index}`}>Sản phẩm:</label>
                  <select
                    id={`product_id_${index}`}
                    name="product_id"
                    value={item.product_id}
                    onChange={(e) => handleOrderItemChange(index, e)}
                    required
                    disabled={isEditingExistingOrder} 
                  >
                    <option value={0} disabled>Chọn sản phẩm</option>
                    {products.map(product => (
                      <option key={product.product_id} value={product.product_id}>{product.name}</option>
                    ))}
                  </select>
                </div>
                <div className="po-form-group"> {/* Đã đổi tên class */}
                  <label htmlFor={`quantity_${index}`}>Số lượng:</label>
                  <input
                    type="number"
                    id={`quantity_${index}`}
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) => handleOrderItemChange(index, e)}
                    min="1"
                    required
                    disabled={isEditingExistingOrder} 
                  />
                </div>
                <div className="po-form-group"> {/* Đã đổi tên class */}
                  <label htmlFor={`unit_price_${index}`}>Đơn giá nhập:</label>
                  <input
                    type="number"
                    id={`unit_price_${index}`}
                    name="unit_price"
                    value={item.unit_price}
                    onChange={(e) => handleOrderItemChange(index, e)}
                    min="0"
                    step="0.01"
                    required
                    disabled={isEditingExistingOrder} 
                  />
                </div>
                <div className="po-form-group"> {/* Đã đổi tên class */}
                  <label htmlFor={`batch_code_${index}`}>Mã lô:</label>
                  <input
                    type="text"
                    id={`batch_code_${index}`}
                    name="batch_code"
                    value={item.batch_code}
                    onChange={(e) => handleOrderItemChange(index, e)}
                    required
                    disabled={isEditingExistingOrder} 
                  />
                </div>
                <div className="po-form-group"> {/* Đã đổi tên class */}
                  <label htmlFor={`manufacture_date_${index}`}>Ngày SX:</label>
                  <input
                    type="date"
                    id={`manufacture_date_${index}`}
                    name="manufacture_date"
                    value={item.manufacture_date || ''}
                    onChange={(e) => handleOrderItemChange(index, e)}
                    disabled={isEditingExistingOrder} 
                  />
                </div>
                <div className="po-form-group"> {/* Đã đổi tên class */}
                  <label htmlFor={`expiry_date_${index}`}>Hạn sử dụng:</label>
                  <input
                    type="date"
                    id={`expiry_date_${index}`}
                    name="expiry_date"
                    value={item.expiry_date}
                    onChange={(e) => handleOrderItemChange(index, e)}
                    required
                    disabled={isEditingExistingOrder} 
                  />
                </div>
                
                {!isEditingExistingOrder && ( // Chỉ hiển thị nút xóa khi TẠO MỚI
                  <button type="button" className="admin-button danger small" onClick={() => handleRemoveOrderItem(index)}>
                    Xóa
                  </button>
                )}
              </div>
            ))}
            {!isEditingExistingOrder && ( // Chỉ hiển thị nút thêm khi TẠO MỚI
              <button type="button" className="admin-button secondary small" onClick={handleAddOrderItem}>
                Thêm sản phẩm
              </button>
            )}
          </div>

          {formError && <p className="po-form-error">{formError}</p>} {/* Đã đổi tên class */}
          <div className="po-form-actions"> {/* Đã đổi tên class */}
            <button type="submit" className="admin-button primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : (isEditingExistingOrder ? 'Cập nhật Đơn hàng' : 'Tạo Đơn hàng')}
            </button>
            <button type="button" className="admin-button default" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrderFormModal;