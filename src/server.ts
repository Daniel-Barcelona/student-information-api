import 'dotenv/config';
import { pool } from './db.js';
import express from 'express';
import type { Request, Response } from 'express';
import studentRoutes from './routes/studentRoutes.js';

const app = express();
// Read Render's assigned PORT in production, or fall back to 4000 on your laptop
const PORT = Number(process.env.PORT) || 4000;
 

app.use(express.json());

app.use('/students', studentRoutes);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  res.status(200).json ({
    "message": "Student Information API",
    "course": "ITE 303"
  });
});

// app.get('/students', (req, res) => {

//   const course = String(req.query.course ?? 'all courses');

//   res.status(200).json ({
//     "message": "Student information request",
//     "course": course
//   });
// });

// app.get('/students/:id', (req, res) => {

//   const studentId = req.params.id;

//   res.status(200).json ({
//     "message": "Student request received",
//     "studentId": studentId
//   });
// });

// app.post('/students', (req, res) => {
//   const { name, course } = req.body ?? {};
//   if (!name || !course) {
//     return res.status(400).json({
//       message: 'name and course are required',
//     });
//   }

//   return res.status(200).json({
//     message: 'Student received',
//     student: { name, course },
//   });
// });


// optional

app.get('/student-search', (req, res) => {

  const course = String(req.query.course ?? 'all courses');
  const year = String(req.query.year ?? 'all years');

  res.status(200).json ({
    "message": "Student information request",
    "course": course,
    "year": year
  });
});

app.get('/students/:code', (req, res) => {

  const studentCode = req.params.code;

  res.status(200).json ({
    "message": "Student code request received",
    "studentCode": studentCode
  });
});

app.post('/student-profiles', (req, res) => {
  const { name, course, year } = req.body ?? {};
  if (!name || !course || !year) {
    return res.status(400).json({
      message: 'name, course, and year are required',
    });
  }

  return res.status(200).json({
    message: 'Student profile received',
    student: { name, course, year },
  });
});

app.use((req, res) => {
  res.status(404).json ({
    message: "Route not found"
  });
});

app.listen(PORT, () => {
  pool.query('SELECT NOW()')
  .then(() => console.log('Database connected successfully'))
  .catch((error: unknown) => {
    if (error instanceof Error) {
      const code = 'code' in error ? ` (${String(error.code)})` : '';
      console.error(`Database connection failed${code}: ${error.message}`);
      return;
    }
    console.error('Database connection failed:', error);
  });
  console.log(`Server running at http://localhost:${PORT}`);
});
