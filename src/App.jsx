import { useState } from 'react'
import { useTracker } from './useTracker.js'
import { useInstallPrompt } from './useInstallPrompt.js'
import { useFoodData } from './useFoodData.js'
import { PARKS_FALLBACK } from './data/fallback.js'

// ─── CONFIG ────────────────────────────────────────────────────────────────
// Paste your Google Sheets CSV URL here after following the setup guide.
// Leave as empty string to use the built-in fallback data.
const SHEET_URL = 'https://corsproxy.io/?https://docs.google.com/spreadsheets/d/1KyFC5Xp1tiLITL_5D1VA_UXxS0oErTi86094A4fkZSc/pub?gid=0&single=true&output=csv'

// ─── Division layout (park IDs only — names come from the sheet) ───────────
const DIVISIONS = ["AL East","AL Central","AL West","NL East","NL Central","NL West"]
const DIVISION_IDS = {
  "AL East": ["yankees","redsox","bluejays","rays","orioles"],
  "AL Central": ["whitesox","guardians","tigers","royals","twins"],
  "AL West": ["astros","angels","athletics","mariners","rangers"],
  "NL East": ["braves","marlins","mets","phillies","nationals"],
  "NL Central": ["cubs","reds","brewers","pirates","cardinals"],
  "NL West": ["diamondbacks","rockies","dodgers","padres","giants"],
}

const CATEGORIES = ["All","Classic","Seafood","Sandwiches","Sides","Snacks","Dessert","BBQ","Mexican","Pizza","Healthy","Asian","Burgers","Drinks"]


function StarRating({ value, onChange, readonly = false }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(star => (
        <span key={star}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{ fontSize: readonly ? '14px' : '22px', cursor: readonly ? 'default' : 'pointer', color: star <= (hover || value) ? '#F5A623' : '#2e2e2e', transition: 'color 0.15s', userSelect: 'none' }}
        >★</span>
      ))}
    </div>
  )
}

export default function App() {
  const [view, setView] = useState('browse')
  const [selectedPark, setSelectedPark] = useState(null)
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterNew, setFilterNew] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [parkSearch, setParkSearch] = useState('')
  const [pendingRating, setPendingRating] = useState(0)
  const [pendingNote, setPendingNote] = useState('')
  const [showLogModal, setShowLogModal] = useState(false)
  const [modalFood, setModalFood] = useState(null)

  const { eaten, logItem, removeItem } = useTracker()
  const { showBanner, install, dismiss } = useInstallPrompt()
  const { foodData: FOOD_DATA, parks: PARKS_LIVE, status: dataStatus } = useFoodData(SHEET_URL)

  const FOOD_DATA_ACTIVE = FOOD_DATA || {}
  const PARKS = PARKS_LIVE || PARKS_FALLBACK

  const openModal = (food, parkId) => {
    setModalFood({ ...food, parkId })
    setPendingRating(eaten[food.id]?.rating || 0)
    setPendingNote(eaten[food.id]?.note || '')
    setShowLogModal(true)
  }

  const saveLog = () => {
    if (!modalFood) return
    logItem(modalFood.id, modalFood.parkId, pendingRating, pendingNote)
    setShowLogModal(false)
  }

  const allFoods = Object.entries(FOOD_DATA_ACTIVE).flatMap(([parkId, foods]) => foods.map(f => ({ ...f, parkId })))
  const eatenList = Object.entries(eaten).map(([id, data]) => {
    const food = allFoods.find(f => f.id === parseInt(id))
    const park = PARKS.find(p => p.id === data.parkId)
    return food ? { ...food, ...data, park } : null
  }).filter(Boolean)

  const parkFoods = selectedPark ? FOOD_DATA_ACTIVE[selectedPark.id] || [] : []
  const filtered = parkFoods.filter(f =>
    (filterCategory === 'All' || f.category === filterCategory) &&
    (!filterNew || f.isNew) &&
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalEaten = Object.keys(eaten).length
  const ratings = Object.values(eaten).map(e => e.rating).filter(Boolean)
  const avgRating = ratings.length ? (ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(1) : '—'
  const parksVisited = new Set(Object.values(eaten).map(e => e.parkId)).size
  const newItemsTotal = allFoods.filter(f => f.isNew).length

  const filteredParks = PARKS.filter(p =>
    [p.team, p.park, p.city].some(s => s.toLowerCase().includes(parkSearch.toLowerCase()))
  )

  const css = {
    app: { minHeight: '100dvh', background: '#0b0b0b', color: '#edeae2', fontFamily: "Georgia,'Times New Roman',serif", overflowX: 'hidden', paddingBottom: showBanner ? '90px' : '0' },
    hdr: { background: '#0b0b0b', borderBottom: '1px solid #1a1a1a', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', position: 'sticky', top: 0, zIndex: 100 },
    logo: { fontSize: '19px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '7px' },
    nav: { display: 'flex', gap: '3px' },
    nb: a => ({ padding: '7px 14px', borderRadius: '6px', border: 'none', background: a ? '#C8102E' : 'transparent', color: a ? '#fff' : '#555', cursor: 'pointer', fontSize: '13px', fontFamily: 'Georgia,serif', fontWeight: a ? 'bold' : 'normal', transition: 'all 0.2s' }),
    main: { maxWidth: '1160px', margin: '0 auto', padding: '24px 16px' },
    h1: { fontSize: '22px', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '-0.3px' },
    sub: { color: '#4a4a4a', fontSize: '13px', marginBottom: '20px' },
    divlabel: { fontSize: '10px', color: '#C8102E', letterSpacing: '1.8px', textTransform: 'uppercase', marginBottom: '8px', marginTop: '20px', fontWeight: 'bold' },
    pgrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '8px' },
    pcard: { background: '#121212', border: '1px solid #1c1c1c', borderRadius: '9px', padding: '14px', cursor: 'pointer', transition: 'all 0.18s', WebkitTapHighlightColor: 'transparent' },
    fgrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '12px' },
    fcard: isNew => ({ background: isNew ? '#0f130e' : '#121212', border: isNew ? '1px solid #2a3a22' : '1px solid #1c1c1c', borderRadius: '9px', padding: '16px' }),
    fname: { fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' },
    fmeta: { display: 'flex', gap: '6px', marginBottom: '9px', flexWrap: 'wrap', alignItems: 'center' },
    tag: r => ({ fontSize: '11px', padding: '2px 7px', borderRadius: '20px', background: r ? '#1e0408' : '#171717', color: r ? '#cc5060' : '#555', border: r ? '1px solid #3e1018' : '1px solid #222' }),
    newTag: { fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#0d2010', color: '#5abf5a', border: '1px solid #1a4020', fontWeight: 'bold', letterSpacing: '0.5px' },
    fdesc: { fontSize: '12px', color: '#5a5a5a', lineHeight: '1.55', marginBottom: '12px' },
    logbtn: l => ({ width: '100%', padding: '10px', borderRadius: '7px', border: l ? '1px solid #1e3e1e' : '1px solid #252525', background: l ? '#0b180b' : '#161616', color: l ? '#5aaa5a' : '#888', cursor: 'pointer', fontSize: '13px', fontFamily: 'Georgia,serif', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }),
    fbar: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' },
    chip: a => ({ padding: '6px 12px', borderRadius: '20px', border: a ? '1px solid #C8102E' : '1px solid #202020', background: a ? '#180408' : 'transparent', color: a ? '#cc5060' : '#4a4a4a', cursor: 'pointer', fontSize: '11px', fontFamily: 'Georgia,serif', transition: 'all 0.15s' }),
    newChip: a => ({ padding: '6px 12px', borderRadius: '20px', border: a ? '1px solid #3abf3a' : '1px solid #202020', background: a ? '#0d2010' : 'transparent', color: a ? '#5abf5a' : '#4a4a4a', cursor: 'pointer', fontSize: '11px', fontFamily: 'Georgia,serif', transition: 'all 0.15s' }),
    srch: { padding: '8px 13px', borderRadius: '7px', border: '1px solid #202020', background: '#121212', color: '#edeae2', fontSize: '13px', fontFamily: 'Georgia,serif', outline: 'none' },
    srow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '24px' },
    scard: { background: '#121212', border: '1px solid #1c1c1c', borderRadius: '9px', padding: '14px', textAlign: 'center' },
    snum: { fontSize: '26px', fontWeight: 'bold', color: '#C8102E', lineHeight: 1, marginBottom: '4px' },
    slbl: { fontSize: '10px', color: '#383838', textTransform: 'uppercase', letterSpacing: '0.8px' },
    titem: { background: '#121212', border: '1px solid #1c1c1c', borderRadius: '9px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 },
    mbox: { background: '#151515', border: '1px solid #252525', borderRadius: '14px 14px 0 0', padding: '24px 24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))', width: '100%', maxWidth: '520px' },
    ta: { width: '100%', background: '#0b0b0b', border: '1px solid #252525', borderRadius: '7px', color: '#edeae2', fontFamily: 'Georgia,serif', fontSize: '14px', padding: '10px', resize: 'none', outline: 'none', boxSizing: 'border-box', marginTop: '7px' },
    sbtn: { width: '100%', padding: '13px', borderRadius: '8px', border: 'none', background: '#C8102E', color: '#fff', fontSize: '15px', fontFamily: 'Georgia,serif', fontWeight: 'bold', cursor: 'pointer', marginTop: '14px' },
    cbtn: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #222', background: 'transparent', color: '#484848', fontSize: '13px', fontFamily: 'Georgia,serif', cursor: 'pointer', marginTop: '8px' },
    back: { background: 'none', border: 'none', color: '#C8102E', cursor: 'pointer', fontSize: '13px', fontFamily: 'Georgia,serif', marginBottom: '14px', padding: 0, display: 'flex', alignItems: 'center', gap: '5px' },
    empty: { textAlign: 'center', padding: '52px 0', color: '#303030' },
    newBanner: { background: '#0d2010', border: '1px solid #1a4020', borderRadius: '8px', padding: '10px 14px', marginBottom: '18px', fontSize: '12px', color: '#5abf5a', display: 'flex', alignItems: 'center', gap: '8px' },
  }

  // Show loading screen until data is ready
  if (!FOOD_DATA) {
    return (
      <div style={{minHeight:'100dvh',background:'#0b0b0b',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'16px'}}>
        <div style={{fontSize:'40px'}}>⚾</div>
        <div style={{color:'#555',fontSize:'14px',fontFamily:'Georgia,serif'}}>Loading ParkEats...</div>
      </div>
    )
  }

  return (
    <div style={css.app}>
      <header style={css.hdr}>
        <div style={css.logo}>⚾ Park<span style={{color:'#C8102E'}}>Eats</span></div>
        <nav style={css.nav}>
          <button style={css.nb(view==='browse')} onClick={()=>{setView('browse');setSelectedPark(null)}}>Browse</button>
          <button style={css.nb(view==='tracker')} onClick={()=>setView('tracker')}>
            Tracker{totalEaten>0?` (${totalEaten})`:''}
          </button>
        </nav>
      </header>

      <main style={css.main}>

        {view==='browse' && !selectedPark && (<>
          <div style={css.h1}>All 30 MLB Ballparks</div>
          <div style={css.sub}>
            Select a ballpark to explore its iconic eats · <span style={{color:'#5abf5a'}}>{newItemsTotal} new items for 2026</span>
            {dataStatus === 'live' && <span style={{color:'#336633',marginLeft:'8px',fontSize:'11px'}}>● live</span>}
            {dataStatus === 'cached' && <span style={{color:'#555',marginLeft:'8px',fontSize:'11px'}}>● cached</span>}
            {dataStatus === 'fallback' && <span style={{color:'#774433',marginLeft:'8px',fontSize:'11px'}}>● offline mode</span>}
          </div>
          <input
            style={{...css.srch, width:'100%', maxWidth:'300px', marginBottom:'4px', display:'block'}}
            placeholder="Search team, park, or city..."
            value={parkSearch}
            onChange={e=>setParkSearch(e.target.value)}
          />
          {DIVISIONS.map(div=>{
            const divParks = filteredParks.filter(p=>DIVISION_IDS[div].includes(p.id))
            if(!divParks.length) return null
            return (
              <div key={div}>
                <div style={css.divlabel}>{div}</div>
                <div style={css.pgrid}>
                  {divParks.map(park=>{
                    const foods = FOOD_DATA_ACTIVE[park.id]||[]
                    const ec = foods.filter(f=>eaten[f.id]).length
                    const newCount = foods.filter(f=>f.isNew).length
                    return (
                      <div key={park.id} style={css.pcard}
                        onClick={()=>{setSelectedPark(park);setFilterCategory('All');setFilterNew(false);setSearchQuery('')}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='#C8102E';e.currentTarget.style.background='#150d0e'}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='#1c1c1c';e.currentTarget.style.background='#121212'}}>
                        <div style={{fontSize:'16px',marginBottom:'6px'}}>⚾</div>
                        <div style={{fontSize:'12px',fontWeight:'bold',marginBottom:'2px'}}>{park.park}</div>
                        <div style={{fontSize:'10px',color:'#484848',marginBottom:'2px'}}>{park.team}</div>
                        <div style={{fontSize:'10px',color:'#383838'}}>{park.city}</div>
                        <div style={{marginTop:'7px',display:'flex',gap:'6px',flexWrap:'wrap'}}>
                          {ec>0&&<div style={{fontSize:'10px',color:'#50a050'}}>✓ {ec}/{foods.length} tried</div>}
                          {newCount>0&&<div style={{fontSize:'10px',color:'#5abf5a'}}>🆕 {newCount} new</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </>)}

        {view==='browse' && selectedPark && (<>
          <button style={css.back} onClick={()=>setSelectedPark(null)}>← All Parks</button>
          <div style={css.h1}>{selectedPark.park}</div>
          <div style={css.sub}>{selectedPark.team} · {selectedPark.city}</div>
          {parkFoods.some(f=>f.isNew) && (
            <div style={css.newBanner}>
              🆕 <strong>{parkFoods.filter(f=>f.isNew).length} new items</strong> confirmed for the 2026 season
            </div>
          )}
          <div style={css.fbar}>
            {CATEGORIES.filter(c=>c==='All'||parkFoods.some(f=>f.category===c)).map(cat=>(
              <button key={cat} style={css.chip(filterCategory===cat)} onClick={()=>setFilterCategory(cat)}>{cat}</button>
            ))}
            <button style={css.newChip(filterNew)} onClick={()=>setFilterNew(v=>!v)}>🆕 2026 New</button>
            <input style={{...css.srch,marginLeft:'auto',width:'150px'}} placeholder="Search..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
          </div>
          {filtered.length===0
            ? <div style={css.empty}><div style={{fontSize:'38px',marginBottom:'9px'}}>🔍</div><div>No items match</div></div>
            : <div style={css.fgrid}>{filtered.map(food=>{
                const isLogged=!!eaten[food.id]
                return (
                  <div key={food.id} style={css.fcard(food.isNew)}>
                    <div style={css.fname}>{food.name}</div>
                    <div style={css.fmeta}>
                      <span style={css.tag(true)}>{food.category}</span>
                      <span style={css.tag(false)}>{food.price}</span>
                      {food.isNew&&<span style={css.newTag}>🆕 2026</span>}
                    </div>
                    <div style={css.fdesc}>{food.description}</div>
                    <div style={{fontSize:'11px',color:'#383838',marginBottom:'11px'}}>📍 {food.section}</div>
                    {isLogged&&eaten[food.id]?.rating>0&&<div style={{marginBottom:'9px'}}><StarRating value={eaten[food.id].rating} readonly/></div>}
                    <button style={css.logbtn(isLogged)} onClick={()=>openModal(food,selectedPark.id)}>
                      {isLogged?'✓ Logged — Edit':'+ Log This'}
                    </button>
                  </div>
                )
              })}</div>
          }
        </>)}

        {view==='tracker' && (<>
          <div style={css.h1}>My Food Tracker</div>
          <div style={css.sub}>Everything you have tried across all 30 ballparks</div>
          <div style={css.srow}>
            <div style={css.scard}><div style={css.snum}>{totalEaten}</div><div style={css.slbl}>Items Tried</div></div>
            <div style={css.scard}><div style={css.snum}>{parksVisited||'—'}</div><div style={css.slbl}>Parks Visited</div></div>
            <div style={css.scard}><div style={css.snum}>{avgRating}</div><div style={css.slbl}>Avg Rating</div></div>
          </div>
          {eatenList.length===0
            ? <div style={css.empty}><div style={{fontSize:'42px',marginBottom:'9px'}}>🌭</div><div style={{marginBottom:'5px'}}>Nothing logged yet</div><div style={{fontSize:'12px',color:'#272727'}}>Browse a park and start logging your eats</div></div>
            : eatenList.map(item=>(
                <div key={item.id} style={css.titem}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'3px',flexWrap:'wrap'}}>
                      <span style={{fontWeight:'bold',fontSize:'14px'}}>{item.name}</span>
                      {item.isNew&&<span style={css.newTag}>🆕 2026</span>}
                    </div>
                    <div style={{fontSize:'11px',color:'#3a3a3a',marginBottom:'6px'}}>{item.park?.park} · {item.date}</div>
                    {item.rating>0&&<StarRating value={item.rating} readonly/>}
                    {item.note&&<div style={{fontSize:'12px',color:'#484848',marginTop:'5px',fontStyle:'italic'}}>"{item.note}"</div>}
                  </div>
                  <div style={{display:'flex',gap:'6px',flexShrink:0}}>
                    <button style={{...css.logbtn(false),width:'auto',padding:'7px 12px',fontSize:'11px'}}
                      onClick={()=>{const food=allFoods.find(f=>f.id===item.id);if(food)openModal(food,item.parkId)}}>Edit</button>
                    <button style={{...css.logbtn(false),width:'auto',padding:'7px 12px',fontSize:'11px',color:'#a04040',borderColor:'#2a1010'}}
                      onClick={()=>removeItem(item.id)}>Remove</button>
                  </div>
                </div>
              ))
          }
        </>)}
      </main>

      {showLogModal&&modalFood&&(
        <div style={css.modal} onClick={()=>setShowLogModal(false)}>
          <div style={css.mbox} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:'17px',fontWeight:'bold',marginBottom:'3px'}}>{modalFood.name}</div>
            <div style={{fontSize:'11px',color:'#3a3a3a',marginBottom:'20px'}}>{PARKS.find(p=>p.id===modalFood.parkId)?.park}</div>
            <div style={{fontSize:'12px',color:'#666',marginBottom:'8px'}}>Your Rating</div>
            <StarRating value={pendingRating} onChange={setPendingRating}/>
            <div style={{fontSize:'12px',color:'#666',marginTop:'16px',marginBottom:'2px'}}>Notes (optional)</div>
            <textarea style={css.ta} rows={3} placeholder="What did you think? Any tips?" value={pendingNote} onChange={e=>setPendingNote(e.target.value)}/>
            <button style={css.sbtn} onClick={saveLog}>Save to Tracker</button>
            <button style={css.cbtn} onClick={()=>setShowLogModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showBanner && (
        <div className="install-banner">
          <div className="install-banner-text">
            <strong>Add ParkEats to your home screen</strong>
            Works offline · No app store needed
          </div>
          <button className="install-btn" onClick={install}>Install</button>
          <button className="dismiss-btn" onClick={dismiss}>×</button>
        </div>
      )}
    </div>
  )
}
