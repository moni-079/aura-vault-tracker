import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './App.css';

ChartJS.register(ArcElement, Tooltip);

const App = () => {
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('vault_v11')) || []);
  const [input, setInput] = useState({ text: '', amount: '', cat: 'Food', date: '' });
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All Categories');
  const [editId, setEditId] = useState(null);

  useEffect(() => localStorage.setItem('vault_v11', JSON.stringify(data)), [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.text || !input.amount || !input.date) return;
    if (editId) {
      setData(data.map(item => item.id === editId ? { ...input, id: editId } : item));
      setEditId(null);
    } else {
      setData([{ ...input, id: Date.now() }, ...data]);
    }
    setInput({ text: '', amount: '', cat: 'Food', date: '' });
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setInput({ text: item.text, amount: item.amount, cat: item.cat, date: item.date });
  };

  const deleteItem = (id) => setData(data.filter(item => item.id !== id));

  const filteredData = data.filter(item => {
    const matchesSearch = item.text.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === 'All Categories' || item.cat === filterCat;
    return matchesSearch && matchesCat;
  });

  const totalExpense = data.reduce((acc, item) => acc + parseFloat(item.amount || 0), 0);

  return (
    <div className="app-container">
      <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="vault-layout">
          
          <aside className="sidebar">
            <div className="brand">VAULT<span>.</span>PRO</div>
            <div className="chart-box">
              <Doughnut data={{
                datasets: [{
                  data: [totalExpense || 1, 0],
                  backgroundColor: ['#5eead4', 'rgba(255,255,255,0.05)'],
                  borderWidth: 0, cutout: '85%'
                }]
              }} options={{ plugins: { tooltip: { enabled: false } } }} />
              <div className="chart-label"><h3>${totalExpense.toFixed(0)}</h3></div>
            </div>
            <div className="burn-box">
              <small>DAILY BURN RATE</small>
              <span className="burn-val">${(totalExpense / 30).toFixed(2)} / day</span>
            </div>
          </aside>

          <main className="main-content">
            <div className="stats-header">
              <div className="pill">Filtered: <span>${filteredData.reduce((a,b) => a + +b.amount, 0).toFixed(2)}</span></div>
              <div className="pill">Total: <span>${totalExpense.toFixed(2)}</span></div>
              <div className="pill">Items: <span>{data.length}</span></div>
            </div>

            <form className="input-area" onSubmit={handleSubmit}>
              <div className="input-row">
                <input type="text" placeholder="Title" value={input.text} onChange={e => setInput({...input, text: e.target.value})} />
                <input type="number" placeholder="$" value={input.amount} onChange={e => setInput({...input, amount: e.target.value})} />
                <select value={input.cat} onChange={e => setInput({...input, cat: e.target.value})}>
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Bills</option>
                  <option>Shopping</option>
                  <option>Others</option>
                </select>
                <input type="date" value={input.date} onChange={e => setInput({...input, date: e.target.value})} />
                <button type="submit" className="prime-btn">{editId ? '✓' : '+'}</button>
              </div>
            </form>

            <div className="filter-row">
              <input type="text" placeholder="Search transactions..." onChange={e => setSearch(e.target.value)} />
              <select className="orange-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                <option>All Categories</option>
                <option>Food</option>
                <option>Transport</option>
                <option>Bills</option>
                <option>Shopping</option>
                <option>Others</option>
              </select>
            </div>

            <div className="scroll-list">
              <AnimatePresence>
                {filteredData.map(item => (
                  <motion.div 
                    key={item.id} 
                    layout 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className={`item-row cat-${item.cat.toLowerCase()}`}
                  >
                    <div className="txt">
                      <strong>{item.text}</strong>
                      <small>{item.cat} • {item.date}</small>
                    </div>
                    <div className="act">
                      <b className="price-tag">${parseFloat(item.amount).toLocaleString()}</b>
                      <button onClick={() => startEdit(item)}>✎</button>
                      <button onClick={() => deleteItem(item.id)}>×</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </motion.div>
    </div>
  );
};

export default App;