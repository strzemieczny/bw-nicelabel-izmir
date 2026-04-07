import { JSX } from 'react'
import BorgWarner_Logo_Technology_Blue from '@img/BorgWarner_Logo_Technology_Blue.svg'
interface NavBarProps {
  title: string
  session?: { user?: { name?: string } } | null
  status?: 'loading' | 'authenticated' | 'unauthenticated'
  onLogin?: () => void
  onLogout?: () => void
  onHome?: () => void
  onAdmin?: () => void
}

function NavBar({
  title,
  session,
  status = 'unauthenticated',
  onLogin,
  onLogout,
  onHome,
  onAdmin
}: NavBarProps): JSX.Element {
  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .nav-skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.12) 25%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.12) 75%);
          background-size: 400px 100%;
          animation: skeleton-shimmer 1.4s infinite linear;
          border-radius: 4px;
        }
      `}</style>
      <nav
        className="bg-bw-dark-blue grid text-bw-white items-center
                   p-2 grid-rows-2 grid-cols-1 justify-items-center
                   md:p-4 md:grid-rows-1 md:grid-cols-3 md:justify-items-start
                   lg:p-4 lg:grid-rows-1 lg:grid-cols-3"
      >
        <img
          src={BorgWarner_Logo_Technology_Blue}
          alt="BorgWarner Logo"
          width={200}
          height={50}
        />

        <h1 className="justify-self-center lg:text-xl">
          {status === 'loading' ? (
            <span
              className="nav-skeleton inline-block"
              style={{ width: '180px', height: '20px' }}
            />
          ) : (
            title
          )}
        </h1>

        <div className="justify-self-end flex items-center gap-2">
          {status === 'loading' ? (
            <>
              <span
                className="nav-skeleton inline-block"
                style={{ width: '60px', height: '28px' }}
              />
              <span
                className="nav-skeleton inline-block"
                style={{ width: '60px', height: '28px' }}
              />
              <span
                className="nav-skeleton inline-block"
                style={{ width: '68px', height: '28px' }}
              />
            </>
          ) : session ? (
            <>
              <button
                onClick={onHome}
                className="bg-bw-tech-blue text-bw-dark-blue text-sm font-semibold px-4 py-1 rounded shadow hover:bg-bw-tech-blue-hover cursor-pointer duration-300"
              >
                Home
              </button>
              <button
                onClick={onAdmin}
                className="bg-bw-tech-blue text-bw-dark-blue text-sm font-semibold px-4 py-1 rounded shadow hover:bg-bw-tech-blue-hover cursor-pointer duration-300"
              >
                Admin
              </button>
              <button
                onClick={onLogout}
                className="bg-bw-tech-blue text-bw-dark-blue text-sm font-semibold px-4 py-1 rounded shadow hover:bg-bw-tech-blue-hover cursor-pointer duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={onLogin}
              className="bg-bw-tech-blue text-bw-dark-blue text-sm px-4 py-1 rounded shadow hover:bg-bw-tech-blue-hover cursor-pointer duration-300"
            >
              Login
            </button>
          )}
        </div>
      </nav>
    </>
  )
}

export default NavBar
