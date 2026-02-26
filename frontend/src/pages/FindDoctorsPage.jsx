import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, MapPin, Star, Phone, Mail, Clock, Calendar,
  ChevronRight, Stethoscope, Award, Languages, IndianRupee,
  X, Check, Loader2, Building2, Navigation, AlertCircle
} from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:8000'

// City coordinates for distance calculation
const CITY_COORDS = {
  'Delhi':      { lat: 28.6139, lng: 77.2090 },
  'Mumbai':     { lat: 19.0760, lng: 72.8777 },
  'Chennai':    { lat: 13.0827, lng: 80.2707 },
  'Pune':       { lat: 18.5204, lng: 73.8567 },
  'Kochi':      { lat: 9.9312,  lng: 76.2673 },
  'Ahmedabad':  { lat: 23.0225, lng: 72.5714 },
  'Hyderabad':  { lat: 17.3850, lng: 78.4867 },
  'Chandigarh': { lat: 30.7333, lng: 76.7794 },
}

// Haversine distance in km
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-600'}`} />
    ))}
    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{rating}</span>
  </div>
)

// ── Doctor detail drawer ──────────────────────────────────────────────────────
const DoctorDrawer = ({ doctor, onClose, onBook }) => {
  const [selectedSlot, setSelectedSlot] = useState('')
  const [selectedDay,  setSelectedDay]  = useState('')
  const DAYS_FULL = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 py-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Doctor Details</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 transition">
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg flex-shrink-0">
              {doctor.image_placeholder}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{doctor.name}</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{doctor.specialty}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{doctor.qualification}</p>
              <div className="mt-2 flex items-center gap-3 flex-wrap">
                <StarRating rating={doctor.rating} />
                <span className="text-xs text-gray-400">({doctor.review_count} reviews)</span>
              </div>
              {doctor.distance_km != null && (
                <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <Navigation className="w-3 h-3" /> {doctor.distance_km} km from you
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full font-medium">
              <Award className="w-3 h-3" /> {doctor.experience_years} yrs exp
            </span>
            <span className="flex items-center gap-1 text-xs px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full font-medium">
              <IndianRupee className="w-3 h-3" /> ₹{doctor.consultation_fee} consult
            </span>
            <span className="flex items-center gap-1 text-xs px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full font-medium">
              <Languages className="w-3 h-3" /> {doctor.languages.join(', ')}
            </span>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{doctor.clinic}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{doctor.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a href={`tel:${doctor.phone}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{doctor.phone}</a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a href={`mailto:${doctor.email}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{doctor.email}</a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Specializes In</p>
            <div className="flex flex-wrap gap-2">
              {doctor.specializes_in.map(s => (
                <span key={s} className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg">{s}</span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-500" /> Available Days
            </p>
            <div className="flex flex-wrap gap-2">
              {doctor.available_days.map(day => (
                <button key={day} onClick={() => setSelectedDay(d => d === day ? '' : day)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${selectedDay === day ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  {DAYS_FULL[day] || day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" /> Available Time Slots
            </p>
            <div className="grid grid-cols-2 gap-2">
              {doctor.available_slots.map(slot => (
                <button key={slot} onClick={() => setSelectedSlot(s => s === slot ? '' : slot)}
                  className={`text-sm py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-1.5 ${selectedSlot === slot ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 hover:bg-blue-50'}`}
                >
                  {selectedSlot === slot && <Check className="w-3.5 h-3.5" />}
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => onBook(doctor, selectedSlot, selectedDay)}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-cyan-600 transition shadow-lg flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" /> Book Appointment
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Doctor card ───────────────────────────────────────────────────────────────
const DoctorCard = ({ doctor, onSelect, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all cursor-pointer group"
    onClick={() => onSelect(doctor)}
  >
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
        {doctor.image_placeholder}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{doctor.name}</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{doctor.specialty}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0 group-hover:text-blue-500 transition-colors mt-0.5" />
        </div>
        <StarRating rating={doctor.rating} />
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Building2 className="w-3 h-3" /> {doctor.city} · {doctor.clinic}
          </span>
          {doctor.distance_km != null && (
            <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <Navigation className="w-3 h-3" /> {doctor.distance_km} km
            </span>
          )}
        </div>
      </div>
    </div>

    <div className="mt-4 flex items-center justify-between">
      <div className="flex flex-wrap gap-1.5">
        {doctor.specializes_in.slice(0, 2).map(s => (
          <span key={s} className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg">{s}</span>
        ))}
        {doctor.specializes_in.length > 2 && (
          <span className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-700 text-gray-400 rounded-lg">+{doctor.specializes_in.length - 2}</span>
        )}
      </div>
      <div className="flex items-center gap-1 text-sm font-bold text-gray-800 dark:text-white">
        <IndianRupee className="w-3.5 h-3.5" />{doctor.consultation_fee}
      </div>
    </div>

    <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
      <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {doctor.experience_years} yrs</span>
      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {doctor.available_slots.length} slots/day</span>
      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {doctor.available_days.join(', ')}</span>
    </div>
  </motion.div>
)

// ═══════════════════════════════════════════════════════════════════════════════
//  FIND DOCTORS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const FindDoctorsPage = () => {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  const [doctors,     setDoctors]     = useState([])
  const [cities,      setCities]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [cityFilter,  setCityFilter]  = useState('')
  const [selected,    setSelected]    = useState(null)
  const [userLocation, setUserLocation] = useState(null)   // { lat, lng }
  const [gpsLoading,   setGpsLoading]  = useState(false)
  const [gpsError,     setGpsError]    = useState('')
  const [sortByDist,   setSortByDist]  = useState(false)

  const fetchDoctors = async (city = cityFilter, q = search) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (city) params.append('city', city)
      if (q)    params.append('search', q)
      const r = await axios.get(`${API}/doctors?${params}`)
      let docs = r.data.doctors || []

      // Attach distance if user location known
      if (userLocation) {
        docs = docs.map(d => {
          const coords = CITY_COORDS[d.city]
          const dist = coords
            ? Math.round(getDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng))
            : null
          return { ...d, distance_km: dist }
        })
        if (sortByDist) docs.sort((a, b) => (a.distance_km ?? 9999) - (b.distance_km ?? 9999))
      }

      setDoctors(docs)
    } catch {
      setDoctors([])
    }
    setLoading(false)
  }

  const fetchCities = async () => {
    try {
      const r = await axios.get(`${API}/doctors/cities`)
      setCities(r.data.cities || [])
    } catch {}
  }

  useEffect(() => { fetchCities() }, [])
  useEffect(() => { fetchDoctors() }, [cityFilter, userLocation, sortByDist])

  const handleSearch = (e) => { e.preventDefault(); fetchDoctors(cityFilter, search) }

  const detectLocation = () => {
    if (!navigator.geolocation) { setGpsError('Geolocation not supported by your browser'); return }
    setGpsLoading(true); setGpsError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setSortByDist(true)
        setGpsLoading(false)
      },
      () => {
        setGpsError('Could not get your location. Please allow location access.')
        setGpsLoading(false)
      }
    )
  }

  const handleBook = (doctor, slot, day) => {
    if (!isLoggedIn) { navigate('/login'); return }
    navigate('/appointments/book', { state: { doctor, slot, day } })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white pt-12 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm mb-4">
              <Stethoscope className="w-4 h-4" /> Find Verified Dermatologists Near You
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Find a Doctor Near You</h1>
            <p className="text-blue-100 text-base max-w-xl mx-auto">
              Use GPS to find the closest dermatologists or search by city. Book appointments instantly.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.form onSubmit={handleSearch} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-8 flex gap-2 max-w-xl mx-auto"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search doctor, specialty, condition..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-gray-900 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <button type="submit" className="px-5 py-3.5 bg-white text-blue-700 font-semibold rounded-2xl shadow-lg hover:bg-blue-50 transition text-sm">
              Search
            </button>
          </motion.form>

          {/* GPS Button */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4">
            <button onClick={detectLocation} disabled={gpsLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-2xl transition text-sm border border-white/30 disabled:opacity-60"
            >
              {gpsLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Detecting location...</>
                : <><Navigation className="w-4 h-4" /> {userLocation ? 'Location detected ✓' : 'Use My Location'}</>
              }
            </button>
            {gpsError && (
              <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-red-200">
                <AlertCircle className="w-3.5 h-3.5" /> {gpsError}
              </div>
            )}
            {userLocation && (
              <p className="text-xs text-blue-200 mt-1">Showing doctors sorted by distance from your location</p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6">
        {/* City filter pills */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex gap-2 flex-wrap mb-4"
        >
          <button onClick={() => setCityFilter('')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition ${!cityFilter ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}
          >
            <MapPin className="w-3.5 h-3.5" /> All Cities
          </button>
          {cities.map(city => (
            <button key={city} onClick={() => setCityFilter(city)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition ${cityFilter === city ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              {city}
            </button>
          ))}
        </motion.div>

        {/* Sort toggle */}
        {userLocation && (
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setSortByDist(v => !v)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition ${sortByDist ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}
            >
              <Navigation className="w-3 h-3 inline mr-1" /> Sort by Distance
            </button>
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loading ? 'Loading...' : `${doctors.length} doctor${doctors.length !== 1 ? 's' : ''} found${cityFilter ? ` in ${cityFilter}` : ''}`}
          </p>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {doctors.map((doc, i) => (
              <DoctorCard key={doc.id} doctor={doc} index={i} onSelect={setSelected} />
            ))}
            {doctors.length === 0 && (
              <div className="col-span-2 text-center py-20">
                <Stethoscope className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No doctors found</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try a different search or city filter</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <DoctorDrawer doctor={selected} onClose={() => setSelected(null)} onBook={handleBook} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default FindDoctorsPage