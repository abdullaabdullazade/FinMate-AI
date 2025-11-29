/**
 * Add Dream Modal Component
 * HTML/CSS-dən bir-bir köçürülmüş versiya
 */

import React, { useState } from 'react'

const AddDreamModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    priority: 3,
    category: 'Digər',
    image_url: '',
    target_date: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.target_amount) {
      return
    }
    
    onSubmit(formData)
    setFormData({
      title: '',
      description: '',
      target_amount: '',
      priority: 3,
      category: 'Digər',
      image_url: '',
      target_date: '',
    })
    onClose()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'priority' ? parseInt(value) : value,
    }))
  }

  if (!isOpen) return null

  const today = new Date().toISOString().split('T')[0]

  return (
    <div 
      className={`fixed inset-0 z-50 backdrop-blur-sm transition-opacity duration-300 overflow-y-auto ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}
      style={{ backgroundColor: 'var(--glass-shadow)' }}
      onClick={onClose}
    >
      <div className="flex items-start sm:items-center justify-center min-h-screen px-3 sm:px-4 py-4 sm:py-8">
        <div 
          className="glass-card p-4 sm:p-6 w-full max-w-md transform transition-transform duration-300 my-auto mx-4 max-h-[90vh] overflow-y-auto"
          style={{
            transform: isOpen ? 'scale(1)' : 'scale(0.95)',
            background: 'var(--glass-bg)',
            borderColor: 'var(--glass-border)',
            boxShadow: '0 25px 50px -12px var(--glass-shadow)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-white">Yeni Arzu Əlavə Et</h3>
            <button onClick={onClose} className="text-white/50 hover:text-white flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm text-white/70 mb-1.5 sm:mb-2">Arzu Adı *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title}
                  onChange={handleChange}
                  required 
                  placeholder="Məs: PS5, Yeni Maşın, Səyahət"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-white/70 mb-1.5 sm:mb-2">Təsvir</label>
                <textarea 
                  name="description" 
                  value={formData.description}
                  onChange={handleChange}
                  rows="3" 
                  placeholder="Arzunuz haqqında ətraflı məlumat"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 transition resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm text-white/70 mb-1.5 sm:mb-2">Məqsəd Məbləğ (AZN) *</label>
                  <input 
                    type="number" 
                    name="target_amount" 
                    value={formData.target_amount}
                    onChange={handleChange}
                    step="0.01" 
                    min="0" 
                    required 
                    placeholder="2999"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-white/70 mb-1.5 sm:mb-2">Prioritet (1-5)</label>
                  <input 
                    type="number" 
                    name="priority" 
                    value={formData.priority}
                    onChange={handleChange}
                    min="1" 
                    max="5" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-white/70 mb-1.5 sm:mb-2">Kateqoriya</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 transition"
                >
                  <option value="Digər" className="text-black">Digər</option>
                  <option value="Səyahət" className="text-black">Səyahət</option>
                  <option value="Gadget" className="text-black">Gadget</option>
                  <option value="Maşın" className="text-black">Maşın</option>
                  <option value="Ev" className="text-black">Ev</option>
                  <option value="Təhsil" className="text-black">Təhsil</option>
                  <option value="Əyləncə" className="text-black">Əyləncə</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-white/70 mb-1.5 sm:mb-2">Şəkil URL (opsional)</label>
                <input 
                  type="url" 
                  name="image_url" 
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-white/70 mb-1.5 sm:mb-2">Məqsəd Tarix (opsional)</label>
                <input 
                  type="date" 
                  name="target_date" 
                  value={formData.target_date}
                  onChange={handleChange}
                  min={today}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <button 
                type="submit"
                className="w-full text-white text-sm sm:text-base font-bold py-2.5 sm:py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] transition mt-3 sm:mt-4"
                style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)' }}
              >
                💎 Arzu Yarat
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddDreamModal
