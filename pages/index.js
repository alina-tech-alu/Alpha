import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { Ship, Package, Wrench, Building, TrendingUp, AlertCircle, CheckCircle, MapPin } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [ships, setShips] = useState([])
  const [containers, setContainers] = useState([])
  const [units, setUnits] = useState([])
  const [selectedShip, setSelectedShip] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: shipsData } = await supabase.from('ships').select('*')
    const { data: containersData } = await supabase.from('containers').select('*')
    const { data: unitsData } = await supabase.from('units').select('*')
    
    setShips(shipsData || [])
    setContainers(containersData || [])
    setUnits(unitsData || [])
    setLoading(false)
  }

  const getStatusColor = (status) => {
    const colors = {
      'waiting': 'bg-red-100 text-red-800',
      'customs': 'bg-yellow-100 text-yellow-800',
      'ready-cut': 'bg-blue-100 text-blue-800',
      'production': 'bg-orange-100 text-orange-800',
      'complete': 'bg-green-100 text-green-800',
      'בדרך': 'bg-blue-100 text-blue-800',
      'במכס': 'bg-yellow-100 text-yellow-800',
      'במחסן': 'bg-green-100 text-green-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const totalUnits = units.reduce((sum, u) => sum + (u.qty || 0), 0)
  const completedUnits = units.filter(u => u.status === 'complete').reduce((sum, u) => sum + (u.qty || 0), 0)
  const overallProgress = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0

  if (loading) return <div className="min-h-screen flex items-center justify-center">טוען...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">מגדלי היצירה</h1>
          <p className="text-gray-600">מערכת ניהול ייצור</p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            <TrendingUp className="inline w-4 h-4 ml-2" />
            סיכום
          </button>
          <button onClick={() => setActiveTab('map')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'map' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            <MapPin className="inline w-4 h-4 ml-2" />
            מפת אוניות
          </button>
          <button onClick={() => setActiveTab('logistics')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'logistics' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            <Ship className="inline w-4 h-4 ml-2" />
            לוגיסטיקה
          </button>
          <button onClick={() => setActiveTab('production')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'production' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            <Wrench className="inline w-4 h-4 ml-2" />
            ייצור
          </button>
          <button onClick={() => setActiveTab('projectmap')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'projectmap' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
            <Building className="inline w-4 h-4 ml-2" />
            מפת פרויקט
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600 mb-1">התקדמות כללית</div>
                <div className="text-3xl font-bold text-blue-600">{overallProgress}%</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: `${overallProgress}%`}}></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600 mb-1">הושלם</div>
                <div className="text-3xl font-bold text-green-600">{completedUnits}</div>
                <div className="text-sm text-gray-500">מתוך {totalUnits} יחידות</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600 mb-1">בייצור</div>
                <div className="text-3xl font-bold text-orange-600">
                  {units.filter(u => u.status === 'production' || u.status === 'ready-cut').reduce((s, u) => s + (u.qty || 0), 0)}
                </div>
                <div className="text-sm text-gray-500">יחידות</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600 mb-1">אוניות בדרך</div>
                <div className="text-3xl font-bold text-blue-600">{ships.length}</div>
                <div className="text-sm text-gray-500">יחידות</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">מה נותר עד סיום הפרויקט</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">יחידות שנותרו</span>
                  <span className="font-semibold">{totalUnits - completedUnits}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">ממתינים לחומרים</span>
                  <span className="font-semibold text-red-600">
                    {units.filter(u => u.status === 'waiting').reduce((s, u) => s + (u.qty || 0), 0)} יחידות
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">מפת אוניות בזמן אמת</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="relative w-full h-96 bg-blue-50 rounded-lg border-2 border-blue-200">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <rect width="100" height="100" fill="#e0f2fe" />
                  <path d="M 60 20 L 90 20 L 90 60 L 60 60 Z" fill="#d1d5db" opacity="0.5" />
                  <path d="M 40 40 L 55 40 L 55 65 L 40 65 Z" fill="#d1d5db" opacity="0.5" />
                </svg>
                {ships.map((ship, idx) => (
                  <div key={idx} className="absolute cursor-pointer" style={{ right: `${ship.lng}%`, top: `${ship.lat}%`, transform: 'translate(50%, -50%)' }} onClick={() => setSelectedShip(ship)}>
                    <Ship className="w-6 h-6 text-blue-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logistics' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">מכולות ומשלוחים</h2>
            {containers.map(container => (
              <div key={container.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{container.id}</h3>
                    <p className="text-gray-600">אונייה: {container.ship}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(container.status)}`}>
                    {container.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'production' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">סוגי עבודות ומוכנות</h2>
            {units.map(unit => (
              <div key={unit.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{unit.id}</h3>
                    <p className="text-gray-600">קומה {unit.floor}, חזית {unit.facade} • {unit.qty} יח׳</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(unit.status)}`}>
                    {unit.status}
                  </span>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">התקדמות</span>
                    <span className="text-sm text-gray-600">{unit.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: `${unit.progress}%`}}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'projectmap' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">מפת פרויקט (קומות × חזיתות)</h2>
            <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-3 bg-gray-50">קומה</th>
                    <th className="border p-3 bg-gray-50">חזית A</th>
                    <th className="border p-3 bg-gray-50">חזית B</th>
                    <th className="border p-3 bg-gray-50">חזית C</th>
                  </tr>
                </thead>
                <tbody>
                  {[5, 4, 3, 2].map(floor => (
                    <tr key={floor}>
                      <td className="border p-3 font-semibold text-center bg-gray-50">קומה {floor}</td>
                      {['A', 'B', 'C'].map(facade => {
                        const unit = units.find(u => u.floor === floor && u.facade === facade)
                        return (
                          <td key={facade} className="border p-3">
                            {unit ? (
                              <div className={`p-3 rounded ${
                                unit.status === 'complete' ? 'bg-green-100' :
                                unit.status === 'production' ? 'bg-orange-100' :
                                'bg-red-100'
                              }`}>
                                <div className="font-semibold">{unit.id}</div>
                                <div className="text-sm">{unit.qty} יח׳</div>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-center">—</div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
