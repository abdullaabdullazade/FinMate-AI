/**
 * Dream Vault Page Component
 * Tam funksionallıqla Dream Vault səhifəsi
 * HTML/CSS/JS-dən React-ə köçürülmüş versiya
 */

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { dreamVaultAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

// Dream Vault Components
import DreamVaultHeader from '../components/dreamvault/DreamVaultHeader'
import DreamStats from '../components/dreamvault/DreamStats'
import DreamCard from '../components/dreamvault/DreamCard'
import CompletedDreamCard from '../components/dreamvault/CompletedDreamCard'
import DreamEmptyState from '../components/dreamvault/DreamEmptyState'
import AddDreamModal from '../components/dreamvault/AddDreamModal'
import EditDreamModal from '../components/dreamvault/EditDreamModal'
import DeleteConfirmModal from '../components/dreamvault/DeleteConfirmModal'

// Styles
import '../styles/pages/dreamvault.css'

const DreamVault = () => {
  const { user } = useAuth()
  const [dreams, setDreams] = useState([])
  const [completedDreams, setCompletedDreams] = useState([])
  const [stats, setStats] = useState({
    totalSaved: 0,
    totalTarget: 0,
    totalProgress: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingDream, setEditingDream] = useState(null)
  const [deletingDream, setDeletingDream] = useState(null)

  /**
   * Dreams məlumatlarını yüklə
   */
  useEffect(() => {
    fetchDreams()
    fetchStats()
  }, [])

  /**
   * Dreams fetch et
   */
  const fetchDreams = async () => {
    try {
      setLoading(true)
      const response = await dreamVaultAPI.getDreams()
      
      // Check if response exists
      if (!response) {
        throw new Error('No response from server')
      }

      // Check if response.data exists
      if (!response.data) {
        throw new Error('Invalid response format: missing data')
      }

      // Check for success response with dreams array
      if (response.data.success === true && Array.isArray(response.data.dreams)) {
        const active = response.data.dreams.filter(d => !d.is_completed)
        const completed = response.data.dreams.filter(d => d.is_completed)
        setDreams(active)
        setCompletedDreams(completed)
      } else if (Array.isArray(response.data.dreams)) {
        // Fallback for old format (without success flag)
        const active = response.data.dreams.filter(d => {
          const progress = d.target_amount > 0 ? (d.saved_amount / d.target_amount) * 100 : 0
          return progress < 100
        })
        const completed = response.data.dreams.filter(d => {
          const progress = d.target_amount > 0 ? (d.saved_amount / d.target_amount) * 100 : 0
          return progress >= 100
        })
        setDreams(active)
        setCompletedDreams(completed)
      } else if (response.data.success === false) {
        // API returned error
        throw new Error(response.data.error || 'Arzular yüklənə bilmədi')
      } else {
        // Unexpected format
        console.warn('Unexpected response format:', response.data)
        setDreams([])
        setCompletedDreams([])
      }
    } catch (error) {
      console.error('Dreams fetch error:', error)
      let errorMessage = 'Arzular yüklənərkən xəta baş verdi'
      
      if (error.response) {
        // Server error
        errorMessage = error.response.data?.error || error.response.statusText || errorMessage
      } else if (error.message) {
        // Custom error message
        errorMessage = error.message
      }
      
      toast.error(errorMessage, { autoClose: 5000 })
      setDreams([])
      setCompletedDreams([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Stats fetch et
   */
  const fetchStats = async () => {
    try {
      const response = await dreamVaultAPI.getDreamStats()
      if (response.data) {
        setStats({
          totalSaved: response.data.total_saved || 0,
          totalTarget: response.data.total_target || 0,
          totalProgress: response.data.total_progress || 0,
        })
      }
    } catch (error) {
      console.error('Stats fetch error:', error)
    }
  }

  /**
   * Yeni dream yarat
   */
  const handleCreateDream = async (dreamData) => {
    try {
      // Check limit (max 5 active dreams)
      if (dreams.length >= 5) {
        toast.warning('⚠️ Maksimum 5 arzu yarada bilərsiniz!', { autoClose: 5000 })
        return
      }

      const formData = new FormData()
      Object.keys(dreamData).forEach(key => {
        if (dreamData[key] !== null && dreamData[key] !== '') {
          formData.append(key, dreamData[key])
        }
      })

      const response = await dreamVaultAPI.createDream(formData)
      
      if (response.data && response.data.success) {
        toast.success('✅ Arzu uğurla yaradıldı! (+25 XP)', {
          className: 'coin-toast-success',
          autoClose: 5000,
        })
        await fetchDreams()
        await fetchStats()
        window.dispatchEvent(new CustomEvent('dreamUpdated'))
      } else {
        toast.error(response.data?.error || 'Xəta baş verdi', { autoClose: 5000 })
      }
    } catch (error) {
      console.error('Create dream error:', error)
      toast.error(error.response?.data?.error || 'Arzu yaradılarkən xəta baş verdi', { autoClose: 5000 })
    }
  }

  /**
   * Dream redaktə et
   */
  const handleEditDream = (dream) => {
    setEditingDream(dream)
  }

  /**
   * Dream yenilə
   */
  const handleUpdateDream = async (dreamData) => {
    try {
      const response = await dreamVaultAPI.updateDream(editingDream.id, dreamData)
      
      if (response.data && response.data.success) {
        toast.success('✅ Arzu uğurla yeniləndi', { autoClose: 5000 })
        await fetchDreams()
        await fetchStats()
        setEditingDream(null)
        window.dispatchEvent(new CustomEvent('dreamUpdated'))
      } else {
        toast.error(response.data?.error || 'Xəta baş verdi', { autoClose: 5000 })
      }
    } catch (error) {
      console.error('Update dream error:', error)
      toast.error(error.response?.data?.error || 'Arzu yenilənərkən xəta baş verdi', { autoClose: 5000 })
    }
  }

  /**
   * Dream sil - modal aç
   */
  const handleDeleteDream = (dreamId) => {
    const dream = dreams.find(d => d.id === dreamId) || completedDreams.find(d => d.id === dreamId)
    setDeletingDream({ id: dreamId, title: dream?.title || 'Bu arzu' })
  }

  /**
   * Dream sil - təsdiq
   */
  const confirmDeleteDream = async () => {
    if (!deletingDream) return

    try {
      const response = await dreamVaultAPI.deleteDream(deletingDream.id)
      
      if (response.ok || (response.data && response.data.success)) {
        toast.success('✅ Arzu uğurla silindi', { autoClose: 5000 })
        setDeletingDream(null)
        await fetchDreams()
        await fetchStats()
        window.dispatchEvent(new CustomEvent('dreamUpdated'))
      } else {
        toast.error('Arzu silinərkən xəta baş verdi', { autoClose: 5000 })
      }
    } catch (error) {
      console.error('Delete dream error:', error)
      toast.error('Arzu silinərkən xəta baş verdi', { autoClose: 5000 })
    }
  }

  /**
   * Qənaət əlavə et
   */
  const handleAddSavings = async (dreamId, amount) => {
    try {
      // Əvvəlcə dreams-i yenilə
      await fetchDreams()
      // Sonra stats-i yenilə - bu Ümumi Qənaəti yeniləyəcək
      await fetchStats()
      window.dispatchEvent(new CustomEvent('dreamUpdated'))
    } catch (error) {
      console.error('Add savings update error:', error)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="px-3 sm:px-4 md:px-6 pb-24 sm:pb-32">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white">Yüklənir...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 sm:px-4 md:px-6 pb-24 sm:pb-32">
      {/* Header */}
      <DreamVaultHeader onAddDream={() => setShowAddModal(true)} />

      {/* Stats */}
      <DreamStats
        totalSaved={stats.totalSaved}
        totalTarget={stats.totalTarget}
        totalProgress={stats.totalProgress}
      />

      {/* Active Dreams */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
          <span className="text-xl sm:text-2xl">🌟</span>
          <span className="truncate">Aktiv Arzular ({dreams.length})</span>
        </h2>

        {dreams.length === 0 ? (
          <DreamEmptyState onAddDream={() => setShowAddModal(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {dreams.map((dream) => (
              <DreamCard
                key={dream.id}
                dream={dream}
                onEdit={handleEditDream}
                onDelete={handleDeleteDream}
                onAddSavings={handleAddSavings}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Dreams */}
      {completedDreams.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-600/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span className="truncate">Tamamlanmış Arzular</span>
              <span className="text-base sm:text-lg text-white/60 flex-shrink-0">({completedDreams.length})</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {completedDreams.map((dream) => (
              <CompletedDreamCard key={dream.id} dream={dream} />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddDreamModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateDream}
      />

      {editingDream && (
        <EditDreamModal
          isOpen={!!editingDream}
          onClose={() => setEditingDream(null)}
          dream={editingDream}
          onSubmit={handleUpdateDream}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingDream}
        onClose={() => setDeletingDream(null)}
        onConfirm={confirmDeleteDream}
        dreamTitle={deletingDream?.title}
      />
    </div>
  )
}

export default DreamVault
