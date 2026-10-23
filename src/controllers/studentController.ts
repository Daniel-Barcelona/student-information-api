import { pool } from '../db';
import type { Request, Response } from 'express';

// export function getStudents(req: Request, res: Response) {
    //   const course = String(req.query.course ?? 'all courses');
    
//   res.status(200).json ({
//     "message": "Student information request",
//     "course": course
//   });
// }

export async function getStudents(_req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(
      'SELECT * FROM students ORDER BY id;'
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ message: 'Could not load students' });
  }
}

// export function getStudentById(req: Request, res: Response) {
// const studentId = req.params.id;

//   res.status(200).json ({
//     "message": "Student request received",
//     "studentId": studentId
//   });
// }
 
export async function getStudentById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ message: 'Student ID must be a positive integer' });
    return;
  }
 
  try {
    const result = await pool.query(
      'SELECT * FROM students WHERE id = $1;',
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ message: 'Could not load student' });
  }
}

export async function createStudent(req: Request, res: Response): Promise<void> {
  // Get the data sent by Postman
  const body = req.body;
 
  // Make sure the data is a JSON object
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    res.status(400).json({ message: 'A JSON object is required' });
    return;
  }
 
  const { student_number, first_name, last_name, course, year_level } = body;
 
  // Check the required text fields
  if (typeof student_number !== 'string' || student_number.trim() === '' ||
      typeof first_name !== 'string' || first_name.trim() === '' ||
      typeof last_name !== 'string' || last_name.trim() === '' ||
      typeof course !== 'string' || course.trim() === '') {
    res.status(400).json({ message: 'All text fields are required' });
    return;
  }
 
  // Check that the year level is a positive whole number
  if (typeof year_level !== 'number' || !Number.isInteger(year_level) ||
      year_level < 1) {
    res.status(400).json({ message: 'year_level must be a positive whole number' });
    return;
  }
 
  // Match each SQL place ($1 to $5) with one value below
  const sql = `INSERT INTO students
    (student_number, first_name, last_name, course, year_level)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, student_number, first_name, last_name, course, year_level;`;
  const values = [
    student_number.trim(), first_name.trim(), last_name.trim(),
    course.trim(), year_level
  ];
 
  try {
    // Save the student to PostgreSQL
    const result = await pool.query(sql, values);
 
    // Send the saved student back to Postman
    res.status(201).json(result.rows[0]);
  } catch (error: unknown) {
    // Tell Postman if the student number is already used
    if (typeof error === 'object' && error !== null &&
        'code' in error && error.code === '23505') {
      res.status(409).json({ message: 'student_number already exists' });
      return;
    }
 
    // Send a safe message for other database errors
    res.status(500).json({ message: 'Could not create student' });
  }
}

// export function createStudent(req: Request, res: Response) {
//     const { name, course } = req.body ?? {};
//   if (!name || !course) {
//     return res.status(400).json({
//       message: 'name and course are required',
//     });
//   }
 
//   return res.status(200).json({
//     message: 'Student received',
//     student: { name, course },
//   });

// }
 
export async function updateStudent(req: Request, res: Response): Promise<void> {
  // The route parameter is text; accept only a positive, safe whole-number ID.
  const idText = req.params.id;
  const id = Number(idText);
  if (!/^\d+$/.test(idText) || !Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ message: 'Student ID must be a positive integer' });
    return;
  }
 
  // The JSON middleware puts Postman's request body in req.body.
  const body: unknown = req.body;
  // Full PUT requires a JSON object, not an array or a missing body.
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    res.status(400).json({ message: 'A JSON object is required' });
    return;
  }
 
  // Read all five editable fields from the checked object.
  const { student_number, first_name, last_name, course, year_level } = body as Record<string, unknown>;
  // Stop before SQL if any required text field is blank or missing.
  if (typeof student_number !== 'string' || student_number.trim() === '' ||
      typeof first_name !== 'string' || first_name.trim() === '' ||
      typeof last_name !== 'string' || last_name.trim() === '' ||
      typeof course !== 'string' || course.trim() === '') {
    res.status(400).json({ message: 'All text fields are required' });
    return;
  }
 
  // Match Lesson 3.2: year_level must be a positive whole number.
  if (typeof year_level !== 'number' || !Number.isInteger(year_level) ||
      year_level < 1) {
    res.status(400).json({ message: 'year_level must be a positive whole number' });
    return;
  }
 
  // $1–$5 are replacement values; $6 is the checked ID in WHERE.
  // WHERE protects other rows; RETURNING gives back the changed row.
  const sql = `UPDATE students
    SET student_number = $1, first_name = $2, last_name = $3,
        course = $4, year_level = $5
    WHERE id = $6
    RETURNING id, student_number, first_name, last_name, course, year_level;`;
  const values = [
    student_number.trim(), first_name.trim(), last_name.trim(),
    course.trim(), year_level, id
  ];
 
  try {
    // pg sends the values separately from the SQL command.
    const result = await pool.query(sql, values);
    // No returned row means that this valid ID was not found.
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    // 200 OK includes the row that PostgreSQL actually updated.
    res.status(200).json(result.rows[0]);
  } catch (error: unknown) {
    // PostgreSQL code 23505 means another row owns this student number.
    if (typeof error === 'object' && error !== null &&
        'code' in error && error.code === '23505') {
      res.status(409).json({ message: 'student_number already exists' });
      return;
    }
    // Do not send a raw database error or private connection details.
    res.status(500).json({ message: 'Could not update student' });
  }
}

// export function updateStudent(req: Request, res: Response) {
//   res.json({
//     message: 'Update request received; nothing was changed',
//     studentId: req.params.id,
//     updatedData: req.body
//   });
// }
 
export async function deleteStudent(req: Request, res: Response): Promise<void> {
  // Read the ID after /students/ in the request URL.
  const idText = req.params.id;
  const id = Number(idText);
 
  // Stop if the ID is not a positive, safe whole number.
  if (!/^\d+$/.test(idText) || !Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ message: 'Student ID must be a positive integer' });
    return;
  }
 
  // $1 is the checked ID; WHERE protects all other rows.
  // RETURNING lets us confirm which row PostgreSQL removed.
  const sql = `DELETE FROM students
    WHERE id = $1
    RETURNING id, student_number;`;
 
  try {
    // Send the ID separately from the SQL text.
    const result = await pool.query(sql, [id]);
 
    // No returned row means this valid ID did not exist.
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
 
    // 200 OK confirms the ID and fictional number that were deleted.
    res.status(200).json({
      message: 'Student deleted',
      id: result.rows[0].id,
      student_number: result.rows[0].student_number
    });
  } catch {
    // Hide unexpected database details from the response.
    res.status(500).json({ message: 'Could not delete student' });
  }
}

// export function deleteStudent(req: Request, res: Response) {
//   res.json({
//     message: 'Delete request received; nothing was removed',
//     studentId: req.params.id
//   });
// }
