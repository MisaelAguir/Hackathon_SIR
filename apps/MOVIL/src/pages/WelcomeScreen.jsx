import '../styles/Welcome.css'
import { useNavigate } from 'react-router-dom'

// Ya no usamos la imagen del mapa aquí
// const mapa = '/assets/Mapa.png'
const pin  = '/assets/sir-logo.png'
const ant  = '/assets/hormiga.png'

/* ==== TUS ARRAYS (sin cambios) ==== */
const PIN_POSITIONS = [
  { left: '30.1%', top: '45%', size:30 },
  { left: '60.1%', top: '22%', size:50 },
  { left: '54%',   top: '33%', size:50 },
  { left: '35.9%', top: '56.2%' },
  { left: '75%',   top: '67.4%' },
   { left: '67%',   top: '50%', size:50 },

]

const PINK_INSIDE = [
  { left: '54%', top: '36%', size: 13, type: 'pink' },
  { left: '60%', top: '25%', size: 13, type: 'pink' },
  { left: '36%', top: '59%', size: 13, type: 'pink' },
  { left: '75%', top: '70%', size: 13, type: 'pink' },
 
]

const PARTICLES_BASE = [
   { left:'67%', top: '52.7%', size: 13, type: 'pink' },
  { left: '30%', top: '48%', size: 13, type: 'pink' },
  { left: '8%',  top: '84%', size: 5,  type: 'warm' },
  { left: '11%', top: '81%', size: 4,  type: 'warm' },
  { left: '14%', top: '84%', size: 5,  type: 'warm' },
  { left: '34%', top: '10%', size: 4.2, type: 'white' },
  { left: '38%', top: '16%', size: 4.4, type: 'cyan'  },
  { left: '42%', top: '11%', size: 4.6, type: 'white' },
  { left: '58%', top: '6%',  size: 4.4, type: 'white' },
  { left: '62%', top: '12%', size: 4.6, type: 'cyan'  },
  { left: '68%', top: '18%', size: 4.8, type: 'white' },
  { left: '72%', top: '8%',  size: 4.0, type: 'white' },
  { left: '75%', top: '9%',  size: 4.0, type: 'blue'  },
  { left: '42%', top: '90%', size: 4.8, type: 'blue'  },
  { left: '35%', top: '88%', size: 4.8, type: 'blue'  },
  { left: '49%', top: '91%', size: 4.6, type: 'white' },
  { left: '56%', top: '90%', size: 4.8, type: 'cyan'  },
  { left: '63%', top: '88%', size: 4.6, type: 'blue'  },
]

const LEFT_MID_EXTRA = [
  { left: '12%', top: '28%', size: 4.0, type: 'blue'  },
  { left: '15%', top: '31%', size: 4.6, type: 'warm'  },
  { left: '10%', top: '35%', size: 4.4, type: 'white' },
  { left: '14%', top: '39%', size: 5.8, type: 'blue'  },
  { left: '11%', top: '44%', size: 4.6, type: 'warm'  },
  { left: '16%', top: '48%', size: 4.8, type: 'white' },
  { left: '13%', top: '53%', size: 4.6, type: 'blue'  },
  { left: '18%', top: '58%', size: 4.6, type: 'warm'  },
]

const RIGHT_BAND_EXTRA = [
  { left: '92%', top: '18%', size: 4.8, type: 'blue'  },
  { left: '95%', top: '22%', size: 4.6, type: 'warm'  },
  { left: '90%', top: '26%', size: 4.6, type: 'blue'  },
  { left: '94%', top: '30%', size: 4.6, type: 'white' },
  { left: '96%', top: '34%', size: 5.6, type: 'blue'  },
  { left: '92%', top: '38%', size: 4.8, type: 'warm'  },
  { left: '97%', top: '41%', size: 5.6, type: 'blue'  },
  { left: '91%', top: '45%', size: 4.4, type: 'white' },
  { left: '95%', top: '50%', size: 4.8, type: 'blue'  },
  { left: '93%', top: '65%', size: 5.6, type: 'white' },
  { left: '95%', top: '90%', size: 4.6, type: 'blue'  },
]

const PARTICLES = [...PARTICLES_BASE, ...LEFT_MID_EXTRA, ...RIGHT_BAND_EXTRA, ...PINK_INSIDE]

// calibración opcional
const CALIBRATE = false
function handleClick(e) {
  if (!CALIBRATE) return
  const r = e.currentTarget.getBoundingClientRect()
  const left = ((e.clientX - r.left) / r.width) * 100
  const top  = ((e.clientY - r.top)  / r.height) * 100
  console.log(`{ left: '${left.toFixed(1)}%', top: '${top.toFixed(1)}%' },`)
}

export default function WelcomeScreen({ onStart }) {
  const navigate = useNavigate()
  const handleStart = () => (typeof onStart === 'function' ? onStart() : navigate('/login'))

  return (
    <div className="screen bg-full">

       <h1 className="appTitle">SISTEMA INTEGRAL DE RIESGOS</h1>
      <div className="stars" />

      {/* Capa interactiva que ocupa TODA la pantalla */}
      <div className="mapLayer">
        <div className="mapBox full">
          {/* Partículas y pines posicionados en % sobre toda la pantalla */}
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className={`particle ${p.type}`}
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDelay: `${(i % 8) * 120}ms`,
              }}
              onClick={handleClick}
            />
          ))}

          {PIN_POSITIONS.map((pos, i) => (
            <img
              key={i}
              src={pin}
              alt=""
              className="pin"
              style={{
                left: pos.left,
                top: pos.top,
                animationDelay: `${i * 250}ms`,
              }}
            />
          ))}

          {/* Hormiga centrada abajo */}
          <button className="antTap" onClick={handleStart} aria-label="Entrar">
            <img src={ant} alt="Hormiga SIR" className="antImg" />
          </button>
        </div>
      </div>

      <div className="ctaLabel">Toca la hormiga para iniciar</div>
    </div>
  )
}
