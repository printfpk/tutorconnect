import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, BookOpen } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

// Time slots shown in the day panel
const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => {
  const h = i + 7; // 7am to 8pm
  return `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`;
});

export default function TutorCalendarPage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ padding: '28px 0 24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 6px' }}>
          Calendar
        </h1>
        <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: '0.95rem' }}>View and manage your teaching schedule</p>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Calendar Grid */}
        <div style={{ flex: 1, background: 'white', borderRadius: 24, border: '1.5px solid var(--gray-100)', overflow: 'hidden' }}>
          {/* Month nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1.5px solid var(--gray-100)' }}>
            <motion.button onClick={prevMonth} whileTap={{ scale: 0.9 }}
              style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--gray-200)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={18} />
            </motion.button>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--gray-900)' }}>
              {MONTHS[month]} {year}
            </span>
            <motion.button onClick={nextMonth} whileTap={{ scale: 0.9 }}
              style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--gray-200)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={18} />
            </motion.button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '12px 20px 0' }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', paddingBottom: 10 }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 20px 20px', gap: 4 }}>
            {cells.map((day, idx) => (
              <motion.button
                key={idx}
                onClick={() => day && setSelectedDay(day)}
                whileHover={day ? { scale: 1.08 } : {}}
                whileTap={day ? { scale: 0.95 } : {}}
                style={{
                  height: 44, borderRadius: 12, border: 'none', cursor: day ? 'pointer' : 'default',
                  fontWeight: day === selectedDay ? 800 : 500,
                  fontSize: '0.9rem',
                  background: !day ? 'transparent'
                    : isToday(day) && day === selectedDay ? 'var(--indigo-deep)'
                    : day === selectedDay ? 'var(--gray-900)'
                    : isToday(day) ? '#eef2ff'
                    : 'transparent',
                  color: !day ? 'transparent'
                    : (day === selectedDay) ? 'white'
                    : isToday(day) ? 'var(--indigo-deep)'
                    : 'var(--gray-700)',
                  transition: 'all 0.15s',
                  position: 'relative',
                }}
              >
                {day}
                {/* Dot indicator for sessions - placeholder */}
                {day && isToday(day) && day !== selectedDay && (
                  <span style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: 'var(--indigo-deep)' }} />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Day Detail Panel */}
        <div style={{ width: 300, background: 'white', borderRadius: 24, border: '1.5px solid var(--gray-100)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 16px', borderBottom: '1.5px solid var(--gray-100)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--gray-900)' }}>
              {selectedDay ? `${MONTHS[month].slice(0, 3)} ${selectedDay}` : 'Select a day'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginTop: 2 }}>No sessions scheduled</div>
          </div>

          <div style={{ padding: '16px 20px', maxHeight: 420, overflowY: 'auto' }}>
            {TIME_SLOTS.map((slot, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 4, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)', width: 56, flexShrink: 0, paddingTop: 2, fontWeight: 500 }}>
                  {slot}
                </span>
                <div style={{ flex: 1, height: 28, borderLeft: '1.5px solid var(--gray-100)', paddingLeft: 10, display: 'flex', alignItems: 'center' }}>
                  {/* Empty slot — sessions will render here when bookings exist */}
                </div>
              </div>
            ))}
          </div>

          {/* Empty state hint */}
          <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
            <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: 14 }}>
              <BookOpen size={20} color="var(--gray-300)" style={{ margin: '0 auto 8px', display: 'block' }} />
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--gray-400)', lineHeight: 1.4 }}>
                Your upcoming sessions will appear on the calendar once bookings are confirmed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
