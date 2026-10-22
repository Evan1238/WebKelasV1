export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json({
    className: 'X TJKT 1',
    alias: 'NEXUSS',
    school: 'SMK Negeri 1 PBG',
    room: 'Lab Jaringan & Komputer Gedung C Lt. 2',
    homeroomTeacher: 'Drs. Suryono, M.Pd.',
    president: 'Budi Wicaksono',
    studentsCount: 18,
    academicYear: '2025/2026'
  });
}
