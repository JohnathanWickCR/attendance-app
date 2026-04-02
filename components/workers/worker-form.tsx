'use client';

import { useState } from 'react';

export default function WorkerForm() {
  const [form, setForm] = useState({
    worker_code: '',
    full_name: '',
    team_name: '',
    skill_name: '',
    labor_rate_per_hour: 0,
    overtime_multiplier: 1.5,
  });

 async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  try {
    const res = await fetch('/api/workers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      alert('Tạo thành công');
      window.location.reload();
    } else {
      alert(JSON.stringify(data));
    }
  } catch (error) {
    alert('Lỗi fetch: ' + String(error));
  }
}

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border p-4 rounded">
      <h2 className="font-bold">Thêm công nhân</h2>

      <input placeholder="Mã" className="border p-2 w-full"
        onChange={e => setForm({ ...form, worker_code: e.target.value })} />

      <input placeholder="Họ tên" className="border p-2 w-full"
        onChange={e => setForm({ ...form, full_name: e.target.value })} />

      <input placeholder="Tổ đội" className="border p-2 w-full"
        onChange={e => setForm({ ...form, team_name: e.target.value })} />

      <input placeholder="Tay nghề" className="border p-2 w-full"
        onChange={e => setForm({ ...form, skill_name: e.target.value })} />

      <input type="number" placeholder="Đơn giá"
        className="border p-2 w-full"
        onChange={e => setForm({ ...form, labor_rate_per_hour: Number(e.target.value) })} />

      <button className="bg-black text-white px-4 py-2 rounded">
        Lưu
      </button>
    </form>
  );
}