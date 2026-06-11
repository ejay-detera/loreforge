import { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import PageTransition from '@/Components/PageTransition';
import SessionHeartbeat from '@/Components/SessionHeartbeat';

// ─── Constellation Background (unchanged) ────────────────────────────────────
function ConstellationBackground() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const MAX_DIST = 140;
    const STAR_COUNT = 110;

    const init = () => {
      const W = canvas.width  = section.offsetWidth;
      const H = canvas.height = section.offsetHeight;
      const stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
        r: 0.8 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.012 + Math.random() * 0.018,
      }));
      // store on ref so draw closure can access
      canvas._stars = stars;
    };

    const ctx = canvas.getContext('2d');

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      const W = canvas.width, H = canvas.height;
      const stars = canvas._stars ?? [];
      const now = Date.now() * 0.001;
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => {
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
        if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
      });
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const a = stars[i], b = stars[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > MAX_DIST) continue;
          const alpha = (1 - dist / MAX_DIST) * 0.14;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(80,90,150,${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.6; ctx.stroke();
        }
      }
      stars.forEach(s => {
        const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(now * s.speed * 60 + s.phase));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,210,255,${twinkle * 0.35})`; ctx.fill();
      });
    };

    window.addEventListener('resize', init);
    setTimeout(() => { init(); draw(); }, 80);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', init); };
  }, []);

  return (
    <div ref={sectionRef} className="absolute inset-0 w-full h-full">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />
    </div>
  );
}

// ─── Nav Link ─────────────────────────────────────────────────────────────────
function NavLink({ href, icon, label, isActive }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
      style={{
        color: isActive ? '#10b981' : hovered ? '#f0ead6' : '#8899aa',
        background: isActive ? 'rgba(16,185,129,0.1)' : hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
        fontFamily: 'Poppins, sans-serif',
        transition: 'color 0.2s, background 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Active indicator bar */}
      <span
        className="absolute bottom-0 left-1/2 rounded-full"
        style={{
          height: 2,
          width: isActive ? '60%' : hovered ? '40%' : 0,
          background: 'linear-gradient(90deg, #10b981, #059669)',
          transform: 'translateX(-50%)',
          transition: 'width 0.25s cubic-bezier(.22,1,.36,1)',
          boxShadow: '0 0 8px rgba(16,185,129,0.6)',
        }}
      />
      <i className={`${icon} text-sm`} style={{ color: isActive ? '#10b981' : hovered ? '#10b981' : '#6b7a99', transition: 'color 0.2s' }} />
      <span>{label}</span>
    </Link>
  );
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown({ user }) {
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);
  const initials = (user?.username ?? 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const menuItems = [
    { href: route('user.profile'), icon: 'fas fa-user-edit', label: 'Profile', color: '#8899aa' },
  ];

  return (
    <div ref={dropRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-200"
        style={{
          background: open ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.08)'}`,
          cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif',
          transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden"
          style={{
            background: user?.profile_url ? 'transparent' : 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: open ? '0 0 12px rgba(16,185,129,0.4)' : 'none',
            transition: 'box-shadow 0.2s',
          }}
        >
          {user?.profile_url ? (
            <img 
              src={`/storage/${user.profile_url}`} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Fallback icon */}
          <div 
            className="w-full h-full flex items-center justify-center" 
            style={{ 
              display: user?.profile_url ? 'none' : 'flex',
              color: '#fff' 
            }}
          >
            <i className="fas fa-user text-sm" />
          </div>
        </div>
        <span className="hidden sm:block text-sm font-medium" style={{ color: '#e8e6f0', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.username ?? 'Adventurer'}
        </span>
        <i
          className="fas fa-chevron-down text-xs"
          style={{
            color: '#6b7a99',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s cubic-bezier(.22,1,.36,1)',
          }}
        />
      </button>

      {/* Dropdown panel */}
      <div
        className="absolute right-0 mt-2 rounded-xl overflow-hidden"
        style={{
          width: 220,
          background: 'rgba(14,18,32,0.97)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.08)',
          backdropFilter: 'blur(16px)',
          // animate open/close
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.97)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.2s cubic-bezier(.22,1,.36,1), transform 0.2s cubic-bezier(.22,1,.36,1)',
          zIndex: 100,
        }}
      >
        {/* User info header */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden"
              style={{ background: user?.profile_url ? 'transparent' : 'linear-gradient(135deg,#10b981,#059669)' }}
            >
              {user?.profile_url ? (
                <img 
                  src={`/storage/${user.profile_url}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              {/* Fallback icon */}
              <div 
                className="w-full h-full flex items-center justify-center" 
                style={{ 
                  display: user?.profile_url ? 'none' : 'flex',
                  color: '#fff' 
                }}
              >
                <i className="fas fa-user text-sm" />
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: '#f0ead6', fontFamily: 'Poppins, sans-serif' }}>{user?.username}</div>
              <div className="text-xs" style={{ color: '#6b7a99' }}>{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="py-1.5">
          {menuItems.map((item) => (
            <DropdownItem key={item.label} href={item.href} icon={item.icon} label={item.label} onClick={() => setOpen(false)} />
          ))}
        </div>

        {/* Divider + logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="py-1.5">
          <Link
            href={route('logout')}
            method="post"
            as="button"
            className="w-full"
            onClick={() => setOpen(false)}
          >
            <DropdownItemInner icon="fas fa-sign-out-alt" label="Log Out" danger />
          </Link>
        </div>
      </div>
    </div>
  );
}

function DropdownItem({ href, icon, label, onClick }) {
  return (
    <Link href={href} onClick={onClick} className="block w-full">
      <DropdownItemInner icon={icon} label={label} />
    </Link>
  );
}

function DropdownItemInner({ icon, label, danger = false }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer"
      style={{
        color: danger ? (hovered ? '#f87171' : '#e05555') : (hovered ? '#f0ead6' : '#8899aa'),
        background: hovered ? (danger ? 'rgba(224,85,85,0.07)' : 'rgba(255,255,255,0.04)') : 'transparent',
        transition: 'color 0.15s, background 0.15s',
        fontFamily: 'Poppins, sans-serif',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <i className={`${icon} w-4 text-center`} style={{ fontSize: 13, color: danger ? 'inherit' : hovered ? '#10b981' : '#6b7a99', transition: 'color 0.15s' }} />
      {label}
    </div>
  );
}

// ─── Mobile Profile Picture Button ─────────────────────────────────────────────
function MobileProfileButton({ user }) {
  const initials = (user?.username ?? 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden"
      style={{
        background: user?.profile_url ? 'transparent' : 'linear-gradient(135deg, #10b981, #059669)',
        border: '1px solid rgba(255,255,255,0.08)',
        cursor: 'default',
      }}
    >
      {user?.profile_url ? (
        <img 
          src={`/storage/${user.profile_url}`} 
          alt="Profile" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      {/* Fallback icon */}
      <div 
        className="w-full h-full flex items-center justify-center" 
        style={{ 
          display: user?.profile_url ? 'none' : 'flex',
          color: '#fff' 
        }}
      >
        <i className="fas fa-user text-xs" />
      </div>
    </div>
  );
}
function MobileDrawer({ open, navigation, currentPath, onClose, user }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 md:hidden"
        style={{
          background: 'rgba(8,11,22,0.7)',
          backdropFilter: 'blur(4px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s',
        }}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className="fixed top-0 left-0 bottom-0 z-50 md:hidden flex flex-col"
        style={{
          width: 260,
          background: 'rgba(10,14,26,0.98)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(.22,1,.36,1)',
          boxShadow: open ? '8px 0 40px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-base font-bold" style={{ color: '#10b981', fontFamily: 'Poppins, sans-serif', letterSpacing: '0.06em' }}>LOREFORGE</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: '#8899aa', cursor: 'pointer', border: 'none' }}>
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium"
                style={{
                  color: isActive ? '#10b981' : '#8899aa',
                  background: isActive ? 'rgba(16,185,129,0.1)' : 'transparent',
                  borderLeft: `2px solid ${isActive ? '#10b981' : 'transparent'}`,
                  fontFamily: 'Poppins, sans-serif',
                  transition: 'all 0.2s',
                }}
              >
                <i className={`${item.icon} w-4 text-center`} style={{ color: isActive ? '#10b981' : '#6b7a99' }} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile dropdown section in drawer */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden"
              style={{ background: user?.profile_url ? 'transparent' : 'linear-gradient(135deg,#10b981,#059669)' }}
            >
              {user?.profile_url ? (
                <img 
                  src={`/storage/${user.profile_url}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              {/* Fallback icon */}
              <div 
                className="w-full h-full flex items-center justify-center" 
                style={{ 
                  display: user?.profile_url ? 'none' : 'flex',
                  color: '#fff' 
                }}
              >
                <i className="fas fa-user text-xs" />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: '#f0ead6', fontFamily: 'Poppins, sans-serif' }}>{user?.username}</div>
              <div className="text-xs" style={{ color: '#6b7a99' }}>{user?.email}</div>
            </div>
          </div>
          
          {/* Profile menu items */}
          <Link
            href={route('user.profile')}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1"
            style={{
              color: '#8899aa',
              background: 'transparent',
              fontFamily: 'Poppins, sans-serif',
              transition: 'all 0.2s',
            }}
          >
            <i className="fas fa-user-edit w-4 text-center" style={{ color: '#6b7a99' }} />
            Profile
          </Link>
          
          {/* Logout */}
          <Link
            href={route('logout')}
            method="post"
            as="button"
            onClick={onClose}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
            style={{ color: '#e05555', background: 'rgba(224,85,85,0.06)', fontFamily: 'Poppins, sans-serif', border: 'none', cursor: 'pointer' }}
          >
            <i className="fas fa-sign-out-alt w-4 text-center" />
            Log Out
          </Link>
        </div>
      </div>
    </>
  );
}

// ─── Authenticated Layout ─────────────────────────────────────────────────────
export default function AuthenticatedLayout({ header, children }) {
  const { props } = usePage();
  const user = props.auth.user;
  const activeSession = props.activeSession;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { url: currentPath } = usePage();
  
  // Check if we're on the game page
  const isGamePage = currentPath?.includes('/game');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: route('dashboard'),  icon: 'fas fa-home'        },
    { name: activeSession ? 'Game' : 'New Game',  href: activeSession ? route('game') : route('new-game'),    icon: activeSession ? 'fas fa-gamepad' : 'fas fa-plus-circle' },
    { name: 'History',   href: route('history'),     icon: 'fas fa-history'     },
    { name: 'Community', href: route('community'),   icon: 'fas fa-users'       },
    { name: 'Achievements', href: route('achievements'), icon: 'fas fa-trophy'  },
  ];

  if (user?.is_admin) {
      navigation.push({ name: 'Admin', href: route('admin'), icon: 'fas fa-user-shield' });
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      <div className={`bg-bg-deep-navy text-text-primary-off-white ${isGamePage ? 'h-screen overflow-hidden' : 'min-h-screen'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
        <SessionHeartbeat />

        {/* ── Top Nav ── */}
        <nav
          className="fixed top-0 left-0 right-0 z-50"
          style={{
            background: scrolled ? 'rgba(10,14,26,0.9)' : 'rgba(10,14,26,0.9)',
            borderBottom: scrolled ? '1px solid rgba(16,185,129,0.12)' : '1px solid rgba(255,255,255,0.1)',
            backdropFilter: scrolled ? 'blur(20px)' : 'blur(12px)',
            WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'blur(12px)',
            transition: 'all 0.3s ease',
            boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.15)',
          }}
        >
          {/* Accent line (only when scrolled) */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: scrolled
                ? 'linear-gradient(90deg, transparent, rgba(16,185,129,0.4), transparent)'
                : 'transparent'
            }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="flex items-center justify-between h-16"
              style={{
                textShadow: scrolled ? 'none' : '0 1px 3px rgba(0,0,0,0.8)',
                color: scrolled ? '#f0ead6' : '#10b981'
              }}
            >

              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
                <div className="relative">
                  <img
                    src="/images/loreforge-logo.jpg"
                    alt="LoreForge"
                    className="h-9 w-9 rounded-lg object-cover"
                    style={{
                      transition: 'transform 0.3s',
                      boxShadow: '0 0 0 1px rgba(16,185,129,0.2)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.08)';
                      e.currentTarget.style.boxShadow = '0 0 16px rgba(16,185,129,0.4)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = '0 0 0 1px rgba(16,185,129,0.2)';
                    }}
                  />
                </div>

                <span
                  className="hidden sm:block text-lg font-bold"
                  style={{
                    color: '#10b981',
                    letterSpacing: '0.1em',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#34d399'}
                  onMouseLeave={e => e.currentTarget.style.color = '#10b981'}
                >
                  LOREFORGE
                </span>
              </Link>

              {/* Desktop nav links */}
              <div className="hidden md:flex items-center gap-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    href={item.href}
                    icon={item.icon}
                    label={item.name}
                    isActive={(() => {
                      try {
                        return currentPath.startsWith(
                          new URL(item.href, window.location.origin).pathname
                        );
                      } catch {
                        return false;
                      }
                    })()}
                  />
                ))}
              </div>

              {/* Right side */}
              <div className="flex items-center gap-3">
                {/* Profile dropdown */}
                <div className="hidden md:block">
                  <ProfileDropdown user={user} />
                </div>

                {/* Mobile profile */}
                <div className="md:hidden">
                  <MobileProfileButton user={user} />
                </div>

                {/* Hamburger */}
                <button
                  onClick={() => setMobileOpen(true)}
                  className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg"
                  style={{
                    background: scrolled ? 'rgba(255,255,255,0.05)' : 'transparent',
                    border: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    cursor: 'pointer',
                    color: '#8899aa',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
                    e.currentTarget.style.color = '#f0ead6';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = scrolled ? 'rgba(255,255,255,0.05)' : 'transparent';
                    e.currentTarget.style.color = '#8899aa';
                  }}
                >
                  <i className="fas fa-bars text-sm" />
                </button>
              </div>

            </div>
          </div>
        </nav>

        {/* Mobile drawer */}
        <MobileDrawer
          open={mobileOpen}
          navigation={navigation}
          currentPath={currentPath}
          user={user}
          onClose={() => setMobileOpen(false)}
        />

        {/* Page header (optional) */}
        {header && (
          <header className="pt-16 bg-surface-dark-charcoal/50 backdrop-blur-sm border-b border-border-subtle-dark/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {header}
            </div>
          </header>
        )}

          <main className={`relative flex flex-col ${isGamePage ? 'overflow-hidden' : ''}`} style={{ height: isGamePage ? 'calc(100vh - 64px)' : 'auto', marginTop: '64px' }}>
              {/* constellation must be absolute so it doesn't affect flex layout */}
              <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
                  <ConstellationBackground />
              </div>
              <PageTransition>
                  {children}
              </PageTransition>
          </main>
      </div>
    </>
  );
}