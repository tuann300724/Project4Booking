import React, { useEffect, useState } from 'react';
import axios from 'axios';

const initialPrize = {
  label: '',
  color: '#ff6b6b',
  code: '',
  value: '',
  discountType: 'percentage',
};

const AdminPrizes = () => {
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialPrize);
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(initialPrize);

  const fetchPrizes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:8080/api/prizes');
      setPrizes(res.data);
    } catch (err) {
      setError('Lỗi khi tải danh sách phần thưởng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrizes();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:8080/api/prizes', form);
      setSuccess('Thêm mới thành công!');
      setForm(initialPrize);
      fetchPrizes();
    } catch (err) {
      setError('Lỗi khi lưu phần thưởng');
    }
  };

  const handleEdit = (prize) => {
    setEditForm(prize);
    setEditingId(prize.id);
    setShowEditModal(true);
    setSuccess('');
    setError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.put(`http://localhost:8080/api/prizes/${editingId}`, editForm);
      setSuccess('Cập nhật thành công!');
      setShowEditModal(false);
      setEditingId(null);
      fetchPrizes();
    } catch (err) {
      setError('Lỗi khi cập nhật phần thưởng');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xoá phần thưởng này?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/prizes/${id}`);
      setSuccess('Xoá thành công!');
      fetchPrizes();
    } catch (err) {
      setError('Lỗi khi xoá phần thưởng');
    }
  };

  const handleCancel = () => {
    setForm(initialPrize);
    setEditingId(null);
    setSuccess('');
    setError('');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Quản lý Wheel Prize</h2>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {success && <div className="mb-2 text-green-600">{success}</div>}
      {/* Form thêm mới chỉ hiển thị khi chưa đủ 8 prize */}
      {prizes.length < 8 && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input name="label" value={form.label} onChange={handleChange} placeholder="Tên phần thưởng" className="border p-2 rounded" required />
          <input name="color" value={form.color} onChange={handleChange} placeholder="Màu sắc (#hex)" className="border p-2 rounded" required />
          <input name="code" value={form.code} onChange={handleChange} placeholder="Mã code (nếu có)" className="border p-2 rounded" />
          <input name="value" value={form.value} onChange={handleChange} placeholder="Giá trị (10%, 50.000đ...)" className="border p-2 rounded" />
          <select name="discountType" value={form.discountType} onChange={handleChange} className="border p-2 rounded">
            <option value="percentage">Phần trăm</option>
            <option value="fixed">Số tiền cố định</option>
            <option value="none">Không áp dụng</option>
          </select>
          <div className="flex gap-2 items-center">
            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Thêm mới
            </button>
          </div>
        </form>
      )}
      {prizes.length >= 8 && (
        <div className="mb-4 text-red-500 font-medium">Đã đủ 8 phần thưởng, chỉ có thể sửa hoặc xoá!</div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Tên</th>
              <th className="p-2 border">Màu</th>
              <th className="p-2 border">Code</th>
              <th className="p-2 border">Giá trị</th>
              <th className="p-2 border">Loại</th>
              <th className="p-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center p-4">Đang tải...</td></tr>
            ) : prizes.length === 0 ? (
              <tr><td colSpan={6} className="text-center p-4">Không có phần thưởng nào</td></tr>
            ) : (
              prizes.map((prize) => (
                <tr key={prize.id}>
                  <td className="border p-2">{prize.label}</td>
                  <td className="border p-2"><span className="inline-block w-6 h-6 rounded-full" style={{background: prize.color}} title={prize.color}></span></td>
                  <td className="border p-2">{prize.code || '-'}</td>
                  <td className="border p-2">{prize.value}</td>
                  <td className="border p-2">{prize.discountType}</td>
                  <td className="border p-2">
                    <button onClick={() => handleEdit(prize)} className="text-blue-600 hover:underline mr-2">Sửa</button>
                    <button onClick={() => handleDelete(prize.id)} className="text-red-600 hover:underline">Xoá</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal edit */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">✕</button>
            <h3 className="text-xl font-bold mb-4">Sửa phần thưởng</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input name="label" value={editForm.label} onChange={handleEditChange} placeholder="Tên phần thưởng" className="border p-2 rounded w-full" required />
              <input name="color" value={editForm.color} onChange={handleEditChange} placeholder="Màu sắc (#hex)" className="border p-2 rounded w-full" required />
              <input name="code" value={editForm.code} onChange={handleEditChange} placeholder="Mã code (nếu có)" className="border p-2 rounded w-full" />
              <input name="value" value={editForm.value} onChange={handleEditChange} placeholder="Giá trị (10%, 50.000đ...)" className="border p-2 rounded w-full" />
              <select name="discountType" value={editForm.discountType} onChange={handleEditChange} className="border p-2 rounded w-full">
                <option value="percentage">Phần trăm</option>
                <option value="fixed">Số tiền cố định</option>
                <option value="none">Không áp dụng</option>
              </select>
              <div className="flex gap-2 items-center">
                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Lưu</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="bg-gray-300 px-3 py-2 rounded hover:bg-gray-400">Huỷ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrizes;
